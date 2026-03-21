import { useState } from 'react'
import { useUI, useUIActions, useColor, useTypography, useSpacing, useEffects } from '@/store'
import { encodeShare } from '@/core/share/encode'
import type { ShareSnapshot } from '@/core/share/types'
import type { ShowcaseTemplate } from '@/store/ui'
import styles from './ShowcaseTab.module.css'

const TEMPLATES: { id: ShowcaseTemplate; name: string; desc: string }[] = [
  { id: 'landing', name: 'Landing', desc: 'SaaS homepage' },
  { id: 'dashboard', name: 'Dashboard', desc: 'Admin panel' },
  { id: 'blog', name: 'Blog', desc: 'Editorial layout' },
  { id: 'system', name: 'System', desc: 'Design system doc' },
]

export function ShowcaseTab() {
  const { showcaseTemplate, theme, mode, activeTab } = useUI()
  const { setShowcaseTemplate, toggleTheme } = useUIActions()
  const { slots, activeModel, dataVizN } = useColor()
  const { pairing, scale, locks } = useTypography()
  const { baseUnit } = useSpacing()
  const { shadowMode } = useEffects()
  const [copied, setCopied] = useState(false)

  const copyShareLink = async () => {
    if (!pairing || !scale) return
    const snapshot: ShareSnapshot = {
      v: 3,
      colors: slots,
      harmonyModel: activeModel,
      pairing,
      typographyLocks: locks,
      scaleRatio: scale._ratio,
      mode,
      activeTab,
      theme,
      spacingBaseUnit: baseUnit,
      shadowMode,
    }
    const hash = await encodeShare(snapshot)
    const url = `${window.location.origin}${window.location.pathname}${hash}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  return (
    <div className={styles.panel}>
      <div>
        <div className={styles.sectionTitle}>Template</div>
        <div className={styles.templateGrid}>
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              className={`${styles.templateBtn} ${showcaseTemplate === t.id ? styles.active : ''}`}
              onClick={() => setShowcaseTemplate(t.id)}
              aria-pressed={showcaseTemplate === t.id}
            >
              <span className={styles.templateName}>{t.name}</span>
              <span className={styles.templateDesc}>{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className={styles.sectionTitle}>Actions</div>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={toggleTheme}>
            {theme === 'light' ? '◐' : '○'} {theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          </button>
          <button className={styles.actionBtn} onClick={toggleFullscreen}>
            ⛶ Fullscreen preview
          </button>
          <button
            className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
            onClick={copyShareLink}
            disabled={!pairing || !scale}
          >
            ↗ Copy share link
          </button>
          {copied && <div className={styles.copied}>✓ Link copied to clipboard</div>}
        </div>
      </div>

      <div>
        <div className={styles.sectionTitle}>Data Viz Colors</div>
        <div style={{ fontSize: 11, color: 'var(--color-on-surface-subtle, #888)', fontFamily: 'sans-serif' }}>
          {dataVizN}-color categorical palette — adjust in Colors tab
        </div>
      </div>
    </div>
  )
}
