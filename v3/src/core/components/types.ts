export type ComponentName = 'button' | 'input' | 'card' | 'badge' | 'tag' | 'tooltip' | 'alert'

export type ComponentTokenSet = {
  bg: string
  bgHover: string
  text: string
  border: string
  radius: string
  shadow: string
  /** optional extra tokens per component */
  [key: string]: string
}

export type ComponentTokenMap = Record<ComponentName, ComponentTokenSet>

export type IconLibraryName = 'lucide' | 'heroicons' | 'phosphor' | 'tabler' | 'radix'

export interface IconSizeMap {
  xs: number   // px
  sm: number
  md: number
  lg: number
  xl: number
}

export interface IconLibraryMeta {
  name: IconLibraryName
  label: string
  packageName: string
  previewSlugs: string[]   // 24 SVG slug strings we inline-reference for preview
}
