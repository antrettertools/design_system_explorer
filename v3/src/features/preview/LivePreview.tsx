import { useRef, useState, useEffect } from 'react'
import { useUI, useUIActions, useColor } from '@/store'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import styles from './LivePreview.module.css'
import { DsygnLanding } from './templates/LandingTemplate/DsygnLanding'
import { SystemTemplate } from './templates/SystemTemplate/SystemTemplate'
import { DashboardTemplate } from './templates/DashboardTemplate/DashboardTemplate'
import { BlogTemplate } from './templates/BlogTemplate/BlogTemplate'
import { PricingView } from './views/PricingView'
import { LegalView } from './views/LegalView'

type PanelRoute = 'home' | 'pricing' | 'privacy' | 'terms' | 'impressum'

function LivePreviewErrorFallback() {
  return (
    <div className={`${styles.panel} ${styles.errorFallback}`}>
      <p className={styles.errorMessage}>Preview unavailable.</p>
      <button className={styles.errorReload} onClick={() => window.location.reload()}>
        Reload page
      </button>
    </div>
  )
}

function LivePreviewContent() {
  const { showcaseTemplate, mode } = useUI()
  const { hideMobilePreview } = useUIActions()
  const { lastBaseHue } = useColor()

  const [panelRoute, setPanelRoute] = useState<PanelRoute>('home')
  const panelRef = useRef<HTMLDivElement>(null)

  // Reset to home when a new palette is generated
  useEffect(() => {
    setPanelRoute('home')
  }, [lastBaseHue])

  // Scroll to top on route change
  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.scrollTop = 0
    }
  }, [panelRoute])

  // In generator mode, always show landing (single fixed template per spec)
  const template = mode === 'detail' ? showcaseTemplate : 'landing'

  const renderTemplate = () => {
    // Detail mode non-landing templates bypass panelRoute
    if (mode === 'detail' && template !== 'landing') {
      switch (template) {
        case 'system': return <SystemTemplate />
        case 'dashboard': return <DashboardTemplate />
        case 'blog': return <BlogTemplate />
      }
    }

    // Landing template (both modes) and generator mode: honor panelRoute
    switch (panelRoute) {
      case 'pricing':
        return <PricingView onBack={() => setPanelRoute('home')} />
      case 'privacy':
      case 'terms':
      case 'impressum':
        return <LegalView page={panelRoute} onBack={() => setPanelRoute('home')} />
      default:
        return <DsygnLanding onNavigate={setPanelRoute} />
    }
  }

  return (
    <div className={styles.panel} ref={panelRef}>
      <button className={styles.backBtn} onClick={hideMobilePreview} aria-label="Back to generator">
        &larr; Back to generator
      </button>
      {renderTemplate()}
    </div>
  )
}

export function LivePreview() {
  return (
    <ErrorBoundary fallback={<LivePreviewErrorFallback />}>
      <LivePreviewContent />
    </ErrorBoundary>
  )
}
