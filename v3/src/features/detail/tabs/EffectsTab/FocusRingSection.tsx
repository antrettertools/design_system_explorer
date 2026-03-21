import { useEffects } from '@/store'
import styles from './FocusRingSection.module.css'

export function FocusRingSection() {
  const { config } = useEffects()
  const { focusRing } = config

  const focusStyle = {
    outline: `${focusRing.width} solid ${focusRing.color}`,
    outlineOffset: focusRing.offset,
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Focus Ring</div>
      <div className={styles.card}>
        <div className={styles.preview}>
          <span style={{ fontSize: 12, color: 'var(--color-on-surface-subtle)', fontFamily: 'sans-serif' }}>
            Unfocused →
          </span>
          <button className={styles.focusedBtn}>
            Click me
          </button>
          <span style={{ fontSize: 12, color: 'var(--color-on-surface-subtle)', fontFamily: 'sans-serif' }}>
            ← Focused ↓
          </span>
          <button className={styles.focusedBtn} style={focusStyle}>
            Focused
          </button>
        </div>

        <div className={styles.tokenGrid}>
          <div className={styles.tokenCard}>
            <span className={styles.tokenLabel}>--focus-ring-color</span>
            <div style={{ width: 32, height: 32, background: focusRing.color, borderRadius: 4, margin: '4px auto' }} />
            <span className={styles.tokenValue}>{focusRing.color}</span>
          </div>
          <div className={styles.tokenCard}>
            <span className={styles.tokenLabel}>--focus-ring-width</span>
            <span className={styles.tokenValue} style={{ display: 'block', marginTop: 14 }}>{focusRing.width}</span>
          </div>
          <div className={styles.tokenCard}>
            <span className={styles.tokenLabel}>--focus-ring-offset</span>
            <span className={styles.tokenValue} style={{ display: 'block', marginTop: 14 }}>{focusRing.offset}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
