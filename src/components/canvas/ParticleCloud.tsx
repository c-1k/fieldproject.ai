"use client";

import { useRef, useMemo, useCallback, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PARTICLE_COLORS } from "@/lib/constants";
import { particleVertexShader, particleFragmentShader } from "@/shaders/particle";
import {
  createInteractionState,
  tickInteractions,
  type InteractionState,
} from "./InteractionLayers";

interface ParticleCloudProps {
  count?: number;
  formationText?: string;
  compact?: boolean;
}

/* ── Tensor network parameters ── */
const NODE_COUNT = 150;
const MAX_LINES = 700;          // 600 tensor + 100 reserved for interaction layers
const INTERACTION_LINE_BUDGET = 100;
const RECOMPUTE_EVERY = 15;
const CONN_DIST = 0.45;

/* ── Animation constants ── */
const LERP_SPEED = 0.04;
const ORB_SPEED_FACTOR = 0.5;
const ORB_DRIFT_X = 0.008;
const ORB_DRIFT_Y = 0.005;
const JITTER_AMP = 0.0004;
const MOUSE_RADIUS = 2.5;
const MOUSE_RADIUS_SQ = MOUSE_RADIUS * MOUSE_RADIUS;
const MOUSE_FORCE = 0.08;

/* ── Entropy ↔ formation transition ── */
const ENTROPY_SPREAD_X = 24;
const ENTROPY_SPREAD_Y = 16;
const ENTROPY_SPREAD_Z = 10;
const ENGAGE_RATE = 0.4;        // ramp 0→1 in ~2.5s
const DISENGAGE_RATE = 0.12;    // decay 1→0 in ~8s (slow dissolve)
const IDLE_TIMEOUT = 8.0;       // seconds of no movement before decay begins
const ENTROPY_JITTER_MULT = 6;  // jitter multiplier in full entropy
const ENTROPY_DRIFT = 0.003;    // gentle brownian drift in entropy
const BIRTH_DURATION = 2.5;     // seconds over which particles randomly appear

/* ── Ring + cloud shape ── */
const RING_FLATNESS = 0.78;       // near-circular (1.0 = perfect circle)
const VOID_RADIUS_DESKTOP = 2.5;  // center void size
const VOID_RADIUS_MOBILE = 1.5;
const RING_PEAK_DESKTOP = 3.3;    // where the dense ring sits
const RING_PEAK_MOBILE = 2.2;
const RING_BAND_WIDTH = 1.2;      // ring thickness
const CLOUD_OUTER_DESKTOP = 7.0;  // how far the cloud extends
const CLOUD_OUTER_MOBILE = 4.5;

/* ── Vortex easter egg ── */
const VORTEX_ZONE_RADIUS = 2.5;    // world-space units from center to trigger
const VORTEX_SPEED = 0.225;         // ~84-124s/rev inner ring
const VORTEX_ENGAGE = 0.12;         // slow onset (~8s to full strength)
const VORTEX_DISENGAGE = 0.12;

/**
 * Render text to offscreen canvas, sample lit pixel positions.
 */
function sampleTextPositions(
  text: string,
  maxSamples: number,
  fontSize: number = 120,
): [number, number][] {
  const canvas = document.createElement("canvas");
  const width = 1200;
  const height = 300;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${fontSize}px Inter, -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, width / 2, height / 2);

  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels: [number, number][] = [];
  const step = 2;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4;
      if (imageData.data[idx + 3]! > 128) {
        const nx = (x / width - 0.5) * 2;
        const ny = -(y / height - 0.5) * 2;
        pixels.push([nx, ny]);
      }
    }
  }

  const sampled: [number, number][] = [];
  for (let i = 0; i < maxSamples; i++) {
    if (pixels.length === 0) break;
    const idx = Math.floor(Math.random() * pixels.length);
    sampled.push(pixels[idx]!);
  }

  return sampled;
}

/* ── Scroll-driven formation ── */
const SCROLL_FORMATION_START = 0.02; // formation begins after 2% scroll
const SCROLL_FORMATION_END = 0.15;   // fully formed by 15% scroll (~leaving hero)

export default function ParticleCloud({
  count = 5500,
  formationText = "FIELD PROJECT",
  compact = false,
}: ParticleCloudProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  const mouse = useRef(new THREE.Vector2(0, 0));
  const mouseDown = useRef(false);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const frameCount = useRef(0);
  const tensorLineCount = useRef(0);
  const compactRef = useRef(compact);
  compactRef.current = compact;
  const { camera } = useThree();

  /* ── Interaction tracking ── */
  const interactionStrength = useRef(0);
  const hasEverInteracted = useRef(false);
  const mouseOnPage = useRef(true);
  const mouseMoved = useRef(false);
  const lastInteractTime = useRef(0);
  const vortexStrength = useRef(0);
  const interactionState = useRef<InteractionState | null>(null);
  if (!interactionState.current) {
    interactionState.current = createInteractionState();
  }

  // Random 3D spin axis — unique every visit
  // Tilted 25–55° from Z so orbital plane has visible depth
  const spinAxis = useRef<{ x: number; y: number; z: number } | null>(null);
  if (!spinAxis.current) {
    const tilt = 0.44 + Math.random() * 0.52; // 25–55° from Z axis
    const azimuth = Math.random() * Math.PI * 2;
    spinAxis.current = {
      x: Math.sin(tilt) * Math.cos(azimuth),
      y: Math.sin(tilt) * Math.sin(azimuth),
      z: Math.cos(tilt),
    };
  }

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    [],
  );

  // Pre-allocated vectors — reused every frame, zero GC pressure
  const _mouseVec = useMemo(() => new THREE.Vector3(), []);
  const _dir = useMemo(() => new THREE.Vector3(), []);
  const _mouseWorld = useMemo(() => new THREE.Vector3(), []);

  // Text positions — sampled on mount (client only)
  const [textPositions, setTextPositions] = useState<[number, number][]>([]);

  useEffect(() => {
    const positions = sampleTextPositions(formationText, count);
    setTextPositions(positions);
  }, [count, formationText]);

  /* ── Particle data ── */
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const entropyPositions = new Float32Array(count * 3);
    const ringTargets = new Float32Array(count * 3);
    const textTargets = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const colorIndices = new Uint8Array(count);
    const randomOffsets = new Float32Array(count);
    const birthDelays = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * ENTROPY_SPREAD_X;
      const y = (Math.random() - 0.5) * ENTROPY_SPREAD_Y;
      const z = (Math.random() - 0.5) * ENTROPY_SPREAD_Z;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Entropy = home position (where particles return when idle)
      entropyPositions[i * 3] = x;
      entropyPositions[i * 3 + 1] = y;
      entropyPositions[i * 3 + 2] = z;

      // Default text targets to entropy (overwritten when text is sampled)
      textTargets[i * 3] = x;
      textTargets[i * 3 + 1] = y;
      textTargets[i * 3 + 2] = z;

      if (i < NODE_COUNT) {
        scales[i] = 0.5 + Math.random() * 0.2;
      } else {
        scales[i] = 0.12 + Math.random() * 0.2;
      }

      colorIndices[i] = Math.floor(Math.random() * PARTICLE_COLORS.length);
      randomOffsets[i] = Math.random() * Math.PI * 2;
      birthDelays[i] = Math.random() * BIRTH_DURATION;
    }
    return {
      positions,
      entropyPositions,
      ringTargets,
      textTargets,
      scales,
      colorIndices,
      randomOffsets,
      birthDelays,
    };
  }, [count]);

  /* ── Tensor network line geometry (pre-allocated) ── */
  const lineMesh = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const arr = new Float32Array(MAX_LINES * 6);
    const attr = new THREE.BufferAttribute(arr, 3);
    attr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("position", attr);
    geo.setDrawRange(0, 0);

    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color("#8ba4c4"),
      transparent: true,
      opacity: 0.06,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return new THREE.LineSegments(geo, mat);
  }, []);

  const linePositions = useMemo(() => {
    return (lineMesh.geometry.getAttribute("position") as THREE.BufferAttribute)
      .array as Float32Array;
  }, [lineMesh]);

  /* ── Set instanced colors ── */
  useEffect(() => {
    if (!meshRef.current) return;
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      color.set(PARTICLE_COLORS[particles.colorIndices[i]!]!);

      if (i < NODE_COUNT) {
        color.offsetHSL(0, -0.08, 0.08);
      } else {
        color.offsetHSL(0, -0.12, -0.08);
      }
      meshRef.current.setColorAt(i, color);
    }
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [count, particles.colorIndices]);

  /* ── Event handlers ── */
  const handlePointerMove = useCallback((e: MouseEvent) => {
    mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    mouseMoved.current = true;
  }, []);

  const handleTouchStart = useCallback(() => {
    mouseMoved.current = true;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    mouse.current.x = (t.clientX / window.innerWidth) * 2 - 1;
    mouse.current.y = -(t.clientY / window.innerHeight) * 2 + 1;
    mouseMoved.current = true;
  }, []);

  const handleMouseDown = useCallback(() => {
    mouseDown.current = true;
  }, []);

  const handleMouseUp = useCallback(() => {
    mouseDown.current = false;
  }, []);

  const handleMouseEnter = useCallback(() => {
    mouseOnPage.current = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseOnPage.current = false;
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    root.addEventListener("mouseenter", handleMouseEnter);
    root.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      root.removeEventListener("mouseenter", handleMouseEnter);
      root.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [
    handlePointerMove,
    handleTouchStart,
    handleTouchMove,
    handleMouseDown,
    handleMouseUp,
    handleMouseEnter,
    handleMouseLeave,
  ]);

  /* ── Compute ring formation targets (dense ring + cloud beyond) ── */
  useEffect(() => {
    const voidR = compact ? VOID_RADIUS_MOBILE : VOID_RADIUS_DESKTOP;
    const ringPeak = compact ? RING_PEAK_MOBILE : RING_PEAK_DESKTOP;
    const cloudOuter = compact ? CLOUD_OUTER_MOBILE : CLOUD_OUTER_DESKTOP;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;

      let radius;
      if (Math.random() < 0.55) {
        // Dense ring band — concentrated around ringPeak
        radius = ringPeak + (Math.random() - 0.5) * RING_BAND_WIDTH;
        radius = Math.max(voidR, radius);
      } else {
        // Cloud beyond ring — density decreasing outward
        const t = Math.pow(Math.random(), 1.5);
        radius = ringPeak + RING_BAND_WIDTH * 0.5 + t * (cloudOuter - ringPeak - RING_BAND_WIDTH * 0.5);
      }

      const flatness = RING_FLATNESS + Math.random() * 0.06;

      particles.ringTargets[i * 3] = Math.cos(angle) * radius;
      particles.ringTargets[i * 3 + 1] =
        Math.sin(angle) * radius * flatness;
      particles.ringTargets[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
    }
  }, [count, compact, particles.ringTargets]);

  /* ── Compute text formation targets (scroll-driven, no lensing) ── */
  useEffect(() => {
    if (textPositions.length === 0) return;

    const spreadX = compact ? 2.8 : 5.5;
    const spreadY = compact ? 1.2 : 2.4;

    for (let i = 0; i < count; i++) {
      if (i < textPositions.length) {
        const [nx, ny] = textPositions[i]!;
        // Direct text positions — no void, particles form the letters
        particles.textTargets[i * 3] = nx * spreadX;
        particles.textTargets[i * 3 + 1] = ny * spreadY;
        particles.textTargets[i * 3 + 2] = (Math.random() - 0.5) * 0.25;
      } else {
        // Extra particles: scatter loosely around text area
        const angle = Math.random() * Math.PI * 2;
        const radius = 1.0 + Math.random() * 4.5;
        particles.textTargets[i * 3] = Math.cos(angle) * radius;
        particles.textTargets[i * 3 + 1] =
          Math.sin(angle) * radius * 0.4;
        particles.textTargets[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
      }
    }
  }, [count, compact, particles.textTargets, textPositions]);

  /* ── Per-frame animation ── */
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    const dt = Math.min(delta * 60, 3);
    frameCount.current++;

    // ── Consume mouse activity flag ──
    if (mouseMoved.current) {
      mouseMoved.current = false;
      hasEverInteracted.current = true;
      lastInteractTime.current = time;
    }

    // ── Scroll-driven formation strength (read DOM directly — no React re-renders) ──
    const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = scrollMax > 0 ? window.scrollY / scrollMax : 0;
    const scrollRange = SCROLL_FORMATION_END - SCROLL_FORMATION_START;
    const scrollStrength = Math.min(
      Math.max((scrollProgress - SCROLL_FORMATION_START) / scrollRange, 0),
      1,
    );

    // Project mouse into world space — zero allocations
    _mouseVec.set(mouse.current.x, mouse.current.y, 0.5);
    _mouseVec.unproject(camera);
    _dir.copy(_mouseVec).sub(camera.position).normalize();
    const dist = -camera.position.z / _dir.z;
    _mouseWorld.copy(camera.position).addScaledVector(_dir, dist);

    const mx = _mouseWorld.x;
    const my = _mouseWorld.y;

    // ── Vortex: detect cursor near center ──
    const mouseCenterDist = Math.sqrt(mx * mx + my * my);
    const inVortexZone =
      mouseCenterDist < VORTEX_ZONE_RADIUS &&
      mouseOnPage.current &&
      hasEverInteracted.current;

    if (inVortexZone) {
      vortexStrength.current = Math.min(
        1,
        vortexStrength.current + VORTEX_ENGAGE * delta,
      );
      // Keep interaction alive while in vortex zone — bypass idle timeout
      lastInteractTime.current = time;
    } else {
      vortexStrength.current = Math.max(
        0,
        vortexStrength.current - VORTEX_DISENGAGE * delta,
      );
    }

    // ── Cursor-driven formation strength ──
    const timeSinceInteract = time - lastInteractTime.current;
    let cursorTarget = 0;
    if (
      hasEverInteracted.current &&
      mouseOnPage.current &&
      (timeSinceInteract < IDLE_TIMEOUT || vortexStrength.current > 0.01)
    ) {
      cursorTarget = 1;
    }

    if (interactionStrength.current < cursorTarget) {
      interactionStrength.current = Math.min(
        cursorTarget,
        interactionStrength.current + ENGAGE_RATE * delta,
      );
    } else {
      interactionStrength.current = Math.max(
        cursorTarget,
        interactionStrength.current - DISENGAGE_RATE * delta,
      );
    }

    // Combined: whichever is higher — scroll or cursor
    const strength = Math.max(scrollStrength, interactionStrength.current);

    // Update shader time
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime!.value = time;
    }

    for (let i = 0; i < count; i++) {
      let x = particles.positions[i * 3]!;
      let y = particles.positions[i * 3 + 1]!;
      let z = particles.positions[i * 3 + 2]!;

      // ── Blend target: entropy → ring (cursor) → text (scroll) ──
      const ex = particles.entropyPositions[i * 3]!;
      const ey = particles.entropyPositions[i * 3 + 1]!;
      const ez = particles.entropyPositions[i * 3 + 2]!;
      const rx0 = particles.ringTargets[i * 3]!;
      const ry0 = particles.ringTargets[i * 3 + 1]!;
      const rz0 = particles.ringTargets[i * 3 + 2]!;
      const tx = particles.textTargets[i * 3]!;
      const ty = particles.textTargets[i * 3 + 1]!;
      const tz = particles.textTargets[i * 3 + 2]!;

      // ── 3D Keplerian vortex (Rodrigues' rotation) ──
      let rx = rx0, ry = ry0, rz = rz0;
      if (vortexStrength.current > 0.01) {
        const kx = spinAxis.current!.x;
        const ky = spinAxis.current!.y;
        const kz = spinAxis.current!.z;

        // Perpendicular distance from spin axis → Keplerian radius
        const dot0 = kx * rx0 + ky * ry0 + kz * rz0;
        const rPerp = Math.sqrt(
          rx0 * rx0 + ry0 * ry0 + rz0 * rz0 - dot0 * dot0,
        );
        const keplerW =
          VORTEX_SPEED / Math.pow(Math.max(rPerp, 0.5), 1.5);
        const vAngle = keplerW * vortexStrength.current * time;
        const cosV = Math.cos(vAngle);
        const sinV = Math.sin(vAngle);
        // Cross product: k × v
        const cx = ky * rz0 - kz * ry0;
        const cy = kz * rx0 - kx * rz0;
        const cz = kx * ry0 - ky * rx0;
        // Rodrigues: v*cos + (k×v)*sin + k*(k·v)*(1-cos)
        rx = rx0 * cosV + cx * sinV + kx * dot0 * (1 - cosV);
        ry = ry0 * cosV + cy * sinV + ky * dot0 * (1 - cosV);
        rz = rz0 * cosV + cz * sinV + kz * dot0 * (1 - cosV);
      }

      // Formation target: ring when no scroll, text when scrolled
      const ftx = rx + (tx - rx) * scrollStrength;
      const fty = ry + (ty - ry) * scrollStrength;
      const ftz = rz + (tz - rz) * scrollStrength;

      // Blend entropy → formation target
      const effectiveX = ex + (ftx - ex) * strength;
      const effectiveY = ey + (fty - ey) * strength;
      const effectiveZ = ez + (ftz - ez) * strength;

      // Lerp toward effective target
      x += (effectiveX - x) * LERP_SPEED * dt;
      y += (effectiveY - y) * LERP_SPEED * dt;
      z += (effectiveZ - z) * LERP_SPEED * dt;

      // Orbital drift (gentle ambient rotation)
      const rrSq = x * x + y * y;
      const rr = Math.sqrt(rrSq);
      if (rr > 0.3) {
        const orbSpeed = ORB_SPEED_FACTOR / (rr + 0.4);
        const orbAngle = Math.atan2(y, x);
        const orbStr = 0.3 + 0.7 * strength;
        x += -Math.sin(orbAngle) * orbSpeed * ORB_DRIFT_X * dt * orbStr;
        y += Math.cos(orbAngle) * orbSpeed * ORB_DRIFT_Y * dt * orbStr;
      }

      // Jitter — amplified in entropy mode for alive feel
      const offset = particles.randomOffsets[i]!;
      const jitterMult = 1 + (ENTROPY_JITTER_MULT - 1) * (1 - strength);
      x += Math.sin(time * 0.8 + offset) * JITTER_AMP * jitterMult * dt;
      y += Math.cos(time * 0.9 + offset) * JITTER_AMP * jitterMult * dt;

      // Entropy drift — gentle brownian motion when not forming
      const entropyFactor = 1 - strength;
      if (entropyFactor > 0.01) {
        x +=
          Math.sin(time * 0.3 + offset * 2.1) *
          ENTROPY_DRIFT *
          entropyFactor *
          dt;
        y +=
          Math.cos(time * 0.25 + offset * 1.7) *
          ENTROPY_DRIFT *
          entropyFactor *
          dt;
        z +=
          Math.sin(time * 0.15 + offset * 3.3) *
          ENTROPY_DRIFT *
          0.5 *
          entropyFactor *
          dt;
      }

      // Mouse interaction — repulsion by default, attraction on click
      const dx = x - mx;
      const dy = y - my;
      const dSq = dx * dx + dy * dy;
      if (dSq < MOUSE_RADIUS_SQ) {
        const d = Math.sqrt(dSq);
        if (mouseDown.current) {
          const force =
            ((MOUSE_RADIUS - d) / MOUSE_RADIUS) * MOUSE_FORCE * dt * 0.5;
          x -= dx * force;
          y -= dy * force;
        } else {
          const force =
            ((MOUSE_RADIUS - d) / MOUSE_RADIUS) * MOUSE_FORCE * dt;
          x += dx * force;
          y += dy * force;
        }
      }

      particles.positions[i * 3] = x;
      particles.positions[i * 3 + 1] = y;
      particles.positions[i * 3 + 2] = z;

      // Scale with proximity glow + birth fade-in
      const baseScale = particles.scales[i]!;
      const pulse = 0.9 + 0.1 * Math.sin(time * 1.5 + offset);
      const isNode = i < NODE_COUNT;
      const proximityBoost = 1.3 + 1.0 / (rr + 0.8);
      const mobileBoost = compactRef.current ? 1.8 : 1;

      // Gradual birth: each particle fades in at its random delay
      const birthProgress = Math.min((time - particles.birthDelays[i]!) / 0.6, 1);
      const birthScale = birthProgress > 0 ? birthProgress * birthProgress : 0;

      const scale =
        baseScale *
        pulse *
        (isNode ? 0.032 : 0.018) *
        proximityBoost *
        mobileBoost *
        birthScale;

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;

    /* ── Recompute tensor network connections (spatial hash grid) ── */
    if (frameCount.current % RECOMPUTE_EVERY === 0) {
      const nodeCount = Math.min(NODE_COUNT, count);
      const thresholdSq = CONN_DIST * CONN_DIST;
      const invCell = 1 / CONN_DIST;
      let lc = 0;

      const grid = new Map<number, number[]>();
      for (let i = 0; i < nodeCount; i++) {
        const cx = Math.floor(particles.positions[i * 3]! * invCell);
        const cy = Math.floor(particles.positions[i * 3 + 1]! * invCell);
        const cz = Math.floor(particles.positions[i * 3 + 2]! * invCell);
        const key =
          (cx * 73856093) ^ (cy * 19349663) ^ (cz * 83492791);
        let cell = grid.get(key);
        if (!cell) {
          cell = [];
          grid.set(key, cell);
        }
        cell.push(i);
      }

      const tensorMax = MAX_LINES - INTERACTION_LINE_BUDGET;
      for (let i = 0; i < nodeCount && lc < tensorMax; i++) {
        const ix = particles.positions[i * 3]!;
        const iy = particles.positions[i * 3 + 1]!;
        const iz = particles.positions[i * 3 + 2]!;
        const cx = Math.floor(ix * invCell);
        const cy = Math.floor(iy * invCell);
        const cz = Math.floor(iz * invCell);

        for (let dcx = -1; dcx <= 1; dcx++) {
          for (let dcy = -1; dcy <= 1; dcy++) {
            for (let dcz = -1; dcz <= 1; dcz++) {
              const cell = grid.get(
                ((cx + dcx) * 73856093) ^
                  ((cy + dcy) * 19349663) ^
                  ((cz + dcz) * 83492791),
              );
              if (!cell) continue;
              for (let ci = 0; ci < cell.length && lc < tensorMax; ci++) {
                const j = cell[ci]!;
                if (j <= i) continue;
                const ddx = ix - particles.positions[j * 3]!;
                const ddy = iy - particles.positions[j * 3 + 1]!;
                const ddz = iz - particles.positions[j * 3 + 2]!;
                if (ddx * ddx + ddy * ddy + ddz * ddz < thresholdSq) {
                  const idx = lc * 6;
                  linePositions[idx] = ix;
                  linePositions[idx + 1] = iy;
                  linePositions[idx + 2] = iz;
                  linePositions[idx + 3] = particles.positions[j * 3]!;
                  linePositions[idx + 4] = particles.positions[j * 3 + 1]!;
                  linePositions[idx + 5] = particles.positions[j * 3 + 2]!;
                  lc++;
                }
              }
            }
          }
        }
      }

      tensorLineCount.current = lc;
    }

    /* ── Interaction layers (progressive easter eggs) ── */
    const iState = interactionState.current!;
    const tensorLc = tensorLineCount.current;
    const result = tickInteractions(
      iState,
      particles.positions,
      count,
      Math.min(NODE_COUNT, count),
      meshRef.current,
      linePositions,
      tensorLc,
      INTERACTION_LINE_BUDGET,
      time,
      delta,
      inVortexZone,
      vortexStrength.current,
      compactRef.current,
    );

    // Apply overrides — position offsets + scale multipliers
    for (let oi = 0; oi < result.overrides.length; oi++) {
      const ov = result.overrides[oi]!;
      const idx = ov.index;
      const px = particles.positions[idx * 3]! + (ov.positionOffset?.x ?? 0);
      const py = particles.positions[idx * 3 + 1]! + (ov.positionOffset?.y ?? 0);
      const pz = particles.positions[idx * 3 + 2]! + (ov.positionOffset?.z ?? 0);

      dummy.position.set(px, py, pz);
      // Re-read the current scale from the matrix we already set
      meshRef.current.getMatrixAt(idx, dummy.matrix);
      const currentScale = dummy.matrix.elements[0]!; // uniform scale
      dummy.scale.setScalar(currentScale * (ov.scaleMultiplier ?? 1));
      dummy.position.set(px, py, pz);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(idx, dummy.matrix);

      if (ov.colorOverride && meshRef.current.instanceColor) {
        meshRef.current.setColorAt(idx, ov.colorOverride);
        result.colorsDirty = true;
      }
    }

    if (result.overrides.length > 0) {
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
    if (result.colorsDirty && meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }

    // Update line draw range (tensor + interaction lines)
    const totalLines = tensorLc + result.extraLineCount;
    const posAttr = lineMesh.geometry.getAttribute("position") as THREE.BufferAttribute;
    posAttr.needsUpdate = true;
    lineMesh.geometry.setDrawRange(0, totalLines * 2);
  });

  return (
    <group>
      <primitive object={lineMesh} />
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <icosahedronGeometry args={[1, 1]} />
        <shaderMaterial
          ref={shaderRef}
          vertexShader={particleVertexShader}
          fragmentShader={particleFragmentShader}
          uniforms={uniforms}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  );
}
