import type { ExportPlugin, ExportInput } from '../plugin'
import { SHADE_STEPS } from '@/core/tokens/types'

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
  generate({ primitive, semantic }: ExportInput): string {
    const out: Record<string, unknown> = {
      $schema: 'https://design-tokens.github.io/community-group/format/',
      color: {
        $description: 'Color tokens',
        primary: {
          $description: `Primary brand color`,
          ...shadeScaleToDtcg(primitive.primary.scale),
        },
        ...(primitive.secondary
          ? {
              secondary: {
                $description: `Secondary brand color`,
                ...shadeScaleToDtcg(primitive.secondary.scale),
              },
            }
          : {}),
        ...Object.fromEntries(
          primitive.accents.map((a, i) => [
            `accent${i + 1}`,
            {
              $description: `Accent color ${i + 1}`,
              ...shadeScaleToDtcg(a.scale),
            },
          ]),
        ),
        neutral: {
          $description: 'Neutral scale',
          ...shadeScaleToDtcg(primitive.neutral),
        },
        semantic: {
          $description: 'Semantic color roles',
          ...Object.fromEntries(
            Object.entries(semantic).map(([role, val]) => [
              role,
              {
                light: dtcgToken(val.light, 'color'),
                dark: dtcgToken(val.dark, 'color'),
              },
            ]),
          ),
        },
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
