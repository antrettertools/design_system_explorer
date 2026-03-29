import { zipSync } from 'fflate'
import { formatTokens } from './index'
import type { ExportFormat, TokenMap, ExportOptions } from './types'

const ALL_FORMATS: { id: ExportFormat; filename: string }[] = [
  { id: 'css',              filename: 'tokens.css' },
  { id: 'tailwind-v3',      filename: 'tailwind.config.js' },
  { id: 'tailwind-v4',      filename: 'tokens-v4.css' },
  { id: 'w3c',              filename: 'tokens.json' },
  { id: 'scss',             filename: 'tokens.scss' },
  { id: 'figma',            filename: 'figma-variables.json' },
  { id: 'style-dictionary', filename: 'tokens.sd.json' },
]

/**
 * Generate a ZIP containing all export formats and trigger a browser download.
 * @param tokens  The full token map from buildTokenMap
 * @param opts    Optional ExportOptions (prefix, casing, etc.)
 * @param zipName The .zip filename to download (default: 'design-tokens.zip')
 */
export function downloadAllFormats(
  tokens: TokenMap,
  opts?: ExportOptions,
  zipName = 'design-tokens.zip',
): void {
  const enc = new TextEncoder()
  const files: Record<string, Uint8Array> = {}

  for (const { id, filename } of ALL_FORMATS) {
    const content = formatTokens(id, tokens, opts)
    files[filename] = enc.encode(content)
  }

  const zipped = zipSync(files, { level: 6 })
  const blob = new Blob([zipped], { type: 'application/zip' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = zipName
  a.click()
  URL.revokeObjectURL(url)
}
