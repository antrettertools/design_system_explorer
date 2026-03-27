import type { TokenMap, ExportOptions } from './types'

export function formatW3C(tokens: TokenMap, _opts: ExportOptions = {}): string {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(tokens.light)) {
    const name = key.startsWith('--') ? key.slice(2) : key
    result[name] = { $value: value, $type: key.includes('color') ? 'color' : 'dimension' }
  }
  return JSON.stringify(result, null, 2)
}
