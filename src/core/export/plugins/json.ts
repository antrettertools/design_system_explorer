import type { DesignTokens } from '../../tokens/types'
import type { ExportPlugin } from '../plugin'
import { SHADE_STEPS } from '../../tokens/types'

export const jsonPlugin: ExportPlugin = {
  id: 'json',
  label: 'JSON Design Tokens',
  filename: 'design-tokens.json',
  language: 'json',
  description: 'All tokens in a flat JSON object. Import/export format for TYPESET.',
  generate(tokens: DesignTokens): string {
    const out: Record<string, unknown> = {
      typography: {
        fontFamily: tokens.fontFamily,
        fontCategory: tokens.fontCategory,
        fontSize: tokens.fontSize,
        fontWeight: tokens.fontWeight,
        lineHeight: tokens.lineHeight,
        letterSpacing: tokens.letterSpacing,
        typeScale: tokens.typeScale,
      },
      spacing: tokens.spacingScale,
      radius: tokens.radiusScale,
      zIndex: tokens.zIndexScale,
      breakpoints: tokens.breakpoints,
      colors: {
        primary: {
          base: tokens.primaryBrand.hex,
          name: tokens.primaryBrand.name,
          scale: scaleToObj(tokens.primaryBrand.scale),
        },
        secondary: {
          base: tokens.secondaryBrand.hex,
          name: tokens.secondaryBrand.name,
          scale: scaleToObj(tokens.secondaryBrand.scale),
        },
        subBrand: tokens.subBrandColors.map((sb) => ({
          name: sb.name,
          base: sb.hex,
          mode: sb.mode,
          scale: scaleToObj(sb.scale),
        })),
        state: {
          success: tokens.stateColors.success,
          warning: tokens.stateColors.warning,
          error: tokens.stateColors.error,
          info: tokens.stateColors.info,
        },
        neutral: {
          tint: tokens.neutral.tint,
          scale: scaleToObj(tokens.neutral.scale),
        },
        dataViz: tokens.dataVizPalette.map((c) => ({
          name: c.name,
          dark: c.dark,
          light: c.light,
          hue: c.hue,
        })),
      },
      elevation: tokens.elevation,
    }

    return JSON.stringify(out, null, 2)
  },
}

function scaleToObj(scale: Record<number, string>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const step of SHADE_STEPS) {
    out[String(step)] = scale[step]
  }
  return out
}
