"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import ParticleCloud from "./ParticleCloud";
import PipelineGraph from "./PipelineGraph";
import { SECTIONS, SECTION_COUNT } from "@/lib/constants";

interface QuantumFieldProps {
  scrollProgress: number;
}

// Monochrome blue shifts per section — subtle, not jarring
const SECTION_COLORS = [
  "#7a94b8", // HERO - steel blue
  "#8ba4c8", // PIPELINE - slightly brighter
  "#9db5d4", // TRAVERSAL - cool silver-blue
  "#b0c4de", // METAPHOR - light steel
  "#6b84a8", // ENTROPY - deeper muted blue
  "#8ba4c4", // EXPLORE - back to neutral steel
];

function Scene({ scrollProgress }: { scrollProgress: number }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const activeSection = Math.min(
    Math.floor(scrollProgress * SECTION_COUNT),
    SECTION_COUNT - 1,
  );

  // Determine layout mode from scroll
  const layout = useMemo(() => {
    if (activeSection === SECTIONS.HERO) return "text" as const;
    if (activeSection >= SECTIONS.ENTROPY) return "entropy" as const;
    if (activeSection >= SECTIONS.PIPELINE) return "pipeline" as const;
    return "drift" as const;
  }, [activeSection]);

  // Animate point light color per section — subtle monochrome shifts
  useFrame(() => {
    if (!lightRef.current) return;
    const targetColor = new THREE.Color(SECTION_COLORS[activeSection] ?? "#7a94b8");
    lightRef.current.color.lerp(targetColor, 0.03);
  });

  return (
    <>
      {/* Lighting — monochrome blue-silver tones */}
      <ambientLight intensity={0.15} color="#8ba4c4" />
      <pointLight
        ref={lightRef}
        position={[0, 3, 5]}
        intensity={1.8}
        distance={25}
        color="#7a94b8"
      />
      <pointLight position={[5, -2, 3]} intensity={0.4} distance={15} color="#9db5d4" />
      <pointLight position={[-5, -2, 3]} intensity={0.4} distance={15} color="#6b84a8" />

      {/* Particle cloud — monochrome, text-morphing */}
      <ParticleCloud count={3000} layout={layout} />

      {/* Pipeline graph — visible from section 1+ */}
      <PipelineGraph
        visible={activeSection >= SECTIONS.PIPELINE && activeSection < SECTIONS.ENTROPY}
        activeStep={
          activeSection >= SECTIONS.TRAVERSAL
            ? Math.floor(scrollProgress * 6) % 6
            : -1
        }
        showTraversal={
          activeSection >= SECTIONS.TRAVERSAL &&
          activeSection < SECTIONS.METAPHOR
        }
      />

      <AdaptiveDpr pixelated />
    </>
  );
}

export default function QuantumField({ scrollProgress }: QuantumFieldProps) {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene scrollProgress={scrollProgress} />
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.3}
            luminanceSmoothing={0.9}
            intensity={1.2}
          />
          <Vignette eskil={false} offset={0.1} darkness={0.8} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
