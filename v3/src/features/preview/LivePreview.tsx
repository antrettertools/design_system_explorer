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
import { ShowcaseStrip } from './ShowcaseStrip/ShowcaseStrip'

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
  const { showcaseTemplate } = useUI()
  const { hideMobilePreview } = useUIActions()
  const { lastBaseHue } = useColor()

  const [panelRoute, setPanelRoute] = useState<PanelRoute>('home')
  const panelRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

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

  const template = showcaseTemplate

  const renderTemplate = () => {
    // Non-landing templates bypass panelRoute (panelRoute is Landing-only)
    if (template !== 'landing') {
      switch (template) {
        case 'system': return <SystemTemplate />
        case 'dashboard': return <DashboardTemplate />
        case 'blog': return <BlogTemplate />
      }
    }

    // Landing template: honour panelRoute for pricing/legal sub-pages
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

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // Only track touches that start near the left edge — avoids interfering
    // with horizontal scrolling inside templates
    const touch = e.touches[0]
    if (touch.clientX < 48) {
      touchStartX.current = touch.clientX
      touchStartY.current = touch.clientY
    }
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartX.current
    const deltaY = Math.abs(touch.clientY - (touchStartY.current ?? touch.clientY))
    // Swipe right: at least 60px horizontal, less than 40px vertical drift
    if (deltaX > 60 && deltaY < 40) {
      hideMobilePreview()
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  return (
    <div
      className={styles.panel}
      ref={panelRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button className={styles.backBtn} onClick={hideMobilePreview} aria-label="Back to generator">
        &larr; Back to generator
      </button>
      <ShowcaseStrip />
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
