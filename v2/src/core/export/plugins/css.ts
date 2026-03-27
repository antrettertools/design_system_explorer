import type { ExportPlugin, ExportInput } from '../plugin'
import { converter } from 'culori'
import { SHADE_STEPS } from '@/core/tokens/types'

function toCssValue(hex: string, format: ExportInput['config']['colorFormat']): string {
  if (hex.startsWith('rgba') || hex.startsWith('oklch(')) return hex
  if (format === 'hex') return hex
  if (format === 'oklch') {
    const toOklch = converter('oklch')
    const c = toOklch(hex)
    if (!c) return hex
    return `oklch(${c.l.toFixed(4)} ${(c.c ?? 0).toFixed(4)} ${(c.h ?? 0).toFixed(2)})`
  }
  if (format === 'hsl') {
    const toHsl = converter('hsl')
    const c = toHsl(hex)
    if (!c) return hex
    return `hsl(${(c.h ?? 0).toFixed(1)} ${((c.s ?? 0) * 100).toFixed(1)}% ${((c.l ?? 0) * 100).toFixed(1)}%)`
  }
  // rgb
  const toRgb = converter('rgb')
  const c = toRgb(hex)
  if (!c) return hex
  return `rgb(${Math.round((c.r ?? 0) * 255)} ${Math.round((c.g ?? 0) * 255)} ${Math.round((c.b ?? 0) * 255)})`
}

export const cssPlugin: ExportPlugin = {
  id: 'css',
  label: 'CSS Custom Properties',
  filename: 'design-tokens.css',
  language: 'css',
  description: ':root declaration with semantic + primitive tokens.',
  generate({ primitive, semantic, config }: ExportInput): string {
    const p = config.prefix
    const fmt = (hex: string) => toCssValue(hex, config.colorFormat)
    const lines: string[] = [':root {']

    if (config.layers.primitives) {
      lines.push(`  /* Primary */`)
      for (const step of SHADE_STEPS) {
        lines.push(`  --${p}color-primary-${step}: ${fmt(primitive.primary.scale[step])};`)
      }
      if (primitive.secondary) {
        lines.push(`  /* Secondary */`)
        for (const step of SHADE_STEPS) {
          lines.push(`  --${p}color-secondary-${step}: ${fmt(primitive.secondary.scale[step])};`)
        }
      }
      primitive.accents.forEach((a, i) => {
        lines.push(`  /* Accent ${i + 1} */`)
        for (const step of SHADE_STEPS) {
          lines.push(`  --${p}color-accent${i + 1}-${step}: ${fmt(a.scale[step])};`)
        }
      })
      lines.push(`  /* Neutral */`)
      for (const step of SHADE_STEPS) {
        lines.push(`  --${p}color-neutral-${step}: ${fmt(primitive.neutral[step])};`)
      }
    }

    if (config.layers.semantic) {
      lines.push(`  /* Semantic Roles — Light Mode */`)
      for (const [role, val] of Object.entries(semantic)) {
        lines.push(`  --${p}color-${role}: ${fmt(val.light)};`)
      }
    }

    lines.push('}')

    if (config.layers.semantic && config.darkMode !== 'none') {
      const isDarkMedia = config.darkMode === 'media-query' || config.darkMode === 'both'
      const isDarkAttr = config.darkMode === 'data-theme' || config.darkMode === 'both'

      if (isDarkAttr) {
        lines.push(`\n[data-theme="dark"] {`)
        for (const [role, val] of Object.entries(semantic)) {
          lines.push(`  --${p}color-${role}: ${fmt(val.dark)};`)
        }
        lines.push('}')
      }

      if (isDarkMedia) {
        lines.push(`\n@media (prefers-color-scheme: dark) {`)
        lines.push(`  :root {`)
        for (const [role, val] of Object.entries(semantic)) {
          lines.push(`    --${p}color-${role}: ${fmt(val.dark)};`)
        }
        lines.push(`  }`)
        lines.push('}')
      }
    }

    return lines.join('\n')
  },
}
