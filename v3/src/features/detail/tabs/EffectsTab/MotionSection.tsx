import { useState } from 'react'
import { useEffects, useEffectsActions } from '@/store'
import styles from './MotionSection.module.css'

const MAX_DURATION = 500  // for bar scaling

export function MotionSection() {
  const { config } = useEffects()
  const effectsActions = useEffectsActions()
  const { motion } = config
  const [hoveredEasing, setHoveredEasing] = useState<string | null>(null)

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Motion Tokens</div>

      <div className={styles.subsectionLabel}>Easing Curves</div>
      <div className={styles.easingList} role="list">
        {Object.entries(motion.easings).map(([name, value]) => (
          <div
            key={name}
            className={styles.easingRow}
            role="listitem"
            title={value}
            onMouseEnter={() => setHoveredEasing(name)}
            onMouseLeave={() => setHoveredEasing(null)}
          >
            <span className={styles.easingName}>{name}</span>
            <div
              className={`${styles.easingDemo} ${hoveredEasing === name ? styles.easingDemoActive : ''}`}
              style={{ transition: `transform ${motion.durations['normal']}ms ${value}` }}
            />
            <span className={styles.easingValue}>{value}</span>
          </div>
        ))}
      </div>

      <div className={styles.subsectionLabel}>Duration Scale</div>
      {Object.entries(motion.durations).map(([step, ms]) => (
        <div key={step} className={styles.tokenRow}>
          <span className={styles.tokenName}>--duration-{step}</span>
          <div className={styles.durationField}>
            <div
              className={styles.durationBar}
              style={{ width: `${Math.min((ms / MAX_DURATION) * 120, 120)}px` }}
            />
            <input
              type="number"
              className={styles.durationInput}
              min="0"
              max="2000"
              step="10"
              value={ms}
              onChange={e => effectsActions.setDuration(step, Number(e.target.value))}
            />
            <span className={styles.tokenValue}>ms</span>
          </div>
        </div>
      ))}

      <div className={styles.subsectionLabel} style={{ marginTop: 12 }}>Transition Presets</div>
      {Object.entries(motion.transitions).map(([step, value]) => (
        <div key={step} className={styles.tokenRow}>
          <span className={styles.tokenName}>--transition-{step}</span>
          <span className={styles.tokenValue}>{value}</span>
        </div>
      ))}
    </div>
  )
}
