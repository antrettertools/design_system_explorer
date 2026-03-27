import { useTypography } from '@/store'
import styles from './CharacterSet.module.css'

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const DIGITS = '0123456789'
const PUNCTUATION = '! @ # $ % ^ & * ( ) - + = [ ] { } | ; : \' " , . / < > ? ` ~'
const DIACRITICS = 'À Á Â Ã Ä Å Æ Ç È É Ê Ë Ì Í Î Ï Ð Ñ Ò Ó Ô Õ Ö'

const WEIGHTS = [
  { weight: 400, label: 'Regular 400' },
  { weight: 500, label: 'Medium 500' },
  { weight: 600, label: 'Semi-bold 600' },
  { weight: 700, label: 'Bold 700' },
  { weight: 800, label: 'Extra-bold 800' },
]

export function CharacterSet() {
  const { pairing } = useTypography()
  if (!pairing) return null

  const renderFont = (name: string, role: 'Heading' | 'Body', isSerif: boolean) => (
    <div key={name} className={styles.fontBlock}>
      <div className={styles.fontName}>{name} — {role}</div>
      <div
        className={styles.charset}
        style={{ fontFamily: `"${name}", ${isSerif ? 'serif' : 'sans-serif'}` }}
      >
        <div>{UPPERCASE}</div>
        <div>{LOWERCASE}</div>
        <div>{DIGITS}</div>
        <div className={styles.charsetMuted}>{PUNCTUATION}</div>
        <div className={styles.charsetMuted}>{DIACRITICS}</div>
      </div>
      <div className={styles.weightRow}>
        {WEIGHTS.map(({ weight, label }) => (
          <span
            key={weight}
            className={styles.weightSample}
            style={{ fontFamily: `"${name}", serif`, fontWeight: weight }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Character Sets</div>
      {renderFont(pairing.heading, 'Heading', true)}
      {pairing.body !== pairing.heading && renderFont(pairing.body, 'Body', false)}
    </div>
  )
}
