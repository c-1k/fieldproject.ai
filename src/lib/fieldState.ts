/**
 * Module-level state shared between the WebGL canvas (writer) and
 * DOM components like DiscoveryHUD and Super8Overlay (readers).
 * No React — ParticleCloud writes on each frame, DOM polls via setInterval.
 */
export const fieldState = {
  dwellAccum: 0,
  layerMask: 0,
};
