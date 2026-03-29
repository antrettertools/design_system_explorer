import { useEffect, useRef, useState } from 'react'
import { trackEvent } from '@/analytics'
import { useUI, useUIActions, useColor, useTypography, useSpacing, useEffects, useComponents } from '@/store'
import { buildTokenMap } from '@/store/derived'
import { formatTokens } from '@/core/export'
import type { ExportFormat } from '@/core/export/types'
import { downloadAllFormats } from '@/core/export/zip'
import { openBrandingPdf } from '@/core/export/brandingPdf'
import { useAuth } from '@/auth/useAuth'
import styles from './ExportPanel.module.css'

const FORMATS: { id: ExportFormat; label: string }[] = [
  { id: 'css', label: 'CSS' },
  { id: 'tailwind-v3', label: 'Tailwind v3' },
  { id: 'tailwind-v4', label: 'Tailwind v4' },
  { id: 'w3c', label: 'W3C JSON' },
  { id: 'scss', label: 'SCSS' },
  { id: 'figma', label: 'Figma' },
  { id: 'style-dictionary', label: 'Style Dict' },
]

const FILE_EXT: Record<ExportFormat, string> = {
  'css': 'tokens.css',
  'tailwind-v3': 'tailwind.config.js',
  'tailwind-v4': 'tokens.css',
  'w3c': 'tokens.json',
  'scss': 'tokens.scss',
  'figma': 'figma-variables.json',
  'style-dictionary': 'tokens.sd.json',
}

/** Formats available on the free plan. CSS is the only free format. */
const FREE_FORMATS = new Set<ExportFormat>(['css'])

function isFormatLocked(format: ExportFormat, plan: string | undefined): boolean {
  return !FREE_FORMATS.has(format) && plan !== 'paid'
}

export function ExportPanel() {
  const { exportPanelOpen, activeExportFormat, theme } = useUI()
  const { closeExportPanel, setExportFormat, openSignInPrompt, openUpgradeModal } = useUIActions()
  const { slots, dataVizN, stateOverrides } = useColor()
  const { pairing, scale } = useTypography()
  const spacing = useSpacing()
  const effects = useEffects()
  const { overrides: componentOverrides } = useComponents()
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  const [cssPrefix, setCssPrefix] = useState('')
  const overlayRef = useRef<HTMLDivElement>(null)

  // If panel opens while a locked format is selected, reset to CSS
  useEffect(() => {
    if (exportPanelOpen && isFormatLocked(activeExportFormat, user?.plan)) {
      setExportFormat('css')
    }
  }, [exportPanelOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  const tokens = buildTokenMap(slots, scale, pairing, dataVizN, spacing, effects, { componentOverrides, stateOverrides }, theme)
  const opts = cssPrefix ? { prefix: cssPrefix } : undefined
  const code = formatTokens(activeExportFormat, tokens, opts)

  useEffect(() => {
    if (!exportPanelOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeExportPanel()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [exportPanelOpen, closeExportPanel])

  if (!exportPanelOpen) return null

  const handleTabClick = (formatId: ExportFormat) => {
    trackEvent('Export Attempt', { format: formatId, gated: String(isFormatLocked(formatId, user?.plan)) })
    if (isFormatLocked(formatId, user?.plan)) {
      if (!user) {
        openSignInPrompt('export')
      } else {
        openUpgradeModal()
      }
      return
    }
    setExportFormat(formatId)
  }

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

  const handleDownloadZip = () => {
    downloadAllFormats(tokens, opts)
  }

  const handleBrandingPdf = () => {
    const scaleRatio = scale?._ratio ?? 1.333
    openBrandingPdf({
      tokens,
      colors: slots,
      pairing: pairing!,
      scaleRatio,
    })
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
          {FORMATS.map(f => {
            const locked = isFormatLocked(f.id, user?.plan)
            return (
              <button
                key={f.id}
                className={[
                  styles.formatTab,
                  activeExportFormat === f.id ? styles.active : '',
                  locked ? styles.lockedTab : '',
                ].filter(Boolean).join(' ')}
                onClick={() => handleTabClick(f.id)}
                role="tab"
                aria-selected={activeExportFormat === f.id}
                title={locked ? 'Upgrade to unlock this format' : undefined}
              >
                {f.label}
                {locked && <span className={styles.lockIcon}>🔒</span>}
              </button>
            )
          })}
        </div>

        {/* CSS prefix input — paid users only */}
        {user?.plan === 'paid' && (
          <div className={styles.prefixRow}>
            <label className={styles.prefixLabel} htmlFor="css-prefix">
              CSS prefix
            </label>
            <input
              id="css-prefix"
              className={styles.prefixInput}
              type="text"
              value={cssPrefix}
              onChange={(e) => setCssPrefix(e.target.value.replace(/[^a-z0-9-]/g, ''))}
              placeholder="ds- (optional)"
              maxLength={16}
              spellCheck={false}
            />
          </div>
        )}

        <div className={styles.codeWrapper} role="tabpanel">
          <pre className={styles.code}>{code}</pre>
        </div>

        <div className={styles.footer}>
          <span className={styles.meta}>{lineCount} lines · {charCount} chars · {FILE_EXT[activeExportFormat]}</span>
          <div className={styles.footerActions}>
            {user?.plan === 'paid' && (
              <>
                <button className={styles.zipBtn} onClick={handleDownloadZip} title="Download all formats as ZIP">
                  Download all (.zip)
                </button>
                <button className={styles.pdfBtn} onClick={handleBrandingPdf} title="Open branding PDF">
                  Branding PDF
                </button>
              </>
            )}
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
