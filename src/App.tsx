import { useUI } from '@/store'
import { AppHeader } from '@/components/layout/AppHeader'
import { AppLayout } from '@/components/layout/AppLayout'
import { Toast } from '@/components/feedback/Toast'

// Typography
import { TypographySidebar } from '@/features/typography/TypographySidebar'
import { TypographyPanel } from '@/features/typography/TypographyPanel'

// Color
import { ColorSidebar } from '@/features/color/ColorSidebar'
import { ColorPanel } from '@/features/color/ColorPanel'

// Spacing
import { SpacingSidebar } from '@/features/spacing/SpacingSidebar'
import { SpacingPanel } from '@/features/spacing/SpacingPanel'

// Shadows
import { ShadowSidebar } from '@/features/shadows/ShadowSidebar'
import { ShadowPanel } from '@/features/shadows/ShadowPanel'

// Components
import { ComponentsSidebar } from '@/features/components/ComponentsSidebar'
import { ComponentsPanel } from '@/features/components/ComponentsPanel'

// Compare
import { CompareSidebar } from '@/features/compare/CompareSidebar'
import { ComparePanel } from '@/features/compare/ComparePanel'

// Export
import { ExportSidebar } from '@/features/export/ExportSidebar'
import { ExportPanel } from '@/features/export/ExportPanel'

import type { TabId } from '@/store/ui'

export function App() {
  const { activeTab } = useUI()

  const { sidebar, panel } = getTabContent(activeTab)

  return (
    <>
      <AppHeader />
      <AppLayout sidebar={sidebar} preview={panel} />
      <Toast />
    </>
  )
}

function getTabContent(tab: TabId): { sidebar: React.ReactNode; panel: React.ReactNode } {
  switch (tab) {
    case 'typography':
      return { sidebar: <TypographySidebar />, panel: <TypographyPanel /> }
    case 'color':
      return { sidebar: <ColorSidebar />, panel: <ColorPanel /> }
    case 'spacing':
      return { sidebar: <SpacingSidebar />, panel: <SpacingPanel /> }
    case 'shadows':
      return { sidebar: <ShadowSidebar />, panel: <ShadowPanel /> }
    case 'components':
      return { sidebar: <ComponentsSidebar />, panel: <ComponentsPanel /> }
    case 'compare':
      return { sidebar: <CompareSidebar />, panel: <ComparePanel /> }
    case 'export':
      return { sidebar: <ExportSidebar />, panel: <ExportPanel /> }
  }
}
