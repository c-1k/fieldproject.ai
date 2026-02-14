"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PARTICLES, CORE_PARTICLES } from "@/lib/particles";

interface EventPulseProps {
  active: boolean;
  onNodeHit?: (nodeIndex: number) => void;
}

export default function EventPulse({ active, onNodeHit }: EventPulseProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef(0);
  const lastNodeRef = useRef(-1);

  // Build bezier path through the 6 core particle positions
  const { curve, nodePositions } = useMemo(() => {
    const positions = CORE_PARTICLES.map((id) => {
      const p = PARTICLES[id];
      return new THREE.Vector3(...p.position);
    });

    // Create a smooth curve through all core nodes
    const curvePoints: THREE.Vector3[] = [];
    for (let i = 0; i < positions.length - 1; i++) {
      const start = positions[i]!;
      const end = positions[i + 1]!;
      const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
      mid.y += 0.3;
      curvePoints.push(start, mid, end);
    }

    const curvePath = new THREE.CatmullRomCurve3(positions, false, "centripetal", 0.5);

    return { curve: curvePath, nodePositions: positions };
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current || !active) {
      if (meshRef.current) meshRef.current.visible = false;
      progressRef.current = 0;
      lastNodeRef.current = -1;
      return;
    }

    meshRef.current.visible = true;
    progressRef.current += delta * 0.25; // Speed of traversal

    if (progressRef.current > 1) {
      progressRef.current = 0;
      lastNodeRef.current = -1;
    }

    // Get position on curve
    const point = curve.getPoint(progressRef.current);
    meshRef.current.position.copy(point);

    // Pulse glow
    const t = state.clock.elapsedTime;
    const scale = 0.06 + 0.02 * Math.sin(t * 8);
    meshRef.current.scale.setScalar(scale);

    // Check proximity to nodes for flash trigger
    for (let i = 0; i < nodePositions.length; i++) {
      const dist = point.distanceTo(nodePositions[i]!);
      if (dist < 0.3 && i !== lastNodeRef.current) {
        lastNodeRef.current = i;
        onNodeHit?.(i);
      }
    }
  });

  return (
    <mesh ref={meshRef} visible={false}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshBasicMaterial color="#c4d4e4" transparent opacity={0.85} />
    </mesh>
  );
}
