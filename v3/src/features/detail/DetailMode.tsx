import styles from './DetailMode.module.css'
import { useUI, useUIActions } from '@/store'
import type { DetailTab } from '@/store/ui'
import { ColorsTab } from './tabs/ColorsTab/ColorsTab'
import { TypographyTab } from './tabs/TypographyTab/TypographyTab'
import { SpacingTab } from './tabs/SpacingTab/SpacingTab'
import { EffectsTab } from './tabs/EffectsTab/EffectsTab'
import { ShowcaseTab } from './tabs/ShowcaseTab/ShowcaseTab'
import { ExportTab } from './tabs/ExportTab/ExportTab'

const ALL_TABS: { id: DetailTab; label: string }[] = [
  { id: 'colors', label: 'Colors' },
  { id: 'typography', label: 'Typography' },
  { id: 'spacing', label: 'Spacing' },
  { id: 'effects', label: 'Effects' },
  { id: 'components', label: 'Components' },
  { id: 'showcase', label: 'Showcase' },
  { id: 'export', label: 'Export' },
]

const IMPLEMENTED_TABS: DetailTab[] = ['colors', 'typography', 'spacing', 'effects', 'showcase', 'export']

export function DetailMode() {
  const { activeTab } = useUI()
  const { setMode, setActiveTab } = useUIActions()

  const renderTab = () => {
    switch (activeTab) {
      case 'colors': return <ColorsTab />
      case 'typography': return <TypographyTab />
      case 'spacing': return <SpacingTab />
      case 'effects': return <EffectsTab />
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
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
              aria-selected={activeTab === tab.id}
              aria-label={
                IMPLEMENTED_TABS.includes(tab.id)
                  ? tab.label
                  : `${tab.label} (coming soon)`
              }
            >
              {tab.label}
              {!IMPLEMENTED_TABS.includes(tab.id) && (
                <span style={{ opacity: 0.4, fontSize: 9, marginLeft: 3 }}>2+</span>
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
