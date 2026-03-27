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

// Convert "16px" → 16, "8px" → 8; returns null for non-px values
function parsePxValue(value: string): number | null {
  const match = value.match(/^(\d+(?:\.\d+)?)px$/)
  return match ? parseFloat(match[1]) : null
}

// Convert CSS var name → Figma variable path
// "--color-brand-500" → "color/brand/500"
// "--spacing-md" → "spacing/md"
function varToPath(varName: string): string {
  const stripped = varName.replace(/^--/, '')
  // Preserve numeric suffixes by splitting carefully
  return stripped.replace(/-(\d)/g, '/$1').replace(/-/g, '/')
}

type FigmaColor = { r: number; g: number; b: number; a: number }
type FigmaVariable = {
  name: string
  type: 'COLOR' | 'FLOAT' | 'STRING'
  values: Record<string, FigmaColor | number | string>
}
type FigmaCollection = { name: string; modes: string[]; variables: FigmaVariable[] }

/**
 * Format token map as Figma Variables JSON.
 * Compatible with Tokens Studio and the native Figma Variables import format.
 *
 * Structure:
 * - Colors collection (Light + Dark modes) — hex values only; CSS var references skipped
 * - Spacing collection (single mode — dimension values in px)
 * - Border Radius collection (single mode — dimension values in px)
 */
export function formatFigmaVariables(tokenMap: TokenMap, _opts: ExportOptions): string {
  const collections: FigmaCollection[] = []

  // Partition tokens by prefix
  const colorVars: string[] = []
  const spacingVars: string[] = []
  const radiusVars: string[] = []

  for (const varName of Object.keys(tokenMap.light)) {
    if (varName.startsWith('--color-')) colorVars.push(varName)
    else if (varName.startsWith('--spacing-')) spacingVars.push(varName)
    else if (varName.startsWith('--radius-')) radiusVars.push(varName)
  }

  // ── Colors collection — Light + Dark modes ─────────────────────────────
  if (colorVars.length > 0) {
    const variables: FigmaVariable[] = []
    for (const varName of colorVars) {
      const lightVal = tokenMap.light[varName]
      const darkVal = tokenMap.dark[varName]
      const lightColor = hexToFigmaColor(lightVal)
      if (!lightColor) continue  // skip CSS var references (not a raw hex)
      const darkColor = hexToFigmaColor(darkVal) ?? lightColor
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

  // ── Spacing collection ──────────────────────────────────────────────────
  if (spacingVars.length > 0) {
    const variables: FigmaVariable[] = []
    for (const varName of spacingVars) {
      const px = parsePxValue(tokenMap.light[varName])
      if (px === null) continue
      variables.push({
        name: varToPath(varName),
        type: 'FLOAT',
        values: { Light: px },
      })
    }
    if (variables.length > 0) {
      collections.push({ name: 'Spacing', modes: ['Light'], variables })
    }
  }

  // ── Border Radius collection ────────────────────────────────────────────
  if (radiusVars.length > 0) {
    const variables: FigmaVariable[] = []
    for (const varName of radiusVars) {
      const val = tokenMap.light[varName]
      const px = val === '9999px' ? 9999 : parsePxValue(val)
      if (px === null) continue
      variables.push({
        name: varToPath(varName),
        type: 'FLOAT',
        values: { Light: px },
      })
    }
    if (variables.length > 0) {
      collections.push({ name: 'Border Radius', modes: ['Light'], variables })
    }
  }

  return JSON.stringify({ version: '1.0', collections }, null, 2)
}
