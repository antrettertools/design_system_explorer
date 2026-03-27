import { useSpacing, useSpacingActions } from '@/store'
import type { SpacingScale } from '@/core/spacing/types'
import styles from './SpacingScaleSection.module.css'

const STEP_ORDER: (keyof SpacingScale)[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']
const MAX_BAR_PX = 96  // max rendered bar width in px (for 3xl, caps visual)

export function SpacingScaleSection() {
  const { baseUnit, config, overrides } = useSpacing()
  const { setBaseUnit, overrideStep, resetStep } = useSpacingActions()

  const effectiveScale = { ...config.scale, ...overrides }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Spacing Scale</div>

      <div className={styles.baseUnitRow}>
        <span>Base unit:</span>
        <div className={styles.baseUnitToggle}>
          <button
            className={`${styles.unitBtn} ${baseUnit === 4 ? styles.active : ''}`}
            onClick={() => setBaseUnit(4)}
            aria-pressed={baseUnit === 4}
          >
            4pt
          </button>
          <button
            className={`${styles.unitBtn} ${baseUnit === 8 ? styles.active : ''}`}
            onClick={() => setBaseUnit(8)}
            aria-pressed={baseUnit === 8}
          >
            8pt
          </button>
        </div>
        <span className={styles.baseUnitHint}>base unit = {baseUnit}px</span>
      </div>

      <div className={styles.ruler} role="list">
        {STEP_ORDER.map(step => {
          const derived = config.scale[step]
          const effective = effectiveScale[step] ?? derived
          const isOverridden = overrides[step] !== undefined
          const barWidth = Math.min(effective, MAX_BAR_PX)

          return (
            <div key={step} className={styles.rulerRow} role="listitem">
              <span className={styles.stepLabel}>{step}</span>
              <div
                className={styles.bar}
                style={{ width: `${barWidth}px` }}
                aria-hidden="true"
              />
              <input
                type="number"
                className={`${styles.valueInput} ${isOverridden ? styles.overridden : ''}`}
                value={effective}
                min={0}
                step={baseUnit}
                onChange={e => overrideStep(step, Number(e.target.value))}
                aria-label={`${step} spacing value in pixels`}
              />
              <span className={styles.pxLabel}>px</span>
              {isOverridden && (
                <button
                  className={styles.resetBtn}
                  onClick={() => resetStep(step)}
                  title={`Reset to derived value (${derived}px)`}
                  aria-label={`Reset ${step} to ${derived}px`}
                >
                  ↺
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
