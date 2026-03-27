import type { TokenMap, ExportOptions } from './types'

export function formatTailwindV4(tokens: TokenMap, _opts: ExportOptions = {}): string {
  const lines = ['@theme {']
  for (const [key, value] of Object.entries(tokens.light)) {
    lines.push(`  ${key}: ${value};`)
  }
  lines.push('}')
  return lines.join('\n')
}
