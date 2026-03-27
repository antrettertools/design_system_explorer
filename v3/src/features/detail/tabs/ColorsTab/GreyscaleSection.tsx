import { useState } from 'react'
import { makeGreyscale } from '@/core/color/scales'
import styles from './GreyscaleSection.module.css'

const SHADE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

function isLightStep(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150
}

const GREY_SCALE = makeGreyscale()

export function GreyscaleSection() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  function handleCopy(step: number, hex: string) {
    navigator.clipboard?.writeText(hex)
    setCopiedKey(String(step))
    setTimeout(() => setCopiedKey(null), 1500)
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionTitle}>Greyscale</div>
      <div className={styles.note}>
        Pure achromatic scale · OKLCH C=0 · independent of brand color
      </div>
      <div className={styles.scaleRow} role="list" aria-label="Pure greyscale">
        {SHADE_STEPS.map(step => {
          const hex = GREY_SCALE[step as keyof typeof GREY_SCALE] ?? '#888'
          const isLight = isLightStep(hex)
          const copied = copiedKey === String(step)
          return (
            <div
              key={step}
              className={`${styles.scaleCell} ${isLight ? styles.scaleCellLight : ''}`}
              style={{ background: hex }}
              role="listitem"
              title={`grey-${step}: ${hex}`}
              onClick={() => handleCopy(step, hex)}
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter') handleCopy(step, hex) }}
              aria-label={`Step ${step}: ${hex}`}
            >
              <div className={styles.scaleCellLabel}>
                {copied
                  ? <span className={styles.scaleCellCopied}>✓</span>
                  : <span className={styles.scaleCellStep}>{step}</span>
                }
              </div>
            </div>
          )
        })}
      </div>
      <div className={styles.stepLabels}>
        {SHADE_STEPS.map(step => {
          const hex = GREY_SCALE[step as keyof typeof GREY_SCALE] ?? '#888'
          return (
            <div key={step} className={styles.stepLabel}>
              <span className={styles.stepHex}>{hex.toUpperCase()}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
