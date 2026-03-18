export type HarmonyModel =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'split'
  | 'tetradic'
  | 'square'

export interface HarmonyInfo {
  name: string
  description: string
  /** Hue rotation angles (degrees) from primary to derive harmony colors */
  angles: number[]
}

export const HARMONY_MODELS: Record<HarmonyModel, HarmonyInfo> = {
  complementary: {
    name: 'Complementary',
    description:
      'Two colors directly opposite on the color wheel (180°). Creates maximum contrast and vibrant tension. Use primary for dominant surfaces, complement for accents and CTAs.',
    angles: [180],
  },
  analogous: {
    name: 'Analogous',
    description:
      'Three colors adjacent on the wheel (±30°). Produces serene, harmonious palettes found in nature. Minimal contrast — ideal for calm, focused interfaces.',
    angles: [-30, 30],
  },
  triadic: {
    name: 'Triadic',
    description:
      'Three colors evenly spaced (120° apart). Balanced yet vibrant. All three colors carry equal visual weight — use one dominant, two as accents.',
    angles: [120, 240],
  },
  split: {
    name: 'Split-Complementary',
    description:
      'Primary plus two colors flanking its complement (150° & 210°). Softer than complementary but retains strong contrast. More versatile for UI systems.',
    angles: [150, 210],
  },
  tetradic: {
    name: 'Tetradic',
    description:
      'Four colors forming a rectangle on the wheel (60°, 180°, 240°). Rich and complex. Works best with one dominant color and the others as supporting roles.',
    angles: [60, 180, 240],
  },
  square: {
    name: 'Square',
    description:
      'Four colors evenly spaced at 90° intervals. Maximum variety with even balance. Challenging to execute — keep saturation consistent for cohesion.',
    angles: [90, 180, 270],
  },
}

export type NeutralTint = 'pure' | 'warm' | 'cool' | 'tinted'

export type SubBrandMode = 'auto-harmony' | 'auto-secondary' | 'manual'

export interface ColorblindSimulation {
  normal: string
  deuteranopia: string
  protanopia: string
  tritanopia: string
}
