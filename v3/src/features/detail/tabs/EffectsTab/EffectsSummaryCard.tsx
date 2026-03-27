import { Lock, LockOpen } from 'lucide-react'
import { useEffects, useEffectsActions } from '@/store'
import styles from './EffectsSummaryCard.module.css'

export function EffectsSummaryCard() {
  const { config, shadowMode, shadowLocked, focusRingLocked } = useEffects()
  const { setShadowMode, toggleShadowLock, toggleFocusRingLock } = useEffectsActions()

  const baseShadows = shadowMode === 'colored' ? config.shadows : config.shadowsNeutral
  const { focusRing } = config

  const focusStyle = {
    outline: `${focusRing.width} solid ${focusRing.color}`,
    outlineOffset: focusRing.offset,
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Effects Summary</div>

      <div className={styles.card}>
        {/* Shadow mode row */}
        <div className={styles.row}>
          <div className={styles.rowMeta}>
            <span className={styles.rowRole}>Shadow Mode</span>
            <span className={styles.rowName}>
              {shadowMode === 'colored' ? 'Brand-tinted' : 'Neutral'}
            </span>
          </div>

          <div className={styles.previewsRow}>
            <div className={styles.shadowPreviewItem}>
              <div
                className={styles.shadowBox}
                style={{ boxShadow: baseShadows.sm }}
                title={`shadow-sm: ${baseShadows.sm}`}
              />
              <span className={styles.previewLabel}>sm</span>
            </div>
            <div className={styles.shadowPreviewItem}>
              <div
                className={styles.shadowBox}
                style={{ boxShadow: baseShadows.md }}
                title={`shadow-md: ${baseShadows.md}`}
              />
              <span className={styles.previewLabel}>md</span>
            </div>
            <div className={styles.shadowPreviewItem}>
              <div
                className={styles.shadowBox}
                style={{ boxShadow: baseShadows.lg }}
                title={`shadow-lg: ${baseShadows.lg}`}
              />
              <span className={styles.previewLabel}>lg</span>
            </div>
          </div>

          <div className={styles.toggleGroup}>
            <button
              className={`${styles.modeBtn} ${shadowMode === 'colored' ? styles.modeBtnActive : ''}`}
              onClick={() => setShadowMode('colored')}
              aria-pressed={shadowMode === 'colored'}
            >
              Brand
            </button>
            <button
              className={`${styles.modeBtn} ${shadowMode === 'neutral' ? styles.modeBtnActive : ''}`}
              onClick={() => setShadowMode('neutral')}
              aria-pressed={shadowMode === 'neutral'}
            >
              Neutral
            </button>
          </div>

          <button
            className={`${styles.lockBtn} ${shadowLocked ? styles.lockBtnActive : ''}`}
            onClick={toggleShadowLock}
            title={shadowLocked ? 'Unlock shadows (will update with brand changes)' : 'Lock shadows (freeze current values)'}
            aria-label={shadowLocked ? 'Unlock shadows' : 'Lock shadows'}
          >
            {shadowLocked ? <Lock size={13} /> : <LockOpen size={13} />}
          </button>
        </div>

        <div className={styles.divider} />

        {/* Focus ring row */}
        <div className={styles.row}>
          <div className={styles.rowMeta}>
            <span className={styles.rowRole}>Focus Ring</span>
            <span className={styles.rowName}>{focusRing.color}</span>
          </div>

          <div className={styles.focusPreview}>
            <button className={styles.focusedBtn} style={focusStyle}>
              Focused
            </button>
          </div>

          <div className={styles.focusMeta}>
            <span className={styles.focusDetail}>{focusRing.width} width · {focusRing.offset} offset</span>
          </div>

          <button
            className={`${styles.lockBtn} ${focusRingLocked ? styles.lockBtnActive : ''}`}
            onClick={toggleFocusRingLock}
            title={focusRingLocked ? 'Unlock focus ring (will update with brand changes)' : 'Lock focus ring (freeze current values)'}
            aria-label={focusRingLocked ? 'Unlock focus ring' : 'Lock focus ring'}
          >
            {focusRingLocked ? <Lock size={13} /> : <LockOpen size={13} />}
          </button>
        </div>
      </div>
    </div>
  )
}
