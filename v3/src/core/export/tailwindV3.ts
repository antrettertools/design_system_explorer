import type { TokenMap, ExportOptions } from './types'

export function formatTailwindV3(tokens: TokenMap, _opts: ExportOptions = {}): string {
  const colors: Record<string, string> = {}
  const fontSizes: Record<string, string> = {}
  const spacing: Record<string, string> = {}
  const boxShadow: Record<string, string> = {}
  const borderRadius: Record<string, string> = {}
  const transitionDuration: Record<string, string> = {}

  for (const [key, value] of Object.entries(tokens.light)) {
    if (key.startsWith('--color-')) {
      const name = key.slice('--color-'.length)
      colors[name] = `var(${key})`
    } else if (key.startsWith('--font-size-')) {
      const name = key.slice('--font-size-'.length)
      fontSizes[name] = value
    } else if (key.startsWith('--spacing-')) {
      const name = key.slice('--spacing-'.length)
      spacing[name] = value
    } else if (key.startsWith('--shadow-')) {
      const name = key.slice('--shadow-'.length)
      boxShadow[name] = value
    } else if (key.startsWith('--radius-')) {
      const name = key.slice('--radius-'.length)
      borderRadius[name] = value
    } else if (key.startsWith('--duration-')) {
      const name = key.slice('--duration-'.length)
      transitionDuration[name] = value
    }
  }

  const obj = {
    theme: {
      extend: {
        colors,
        fontSize: fontSizes,
        spacing,
        boxShadow,
        borderRadius,
        transitionDuration,
      },
    },
  }

  return `/** @type {import('tailwindcss').Config} */\nmodule.exports = ${JSON.stringify(obj, null, 2)}`
}
