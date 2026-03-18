import { SHADE_STEPS } from '@/core/tokens/types'
import type { ShadeScale as ShadeScaleType } from '@/core/tokens/types'
import { useUIActions } from '@/store'
import styles from './ShadeScale.module.css'

interface ShadeScaleProps {
  label: string
  hex: string
  scale: ShadeScaleType
  badge?: string
}

export function ShadeScale({ label, hex, scale, badge }: ShadeScaleProps) {
  const { showToast } = useUIActions()

  const copy = (value: string) => {
    navigator.clipboard.writeText(value).then(() => showToast(`Copied ${value}`))
  }

  return (
    <div className={styles.row}>
      <div className={styles.rowLabel}>
        {label}
        {badge && (
          <span
            style={{
              fontSize: 9,
              padding: '1px 6px',
              borderRadius: 3,
              background: 'var(--bg-3)',
              color: 'var(--text-2)',
              fontFamily: 'var(--mono)',
              fontWeight: 400,
              letterSpacing: 0,
              textTransform: 'none',
            }}
          >
            {badge}
          </span>
        )}
        <span className={styles.rowHex}>{hex}</span>
      </div>
      <div className={styles.swatchRow}>
        {SHADE_STEPS.map((step) => (
          <div
            key={step}
            className={styles.swatch}
            style={{ background: scale[step] }}
            onClick={() => copy(scale[step])}
            title={`${step}: ${scale[step]}`}
          >
            <div className={styles.swatchLabel}>{step}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
