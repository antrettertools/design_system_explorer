import { useEffects, useEffectsActions } from '@/store'
import { DURATION_SCALE } from '@/core/effects/motion'
import type { DurationStep } from '@/core/effects/types'
import styles from './MotionSection.module.css'

const MAX_DURATION = 500  // for bar scaling

export function MotionSection() {
  const { config } = useEffects()
  const effectsActions = useEffectsActions()
  const { motion } = config

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Motion Tokens</div>

      {/* Easing Curves — continuously animated so the difference is immediately visible */}
      <div className={styles.subsectionLabel}>Easing Curves</div>
      <div className={styles.easingList} role="list">
        {(Object.entries(motion.easings) as [string, string][]).map(([name, value]) => (
          <div
            key={name}
            className={styles.easingRow}
            role="listitem"
            title={value}
          >
            <span className={styles.easingName}>{name}</span>
            {/* Ball loops back and forth using the easing as animation-timing-function */}
            <div className={styles.easingTrack}>
              <div
                className={styles.easingBall}
                style={{ animationTimingFunction: value } as React.CSSProperties}
              />
            </div>
            <span className={styles.easingValue}>{value}</span>
          </div>
        ))}
      </div>

      {/* Duration Scale */}
      <div className={styles.subsectionLabel}>Duration Scale</div>
      {(Object.entries(motion.durations) as [DurationStep, number][]).map(([step, ms]) => {
        const isOverridden = ms !== DURATION_SCALE[step]
        return (
          <div key={step} className={styles.tokenRow}>
            <span className={styles.tokenName}>--duration-{step}</span>
            <div className={styles.durationField}>
              <div
                className={styles.durationBar}
                style={{ width: `${Math.min((ms / MAX_DURATION) * 120, 120)}px` }}
              />
              <input
                type="number"
                className={`${styles.durationInput} ${isOverridden ? styles.overridden : ''}`}
                min="0"
                max="2000"
                step="10"
                value={ms}
                onChange={e => effectsActions.setDuration(step, Number(e.target.value))}
                aria-label={`${step} duration in milliseconds`}
              />
              <span className={styles.tokenValue}>ms</span>
              {isOverridden && (
                <button
                  className={styles.resetDurationBtn}
                  onClick={() => effectsActions.resetDuration(step)}
                  title={`Reset to default (${DURATION_SCALE[step]}ms)`}
                  aria-label={`Reset ${step} to ${DURATION_SCALE[step]}ms`}
                >
                  ↺
                </button>
              )}
            </div>
          </div>
        )
      })}

      {/* Transition Presets — values stay in sync with duration edits */}
      <div className={`${styles.subsectionLabel} ${styles.subsectionLabelSpaced}`}>Transition Presets</div>
      {(Object.entries(motion.transitions) as [string, string][]).map(([step, value]) => (
        <div key={step} className={styles.tokenRow}>
          <span className={styles.tokenName}>--transition-{step}</span>
          <span className={styles.tokenValue}>{value}</span>
        </div>
      ))}
    </div>
  )
}
