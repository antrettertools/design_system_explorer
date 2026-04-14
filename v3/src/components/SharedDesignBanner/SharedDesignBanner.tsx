import { useColorActions, useTypographyActions, useUI, useUIActions } from '@/store'
import { trackEvent } from '@/analytics'
import styles from './SharedDesignBanner.module.css'

export function SharedDesignBanner() {
  const { loadedFromShare } = useUI()
  const { generate } = useColorActions()
  const typographyActions = useTypographyActions()
  const { copyShareLink, dismissShareBanner } = useUIActions()

  if (!loadedFromShare) return null

  const handleMakeYours = () => {
    generate()
    typographyActions.generate(undefined)
    window.history.replaceState(null, '', window.location.pathname)
    dismissShareBanner()
    trackEvent('Share Banner — Make Yours')
  }

  return (
    <div className={styles.banner} role="status" aria-label="Viewing shared design">
      <span className={styles.label}>Viewing a shared design system</span>
      <div className={styles.actions}>
        <button
          className={styles.shareBtn}
          onClick={() => void copyShareLink()}
          title="Copy this link"
        >
          ↗ Copy link
        </button>
        <button className={styles.makeYoursBtn} onClick={handleMakeYours}>
          Generate yours →
        </button>
      </div>
    </div>
  )
}
