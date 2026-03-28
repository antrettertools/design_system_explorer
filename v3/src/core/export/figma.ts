import type { TokenMap, ExportOptions } from './types'

// Convert hex #RRGGBB to Figma RGBA (0–1 range)
function hexToFigmaColor(hex: string): { r: number; g: number; b: number; a: number } | null {
  const clean = hex.replace('#', '')
  if (clean.length !== 6) return null
  const r = parseInt(clean.slice(0, 2), 16) / 255
  const g = parseInt(clean.slice(2, 4), 16) / 255
  const b = parseInt(clean.slice(4, 6), 16) / 255
  return { r, g, b, a: 1 }
}

// Convert "16px" → 16; returns null for non-px values
function parsePxValue(value: string): number | null {
  const match = value.match(/^(\d+(?:\.\d+)?)px$/)
  return match ? parseFloat(match[1]) : null
}

// Convert "400" or "700" (font-weight string) → number
function parseNumber(value: string): number | null {
  const n = parseFloat(value)
  return isNaN(n) ? null : n
}

// Convert CSS var name → Figma variable path
// "--color-brand-500" → "color/brand/500"
function varToPath(varName: string): string {
  const stripped = varName.replace(/^--/, '')
  return stripped.replace(/-(\d)/g, '/$1').replace(/-/g, '/')
}

type FigmaColor = { r: number; g: number; b: number; a: number }
type FigmaValue = FigmaColor | number | string
type FigmaVariable = {
  name: string
  type: 'COLOR' | 'FLOAT' | 'STRING'
  values: Record<string, FigmaValue>
}
type FigmaCollection = { name: string; modes: string[]; variables: FigmaVariable[] }

export function formatFigmaVariables(tokenMap: TokenMap, _opts: ExportOptions): string {
  const collections: FigmaCollection[] = []

  // ── Colors — Light + Dark modes ─────────────────────────────────────────
  {
    const variables: FigmaVariable[] = []
    for (const [varName, lightVal] of Object.entries(tokenMap.light)) {
      if (!varName.startsWith('--color-')) continue
      const lightColor = hexToFigmaColor(lightVal)
      if (!lightColor) continue  // skip CSS var references
      const darkVal = tokenMap.dark[varName]
      const darkColor = (darkVal ? hexToFigmaColor(darkVal) : null) ?? lightColor
      variables.push({
        name: varToPath(varName),
        type: 'COLOR',
        values: { Light: lightColor, Dark: darkColor },
      })
    }
    if (variables.length > 0) {
      collections.push({ name: 'Colors', modes: ['Light', 'Dark'], variables })
    }
  }

  // ── Typography ───────────────────────────────────────────────────────────
  {
    const variables: FigmaVariable[] = []
    for (const [varName, value] of Object.entries(tokenMap.light)) {
      if (varName === '--font-heading' || varName === '--font-body') {
        variables.push({ name: varToPath(varName), type: 'STRING', values: { Value: value } })
      } else if (varName.startsWith('--font-size-')) {
        const px = parsePxValue(value)
        if (px !== null) variables.push({ name: varToPath(varName), type: 'FLOAT', values: { Value: px } })
      } else if (varName.startsWith('--font-weight-')) {
        const n = parseNumber(value)
        if (n !== null) variables.push({ name: varToPath(varName), type: 'FLOAT', values: { Value: n } })
      } else if (varName.startsWith('--line-height-')) {
        const n = parseNumber(value)
        if (n !== null) variables.push({ name: varToPath(varName), type: 'FLOAT', values: { Value: n } })
      } else if (varName.startsWith('--letter-spacing-')) {
        variables.push({ name: varToPath(varName), type: 'STRING', values: { Value: value } })
      }
    }
    if (variables.length > 0) {
      collections.push({ name: 'Typography', modes: ['Value'], variables })
    }
  }

  // ── Spacing ──────────────────────────────────────────────────────────────
  {
    const variables: FigmaVariable[] = []
    for (const [varName, value] of Object.entries(tokenMap.light)) {
      if (!varName.startsWith('--spacing-')) continue
      const px = parsePxValue(value)
      if (px !== null) variables.push({ name: varToPath(varName), type: 'FLOAT', values: { Value: px } })
    }
    if (variables.length > 0) {
      collections.push({ name: 'Spacing', modes: ['Value'], variables })
    }
  }

  // ── Border Radius ────────────────────────────────────────────────────────
  {
    const variables: FigmaVariable[] = []
    for (const [varName, value] of Object.entries(tokenMap.light)) {
      if (!varName.startsWith('--radius-')) continue
      const px = value === '9999px' ? 9999 : parsePxValue(value)
      if (px !== null) variables.push({ name: varToPath(varName), type: 'FLOAT', values: { Value: px } })
    }
    if (variables.length > 0) {
      collections.push({ name: 'Border Radius', modes: ['Value'], variables })
    }
  }

  // ── Sizing (icon sizes, border widths, breakpoints, z-index) ─────────────
  {
    const variables: FigmaVariable[] = []
    for (const [varName, value] of Object.entries(tokenMap.light)) {
      if (varName.startsWith('--icon-size-')) {
        const px = parsePxValue(value)
        if (px !== null) variables.push({ name: varToPath(varName), type: 'FLOAT', values: { Value: px } })
      } else if (varName.startsWith('--border-width-')) {
        const px = parsePxValue(value)
        if (px !== null) variables.push({ name: varToPath(varName), type: 'FLOAT', values: { Value: px } })
      } else if (varName.startsWith('--breakpoint-')) {
        const px = parsePxValue(value)
        if (px !== null) variables.push({ name: varToPath(varName), type: 'FLOAT', values: { Value: px } })
      } else if (varName.startsWith('--z-')) {
        const n = parseNumber(value)
        if (n !== null) variables.push({ name: varToPath(varName), type: 'FLOAT', values: { Value: n } })
      }
    }
    if (variables.length > 0) {
      collections.push({ name: 'Sizing', modes: ['Value'], variables })
    }
  }

  // ── Effects (shadows, focus ring, motion) ───────────────────────────────
  {
    const variables: FigmaVariable[] = []
    for (const [varName, value] of Object.entries(tokenMap.light)) {
      if (varName.startsWith('--shadow-')) {
        variables.push({ name: varToPath(varName), type: 'STRING', values: { Value: value } })
      } else if (varName.startsWith('--focus-ring-')) {
        // width/offset as FLOAT px, color as STRING
        const px = parsePxValue(value)
        if (px !== null) {
          variables.push({ name: varToPath(varName), type: 'FLOAT', values: { Value: px } })
        } else {
          variables.push({ name: varToPath(varName), type: 'STRING', values: { Value: value } })
        }
      } else if (varName.startsWith('--ease-')) {
        variables.push({ name: varToPath(varName), type: 'STRING', values: { Value: value } })
      } else if (varName.startsWith('--duration-')) {
        // Strip "ms" suffix for FLOAT
        const n = parseFloat(value)
        if (!isNaN(n)) variables.push({ name: varToPath(varName), type: 'FLOAT', values: { Value: n } })
      } else if (varName.startsWith('--transition-')) {
        variables.push({ name: varToPath(varName), type: 'STRING', values: { Value: value } })
      }
    }
    if (variables.length > 0) {
      collections.push({ name: 'Effects', modes: ['Value'], variables })
    }
  }

  // ── Components ───────────────────────────────────────────────────────────
  {
    const variables: FigmaVariable[] = []
    for (const [varName, value] of Object.entries(tokenMap.light)) {
      if (!varName.startsWith('--component-')) continue
      // Try to resolve hex colors for Figma COLOR type; fall back to STRING
      const asColor = hexToFigmaColor(value)
      if (asColor) {
        variables.push({ name: varToPath(varName), type: 'COLOR', values: { Value: asColor } })
      } else {
        variables.push({ name: varToPath(varName), type: 'STRING', values: { Value: value } })
      }
    }
    if (variables.length > 0) {
      collections.push({ name: 'Components', modes: ['Value'], variables })
    }
  }

  return JSON.stringify({ version: '1.0', collections }, null, 2)
}
