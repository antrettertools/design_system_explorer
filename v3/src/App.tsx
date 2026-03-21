import { useEffect } from 'react'
import { useColorActions, useTypographyActions, useUI, useUIActions, temporalUndo, temporalRedo } from './store'
import { AppHeader } from './components/AppShell/AppHeader'
import { SplitPane } from './components/SplitPane/SplitPane'
import { GeneratorPanel } from './features/generator/GeneratorPanel'
import { DetailMode } from './features/detail/DetailMode'
import { LivePreview } from './features/preview/LivePreview'
import appStyles from './App.module.css'

export default function App() {
  const colorActions = useColorActions()
  const typographyActions = useTypographyActions()
  const { mode } = useUI()
  const { openExportPanel } = useUIActions()

  useEffect(() => {
    document.documentElement.classList.add('no-transitions')
    colorActions.generate()
    typographyActions.generate()
    // Re-enable transitions after paint to avoid flash on load
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.classList.remove('no-transitions')
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
    </div>
  )
}
