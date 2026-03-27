import { useSpacing, useSpacingActions } from '@/store'
import type { SpacingScale } from '@/core/spacing/types'
import styles from './SpacingSummaryCard.module.css'

const STEP_ORDER: (keyof SpacingScale)[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']

export function SpacingSummaryCard() {
  const { baseUnit, config, overrides } = useSpacing()
  const { setBaseUnit, resetAll } = useSpacingActions()

  const effectiveScale = { ...config.scale, ...overrides }
  const hasOverrides = Object.keys(overrides).length > 0

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Spacing System</div>

      <div className={styles.card}>
        {/* Base unit row */}
        <div className={styles.row}>
          <div className={styles.rowMeta}>
            <span className={styles.rowRole}>Base Unit</span>
            <span className={styles.rowName}>{baseUnit}px grid</span>
          </div>
          <div className={styles.toggleGroup}>
            <button
              className={`${styles.unitBtn} ${baseUnit === 4 ? styles.unitBtnActive : ''}`}
              onClick={() => setBaseUnit(4)}
              aria-pressed={baseUnit === 4}
            >
              4pt
            </button>
            <button
              className={`${styles.unitBtn} ${baseUnit === 8 ? styles.unitBtnActive : ''}`}
              onClick={() => setBaseUnit(8)}
              aria-pressed={baseUnit === 8}
            >
              8pt
            </button>
          </div>
          {hasOverrides && (
            <button
              className={styles.resetAllBtn}
              onClick={resetAll}
              title="Reset all spacing overrides to derived values"
            >
              ↺ Reset all
            </button>
          )}
        </div>

        <div className={styles.divider} />

        {/* Scale chips row */}
        <div className={styles.scaleRow}>
          {STEP_ORDER.map(step => (
            <div key={step} className={`${styles.chip} ${overrides[step] !== undefined ? styles.chipOverridden : ''}`}>
              <span className={styles.chipLabel}>{step}</span>
              <span className={styles.chipValue}>{effectiveScale[step]}px</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
