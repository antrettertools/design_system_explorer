import { useRef, useEffect } from 'react'
import styles from './DetailMode.module.css'
import { useUI, useUIActions } from '@/store'
import type { DetailTab } from '@/store/ui'
import { ColorsTab } from './tabs/ColorsTab/ColorsTab'
import { TypographyTab } from './tabs/TypographyTab/TypographyTab'
import { SpacingTab } from './tabs/SpacingTab/SpacingTab'
import { EffectsTab } from './tabs/EffectsTab/EffectsTab'
import { ShowcaseTab } from './tabs/ShowcaseTab/ShowcaseTab'
import { ExportTab } from './tabs/ExportTab/ExportTab'
import { ComponentsTab } from './tabs/ComponentsTab/ComponentsTab'

const ALL_TABS: { id: DetailTab; label: string; short: string }[] = [
  { id: 'colors',     label: 'Colors',     short: 'Clr' },
  { id: 'typography', label: 'Typography', short: 'Typ' },
  { id: 'spacing',    label: 'Spacing',    short: 'Spc' },
  { id: 'effects',    label: 'Effects',    short: 'Eff' },
  { id: 'components', label: 'Components', short: 'Cmp' },
  { id: 'showcase',   label: 'Showcase',   short: 'Shw' },
  { id: 'export',     label: 'Export',     short: 'Exp' },
]

const IMPLEMENTED_TABS: DetailTab[] = ['colors', 'typography', 'spacing', 'effects', 'components', 'showcase', 'export']

export function DetailMode() {
  const { activeTab } = useUI()
  const { setMode, setActiveTab } = useUIActions()
  const activeTabRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    activeTabRef.current?.scrollIntoView({ inline: 'nearest', behavior: 'smooth' })
  }, [activeTab])

  const renderTab = () => {
    switch (activeTab) {
      case 'colors': return <ColorsTab />
      case 'typography': return <TypographyTab />
      case 'spacing': return <SpacingTab />
      case 'effects': return <EffectsTab />
      case 'components': return <ComponentsTab />
      case 'showcase': return <ShowcaseTab />
      case 'export': return <ExportTab />
      default:
        return (
          <div className={styles.comingSoon}>
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} tab — coming in Phase 3
          </div>
        )
    }
  }

  return (
    <div className={styles.shell}>
      <div className={styles.topBar}>
        <button
          className={styles.backLink}
          onClick={() => setMode('generator')}
          aria-label="Back to generator"
        >
          ← Generator
        </button>
        <div className={styles.divider} />
        <nav className={styles.tabs} aria-label="Detail mode tabs">
          {ALL_TABS.map(tab => (
            <button
              key={tab.id}
              ref={activeTab === tab.id ? activeTabRef : undefined}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
              aria-selected={activeTab === tab.id}
              aria-label={
                IMPLEMENTED_TABS.includes(tab.id)
                  ? tab.label
                  : `${tab.label} (coming soon)`
              }
            >
              <span className={styles.tabFullLabel}>{tab.label}</span>
              <span className={styles.tabShortLabel}>{tab.short}</span>
              {!IMPLEMENTED_TABS.includes(tab.id) && (
                <span className={styles.tabBadge}>2+</span>
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className={styles.content}>
        {renderTab()}
      </div>
    </div>
  )
}
