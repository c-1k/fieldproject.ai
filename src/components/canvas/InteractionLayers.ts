/**
 * InteractionLayers — Progressive particle physics easter eggs.
 *
 * The longer a user hovers near the center watching the vortex,
 * the more interaction types unlock. All effects reuse existing
 * particles — no new meshes, no new render passes.
 *
 * Layer 0:   0s  — Keplerian vortex (already in ParticleCloud)
 * Layer 1:  15s  — Pair annihilation (flash + swap) + shockwaves
 * Layer 2:  30s  — Force lines (canonical pipeline arcs)
 * Layer 3:  60s  — Decay cascades (node splits) + chain reactions
 * Layer 4:  90s  — Field condensation (golden Higgs core)
 * Layer 5: 120s  — Entanglement pairs + click interactions
 */

import * as THREE from "three";

/* ── Thresholds (cumulative dwell seconds in vortex zone) ── */
const LAYER_THRESHOLDS = [0, 3, 6, 10, 15, 20] as const;
// TEST MODE — production: [0, 15, 30, 60, 90, 120]

/* ── Layer 1: Pair Annihilation ── */
const ANNIHILATION_INTERVAL = 2.5;
const ANNIHILATION_FLASH_DUR = 0.4;
const ANNIHILATION_FADE_DUR = 0.3;
const ANNIHILATION_REFORM_DUR = 0.5;
const ANNIHILATION_TOTAL =
  ANNIHILATION_FLASH_DUR + ANNIHILATION_FADE_DUR + ANNIHILATION_REFORM_DUR;
const ANNIHILATION_SEARCH_DIST = 0.8;

/* ── Layer 2: Force Lines ── */
const FORCE_LINE_ENGAGE = 0.3;
const FORCE_LINE_MAX_ARCS = 6;
const FORCE_LINE_SEGMENTS = 8;
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
const CONDENSATION_EXPAND_RATE = 0.4;
const CONDENSATION_MAX_RADIUS = 3.0;
const HIGGS_COLOR = new THREE.Color("#f59e0b");

/* ── Layer 5: Entanglement ── */
const ENTANGLE_PAIR_COUNT = 16;
const ENTANGLE_MIN_DIST = 3.0;
const ENTANGLE_SHUFFLE_INTERVAL = 12.0;
const ENTANGLE_PULSE_SPEED = 2.5;

/* ── Shockwaves ── */
const SHOCKWAVE_SPEED = 4.0;
const SHOCKWAVE_DURATION = 1.2;
const SHOCKWAVE_RING_THICKNESS = 0.6;
const SHOCKWAVE_MAX_CONCURRENT = 4;

/* ── Click / Supernova ── */
const CLICK_COOLDOWN = 0.8;
const SUPERNOVA_RADIUS = 3.5;
const SUPERNOVA_FORCE = 5.0;
const SUPERNOVA_DURATION = 1.5;

/* ── Gravity Well (click in layers 2-3) ── */
const GRAVITY_WELL_RADIUS = 2.5;
const GRAVITY_WELL_DURATION = 2.0;
const GRAVITY_WELL_FORCE = 3.0;

/* ── Color Cascade (auto after first click) ── */
const CASCADE_INTERVAL = 5.0;
const CASCADE_SPEED = 3.5;
const CASCADE_DURATION = 2.0;
const CASCADE_RING_THICKNESS = 1.0;
const CASCADE_COLOR = new THREE.Color("#ff6b35");

/* ── Particle Fusion (auto after first click) ── */
const FUSION_INTERVAL = 4.0;
const FUSION_DURATION = 1.5;

/* ══════════════════════════════════════════════════════
 * Types
 * ══════════════════════════════════════════════════════ */

interface AnnihilationEvent {
  a: number;
  b: number;
  startTime: number;
  ax: number; ay: number; az: number;
  bx: number; by: number; bz: number;
}

interface DecayEvent {
  source: number;
  children: number[];
  startTime: number;
  sx: number; sy: number; sz: number;
  dirs: Array<{ x: number; y: number; z: number }>;
}

interface ShockwaveEvent {
  x: number; y: number; z: number;
  startTime: number;
}

interface SupernovaEvent {
  x: number; y: number; z: number;
  startTime: number;
  affectedIndices: number[];
  directions: Array<{ x: number; y: number; z: number }>;
}

interface GravityWellEvent {
  x: number; y: number; z: number;
  startTime: number;
  affectedIndices: number[];
  directions: Array<{ x: number; y: number; z: number }>;
}

interface ColorCascadeEvent {
  x: number; y: number; z: number;
  startTime: number;
}

interface FusionEvent {
  nodeIdx: number;
  childIdx: number;
  startTime: number;
  cx: number; cy: number; cz: number;
}

export interface AudioTriggers {
  annihilation: boolean;
  decay: boolean;
  condensation: number; // 0 = inactive, >0 = strength
  entanglement: boolean;
  shockwave: boolean;
  supernova: boolean;
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
  originalColorsDirty: boolean;
  originalColors: Float32Array | null;

  // Layer 5
  entangledPairs: Array<[number, number]>;
  lastEntangleShuffle: number;

  // Shockwaves
  shockwaves: ShockwaveEvent[];

  // Click / Supernova
  pendingClick: { x: number; y: number; z: number } | null;
  lastClickTime: number;
  supernova: SupernovaEvent | null;

  // Post-click interactions
  hasClicked: boolean;
  gravityWells: GravityWellEvent[];
  colorCascades: ColorCascadeEvent[];
  lastCascadeTime: number;
  fusions: FusionEvent[];
  lastFusionTime: number;
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
    shockwaves: [],
    pendingClick: null,
    lastClickTime: 0,
    supernova: null,
    hasClicked: false,
    gravityWells: [],
    colorCascades: [],
    lastCascadeTime: 0,
    fusions: [],
    lastFusionTime: 0,
  };
}

/* ── Pipeline positions for force lines ── */
const PIPELINE_WORLD: Array<{ x: number; y: number; z: number }> = [
  { x: -4.5, y: 0.3, z: -0.5 },
  { x: -2.5, y: -0.2, z: 0.3 },
  { x: -0.5, y: 0.1, z: -0.2 },
  { x: 1.5, y: -0.3, z: 0.4 },
  { x: 3.5, y: 0.2, z: -0.3 },
  { x: 5.5, y: -0.1, z: 0.2 },
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
  positions: Float32Array, count: number,
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

function emitShockwave(
  state: InteractionState, x: number, y: number, z: number, time: number,
): void {
  state.shockwaves.push({ x, y, z, startTime: time });
  if (state.shockwaves.length > SHOCKWAVE_MAX_CONCURRENT) {
    state.shockwaves.shift();
  }
}

function findEntangledPartner(state: InteractionState, idx: number): number {
  for (const [a, b] of state.entangledPairs) {
    if (a === idx) return b;
    if (b === idx) return a;
  }
  return -1;
}

function forceAnnihilation(
  state: InteractionState, positions: Float32Array,
  nodeCount: number, target: number, time: number,
): void {
  // Find nearest neighbor to create a pair
  let bestJ = -1;
  let bestDist = Infinity;
  for (let j = 0; j < nodeCount; j++) {
    if (j === target) continue;
    const d = distSq3(positions, target, j);
    if (d < bestDist) {
      bestDist = d;
      bestJ = j;
    }
  }
  if (bestJ < 0) return;

  state.annihilations.push({
    a: target, b: bestJ,
    startTime: time,
    ax: positions[target * 3]!, ay: positions[target * 3 + 1]!, az: positions[target * 3 + 2]!,
    bx: positions[bestJ * 3]!, by: positions[bestJ * 3 + 1]!, bz: positions[bestJ * 3 + 2]!,
  });
  state.lastAnnihilationTime = time;
}

function createSupernova(
  state: InteractionState, positions: Float32Array,
  nodeCount: number, nearest: number, time: number,
  audio: AudioTriggers,
): void {
  const affected: number[] = [];
  const dirs: Array<{ x: number; y: number; z: number }> = [];
  const nx = positions[nearest * 3]!;
  const ny = positions[nearest * 3 + 1]!;
  const nz = positions[nearest * 3 + 2]!;

  for (let i = 0; i < nodeCount; i++) {
    const dx = positions[i * 3]! - nx;
    const dy = positions[i * 3 + 1]! - ny;
    const dz = positions[i * 3 + 2]! - nz;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist < SUPERNOVA_RADIUS) {
      affected.push(i);
      const invD = 1 / Math.max(dist, 0.1);
      dirs.push({ x: dx * invD, y: dy * invD, z: dz * invD });
    }
  }

  state.supernova = {
    x: nx, y: ny, z: nz,
    startTime: time,
    affectedIndices: affected,
    directions: dirs,
  };

  emitShockwave(state, nx, ny, nz, time);
  audio.supernova = true;
  audio.shockwave = true;
}

function createGravityWell(
  state: InteractionState, positions: Float32Array,
  nodeCount: number, nearest: number, time: number,
): void {
  const affected: number[] = [];
  const dirs: Array<{ x: number; y: number; z: number }> = [];
  const nx = positions[nearest * 3]!;
  const ny = positions[nearest * 3 + 1]!;
  const nz = positions[nearest * 3 + 2]!;

  for (let i = 0; i < nodeCount; i++) {
    const dx = positions[i * 3]! - nx;
    const dy = positions[i * 3 + 1]! - ny;
    const dz = positions[i * 3 + 2]! - nz;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist < GRAVITY_WELL_RADIUS && dist > 0.1) {
      affected.push(i);
      // Direction points TOWARD well center (inward)
      const invD = 1 / dist;
      dirs.push({ x: -dx * invD, y: -dy * invD, z: -dz * invD });
    }
  }

  if (affected.length > 0) {
    state.gravityWells.push({
      x: nx, y: ny, z: nz,
      startTime: time,
      affectedIndices: affected,
      directions: dirs,
    });
    if (state.gravityWells.length > 3) state.gravityWells.shift();
  }
}

/* ── Trigger click from ParticleCloud ── */
export function triggerClick(
  state: InteractionState,
  x: number, y: number, z: number,
): void {
  state.hasClicked = true;
  state.pendingClick = { x, y, z };
}

/* ══════════════════════════════════════════════════════════════
 * Main tick — called from ParticleCloud's useFrame.
 * Returns overrides + audio triggers.
 * ══════════════════════════════════════════════════════════════ */

export interface InteractionOverride {
  index: number;
  scaleMultiplier?: number;
  colorOverride?: THREE.Color;
  positionOffset?: { x: number; y: number; z: number };
}

export interface InteractionResult {
  overrides: InteractionOverride[];
  extraLineCount: number;
  colorsDirty: boolean;
  audio: AudioTriggers;
}

// Pre-allocated
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
  const audio: AudioTriggers = {
    annihilation: false,
    decay: false,
    condensation: 0,
    entanglement: false,
    shockwave: false,
    supernova: false,
  };

  /* ── Dwell accumulation ── */
  if (inVortexZone && vortexStrength > 0.3) {
    state.dwellAccum += delta;
  }

  /* ── Unlock layers ── */
  for (let l = 0; l < LAYER_THRESHOLDS.length; l++) {
    if (state.dwellAccum >= LAYER_THRESHOLDS[l]!) {
      state.layerMask |= 1 << l;
    }
  }

  // Mobile: cap at layer 2
  const effectiveMask = isMobile
    ? state.layerMask & 0b000111
    : state.layerMask;

  /* ── Layer 1: Pair Annihilation ── */
  if (hasLayer(effectiveMask, 1)) {
    // Trigger new annihilation
    if (
      time - state.lastAnnihilationTime > ANNIHILATION_INTERVAL &&
      state.annihilations.length < 3
    ) {
      const pair = findAnnihilationPair(positions, nodeCount);
      if (pair) {
        state.annihilations.push({
          a: pair[0], b: pair[1],
          startTime: time,
          ax: positions[pair[0] * 3]!, ay: positions[pair[0] * 3 + 1]!, az: positions[pair[0] * 3 + 2]!,
          bx: positions[pair[1] * 3]!, by: positions[pair[1] * 3 + 1]!, bz: positions[pair[1] * 3 + 2]!,
        });
        state.lastAnnihilationTime = time;
        audio.annihilation = true;

        // Emit shockwave from midpoint
        emitShockwave(
          state,
          (positions[pair[0] * 3]! + positions[pair[1] * 3]!) / 2,
          (positions[pair[0] * 3 + 1]! + positions[pair[1] * 3 + 1]!) / 2,
          (positions[pair[0] * 3 + 2]! + positions[pair[1] * 3 + 2]!) / 2,
          time,
        );
        audio.shockwave = true;
      }
    }

    // Animate active annihilations
    for (let ai = state.annihilations.length - 1; ai >= 0; ai--) {
      const evt = state.annihilations[ai]!;
      const elapsed = time - evt.startTime;

      if (elapsed > ANNIHILATION_TOTAL) {
        // Chain: annihilation inside condensation zone → pushback
        if (hasLayer(effectiveMask, 4)) {
          const midX = (evt.ax + evt.bx) / 2;
          const midY = (evt.ay + evt.by) / 2;
          const midZ = (evt.az + evt.bz) / 2;
          const distC = Math.sqrt(midX * midX + midY * midY + midZ * midZ);
          if (distC < state.condensationRadius) {
            state.condensationRadius = Math.max(
              0, state.condensationRadius - 0.5,
            );
          }
        }
        state.annihilations.splice(ai, 1);
        continue;
      }

      if (elapsed < ANNIHILATION_FLASH_DUR) {
        const t = elapsed / ANNIHILATION_FLASH_DUR;
        const scale = 1 + 2 * Math.sin(t * Math.PI);
        overrides.push(
          { index: evt.a, scaleMultiplier: scale, colorOverride: _tmpColor.copy(_white) },
          { index: evt.b, scaleMultiplier: scale, colorOverride: _tmpColor.copy(_white) },
        );
      } else if (elapsed < ANNIHILATION_FLASH_DUR + ANNIHILATION_FADE_DUR) {
        const t = (elapsed - ANNIHILATION_FLASH_DUR) / ANNIHILATION_FADE_DUR;
        const scale = Math.max(0.01, 1 - t);
        overrides.push(
          { index: evt.a, scaleMultiplier: scale },
          { index: evt.b, scaleMultiplier: scale },
        );
      } else {
        const t = (elapsed - ANNIHILATION_FLASH_DUR - ANNIHILATION_FADE_DUR) / ANNIHILATION_REFORM_DUR;
        const scale = t * t;
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

  /* ── Layer 2: Force Lines ── */
  if (hasLayer(effectiveMask, 2)) {
    state.forceLineStrength = Math.min(
      1, state.forceLineStrength + delta / FORCE_LINE_ENGAGE,
    );

    if (
      time - state.lastAnchorUpdate > FORCE_LINE_ANCHOR_INTERVAL ||
      state.anchors.length === 0
    ) {
      state.anchors = PIPELINE_WORLD.map((p) =>
        findNearestParticle(positions, count, p.x, p.y, p.z),
      );
      state.lastAnchorUpdate = time;
    }

    const opacity = state.forceLineStrength;
    if (opacity > 0.05) {
      for (
        let a = 0;
        a < state.anchors.length - 1 &&
        extraLineCount + FORCE_LINE_SEGMENTS < maxExtraLines;
        a++
      ) {
        const fromIdx = state.anchors[a]!;
        const toIdx = state.anchors[a + 1]!;
        const fx = positions[fromIdx * 3]!;
        const fy = positions[fromIdx * 3 + 1]!;
        const fz = positions[fromIdx * 3 + 2]!;
        const tx = positions[toIdx * 3]!;
        const ty = positions[toIdx * 3 + 1]!;
        const tz = positions[toIdx * 3 + 2]!;

        const midX = (fx + tx) / 2;
        const midY = (fy + ty) / 2 + 0.4 * Math.sin(time * 0.8 + a);
        const midZ = (fz + tz) / 2 + 0.2;

        for (let s = 0; s < FORCE_LINE_SEGMENTS; s++) {
          const t0 = s / FORCE_LINE_SEGMENTS;
          const t1 = (s + 1) / FORCE_LINE_SEGMENTS;
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
    if (
      time - state.lastDecayTime > DECAY_INTERVAL &&
      state.decays.length < 2
    ) {
      const source = Math.floor(Math.random() * nodeCount);
      const children: number[] = [];
      for (
        let i = nodeCount;
        i < count && children.length < DECAY_CHILD_COUNT;
        i++
      ) {
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
          source, children, startTime: time,
          sx: positions[source * 3]!,
          sy: positions[source * 3 + 1]!,
          sz: positions[source * 3 + 2]!,
          dirs,
        });
        state.lastDecayTime = time;
        audio.decay = true;

        // Emit shockwave from decay source
        emitShockwave(
          state,
          positions[source * 3]!,
          positions[source * 3 + 1]!,
          positions[source * 3 + 2]!,
          time,
        );
        audio.shockwave = true;

        // Chain: decay near entangled pair → partner flash
        if (hasLayer(effectiveMask, 5)) {
          for (const [ea, eb] of state.entangledPairs) {
            const daSq = distSq3(positions, source, ea);
            const dbSq = distSq3(positions, source, eb);
            if (daSq < 2.0) {
              overrides.push({
                index: eb, scaleMultiplier: 2.5,
                colorOverride: _tmpColor.copy(_white),
              });
              audio.entanglement = true;
              break;
            } else if (dbSq < 2.0) {
              overrides.push({
                index: ea, scaleMultiplier: 2.5,
                colorOverride: _tmpColor.copy(_white),
              });
              audio.entanglement = true;
              break;
            }
          }
        }
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
        const t = elapsed / DECAY_FLASH_DUR;
        overrides.push({
          index: evt.source,
          scaleMultiplier: 1 + 1.5 * Math.sin(t * Math.PI),
          colorOverride: _tmpColor.lerpColors(_white, HIGGS_COLOR, t),
        });
      } else if (elapsed < DECAY_FLASH_DUR + DECAY_SPLIT_DUR) {
        const t = (elapsed - DECAY_FLASH_DUR) / DECAY_SPLIT_DUR;
        overrides.push({
          index: evt.source,
          scaleMultiplier: Math.max(0.1, 1 - t * 0.8),
        });
        for (let ci = 0; ci < evt.children.length; ci++) {
          const easeT = t * t;
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
    if (!state.originalColors && mesh.instanceColor) {
      state.originalColors = new Float32Array(mesh.instanceColor.array.length);
      state.originalColors.set(mesh.instanceColor.array);
    }

    state.condensationRadius = Math.min(
      CONDENSATION_MAX_RADIUS,
      state.condensationRadius + CONDENSATION_EXPAND_RATE * delta,
    );

    audio.condensation = state.condensationRadius / CONDENSATION_MAX_RADIUS;

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
    if (
      time - state.lastEntangleShuffle > ENTANGLE_SHUFFLE_INTERVAL ||
      state.entangledPairs.length === 0
    ) {
      state.entangledPairs = findEntangledPairs(positions, count, nodeCount);
      state.lastEntangleShuffle = time;
      audio.entanglement = true;
    }

    const phase = time * ENTANGLE_PULSE_SPEED;

    for (let pi = 0; pi < state.entangledPairs.length; pi++) {
      const [a, b] = state.entangledPairs[pi]!;
      const pulse = 1 + 0.6 * Math.sin(phase + pi * 0.5);
      overrides.push(
        { index: a, scaleMultiplier: pulse },
        { index: b, scaleMultiplier: pulse },
      );

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

  /* ── Shockwaves (expanding ring of scale-up) ── */
  for (let si = state.shockwaves.length - 1; si >= 0; si--) {
    const sw = state.shockwaves[si]!;
    const elapsed = time - sw.startTime;

    if (elapsed > SHOCKWAVE_DURATION) {
      state.shockwaves.splice(si, 1);
      continue;
    }

    const radius = elapsed * SHOCKWAVE_SPEED;
    const fade = 1 - elapsed / SHOCKWAVE_DURATION;
    const halfThick = SHOCKWAVE_RING_THICKNESS * 0.5;
    const innerRSq = Math.max(0, radius - halfThick) ** 2;
    const outerRSq = (radius + halfThick) ** 2;

    // Only affect node particles for performance
    for (let i = 0; i < Math.min(nodeCount, count); i++) {
      const dx = positions[i * 3]! - sw.x;
      const dy = positions[i * 3 + 1]! - sw.y;
      const dz = positions[i * 3 + 2]! - sw.z;
      const dSq = dx * dx + dy * dy + dz * dz;

      if (dSq >= innerRSq && dSq <= outerRSq) {
        const d = Math.sqrt(dSq);
        const ringT = 1 - Math.abs(d - radius) / halfThick;
        overrides.push({
          index: i,
          scaleMultiplier: 1 + 0.5 * fade * ringT,
        });
      }
    }
  }

  /* ── Click handling ── */
  if (state.pendingClick && time - state.lastClickTime > CLICK_COOLDOWN) {
    const { x: cx, y: cy, z: cz } = state.pendingClick;
    state.pendingClick = null;
    state.lastClickTime = time;

    const nearest = findNearestParticle(
      positions, Math.min(nodeCount, count), cx, cy, cz,
    );

    if (hasLayer(effectiveMask, 5)) {
      // Layer 5: check for entangled partner → teleport, else supernova
      const partner = findEntangledPartner(state, nearest);
      if (partner >= 0) {
        state.annihilations.push({
          a: nearest, b: partner,
          startTime: time,
          ax: positions[nearest * 3]!, ay: positions[nearest * 3 + 1]!, az: positions[nearest * 3 + 2]!,
          bx: positions[partner * 3]!, by: positions[partner * 3 + 1]!, bz: positions[partner * 3 + 2]!,
        });
        audio.entanglement = true;
      } else {
        // No partner — supernova
        createSupernova(state, positions, nodeCount, nearest, time, audio);
      }
    } else if (hasLayer(effectiveMask, 4)) {
      // Layer 4: supernova
      createSupernova(state, positions, nodeCount, nearest, time, audio);
    } else if (hasLayer(effectiveMask, 2)) {
      // Layers 2-3: gravity well
      createGravityWell(state, positions, nodeCount, nearest, time);
      emitShockwave(state, positions[nearest * 3]!, positions[nearest * 3 + 1]!, positions[nearest * 3 + 2]!, time);
      audio.shockwave = true;
    } else if (hasLayer(effectiveMask, 1)) {
      // Layer 1: forced annihilation
      forceAnnihilation(state, positions, nodeCount, nearest, time);
      audio.annihilation = true;
      emitShockwave(state, positions[nearest * 3]!, positions[nearest * 3 + 1]!, positions[nearest * 3 + 2]!, time);
      audio.shockwave = true;
    }
  }

  /* ── Supernova animation ── */
  if (state.supernova) {
    const sn = state.supernova;
    const elapsed = time - sn.startTime;

    if (elapsed > SUPERNOVA_DURATION) {
      state.supernova = null;
    } else {
      const t = elapsed / SUPERNOVA_DURATION;
      const blastPhase = Math.min(t * 3, 1);
      const returnPhase = Math.max((t - 0.33) / 0.67, 0);
      const outward = 1 - returnPhase * returnPhase;
      const distance = blastPhase * SUPERNOVA_FORCE * outward;

      for (let si = 0; si < sn.affectedIndices.length; si++) {
        const idx = sn.affectedIndices[si]!;
        const dir = sn.directions[si]!;
        const scale = 1 + 2 * (1 - t) * Math.sin(blastPhase * Math.PI);
        overrides.push({
          index: idx,
          scaleMultiplier: scale,
          positionOffset: {
            x: dir.x * distance,
            y: dir.y * distance,
            z: dir.z * distance,
          },
          ...(t < 0.15 ? { colorOverride: _tmpColor.copy(_white) } : {}),
        });
      }
    }
  }

  /* ── Gravity Wells (inward pull then release) ── */
  for (let wi = state.gravityWells.length - 1; wi >= 0; wi--) {
    const gw = state.gravityWells[wi]!;
    const elapsed = time - gw.startTime;

    if (elapsed > GRAVITY_WELL_DURATION) {
      state.gravityWells.splice(wi, 1);
      continue;
    }

    const t = elapsed / GRAVITY_WELL_DURATION;
    const pullPhase = Math.min(t * 2.5, 1);          // 0→0.4s: pull in
    const releasePhase = Math.max((t - 0.7) / 0.3, 0); // 0.7→1.0s: release
    const inward = pullPhase * (1 - releasePhase);
    const distance = inward * GRAVITY_WELL_FORCE;

    for (let si = 0; si < gw.affectedIndices.length; si++) {
      const idx = gw.affectedIndices[si]!;
      const dir = gw.directions[si]!;
      const scale = Math.max(0.3, 1 + inward * 0.8 - releasePhase * 0.5);
      overrides.push({
        index: idx,
        scaleMultiplier: scale,
        positionOffset: {
          x: dir.x * distance,
          y: dir.y * distance,
          z: dir.z * distance,
        },
      });
    }
  }

  /* ── Color Cascades (expanding ring of color shift) ── */
  if (state.hasClicked) {
    if (
      time - state.lastCascadeTime > CASCADE_INTERVAL &&
      state.colorCascades.length < 2
    ) {
      const ccx = (Math.random() - 0.5) * 6;
      const ccy = (Math.random() - 0.5) * 4;
      state.colorCascades.push({ x: ccx, y: ccy, z: 0, startTime: time });
      state.lastCascadeTime = time;
    }

    for (let ci = state.colorCascades.length - 1; ci >= 0; ci--) {
      const cc = state.colorCascades[ci]!;
      const elapsed = time - cc.startTime;
      if (elapsed > CASCADE_DURATION) {
        state.colorCascades.splice(ci, 1);
        continue;
      }

      const radius = elapsed * CASCADE_SPEED;
      const fade = 1 - elapsed / CASCADE_DURATION;
      const halfThick = CASCADE_RING_THICKNESS * 0.5;
      const innerRSq = Math.max(0, radius - halfThick) ** 2;
      const outerRSq = (radius + halfThick) ** 2;

      for (let i = 0; i < Math.min(nodeCount, count); i++) {
        const dx = positions[i * 3]! - cc.x;
        const dy = positions[i * 3 + 1]! - cc.y;
        const dz = positions[i * 3 + 2]! - cc.z;
        const dSq = dx * dx + dy * dy + dz * dz;

        if (dSq >= innerRSq && dSq <= outerRSq) {
          const d = Math.sqrt(dSq);
          const ringT = 1 - Math.abs(d - radius) / halfThick;
          overrides.push({
            index: i,
            scaleMultiplier: 1 + 0.3 * ringT * fade,
            colorOverride: _tmpColor.lerpColors(
              _white, CASCADE_COLOR, ringT * fade * 0.7,
            ),
          });
          colorsDirty = true;
        }
      }
    }
  }

  /* ── Particle Fusions (absorption + emission cycle) ── */
  if (state.hasClicked) {
    if (
      time - state.lastFusionTime > FUSION_INTERVAL &&
      state.fusions.length < 2
    ) {
      const nodeIdx = Math.floor(Math.random() * nodeCount);
      let bestChild = -1;
      let bestDist = 2.0;
      for (let i = nodeCount; i < count; i++) {
        const d = distSq3(positions, nodeIdx, i);
        if (d < bestDist) {
          bestDist = d;
          bestChild = i;
        }
      }
      if (bestChild >= 0) {
        state.fusions.push({
          nodeIdx,
          childIdx: bestChild,
          startTime: time,
          cx: positions[bestChild * 3]!,
          cy: positions[bestChild * 3 + 1]!,
          cz: positions[bestChild * 3 + 2]!,
        });
        state.lastFusionTime = time;
      }
    }

    for (let fi = state.fusions.length - 1; fi >= 0; fi--) {
      const fus = state.fusions[fi]!;
      const elapsed = time - fus.startTime;
      if (elapsed > FUSION_DURATION) {
        state.fusions.splice(fi, 1);
        continue;
      }

      const t = elapsed / FUSION_DURATION;
      if (t < 0.4) {
        // Absorption: child shrinks and moves toward node
        const at = t / 0.4;
        const nodeX = positions[fus.nodeIdx * 3]!;
        const nodeY = positions[fus.nodeIdx * 3 + 1]!;
        const nodeZ = positions[fus.nodeIdx * 3 + 2]!;
        overrides.push({
          index: fus.childIdx,
          scaleMultiplier: Math.max(0.05, 1 - at * 0.9),
          positionOffset: {
            x: (nodeX - fus.cx) * at * 0.8,
            y: (nodeY - fus.cy) * at * 0.8,
            z: (nodeZ - fus.cz) * at * 0.8,
          },
        });
      } else if (t < 0.6) {
        // Node flash — absorb complete
        const ft = (t - 0.4) / 0.2;
        overrides.push(
          { index: fus.childIdx, scaleMultiplier: 0.05 },
          {
            index: fus.nodeIdx,
            scaleMultiplier: 1 + 1.5 * Math.sin(ft * Math.PI),
            colorOverride: _tmpColor.copy(_white),
          },
        );
        colorsDirty = true;
      } else {
        // Emission: child re-appears and ejects outward
        const et = (t - 0.6) / 0.4;
        overrides.push({
          index: fus.childIdx,
          scaleMultiplier: et * et,
          positionOffset: {
            x: (fus.cx - positions[fus.nodeIdx * 3]!) * et * 1.5,
            y: (fus.cy - positions[fus.nodeIdx * 3 + 1]!) * et * 1.5,
            z: (fus.cz - positions[fus.nodeIdx * 3 + 2]!) * et * 1.5,
          },
        });
        overrides.push({
          index: fus.nodeIdx,
          scaleMultiplier: 1 + 0.3 * (1 - et),
        });
      }
    }
  }

  /* ── Trail lines (motion streaks from particles with position offsets) ── */
  for (
    let oi = 0;
    oi < overrides.length && extraLineCount < maxExtraLines;
    oi++
  ) {
    const ov = overrides[oi]!;
    if (!ov.positionOffset) continue;

    const baseX = positions[ov.index * 3]!;
    const baseY = positions[ov.index * 3 + 1]!;
    const baseZ = positions[ov.index * 3 + 2]!;

    const idx = (lineOffset + extraLineCount) * 6;
    linePositions[idx] = baseX;
    linePositions[idx + 1] = baseY;
    linePositions[idx + 2] = baseZ;
    linePositions[idx + 3] = baseX + ov.positionOffset.x;
    linePositions[idx + 4] = baseY + ov.positionOffset.y;
    linePositions[idx + 5] = baseZ + ov.positionOffset.z;
    extraLineCount++;
  }

  return { overrides, extraLineCount, colorsDirty, audio };
}

/* ── Pair finding helpers ── */

function findAnnihilationPair(
  positions: Float32Array, nodeCount: number,
): [number, number] | null {
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
  positions: Float32Array, count: number, nodeCount: number,
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
