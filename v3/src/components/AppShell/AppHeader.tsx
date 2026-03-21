import styles from './AppHeader.module.css'
import { useUI, useUIActions } from '@/store'

interface AppHeaderProps {
  onExportClick: () => void
}

export function AppHeader({ onExportClick }: AppHeaderProps) {
  const { theme } = useUI()
  const { toggleTheme } = useUIActions()

  return (
    <header className={styles.header}>
      <div className={styles.wordmark}>palette.</div>
      <div className={styles.actions}>
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
