import type { ShadowDef, ElevationScale } from '../tokens/types'

export const SHADOW_PRESETS: Record<string, ShadowDef> = {
  none: { x: 0, y: 0, blur: 0, spread: 0, color: '#000000', opacity: 0, inset: false },
  low: { x: 0, y: 1, blur: 4, spread: 0, color: '#000000', opacity: 0.18, inset: false },
  medium: { x: 0, y: 4, blur: 16, spread: 0, color: '#000000', opacity: 0.28, inset: false },
  high: { x: 0, y: 8, blur: 32, spread: 0, color: '#000000', opacity: 0.38, inset: false },
  overlay: { x: 0, y: 16, blur: 64, spread: 0, color: '#000000', opacity: 0.48, inset: false },
  inner: { x: 0, y: 2, blur: 8, spread: -2, color: '#000000', opacity: 0.28, inset: true },
}

/**
 * Generates an elevation scale from a custom base shadow.
 * The custom shadow defines the "medium" (md) elevation.
 * Other levels are derived by scaling Y, blur, and opacity.
 */
export function buildElevationScale(baseShadow: ShadowDef): ElevationScale {
  const { color } = baseShadow

  return {
    none: { x: 0, y: 0, blur: 0, spread: 0, color, opacity: 0, inset: false },
    sm: { x: 0, y: 1, blur: 4, spread: 0, color, opacity: baseShadow.opacity * 0.6, inset: false },
    md: { ...baseShadow },
    lg: {
      x: baseShadow.x,
      y: baseShadow.y * 2,
      blur: baseShadow.blur * 2,
      spread: baseShadow.spread,
      color,
      opacity: Math.min(1, baseShadow.opacity * 1.3),
      inset: false,
    },
    xl: {
      x: baseShadow.x,
      y: baseShadow.y * 4,
      blur: baseShadow.blur * 4,
      spread: baseShadow.spread,
      color,
      opacity: Math.min(1, baseShadow.opacity * 1.6),
      inset: false,
    },
  }
}

/**
 * Converts a ShadowDef to a CSS box-shadow value string.
 */
export function shadowToCss(shadow: ShadowDef): string {
  if (shadow.opacity === 0) return 'none'

  const rgb = hexToRgb(shadow.color)
  const prefix = shadow.inset ? 'inset ' : ''

  return `${prefix}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px rgba(${rgb}, ${shadow.opacity})`
}

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '')
  const n = parseInt(clean, 16)
  const r = (n >> 16) & 0xff
  const g = (n >> 8) & 0xff
  const b = n & 0xff
  return `${r}, ${g}, ${b}`
}
