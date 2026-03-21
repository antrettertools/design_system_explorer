import { useEffects } from '@/store'
import styles from './MotionSection.module.css'

const MAX_DURATION = 500  // for bar scaling

export function MotionSection() {
  const { config } = useEffects()
  const { motion } = config

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Motion Tokens</div>

      <div className={styles.subsectionLabel}>Easing Curves</div>
      <div className={styles.easingDemo} role="list">
        {Object.entries(motion.easings).map(([name, value]) => (
          <div key={name} className={styles.easingCard} role="listitem" title={value}>
            <div className={styles.easingName}>{name}</div>
            <div className={styles.easingValue}>{value}</div>
          </div>
        ))}
      </div>

      <div className={styles.subsectionLabel}>Duration Scale</div>
      {Object.entries(motion.durations).map(([step, ms]) => (
        <div key={step} className={styles.tokenRow}>
          <span className={styles.tokenName}>--duration-{step}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <div
              className={styles.durationBar}
              style={{ width: `${(ms / MAX_DURATION) * 120}px` }}
            />
            <span className={styles.tokenValue}>{ms}ms</span>
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
