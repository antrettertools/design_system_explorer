import type { ExportPlugin, ExportInput } from '../plugin'
import { SHADE_STEPS } from '@/core/tokens/types'

export const scssPlugin: ExportPlugin = {
  id: 'scss',
  label: 'SCSS Variables',
  filename: 'design-tokens.scss',
  language: 'scss',
  description: 'SCSS variable declarations for all tokens.',
  generate({ primitive, semantic, config }: ExportInput): string {
    const p = config.prefix ? config.prefix.replace(/-$/, '') + '-' : ''
    const lines: string[] = ['// Design Tokens — SCSS Variables', '']

    if (config.layers.primitives) {
      lines.push('// Primitive scales')
      for (const step of SHADE_STEPS) {
        lines.push(`$${p}color-primary-${step}: ${primitive.primary.scale[step]};`)
      }
      if (primitive.secondary) {
        for (const step of SHADE_STEPS) {
          lines.push(`$${p}color-secondary-${step}: ${primitive.secondary.scale[step]};`)
        }
      }
      primitive.accents.forEach((a, i) => {
        for (const step of SHADE_STEPS) {
          lines.push(`$${p}color-accent${i + 1}-${step}: ${a.scale[step]};`)
        }
      })
    }

    if (config.layers.semantic) {
      lines.push('')
      lines.push('// Semantic roles (light mode)')
      for (const [role, val] of Object.entries(semantic)) {
        lines.push(`$${p}color-${role}: ${val.light};`)
      }
    }

    return lines.join('\n')
  },
}
