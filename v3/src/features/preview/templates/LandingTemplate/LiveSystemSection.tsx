import { useColor, useTypography } from '@/store'
import { POSITION_LABELS } from '@/core/color/types'
import styles from './LandingTemplate.module.css'

type SpecimenRow = {
  label: string
  fontFamily: string
  fontSize: string
  fontWeight: string
  sample: string
}

const SPECIMEN_ROWS: SpecimenRow[] = [
  { label: 'Display',  fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-display)', fontWeight: 'var(--font-weight-display)', sample: 'The quick brown fox' },
  { label: 'Heading',  fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h1)',      fontWeight: 'var(--font-weight-h1)',      sample: 'The quick brown fox' },
  { label: 'Subhead',  fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h2)',      fontWeight: 'var(--font-weight-h2)',      sample: 'The quick brown fox' },
  { label: 'Body',     fontFamily: 'var(--font-body)',    fontSize: 'var(--font-size-body)',    fontWeight: 'var(--font-weight-body)',    sample: 'The quick brown fox jumps over the lazy dog.' },
  { label: 'Small',    fontFamily: 'var(--font-body)',    fontSize: 'var(--font-size-small)',   fontWeight: 'var(--font-weight-small)',   sample: 'Caption · Label · Meta' },
]

const COMPACT_SPACING_STEPS = [
  { key: 'xs',  varName: 'var(--ui-space-xs)' },
  { key: 'sm',  varName: 'var(--ui-space-sm)' },
  { key: 'md',  varName: 'var(--ui-space-md)' },
  { key: 'lg',  varName: 'var(--ui-space-lg)' },
  { key: 'xl',  varName: 'var(--ui-space-xl)' },
  { key: '2xl', varName: 'var(--ui-space-2xl)' },
  { key: '3xl', varName: 'var(--ui-space-3xl)' },
]

const SEMANTIC_STATES = [
  { key: 'success', label: 'Success' },
  { key: 'warning', label: 'Warning' },
  { key: 'error',   label: 'Error' },
  { key: 'info',    label: 'Info' },
]

export function LiveSystemSection() {
  const { slots, dataVizN, stateOverrides } = useColor()
  const { pairing } = useTypography()

  const headingFont = pairing?.heading ?? '—'
  const bodyFont    = pairing?.body    ?? '—'

  return (
    <section className={styles.section}>
      <div className={styles.liveSystemIntro}>
        <div className={styles.sectionLabel}>This page runs on your tokens.</div>
        <p className={styles.liveSystemSubLabel}>
          Every color, font, and component below is rendered live using your current design system.
        </p>
      </div>

      <div className={styles.liveSystemGrid}>

        {/* ── Colors block ── */}
        <div className={styles.liveSystemColors}>
          <div className={styles.liveSystemBlockLabel}>Colors</div>

          <div className={styles.paletteRow}>
            {slots.map((slot) => (
              <div key={slot.id} className={styles.swatchCard}>
                <div className={styles.swatch} style={{ background: `var(--color-${slot.role}-500)` }} />
                <span className={styles.swatchLabel}>{slot.name ?? POSITION_LABELS[slot.role]}</span>
                <span className={styles.swatchHex}>{slot.hex}</span>
              </div>
            ))}
          </div>

          <div className={styles.paletteRow}>
            {SEMANTIC_STATES.map(({ key, label }) => {
              const overrideHex = stateOverrides[key as keyof typeof stateOverrides]
              return (
                <div key={key} className={styles.swatchCard}>
                  <div className={styles.swatch} style={{ background: `var(--color-${key})` }} />
                  <span className={styles.swatchLabel}>{label}</span>
                  {overrideHex !== undefined && <span className={styles.swatchHex}>{overrideHex}</span>}
                </div>
              )
            })}
          </div>

          <div className={styles.datavizStrip}>
            {Array.from({ length: dataVizN }, (_, i) => (
              <div
                key={i}
                className={styles.datavizSegment}
                style={{ background: `var(--color-dataviz-${i + 1})` }}
              />
            ))}
          </div>
        </div>

        {/* ── Typography block ── */}
        <div className={styles.liveSystemTypography}>
          <div className={styles.liveSystemBlockLabel}>Typography</div>

          <div className={styles.fontPairingBadge}>{headingFont} + {bodyFont}</div>

          <div className={styles.typeScale}>
            {SPECIMEN_ROWS.map((row) => (
              <div key={row.label} className={styles.typeRow}>
                <span className={styles.typeLabel}>{row.label}</span>
                <span
                  className={styles.typeSpecimen}
                  style={{ fontFamily: row.fontFamily, fontSize: row.fontSize, fontWeight: row.fontWeight }}
                >
                  {row.sample}
                </span>
                <span className={styles.typeMeta}>{row.fontSize} / {row.fontWeight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Components block ── */}
        <div className={styles.liveSystemComponents}>
          <div className={styles.liveSystemBlockLabel}>Components</div>

          <div className={styles.componentGroup}>
            <div className={styles.componentGroupLabel}>Buttons</div>
            <div className={styles.buttonRow}>
              <button className={`${styles.demoBtn} ${styles.demoBtnPrimary}`}>Save design</button>
              <button className={`${styles.demoBtn} ${styles.demoBtnSecondary}`}>Preview</button>
              <button className={`${styles.demoBtn} ${styles.demoBtnGhost}`}>Cancel</button>
              <button className={`${styles.demoBtn} ${styles.demoBtnDestructive}`}>Delete</button>
            </div>
          </div>

          <div className={styles.componentGroup}>
            <div className={styles.componentGroupLabel}>Badges</div>
            <div className={styles.badgeRow}>
              <span className={styles.demoBadge} style={{ background: 'var(--color-surface-raised)', color: 'var(--color-on-surface-subtle)' }}>Default</span>
              <span className={styles.demoBadge} style={{ background: 'var(--color-success-container)', color: 'var(--color-success)' }}>Success</span>
              <span className={styles.demoBadge} style={{ background: 'var(--color-warning-container)', color: 'var(--color-warning)' }}>Warning</span>
              <span className={styles.demoBadge} style={{ background: 'var(--color-error-container)', color: 'var(--color-error)' }}>Error</span>
              <span className={styles.demoBadge} style={{ background: 'var(--color-info-container)', color: 'var(--color-info)' }}>Info</span>
            </div>
          </div>

          <div className={styles.componentGroup}>
            <div className={styles.componentGroupLabel}>Input</div>
            <div className={styles.inputGroup}>
              <label className={styles.demoLabel} htmlFor="live-system-email">Email</label>
              <input id="live-system-email" className={styles.demoInput} type="email" placeholder="you@example.com" />
            </div>
          </div>

          <div className={styles.componentGroup}>
            <div className={styles.componentGroupLabel}>Alerts</div>
            <div className={styles.alertGrid}>
              <div className={styles.alertCard} style={{ background: 'var(--color-success-container)', borderLeftColor: 'var(--color-success)' }}>
                <span className={styles.alertIcon}>✓</span>
                <div><div className={styles.alertTitle}>Tokens compiled</div><div className={styles.alertBody}>47 tokens · no contrast errors</div></div>
              </div>
              <div className={styles.alertCard} style={{ background: 'var(--color-info-container)', borderLeftColor: 'var(--color-info)' }}>
                <span className={styles.alertIcon}>ℹ</span>
                <div><div className={styles.alertTitle}>New harmony model</div><div className={styles.alertBody}>Triadic — 4 accents generated</div></div>
              </div>
              <div className={styles.alertCard} style={{ background: 'var(--color-warning-container)', borderLeftColor: 'var(--color-warning)' }}>
                <span className={styles.alertIcon}>⚠</span>
                <div><div className={styles.alertTitle}>Breaking change</div><div className={styles.alertBody}>Token names changed in v2</div></div>
              </div>
              <div className={styles.alertCard} style={{ background: 'var(--color-error-container)', borderLeftColor: 'var(--color-error)' }}>
                <span className={styles.alertIcon}>✕</span>
                <div><div className={styles.alertTitle}>Contrast failed</div><div className={styles.alertBody}>Body text below 4.5:1 on surface-raised</div></div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Spacing (compact) block ── */}
        <div className={styles.liveSystemSpacing}>
          <div className={styles.liveSystemBlockLabel}>Spacing</div>
          <div className={styles.compactSpacingScale}>
            {COMPACT_SPACING_STEPS.map((step) => (
              <div key={step.key} className={styles.compactSpacingRow}>
                <span className={styles.compactSpacingKey}>{step.key}</span>
                <div className={styles.compactSpacingBar} style={{ width: step.varName }} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
