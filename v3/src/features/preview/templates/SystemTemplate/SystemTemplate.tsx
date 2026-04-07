import { useColor, useTypography, useSpacing, useEffects, useComponents } from '@/store'
import { POSITION_LABELS } from '@/core/color/types'
import { TemplateIcon } from '../shared/TemplateIcon'
import type { IconSlug } from '../shared/TemplateIcon'
import { PreviewFooter } from '../shared/PreviewFooter'
import styles from './SystemTemplate.module.css'

const SHADE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

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

const SPACING_STEPS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const
const RADIUS_STEPS = ['none', 'sm', 'md', 'lg', 'xl', 'full'] as const
const SHADOW_STEPS = ['sm', 'md', 'lg', 'xl'] as const

type TypeRow = {
  label: string
  sizeVar: string
  weightVar: string
  family: 'heading' | 'body'
  sample: string
}

const TYPE_ROWS: TypeRow[] = [
  { label: 'Display', sizeVar: '--font-size-display', weightVar: '--font-weight-display', family: 'heading', sample: 'The quick brown fox' },
  { label: 'H1',      sizeVar: '--font-size-h1',      weightVar: '--font-weight-h1',      family: 'heading', sample: 'The quick brown fox jumps' },
  { label: 'H2',      sizeVar: '--font-size-h2',      weightVar: '--font-weight-h2',      family: 'heading', sample: 'Pack my box with five dozen liquor jugs' },
  { label: 'H3',      sizeVar: '--font-size-h3',      weightVar: '--font-weight-h3',      family: 'heading', sample: 'The jay, pig, fox, zebra and my wolves' },
  { label: 'Body',    sizeVar: '--font-size-body',     weightVar: '--font-weight-body',    family: 'body',    sample: 'The five boxing wizards jump quickly. How vexingly quick daft zebras jump.' },
  { label: 'Small',   sizeVar: '--font-size-small',    weightVar: '--font-weight-small',   family: 'body',    sample: 'Caption · Label · Meta · Annotation' },
]

function TypographySpecimenTable() {
  return (
    <div className={styles.typeSpecimenTable}>
      {TYPE_ROWS.map(row => (
        <div key={row.label} className={styles.typeSpecimenRow}>
          <span className={styles.typeRowLabel}>{row.label}</span>
          <span
            className={styles.typeRowSample}
            style={{
              fontFamily: row.family === 'heading' ? 'var(--font-heading)' : 'var(--font-body)',
              fontSize: `var(${row.sizeVar})`,
              fontWeight: `var(${row.weightVar})` as React.CSSProperties['fontWeight'],
            }}
          >
            {row.sample}
          </span>
          <span className={styles.typeRowMeta}>
            {`var(${row.sizeVar})`}
          </span>
        </div>
      ))}
    </div>
  )
}

const ALL_ICON_SLUGS: IconSlug[] = [
  'home', 'search', 'settings', 'user', 'heart', 'star',
  'bell', 'mail', 'calendar', 'clock', 'camera', 'image',
  'file', 'folder', 'trash', 'edit', 'plus', 'minus',
  'check', 'x', 'arrow-right', 'arrow-left', 'chevron-down', 'menu',
]

function IconGallerySection() {
  const { iconLibrary } = useComponents()
  return (
    <div className={styles.section}>
      <div className={styles.sectionLabel}>Icons · {iconLibrary}</div>
      <div className={styles.iconGrid}>
        {ALL_ICON_SLUGS.map(slug => (
          <div key={slug} className={styles.iconCell}>
            <div className={styles.iconCellIcon}>
              <TemplateIcon slug={slug} size={18} />
            </div>
            <div className={styles.iconCellLabel}>{slug}</div>
          </div>
        ))}
      </div>
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

const TYPOGRAPHY_VAR_NAMES = [
  '--font-size-display', '--font-size-h1', '--font-size-h2', '--font-size-h3',
  '--font-size-body', '--font-size-small',
  '--font-weight-display', '--font-weight-h1', '--font-weight-body',
]

const SPACING_VAR_NAMES = [
  '--ui-space-xs', '--ui-space-sm', '--ui-space-md',
  '--ui-space-lg', '--ui-space-xl', '--ui-space-2xl', '--ui-space-3xl',
  '--radius-none', '--radius-sm', '--radius-md', '--radius-lg', '--radius-full',
]

type VarRow = { name: string; value: string; isColor: boolean }

function CssVarsSection() {
  const colorRows: VarRow[] = COLOR_VAR_NAMES.map(name => ({
    name,
    value: getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '',
    isColor: true,
  })).filter(r => r.value)

  const typographyRows: VarRow[] = TYPOGRAPHY_VAR_NAMES.map(name => ({
    name,
    value: getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '',
    isColor: false,
  })).filter(r => r.value)

  const spacingRows: VarRow[] = SPACING_VAR_NAMES.map(name => ({
    name,
    value: getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '',
    isColor: false,
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
          <tr>
            <td colSpan={3} className={styles.cssVarCategory}>Colors</td>
          </tr>
          {colorRows.map(({ name, value }) => (
            <tr key={name} className={styles.cssVarRow}>
              <td className={styles.cssVarName}>{name}</td>
              <td className={styles.cssVarValue}>{value}</td>
              <td>
                <div className={styles.cssVarSwatch} style={{ background: value }} />
              </td>
            </tr>
          ))}
          {typographyRows.length > 0 && (
            <tr>
              <td colSpan={3} className={styles.cssVarCategory}>Typography</td>
            </tr>
          )}
          {typographyRows.map(({ name, value }) => (
            <tr key={name} className={styles.cssVarRow}>
              <td className={styles.cssVarName}>{name}</td>
              <td className={styles.cssVarValue}>{value}</td>
              <td />
            </tr>
          ))}
          {spacingRows.length > 0 && (
            <tr>
              <td colSpan={3} className={styles.cssVarCategory}>Spacing</td>
            </tr>
          )}
          {spacingRows.map(({ name, value }) => (
            <tr key={name} className={styles.cssVarRow}>
              <td className={styles.cssVarName}>{name}</td>
              <td className={styles.cssVarValue}>{value}</td>
              <td />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function SystemTemplate() {
  const { slots, dataVizN, activeRecipe } = useColor()
  const { pairing } = useTypography()
  const { config: spacingConfig, overrides: spacingOverrides, radiusOverrides, baseUnit } = useSpacing()
  const { config: effectsConfig, shadowMode, shadowOverrides } = useEffects()

  const effectiveSpacing = { ...spacingConfig.scale, ...spacingOverrides }
  const effectiveRadius = { ...spacingConfig.radius, ...radiusOverrides }
  const effectiveShadows = {
    ...(shadowMode === 'colored' ? effectsConfig.shadows : effectsConfig.shadowsNeutral),
    ...shadowOverrides,
  }

  const brandSlot = slots.find(s => s.role === 'brand') ?? slots[0]
  const brandHex = brandSlot?.hex ?? '#888888'

  const dvPalette = Array.from({ length: Math.min(dataVizN, 8) }, (_, i) =>
    getCssVar(`--color-dataviz-${i + 1}`)
  )

  const otherSlots = slots.filter(s => s.role !== 'brand')

  return (
    <div className={styles.page}>
      <div className={styles.doc}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.systemLabel}>Design System</div>
          <div className={styles.wordmark}>dsygn.cloud</div>
          <div className={styles.systemMeta}>
            Generated {TODAY}
            {activeRecipe ? ` · ${activeRecipe.label}` : ''}
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
                  <div className={styles.compactScaleLabel}>{slot.name ?? POSITION_LABELS[slot.role]}</div>
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
            </div>

            <TypographySpecimenTable />

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

        {/* ICON LIBRARY */}
        <IconGallerySection />

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

        {/* SPACING */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Spacing · {baseUnit}pt grid</div>
          <div className={styles.spacingTable}>
            {SPACING_STEPS.map(step => {
              const value = effectiveSpacing[step]
              const isOverridden = step in spacingOverrides
              return (
                <div key={step} className={styles.spacingRow}>
                  <div className={styles.spacingStepName}>{step}</div>
                  <div className={styles.spacingBar}>
                    <div
                      className={styles.spacingBarFill}
                      style={{
                        width: `${Math.min(value, 96)}px`,
                        background: isOverridden ? 'var(--color-interactive, #e8543a)' : 'var(--color-brand-400, #e8543a)',
                      }}
                    />
                  </div>
                  <div className={styles.spacingValue}>{value}px</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* RADIUS */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Border Radius</div>
          <div className={styles.radiusRow}>
            {RADIUS_STEPS.map(step => {
              const value = effectiveRadius[step as keyof typeof effectiveRadius]
              const isOverridden = step in radiusOverrides
              const cssRadius = step === 'full' ? 9999 : value
              return (
                <div key={step} className={styles.radiusCell}>
                  <div
                    className={styles.radiusBox}
                    style={{
                      borderRadius: `${cssRadius}px`,
                      borderColor: isOverridden ? 'var(--color-interactive, #e8543a)' : 'var(--color-border, #e8e4df)',
                    }}
                  />
                  <div className={styles.radiusLabel}>{step}</div>
                  <div className={styles.radiusValue}>{step === 'full' ? '∞' : `${value}px`}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* EFFECTS */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Effects · {shadowMode} shadows</div>
          <div className={styles.shadowRow}>
            {SHADOW_STEPS.map(step => (
              <div key={step} className={styles.shadowCard} style={{ boxShadow: effectiveShadows[step as keyof typeof effectiveShadows] ?? 'none' }}>
                <div className={styles.shadowCardLabel}>{step}</div>
              </div>
            ))}
          </div>
          <div className={styles.focusRingRow}>
            <div
              className={styles.focusRingSample}
              style={{
                outlineColor: effectsConfig.focusRing.color,
                outlineWidth: effectsConfig.focusRing.width,
                outlineOffset: effectsConfig.focusRing.offset,
              }}
            >
              Focus ring
            </div>
            <div className={styles.focusRingMeta}>
              {effectsConfig.focusRing.width} · {effectsConfig.focusRing.color}
            </div>
          </div>
        </div>

        {/* CSS CUSTOM PROPERTIES */}
        <CssVarsSection />
      </div>
      <PreviewFooter />
    </div>
  )
}
