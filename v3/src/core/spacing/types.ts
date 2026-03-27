export interface SpacingScale {
  xs: number   // px
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
  '3xl': number
}

export interface RadiusScale {
  none: number
  sm: number
  md: number
  lg: number
  xl: number
  full: number
}

export interface IconSizes {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
}

export type ZIndexLayer = 'base' | 'raised' | 'dropdown' | 'sticky' | 'overlay' | 'modal' | 'toast'
export type ZIndexMap = Record<ZIndexLayer, number>

export type BreakpointName = 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type BreakpointMap = Record<BreakpointName, number>

export interface SpacingConfig {
  baseUnit: number       // 4 or 8 (px)
  scale: SpacingScale
  radius: RadiusScale
  iconSizes: IconSizes
  borderWidths: number[]
  opacityScale: number[]
  zIndex: ZIndexMap
  breakpoints: BreakpointMap
}
