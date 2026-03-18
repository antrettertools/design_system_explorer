import { useTypography } from '@/store'
import { useFont } from '@/hooks/useFont'
import { useTokens } from '@/hooks/useTokens'
import styles from './TypeSpecimen.module.css'

const CHAR_SET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' +
  '!@#$%&*(){}[]<>?/+=-_:;,.…«»""' +
  "''→←↑↓∞√π∑∏∆€£¥¢©®™°·×÷"

const SCALE_LABELS: Record<string, { role: string; label: string; font: 'heading' | 'body' }> = {
  '5xl':  { role: 'Display',    label: 'Hero / Display',      font: 'heading' },
  '4xl':  { role: 'H1',         label: 'Heading 1',           font: 'heading' },
  '3xl':  { role: 'H2',         label: 'Heading 2',           font: 'heading' },
  '2xl':  { role: 'H3',         label: 'Heading 3',           font: 'heading' },
  xl:     { role: 'H4',         label: 'Heading 4',           font: 'heading' },
  lg:     { role: 'Sub',        label: 'Subheading',          font: 'body' },
  md:     { role: 'Lead',       label: 'Lead / Intro',        font: 'body' },
  base:   { role: 'Body',       label: 'Body',                font: 'body' },
  sm:     { role: 'Small',      label: 'Small / Secondary',   font: 'body' },
  xs:     { role: 'Caption',    label: 'Caption / Label',     font: 'body' },
}

interface TypeSpecimenProps {
  customText?: string
}

export function TypeSpecimen({ customText }: TypeSpecimenProps) {
  const typography = useTypography()
  const { heading, body } = useFont()
  const tokens = useTokens()

  const headingStyle = (size: number): React.CSSProperties => ({
    fontFamily: heading.fontFamilyStack,
    fontWeight: typography.headingWeight,
    lineHeight: typography.headingLineHeight,
    letterSpacing: `${typography.headingLetterSpacing}em`,
    fontSize: size,
    ...(heading.variationSettings ? { fontVariationSettings: heading.variationSettings } : {}),
  })

  const bodyStyle = (size: number): React.CSSProperties => ({
    fontFamily: body.fontFamilyStack,
    fontWeight: typography.bodyWeight,
    lineHeight: typography.bodyLineHeight,
    letterSpacing: `${typography.bodyLetterSpacing}em`,
    fontSize: size,
    ...(body.variationSettings ? { fontVariationSettings: body.variationSettings } : {}),
  })

  const ts = tokens.typeScale

  if (customText !== undefined) {
    return (
      <div style={{ ...bodyStyle(ts.base), color: 'var(--text-0)' }}>
        {customText || <span style={{ color: 'var(--text-3)' }}>Type something…</span>}
      </div>
    )
  }

  return (
    <div className={styles.specimen}>
      {/* Font pair header */}
      <div style={{
        display: 'flex',
        gap: 16,
        marginBottom: 24,
        paddingBottom: 16,
        borderBottom: '1px solid var(--line)',
        flexWrap: 'wrap',
      }}>
        <FontLabel role="Heading" family={typography.headingFamily} badge="H" />
        <FontLabel role="Body" family={typography.bodyFamily} badge="B" />
      </div>

      {/* Heading scale */}
      <div className={styles.h1} style={headingStyle(ts['4xl'])}>
        Display Heading
      </div>
      <div className={styles.h2} style={headingStyle(ts['3xl'])}>
        Section Title — {Math.round(ts['3xl'])}px
      </div>
      <div className={styles.h3} style={headingStyle(ts['2xl'])}>
        Subsection Heading
      </div>
      <div className={styles.h4} style={headingStyle(ts.xl)}>
        Card / Panel Title
      </div>

      {/* Body copy */}
      <div className={styles.body} style={bodyStyle(ts.base)}>
        Body text at {typography.fontSize}px — {typography.bodyLineHeight} leading.
        The quick brown fox jumps over the lazy dog while the five boxing wizards
        jump quickly. Sphinx of black quartz, judge my vow.
      </div>
      <div className={styles.small} style={bodyStyle(ts.xs)}>
        Caption · metadata · labels — small supporting text at the bottom of the scale.
      </div>

      {/* Mono sample */}
      <div className={styles.monoSample}>
        {`heading: '${typography.headingFamily}' ${typography.headingWeight}wt · body: '${typography.bodyFamily}' ${typography.bodyWeight}wt`}
      </div>
    </div>
  )
}

/**
 * Full type scale table with semantic role labels.
 */
export function TypeScaleTable() {
  const typography = useTypography()
  const { heading, body } = useFont()
  const tokens = useTokens()
  const ts = tokens.typeScale

  const steps = ['5xl', '4xl', '3xl', '2xl', 'xl', 'lg', 'md', 'base', 'sm', 'xs'] as const

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {steps.map((step) => {
        const size = ts[step as keyof typeof ts] ?? 0
        const info = SCALE_LABELS[step]
        if (!info) return null
        const isHeading = info.font === 'heading'
        const fontStack = isHeading ? heading.fontFamilyStack : body.fontFamilyStack
        const weight = isHeading ? typography.headingWeight : typography.bodyWeight
        const lh = isHeading ? typography.headingLineHeight : typography.bodyLineHeight
        const ls = isHeading ? typography.headingLetterSpacing : typography.bodyLetterSpacing
        const variation = isHeading ? heading.variationSettings : body.variationSettings

        return (
          <div
            key={step}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 12,
              padding: '10px 0',
              borderBottom: '1px solid var(--line)',
            }}
          >
            {/* Role label */}
            <div style={{
              width: 52,
              flexShrink: 0,
              fontSize: 9,
              fontWeight: 700,
              fontFamily: 'var(--mono)',
              letterSpacing: '0.06em',
              color: isHeading ? 'var(--accent)' : '#6366f1',
              paddingTop: 2,
            }}>
              {info.role}
            </div>

            {/* Text preview */}
            <div style={{
              flex: 1,
              fontFamily: fontStack,
              fontSize: Math.min(size, 56),
              fontWeight: weight,
              lineHeight: lh,
              letterSpacing: `${ls}em`,
              color: 'var(--text-0)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              ...(variation ? { fontVariationSettings: variation } : {}),
            }}>
              {info.label}
            </div>

            {/* Size info */}
            <div style={{
              flexShrink: 0,
              textAlign: 'right',
              fontSize: 9,
              fontFamily: 'var(--mono)',
              color: 'var(--text-3)',
              lineHeight: 1.4,
            }}>
              <div>{Math.round(size)}px</div>
              <div style={{ color: isHeading ? 'var(--accent)' : '#6366f180', fontSize: 8 }}>
                {step}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function CharacterGrid() {
  const typography = useTypography()
  const { heading, body } = useFont()

  return (
    <div>
      {/* Heading font char grid */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          fontSize: 9,
          fontWeight: 700,
          fontFamily: 'var(--mono)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          marginBottom: 8,
        }}>
          Heading — {typography.headingFamily}
        </div>
        <div className={styles.charGrid}>
          {[...CHAR_SET].map((char, i) => (
            <div
              key={i}
              className={styles.charCell}
              style={{
                fontFamily: heading.fontFamilyStack,
                fontWeight: typography.headingWeight,
                ...(heading.variationSettings ? { fontVariationSettings: heading.variationSettings } : {}),
              }}
            >
              {char}
            </div>
          ))}
        </div>
      </div>

      {/* Body font char grid */}
      <div>
        <div style={{
          fontSize: 9,
          fontWeight: 700,
          fontFamily: 'var(--mono)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#6366f1',
          marginBottom: 8,
        }}>
          Body — {typography.bodyFamily}
        </div>
        <div className={styles.charGrid}>
          {[...CHAR_SET].map((char, i) => (
            <div
              key={i}
              className={styles.charCell}
              style={{
                fontFamily: body.fontFamilyStack,
                fontWeight: typography.bodyWeight,
                ...(body.variationSettings ? { fontVariationSettings: body.variationSettings } : {}),
              }}
            >
              {char}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FontLabel({ role, family, badge }: { role: string; family: string; badge: string }) {
  const isH = badge === 'H'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <span style={{
        fontSize: 9,
        fontWeight: 700,
        fontFamily: 'var(--mono)',
        padding: '2px 6px',
        borderRadius: 4,
        background: isH ? 'var(--accent-bg)' : '#6366f118',
        color: isH ? 'var(--accent)' : '#6366f1',
      }}>
        {badge}
      </span>
      <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{role}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{family}</span>
    </div>
  )
}
