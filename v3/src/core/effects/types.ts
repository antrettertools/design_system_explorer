export interface ShadowPresets {
  sm: string   // CSS box-shadow value
  md: string
  lg: string
  xl: string
}

export interface FocusRing {
  width: string     // e.g. "2px"
  color: string     // hex
  offset: string    // e.g. "2px"
  boxShadow: string // Ready-to-use CSS box-shadow for focus ring simulation
}

export type EasingName = 'easeIn' | 'easeOut' | 'easeInOut' | 'spring' | 'linear'
export type EasingMap = Record<EasingName, string>

export type DurationStep = 'fast' | 'normal' | 'moderate' | 'slow' | 'xslow'
export type DurationMap = Record<DurationStep, number>  // milliseconds

export interface MotionTokens {
  easings: EasingMap
  durations: DurationMap
  transitions: {
    fast: string    // CSS transition shorthand (e.g. "all 100ms ease-out")
    normal: string
    slow: string
  }
}

export interface EffectsConfig {
  shadows: ShadowPresets         // brand-tinted
  shadowsNeutral: ShadowPresets  // neutral grey (no color tint)
  focusRing: FocusRing
  motion: MotionTokens
}
