"use client";

import { useMemo, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PARTICLES, CORE_PARTICLES } from "@/lib/particles";
import ParticleEntity from "./ParticleEntity";
import ForceLines from "./ForceLines";
import EventPulse from "./EventPulse";

interface PipelineGraphProps {
  visible: boolean;
  activeStep?: number;
  showTraversal?: boolean;
}

export default function PipelineGraph({ visible, activeStep = -1, showTraversal = false }: PipelineGraphProps) {
  const groupRef = useMemo(() => ({ current: null as THREE.Group | null }), []);
  const opacityRef = useMemo(() => ({ current: 0 }), []);
  const [flashNode, setFlashNode] = useState(-1);

  const coreParticles = useMemo(
    () => CORE_PARTICLES.map((id) => PARTICLES[id]),
    [],
  );

  const handleNodeHit = useCallback((nodeIndex: number) => {
    setFlashNode(nodeIndex);
    // Clear flash after brief duration
    setTimeout(() => setFlashNode(-1), 400);
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    const targetOpacity = visible ? 1 : 0;
    opacityRef.current = THREE.MathUtils.lerp(opacityRef.current, targetOpacity, 0.05);
    groupRef.current.visible = opacityRef.current > 0.01;
  });

  return (
    <group ref={(ref) => { groupRef.current = ref; }}>
      {/* Force lines connecting nodes */}
      <ForceLines />

      {/* Core particle nodes */}
      {coreParticles.map((particle, i) => (
        <ParticleEntity
          key={particle.id}
          particle={particle}
          active={activeStep === i}
          flash={flashNode === i}
        />
      ))}

      {/* Traveling event pulse */}
      <EventPulse active={showTraversal} onNodeHit={handleNodeHit} />
    </group>
  );
}
