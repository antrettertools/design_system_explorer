import { useRef, useEffect, type ComponentType } from 'react'
import styles from './DetailMode.module.css'
import { useUI, useUIActions } from '@/store'
import { ArrowLeft, ArrowRight, Palette, Type, Ruler, Wand2, LayoutGrid } from 'lucide-react'
import type { DetailTab } from '@/store/ui'
import { ColorsTab } from './tabs/ColorsTab/ColorsTab'
import { TypographyTab } from './tabs/TypographyTab/TypographyTab'
import { SpacingTab } from './tabs/SpacingTab/SpacingTab'
import { EffectsTab } from './tabs/EffectsTab/EffectsTab'
import { ComponentsTab } from './tabs/ComponentsTab/ComponentsTab'

type TabDef = {
  id: DetailTab
  label: string
  short: string
  Icon: ComponentType<{ size?: number | string; strokeWidth?: number | string; className?: string }>
}

const ALL_TABS: TabDef[] = [
  { id: 'colors',     label: 'Colors',     short: 'Colors', Icon: Palette    },
  { id: 'typography', label: 'Typography', short: 'Type',   Icon: Type       },
  { id: 'spacing',    label: 'Spacing',    short: 'Space',  Icon: Ruler      },
  { id: 'effects',    label: 'Effects',    short: 'FX',     Icon: Wand2      },
  { id: 'components', label: 'Components', short: 'Comps',  Icon: LayoutGrid },
]

const IMPLEMENTED_TABS: DetailTab[] = ['colors', 'typography', 'spacing', 'effects', 'components']

export function DetailMode() {
  const { activeTab } = useUI()
  const { setMode, setActiveTab, showMobilePreview } = useUIActions()
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
      default:
        return (
          <div className={styles.comingSoon}>
            {(activeTab as string).charAt(0).toUpperCase() + (activeTab as string).slice(1)} tab — coming in Phase 3
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
          <ArrowLeft size={13} strokeWidth={2} />
          Generator
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
        <button
          className={styles.mobilePreviewBtn}
          onClick={showMobilePreview}
          aria-label="Show live preview"
        >
          Preview
          <ArrowRight size={12} strokeWidth={2} />
        </button>
      </div>
      <div className={styles.content}>
        {renderTab()}
      </div>

      {/* Bottom navigation — visible only on mobile via CSS */}
      <nav className={styles.bottomTabs} aria-label="Detail mode tabs">
        {ALL_TABS.map(tab => {
          const { Icon } = tab
          return (
            <button
              key={tab.id}
              className={`${styles.bottomTab} ${activeTab === tab.id ? styles.bottomTabActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
              aria-selected={activeTab === tab.id}
              aria-label={
                IMPLEMENTED_TABS.includes(tab.id)
                  ? tab.label
                  : `${tab.label} (coming soon)`
              }
            >
              <Icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 1.75} />
              <span className={styles.bottomTabLabel}>{tab.short}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
