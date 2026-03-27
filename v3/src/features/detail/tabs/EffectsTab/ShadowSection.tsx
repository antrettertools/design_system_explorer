import { useEffects, useEffectsActions } from '@/store'
import type { ShadowPresets } from '@/core/effects/types'
import { ShadowBuilder } from './ShadowBuilder'
import styles from './ShadowSection.module.css'

const SHADOW_STEPS: (keyof ShadowPresets)[] = ['sm', 'md', 'lg', 'xl']

export function ShadowSection() {
  const { config, shadowMode, shadowOverrides } = useEffects()
  const { overrideShadow, resetShadow } = useEffectsActions()

  const baseShadows = shadowMode === 'colored' ? config.shadows : config.shadowsNeutral
  const activeShadows = { ...baseShadows, ...shadowOverrides }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Elevation Shadows</div>

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
