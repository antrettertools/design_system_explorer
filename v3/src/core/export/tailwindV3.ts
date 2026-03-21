import type { TokenMap, ExportOptions } from './types'

export function formatTailwindV3(tokens: TokenMap, _opts: ExportOptions = {}): string {
  // Build theme.extend object from color tokens
  const colors: Record<string, string> = {}
  for (const [key] of Object.entries(tokens.light)) {
    if (key.startsWith('--color-')) {
      const name = key.slice('--color-'.length)
      colors[name] = `var(${key})`
    }
  }

  const fontSizes: Record<string, string> = {}
  for (const [key, value] of Object.entries(tokens.light)) {
    if (key.startsWith('--font-size-')) {
      const name = key.slice('--font-size-'.length)
      fontSizes[name] = value
    }
  }

  const obj = {
    theme: {
      extend: {
        colors,
        fontSize: fontSizes,
      },
    },
  }

  return `/** @type {import('tailwindcss').Config} */\nmodule.exports = ${JSON.stringify(obj, null, 2)}`
}
