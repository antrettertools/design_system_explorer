import { useEffect, useRef, useState } from 'react'
import { useUI, useUIActions, useColor, useTypography } from '@/store'
import { buildTokenMap } from '@/store/derived'
import { formatTokens } from '@/core/export'
import type { ExportFormat } from '@/core/export/types'
import styles from './ExportPanel.module.css'

const FORMATS: { id: ExportFormat; label: string }[] = [
  { id: 'css', label: 'CSS' },
  { id: 'tailwind-v3', label: 'Tailwind v3' },
  { id: 'tailwind-v4', label: 'Tailwind v4' },
  { id: 'w3c', label: 'W3C JSON' },
  { id: 'scss', label: 'SCSS' },
]

const FILE_EXT: Record<ExportFormat, string> = {
  'css': 'tokens.css',
  'tailwind-v3': 'tailwind.config.js',
  'tailwind-v4': 'tokens.css',
  'w3c': 'tokens.json',
  'scss': 'tokens.scss',
}

export function ExportPanel() {
  const { exportPanelOpen, activeExportFormat } = useUI()
  const { closeExportPanel, setExportFormat } = useUIActions()
  const { slots, dataVizN } = useColor()
  const { pairing, scale } = useTypography()
  const [copied, setCopied] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  const tokens = buildTokenMap(slots, scale, pairing, dataVizN)
  const code = formatTokens(activeExportFormat, tokens)

  useEffect(() => {
    if (!exportPanelOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeExportPanel()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [exportPanelOpen, closeExportPanel])

  if (!exportPanelOpen) return null

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
    a.download = FILE_EXT[activeExportFormat]
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) closeExportPanel()
  }

  const lineCount = code.split('\n').length
  const charCount = code.length

  return (
    <div
      className={styles.overlay}
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Export tokens"
    >
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>Export tokens</span>
          <button className={styles.closeBtn} onClick={closeExportPanel} aria-label="Close export panel">×</button>
        </div>

        <div className={styles.formatTabs} role="tablist">
          {FORMATS.map(f => (
            <button
              key={f.id}
              className={`${styles.formatTab} ${activeExportFormat === f.id ? styles.active : ''}`}
              onClick={() => setExportFormat(f.id)}
              role="tab"
              aria-selected={activeExportFormat === f.id}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className={styles.codeWrapper} role="tabpanel">
          <pre className={styles.code}>{code}</pre>
        </div>

        <div className={styles.footer}>
          <span className={styles.meta}>{lineCount} lines · {charCount} chars · {FILE_EXT[activeExportFormat]}</span>
          <div className={styles.footerActions}>
            <button className={styles.downloadBtn} onClick={handleDownload}>
              Download
            </button>
            <button
              className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
              onClick={handleCopy}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
