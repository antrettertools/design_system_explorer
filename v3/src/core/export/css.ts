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

// Token prefix → section comment label
const SECTIONS: { prefix: string; label: string }[] = [
  { prefix: '--color-', label: 'Color tokens' },
  { prefix: '--font-', label: 'Typography tokens' },
  { prefix: '--font-size-', label: '' },   // merged into typography
  { prefix: '--spacing-', label: 'Spacing tokens' },
  { prefix: '--radius-', label: 'Border radius' },
  { prefix: '--icon-size-', label: 'Icon sizes' },
  { prefix: '--shadow-', label: 'Shadows' },
  { prefix: '--focus-ring-', label: 'Focus ring' },
  { prefix: '--ease-', label: 'Motion' },
  { prefix: '--duration-', label: '' },
  { prefix: '--transition-', label: '' },
  { prefix: '--component-', label: 'Component tokens' },
]

function renderGroupedBlock(tokens: Record<string, string>, opts: ExportOptions): string {
  const assigned = new Set<string>()
  const sections: string[] = []

  for (const { prefix, label } of SECTIONS) {
    const entries = Object.entries(tokens).filter(([k]) => k.startsWith(prefix) && !assigned.has(k))
    if (entries.length === 0) continue
    entries.forEach(([k]) => assigned.add(k))
    if (label) sections.push(`  /* ${label} */`)
    sections.push(entries.map(([k, v]) => `  ${transformKey(k, opts)}: ${v};`).join('\n'))
  }

  // Any remaining tokens not matched by prefix
  const rest = Object.entries(tokens).filter(([k]) => !assigned.has(k))
  if (rest.length > 0) {
    sections.push(rest.map(([k, v]) => `  ${transformKey(k, opts)}: ${v};`).join('\n'))
  }

  return sections.join('\n')
}

export function formatCSS(tokens: TokenMap, opts: ExportOptions = {}): string {
  const lines: string[] = []
  lines.push(':root {')
  lines.push(renderGroupedBlock(tokens.light, opts))
  lines.push('}')
  if (Object.keys(tokens.dark).length > 0) {
    lines.push('')
    lines.push('[data-theme="dark"] {')
    lines.push(renderBlock(tokens.dark, opts))
    lines.push('}')
  }
  return lines.join('\n')
}
