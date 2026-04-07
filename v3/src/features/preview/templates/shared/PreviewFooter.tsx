import { useAuth } from '@/auth/useAuth'
import { useUIActions } from '@/store'
import styles from './PreviewFooter.module.css'

export function PreviewFooter() {
  const { user } = useAuth()
  const { openSignInPrompt, openUpgradeModal, openDonateModal } = useUIActions()

  const isPaid = user?.plan === 'paid'
  const isFree = !!user && !isPaid

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        <div className={styles.brand}>
          <span className={styles.brandName}>dsygn.cloud</span>
          <span className={styles.brandTagline}>
            Production-ready design systems in one keystroke.
          </span>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.coffeeBtn}
            onClick={() => openDonateModal('footer')}
          >
            ☕ Buy me a coffee
          </button>

          {!isPaid && (
            <button
              className={styles.ctaBtn}
              onClick={isFree ? openUpgradeModal : () => openSignInPrompt('manual')}
            >
              {isFree ? 'Upgrade — €29' : 'Start free →'}
            </button>
          )}
          {isPaid && (
            <span className={styles.paidBadge}>Lifetime ✓</span>
          )}
        </div>

        <div className={styles.legal}>
          <a
            className={styles.legalLink}
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy
          </a>
          <a
            className={styles.legalLink}
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms
          </a>
          <a
            className={styles.legalLink}
            href="/impressum"
            target="_blank"
            rel="noopener noreferrer"
          >
            Impressum
          </a>
        </div>

      </div>
    </footer>
  )
}
