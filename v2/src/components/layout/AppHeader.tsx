import styles from './AppHeader.module.css'
import { useUI, useUIActions, useTemporalStore } from '@/store'

export function AppHeader() {
  const { mode, theme } = useUI()
  const { setMode, setTheme } = useUIActions()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const temporal = (useTemporalStore as (sel: (s: any) => any) => any)(s => s)

  return (
    <header className={styles.header}>
      <div className={styles.logo}>TYPESET</div>
      {mode === 'explore' && (
        <div className={styles.undoRedo}>
          <button
            className={styles.iconBtn}
            onClick={() => temporal.undo()}
            disabled={temporal.pastStates.length === 0}
            aria-label="Undo"
            title="Undo (Cmd+Z)"
          >↩</button>
          <button
            className={styles.iconBtn}
            onClick={() => temporal.redo()}
            disabled={temporal.futureStates.length === 0}
            aria-label="Redo"
            title="Redo (Cmd+Shift+Z)"
          >↪</button>
        </div>
      )}
      <div className={styles.spacer} />
      <div className={styles.actions}>
        <button
          className={styles.modeToggle}
          onClick={() => setMode(mode === 'quick' ? 'explore' : 'quick')}
        >
          {mode === 'quick' ? 'Explore Mode →' : '← Quick Mode'}
        </button>
        <button
          className={styles.iconBtn}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '☀' : '●'}
        </button>
        <button className={styles.shareBtn} aria-label="Share">Share</button>
      </div>
    </header>
  )
}
