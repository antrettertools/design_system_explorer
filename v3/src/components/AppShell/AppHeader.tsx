import styles from './AppHeader.module.css'
import { useUI, useUIActions } from '@/store'

interface AppHeaderProps {
  onExportClick: () => void
}

export function AppHeader({ onExportClick }: AppHeaderProps) {
  const { theme } = useUI()
  const { toggleTheme, toggleSessionsDrawer } = useUIActions()

  return (
    <header className={styles.header}>
      <div className={styles.wordmark}>palette.</div>
      <div className={styles.actions}>
        <button
          className={styles.themeToggle}
          onClick={toggleSessionsDrawer}
          aria-label="Saved sessions"
          title="Saved sessions"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
        </button>
        <button
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '◐' : '○'}
        </button>
        <button className={styles.exportBtn} onClick={onExportClick}>
          Export ↓
        </button>
      </div>
    </header>
  )
}
