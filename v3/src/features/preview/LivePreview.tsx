import { useUIActions } from '@/store'
import styles from './LivePreview.module.css'
import { LandingTemplate } from './templates/LandingTemplate/LandingTemplate'

export function LivePreview() {
  const { hideMobilePreview } = useUIActions()
  return (
    <div className={styles.panel}>
      <button className={styles.backBtn} onClick={hideMobilePreview} aria-label="Back to generator">
        &larr; Back to generator
      </button>
      <LandingTemplate />
    </div>
  )
}
