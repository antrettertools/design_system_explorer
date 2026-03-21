// Harmony model names
export type HarmonyModelName =
  | 'monochromatic'
  | 'analogous'
  | 'complementary'
  | 'split-complementary'
  | 'triadic'
  | 'tetradic'
  | 'compound'

// OKLCH envelope: the L and C ranges a model samples from
export interface OklchEnvelope {
  lRange: [number, number]   // [min, max] lightness (0–1)
  cRange: [number, number]   // [min, max] chroma (0–0.4)
}

// Per-position envelope override (some models have different L/C for each hue position)
export interface HarmonyModelDef {
  hueOffsets: number[]        // Angles added to base hue for each additional color slot
  lRange: [number, number]
  cRange: [number, number]
  positionEnvelopes?: OklchEnvelope[]  // Per-position overrides (indexed to match hueOffsets)
  weight: number              // Relative random selection weight
  description: string
}

export const HARMONY_MODELS: Record<HarmonyModelName, HarmonyModelDef> = {
  monochromatic: {
    hueOffsets: [0, 0, 0],   // All same hue, L/C vary dramatically
    lRange: [0.3, 0.75],
    cRange: [0.08, 0.20],
    weight: 1.0,
    description: 'Sophisticated, premium',
  },
  analogous: {
    hueOffsets: [25, 45],
    lRange: [0.55, 0.70],
    cRange: [0.10, 0.18],
    weight: 1.2,
    description: 'Warm, cohesive, natural',
  },
  complementary: {
    hueOffsets: [180, 15, 195],
    lRange: [0.55, 0.70],
    cRange: [0.12, 0.22],
    positionEnvelopes: [
      { lRange: [0.55, 0.70], cRange: [0.16, 0.22] }, // base
      { lRange: [0.55, 0.70], cRange: [0.13, 0.18] }, // complement
      { lRange: [0.58, 0.68], cRange: [0.10, 0.16] }, // base variant
      { lRange: [0.58, 0.68], cRange: [0.10, 0.16] }, // complement variant
    ],
    weight: 1.0,
    description: 'High contrast, bold, energetic',
  },
  'split-complementary': {
    hueOffsets: [150, 210],
    lRange: [0.50, 0.70],
    cRange: [0.12, 0.20],
    positionEnvelopes: [
      { lRange: [0.50, 0.70], cRange: [0.15, 0.20] }, // base (highest C)
      { lRange: [0.55, 0.68], cRange: [0.12, 0.17] }, // split 1
      { lRange: [0.55, 0.68], cRange: [0.12, 0.17] }, // split 2
    ],
    weight: 1.4,
    description: 'Softer than complementary, very versatile',
  },
  triadic: {
    hueOffsets: [120, 240],
    lRange: [0.55, 0.70],
    cRange: [0.14, 0.20],
    weight: 1.0,
    description: 'Vibrant, playful, balanced',
  },
  tetradic: {
    hueOffsets: [90, 180, 270],
    lRange: [0.55, 0.68],
    cRange: [0.12, 0.18],
    weight: 0.7,
    description: 'Rich, complex',
  },
  compound: {
    hueOffsets: [25, 180, 205],
    lRange: [0.55, 0.70],
    cRange: [0.10, 0.22],
    positionEnvelopes: [
      { lRange: [0.55, 0.70], cRange: [0.10, 0.16] }, // base analogous
      { lRange: [0.55, 0.70], cRange: [0.10, 0.16] }, // analogous variant
      { lRange: [0.55, 0.65], cRange: [0.18, 0.22] }, // complementary accent
      { lRange: [0.55, 0.65], cRange: [0.18, 0.22] }, // complementary variant
    ],
    weight: 1.4,
    description: 'Sophisticated complexity',
  },
}

export const SHADE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const
export type ShadeStep = typeof SHADE_STEPS[number]
export type ShadeScale = Record<ShadeStep, string>  // hex values

export const COLOR_ROLES = ['brand', 'secondary', 'accentA', 'accentB'] as const
export type ColorRole = typeof COLOR_ROLES[number]

// A single color slot in the generator
export interface ColorSlot {
  id: string          // stable uuid — lock follows this id
  role: ColorRole
  hex: string
  locked: boolean
}
