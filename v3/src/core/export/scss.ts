import type { TokenMap, ExportOptions } from './types'

export function formatSCSS(tokens: TokenMap, _opts: ExportOptions = {}): string {
  const lines: string[] = ['// Light mode']
  for (const [key, value] of Object.entries(tokens.light)) {
    const varName = key.startsWith('--') ? `$${key.slice(2)}` : `$${key}`
    lines.push(`${varName}: ${value};`)
  }
  if (Object.keys(tokens.dark).length > 0) {
    lines.push('', '// Dark mode overrides')
    for (const [key, value] of Object.entries(tokens.dark)) {
      const varName = key.startsWith('--') ? `$dark-${key.slice(2)}` : `$dark-${key}`
      lines.push(`${varName}: ${value};`)
    }
  }
  return lines.join('\n')
}
