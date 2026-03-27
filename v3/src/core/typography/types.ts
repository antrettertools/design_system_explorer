export type FontSource = 'google' | 'fontshare' | 'bunny'

export type HarmonyAffinity =
  | 'monochromatic'
  | 'analogous'
  | 'complementary'
  | 'split-complementary'
  | 'triadic'
  | 'tetradic'
  | 'compound'

export interface FontPairing {
  heading: string
  body: string
  source: FontSource
  character: 'editorial' | 'expressive' | 'technical' | 'geometric' | 'humanist'
  harmonyAffinity: HarmonyAffinity[]
}

export interface TypeScaleStep {
  size: number           // px
  weight: number         // 400, 500, 600, 700, 800, 900
  lineHeight: number     // multiplier, e.g. 1.55
  letterSpacing: string  // em value, e.g. "-0.03em"
  label: string          // "Display", "H1", etc.
}

export interface TypeScale {
  display: TypeScaleStep
  h1: TypeScaleStep
  h2: TypeScaleStep
  h3: TypeScaleStep
  h4: TypeScaleStep
  body: TypeScaleStep
  small: TypeScaleStep
  xs: TypeScaleStep
  label: TypeScaleStep
  _ratio: number         // internal — the ratio used (for tests + lock)
}
