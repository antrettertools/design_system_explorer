import styles from './SpaceHintBar.module.css'

export function SpaceHintBar() {
  return (
    <div className={styles.bar}>
      Hit <kbd className={styles.kbd}>SPACE</kbd> to regenerate
    </div>
  )
}
