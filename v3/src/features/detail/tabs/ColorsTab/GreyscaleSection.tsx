import { useState } from 'react'
import { useColor } from '@/store'
import styles from './GreyscaleSection.module.css'

const NEUTRAL_STEPS = [
  { label: 'background',       token: '--color-background' },
  { label: 'surface',          token: '--color-surface' },
  { label: 'surface-raised',   token: '--color-surface-raised' },
  { label: 'border',           token: '--color-border' },
  { label: 'border-strong',    token: '--color-border-strong' },
  { label: 'on-surface-subtle', token: '--color-on-surface-subtle' },
  { label: 'on-surface',       token: '--color-on-surface' },
]

export function GreyscaleSection() {
  // Re-render when color slots change so resolved values stay fresh
  useColor()

  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  const resolvedColors = NEUTRAL_STEPS.map(s => ({
    ...s,
    hex: getComputedStyle(document.documentElement).getPropertyValue(s.token).trim() || '#888888',
  }))

  const handleCopy = (hex: string, token: string) => {
    navigator.clipboard.writeText(hex).catch(() => {})
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 1500)
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionTitle}>Greyscale / Neutrals</div>
      <div className={styles.strip}>
        {resolvedColors.map(({ label, token, hex }) => (
          <button
            key={token}
            className={styles.swatch}
            style={{ background: hex }}
            onClick={() => handleCopy(hex, token)}
            title={`${token}\n${hex}\nClick to copy`}
            aria-label={`Copy ${hex}`}
          >
            {copiedToken === token && (
              <span className={styles.copied}>✓</span>
            )}
          </button>
        ))}
      </div>
      <div className={styles.labels}>
        {resolvedColors.map(({ label, token, hex }) => (
          <div key={token} className={styles.labelCell}>
            <div className={styles.tokenName}>{label}</div>
            <div className={styles.hex}>{hex}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
