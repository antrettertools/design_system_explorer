import type { ExportPlugin, ExportInput } from '../plugin'
import { SHADE_STEPS } from '@/core/tokens/types'

export const figmaTokensPlugin: ExportPlugin = {
  id: 'figma-tokens',
  label: 'Figma Tokens (Tokens Studio)',
  filename: 'figma-tokens.json',
  language: 'json',
  description: 'Tokens Studio JSON structure for Figma.',
  generate({ primitive, semantic }: ExportInput): string {
    const primaryColors: Record<string, unknown> = {}
    for (const step of SHADE_STEPS) {
      primaryColors[String(step)] = { $value: primitive.primary.scale[step], $type: 'color' }
    }

    const semanticColors: Record<string, unknown> = {}
    for (const [role, val] of Object.entries(semantic)) {
      semanticColors[role] = { $value: val.light, $type: 'color' }
    }

    return JSON.stringify({
      global: {
        color: {
          primary: primaryColors,
          semantic: semanticColors,
        },
      },
    }, null, 2)
  },
}
