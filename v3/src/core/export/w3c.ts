import type { TokenMap, ExportOptions } from './types'

// Map CSS variable prefix → W3C Design Token $type
function inferType(key: string): string {
  if (key.startsWith('--color-')) return 'color'
  if (key === '--font-heading' || key === '--font-body') return 'fontFamily'
  if (key.startsWith('--font-size-')) return 'dimension'
  if (key.startsWith('--font-weight-')) return 'number'
  if (key.startsWith('--line-height-')) return 'number'
  if (key.startsWith('--letter-spacing-')) return 'dimension'
  if (key.startsWith('--spacing-')) return 'dimension'
  if (key.startsWith('--radius-')) return 'dimension'
  if (key.startsWith('--icon-size-')) return 'dimension'
  if (key.startsWith('--border-width-')) return 'dimension'
  if (key.startsWith('--breakpoint-')) return 'dimension'
  if (key.startsWith('--z-')) return 'number'
  if (key.startsWith('--shadow-')) return 'shadow'
  if (key.startsWith('--focus-ring-')) return 'dimension'
  if (key.startsWith('--ease-')) return 'cubicBezier'
  if (key.startsWith('--duration-')) return 'duration'
  if (key.startsWith('--transition-')) return 'string'
  if (key.startsWith('--component-')) return 'string'
  return 'string'
}

// Build a nested object from a flat token map.
// "--color-brand-500" → { color: { brand: { "500": { $value, $type } } } }
function buildNestedTokens(flat: Record<string, string>): Record<string, unknown> {
  const root: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(flat)) {
    const type = inferType(key)
    // Strip leading "--" and split on "-" carefully:
    // "--color-brand-500" → ["color", "brand", "500"]
    // "--font-size-display" → ["font", "size", "display"]
    const stripped = key.replace(/^--/, '')
    const parts = stripped.split('-')

    // Walk/build the nested path, leaving the last segment as the token name
    let node = root
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (typeof node[part] !== 'object' || node[part] === null) {
        node[part] = {}
      }
      node = node[part] as Record<string, unknown>
    }
    const leaf = parts[parts.length - 1]
    node[leaf] = { $value: value, $type: type }
  }

  return root
}

export function formatW3C(tokens: TokenMap, _opts: ExportOptions = {}): string {
  const result: Record<string, unknown> = {
    $schema: 'https://design-tokens.github.io/community-group/format/',
    light: buildNestedTokens(tokens.light),
  }

  if (Object.keys(tokens.dark).length > 0) {
    result.dark = buildNestedTokens(tokens.dark)
  }

  return JSON.stringify(result, null, 2)
}
