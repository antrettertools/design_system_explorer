import type { MouseEvent } from 'react'
import styles from './AppLayout.module.css'
import { AppHeader } from './AppHeader'
import { QuickModeLayout } from '@/features/quick/QuickModeLayout'
import { ShowcasePanel } from '@/features/showcase/ShowcasePanel'
import { ShowcaseSidebar } from '@/features/showcase/ShowcaseSidebar'
import { ColorPanel } from '@/features/color/ColorPanel'
import { ColorSidebar } from '@/features/color/ColorSidebar'
import { TypographyPanel } from '@/features/typography/TypographyPanel'
import { TypographySidebar } from '@/features/typography/TypographySidebar'
import { SpacingPanel } from '@/features/spacing/SpacingPanel'
import { SpacingSidebar } from '@/features/spacing/SpacingSidebar'
import { ShadowPanel } from '@/features/shadows/ShadowPanel'
import { ShadowSidebar } from '@/features/shadows/ShadowSidebar'
import { useUI, useUIActions } from '@/store'
import type { TabId } from '@/store/ui'

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'color', label: 'Color' },
  { id: 'typography', label: 'Type' },
  { id: 'spacing', label: 'Spacing' },
  { id: 'shadows', label: 'Shadows' },
  { id: 'components', label: 'Components' },
  { id: 'showcase', label: 'Showcase' },
  { id: 'export', label: 'Export' },
]

export function AppLayout() {
  const { mode, activeTab, sidebarWidth } = useUI()
  const { setActiveTab, setSidebarWidth } = useUIActions()

  if (mode === 'quick') {
    return (
      <div className={styles.quickLayout}>
        <AppHeader />
        <div className={styles.quickContent}>
          <QuickModeLayout />
        </div>
      </div>
    )
  }

  const handleResizeStart = (e: MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = sidebarWidth

    const onMove = (ev: globalThis.MouseEvent) => {
      const delta = ev.clientX - startX
      setSidebarWidth(Math.max(240, Math.min(420, startWidth + delta)))
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  return (
    <div className={styles.exploreLayout}>
      <AppHeader />
      <div className={styles.tabBar}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.body}>
        <aside className={styles.sidebar} style={{ width: sidebarWidth }}>
          {activeTab === 'color' && <ColorSidebar />}
          {activeTab === 'typography' && <TypographySidebar />}
          {activeTab === 'spacing' && <SpacingSidebar />}
          {activeTab === 'shadows' && <ShadowSidebar />}
          {activeTab === 'showcase' && <ShowcaseSidebar />}
          {activeTab !== 'color' && activeTab !== 'typography' && activeTab !== 'spacing' && activeTab !== 'shadows' && activeTab !== 'showcase' && (
            <div className={styles.placeholder}>Sidebar — {activeTab}</div>
          )}
        </aside>
        <div className={styles.resizeHandle} onMouseDown={handleResizeStart} />
        <main className={styles.preview}>
          {activeTab === 'color' && <ColorPanel />}
          {activeTab === 'typography' && <TypographyPanel />}
          {activeTab === 'spacing' && <SpacingPanel />}
          {activeTab === 'shadows' && <ShadowPanel />}
          {activeTab === 'showcase' && <ShowcasePanel />}
          {activeTab !== 'color' && activeTab !== 'typography' && activeTab !== 'spacing' && activeTab !== 'shadows' && activeTab !== 'showcase' && (
            <div className={styles.placeholder}>Panel — {activeTab}</div>
          )}
        </main>
      </div>
    </div>
  )
}
