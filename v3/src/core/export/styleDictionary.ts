import type { TokenMap, ExportOptions } from './types'

type SDTokenType =
  | 'color'
  | 'dimension'
  | 'fontFamily'
  | 'fontWeight'
  | 'lineHeight'
  | 'letterSpacing'
  | 'number'
  | 'shadow'
  | 'duration'
  | 'cubicBezier'
  | 'string'

function inferType(key: string): SDTokenType {
  if (key.startsWith('--color-')) return 'color'
  if (key === '--font-heading' || key === '--font-body') return 'fontFamily'
  if (key.startsWith('--font-size-')) return 'dimension'
  if (key.startsWith('--font-weight-')) return 'fontWeight'
  if (key.startsWith('--line-height-')) return 'lineHeight'
  if (key.startsWith('--letter-spacing-')) return 'letterSpacing'
  if (key.startsWith('--spacing-')) return 'dimension'
  if (key.startsWith('--radius-')) return 'dimension'
  if (key.startsWith('--icon-size-')) return 'dimension'
  if (key.startsWith('--border-width-')) return 'dimension'
  if (key.startsWith('--breakpoint-')) return 'dimension'
  if (key.startsWith('--z-')) return 'number'
  if (key.startsWith('--shadow-')) return 'shadow'
  if (key.startsWith('--focus-ring-width') || key.startsWith('--focus-ring-offset')) return 'dimension'
  if (key.startsWith('--focus-ring-color')) return 'color'
  if (key.startsWith('--ease-')) return 'cubicBezier'
  if (key.startsWith('--duration-')) return 'duration'
  if (key.startsWith('--transition-')) return 'string'
  if (key.startsWith('--component-')) return 'string'
  return 'string'
}

// Build a deep nested object from a flat CSS var map.
// "--color-brand-500" → { color: { brand: { "500": { value, type, attributes } } } }
// Carefully handles numeric segments in paths (50, 100, 500…) and compound words.
function buildSDTree(
  flat: Record<string, string>,
  category: 'light' | 'dark',
): Record<string, unknown> {
  const root: Record<string, unknown> = {}

  for (const [key, rawValue] of Object.entries(flat)) {
    const type = inferType(key)
    const stripped = key.replace(/^--/, '')

    // Split into path segments on "-", keeping numeric segments intact.
    // E.g. "color-brand-500" → ["color","brand","500"]
    //      "font-size-display" → ["font","size","display"]
    const parts = stripped.split('-')

    let node = root
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (typeof node[part] !== 'object' || node[part] === null) {
        node[part] = {}
      }
      node = node[part] as Record<string, unknown>
    }

    const leaf = parts[parts.length - 1]
    node[leaf] = {
      value: rawValue,
      type,
      attributes: { category },
    }
  }

  return root
}

export function formatStyleDictionary(tokens: TokenMap, _opts: ExportOptions = {}): string {
  const result: Record<string, unknown> = {
    $schema: 'https://styledictionary.com',
    light: buildSDTree(tokens.light, 'light'),
  }

  if (Object.keys(tokens.dark).length > 0) {
    result.dark = buildSDTree(tokens.dark, 'dark')
  }

  return JSON.stringify(result, null, 2)
}
