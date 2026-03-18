import type { DesignTokens } from '../../tokens/types'
import type { ExportPlugin } from '../plugin'
import { SHADE_STEPS } from '../../tokens/types'

export const tailwindPlugin: ExportPlugin = {
  id: 'tailwind',
  label: 'Tailwind Config',
  filename: 'tailwind.config.js',
  language: 'js',
  description: 'Tailwind CSS theme.extend block. Paste into your tailwind.config.js.',
  generate(tokens: DesignTokens): string {
    const primaryScale = shadeScaleToTailwind(tokens.primaryBrand.scale)
    const secondaryScale = shadeScaleToTailwind(tokens.secondaryBrand.scale)

    const subBrandColors = tokens.subBrandColors.reduce<Record<string, unknown>>(
      (acc, sb, i) => {
        acc[`sub${i + 1}`] = {
          DEFAULT: sb.hex,
          ...shadeScaleToTailwind(sb.scale),
        }
        return acc
      },
      {},
    )

    const spacing = Object.entries(tokens.spacingScale).reduce<Record<string, string>>(
      (acc, [key, val]) => {
        const name = key.replace('space-', '')
        acc[name] = `${val}px`
        return acc
      },
      {},
    )

    const lines = [
      `/** @type {import('tailwindcss').Config} */`,
      `module.exports = {`,
      `  theme: {`,
      `    extend: {`,
      `      fontFamily: {`,
      `        heading: [${tokens.heading.fontStack.split(',').map(f => `'${f.trim()}'`).join(', ')}],`,
      `        body: [${tokens.body.fontStack.split(',').map(f => `'${f.trim()}'`).join(', ')}],`,
      `        sans: [${tokens.body.fontStack.split(',').map(f => `'${f.trim()}'`).join(', ')}],`,
      `      },`,
      `      fontSize: {`,
      ...Object.entries(tokens.typeScale).map(
        ([key, val]) => `        '${key}': ['${val}px', { lineHeight: '${tokens.lineHeight}' }],`,
      ),
      `      },`,
      `      colors: {`,
      `        primary: {`,
      `          DEFAULT: '${tokens.primaryBrand.hex}',`,
      ...Object.entries(primaryScale).map(([k, v]) => `          '${k}': '${v}',`),
      `        },`,
      `        secondary: {`,
      `          DEFAULT: '${tokens.secondaryBrand.hex}',`,
      ...Object.entries(secondaryScale).map(([k, v]) => `          '${k}': '${v}',`),
      `        },`,
      ...Object.entries(subBrandColors).map(([name, obj]) => {
        const entries = Object.entries(obj as Record<string, string>)
        return [
          `        ${name}: {`,
          ...entries.map(([k, v]) => `          '${k}': '${v}',`),
          `        },`,
        ].join('\n')
      }),
      `        success: '${tokens.stateColors.success}',`,
      `        warning: '${tokens.stateColors.warning}',`,
      `        error: '${tokens.stateColors.error}',`,
      `        info: '${tokens.stateColors.info}',`,
      `      },`,
      `      spacing: {`,
      ...Object.entries(spacing).map(([k, v]) => `        '${k}': '${v}',`),
      `      },`,
      `      borderRadius: {`,
      ...Object.entries(tokens.radiusScale).map(([k, v]) => {
        const cssVal = v === 9999 ? '9999px' : `${v}px`
        return `        '${k}': '${cssVal}',`
      }),
      `      },`,
      `      screens: {`,
      ...Object.entries(tokens.breakpoints).map(([k, v]) => `        '${k}': '${v}px',`),
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
