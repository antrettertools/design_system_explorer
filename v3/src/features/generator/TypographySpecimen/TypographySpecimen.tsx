import { useState } from 'react'
import { useTypography, useTypographyActions } from '@/store'
import type { TypeScaleStep } from '@/core/typography/types'
import { Lock, LockOpen } from 'lucide-react'
import styles from './TypographySpecimen.module.css'

const HEADING_KEYS = new Set(['h1', 'h2', 'h3'])

const SCALE_ROWS: { key: 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'xs'; tag: string }[] = [
  { key: 'h1',    tag: 'H1' },
  { key: 'h2',    tag: 'H2' },
  { key: 'h3',    tag: 'H3' },
  { key: 'body',  tag: 'Bd' },
  { key: 'small', tag: 'sm' },
  { key: 'xs',    tag: 'xs' },
]

const LOCK_PILLS: { key: 'heading' | 'body' | 'scale'; label: string }[] = [
  { key: 'heading', label: 'Heading' },
  { key: 'body',    label: 'Body' },
  { key: 'scale',   label: 'Scale' },
]

export function TypographySpecimen() {
  const { pairing, scale, locks } = useTypography()
  const { toggleLock, lockAllTypography, unlockAllTypography } = useTypographyActions()
  const allTypographyLocked = locks.heading && locks.body && locks.scale
  const [headingText, setHeadingText] = useState('The quick brown fox jumps over')
  const [bodyText, setBodyText] = useState('How vexingly quick daft zebras jump!')

  if (!pairing || !scale) return null

  return (
    <div className={styles.section}>
      {/* Section identity — mirrors GeneratorPanel sectionTitle/sectionResult */}
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>Typography</span>
        <button
          className={styles.sectionLockBtn}
          onClick={allTypographyLocked ? unlockAllTypography : lockAllTypography}
          title={allTypographyLocked ? 'Unlock all typography' : 'Lock all typography'}
          aria-label={allTypographyLocked ? 'Unlock all typography' : 'Lock all typography'}
          aria-pressed={allTypographyLocked}
        >
          {allTypographyLocked
            ? <Lock size={12} strokeWidth={2.5} />
            : <LockOpen size={12} strokeWidth={2.5} />}
        </button>
      </div>
      <span className={styles.sectionResult}>{pairing.heading} + {pairing.body}</span>

      {/* Lock pills — same grammar as RecipePillRow */}
      <div className={styles.controls} role="group" aria-label="Typography locks">
        {LOCK_PILLS.map(({ key, label }) => (
          <button
            key={key}
            className={`${styles.pill} ${locks[key] ? styles.pillActive : ''}`}
            onClick={() => toggleLock(key)}
            aria-pressed={locks[key]}
            title={locks[key] ? `Unlock ${label.toLowerCase()} font` : `Lock ${label.toLowerCase()} font`}
          >
            {locks[key]
              ? <Lock size={10} strokeWidth={2.5} />
              : <LockOpen size={10} strokeWidth={2.5} />}
            {label}
          </button>
        ))}
      </div>

      {/* Editable specimen inputs */}
      <div className={styles.inputs}>
        <div className={styles.inputRow}>
          <span className={styles.inputTag}>Hd</span>
          <input
            className={styles.input}
            value={headingText}
            onChange={e => setHeadingText(e.target.value)}
            placeholder="Heading specimen text…"
            aria-label="Heading specimen text"
            style={{ fontFamily: `"${pairing.heading}", Georgia, serif` }}
          />
        </div>
        <div className={styles.inputRow}>
          <span className={styles.inputTag}>Bd</span>
          <input
            className={styles.input}
            value={bodyText}
            onChange={e => setBodyText(e.target.value)}
            placeholder="Body specimen text…"
            aria-label="Body specimen text"
            style={{ fontFamily: `"${pairing.body}", sans-serif` }}
          />
        </div>
      </div>

      {/* Full type scale rows */}
      <div className={styles.scaleRows} role="list" aria-label="Type scale">
        {SCALE_ROWS.map(({ key, tag }, index) => {
          const step = scale[key] as TypeScaleStep | undefined
          if (!step) return null
          const isHeading = HEADING_KEYS.has(key)
          const showDivider = index === 3 // gap between headings and body levels

          return (
            <div key={key} role="listitem">
              {showDivider && <div className={styles.scaleDivider} aria-hidden="true" />}
              <div className={styles.scaleRow}>
                <span className={styles.scaleTag}>{tag}</span>
                <span
                  className={styles.scaleText}
                  style={{
                    fontFamily: isHeading
                      ? `"${pairing.heading}", Georgia, serif`
                      : `"${pairing.body}", sans-serif`,
                    fontSize: `${step.size}px`,
                    fontWeight: step.weight,
                    letterSpacing: key === 'h1' ? '-0.02em' : key === 'h2' ? '-0.01em' : undefined,
                  }}
                >
                  {isHeading ? headingText : bodyText}
                </span>
                <span className={styles.scaleMeta}>{Math.round(step.size)}px·{step.weight}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
