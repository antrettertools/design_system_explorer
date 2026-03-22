import type { RecipeDef } from './types'

export const RECIPES: RecipeDef[] = [
  // ── Triadic ──────────────────────────────────────────────────────────────
  {
    id: 'triadic-accent',
    label: 'Triadic + Accent',
    primaryType: 'triadic',
    primaryHueOffsets: [0, 120, 240],
    secondaryHueOffsets: [150, 210],
    secondaryChromaScale: 1.0,
    fillOrder: ['neutral-light','P1-vivid','P2-vivid','P3-vivid','S1-vivid','P1-pale','S1-pale','neutral-dark'],
  },
  {
    id: 'triadic-muted',
    label: 'Triadic · Muted Harmony',
    primaryType: 'triadic',
    primaryHueOffsets: [0, 120, 240],
    secondaryHueOffsets: [20, 345],
    secondaryChromaScale: 0.4,
    fillOrder: ['P1-vivid','P2-vivid','P3-vivid','S1-vivid','S2-vivid','P1-pale','P2-pale','P3-pale'],
  },
  {
    id: 'triadic-pure',
    label: 'Triadic · Pure',
    primaryType: 'triadic',
    primaryHueOffsets: [0, 120, 240],
    fillOrder: ['P1-vivid','P1-pale','P1-deep','P2-vivid','P2-pale','P3-vivid','P3-pale','P3-deep'],
  },

  // ── Analogous ─────────────────────────────────────────────────────────────
  {
    id: 'analogous-pop',
    label: 'Analogous + Pop',
    primaryType: 'analogous',
    primaryHueOffsets: [0, 22, 44],
    secondaryHueOffsets: [180],
    secondaryChromaScale: 1.0,
    fillOrder: ['neutral-light','P1-vivid','P2-vivid','P3-vivid','S1-vivid','P1-pale','S1-pale','neutral-dark'],
  },
  {
    id: 'analogous-cool-breath',
    label: 'Analogous + Cool Breath',
    primaryType: 'analogous',
    primaryHueOffsets: [0, 22, 44],
    secondaryHueOffsets: [175],
    secondaryChromaScale: 0.6,
    fillOrder: ['P1-vivid','P2-vivid','P3-vivid','S1-vivid','P1-pale','P2-pale','P3-pale','S1-pale'],
  },
  {
    id: 'analogous-warm-pop',
    label: 'Analogous Cool + Warm Pop',
    primaryType: 'analogous',
    primaryHueOffsets: [0, 22, 44],
    secondaryHueOffsets: [155],
    secondaryChromaScale: 1.0,
    fillOrder: ['neutral-light','P1-vivid','P2-vivid','P3-vivid','S1-vivid','P1-pale','S1-pale','neutral-dark'],
  },
  {
    id: 'analogous-pure',
    label: 'Analogous · Pure',
    primaryType: 'analogous',
    primaryHueOffsets: [0, 30, 55],
    fillOrder: ['P1-vivid','P2-vivid','P3-vivid','P1-pale','P1-deep','P2-pale','P2-deep','P3-pale'],
  },

  // ── Complementary ─────────────────────────────────────────────────────────
  {
    id: 'comp-cluster',
    label: 'Complementary + Cluster',
    primaryType: 'complementary',
    primaryHueOffsets: [0, 180],
    secondaryHueOffsets: [25, 335],
    secondaryChromaScale: 1.0,
    fillOrder: ['neutral-light','P1-vivid','P2-vivid','S1-vivid','S2-vivid','P1-pale','P2-pale','neutral-dark'],
  },
  {
    id: 'comp-quartet',
    label: 'Double Complement · Quartet',
    primaryType: 'complementary',
    primaryHueOffsets: [0, 180],
    secondaryHueOffsets: [90, 270],
    secondaryChromaScale: 1.0,
    fillOrder: ['neutral-light','P1-vivid','P2-vivid','S1-vivid','S2-vivid','P1-pale','P2-pale','S1-pale'],
  },
  {
    id: 'comp-pure',
    label: 'Complementary · Pure',
    primaryType: 'complementary',
    primaryHueOffsets: [0, 180],
    fillOrder: ['P1-vivid','P1-pale','P1-deep','P2-vivid','P2-pale','P2-deep','P1-pale','P2-pale'],
  },

  // ── Split-Complementary ───────────────────────────────────────────────────
  {
    id: 'split-warm',
    label: 'Split-Comp + Warm',
    primaryType: 'split-comp',
    primaryHueOffsets: [0, 150, 210],
    secondaryHueOffsets: [25],
    secondaryChromaScale: 1.0,
    fillOrder: ['neutral-light','P1-vivid','P2-vivid','P3-vivid','S1-vivid','P1-pale','P1-deep','neutral-dark'],
  },
  {
    id: 'split-spectrum',
    label: 'Split-Comp · Full Spectrum',
    primaryType: 'split-comp',
    primaryHueOffsets: [0, 150, 210],
    secondaryHueOffsets: [175, 235],
    secondaryChromaScale: 1.0,
    fillOrder: ['P1-vivid','P2-vivid','P3-vivid','S1-vivid','S2-vivid','P1-pale','P2-pale','P3-pale'],
  },
  {
    id: 'split-pure',
    label: 'Split-Comp · Pure',
    primaryType: 'split-comp',
    primaryHueOffsets: [0, 150, 210],
    fillOrder: ['P1-vivid','P1-pale','P2-vivid','P2-pale','P3-vivid','P3-pale','P1-deep','P2-deep'],
  },

  // ── Monochromatic ─────────────────────────────────────────────────────────
  {
    id: 'mono-burst',
    label: 'Mono + Burst',
    primaryType: 'mono',
    primaryHueOffsets: [0],
    secondaryHueOffsets: [150, 210],
    secondaryChromaScale: 1.0,
    fillOrder: ['neutral-light','P1-pale','P1-vivid','P1-deep','S1-vivid','S2-vivid','P1-pale','neutral-dark'],
  },
  {
    id: 'mono-bridge',
    label: 'Mono · Warm-Cool Bridge',
    primaryType: 'mono',
    primaryHueOffsets: [0],
    secondaryHueOffsets: [90, 270],
    secondaryChromaScale: 1.0,
    fillOrder: ['P1-pale','P1-vivid','P1-deep','S1-vivid','S2-vivid','S1-pale','S2-pale','P1-pale'],
  },
  {
    id: 'mono-rich',
    label: 'Mono · Rich',
    primaryType: 'mono',
    primaryHueOffsets: [0],
    monoLadder: true,
    // fillOrder is formally all P1-vivid; monoLadder overrides L/C with an even spread
    fillOrder: ['P1-vivid','P1-vivid','P1-vivid','P1-vivid','P1-vivid','P1-vivid','P1-vivid','P1-vivid'],
  },

  // ── Tetradic ──────────────────────────────────────────────────────────────
  {
    id: 'tet-balance',
    label: 'Tetradic + Balance',
    primaryType: 'tetradic',
    primaryHueOffsets: [0, 90, 180, 270],
    fillOrder: ['neutral-light','P1-vivid','P2-vivid','P3-vivid','P4-vivid','P1-pale','P3-pale','neutral-dark'],
  },
  {
    id: 'tet-rhythmic',
    label: 'Square · Rhythmic',
    primaryType: 'tetradic',
    primaryHueOffsets: [0, 90, 180, 270],
    minCount: 5,
    fillOrder: ['P1-vivid','P1-deep','P2-vivid','P2-deep','P3-vivid','P3-deep','P4-vivid','P4-deep'],
  },
  {
    id: 'tet-pure',
    label: 'Tetradic · Pure',
    primaryType: 'tetradic',
    primaryHueOffsets: [0, 90, 180, 270],
    minCount: 5,
    fillOrder: ['P1-vivid','P1-pale','P2-vivid','P2-pale','P3-vivid','P3-pale','P4-vivid','P4-pale'],
  },

  // ── Compound ──────────────────────────────────────────────────────────────
  {
    id: 'comp-depth',
    label: 'Compound + Depth',
    primaryType: 'compound',
    primaryHueOffsets: [0, 25, 180, 205],
    fillOrder: ['neutral-light','P1-vivid','P2-vivid','P3-vivid','P4-vivid','P1-deep','P3-deep','neutral-dark'],
  },
  {
    id: 'comp-soft',
    label: 'Compound · Soft',
    primaryType: 'compound',
    primaryHueOffsets: [0, 25, 180, 205],
    fillOrder: ['neutral-light','P1-pale','P2-pale','P3-pale','P4-pale','P1-vivid','P1-pale','P2-pale'],
  },
  {
    id: 'comp-compound',
    label: 'Compound · Pure',
    primaryType: 'compound',
    primaryHueOffsets: [0, 30, 180, 210],
    fillOrder: ['P1-vivid','P2-vivid','P3-vivid','P4-vivid','P1-pale','P2-pale','P3-pale','P4-pale'],
  },

  // ── Special / Vibe ────────────────────────────────────────────────────────
  {
    id: 'jewel-tones',
    label: 'Jewel Tones',
    primaryType: 'special',
    primaryHueOffsets: [0, 51, 102, 153],
    secondaryHueOffsets: [204, 255],
    vibeConstraint: { lRange: [0.42, 0.58], cRange: [0.22, 0.28] },
    fillOrder: ['P1-vivid','P2-vivid','P3-vivid','P4-vivid','S1-vivid','S2-vivid','P1-vivid','P2-vivid'],
  },
  {
    id: 'earth-palette',
    label: 'Earth Palette',
    primaryType: 'special',
    primaryHueOffsets: [0, 12, 24, 38],
    vibeConstraint: { lRange: [0.30, 0.78], cRange: [0.05, 0.13], hueRange: [15, 65] },
    fillOrder: ['P1-vivid','P2-vivid','P3-vivid','P4-vivid','P1-deep','P2-deep','P1-pale','P2-pale'],
  },
  {
    id: 'pastel-cloud',
    label: 'Pastel Cloud',
    primaryType: 'special',
    primaryHueOffsets: [0, 51, 102, 153],
    secondaryHueOffsets: [204, 255],
    vibeConstraint: { lRange: [0.84, 0.93], cRange: [0.04, 0.08] },
    fillOrder: ['neutral-light','P1-pale','P2-pale','P3-pale','P4-pale','S1-pale','S2-pale','P1-pale'],
  },
]
