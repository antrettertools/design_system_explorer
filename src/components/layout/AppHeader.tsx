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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? '◑' : '○'}
        </Button>
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
