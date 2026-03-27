import styles from './ShadeStrip.module.css'

const SHADE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

function isLightHex(hex: string): boolean {
  if (!hex.startsWith('#') || hex.length < 7) return false
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150
}

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
        const isLight = isLightHex(color)
        const showLabel = step === 50 || step === 500 || step === 950
        const isCenter = step === 500
        return (
          <div
            key={step}
            className={styles.cell}
            style={{ background: color }}
            role="listitem"
            title={`${role}-${step}: ${color}`}
          >
            {showLabel && (
              <span
                className={`${styles.label} ${isCenter ? styles.labelCenter : ''}`}
                style={{ color: isLight ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.65)' }}
              >
                {step}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
