"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";
import ParticleCloud from "./ParticleCloud";
import { useIsMobile, usePrefersReducedMotion } from "@/lib/useMobile";


interface SceneProps {
  count: number;
  compact: boolean;
  formationText?: string;
}

function Scene({ count, compact, formationText }: SceneProps) {
  return (
    <>
      <ambientLight intensity={0.15} color="#8ba4c4" />
      <pointLight position={[0, 3, 5]} intensity={1.8} distance={25} color="#7a94b8" />
      <pointLight position={[5, -2, 3]} intensity={0.4} distance={15} color="#9db5d4" />
      <pointLight position={[-5, -2, 3]} intensity={0.4} distance={15} color="#6b84a8" />

      {/* Singularity glow */}
      <pointLight position={[0, 0, 2]} intensity={2.5} distance={6} color="#c8d8ec" />
      <pointLight position={[0, 0, 0]} intensity={1.2} distance={3} color="#e0e8f4" />

      <ParticleCloud count={count} formationText={formationText} compact={compact} />
      <AdaptiveDpr pixelated />
    </>
  );
}

interface QuantumFieldProps {
  formationText?: string;
}

export default function QuantumField({ formationText }: QuantumFieldProps) {
  const isMobile = useIsMobile();
  const reducedMotion = usePrefersReducedMotion();

  // Fewer particles on mobile; none if reduced motion
  const particleCount = reducedMotion ? 0 : isMobile ? 2200 : 5500;

  // Lower DPR on mobile for performance
  const dpr: [number, number] = isMobile ? [1, 1.5] : [1, 2];

  const chromaticOffset = useMemo(() => new Vector2(0.0008, 0.0008), []);

  const postProcessing = useMemo(() => {
    if (isMobile) return null; // Skip post-processing on mobile
    return (
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.08}
          luminanceSmoothing={0.9}
          intensity={3.0}
          mipmapBlur
          radius={0.8}
        />
        <ChromaticAberration offset={chromaticOffset} />
        <Noise opacity={0.03} blendFunction={BlendFunction.OVERLAY} />
        <Vignette eskil={false} offset={0.05} darkness={1.25} />
      </EffectComposer>
    );
  }, [isMobile, chromaticOffset]);

  if (reducedMotion) {
    return null;
  }

  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: isMobile ? 75 : 50 }}
        dpr={dpr}
        gl={{ antialias: !isMobile, alpha: true, powerPreference: "default" }}
      >
        <Scene count={particleCount} compact={isMobile} formationText={formationText} />
        {postProcessing}
      </Canvas>
    </div>
  );
}
