import { useState } from 'react'
import { useUI, useUIActions, useColor, useTypography } from '@/store'
import { buildTokenMap } from '@/store/derived'
import { formatTokens } from '@/core/export'
import type { ExportFormat } from '@/core/export/types'
import styles from './ExportTab.module.css'

const FORMATS: { id: ExportFormat; label: string; desc: string }[] = [
  { id: 'css', label: 'CSS Custom Properties', desc: 'Drop into any project' },
  { id: 'tailwind-v3', label: 'Tailwind v3', desc: 'theme.extend config' },
  { id: 'tailwind-v4', label: 'Tailwind v4', desc: '@theme CSS syntax' },
  { id: 'w3c', label: 'W3C Design Tokens', desc: 'Style Dictionary / Tokens Studio' },
  { id: 'scss', label: 'SCSS Variables', desc: 'Legacy codebases' },
  { id: 'figma', label: 'Figma Variables', desc: 'Import directly into Figma' },
]

const FILE_EXT: Record<ExportFormat, string> = {
  'css': 'tokens.css',
  'tailwind-v3': 'tailwind.config.js',
  'tailwind-v4': 'tokens.css',
  'w3c': 'tokens.json',
  'scss': 'tokens.scss',
  'figma': 'figma-variables.json',
}

export function ExportTab() {
  const { activeExportFormat } = useUI()
  const { setExportFormat } = useUIActions()
  const { slots, dataVizN } = useColor()
  const { pairing, scale } = useTypography()
  const [prefix, setPrefix] = useState('')
  const [copied, setCopied] = useState(false)

  const tokens = buildTokenMap(slots, scale, pairing, dataVizN)
  const code = formatTokens(activeExportFormat, tokens, { prefix })

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = prefix ? `${prefix}${FILE_EXT[activeExportFormat]}` : FILE_EXT[activeExportFormat]
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={styles.tab}>
      <div>
        <div className={styles.sectionTitle}>Format</div>
        <div className={styles.formatGrid}>
          {FORMATS.map(f => (
            <button
              key={f.id}
              className={`${styles.formatBtn} ${activeExportFormat === f.id ? styles.active : ''}`}
              onClick={() => setExportFormat(f.id)}
              aria-pressed={activeExportFormat === f.id}
              title={f.desc}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className={styles.sectionTitle}>Options</div>
        <div className={styles.optionRow}>
          <label htmlFor="export-prefix">Prefix</label>
          <input
            id="export-prefix"
            value={prefix}
            onChange={e => setPrefix(e.target.value)}
            placeholder="e.g. ds-"
            style={{ width: 100 }}
            aria-label="Token prefix"
          />
        </div>
      </div>

      <div>
        <div className={styles.sectionTitle}>Preview</div>
        <pre className={styles.code}>{code}</pre>
      </div>

      <div className={styles.actions}>
        <button className={styles.copyBtn} onClick={handleCopy}>
          {copied ? '✓ Copied' : 'Copy to clipboard'}
        </button>
        <button className={styles.downloadBtn} onClick={handleDownload}>
          Download {FILE_EXT[activeExportFormat]}
        </button>
      </div>
    </div>
  )
}
