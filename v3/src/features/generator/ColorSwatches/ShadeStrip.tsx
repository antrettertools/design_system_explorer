import styles from './ShadeStrip.module.css'

const SHADE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

interface ShadeStripProps {
  hex: string
  role: string
}

export function ShadeStrip({ role }: ShadeStripProps) {
  const style = getComputedStyle(document.documentElement)
  return (
    <div className={styles.strip} role="list" aria-label={`${role} shade scale`}>
      {SHADE_STEPS.map(step => {
        const color = style.getPropertyValue(`--color-${role}-${step}`).trim() || '#888'
        return (
          <div
            key={step}
            className={styles.cell}
            style={{ background: color }}
            role="listitem"
            title={`${role}-${step}: ${color}`}
          >
            {(step === 50 || step === 950) && (
              <span className={styles.label}>{step}</span>
            )}
            {step === 500 && (
              <span className={`${styles.label} ${styles.labelCenter}`}>500</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
