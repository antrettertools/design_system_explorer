import type { ExportOptions, TokenMap } from './types'

function transformKey(key: string, opts: ExportOptions): string {
  const prefix = opts.prefix ?? ''
  // key arrives as "--color-brand-500" style
  const inner = key.startsWith('--') ? key.slice(2) : key
  const prefixed = prefix ? `${prefix}${inner}` : inner

  switch (opts.casing) {
    case 'camelCase':
      return '--' + prefixed.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase())
    case 'snake_case':
      return '--' + prefixed.replace(/-/g, '_')
    default:
      return '--' + prefixed
  }
}

function renderBlock(tokens: Record<string, string>, opts: ExportOptions, indent = '  '): string {
  return Object.entries(tokens)
    .map(([k, v]) => `${indent}${transformKey(k, opts)}: ${v};`)
    .join('\n')
}

export function formatCSS(tokens: TokenMap, opts: ExportOptions = {}): string {
  const lines: string[] = []
  lines.push(':root {')
  lines.push(renderBlock(tokens.light, opts))
  lines.push('}')
  if (Object.keys(tokens.dark).length > 0) {
    lines.push('')
    lines.push('[data-theme="dark"] {')
    lines.push(renderBlock(tokens.dark, opts))
    lines.push('}')
  }
  return lines.join('\n')
}
