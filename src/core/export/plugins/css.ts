import type { DesignTokens } from '../../tokens/types'
import type { ExportPlugin } from '../plugin'
import { shadowToCss } from '../../shadow'
import { SHADE_STEPS } from '../../tokens/types'

export const cssPlugin: ExportPlugin = {
  id: 'css',
  label: 'CSS Custom Properties',
  filename: 'design-tokens.css',
  language: 'css',
  description: 'Flat :root declaration with all tokens as CSS custom properties.',
  generate(tokens: DesignTokens): string {
    const lines: string[] = [':root {']

    // ── Typography ──
    lines.push('  /* Typography — Heading */')
    lines.push(`  --font-heading: ${tokens.heading.fontStack};`)
    lines.push(`  --font-weight-heading: ${tokens.heading.fontWeight};`)
    lines.push(`  --line-height-heading: ${tokens.heading.lineHeight};`)
    lines.push(`  --letter-spacing-heading: ${tokens.heading.letterSpacing}em;`)
    lines.push('')
    lines.push('  /* Typography — Body */')
    lines.push(`  --font-body: ${tokens.body.fontStack};`)
    lines.push(`  --font-size-base: ${tokens.fontSize}px;`)
    lines.push(`  --font-weight-body: ${tokens.body.fontWeight};`)
    lines.push(`  --line-height-body: ${tokens.body.lineHeight};`)
    lines.push(`  --letter-spacing-body: ${tokens.body.letterSpacing}em;`)
    lines.push('')
    lines.push('  /* Typography — Legacy aliases */')
    lines.push(`  --font-primary: ${tokens.body.fontStack};`)

    // Type scale
    lines.push('')
    lines.push('  /* Type Scale */')
    for (const [key, val] of Object.entries(tokens.typeScale)) {
      lines.push(`  --text-${key}: ${val}px;`)
    }

    // ── Spacing ──
    lines.push('')
    lines.push('  /* Spacing */')
    for (const [key, val] of Object.entries(tokens.spacingScale)) {
      lines.push(`  --${key}: ${val}px;`)
    }

    // ── Border Radius ──
    lines.push('')
    lines.push('  /* Border Radius */')
    for (const [key, val] of Object.entries(tokens.radiusScale)) {
      const cssVal = val === 9999 ? '9999px' : `${val}px`
      lines.push(`  --radius-${key}: ${cssVal};`)
    }

    // ── Z-Index ──
    lines.push('')
    lines.push('  /* Z-Index */')
    for (const [key, val] of Object.entries(tokens.zIndexScale)) {
      lines.push(`  --z-${key}: ${val};`)
    }

    // ── Breakpoints ──
    lines.push('')
    lines.push('  /* Breakpoints */')
    for (const [key, val] of Object.entries(tokens.breakpoints)) {
      lines.push(`  --screen-${key}: ${val}px;`)
    }

    // ── Colors — Brand ──
    lines.push('')
    lines.push('  /* Primary Brand */')
    lines.push(`  --color-primary: ${tokens.primaryBrand.hex};`)
    for (const step of SHADE_STEPS) {
      lines.push(`  --color-primary-${step}: ${tokens.primaryBrand.scale[step]};`)
    }

    lines.push('')
    lines.push('  /* Secondary Brand */')
    lines.push(`  --color-secondary: ${tokens.secondaryBrand.hex};`)
    for (const step of SHADE_STEPS) {
      lines.push(`  --color-secondary-${step}: ${tokens.secondaryBrand.scale[step]};`)
    }

    // ── Sub-Brand Colors ──
    lines.push('')
    lines.push('  /* Sub-Brand Colors */')
    tokens.subBrandColors.forEach((sb, i) => {
      const key = `sub${i + 1}`
      lines.push(`  --color-${key}: ${sb.hex};`)
      for (const step of SHADE_STEPS) {
        lines.push(`  --color-${key}-${step}: ${sb.scale[step]};`)
      }
    })

    // ── State Colors ──
    lines.push('')
    lines.push('  /* State Colors */')
    for (const [key, val] of Object.entries(tokens.stateColors)) {
      lines.push(`  --color-${key}: ${val};`)
    }
    for (const [stateKey, scale] of Object.entries(tokens.stateScales)) {
      for (const step of SHADE_STEPS) {
        lines.push(`  --color-${stateKey}-${step}: ${(scale as Record<number, string>)[step]};`)
      }
    }

    // ── Neutral ──
    lines.push('')
    lines.push(`  /* Neutral Scale (${tokens.neutral.tint} tint) */`)
    for (const step of SHADE_STEPS) {
      lines.push(`  --color-neutral-${step}: ${tokens.neutral.scale[step]};`)
    }

    // ── Data Viz ──
    lines.push('')
    lines.push('  /* Data Visualization Palette */')
    tokens.dataVizPalette.forEach((color, i) => {
      const key = `viz-${i + 1}`
      lines.push(`  --color-${key}: ${color.dark};`)
      lines.push(`  --color-${key}-dark: ${color.dark};`)
      lines.push(`  --color-${key}-light: ${color.light};`)
    })

    // ── Shadows / Elevation ──
    lines.push('')
    lines.push('  /* Elevation */')
    for (const [key, shadow] of Object.entries(tokens.elevation)) {
      lines.push(`  --shadow-${key}: ${shadowToCss(shadow)};`)
    }

    lines.push('}')
    return lines.join('\n')
  },
}
