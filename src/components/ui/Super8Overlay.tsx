"use client";

import { useEffect, useRef, type ReactNode } from "react";

// ─────────────────────────────────────────────────────────────
// Super8Overlay — simulates celluloid film degradation on its
// children when activated. Four phases of increasingly aggressive
// flicker, jitter, and burn-out, driven by requestAnimationFrame
// for organic randomness.
// ─────────────────────────────────────────────────────────────

interface Super8OverlayProps {
  active: boolean;   // when true, start the flicker sequence
  children: ReactNode;
  className?: string;
}

/** Random float between min and max. */
function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Determine the style values for a given elapsed time (seconds).
 * Returns opacity, translateX, translateY, and brightness.
 */
function computeFrame(elapsed: number): {
  opacity: number;
  tx: number;
  ty: number;
  brightness: number;
  isBlackFrame: boolean;
} {
  // Phase 1 (0 - 1.5s): Subtle brightness flicker
  if (elapsed < 1.5) {
    // Irregular flicker — use sin + noise for organic feel
    const flicker = Math.random() < 0.3 ? rand(0.85, 0.92) : rand(0.95, 1.0);
    return {
      opacity: flicker,
      tx: 0,
      ty: 0,
      brightness: rand(0.95, 1.08),
      isBlackFrame: false,
    };
  }

  // Phase 2 (1.5 - 3.0s): More aggressive — jitter + gate weave
  if (elapsed < 3.0) {
    const progress = (elapsed - 1.5) / 1.5; // 0 → 1 within phase
    const minOpacity = 0.3 + (1 - progress) * 0.3; // starts ~0.6, drops to ~0.3
    const opacity = rand(minOpacity, 0.8 + (1 - progress) * 0.2);
    return {
      opacity,
      tx: rand(-1, 1),   // horizontal gate weave
      ty: rand(-2, 2),   // vertical jitter
      brightness: rand(0.85, 1.15),
      isBlackFrame: false,
    };
  }

  // Phase 3 (3.0 - 4.5s): Film burning — occasional black frames
  if (elapsed < 4.5) {
    const progress = (elapsed - 3.0) / 1.5; // 0 → 1 within phase
    // ~15% chance of a full-black frame, increasing with progress
    const isBlackFrame = Math.random() < 0.15 + progress * 0.2;
    if (isBlackFrame) {
      return {
        opacity: 0,
        tx: 0,
        ty: 0,
        brightness: 1,
        isBlackFrame: true,
      };
    }
    const minOpacity = 0.1;
    const maxOpacity = 0.5 - progress * 0.3; // shrinks toward end
    return {
      opacity: rand(minOpacity, Math.max(minOpacity, maxOpacity)),
      tx: rand(-1.5, 1.5),
      ty: rand(-3, 3),
      brightness: rand(0.7, 1.2),
      isBlackFrame: false,
    };
  }

  // Phase 4 (4.5s+): Hidden
  return {
    opacity: 0,
    tx: 0,
    ty: 0,
    brightness: 1,
    isBlackFrame: false,
  };
}

export default function Super8Overlay({
  active,
  children,
  className = "",
}: Super8OverlayProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const grainRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const blackFrameTimerRef = useRef<number>(0);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const grain = grainRef.current;
    if (!wrapper) return;

    // When deactivated, immediately restore to clean state
    if (!active) {
      cancelAnimationFrame(rafRef.current);
      wrapper.style.opacity = "1";
      wrapper.style.transform = "translate(0, 0)";
      wrapper.style.filter = "none";
      wrapper.style.pointerEvents = "auto";
      if (grain) grain.style.opacity = "0";
      return;
    }

    // Start the degradation sequence
    startTimeRef.current = performance.now();
    blackFrameTimerRef.current = 0;

    const animate = (now: number) => {
      if (!wrapper) return;

      const elapsed = (now - startTimeRef.current) / 1000;
      const frame = computeFrame(elapsed);

      // Phase 4: final state — stop the loop
      if (elapsed >= 4.5) {
        wrapper.style.opacity = "0";
        wrapper.style.transform = "translate(0, 0)";
        wrapper.style.filter = "none";
        wrapper.style.pointerEvents = "none";
        if (grain) grain.style.opacity = "0";
        return; // stop RAF loop
      }

      // For black frames, hold for 50-100ms then resume
      if (frame.isBlackFrame) {
        wrapper.style.opacity = "0";
        wrapper.style.filter = "none";
        // Schedule a brief hold before next frame
        const holdMs = rand(50, 100);
        blackFrameTimerRef.current = window.setTimeout(() => {
          rafRef.current = requestAnimationFrame(animate);
        }, holdMs);
        return;
      }

      // Apply computed frame values
      wrapper.style.opacity = String(frame.opacity);
      wrapper.style.transform = `translate(${frame.tx}px, ${frame.ty}px)`;
      wrapper.style.filter = `contrast(1.1) brightness(${frame.brightness})`;
      wrapper.style.pointerEvents = elapsed >= 4.5 ? "none" : "auto";

      // Show grain overlay during active phases (1-3)
      if (grain) {
        grain.style.opacity = elapsed < 4.5 ? "0.03" : "0";
      }

      // Schedule next frame with slight variance for organic timing.
      // Phases 2-3 skip occasional frames for a jerky projector feel.
      if (elapsed > 1.5 && Math.random() < 0.1) {
        // Skip a frame — creates micro-stutter like a projector gate
        const skipMs = rand(30, 80);
        blackFrameTimerRef.current = window.setTimeout(() => {
          rafRef.current = requestAnimationFrame(animate);
        }, skipMs);
      } else {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(blackFrameTimerRef.current);
    };
  }, [active]);

  return (
    <div
      ref={wrapperRef}
      className={`relative ${className}`}
      style={{
        // Smooth transition only for the restore (active→false) case;
        // the RAF loop handles frame-by-frame updates directly.
        willChange: active ? "opacity, transform, filter" : "auto",
      }}
    >
      {children}

      {/* Film grain pseudo-layer — very subtle noise texture */}
      <div
        ref={grainRef}
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0,
          mixBlendMode: "overlay",
          // Repeating conic gradient creates a noise-like pattern at
          // small sizes. This is cheaper than an SVG feTurbulence filter.
          backgroundImage:
            "repeating-conic-gradient(rgba(255,255,255,0.08) 0% 25%, transparent 0% 50%)",
          backgroundSize: "4px 4px",
          transition: "opacity 0.1s",
        }}
      />
    </div>
  );
}
