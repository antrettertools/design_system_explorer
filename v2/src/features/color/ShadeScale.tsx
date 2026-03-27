import { SHADE_STEPS } from '@/core/tokens/types'
import type { ShadeScale as ShadeScaleType } from '@/core/tokens/types'
import { getOnColor } from '@/core/color/scales'
import { useUIActions } from '@/store'
import styles from './ShadeScale.module.css'

interface ShadeScaleProps {
  label: string
  hex?: string
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
              background: 'var(--chrome-surface-raised)',
              color: 'var(--chrome-text-subtle)',
              fontFamily: 'var(--chrome-font-mono)',
              fontWeight: 400,
              letterSpacing: 0,
              textTransform: 'none',
            }}
          >
            {badge}
          </span>
        )}
        {hex && <span className={styles.rowHex}>{hex}</span>}
      </div>
      <div className={styles.swatchRow}>
        {SHADE_STEPS.map((step) => {
          const swatchHex = scale[step]
          const labelColor = getOnColor(swatchHex) === '#ffffff'
            ? 'rgba(255,255,255,0.65)'
            : 'rgba(0,0,0,0.45)'
          return (
            <div
              key={step}
              className={styles.swatch}
              style={{ background: swatchHex, '--swatch-label-color': labelColor } as React.CSSProperties}
              onClick={() => copy(swatchHex)}
              title={`${step}: ${swatchHex}`}
            >
              <div
                className={styles.swatchLabel}
                style={{ color: labelColor }}
              >
                {step}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
