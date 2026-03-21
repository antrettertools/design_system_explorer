import { useRef } from 'react'
import styles from './AppHeader.module.css'
import { useUI, useUIActions, useColor, useTypography, useStore, temporalUndo, temporalRedo } from '@/store'
import type { AppTheme } from '@/store/ui'

interface AppHeaderProps {
  onExportClick: () => void
}

const THEME_OPTIONS: { value: AppTheme; label: string; title: string }[] = [
  { value: 'white', label: '☀', title: 'White background' },
  { value: 'light', label: '◑', title: 'Light background' },
  { value: 'dark',  label: '◐', title: 'Dark background' },
]

export function AppHeader({ onExportClick }: AppHeaderProps) {
  const { theme, mode, activeTab } = useUI()
  const { setTheme, toggleSessionsDrawer } = useUIActions()
  const { activeModel } = useColor()
  const { pairing } = useTypography()

  // Access temporal store for undo/redo enabled state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const temporal = (useStore as any).temporal as { getState: () => { pastStates?: unknown[]; futureStates?: unknown[] } } | undefined
  const pastLen = useStore(() => temporal?.getState().pastStates?.length ?? 0)
  const futureLen = useStore(() => temporal?.getState().futureStates?.length ?? 0)
  const canUndo = pastLen > 0
  const canRedo = futureLen > 0

  const contextLabel = mode === 'detail'
    ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
    : null

  const harmonyBadge = mode === 'generator' && activeModel ? activeModel : null
  const pairingLabel = mode === 'generator' && pairing ? `${pairing.heading} + ${pairing.body}` : null

  return (
    <header className={styles.header}>
      <div className={styles.wordmark}>palette.</div>

      <div className={styles.contextArea}>
        {harmonyBadge && (
          <span className={styles.harmonyBadge}>{harmonyBadge}</span>
        )}
        {pairingLabel && (
          <span className={styles.pairingLabel}>{pairingLabel}</span>
        )}
        {contextLabel && (
          <span className={styles.contextBreadcrumb}>
            <span className={styles.breadcrumbSep}>/ </span>
            {contextLabel}
          </span>
        )}
      </div>

      <div className={styles.actions}>
        <div className={styles.historyGroup} aria-label="History">
          <button
            className={styles.historyBtn}
            onClick={temporalUndo}
            disabled={!canUndo}
            title="Undo (Cmd+Z)"
            aria-label="Undo"
          >
            ↩
          </button>
          <button
            className={styles.historyBtn}
            onClick={temporalRedo}
            disabled={!canRedo}
            title="Redo (Cmd+Shift+Z)"
            aria-label="Redo"
          >
            ↪
          </button>
        </div>
        <button
          className={styles.themeToggle}
          onClick={toggleSessionsDrawer}
          aria-label="Saved sessions"
          title="Saved sessions"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
        <div className={styles.themeSegment} role="group" aria-label="Background mode">
          {THEME_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`${styles.themeBtn} ${theme === opt.value ? styles.themeBtnActive : ''}`}
              onClick={() => setTheme(opt.value)}
              title={opt.title}
              aria-pressed={theme === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button className={styles.exportBtn} onClick={onExportClick}>
          Export ↓
        </button>
      </div>
    </header>
  )
}
