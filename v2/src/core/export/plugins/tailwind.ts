import type { ExportPlugin, ExportInput } from '../plugin'
import { SHADE_STEPS } from '@/core/tokens/types'

export const tailwindPlugin: ExportPlugin = {
  id: 'tailwind',
  label: 'Tailwind Config',
  filename: 'tailwind.config.js',
  language: 'js',
  description: 'Tailwind CSS theme.extend block. Paste into your tailwind.config.js.',
  generate({ primitive, semantic, meta }: ExportInput): string {
    const primaryScale = shadeScaleToTailwind(primitive.primary.scale)
    const secondaryScale = primitive.secondary ? shadeScaleToTailwind(primitive.secondary.scale) : null

    const accentColors = primitive.accents.reduce<Record<string, unknown>>((acc, a, i) => {
      acc[`accent${i + 1}`] = shadeScaleToTailwind(a.scale)
      return acc
    }, {})

    const headingFonts = meta.fontPairing.heading.split(',').map(f => `'${f.trim()}'`).join(', ')
    const bodyFonts = meta.fontPairing.body.split(',').map(f => `'${f.trim()}'`).join(', ')

    const lines = [
      `/** @type {import('tailwindcss').Config} */`,
      `module.exports = {`,
      `  theme: {`,
      `    extend: {`,
      `      fontFamily: {`,
      `        heading: [${headingFonts}],`,
      `        body: [${bodyFonts}],`,
      `        sans: [${bodyFonts}],`,
      `      },`,
      `      colors: {`,
      `        primary: {`,
      ...Object.entries(primaryScale).map(([k, v]) => `          '${k}': '${v}',`),
      `        },`,
      ...(secondaryScale
        ? [
            `        secondary: {`,
            ...Object.entries(secondaryScale).map(([k, v]) => `          '${k}': '${v}',`),
            `        },`,
          ]
        : []),
      ...Object.entries(accentColors).map(([name, obj]) => {
        const entries = Object.entries(obj as Record<string, string>)
        return [
          `        ${name}: {`,
          ...entries.map(([k, v]) => `          '${k}': '${v}',`),
          `        },`,
        ].join('\n')
      }),
      `        // Semantic roles (light mode)`,
      ...Object.entries(semantic).map(([role, val]) => `        '${role}': '${val.light}',`),
      `      },`,
      `    },`,
      `  },`,
      `}`,
    ]

    return lines.join('\n')
  },
}

function shadeScaleToTailwind(scale: Record<number, string>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const step of SHADE_STEPS) {
    out[String(step)] = scale[step]
  }
  return out
}
