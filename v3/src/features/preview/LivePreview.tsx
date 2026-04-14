import { useRef } from 'react'
import { useUI, useUIActions } from '@/store'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import styles from './LivePreview.module.css'
import { DsygnLanding } from './templates/LandingTemplate/DsygnLanding'
import { SystemTemplate } from './templates/SystemTemplate/SystemTemplate'
import { DashboardTemplate } from './templates/DashboardTemplate/DashboardTemplate'
import { BlogTemplate } from './templates/BlogTemplate/BlogTemplate'
import { ShowcaseStrip } from './ShowcaseStrip/ShowcaseStrip'

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

  const panelRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  const renderTemplate = () => {
    switch (showcaseTemplate) {
      case 'system':    return <SystemTemplate />
      case 'dashboard': return <DashboardTemplate />
      case 'blog':      return <BlogTemplate />
      default:          return <DsygnLanding />
    }
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
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
