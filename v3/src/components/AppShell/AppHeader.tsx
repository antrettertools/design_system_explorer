import { type JSX, useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { TemporalState } from 'zundo'
import styles from './AppHeader.module.css'
import { useUI, useUIActions, useStore, temporalUndo, temporalRedo, lockEverything, unlockEverything, useIsEverythingLocked } from '@/store'
import { useAuth } from '@/auth/useAuth'
import type { AppTheme } from '@/store/ui'
import type { AppStore } from '@/store/types'
import { Undo2, Redo2, Bookmark, Sun, SunDim, Moon, Download, Lock, LockOpen, Heart } from 'lucide-react'

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
const THEME_ORDER: AppTheme[] = ['white', 'light', 'dark']

export function AppHeader({ onExportClick }: AppHeaderProps) {
  const { theme, mode, activeTab } = useUI()
  const { setTheme, toggleSessionsDrawer, openSignInPrompt, openUpgradeModal, openDonateModal } = useUIActions()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click or Escape
  useEffect(() => {
    if (!dropdownOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [dropdownOpen])

  const temporal = (useStore as unknown as { temporal?: { getState: () => TemporalState<AppStore> } }).temporal
  const pastLen = useStore(() => temporal?.getState().pastStates?.length ?? 0)
  const futureLen = useStore(() => temporal?.getState().futureStates?.length ?? 0)
  const canUndo = pastLen > 0
  const canRedo = futureLen > 0
  const isEverythingLocked = useIsEverythingLocked()

  const contextLabel = mode === 'detail'
    ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
    : null

  const nextTheme = THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length]
  const currentThemeOption = THEME_OPTIONS.find(o => o.value === theme)!

  return (
    <header className={styles.header}>
      <div className={styles.wordmark}>dsygn.cloud</div>

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
          className={styles.lockAllBtn}
          onClick={isEverythingLocked ? unlockEverything : lockEverything}
          title={isEverythingLocked ? 'Unlock all settings' : 'Lock all settings'}
          aria-label={isEverythingLocked ? 'Unlock all settings' : 'Lock all settings'}
          aria-pressed={isEverythingLocked}
        >
          {isEverythingLocked
            ? <Lock size={14} strokeWidth={2} />
            : <LockOpen size={14} strokeWidth={2} />}
        </button>

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

        <button
          className={styles.themeCycleBtn}
          onClick={() => setTheme(nextTheme)}
          title={currentThemeOption.title}
          aria-label={`Theme: ${currentThemeOption.title}. Tap to cycle.`}
        >
          {currentThemeOption.icon}
        </button>

        <button className={styles.exportBtn} onClick={onExportClick}>
          <Download size={13} strokeWidth={2} />
          <span className={styles.exportBtnLabel}>Export</span>
        </button>

        {/* Auth UI */}
        {user ? (
          <div className={styles.userMenu} ref={dropdownRef}>
            <button
              className={styles.avatarBtn}
              onClick={() => setDropdownOpen(v => !v)}
              aria-label={`Account menu for ${user.username}`}
              aria-expanded={dropdownOpen}
              aria-haspopup="menu"
              title={user.username}
            >
              {user.username[0].toUpperCase()}
            </button>
            {dropdownOpen && (
              <div className={styles.dropdown} role="menu">
                <div className={styles.dropdownUser}>{user.username}</div>
                <div className={styles.dropdownPlan}>
                  {user.plan === 'paid' ? 'Lifetime' : 'Free'}
                </div>
                <hr className={styles.dropdownDivider} />
                <button
                  className={styles.dropdownItem}
                  role="menuitem"
                  onClick={() => { setDropdownOpen(false); navigate('/account') }}
                >
                  My designs
                </button>
                <button
                  className={`${styles.dropdownItem} ${styles.dropdownDonate}`}
                  role="menuitem"
                  onClick={() => { setDropdownOpen(false); openDonateModal('dropdown') }}
                >
                  <Heart size={13} strokeWidth={1.75} />
                  Support the maker
                </button>
                {user.plan === 'free' && (
                  <button
                    className={`${styles.dropdownItem} ${styles.dropdownUpgrade}`}
                    role="menuitem"
                    onClick={() => { setDropdownOpen(false); openUpgradeModal() }}
                  >
                    Upgrade to Lifetime
                  </button>
                )}
                <button
                  className={styles.dropdownItem}
                  role="menuitem"
                  onClick={() => { setDropdownOpen(false); signOut() }}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            className={styles.signInBtn}
            onClick={() => openSignInPrompt('manual')}
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  )
}
