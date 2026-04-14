import { useColor } from '@/store'
import styles from './SpaceHintBar.module.css'

export function SpaceHintBar() {
  const { slots } = useColor()

  const allLocked = slots.length > 0 && slots.every(s => s.locked)
  const someLocked = slots.some(s => s.locked) && !allLocked

  if (allLocked) {
    return (
      <div className={`${styles.bar} ${styles.locked}`}>
        <span className={styles.lockIcon} aria-hidden="true">🔒</span>
        All slots locked — unlock to regenerate
      </div>
    )
  }

  return (
    <div className={styles.bar}>
      Hit <kbd className={styles.kbd}>SPACE</kbd> to regenerate
      {someLocked && (
        <span className={styles.hint}> — locked slots will hold</span>
      )}
    </div>
  )
}
