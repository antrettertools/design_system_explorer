import styles from './AppHeader.module.css'
import { useUI, useUIActions } from '@/store'
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
  const { theme } = useUI()
  const { setTheme, toggleSessionsDrawer } = useUIActions()

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
