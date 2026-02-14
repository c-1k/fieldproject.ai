"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { Particle } from "@/lib/particles";

// All pipeline nodes use a single monochrome tone — they're part of the field
const NODE_COLOR = "#b0c4de";
const NODE_EMISSIVE = "#8ba4c4";

interface ParticleEntityProps {
  particle: Particle;
  active?: boolean;
  flash?: boolean;
}

export default function ParticleEntity({ particle, active = false, flash = false }: ParticleEntityProps) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!coreRef.current || !glowRef.current) return;
    const t = state.clock.elapsedTime;

    // Pulse animation
    const pulse = 1 + 0.08 * Math.sin(t * 2 + particle.position[0]);
    const targetScale = hovered ? 1.4 : active ? 1.15 : 1;
    const current = coreRef.current.scale.x;
    const lerped = THREE.MathUtils.lerp(current, targetScale * pulse, 0.1);
    coreRef.current.scale.setScalar(lerped);
    glowRef.current.scale.setScalar(lerped * 2.8);

    // Glow intensity
    const glowMat = glowRef.current.material as THREE.MeshBasicMaterial;
    const targetOpacity = hovered ? 0.22 : active ? 0.14 : 0.07;
    glowMat.opacity = THREE.MathUtils.lerp(glowMat.opacity, targetOpacity, 0.1);

    // Emissive flash when event pulse arrives
    if (flash) {
      const coreMat = coreRef.current.material as THREE.MeshStandardMaterial;
      coreMat.emissiveIntensity = THREE.MathUtils.lerp(
        coreMat.emissiveIntensity,
        2.5,
        0.15
      );
    } else if (coreRef.current.material instanceof THREE.MeshStandardMaterial) {
      const coreMat = coreRef.current.material as THREE.MeshStandardMaterial;
      coreMat.emissiveIntensity = THREE.MathUtils.lerp(
        coreMat.emissiveIntensity,
        0.4,
        0.05
      );
    }
  });

  return (
    <group
      ref={groupRef}
      position={particle.position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial
          color={NODE_COLOR}
          transparent
          opacity={0.07}
        />
      </mesh>

      {/* Inner core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color={NODE_COLOR}
          emissive={NODE_EMISSIVE}
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Hover label */}
      {hovered && (
        <Html center distanceFactor={8} style={{ pointerEvents: "none" }}>
          <div
            style={{
              background: "rgba(5,5,5,0.9)",
              border: "1px solid rgba(176,196,222,0.3)",
              borderRadius: 6,
              padding: "6px 10px",
              whiteSpace: "nowrap",
              fontSize: 12,
              color: "#ededed",
              fontFamily: "Inter, sans-serif",
            }}
          >
            <div style={{ fontWeight: 600, color: NODE_COLOR }}>
              {particle.name}
            </div>
            <div style={{ fontSize: 10, color: "#888" }}>
              {particle.subtitle}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
