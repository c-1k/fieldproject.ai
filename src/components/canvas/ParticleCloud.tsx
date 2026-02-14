"use client";

import { useRef, useMemo, useCallback, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PARTICLE_COLORS } from "@/lib/constants";
import { particleVertexShader, particleFragmentShader } from "@/shaders/particle";

type LayoutMode = "text";

interface ParticleCloudProps {
  count?: number;
  layout?: LayoutMode;
  compact?: boolean;
}

/* ── Tensor network parameters ── */
const NODE_COUNT = 150; // reduced from 350 — cuts O(n²) by ~5x
const MAX_LINES = 600;
const RECOMPUTE_EVERY = 15; // less frequent recomputation

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

export default function ParticleCloud({
  count = 3000,
  layout = "text",
  compact = false,
}: ParticleCloudProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  const mouse = useRef(new THREE.Vector2(0, 0));
  const mouseDown = useRef(false);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const frameCount = useRef(0);
  const startTime = useRef<number | null>(null);
  const compactRef = useRef(compact);
  compactRef.current = compact;
  const { camera } = useThree();

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
  }), []);

  // Pre-allocated vectors — reused every frame, zero GC pressure
  const _mouseVec = useMemo(() => new THREE.Vector3(), []);
  const _dir = useMemo(() => new THREE.Vector3(), []);
  const _mouseWorld = useMemo(() => new THREE.Vector3(), []);

  // Text positions — sampled on mount (client only)
  const [textPositions, setTextPositions] = useState<[number, number][]>([]);

  useEffect(() => {
    const positions = sampleTextPositions("FIELD PROJECT", count);
    setTextPositions(positions);
  }, [count]);

  /* ── Particle data ── */
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const targets = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const colorIndices = new Uint8Array(count);
    const randomOffsets = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
      targets[i * 3] = positions[i * 3]!;
      targets[i * 3 + 1] = positions[i * 3 + 1]!;
      targets[i * 3 + 2] = positions[i * 3 + 2]!;

      if (i < NODE_COUNT) {
        scales[i] = 0.5 + Math.random() * 0.2;
      } else {
        scales[i] = 0.12 + Math.random() * 0.2;
      }

      colorIndices[i] = Math.floor(Math.random() * PARTICLE_COLORS.length);
      randomOffsets[i] = Math.random() * Math.PI * 2;
    }
    return { positions, targets, scales, colorIndices, randomOffsets };
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

  const handlePointerMove = useCallback((e: MouseEvent) => {
    mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    mouse.current.x = (t.clientX / window.innerWidth) * 2 - 1;
    mouse.current.y = -(t.clientY / window.innerHeight) * 2 + 1;
  }, []);

  const handleMouseDown = useCallback(() => {
    mouseDown.current = true;
  }, []);

  const handleMouseUp = useCallback(() => {
    mouseDown.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handlePointerMove, handleTouchMove, handleMouseDown, handleMouseUp]);

  /* ── Update targets when layout changes ── */
  useEffect(() => {
    if (textPositions.length === 0) return;

    // Compact mode: legible text on mobile, dramatic on desktop
    const spreadX = compact ? 2.8 : 5.5;
    const spreadY = compact ? 1.2 : 2.4;
    const eventHorizon = compact ? 0.25 : 1.0;
    const lensStrength = compact ? 0.4 : 1.8;

    for (let i = 0; i < count; i++) {
      if (i < textPositions.length) {
        const [nx, ny] = textPositions[i]!;
        const x = nx * spreadX;
        const y = ny * spreadY;

        const r = Math.sqrt(x * x + y * y);
        const angle = Math.atan2(y, x);

        const radialPush = (eventHorizon * eventHorizon) / (r + 0.3);
        const lensedR = r + radialPush * lensStrength;

        const tangentialWarp = (eventHorizon / (r + 0.4)) * 0.8;
        const lensedAngle = angle + tangentialWarp;

        const flattenFactor = 0.45 + 0.45 * Math.min(r / 4, 1);

        particles.targets[i * 3] = lensedR * Math.cos(lensedAngle);
        particles.targets[i * 3 + 1] = lensedR * Math.sin(lensedAngle) * flattenFactor;
        particles.targets[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
      } else {
        const angle = Math.random() * Math.PI * 2;
        const radius = eventHorizon + 0.3 + Math.random() * 3;
        particles.targets[i * 3] = Math.cos(angle) * radius;
        particles.targets[i * 3 + 1] = Math.sin(angle) * radius * 0.25;
        particles.targets[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
      }
    }
  }, [layout, count, compact, particles.targets, textPositions]);

  /* ── Per-frame animation ── */
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    const dt = Math.min(delta * 60, 3); // frame-rate independent, capped to avoid jumps
    frameCount.current++;

    // Entrance animation — capture start time on first frame
    if (startTime.current === null) {
      startTime.current = time;
    }
    const elapsed = time - startTime.current;
    const lerpSpeed = elapsed < 3 ? LERP_SPEED * (2.5 - elapsed * 0.5) : LERP_SPEED;

    // Update shader time uniform
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime!.value = time;
    }

    // Project mouse into world space — zero allocations
    _mouseVec.set(mouse.current.x, mouse.current.y, 0.5);
    _mouseVec.unproject(camera);
    _dir.copy(_mouseVec).sub(camera.position).normalize();
    const dist = -camera.position.z / _dir.z;
    _mouseWorld.copy(camera.position).addScaledVector(_dir, dist);

    const mx = _mouseWorld.x;
    const my = _mouseWorld.y;

    for (let i = 0; i < count; i++) {
      let x = particles.positions[i * 3]!;
      let y = particles.positions[i * 3 + 1]!;
      let z = particles.positions[i * 3 + 2]!;

      const tx = particles.targets[i * 3]!;
      const ty = particles.targets[i * 3 + 1]!;
      const tz = particles.targets[i * 3 + 2]!;

      // Lerp to target (frame-rate independent, faster during entrance)
      x += (tx - x) * lerpSpeed * dt;
      y += (ty - y) * lerpSpeed * dt;
      z += (tz - z) * lerpSpeed * dt;

      // Orbital drift — cache sqrt for reuse in proximity boost
      const rrSq = x * x + y * y;
      const rr = Math.sqrt(rrSq);
      if (rr > 0.3) {
        const orbSpeed = ORB_SPEED_FACTOR / (rr + 0.4);
        const orbAngle = Math.atan2(y, x);
        x += -Math.sin(orbAngle) * orbSpeed * ORB_DRIFT_X * dt;
        y += Math.cos(orbAngle) * orbSpeed * ORB_DRIFT_Y * dt;
      }

      // Tiny jitter
      const offset = particles.randomOffsets[i]!;
      x += Math.sin(time * 0.8 + offset) * JITTER_AMP * dt;
      y += Math.cos(time * 0.9 + offset) * JITTER_AMP * dt;

      // Mouse interaction — repulsion by default, attraction on click
      const dx = x - mx;
      const dy = y - my;
      const dSq = dx * dx + dy * dy;
      if (dSq < MOUSE_RADIUS_SQ) {
        const d = Math.sqrt(dSq);
        if (mouseDown.current) {
          const force = ((MOUSE_RADIUS - d) / MOUSE_RADIUS) * MOUSE_FORCE * dt * 0.5;
          x -= dx * force;
          y -= dy * force;
        } else {
          const force = ((MOUSE_RADIUS - d) / MOUSE_RADIUS) * MOUSE_FORCE * dt;
          x += dx * force;
          y += dy * force;
        }
      }

      particles.positions[i * 3] = x;
      particles.positions[i * 3 + 1] = y;
      particles.positions[i * 3 + 2] = z;

      // Scale with proximity glow — bigger on mobile for legibility
      const baseScale = particles.scales[i]!;
      const pulse = 0.9 + 0.1 * Math.sin(time * 1.5 + offset);
      const isNode = i < NODE_COUNT;
      const proximityBoost = 1.3 + 1.0 / (rr + 0.8);
      const mobileBoost = compactRef.current ? 1.8 : 1;
      const scale = baseScale * pulse * (isNode ? 0.032 : 0.018) * proximityBoost * mobileBoost;

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

      // Build spatial hash grid — O(n) insert, ~O(n) query vs O(n²) brute force
      const grid = new Map<number, number[]>();
      for (let i = 0; i < nodeCount; i++) {
        const cx = Math.floor(particles.positions[i * 3]! * invCell);
        const cy = Math.floor(particles.positions[i * 3 + 1]! * invCell);
        const cz = Math.floor(particles.positions[i * 3 + 2]! * invCell);
        const key = (cx * 73856093) ^ (cy * 19349663) ^ (cz * 83492791);
        let cell = grid.get(key);
        if (!cell) { cell = []; grid.set(key, cell); }
        cell.push(i);
      }

      // Query neighboring cells for each node
      for (let i = 0; i < nodeCount && lc < MAX_LINES; i++) {
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
                ((cx + dcx) * 73856093) ^ ((cy + dcy) * 19349663) ^ ((cz + dcz) * 83492791)
              );
              if (!cell) continue;
              for (let ci = 0; ci < cell.length && lc < MAX_LINES; ci++) {
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

      const posAttr = lineMesh.geometry.getAttribute("position") as THREE.BufferAttribute;
      posAttr.needsUpdate = true;
      lineMesh.geometry.setDrawRange(0, lc * 2);
    }
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
