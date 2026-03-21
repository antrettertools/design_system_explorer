import { useTypography, useTypographyActions } from '@/store'
import type { TypeScaleStep } from '@/core/typography/types'
import styles from './TypographySpecimen.module.css'

const SPECIMEN_TEXT = 'The quick brown fox jumps over the lazy dog'

const SCALE_PILLS: { key: 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'xs'; label: string }[] = [
  { key: 'h1', label: 'H1' },
  { key: 'h2', label: 'H2' },
  { key: 'h3', label: 'H3' },
  { key: 'body', label: 'Body' },
  { key: 'small', label: 'sm' },
  { key: 'xs', label: 'xs' },
]

export function TypographySpecimen() {
  const { pairing, scale, locks } = useTypography()
  const { toggleLock } = useTypographyActions()

  if (!pairing || !scale) return null

  return (
    <div className={styles.section}>
      <div className={styles.fontNames}>
        <span className={styles.fontNameLabel}>
          Heading: <strong>{pairing.heading}</strong> \u00b7 Body: <strong>{pairing.body}</strong>
        </span>
        <div className={styles.lockRow}>
          <button
            className={`${styles.lockBtn} ${locks.heading ? styles.locked : ''}`}
            onClick={() => toggleLock('heading')}
            title={locks.heading ? 'Unlock heading font' : 'Lock heading font'}
            aria-pressed={locks.heading}
          >
            {locks.heading ? '\uD83D\uDD12' : '\uD83D\uDD13'} Heading
          </button>
          <button
            className={`${styles.lockBtn} ${locks.body ? styles.locked : ''}`}
            onClick={() => toggleLock('body')}
            title={locks.body ? 'Unlock body font' : 'Lock body font'}
            aria-pressed={locks.body}
          >
            {locks.body ? '\uD83D\uDD12' : '\uD83D\uDD13'} Body
          </button>
          <button
            className={`${styles.lockBtn} ${locks.scale ? styles.locked : ''}`}
            onClick={() => toggleLock('scale')}
            title={locks.scale ? 'Unlock scale ratio' : 'Lock scale ratio'}
            aria-pressed={locks.scale}
          >
            {locks.scale ? '\uD83D\uDD12' : '\uD83D\uDD13'} Scale
          </button>
        </div>
      </div>

      <div
        className={styles.heading}
        style={{ fontFamily: `"${pairing.heading}", serif` }}
        aria-label="Heading specimen"
      >
        {SPECIMEN_TEXT}
      </div>

      <div
        className={styles.body}
        style={{ fontFamily: `"${pairing.body}", sans-serif` }}
        aria-label="Body specimen"
      >
        How vexingly quick daft zebras jump! Pack my box with five dozen liquor jugs.
      </div>

      <div className={styles.scalePills} role="list" aria-label="Type scale">
        {SCALE_PILLS.map(({ key, label }) => {
          const step = scale[key] as TypeScaleStep | undefined
          if (!step) return null
          return (
            <div key={key} className={styles.pill} role="listitem">
              <span className={styles.pillLabel}>{label}</span>
              <span>{Math.round(step.size)}px</span>
              <span>\u00b7</span>
              <span>{step.weight}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
