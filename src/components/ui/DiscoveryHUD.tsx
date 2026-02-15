"use client";

import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────
// DiscoveryHUD — minimal overlay showing particle interaction
// layer unlocks. Fixed to the bottom-left corner of the viewport.
// Layers 1-5 are tracked; layer 0 is always active and hidden.
// ─────────────────────────────────────────────────────────────

interface DiscoveryHUDProps {
  layerMask: number; // bitmask of unlocked layers (bit 0 = layer 0, etc.)
  dwellTime: number; // cumulative seconds in vortex zone
}

const LAYER_NAMES = [
  "Pair Annihilation",
  "Force Lines",
  "Decay Cascades",
  "Field Condensation",
  "Entanglement",
] as const;

/** Check if a specific layer bit (1-indexed) is set in the mask. */
function isLayerUnlocked(mask: number, layer: number): boolean {
  return (mask & (1 << layer)) !== 0;
}

/** Returns layer indices (1-5) that are newly set in `next` vs `prev`. */
function getNewUnlocks(prev: number, next: number): number[] {
  const diff = next & ~prev; // bits that are new
  const unlocked: number[] = [];
  for (let i = 1; i <= 5; i++) {
    if (diff & (1 << i)) unlocked.push(i);
  }
  return unlocked;
}

export default function DiscoveryHUD({ layerMask, dwellTime }: DiscoveryHUDProps) {
  const prevMaskRef = useRef<number>(layerMask);
  const [notification, setNotification] = useState<string | null>(null);
  const [notifVisible, setNotifVisible] = useState(false);
  const notifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect new layer unlocks whenever layerMask changes
  useEffect(() => {
    const prev = prevMaskRef.current;
    const newUnlocks = getNewUnlocks(prev, layerMask);
    prevMaskRef.current = layerMask;

    if (newUnlocks.length === 0) return;

    // Show the most recently unlocked layer name
    const latestLayer = newUnlocks[newUnlocks.length - 1];
    const name = LAYER_NAMES[latestLayer - 1];

    // Clear any pending notification timer
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current);

    // Fade in
    setNotification(name);
    // Force a reflow before setting visible so the CSS transition triggers
    requestAnimationFrame(() => {
      setNotifVisible(true);
    });

    // Hold for 2.5s, then fade out
    notifTimerRef.current = setTimeout(() => {
      setNotifVisible(false);
      // Clear text after fade-out transition completes (~400ms)
      notifTimerRef.current = setTimeout(() => {
        setNotification(null);
      }, 400);
    }, 2500);

    return () => {
      if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    };
  }, [layerMask]);

  // Don't render anything until at least layer 1 is unlocked
  const anyLayerUnlocked = (layerMask >> 1) > 0; // bits 1-5
  if (!anyLayerUnlocked) return null;

  return (
    <div
      className="fixed bottom-6 left-6 z-50 font-mono"
      style={{
        animation: "discoveryHudFadeIn 0.6s ease-out forwards",
      }}
    >
      {/* Notification text — appears above the dots */}
      <div
        className="mb-2 text-xs tracking-wider uppercase"
        style={{
          color: "rgba(255, 255, 255, 0.5)",
          opacity: notifVisible ? 1 : 0,
          transform: notifVisible ? "translateY(0)" : "translateY(4px)",
          transition: "opacity 0.35s ease-out, transform 0.35s ease-out",
          pointerEvents: "none",
          minHeight: "1rem",
        }}
      >
        {notification && (
          <span>{notification}</span>
        )}
      </div>

      {/* Layer dots — 5 circles for layers 1-5 */}
      <div className="flex items-center gap-1.5">
        {LAYER_NAMES.map((_, idx) => {
          const layer = idx + 1;
          const unlocked = isLayerUnlocked(layerMask, layer);
          return (
            <div
              key={layer}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "white",
                opacity: unlocked ? 0.6 : 0.15,
                animation: unlocked ? "discoveryDotPulse 2.4s ease-in-out infinite" : "none",
                transition: "opacity 0.5s ease-out",
              }}
            />
          );
        })}
      </div>

      {/* Inline keyframes — avoids needing a global stylesheet entry */}
      <style>{`
        @keyframes discoveryDotPulse {
          0%, 100% { opacity: 0.6; box-shadow: 0 0 0px rgba(255,255,255,0); }
          50% { opacity: 0.85; box-shadow: 0 0 6px rgba(255,255,255,0.25); }
        }
        @keyframes discoveryHudFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
