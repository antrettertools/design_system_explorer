import { useColor, useTypography } from '@/store'
import styles from './SystemTemplate.module.css'

const SHADE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

const ROLE_LABELS: Record<string, string> = {
  brand: 'Brand', secondary: 'Secondary', accentA: 'Accent A', accentB: 'Accent B',
}

const TODAY = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

const DEMO_HEIGHTS = [80, 55, 70, 40, 90, 60, 45, 75]

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const DIGITS = '0123456789'
const SPECIAL = '! @ # $ % & * ( ) - + = [ ] | ; : \' " , . / < > ? `'
const DIACRITICS = 'À Á Â Ã Ä Å Æ Ç È É Ê Ë'

const KEY_SEMANTIC = ['interactive', 'interactive-subtle', 'background', 'on-surface', 'border'] as const
const STATE_PREFIXES = ['error', 'warning', 'success', 'info'] as const

function isLightHex(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150
}

function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888'
}

export function SystemTemplate() {
  const { slots, dataVizN, activeModel } = useColor()
  const { pairing } = useTypography()

  const brandSlot = slots.find(s => s.role === 'brand') ?? slots[0]
  const brandHex = brandSlot?.hex ?? '#888888'

  const dvPalette = Array.from({ length: Math.min(dataVizN, 8) }, (_, i) =>
    getCssVar(`--color-dataviz-${i + 1}`)
  )

  const otherSlots = slots.filter(s => s.role !== 'brand')

  return (
    <div className={styles.doc}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.systemLabel}>Design System</div>
        <div className={styles.wordmark}>palette.</div>
        <div className={styles.systemMeta}>
          Generated {TODAY}
          {activeModel ? ` · ${activeModel} harmony` : ''}
          {pairing ? ` · ${pairing.heading} + ${pairing.body}` : ''}
        </div>
      </div>

      {/* COLORS */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Colors</div>

        {/* Brand scale — full width */}
        <div className={styles.brandScaleRow}>
          <div className={styles.colorRowHeader}>
            <span className={styles.colorRoleName}>Brand</span>
            <span className={styles.colorMeta}>{brandHex.toUpperCase()}</span>
          </div>
          <div className={styles.brandScale}>
            {SHADE_STEPS.map(step => {
              const hex = getCssVar(`--color-brand-${step}`)
              const light = isLightHex(hex)
              return (
                <div key={step} className={styles.brandScaleCell} style={{ background: hex }}>
                  {(step === 50 || step === 500 || step === 950) && (
                    <span className={`${styles.brandScaleStep} ${light ? styles.brandScaleStepDark : ''}`}>
                      {step}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Secondary + accent compact rows */}
        {otherSlots.length > 0 && (
          <div className={styles.compactScaleRow}>
            {otherSlots.map(slot => (
              <div key={slot.id} className={styles.compactScaleBlock}>
                <div className={styles.compactScaleLabel}>{ROLE_LABELS[slot.role] ?? slot.role}</div>
                <div className={styles.compactScale}>
                  {SHADE_STEPS.map(step => (
                    <div
                      key={step}
                      className={styles.compactScaleCell}
                      style={{ background: getCssVar(`--color-${slot.role}-${step}`) }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Key semantic swatches */}
        <div className={styles.semanticGrid}>
          {KEY_SEMANTIC.map(role => {
            const hex = getCssVar(`--color-${role}`)
            return (
              <div key={role} style={{ textAlign: 'center' }}>
                <div
                  className={styles.semanticSwatch}
                  style={{ background: hex }}
                  title={role}
                />
                <div className={styles.semanticLabel}>{role}</div>
              </div>
            )
          })}
        </div>

        {/* State colors */}
        <div className={styles.stateRow}>
          {STATE_PREFIXES.map(prefix => (
            <div key={prefix} className={styles.stateCard}>
              <div className={styles.statePair}>
                <div className={styles.stateSwatch} style={{ background: getCssVar(`--color-${prefix}`) }} />
                <div className={styles.stateSwatch} style={{ background: getCssVar(`--color-${prefix}-container`) }} />
              </div>
              <div className={styles.stateLabel}>{prefix}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TYPOGRAPHY */}
      {pairing && (
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Typography</div>

          <div className={styles.fontSpecimen}>
            <div className={styles.fontHeadingName}>{pairing.heading} — Heading</div>
            <div className={styles.displaySpec}>Display — 72px / 800</div>
            <div className={styles.h1Spec}>Heading 1 — The quick brown fox jumps</div>
            <div className={styles.h2Spec}>Heading 2 — over the lazy dog. Pack my box</div>
            <div className={styles.h3Spec}>Heading 3 — with five dozen liquor jugs.</div>
          </div>

          <div className={styles.bodySpec} style={{ fontFamily: `"${pairing.body}", sans-serif` }}>
            Body 16px — The five boxing wizards jump quickly. How vexingly quick daft zebras jump.
            The jay, pig, fox, zebra and my wolves quack.
          </div>

          {/* Character sets */}
          <div className={styles.charsetBlock}>
            <div className={styles.charsetLabel}>Character Set — {pairing.heading}</div>
            <div className={styles.charset} style={{ fontFamily: `"${pairing.heading}", serif` }}>
              <div>{UPPERCASE}</div>
              <div>{LOWERCASE}</div>
              <div>{DIGITS}</div>
              <div className={styles.charsetMuted}>{SPECIAL}</div>
              <div className={styles.charsetMuted}>{DIACRITICS}</div>
            </div>
            <div className={styles.weightRow} style={{ fontFamily: `"${pairing.heading}", serif` }}>
              {[400, 500, 600, 700, 800].map(w => (
                <span key={w} style={{ fontWeight: w }}>Weight {w}</span>
              ))}
            </div>
          </div>

          {pairing.body !== pairing.heading && (
            <div className={styles.charsetBlock}>
              <div className={styles.charsetLabel}>Character Set — {pairing.body} (Body)</div>
              <div className={styles.charset} style={{ fontFamily: `"${pairing.body}", sans-serif` }}>
                <div>{UPPERCASE} · {LOWERCASE} · {DIGITS}</div>
                <div className={styles.charsetMuted}>{SPECIAL}</div>
              </div>
              <div className={styles.weightRow} style={{ fontFamily: `"${pairing.body}", sans-serif` }}>
                {[400, 500, 600, 700].map(w => (
                  <span key={w} style={{ fontWeight: w }}>Weight {w}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* DATA VIZ */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Data Visualization · {dvPalette.length}-color categorical palette</div>
        <div className={styles.dataVizPalette}>
          {dvPalette.map((hex, i) => (
            <div key={i} className={styles.dataVizCell} style={{ background: hex }} title={hex} />
          ))}
        </div>
        <div className={styles.miniChart}>
          {dvPalette.map((hex, i) => (
            <div
              key={i}
              className={styles.miniBar}
              style={{ background: hex, height: `${DEMO_HEIGHTS[i % DEMO_HEIGHTS.length]}%` }}
            />
          ))}
        </div>
      </div>

      {/* CSS CUSTOM PROPERTIES */}
      <CssVarsSection />
    </div>
  )
}

const COLOR_VAR_NAMES = [
  '--color-background', '--color-surface', '--color-surface-raised',
  '--color-on-surface', '--color-on-surface-subtle',
  '--color-border', '--color-border-strong',
  '--color-interactive', '--color-on-interactive',
  '--color-interactive-subtle', '--color-interactive-hover', '--color-interactive-container',
  '--color-error', '--color-error-container',
  '--color-warning', '--color-warning-container',
  '--color-success', '--color-success-container',
  '--color-info', '--color-info-container',
]

function CssVarsSection() {
  const rows = COLOR_VAR_NAMES.map(name => ({
    name,
    value: getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '',
  })).filter(r => r.value)

  return (
    <div className={styles.section}>
      <div className={styles.sectionLabel}>CSS Custom Properties</div>
      <table className={styles.cssVarTable}>
        <thead>
          <tr>
            <th className={styles.cssVarTh}>Variable</th>
            <th className={styles.cssVarTh}>Value</th>
            <th className={styles.cssVarTh}>Swatch</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ name, value }) => (
            <tr key={name} className={styles.cssVarRow}>
              <td className={styles.cssVarName}>{name}</td>
              <td className={styles.cssVarValue}>{value}</td>
              <td>
                <div className={styles.cssVarSwatch} style={{ background: value }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
