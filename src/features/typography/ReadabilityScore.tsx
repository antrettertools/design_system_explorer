import { useMemo } from 'react'
import { computeReadabilityScore } from '@/core/typography/readability'
import { getFontByName } from '@/core/typography/fontDatabase'
import { useTypography } from '@/store'
import styles from './ReadabilityScore.module.css'

const CIRCUMFERENCE = 2 * Math.PI * 22 // r=22

export function ReadabilityScore() {
  const typography = useTypography()
  const font = getFontByName(typography.bodyFamily)

  const score = useMemo(() => {
    if (!font) return null
    return computeReadabilityScore({
      font,
      weight: typography.bodyWeight,
      size: typography.fontSize,
      lineHeight: typography.bodyLineHeight,
      letterSpacing: typography.bodyLetterSpacing,
    })
  }, [font, typography])

  const offset = score ? CIRCUMFERENCE * (1 - score.total / 100) : CIRCUMFERENCE
  const color =
    !score
      ? 'var(--text-3)'
      : score.total >= 75
        ? 'var(--app-green)'
        : score.total >= 50
          ? 'var(--accent)'
          : 'var(--app-red)'

  return (
    <div className={styles.wrapper}>
      <div className={styles.ring}>
        <svg width="52" height="52" viewBox="0 0 52 52">
          <circle
            cx="26"
            cy="26"
            r="22"
            strokeWidth="4"
            stroke="var(--bg-4)"
            fill="none"
          />
          <circle
            cx="26"
            cy="26"
            r="22"
            strokeWidth="4"
            fill="none"
            stroke={color}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.4s ease, stroke 0.3s' }}
          />
        </svg>
        <div className={styles.ringNum} style={{ color }}>
          {score ? score.total : '—'}
        </div>
      </div>

      <div className={styles.desc}>
        <div className={styles.label}>{score?.label ?? 'Select a font'}</div>
        <div className={styles.sub}>
          {score?.description ?? 'Readability analysis will appear here'}
        </div>
      </div>
    </div>
  )
}
