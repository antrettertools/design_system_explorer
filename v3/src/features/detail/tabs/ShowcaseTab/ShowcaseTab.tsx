import { useState } from 'react'
import { useUI, useUIActions, useColor, useTypography, useSpacing, useEffects } from '@/store'
import type { ShowcaseTemplate } from '@/store/ui'
import styles from './ShowcaseTab.module.css'


const TEMPLATES: { id: ShowcaseTemplate; name: string; desc: string }[] = [
  { id: 'landing', name: 'Landing', desc: 'SaaS homepage' },
  { id: 'dashboard', name: 'Dashboard', desc: 'Admin panel' },
  { id: 'blog', name: 'Blog', desc: 'Editorial layout' },
  { id: 'system', name: 'System', desc: 'Design system doc' },
]

const SPACING_STEPS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const
const RADIUS_STEPS = ['none', 'sm', 'md', 'lg', 'xl', 'full'] as const
const SHADOW_STEPS = ['sm', 'md', 'lg', 'xl'] as const

export function ShowcaseTab() {
  const { showcaseTemplate } = useUI()
  const { setShowcaseTemplate, copyShareLink } = useUIActions()
  const { dataVizN } = useColor()
  const { pairing, scale } = useTypography()
  const { baseUnit, config: spacingConfig, overrides: spacingOverrides, radiusOverrides } = useSpacing()
  const { config: effectsConfig, shadowMode, shadowOverrides } = useEffects()
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    const success = await copyShareLink()
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const effectiveSpacing = { ...spacingConfig.scale, ...spacingOverrides }
  const effectiveRadius = { ...spacingConfig.radius, ...radiusOverrides }
  const effectiveShadows = {
    ...(shadowMode === 'colored' ? effectsConfig.shadows : effectsConfig.shadowsNeutral),
    ...shadowOverrides,
  }

  return (
    <div className={styles.panel}>
      {/* TEMPLATE SELECTOR */}
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

      {/* ACTIONS */}
      <div>
        <div className={styles.sectionTitle}>Actions</div>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={toggleFullscreen}>
            ⛶ Fullscreen preview
          </button>
          <button
            className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
            onClick={handleCopyLink}
            disabled={!pairing || !scale}
          >
            ↗ Copy share link
          </button>
          {copied && <div className={styles.copied}>✓ Link copied to clipboard</div>}
        </div>
      </div>

      {/* DATA VIZ COLORS */}
      <div>
        <div className={styles.sectionTitle}>Data Viz · {dataVizN} colors</div>
        <div className={styles.dataVizStrip}>
          {Array.from({ length: dataVizN }, (_, i) => (
            <div
              key={i}
              className={styles.dataVizCell}
              style={{ background: `var(--color-dataviz-${i + 1})` }}
              title={`Color ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* SPACING SCALE */}
      <div>
        <div className={styles.sectionTitle}>Spacing · {baseUnit}pt grid</div>
        <div className={styles.spacingList}>
          {SPACING_STEPS.map(step => {
            const value = effectiveSpacing[step]
            const isOverridden = step in spacingOverrides
            return (
              <div key={step} className={styles.spacingRow}>
                <span className={styles.spacingLabel}>{step}</span>
                <div className={styles.spacingTrack}>
                  <div
                    className={styles.spacingFill}
                    style={{
                      width: `${Math.min(value / 96 * 100, 100)}%`,
                      background: isOverridden
                        ? 'var(--color-interactive, #e8543a)'
                        : 'var(--color-brand-400, #e8543a)',
                    }}
                  />
                </div>
                <span className={styles.spacingValue}>{value}px</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* BORDER RADIUS */}
      <div>
        <div className={styles.sectionTitle}>Border Radius</div>
        <div className={styles.radiusStrip}>
          {RADIUS_STEPS.map(step => {
            const value = effectiveRadius[step as keyof typeof effectiveRadius]
            const isOverridden = step in radiusOverrides
            const cssRadius = step === 'full' ? '9999px' : `${value}px`
            return (
              <div key={step} className={styles.radiusCell}>
                <div
                  className={styles.radiusBox}
                  style={{
                    borderRadius: cssRadius,
                    borderColor: isOverridden ? 'var(--color-interactive, #e8543a)' : 'var(--color-border, #e8e4df)',
                  }}
                />
                <span className={styles.radiusName}>{step}</span>
                <span className={styles.radiusPx}>{step === 'full' ? '∞' : `${value}px`}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* SHADOWS */}
      <div>
        <div className={styles.sectionTitle}>Shadows · {shadowMode}</div>
        <div className={styles.shadowStrip}>
          {SHADOW_STEPS.map(step => (
            <div
              key={step}
              className={styles.shadowCell}
              style={{ boxShadow: effectiveShadows[step as keyof typeof effectiveShadows] ?? 'none' }}
            >
              <span className={styles.shadowLabel}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* TYPOGRAPHY PREVIEW */}
      {pairing && (
        <div>
          <div className={styles.sectionTitle}>Typography</div>
          <div className={styles.typePreview}>
            <div className={styles.typeHeading} style={{ fontFamily: `"${pairing.heading}", serif` }}>
              The quick brown fox
            </div>
            <div className={styles.typeBody} style={{ fontFamily: `"${pairing.body}", sans-serif` }}>
              {pairing.heading} + {pairing.body}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
