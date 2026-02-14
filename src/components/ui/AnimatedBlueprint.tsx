"use client";

import { useEffect, useRef, useState } from "react";
import ParticleBlueprint from "./ParticleBlueprint";

interface AnimatedBlueprintProps {
  particleId: string;
  className?: string;
}

export default function AnimatedBlueprint({ particleId, className }: AnimatedBlueprintProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        .blueprint-hidden svg line,
        .blueprint-hidden svg path,
        .blueprint-hidden svg polygon,
        .blueprint-hidden svg ellipse,
        .blueprint-hidden svg circle,
        .blueprint-hidden svg rect {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          transition: stroke-dashoffset 1.5s ease-out;
        }
        .blueprint-visible svg line,
        .blueprint-visible svg path,
        .blueprint-visible svg polygon,
        .blueprint-visible svg ellipse,
        .blueprint-visible svg circle,
        .blueprint-visible svg rect {
          stroke-dasharray: 200;
          stroke-dashoffset: 0;
        }
        .blueprint-hidden svg text {
          opacity: 0;
          transition: opacity 0.8s ease-out 1s;
        }
        .blueprint-visible svg text {
          opacity: inherit;
        }
      `}</style>
      <div
        ref={ref}
        className={visible ? "blueprint-visible" : "blueprint-hidden"}
      >
        <ParticleBlueprint particleId={particleId} className={className} />
      </div>
    </>
  );
}
