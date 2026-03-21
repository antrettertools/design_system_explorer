import { useSpacing } from '@/store'
import type { RadiusScale } from '@/core/spacing/types'
import styles from './RadiusSection.module.css'

const STEP_ORDER: (keyof RadiusScale)[] = ['none', 'sm', 'md', 'lg', 'xl', 'full']

export function RadiusSection() {
  const { config } = useSpacing()

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Border Radius</div>
      <div className={styles.grid} role="list">
        {STEP_ORDER.map(step => {
          const value = config.radius[step]
          const borderRadius = step === 'full' ? '9999px' : `${value}px`
          return (
            <div key={step} className={styles.card} role="listitem">
              <div
                className={styles.preview}
                style={{ borderRadius }}
                title={`radius-${step}: ${borderRadius}`}
              />
              <span className={styles.label}>{step}</span>
              <span className={styles.value}>{borderRadius}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
