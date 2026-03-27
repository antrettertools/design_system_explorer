import { useUI, useUIActions } from '@/store'
import styles from './LivePreview.module.css'
import { LandingTemplate } from './templates/LandingTemplate/LandingTemplate'
import { SystemTemplate } from './templates/SystemTemplate/SystemTemplate'
import { DashboardTemplate } from './templates/DashboardTemplate/DashboardTemplate'
import { BlogTemplate } from './templates/BlogTemplate/BlogTemplate'

export function LivePreview() {
  const { showcaseTemplate, mode } = useUI()
  const { hideMobilePreview } = useUIActions()

  // In generator mode, always show landing (single fixed template per spec)
  const template = mode === 'detail' ? showcaseTemplate : 'landing'

  const renderTemplate = () => {
    switch (template) {
      case 'system': return <SystemTemplate />
      case 'dashboard': return <DashboardTemplate />
      case 'blog': return <BlogTemplate />
      default: return <LandingTemplate />
    }
  }

  return (
    <div className={styles.panel}>
      <button className={styles.backBtn} onClick={hideMobilePreview} aria-label="Back to generator">
        &larr; Back to generator
      </button>
      {renderTemplate()}
    </div>
  )
}
