import { useSpacing, useSpacingActions } from '@/store'
import type { RadiusScale } from '@/core/spacing/types'
import styles from './RadiusSection.module.css'

const STEP_ORDER: (keyof RadiusScale)[] = ['none', 'sm', 'md', 'lg', 'xl', 'full']

export function RadiusSection() {
  const { config, radiusOverrides } = useSpacing()
  const { overrideRadius, resetRadius } = useSpacingActions()

  const effectiveRadius = { ...config.radius, ...radiusOverrides }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Border Radius</div>
      <div className={styles.grid} role="list">
        {STEP_ORDER.map(step => {
          const derived = config.radius[step]
          const effective = effectiveRadius[step]
          const isOverridden = radiusOverrides[step] !== undefined
          const borderRadius = step === 'full' ? '9999px' : `${effective}px`

          return (
            <div key={step} className={styles.card} role="listitem">
              <div
                className={styles.preview}
                style={{ borderRadius }}
                title={`--radius-${step}: ${borderRadius}`}
              />
              <span className={styles.label}>{step}</span>
              <div className={styles.inputRow}>
                <input
                  type="number"
                  className={`${styles.valueInput} ${isOverridden ? styles.overridden : ''}`}
                  value={step === 'full' ? 9999 : effective}
                  min={0}
                  max={step === 'full' ? 9999 : 200}
                  step={1}
                  disabled={step === 'full'}
                  onChange={e => overrideRadius(step, Number(e.target.value))}
                  aria-label={`${step} border radius in pixels`}
                />
                <span className={styles.pxLabel}>px</span>
                {isOverridden && step !== 'full' && (
                  <button
                    className={styles.resetBtn}
                    onClick={() => resetRadius(step)}
                    title={`Reset to default (${derived}px)`}
                    aria-label={`Reset ${step} to ${derived}px`}
                  >
                    ↺
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
