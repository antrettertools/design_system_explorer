import type { DesignTokens } from '../../tokens/types'
import type { ExportPlugin } from '../plugin'
import { SHADE_STEPS } from '../../tokens/types'
import { shadowToCss } from '../../shadow'

/**
 * W3C Design Token Community Group (DTCG) format.
 * https://design-tokens.github.io/community-group/format/
 *
 * Each token is an object with `$value` and `$type`.
 * Groups are nested objects without a `$` prefix.
 */
export const w3cPlugin: ExportPlugin = {
  id: 'w3c',
  label: 'W3C Design Tokens',
  filename: 'tokens.w3c.json',
  language: 'json',
  description:
    'W3C Design Token Community Group (DTCG) format. Compatible with Style Dictionary, Tokens Studio, and other DTCG-compliant tools.',
  generate(tokens: DesignTokens): string {
    const out: Record<string, unknown> = {
      $schema: 'https://design-tokens.github.io/community-group/format/',
      typography: {
        $description: 'Typography tokens',
        fontFamily: dtcgToken(tokens.fontFamily, 'fontFamily'),
        fontSize: dtcgToken(`${tokens.fontSize}px`, 'dimension'),
        fontWeight: dtcgToken(tokens.fontWeight, 'number'),
        lineHeight: dtcgToken(tokens.lineHeight, 'number'),
        letterSpacing: dtcgToken(`${tokens.letterSpacing}em`, 'dimension'),
        scale: Object.fromEntries(
          Object.entries(tokens.typeScale).map(([k, v]) => [k, dtcgToken(`${v}px`, 'dimension')]),
        ),
      },
      spacing: {
        $description: 'Spacing scale',
        ...Object.fromEntries(
          Object.entries(tokens.spacingScale).map(([k, v]) => [k, dtcgToken(`${v}px`, 'dimension')]),
        ),
      },
      borderRadius: {
        $description: 'Border radius scale',
        ...Object.fromEntries(
          Object.entries(tokens.radiusScale).map(([k, v]) => [
            k,
            dtcgToken(v === 9999 ? '9999px' : `${v}px`, 'dimension'),
          ]),
        ),
      },
      color: {
        $description: 'Color tokens',
        primary: {
          $description: `Primary brand color — ${tokens.primaryBrand.name}`,
          DEFAULT: dtcgToken(tokens.primaryBrand.hex, 'color'),
          ...shadeScaleToDtcg(tokens.primaryBrand.scale),
        },
        secondary: {
          $description: `Secondary brand color — ${tokens.secondaryBrand.name}`,
          DEFAULT: dtcgToken(tokens.secondaryBrand.hex, 'color'),
          ...shadeScaleToDtcg(tokens.secondaryBrand.scale),
        },
        ...Object.fromEntries(
          tokens.subBrandColors.map((sb, i) => [
            `sub${i + 1}`,
            {
              $description: `Sub-brand color ${i + 1} — ${sb.name} (${sb.mode})`,
              DEFAULT: dtcgToken(sb.hex, 'color'),
              ...shadeScaleToDtcg(sb.scale),
            },
          ]),
        ),
        state: {
          success: dtcgToken(tokens.stateColors.success, 'color'),
          warning: dtcgToken(tokens.stateColors.warning, 'color'),
          error: dtcgToken(tokens.stateColors.error, 'color'),
          info: dtcgToken(tokens.stateColors.info, 'color'),
        },
        neutral: {
          $description: `Neutral scale (${tokens.neutral.tint} tint)`,
          ...shadeScaleToDtcg(tokens.neutral.scale),
        },
        dataViz: {
          $description: 'Data visualization palette — OKLCH perceptually equidistant',
          ...Object.fromEntries(
            tokens.dataVizPalette.map((c, i) => [
              `series${i + 1}`,
              {
                $description: c.name,
                dark: dtcgToken(c.dark, 'color'),
                light: dtcgToken(c.light, 'color'),
              },
            ]),
          ),
        },
      },
      shadow: {
        $description: 'Elevation / shadow tokens',
        ...Object.fromEntries(
          Object.entries(tokens.elevation).map(([k, v]) => [
            k,
            dtcgToken(shadowToCss(v), 'shadow'),
          ]),
        ),
      },
    }

    return JSON.stringify(out, null, 2)
  },
}

function dtcgToken(value: unknown, type: string): Record<string, unknown> {
  return { $value: value, $type: type }
}

function shadeScaleToDtcg(scale: Record<number, string>): Record<string, Record<string, unknown>> {
  const out: Record<string, Record<string, unknown>> = {}
  for (const step of SHADE_STEPS) {
    out[String(step)] = dtcgToken(scale[step], 'color')
  }
  return out
}
