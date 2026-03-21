import { useEffects, useEffectsActions } from '@/store'
import type { ShadowPresets } from '@/core/effects/types'
import styles from './ShadowSection.module.css'

const SHADOW_STEPS: (keyof ShadowPresets)[] = ['sm', 'md', 'lg', 'xl']

export function ShadowSection() {
  const { config, shadowMode, shadowOverrides } = useEffects()
  const { setShadowMode } = useEffectsActions()

  const baseShadows = shadowMode === 'colored' ? config.shadows : config.shadowsNeutral
  const activeShadows = { ...baseShadows, ...shadowOverrides }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Elevation Shadows</div>

      <div className={styles.modeRow}>
        <span>Mode:</span>
        <button
          className={`${styles.modeBtn} ${shadowMode === 'colored' ? styles.active : ''}`}
          onClick={() => setShadowMode('colored')}
          aria-pressed={shadowMode === 'colored'}
        >
          Brand-tinted
        </button>
        <button
          className={`${styles.modeBtn} ${shadowMode === 'neutral' ? styles.active : ''}`}
          onClick={() => setShadowMode('neutral')}
          aria-pressed={shadowMode === 'neutral'}
        >
          Neutral
        </button>
      </div>

      <div className={styles.grid} role="list">
        {SHADOW_STEPS.map(step => (
          <div key={step} className={styles.card} role="listitem">
            <div
              className={styles.preview}
              style={{ boxShadow: activeShadows[step] }}
              title={`shadow-${step}`}
            />
            <span className={styles.label}>shadow-{step}</span>
            <span className={styles.value}>{activeShadows[step]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
