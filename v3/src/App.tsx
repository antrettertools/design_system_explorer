import { useEffect } from 'react'
import { useColorActions, useTypographyActions, useUI, useUIActions, temporalUndo, temporalRedo, useStore } from './store'
import type { DetailTab } from './store/ui'
import type { SpacingState } from './store/spacing'
import { AppHeader } from './components/AppShell/AppHeader'
import { SplitPane } from './components/SplitPane/SplitPane'
import { GeneratorPanel } from './features/generator/GeneratorPanel'
import { DetailMode } from './features/detail/DetailMode'
import { LivePreview } from './features/preview/LivePreview'
import { ExportPanel } from './features/export/ExportPanel'
import { loadFromHash } from './core/share/loadFromHash'
import appStyles from './App.module.css'

export default function App() {
  const colorActions = useColorActions()
  const typographyActions = useTypographyActions()
  const { mode } = useUI()
  const { openExportPanel } = useUIActions()

  useEffect(() => {
    document.documentElement.classList.add('no-transitions')

    // Try loading from shared URL first
    loadFromHash().then(snapshot => {
      if (snapshot) {
        // Restore state from snapshot
        useStore.setState(prev => ({
          ...prev,
          color: {
            ...prev.color,
            slots: snapshot.colors,
            activeModel: snapshot.harmonyModel,
          },
          typography: {
            ...prev.typography,
            pairing: snapshot.pairing,
            locks: snapshot.typographyLocks,
          },
          ui: {
            ...prev.ui,
            theme: snapshot.theme,
            mode: snapshot.mode,
            activeTab: (snapshot.activeTab as DetailTab | null) ?? 'colors',
          },
        }))
        // Apply theme immediately
        document.documentElement.setAttribute('data-theme', snapshot.theme)
        // Generate typography scale for the restored pairing
        useStore.getState().typographyActions.generate()
        // Restore Phase 2 spacing + effects state
        if (snapshot.spacingBaseUnit) {
          useStore.getState().spacingActions.setBaseUnit(snapshot.spacingBaseUnit as SpacingState['baseUnit'])
        }
        if (snapshot.shadowMode) {
          useStore.getState().effectsActions.setShadowMode(snapshot.shadowMode)
        }
      } else {
        // Fresh start — cold random generation
        useStore.getState().colorActions.generate()
        useStore.getState().typographyActions.generate()
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.documentElement.classList.remove('no-transitions')
        })
      })
    })
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT'].includes(
        (e.target as HTMLElement).tagName,
      )

      if (e.code === 'Space' && !isInput) {
        e.preventDefault()
        colorActions.generate()
        typographyActions.generate(undefined)
        return
      }

      if ((e.metaKey || e.ctrlKey) && e.code === 'KeyZ' && !e.shiftKey) {
        e.preventDefault()
        temporalUndo()
        return
      }

      if (
        (e.metaKey || e.ctrlKey) &&
        (e.code === 'KeyY' || (e.code === 'KeyZ' && e.shiftKey))
      ) {
        e.preventDefault()
        temporalRedo()
        return
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [colorActions, typographyActions])

  const leftPanel = mode === 'detail' ? <DetailMode /> : <GeneratorPanel />

  return (
    <div className={appStyles.app}>
      <AppHeader onExportClick={openExportPanel} />
      <div className={appStyles.body}>
        <SplitPane
          left={leftPanel}
          right={<LivePreview />}
        />
      </div>
      <ExportPanel />
    </div>
  )
}
