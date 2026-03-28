import type { TokenMap, ExportOptions } from './types'

export function formatTailwindV3(tokens: TokenMap, _opts: ExportOptions = {}): string {
  const colors: Record<string, string> = {}
  const fontFamily: Record<string, string> = {}
  const fontSize: Record<string, string> = {}
  const fontWeight: Record<string, string> = {}
  const lineHeight: Record<string, string> = {}
  const letterSpacing: Record<string, string> = {}
  const spacing: Record<string, string> = {}
  const borderRadius: Record<string, string> = {}
  const borderWidth: Record<string, string> = {}
  const boxShadow: Record<string, string> = {}
  const screens: Record<string, string> = {}
  const zIndex: Record<string, string> = {}
  const transitionDuration: Record<string, string> = {}
  const transitionTimingFunction: Record<string, string> = {}

  for (const [key, value] of Object.entries(tokens.light)) {
    if (key.startsWith('--color-')) {
      const name = key.slice('--color-'.length)
      colors[name] = `var(${key})`
    } else if (key === '--font-heading') {
      fontFamily['heading'] = value
    } else if (key === '--font-body') {
      fontFamily['body'] = value
    } else if (key.startsWith('--font-size-')) {
      const name = key.slice('--font-size-'.length)
      fontSize[name] = value
    } else if (key.startsWith('--font-weight-')) {
      const name = key.slice('--font-weight-'.length)
      fontWeight[name] = value
    } else if (key.startsWith('--line-height-')) {
      const name = key.slice('--line-height-'.length)
      lineHeight[name] = value
    } else if (key.startsWith('--letter-spacing-')) {
      const name = key.slice('--letter-spacing-'.length)
      letterSpacing[name] = value
    } else if (key.startsWith('--spacing-')) {
      const name = key.slice('--spacing-'.length)
      spacing[name] = value
    } else if (key.startsWith('--radius-')) {
      const name = key.slice('--radius-'.length)
      borderRadius[name] = value
    } else if (key.startsWith('--border-width-')) {
      const name = key.slice('--border-width-'.length)
      borderWidth[name] = value
    } else if (key.startsWith('--shadow-')) {
      const name = key.slice('--shadow-'.length)
      boxShadow[name] = value
    } else if (key.startsWith('--breakpoint-')) {
      const name = key.slice('--breakpoint-'.length)
      screens[name] = value
    } else if (key.startsWith('--z-')) {
      const name = key.slice('--z-'.length)
      zIndex[name] = value
    } else if (key.startsWith('--duration-')) {
      const name = key.slice('--duration-'.length)
      transitionDuration[name] = value
    } else if (key.startsWith('--ease-')) {
      const name = key.slice('--ease-'.length)
      transitionTimingFunction[name] = value
    }
  }

  const obj = {
    theme: {
      screens,
      extend: {
        colors,
        fontFamily,
        fontSize,
        fontWeight,
        lineHeight,
        letterSpacing,
        spacing,
        borderRadius,
        borderWidth,
        boxShadow,
        zIndex,
        transitionDuration,
        transitionTimingFunction,
      },
    },
  }

  return `/** @type {import('tailwindcss').Config} */\nmodule.exports = ${JSON.stringify(obj, null, 2)}`
}
