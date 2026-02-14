// Monochrome blue-silver palette — subtle variation, not rainbow
export const PARTICLE_COLORS = [
  "#8ba4c4", // muted steel blue
  "#9db5d4", // light blue-gray
  "#7a94b8", // deeper steel
  "#b0c4de", // light steel blue
  "#6b84a8", // mid blue-gray
  "#a3b8d0", // soft periwinkle gray
  "#c4d4e4", // pale silver-blue
  "#5c7a9c", // deeper navy-gray
] as const;

export const PIPELINE_POSITIONS: [number, number, number][] = [
  [-4.5, 0.3, -0.5],   // boson
  [-2.5, -0.2, 0.3],   // fermion
  [-0.5, 0.1, -0.2],   // higgs
  [1.5, -0.3, 0.4],    // hadron
  [3.5, 0.2, -0.3],    // photon
  [5.5, -0.1, 0.2],    // neutrino
];

export const SECTION_COUNT = 6;

export const SECTIONS = {
  HERO: 0,
  PIPELINE: 1,
  TRAVERSAL: 2,
  METAPHOR: 3,
  ENTROPY: 4,
  EXPLORE: 5,
} as const;
