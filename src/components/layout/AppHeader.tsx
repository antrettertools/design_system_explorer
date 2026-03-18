import { useUI, useUIActions, useTypography, useColor, useCompareActions } from '@/store'
import { useFont } from '@/hooks/useFont'
import type { TabId } from '@/store/ui'
import styles from './AppHeader.module.css'
import { Button } from '../controls/Button'

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'typography', label: 'Typography' },
  { id: 'spacing', label: 'Spacing' },
  { id: 'color', label: 'Color' },
  { id: 'shadows', label: 'Shadows' },
  { id: 'components', label: 'Components' },
  { id: 'compare', label: 'Compare' },
  { id: 'export', label: 'Export' },
]

export function AppHeader() {
  const { activeTab, theme } = useUI()
  const { setActiveTab, setTheme, showToast } = useUIActions()
  const typography = useTypography()
  const color = useColor()
  const compareActions = useCompareActions()
  const { fontFamilyStack, variationSettings } = useFont()

  const handlePin = () => {
    const fontStyle = [
      `font-family: ${fontFamilyStack};`,
      `font-weight: ${typography.fontWeight};`,
      `font-size: ${typography.fontSize}px;`,
      `line-height: ${typography.lineHeight};`,
      variationSettings ? `font-variation-settings: ${variationSettings};` : '',
    ]
      .filter(Boolean)
      .join(' ')

    compareActions.pin({
      label: `${typography.fontFamily} · ${new Date().toLocaleTimeString()}`,
      fontFamily: typography.fontFamily,
      fontWeight: typography.fontWeight,
      fontSize: typography.fontSize,
      lineHeight: typography.lineHeight,
      primaryHex: color.primaryHex,
      secondaryHex: color.secondaryHex,
      fontStyle,
    })

    showToast('System pinned for comparison')
  }

  const handleSave = () => {
    setActiveTab('export')
  }

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <span className={styles.logoDot} />
        TYPESET
        <span className={styles.logoSub}>DESIGN SYSTEM BUILDER</span>
      </div>

      <nav className={styles.nav}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tabBtn}${activeTab === tab.id ? ` ${styles.active}` : ''}`}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className={styles.actions}>
        <ThemeToggle theme={theme} onToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
        <Button variant="secondary" size="sm" onClick={handleSave}>
          Save System
        </Button>
        <Button variant="primary" size="sm" onClick={handlePin}>
          Pin Current
        </Button>
      </div>
    </header>
  )
}

// ── Theme toggle ───────────────────────────────────────────────

function ThemeToggle({ theme, onToggle }: { theme: 'dark' | 'light'; onToggle: () => void }) {
  const isDark = theme === 'dark'
  return (
    <button
      onClick={onToggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 20,
        border: '1px solid var(--line-2)',
        background: 'var(--bg-3)',
        cursor: 'pointer',
        transition: 'all var(--t-fast)',
        flexShrink: 0,
      }}
    >
      {/* Track */}
      <div
        style={{
          width: 28,
          height: 16,
          borderRadius: 8,
          background: isDark ? 'var(--bg-4)' : 'var(--accent)',
          position: 'relative',
          transition: 'background var(--t-base)',
          flexShrink: 0,
        }}
      >
        {/* Thumb */}
        <div
          style={{
            position: 'absolute',
            top: 2,
            left: isDark ? 2 : 14,
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: isDark ? 'var(--text-3)' : '#fff',
            transition: 'left var(--t-base)',
          }}
        />
      </div>
      {/* Icon */}
      {isDark ? (
        <MoonIcon />
      ) : (
        <SunIcon />
      )}
    </button>
  )
}

function SunIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" strokeWidth="2" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}
