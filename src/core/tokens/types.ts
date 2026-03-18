// ─────────────────────────────────────────────────────────────
//  TYPESET — Design Token Types
//  This is the single source of truth for the token schema.
//  All features write to slices of this shape.
//  All export plugins receive a value of type DesignTokens.
// ─────────────────────────────────────────────────────────────

// ── Primitive value types ──────────────────────────────────────

export type HexColor = string // '#rrggbb'
export type CssValue = string // '16px', '1.5', '0em'

// ── Shade scale ────────────────────────────────────────────────

export type ShadeStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950
export const SHADE_STEPS: ShadeStep[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
export type ShadeScale = Record<ShadeStep, HexColor>

// ── Color Layers ───────────────────────────────────────────────

/** A single named brand color with its full shade scale */
export interface BrandColor {
  name: string
  hex: HexColor
  scale: ShadeScale
}

/**
 * A sub-brand color slot. Can be auto-derived from the primary using
 * color theory, or set manually by the designer.
 */
export interface SubBrandColor {
  name: string
  hex: HexColor
  scale: ShadeScale
  /** How this color was determined */
  mode: 'auto-harmony' | 'auto-secondary' | 'manual'
}

/**
 * A single entry in the data viz palette.
 * Generated in OKLCH space for perceptual equality across entries.
 */
export interface DataVizColor {
  name: string
  /** Optimized for dark backgrounds (higher L in OKLCH) */
  dark: HexColor
  /** Optimized for light backgrounds (lower L, higher C) */
  light: HexColor
  /** Hue angle in degrees (0–360) */
  hue: number
}

/** Semantic state colors */
export interface StateColors {
  success: HexColor
  warning: HexColor
  error: HexColor
  info: HexColor
}

/** Full neutral scale */
export interface NeutralPalette {
  tint: 'pure' | 'warm' | 'cool' | 'tinted'
  scale: ShadeScale
}

// ── Typography ────────────────────────────────────────────────

export type FontCategory = 'sans' | 'serif' | 'mono'
export type FontSource = 'google' | 'fontshare' | 'system'

/**
 * Per-role typography settings. Heading and body each have their own
 * font family, weight, line-height and tracking.
 */
export interface TypographyRole {
  fontFamily: string
  fontStack: string     // e.g. "'Fraunces', Georgia, serif"
  fontWeight: number
  lineHeight: number
  letterSpacing: number // em
}

export interface FontAxisRange {
  min: number
  max: number
  default: number
}

export type FontAxes = Partial<Record<string, FontAxisRange>>

export interface FontDefinition {
  name: string
  category: FontCategory
  source: FontSource
  variable: boolean
  axes?: FontAxes
  pairsWith?: string[]
}

export type TypeScaleAlgorithm = 'linear' | 'modular' | 'fluid'
export type ModularRatio =
  | 1.125 // Major Second
  | 1.2   // Minor Third
  | 1.25  // Major Third
  | 1.333 // Perfect Fourth
  | 1.414 // Augmented Fourth
  | 1.5   // Perfect Fifth
  | 1.618 // Golden Ratio

export interface TypeScale {
  xs: number
  sm: number
  base: number
  md: number
  lg: number
  xl: number
  '2xl': number
  '3xl': number
  '4xl': number
  '5xl': number
}

// ── Spacing ───────────────────────────────────────────────────

export type SpacingAlgorithm = 'linear' | 'modular' | 'tailwind'

export interface SpacingScale {
  [step: string]: number // px value
}

export interface RadiusScale {
  none: number
  sm: number
  base: number
  md: number
  lg: number
  xl: number
  full: number
}

export interface ZIndexScale {
  base: number
  raised: number
  dropdown: number
  sticky: number
  modal: number
  toast: number
}

export interface Breakpoints {
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
}

// ── Shadows ───────────────────────────────────────────────────

export interface ShadowDef {
  x: number
  y: number
  blur: number
  spread: number
  color: HexColor
  opacity: number
  inset: boolean
}

export interface ElevationScale {
  none: ShadowDef
  sm: ShadowDef
  md: ShadowDef
  lg: ShadowDef
  xl: ShadowDef
}

// ── Components ────────────────────────────────────────────────

export type ButtonStyle = 'filled' | 'outline' | 'ghost'
export type ComponentSize = 'sm' | 'md' | 'lg'

// ── Root DesignTokens ─────────────────────────────────────────

/**
 * The complete design token set.
 * This is what every export plugin receives.
 * It is computed fresh from the store on every relevant state change.
 */
export interface DesignTokens {
  // Color
  primaryBrand: BrandColor
  secondaryBrand: BrandColor
  subBrandColors: SubBrandColor[]
  dataVizPalette: DataVizColor[]
  stateColors: StateColors
  stateScales: Record<keyof StateColors, ShadeScale>
  neutral: NeutralPalette

  // Typography — dual font roles
  heading: TypographyRole
  body: TypographyRole

  // Backward-compat aliases (point to body role)
  fontFamily: string
  fontCategory: FontCategory
  fontWeight: number
  fontSize: number
  lineHeight: number
  letterSpacing: number
  typeScale: TypeScale

  // Spacing
  spacingBase: number
  spacingScale: SpacingScale
  radiusScale: RadiusScale
  zIndexScale: ZIndexScale
  breakpoints: Breakpoints

  // Shadows
  elevation: ElevationScale
}
