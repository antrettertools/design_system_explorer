import styles from './ColorCandidateCard.module.css'

interface ColorCandidateCardProps {
  hex: string
  locked: boolean
  index: number
  onLock: (index: number, hex: string) => void
  onUnlock: (index: number) => void
}

export function ColorCandidateCard({ hex, locked, index, onLock, onUnlock }: ColorCandidateCardProps) {
  return (
    <div
      className={`${styles.card} ${locked ? styles.locked : ''}`}
      style={{ '--card-color': hex } as React.CSSProperties}
    >
      {locked && <div className={styles.lockedBadge}>Locked</div>}
      <div className={styles.swatch} />
      <div className={styles.hex}>{hex}</div>
      <button
        className={styles.lockBtn}
        onClick={() => locked ? onUnlock(index) : onLock(index, hex)}
        aria-label={locked ? 'Unlock color' : `Lock color ${index + 1}`}
        title={locked ? 'Click to unlock (Backspace)' : `Click to lock (${index + 1})`}
      >
        {locked ? '🔒' : '○'}
      </button>
    </div>
  )
}
