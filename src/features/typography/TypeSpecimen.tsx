import { useTypography } from '@/store'
import { useFont } from '@/hooks/useFont'
import styles from './TypeSpecimen.module.css'

const CHAR_SET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' +
  '!@#$%&*(){}[]<>?/+=-_:;,.…«»""' +
  "''→←↑↓∞√π∑∏∆€£¥¢©®™°·×÷"

interface TypeSpecimenProps {
  customText?: string
}

export function TypeSpecimen({ customText }: TypeSpecimenProps) {
  const typography = useTypography()
  const { fontFamilyStack, variationSettings } = useFont()

  const baseStyle: React.CSSProperties = {
    fontFamily: fontFamilyStack,
    fontWeight: typography.fontWeight,
    lineHeight: typography.lineHeight,
    letterSpacing: `${typography.letterSpacing}em`,
    ...(variationSettings ? { fontVariationSettings: variationSettings } : {}),
  }

  const scale = (mult: number) => Math.round(typography.fontSize * mult)

  if (customText !== undefined) {
    return (
      <div style={{ ...baseStyle, fontSize: scale(1.5), lineHeight: 1.5 }}>
        {customText || <span style={{ color: 'var(--text-3)' }}>Type something…</span>}
      </div>
    )
  }

  return (
    <div className={styles.specimen}>
      <div className={styles.h1} style={{ ...baseStyle, fontSize: scale(3) }}>
        Display Heading
      </div>
      <div className={styles.h2} style={{ ...baseStyle, fontSize: scale(2) }}>
        Section Title — {scale(2)}px
      </div>
      <div className={styles.h3} style={{ ...baseStyle, fontSize: scale(1.5) }}>
        Subsection, Semibold
      </div>
      <div className={styles.h4} style={{ ...baseStyle, fontSize: scale(1.125) }}>
        Card Title, Medium Weight
      </div>
      <div
        className={styles.body}
        style={{ ...baseStyle, fontSize: typography.fontSize }}
      >
        Body text at {typography.fontSize}px with {typography.lineHeight} line height.
        Optimized for reading longer passages of content. The quick brown fox jumps over
        the lazy dog while the five boxing wizards jump quickly.
      </div>
      <div className={styles.small} style={{ ...baseStyle, fontSize: scale(0.8) }}>
        Caption / metadata text — smaller and lighter
      </div>
      <div className={styles.monoSample}>
        {`const system = { font: '${typography.fontFamily}', weight: ${typography.fontWeight} };`}
      </div>
    </div>
  )
}

export function CharacterGrid() {
  const typography = useTypography()
  const { fontFamilyStack, variationSettings } = useFont()

  const cellStyle: React.CSSProperties = {
    fontFamily: fontFamilyStack,
    fontWeight: typography.fontWeight,
    ...(variationSettings ? { fontVariationSettings: variationSettings } : {}),
  }

  return (
    <div className={styles.charGrid}>
      {[...CHAR_SET].map((char, i) => (
        <div key={i} className={styles.charCell} style={cellStyle}>
          {char}
        </div>
      ))}
    </div>
  )
}
