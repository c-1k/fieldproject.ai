/**
 * InteractionLayers — Progressive particle physics easter eggs.
 *
 * The longer a user hovers near the center watching the vortex,
 * the more interaction types unlock. All effects reuse existing
 * particles — no new meshes, no new render passes.
 *
 * Layer 0:   0s  — Keplerian vortex (already in ParticleCloud)
 * Layer 1:  15s  — Pair annihilation (flash + swap)
 * Layer 2:  30s  — Force lines (canonical pipeline arcs)
 * Layer 3:  60s  — Decay cascades (node splits into children)
 * Layer 4:  90s  — Field condensation (golden Higgs core)
 * Layer 5: 120s  — Entanglement pairs (distant sync + lines)
 */

import * as THREE from "three";

/* ── Thresholds (cumulative dwell seconds in vortex zone) ── */
const LAYER_THRESHOLDS = [0, 15, 30, 60, 90, 120] as const;

/* ── Layer 1: Pair Annihilation ── */
const ANNIHILATION_INTERVAL = 2.5;   // seconds between events
const ANNIHILATION_FLASH_DUR = 0.4;
const ANNIHILATION_FADE_DUR = 0.3;
const ANNIHILATION_REFORM_DUR = 0.5;
const ANNIHILATION_TOTAL = ANNIHILATION_FLASH_DUR + ANNIHILATION_FADE_DUR + ANNIHILATION_REFORM_DUR;
const ANNIHILATION_SEARCH_DIST = 0.8;

/* ── Layer 2: Force Lines ── */
const FORCE_LINE_ENGAGE = 0.3;       // seconds to full opacity
const FORCE_LINE_MAX_ARCS = 6;
const FORCE_LINE_SEGMENTS = 8;       // bezier segments per arc
const FORCE_LINE_ANCHOR_INTERVAL = 2.0;

/* ── Layer 3: Decay Cascades ── */
const DECAY_INTERVAL = 3.5;
const DECAY_FLASH_DUR = 0.35;
const DECAY_SPLIT_DUR = 0.6;
const DECAY_SETTLE_DUR = 1.0;
const DECAY_TOTAL = DECAY_FLASH_DUR + DECAY_SPLIT_DUR + DECAY_SETTLE_DUR;
const DECAY_CHILD_COUNT = 4;
const DECAY_EJECT_SPEED = 2.5;

/* ── Layer 4: Field Condensation ── */
const CONDENSATION_EXPAND_RATE = 0.4; // units/sec
const CONDENSATION_MAX_RADIUS = 3.0;
const HIGGS_COLOR = new THREE.Color("#f59e0b");

/* ── Layer 5: Entanglement ── */
const ENTANGLE_PAIR_COUNT = 16;
const ENTANGLE_MIN_DIST = 3.0;
const ENTANGLE_SHUFFLE_INTERVAL = 12.0;
const ENTANGLE_PULSE_SPEED = 2.5;

/* ── Types ── */

interface AnnihilationEvent {
	a: number;
	b: number;
	startTime: number;
	/** Stash original positions for reform */
	ax: number; ay: number; az: number;
	bx: number; by: number; bz: number;
}

interface DecayEvent {
	source: number;
	children: number[];
	startTime: number;
	/** Stash source position at trigger time */
	sx: number; sy: number; sz: number;
	/** Ejection directions per child */
	dirs: Array<{ x: number; y: number; z: number }>;
}

export interface InteractionState {
	dwellAccum: number;
	layerMask: number;

	// Layer 1
	annihilations: AnnihilationEvent[];
	lastAnnihilationTime: number;

	// Layer 2
	forceLineStrength: number;
	anchors: number[];
	lastAnchorUpdate: number;

	// Layer 3
	decays: DecayEvent[];
	lastDecayTime: number;

	// Layer 4
	condensationRadius: number;
	/** Original colors stashed before condensation modifies them */
	originalColorsDirty: boolean;
	originalColors: Float32Array | null;

	// Layer 5
	entangledPairs: Array<[number, number]>;
	lastEntangleShuffle: number;
}

export function createInteractionState(): InteractionState {
	return {
		dwellAccum: 0,
		layerMask: 0,
		annihilations: [],
		lastAnnihilationTime: 0,
		decays: [],
		lastDecayTime: 0,
		forceLineStrength: 0,
		anchors: [],
		lastAnchorUpdate: 0,
		condensationRadius: 0,
		originalColorsDirty: false,
		originalColors: null,
		entangledPairs: [],
		lastEntangleShuffle: 0,
	};
}

/* ── Pipeline positions for force lines (world-space, from constants) ── */
const PIPELINE_WORLD: Array<{ x: number; y: number; z: number; color: string }> = [
	{ x: -4.5, y: 0.3, z: -0.5, color: "#3b82f6" },  // boson
	{ x: -2.5, y: -0.2, z: 0.3, color: "#8b5cf6" },  // fermion
	{ x: -0.5, y: 0.1, z: -0.2, color: "#f59e0b" },   // higgs
	{ x: 1.5, y: -0.3, z: 0.4, color: "#10b981" },    // hadron
	{ x: 3.5, y: 0.2, z: -0.3, color: "#06b6d4" },    // photon
	{ x: 5.5, y: -0.1, z: 0.2, color: "#ef4444" },    // neutrino
];

/* ── Helpers ── */

function hasLayer(mask: number, layer: number): boolean {
	return (mask & (1 << layer)) !== 0;
}

function distSq3(positions: Float32Array, i: number, j: number): number {
	const dx = positions[i * 3]! - positions[j * 3]!;
	const dy = positions[i * 3 + 1]! - positions[j * 3 + 1]!;
	const dz = positions[i * 3 + 2]! - positions[j * 3 + 2]!;
	return dx * dx + dy * dy + dz * dz;
}

function findNearestParticle(
	positions: Float32Array,
	count: number,
	tx: number, ty: number, tz: number,
): number {
	let best = 0;
	let bestDist = Infinity;
	for (let i = 0; i < Math.min(count, 150); i++) {
		const dx = positions[i * 3]! - tx;
		const dy = positions[i * 3 + 1]! - ty;
		const dz = positions[i * 3 + 2]! - tz;
		const d = dx * dx + dy * dy + dz * dz;
		if (d < bestDist) {
			bestDist = d;
			best = i;
		}
	}
	return best;
}

/* ══════════════════════════════════════════════════════════════
 * Main tick — called from ParticleCloud's useFrame
 * Returns overrides that the caller applies to affected particles.
 * ══════════════════════════════════════════════════════════════ */

export interface InteractionOverride {
	index: number;
	scaleMultiplier?: number;
	colorOverride?: THREE.Color;
	positionOffset?: { x: number; y: number; z: number };
}

export interface InteractionResult {
	overrides: InteractionOverride[];
	/** Extra lines to append after tensor network */
	extraLineCount: number;
	colorsDirty: boolean;
}

// Pre-allocated color for reuse
const _tmpColor = new THREE.Color();
const _white = new THREE.Color("#ffffff");

export function tickInteractions(
	state: InteractionState,
	positions: Float32Array,
	count: number,
	nodeCount: number,
	mesh: THREE.InstancedMesh | null,
	linePositions: Float32Array,
	lineOffset: number,
	maxExtraLines: number,
	time: number,
	delta: number,
	inVortexZone: boolean,
	vortexStrength: number,
	isMobile: boolean,
): InteractionResult {
	const overrides: InteractionOverride[] = [];
	let extraLineCount = 0;
	let colorsDirty = false;

	/* ── Dwell accumulation ── */
	if (inVortexZone && vortexStrength > 0.3) {
		state.dwellAccum += delta;
	}

	/* ── Unlock layers ── */
	for (let l = 0; l < LAYER_THRESHOLDS.length; l++) {
		if (state.dwellAccum >= LAYER_THRESHOLDS[l]!) {
			state.layerMask |= (1 << l);
		}
	}

	// Mobile: cap at layer 2
	const effectiveMask = isMobile ? (state.layerMask & 0b000111) : state.layerMask;

	/* ── Layer 1: Pair Annihilation ── */
	if (hasLayer(effectiveMask, 1)) {
		// Trigger new annihilation
		if (time - state.lastAnnihilationTime > ANNIHILATION_INTERVAL && state.annihilations.length < 3) {
			const pair = findAnnihilationPair(positions, nodeCount);
			if (pair) {
				state.annihilations.push({
					a: pair[0], b: pair[1],
					startTime: time,
					ax: positions[pair[0] * 3]!, ay: positions[pair[0] * 3 + 1]!, az: positions[pair[0] * 3 + 2]!,
					bx: positions[pair[1] * 3]!, by: positions[pair[1] * 3 + 1]!, bz: positions[pair[1] * 3 + 2]!,
				});
				state.lastAnnihilationTime = time;
			}
		}

		// Animate active annihilations
		for (let ai = state.annihilations.length - 1; ai >= 0; ai--) {
			const evt = state.annihilations[ai]!;
			const elapsed = time - evt.startTime;

			if (elapsed > ANNIHILATION_TOTAL) {
				state.annihilations.splice(ai, 1);
				continue;
			}

			if (elapsed < ANNIHILATION_FLASH_DUR) {
				// Phase 1: Flash bright, scale up
				const t = elapsed / ANNIHILATION_FLASH_DUR;
				const scale = 1 + 2 * Math.sin(t * Math.PI);
				overrides.push(
					{ index: evt.a, scaleMultiplier: scale, colorOverride: _tmpColor.copy(_white) },
					{ index: evt.b, scaleMultiplier: scale, colorOverride: _tmpColor.copy(_white) },
				);
			} else if (elapsed < ANNIHILATION_FLASH_DUR + ANNIHILATION_FADE_DUR) {
				// Phase 2: Shrink to nothing
				const t = (elapsed - ANNIHILATION_FLASH_DUR) / ANNIHILATION_FADE_DUR;
				const scale = Math.max(0.01, 1 - t);
				overrides.push(
					{ index: evt.a, scaleMultiplier: scale },
					{ index: evt.b, scaleMultiplier: scale },
				);
			} else {
				// Phase 3: Re-appear at swapped positions
				const t = (elapsed - ANNIHILATION_FLASH_DUR - ANNIHILATION_FADE_DUR) / ANNIHILATION_REFORM_DUR;
				const scale = t * t; // ease in
				overrides.push(
					{
						index: evt.a, scaleMultiplier: scale,
						positionOffset: {
							x: (evt.bx - evt.ax) * t,
							y: (evt.by - evt.ay) * t,
							z: (evt.bz - evt.az) * t,
						},
					},
					{
						index: evt.b, scaleMultiplier: scale,
						positionOffset: {
							x: (evt.ax - evt.bx) * t,
							y: (evt.ay - evt.by) * t,
							z: (evt.az - evt.bz) * t,
						},
					},
				);
			}
		}
	}

	/* ── Layer 2: Force Lines (canonical pipeline arcs) ── */
	if (hasLayer(effectiveMask, 2)) {
		state.forceLineStrength = Math.min(1, state.forceLineStrength + delta / FORCE_LINE_ENGAGE);

		// Update anchor particles periodically
		if (time - state.lastAnchorUpdate > FORCE_LINE_ANCHOR_INTERVAL || state.anchors.length === 0) {
			state.anchors = PIPELINE_WORLD.map((p) =>
				findNearestParticle(positions, count, p.x, p.y, p.z),
			);
			state.lastAnchorUpdate = time;
		}

		// Draw arcs between consecutive anchors
		const opacity = state.forceLineStrength;
		if (opacity > 0.05) {
			for (let a = 0; a < state.anchors.length - 1 && extraLineCount + FORCE_LINE_SEGMENTS < maxExtraLines; a++) {
				const fromIdx = state.anchors[a]!;
				const toIdx = state.anchors[a + 1]!;

				const fx = positions[fromIdx * 3]!;
				const fy = positions[fromIdx * 3 + 1]!;
				const fz = positions[fromIdx * 3 + 2]!;
				const tx = positions[toIdx * 3]!;
				const ty = positions[toIdx * 3 + 1]!;
				const tz = positions[toIdx * 3 + 2]!;

				// Quadratic bezier with upward bulge + time-based wave
				const midX = (fx + tx) / 2;
				const midY = (fy + ty) / 2 + 0.4 * Math.sin(time * 0.8 + a);
				const midZ = (fz + tz) / 2 + 0.2;

				for (let s = 0; s < FORCE_LINE_SEGMENTS; s++) {
					const t0 = s / FORCE_LINE_SEGMENTS;
					const t1 = (s + 1) / FORCE_LINE_SEGMENTS;

					// Quadratic bezier
					const x0 = (1 - t0) * (1 - t0) * fx + 2 * (1 - t0) * t0 * midX + t0 * t0 * tx;
					const y0 = (1 - t0) * (1 - t0) * fy + 2 * (1 - t0) * t0 * midY + t0 * t0 * ty;
					const z0 = (1 - t0) * (1 - t0) * fz + 2 * (1 - t0) * t0 * midZ + t0 * t0 * tz;
					const x1 = (1 - t1) * (1 - t1) * fx + 2 * (1 - t1) * t1 * midX + t1 * t1 * tx;
					const y1 = (1 - t1) * (1 - t1) * fy + 2 * (1 - t1) * t1 * midY + t1 * t1 * ty;
					const z1 = (1 - t1) * (1 - t1) * fz + 2 * (1 - t1) * t1 * midZ + t1 * t1 * tz;

					const idx = (lineOffset + extraLineCount) * 6;
					linePositions[idx] = x0;
					linePositions[idx + 1] = y0;
					linePositions[idx + 2] = z0;
					linePositions[idx + 3] = x1;
					linePositions[idx + 4] = y1;
					linePositions[idx + 5] = z1;
					extraLineCount++;
				}
			}
		}
	} else {
		state.forceLineStrength = 0;
	}

	/* ── Layer 3: Decay Cascades ── */
	if (hasLayer(effectiveMask, 3)) {
		// Trigger new decay
		if (time - state.lastDecayTime > DECAY_INTERVAL && state.decays.length < 2) {
			const source = Math.floor(Math.random() * nodeCount);
			const children: number[] = [];
			// Find nearby small particles for children
			for (let i = nodeCount; i < count && children.length < DECAY_CHILD_COUNT; i++) {
				if (distSq3(positions, source, i) < 1.5) {
					children.push(i);
				}
			}
			if (children.length >= 2) {
				const dirs = children.map(() => {
					const theta = Math.random() * Math.PI * 2;
					const phi = Math.random() * Math.PI - Math.PI / 2;
					return {
						x: Math.cos(theta) * Math.cos(phi),
						y: Math.sin(phi),
						z: Math.sin(theta) * Math.cos(phi),
					};
				});
				state.decays.push({
					source,
					children,
					startTime: time,
					sx: positions[source * 3]!,
					sy: positions[source * 3 + 1]!,
					sz: positions[source * 3 + 2]!,
					dirs,
				});
				state.lastDecayTime = time;
			}
		}

		// Animate active decays
		for (let di = state.decays.length - 1; di >= 0; di--) {
			const evt = state.decays[di]!;
			const elapsed = time - evt.startTime;

			if (elapsed > DECAY_TOTAL) {
				state.decays.splice(di, 1);
				continue;
			}

			if (elapsed < DECAY_FLASH_DUR) {
				// Flash the source particle
				const t = elapsed / DECAY_FLASH_DUR;
				overrides.push({
					index: evt.source,
					scaleMultiplier: 1 + 1.5 * Math.sin(t * Math.PI),
					colorOverride: _tmpColor.lerpColors(_white, HIGGS_COLOR, t),
				});
			} else if (elapsed < DECAY_FLASH_DUR + DECAY_SPLIT_DUR) {
				// Source shrinks, children eject
				const t = (elapsed - DECAY_FLASH_DUR) / DECAY_SPLIT_DUR;
				overrides.push({
					index: evt.source,
					scaleMultiplier: Math.max(0.1, 1 - t * 0.8),
				});
				for (let ci = 0; ci < evt.children.length; ci++) {
					const easeT = t * t; // quadratic ease-in
					const dist = easeT * DECAY_EJECT_SPEED;
					const dir = evt.dirs[ci]!;
					overrides.push({
						index: evt.children[ci]!,
						scaleMultiplier: 1 + t * 1.5,
						positionOffset: {
							x: dir.x * dist,
							y: dir.y * dist,
							z: dir.z * dist,
						},
					});
				}
			} else {
				// Settle — everything returns to normal
				const t = (elapsed - DECAY_FLASH_DUR - DECAY_SPLIT_DUR) / DECAY_SETTLE_DUR;
				const fade = 1 - t;
				overrides.push({
					index: evt.source,
					scaleMultiplier: 0.2 + t * 0.8,
				});
				for (let ci = 0; ci < evt.children.length; ci++) {
					const dist = fade * DECAY_EJECT_SPEED;
					const dir = evt.dirs[ci]!;
					overrides.push({
						index: evt.children[ci]!,
						scaleMultiplier: 1 + fade * 1.5,
						positionOffset: {
							x: dir.x * dist,
							y: dir.y * dist,
							z: dir.z * dist,
						},
					});
				}
			}
		}
	}

	/* ── Layer 4: Field Condensation ── */
	if (hasLayer(effectiveMask, 4) && mesh) {
		// Stash original colors once
		if (!state.originalColors && mesh.instanceColor) {
			state.originalColors = new Float32Array(mesh.instanceColor.array.length);
			state.originalColors.set(mesh.instanceColor.array);
		}

		state.condensationRadius = Math.min(
			CONDENSATION_MAX_RADIUS,
			state.condensationRadius + CONDENSATION_EXPAND_RATE * delta,
		);

		if (mesh.instanceColor && state.originalColors) {
			const r = state.condensationRadius;
			for (let i = 0; i < Math.min(nodeCount, count); i++) {
				const px = positions[i * 3]!;
				const py = positions[i * 3 + 1]!;
				const pz = positions[i * 3 + 2]!;
				const dist = Math.sqrt(px * px + py * py + pz * pz);

				if (dist < r) {
					const blend = Math.min(1, (r - dist) / 1.5);
					_tmpColor.setRGB(
						state.originalColors[i * 3]!,
						state.originalColors[i * 3 + 1]!,
						state.originalColors[i * 3 + 2]!,
					);
					_tmpColor.lerp(HIGGS_COLOR, blend * 0.6);
					mesh.setColorAt(i, _tmpColor);
					colorsDirty = true;
				}
			}
		}
	}

	/* ── Layer 5: Entanglement Pairs ── */
	if (hasLayer(effectiveMask, 5)) {
		// Shuffle pairs periodically
		if (time - state.lastEntangleShuffle > ENTANGLE_SHUFFLE_INTERVAL || state.entangledPairs.length === 0) {
			state.entangledPairs = findEntangledPairs(positions, count, nodeCount);
			state.lastEntangleShuffle = time;
		}

		const phase = time * ENTANGLE_PULSE_SPEED;

		for (let pi = 0; pi < state.entangledPairs.length; pi++) {
			const [a, b] = state.entangledPairs[pi]!;
			// Synchronized pulse
			const pulse = 1 + 0.6 * Math.sin(phase + pi * 0.5);
			overrides.push(
				{ index: a, scaleMultiplier: pulse },
				{ index: b, scaleMultiplier: pulse },
			);

			// Draw connecting line
			if (extraLineCount < maxExtraLines) {
				const idx = (lineOffset + extraLineCount) * 6;
				linePositions[idx] = positions[a * 3]!;
				linePositions[idx + 1] = positions[a * 3 + 1]!;
				linePositions[idx + 2] = positions[a * 3 + 2]!;
				linePositions[idx + 3] = positions[b * 3]!;
				linePositions[idx + 4] = positions[b * 3 + 1]!;
				linePositions[idx + 5] = positions[b * 3 + 2]!;
				extraLineCount++;
			}
		}
	}

	return { overrides, extraLineCount, colorsDirty };
}

/* ── Pair finding helpers ── */

function findAnnihilationPair(
	positions: Float32Array,
	nodeCount: number,
): [number, number] | null {
	// Random search — pick a random node, find nearest neighbor
	const maxAttempts = 10;
	const thresholdSq = ANNIHILATION_SEARCH_DIST * ANNIHILATION_SEARCH_DIST;

	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		const a = Math.floor(Math.random() * nodeCount);
		let bestJ = -1;
		let bestDist = thresholdSq;

		for (let j = 0; j < nodeCount; j++) {
			if (j === a) continue;
			const d = distSq3(positions, a, j);
			if (d < bestDist) {
				bestDist = d;
				bestJ = j;
			}
		}

		if (bestJ >= 0) return [a, bestJ];
	}
	return null;
}

function findEntangledPairs(
	positions: Float32Array,
	count: number,
	nodeCount: number,
): Array<[number, number]> {
	const pairs: Array<[number, number]> = [];
	const used = new Set<number>();
	const minDistSq = ENTANGLE_MIN_DIST * ENTANGLE_MIN_DIST;
	const maxAttempts = 100;
	let attempts = 0;

	while (pairs.length < ENTANGLE_PAIR_COUNT && attempts < maxAttempts) {
		attempts++;
		const a = Math.floor(Math.random() * nodeCount);
		if (used.has(a)) continue;

		// Find a distant partner
		const b = Math.floor(Math.random() * nodeCount);
		if (b === a || used.has(b)) continue;

		if (distSq3(positions, a, b) >= minDistSq) {
			pairs.push([a, b]);
			used.add(a);
			used.add(b);
		}
	}

	return pairs;
}
