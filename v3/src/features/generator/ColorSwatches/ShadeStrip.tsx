import { makeShadeScale } from '@/core/color/scales'
import { SHADE_STEPS } from '@/core/color/types'
import styles from './ShadeStrip.module.css'

interface ShadeStripProps {
  hex: string
  role: string
}

export function ShadeStrip({ hex, role }: ShadeStripProps) {
  const scale = makeShadeScale(hex)
  return (
    <div className={styles.strip} role="list" aria-label={`${role} shade scale`}>
      {SHADE_STEPS.map(step => (
        <div
          key={step}
          className={styles.cell}
          style={{ background: scale[step] }}
          role="listitem"
          title={`${role}-${step}: ${scale[step]}`}
        >
          {(step === 50 || step === 950) && (
            <span className={styles.label}>{step}</span>
          )}
          {step === 500 && (
            <span className={`${styles.label} ${styles.labelCenter}`}>500</span>
          )}
        </div>
      ))}
    </div>
  )
}
