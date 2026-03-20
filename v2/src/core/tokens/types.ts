// Shade scale
export type ShadeStep = 50|100|200|300|400|500|600|700|800|900|950
export const SHADE_STEPS: ShadeStep[] = [50,100,200,300,400,500,600,700,800,900,950]
export type ShadeScale = Record<ShadeStep, string>

// Primitive layer
export interface LockedColor { hex: string; name: string; oklch: { l: number; c: number; h: number } }
export interface PrimitiveTokens {
  primary: { color: LockedColor; scale: ShadeScale }
  secondary: { color: LockedColor; scale: ShadeScale } | null
  accents: Array<{ color: LockedColor; scale: ShadeScale }>
  neutral: ShadeScale
  dataViz: DataVizColor[]
}

// Semantic layer — 42 roles, light + dark
export type SemanticRoleId =
  | 'interactive' | 'on-interactive' | 'interactive-container' | 'on-interactive-container'
  | 'interactive-subtle' | 'interactive-hover'
  | 'accent' | 'on-accent' | 'accent-container' | 'on-accent-container'
  | 'accent-subtle' | 'accent-hover'
  | 'background' | 'surface' | 'surface-raised' | 'surface-overlay'
  | 'on-background' | 'on-surface' | 'on-surface-subtle' | 'on-surface-disabled'
  | 'border' | 'border-strong' | 'scrim' | 'shadow-color'
  | 'inverse-surface' | 'on-inverse-surface'
  | 'error' | 'on-error' | 'error-container' | 'on-error-container'
  | 'warning' | 'on-warning' | 'warning-container' | 'on-warning-container'
  | 'success' | 'on-success' | 'success-container' | 'on-success-container'
  | 'info' | 'on-info' | 'info-container' | 'on-info-container'

export type SemanticTokens = Record<SemanticRoleId, { light: string; dark: string }>

// Component layer
export type ComponentTokens = Record<string, Record<string, string>>

// Data viz
export interface DataVizColor { name: string; dark: string; light: string; hue: number }

// Typography
export type FontCategory = 'sans' | 'serif' | 'mono'
export type FontSource = 'google' | 'fontshare' | 'system'
export interface FontAxisRange { min: number; max: number; default: number }
export type FontAxes = Partial<Record<string, FontAxisRange>>
export interface FontDefinition {
  name: string; category: FontCategory; source: FontSource
  variable: boolean; axes?: FontAxes; pairsWith?: string[]
}
export interface TypographyRole {
  fontFamily: string; fontStack: string; fontWeight: number
  lineHeight: number; letterSpacing: number
}
export type TypeScaleAlgorithm = 'linear' | 'modular' | 'fluid'
export type ModularRatio = 1.125|1.2|1.25|1.333|1.414|1.5|1.618
export interface TypeScale {
  xs: number; sm: number; base: number; md: number; lg: number
  xl: number; '2xl': number; '3xl': number; '4xl': number; '5xl': number
}

// Spacing
export type SpacingAlgorithm = 'linear' | 'modular' | 'tailwind'
export interface SpacingScale { [step: string]: number }
export interface RadiusScale { none:number; sm:number; base:number; md:number; lg:number; xl:number; full:number }
export interface ZIndexScale { base:number; raised:number; dropdown:number; sticky:number; modal:number; toast:number }
export interface Breakpoints { sm:number; md:number; lg:number; xl:number; '2xl':number }

// Shadow
export interface ShadowDef { x:number; y:number; blur:number; spread:number; color:string; opacity:number; inset:boolean }
export interface ElevationScale { none:ShadowDef; sm:ShadowDef; md:ShadowDef; lg:ShadowDef; xl:ShadowDef }
