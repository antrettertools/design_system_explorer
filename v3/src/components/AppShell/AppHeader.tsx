import type { JSX } from 'react'
import styles from './AppHeader.module.css'
import { useUI, useUIActions, useStore, temporalUndo, temporalRedo } from '@/store'
import type { AppTheme } from '@/store/ui'
import { Undo2, Redo2, Bookmark, Sun, SunDim, Moon, Download } from 'lucide-react'

interface AppHeaderProps {
  onExportClick: () => void
}

const ICON_SIZE = 15

type ThemeOption = { value: AppTheme; icon: JSX.Element; title: string }
const THEME_OPTIONS: ThemeOption[] = [
  { value: 'white', icon: <Sun size={ICON_SIZE} />,    title: 'White background' },
  { value: 'light', icon: <SunDim size={ICON_SIZE} />, title: 'Light background' },
  { value: 'dark',  icon: <Moon size={ICON_SIZE} />,   title: 'Dark background' },
]

export function AppHeader({ onExportClick }: AppHeaderProps) {
  const { theme, mode, activeTab } = useUI()
  const { setTheme, toggleSessionsDrawer } = useUIActions()

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

  return (
    <header className={styles.header}>
      <div className={styles.wordmark}>palette.</div>

      <div className={styles.contextArea}>
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
            <Undo2 size={14} strokeWidth={1.75} />
          </button>
          <button
            className={styles.historyBtn}
            onClick={temporalRedo}
            disabled={!canRedo}
            title="Redo (Cmd+Shift+Z)"
            aria-label="Redo"
          >
            <Redo2 size={14} strokeWidth={1.75} />
          </button>
        </div>
        <button
          className={styles.themeToggle}
          onClick={toggleSessionsDrawer}
          aria-label="Saved sessions"
          title="Saved sessions"
        >
          <Bookmark size={15} strokeWidth={1.75} />
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
              {opt.icon}
            </button>
          ))}
        </div>
        <button className={styles.exportBtn} onClick={onExportClick}>
          <Download size={13} strokeWidth={2} />
          Export
        </button>
      </div>
    </header>
  )
}
