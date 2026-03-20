import styles from './AppHeader.module.css'
import { useUI, useUIActions, useTemporalStore, useStore } from '@/store'
import { encodeShare } from '@/utils/share'

export function AppHeader() {
  const { mode, theme } = useUI()
  const { setMode, setTheme, showToast } = useUIActions()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const temporal = (useTemporalStore as (sel: (s: any) => any) => any)(s => s)

  const handleShare = async () => {
    const state = useStore.getState()
    const snapshot = {
      v: 2 as const,
      archetype: state.personality.archetype ?? 'professional',
      colors: [
        state.color.primaryHex,
        ...(state.color.secondaryHex ? [state.color.secondaryHex] : []),
        ...state.color.accentHexes,
      ],
    }
    const hash = await encodeShare(snapshot)
    const url = `${window.location.origin}${window.location.pathname}${hash}`
    try {
      await navigator.clipboard.writeText(url)
      showToast('Share URL copied to clipboard')
    } catch {
      showToast('Could not copy to clipboard')
    }
  }

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
        <button
          className={styles.shareBtn}
          onClick={handleShare}
          aria-label="Share design system"
        >
          Share
        </button>
      </div>
    </header>
  )
}
