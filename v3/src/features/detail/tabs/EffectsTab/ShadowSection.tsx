import { useEffects, useEffectsActions } from '@/store'
import type { ShadowPresets } from '@/core/effects/types'
import { ShadowBuilder } from './ShadowBuilder'
import styles from './ShadowSection.module.css'

const SHADOW_STEPS: (keyof ShadowPresets)[] = ['sm', 'md', 'lg', 'xl']

export function ShadowSection() {
  const { config, shadowMode, shadowOverrides } = useEffects()
  const { setShadowMode, overrideShadow, resetShadow } = useEffectsActions()

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

      <div className={styles.builderList} role="list">
        {SHADOW_STEPS.map(step => (
          <div key={step} role="listitem">
            <ShadowBuilder
              step={step}
              value={activeShadows[step]}
              onOverride={v => overrideShadow(step, v)}
              onReset={() => resetShadow(step)}
              isOverridden={step in shadowOverrides}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
