import styles from './DetailMode.module.css'
import { useUI, useUIActions } from '@/store'
import type { DetailTab } from '@/store/ui'
import { ColorsTab } from './tabs/ColorsTab/ColorsTab'
import { TypographyTab } from './tabs/TypographyTab/TypographyTab'
import { ShowcaseTab } from './tabs/ShowcaseTab/ShowcaseTab'
import { ExportTab } from './tabs/ExportTab/ExportTab'

const PHASE_1_TABS: { id: DetailTab; label: string }[] = [
  { id: 'colors', label: 'Colors' },
  { id: 'typography', label: 'Typography' },
  { id: 'spacing', label: 'Spacing' },
  { id: 'effects', label: 'Effects' },
  { id: 'components', label: 'Components' },
  { id: 'showcase', label: 'Showcase' },
  { id: 'export', label: 'Export' },
]

const PHASE_1_IMPLEMENTED: DetailTab[] = ['colors', 'typography', 'showcase', 'export']

export function DetailMode() {
  const { activeTab } = useUI()
  const { setMode, setActiveTab } = useUIActions()

  const renderTab = () => {
    switch (activeTab) {
      case 'colors': return <ColorsTab />
      case 'typography': return <TypographyTab />
      case 'showcase': return <ShowcaseTab />
      case 'export': return <ExportTab />
      default:
        return (
          <div className={styles.comingSoon}>
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} tab — coming in Phase 2
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
          {PHASE_1_TABS.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
              aria-selected={activeTab === tab.id}
              aria-label={
                PHASE_1_IMPLEMENTED.includes(tab.id)
                  ? tab.label
                  : `${tab.label} (coming soon)`
              }
            >
              {tab.label}
              {!PHASE_1_IMPLEMENTED.includes(tab.id) && (
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
