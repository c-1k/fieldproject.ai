"use client";

import { useRef, useMemo, useCallback, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PARTICLE_COLORS, PIPELINE_POSITIONS } from "@/lib/constants";

type LayoutMode = "text" | "drift" | "pipeline" | "entropy";

interface ParticleCloudProps {
  count?: number;
  layout?: LayoutMode;
}

/* ── Tensor network parameters ── */
const NODE_COUNT = 350; // first N particles are "network nodes" (larger, connected)
const MAX_LINES = 1200; // max connection line segments
const RECOMPUTE_EVERY = 8; // recompute connectivity every N frames

// Connection distance per layout — tuned so text forms a visible mesh
const CONN_DIST: Record<LayoutMode, number> = {
  text: 0.85,
  drift: 2.6,
  pipeline: 1.8,
  entropy: 2.4,
};

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
}: ParticleCloudProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const mouse = useRef(new THREE.Vector2(0, 0));
  const mouseWorld = useRef(new THREE.Vector3(0, 0, 0));
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const layoutRef = useRef<LayoutMode>(layout);
  const transitionRef = useRef(0);
  const frameCount = useRef(0);
  const { camera } = useThree();

  // Text positions — sampled on mount (client only)
  const [textPositions, setTextPositions] = useState<[number, number][]>([]);

  useEffect(() => {
    const positions = sampleTextPositions("FIELD PROJECT", count);
    setTextPositions(positions);
  }, [count]);

  // Track layout transitions
  useEffect(() => {
    if (layout !== layoutRef.current) {
      layoutRef.current = layout;
      transitionRef.current = 0;
    }
  }, [layout]);

  /* ── Particle data ── */
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const targets = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const colorIndices = new Uint8Array(count);
    const randomOffsets = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
      velocities[i * 3] = (Math.random() - 0.5) * 0.003;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.003;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
      targets[i * 3] = positions[i * 3]!;
      targets[i * 3 + 1] = positions[i * 3 + 1]!;
      targets[i * 3 + 2] = positions[i * 3 + 2]!;

      // Nodes: larger + uniform.  Dust: tiny.
      if (i < NODE_COUNT) {
        scales[i] = 0.5 + Math.random() * 0.2;
      } else {
        scales[i] = 0.12 + Math.random() * 0.2;
      }

      colorIndices[i] = Math.floor(Math.random() * PARTICLE_COLORS.length);
      randomOffsets[i] = Math.random() * Math.PI * 2;
    }
    return { positions, velocities, targets, scales, colorIndices, randomOffsets };
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
      opacity: 0.07,
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
        // Nodes: slightly brighter
        color.offsetHSL(0, -0.08, 0.08);
      } else {
        // Dust: dimmer
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

  useEffect(() => {
    window.addEventListener("mousemove", handlePointerMove);
    return () => window.removeEventListener("mousemove", handlePointerMove);
  }, [handlePointerMove]);

  /* ── Update targets when layout changes ── */
  useEffect(() => {
    const spreadX = 7;
    const spreadY = 3;

    if (layout === "text" && textPositions.length > 0) {
      for (let i = 0; i < count; i++) {
        if (i < textPositions.length) {
          const [nx, ny] = textPositions[i]!;
          particles.targets[i * 3] = nx * spreadX;
          particles.targets[i * 3 + 1] = ny * spreadY;
          particles.targets[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
        } else {
          const angle = Math.random() * Math.PI * 2;
          const radius = 5 + Math.random() * 4;
          particles.targets[i * 3] = Math.cos(angle) * radius;
          particles.targets[i * 3 + 1] = (Math.random() - 0.5) * 4;
          particles.targets[i * 3 + 2] = Math.sin(angle) * radius - 2;
        }
      }
    } else if (layout === "pipeline") {
      for (let i = 0; i < count; i++) {
        const clusterIdx = i % PIPELINE_POSITIONS.length;
        const pos = PIPELINE_POSITIONS[clusterIdx]!;
        particles.targets[i * 3] = pos[0] + (Math.random() - 0.5) * 1.5;
        particles.targets[i * 3 + 1] = pos[1] + (Math.random() - 0.5) * 1.5;
        particles.targets[i * 3 + 2] = pos[2] + (Math.random() - 0.5) * 1.5;
      }
    } else if (layout === "entropy") {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 5 + Math.random() * 8;
        particles.targets[i * 3] = Math.cos(angle) * radius;
        particles.targets[i * 3 + 1] = (Math.random() - 0.5) * 10;
        particles.targets[i * 3 + 2] = Math.sin(angle) * radius;
      }
    } else if (layout === "drift") {
      for (let i = 0; i < count; i++) {
        particles.targets[i * 3] = (Math.random() - 0.5) * 16;
        particles.targets[i * 3 + 1] = (Math.random() - 0.5) * 10;
        particles.targets[i * 3 + 2] = (Math.random() - 0.5) * 8;
      }
    }
  }, [layout, count, particles.targets, textPositions]);

  /* ── Per-frame animation ── */
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    const currentLayout = layoutRef.current;
    frameCount.current++;

    // Advance transition
    transitionRef.current = Math.min(transitionRef.current + 0.008, 1);

    // Project mouse into world space for 3D repulsion
    const mouseVec = new THREE.Vector3(mouse.current.x, mouse.current.y, 0.5);
    mouseVec.unproject(camera);
    const dir = mouseVec.sub(camera.position).normalize();
    const dist = -camera.position.z / dir.z;
    mouseWorld.current = camera.position.clone().add(dir.multiplyScalar(dist));

    for (let i = 0; i < count; i++) {
      let x = particles.positions[i * 3]!;
      let y = particles.positions[i * 3 + 1]!;
      let z = particles.positions[i * 3 + 2]!;

      const tx = particles.targets[i * 3]!;
      const ty = particles.targets[i * 3 + 1]!;
      const tz = particles.targets[i * 3 + 2]!;

      if (currentLayout === "drift") {
        x += particles.velocities[i * 3]!;
        y += particles.velocities[i * 3 + 1]!;
        z += particles.velocities[i * 3 + 2]!;
        x += Math.sin(time * 0.15 + particles.randomOffsets[i]!) * 0.002;
        y += Math.cos(time * 0.12 + particles.randomOffsets[i]!) * 0.002;

        if (x > 8) x = -8;
        if (x < -8) x = 8;
        if (y > 5) y = -5;
        if (y < -5) y = 5;
        if (z > 4) z = -4;
        if (z < -4) z = 4;
      } else {
        const stagger = Math.min(
          1,
          Math.max(0, transitionRef.current * 2 - i / count),
        );
        const lerpSpeed = 0.03 + stagger * 0.02;
        x += (tx - x) * lerpSpeed;
        y += (ty - y) * lerpSpeed;
        z += (tz - z) * lerpSpeed;

        const jitter = currentLayout === "text" ? 0.0008 : 0.003;
        x += Math.sin(time * 0.8 + particles.randomOffsets[i]!) * jitter;
        y += Math.cos(time * 0.9 + particles.randomOffsets[i]!) * jitter;
      }

      // Mouse repulsion
      const mx = mouseWorld.current.x;
      const my = mouseWorld.current.y;
      const dx = x - mx;
      const dy = y - my;
      const dSq = dx * dx + dy * dy;
      const repelRadius = 2.5;
      if (dSq < repelRadius * repelRadius) {
        const d = Math.sqrt(dSq);
        const force = ((repelRadius - d) / repelRadius) * 0.08;
        x += dx * force;
        y += dy * force;
        z += (Math.random() - 0.5) * force * 0.5;
      }

      particles.positions[i * 3] = x;
      particles.positions[i * 3 + 1] = y;
      particles.positions[i * 3 + 2] = z;

      // Scale: nodes are prominent, dust is atmospheric
      const baseScale = particles.scales[i]!;
      const pulse =
        0.9 + 0.1 * Math.sin(time * 1.5 + particles.randomOffsets[i]!);
      const isNode = i < NODE_COUNT;
      const scale = baseScale * pulse * (isNode ? 0.032 : 0.018);

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;

    /* ── Recompute tensor network connections ── */
    if (frameCount.current % RECOMPUTE_EVERY === 0) {
      const nodeCount = Math.min(NODE_COUNT, count);
      const threshold = CONN_DIST[currentLayout] ?? 2.0;
      const thresholdSq = threshold * threshold;
      let lc = 0;

      for (let i = 0; i < nodeCount && lc < MAX_LINES; i++) {
        const ix = particles.positions[i * 3]!;
        const iy = particles.positions[i * 3 + 1]!;
        const iz = particles.positions[i * 3 + 2]!;

        for (let j = i + 1; j < nodeCount && lc < MAX_LINES; j++) {
          const jx = particles.positions[j * 3]!;
          const jy = particles.positions[j * 3 + 1]!;
          const jz = particles.positions[j * 3 + 2]!;

          const ddx = ix - jx;
          const ddy = iy - jy;
          const ddz = iz - jz;
          const dd = ddx * ddx + ddy * ddy + ddz * ddz;

          if (dd < thresholdSq) {
            const idx = lc * 6;
            linePositions[idx] = ix;
            linePositions[idx + 1] = iy;
            linePositions[idx + 2] = iz;
            linePositions[idx + 3] = jx;
            linePositions[idx + 4] = jy;
            linePositions[idx + 5] = jz;
            lc++;
          }
        }
      }

      const posAttr = lineMesh.geometry.getAttribute(
        "position",
      ) as THREE.BufferAttribute;
      posAttr.needsUpdate = true;
      lineMesh.geometry.setDrawRange(0, lc * 2);
    }
  });

  return (
    <group>
      {/* Tensor network connection lines */}
      <primitive object={lineMesh} />

      {/* Particle instances */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  );
}
