import { usePersonality, usePersonalityActions, useUIActions } from '@/store'
import styles from './SystemReveal.module.css'

export function SystemReveal() {
  const { locked, archetype } = usePersonality()
  const personalityActions = usePersonalityActions()
  const { setMode } = useUIActions()

  const lockedHexes = locked.filter((h): h is string => h !== null)
  const archetypeName = archetype ? archetype.charAt(0).toUpperCase() + archetype.slice(1) : ''

  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <h1 className={styles.title}>Your system is ready</h1>
        <p className={styles.subtitle}>
          {archetypeName} palette · {lockedHexes.length} color{lockedHexes.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div className={styles.colorRow}>
        {lockedHexes.map((hex, i) => (
          <div key={i} className={styles.colorChip} style={{ '--chip-color': hex } as React.CSSProperties}>
            <div className={styles.chipSwatch} />
            <div className={styles.chipHex}>{hex}</div>
          </div>
        ))}
      </div>
      <div className={styles.actions}>
        <button className={styles.exploreBtn} onClick={() => setMode('explore')}>
          Open in Explore Mode →
        </button>
        <button className={styles.backBtn} onClick={() => personalityActions.setStep(2)}>
          ← Back to Colors
        </button>
      </div>
    </div>
  )
}
