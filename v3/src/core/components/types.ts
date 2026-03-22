export type ComponentName =
  | 'button' | 'input' | 'card' | 'badge' | 'tag' | 'tooltip' | 'alert'

/**
 * All CSS-variable-generating variant keys.
 * Required variants always exist; optional ones depend on palette slots.
 *
 * CSS var pattern: --component-{variant-key}-{token-key}
 * e.g. --component-button-secondary-bg, --component-badge-error-text
 */
export type RequiredVariantKey =
  | 'button' | 'button-secondary' | 'button-ghost' | 'button-destructive'
  | 'input'
  | 'card'
  | 'badge' | 'badge-neutral'
  | 'badge-error' | 'badge-warning' | 'badge-success' | 'badge-info'
  | 'tag' | 'tag-neutral'
  | 'tooltip' | 'tooltip-light'
  | 'alert'

export type OptionalVariantKey =
  | 'badge-secondary' | 'badge-accent-a' | 'badge-accent-b'
  | 'tag-secondary'   | 'tag-accent-a'   | 'tag-accent-b'

export type ComponentVariantKey = RequiredVariantKey | OptionalVariantKey

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

export type ComponentTokenMap =
  { [K in RequiredVariantKey]: ComponentTokenSet } &
  { [K in OptionalVariantKey]?: ComponentTokenSet }

export type IconLibraryName = 'lucide' | 'heroicons' | 'phosphor' | 'tabler' | 'radix'

export interface IconSizeMap {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
}

export interface IconLibraryMeta {
  name: IconLibraryName
  label: string
  packageName: string
  previewSlugs: string[]
}
