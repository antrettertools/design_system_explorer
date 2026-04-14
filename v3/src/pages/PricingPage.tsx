import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { useUIActions } from '@/store'
import landingStyles from '@/features/preview/templates/LandingTemplate/LandingTemplate.module.css'
import styles from './PricingPage.module.css'

const EARLY_BIRD_ACTIVE = import.meta.env.VITE_EARLY_BIRD_ACTIVE === 'true'

export function PricingPage() {
  const { user } = useAuth()
  const { openSignInPrompt, openUpgradeModal, openDonateModal } = useUIActions()

  const isSignedIn = user !== null
  const isPaid = user?.plan === 'paid'

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.back}>← Back to generator</Link>
        <span className={styles.wordmark}>dsygn.cloud</span>
      </header>

      <div className={styles.content}>
        <div className={landingStyles.sectionLabel} style={{ marginBottom: '32px' }}>
          Simple pricing
        </div>

        <div className={landingStyles.pricingGrid}>

          {/* Free card */}
          <div className={landingStyles.pricingCard}>
            <div className={landingStyles.pricingLabel}>Free</div>
            <div className={landingStyles.pricingPrice}>€0</div>
            <div className={landingStyles.pricingSubtext}>forever</div>
            <ul className={landingStyles.pricingList}>
              <li className={landingStyles.pricingListItem}>Generator (all features)</li>
              <li className={landingStyles.pricingListItem}>CSS export</li>
              <li className={landingStyles.pricingListItem}>3 saved designs</li>
              <li className={landingStyles.pricingListItem}>No account required to start</li>
            </ul>
            <button className={landingStyles.pricingCta} onClick={() => openSignInPrompt('manual')}>
              Start free
            </button>
          </div>

          {/* Lifetime card */}
          <div className={`${landingStyles.pricingCard} ${landingStyles.pricingCardHighlight}`}>
            <div className={landingStyles.pricingLabelRow}>
              <span className={landingStyles.pricingLabel}>Lifetime</span>
              {EARLY_BIRD_ACTIVE && <span className={landingStyles.earlyBirdBadge}>Early Bird</span>}
            </div>
            <div className={landingStyles.pricingPrice}>€29</div>
            <div className={landingStyles.pricingSubtext}>one-time · no subscription</div>
            <ul className={landingStyles.pricingList}>
              <li className={landingStyles.pricingListItem}>Everything in Free</li>
              <li className={landingStyles.pricingListItem}>Unlimited cloud saves</li>
              <li className={landingStyles.pricingListItem}>All export formats (ZIP, Figma, W3C, SCSS, Tailwind)</li>
              <li className={landingStyles.pricingListItem}>Branding PDF</li>
              <li className={landingStyles.pricingListItem}>Hosted public design system page</li>
              <li className={landingStyles.pricingListItem}>Version history</li>
            </ul>
            {!isSignedIn && (
              <button className={landingStyles.pricingCta} onClick={() => openSignInPrompt('manual')}>
                Get lifetime access
              </button>
            )}
            {isSignedIn && !isPaid && (
              <button className={landingStyles.pricingCta} onClick={openUpgradeModal}>
                Upgrade — €29
              </button>
            )}
            {isSignedIn && isPaid && (
              <button className={`${landingStyles.pricingCta} ${landingStyles.pricingCtaDisabled}`} disabled>
                You&apos;re all set ✓
              </button>
            )}
          </div>

        </div>

        <div className={landingStyles.coffeeRow}>
          Enjoying dsygn.cloud? ☕{' '}
          <button className={landingStyles.coffeeBtn} onClick={() => openDonateModal('footer')}>
            Buy me a coffee
          </button>
        </div>
      </div>
    </div>
  )
}
