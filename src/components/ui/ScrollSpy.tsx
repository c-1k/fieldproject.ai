"use client";

import { useEffect, useState } from "react";

interface ScrollSpyParticle {
  id: string;
  name: string;
  color: string;
}

interface ScrollSpyProps {
  particles: ScrollSpyParticle[];
}

export default function ScrollSpy({ particles }: ScrollSpyProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const elements = particles
      .map((p) => document.getElementById(p.id))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the most visible entry that is intersecting
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length > 0) {
          // Pick the one with the highest intersection ratio
          const best = intersecting.reduce((a, b) =>
            a.intersectionRatio > b.intersectionRatio ? a : b
          );
          setActiveId(best.target.id);
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: "-20% 0px -20% 0px" }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [particles]);

  return (
    <nav className="fixed right-8 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-center gap-0">
      {particles.map((p, i) => {
        const isActive = activeId === p.id;
        return (
          <div key={p.id} className="flex flex-col items-center">
            {/* Connecting line above (skip for first dot) */}
            {i > 0 && (
              <div className="w-px h-4 bg-white/[0.04]" />
            )}

            {/* Dot + tooltip wrapper */}
            <div className="relative flex items-center">
              {/* Tooltip — shown on hover, positioned to the left */}
              {hoveredId === p.id && (
                <span
                  className="absolute right-full mr-3 whitespace-nowrap text-xs font-mono text-white/50 pointer-events-none select-none"
                >
                  {p.name}
                </span>
              )}

              <a
                href={`#${p.id}`}
                onMouseEnter={() => setHoveredId(p.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="block relative"
                aria-label={`Scroll to ${p.name}`}
              >
                {/* Outer glow for active state */}
                {isActive && (
                  <span
                    className="absolute inset-0 -m-1 rounded-full opacity-20"
                    style={{ backgroundColor: p.color }}
                  />
                )}
                {/* Dot */}
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-2.5 h-2.5 bg-white/30"
                      : "w-1.5 h-1.5 bg-white/10"
                  }`}
                />
              </a>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
