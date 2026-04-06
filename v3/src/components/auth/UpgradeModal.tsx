import { useEffect, useState } from 'react'
import { trackEvent } from '@/analytics'
import { useUI, useUIActions } from '@/store'
import { useAuth } from '@/auth/useAuth'
import { supabase } from '@/lib/supabase'
import styles from './UpgradeModal.module.css'

const PAID_FEATURES = [
  'All export formats (Tailwind, SCSS, W3C JSON, Figma…)',
  'Unlimited cloud saves',
  'Download as ZIP (all formats at once)',
  'Custom CSS variable prefix',
  'Hosted design system page (shareable public URL)',
  'Auto-generated branding document (PDF)',
  'Design history & named versions',
]

export function UpgradeModal() {
  const { upgradeModalOpen } = useUI()
  const { closeUpgradeModal } = useUIActions()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  // Close on Escape
  useEffect(() => {
    if (!upgradeModalOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeUpgradeModal()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [upgradeModalOpen, closeUpgradeModal])

  // Reset error state when modal closes
  useEffect(() => {
    if (!upgradeModalOpen) setCheckoutError(null)
  }, [upgradeModalOpen])

  if (!upgradeModalOpen || !user) return null

  const handleUpgrade = async () => {
    trackEvent('Upgrade Click')
    setLoading(true)
    setCheckoutError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No active session. Please sign in again.')

      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId: user.id }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }

      const { url } = await res.json() as { url: string }
      if (!url) throw new Error('No checkout URL returned')

      // Redirect to Stripe hosted checkout (new tab is blocked by some browsers; prefer same-tab)
      window.location.href = url
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      )
      setLoading(false)
    }
    // Note: don't reset loading to false on success — page will navigate away
  }

  return (
    <>
      <div
        className={styles.overlay}
        onClick={closeUpgradeModal}
        aria-hidden="true"
      />
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Upgrade to Lifetime"
      >
        <div className={styles.header}>
          <div className={styles.badge}>Lifetime deal</div>
          <h2 className={styles.heading}>Unlock the full toolkit</h2>
          <p className={styles.sub}>
            One payment. Everything, forever. No subscription.
          </p>
        </div>

        <ul className={styles.features}>
          {PAID_FEATURES.map(f => (
            <li key={f} className={styles.featureItem}>
              <span className={styles.checkmark}>✓</span>
              {f}
            </li>
          ))}
        </ul>

        <div className={styles.footer}>
          {checkoutError && (
            <p className={styles.errorMsg}>{checkoutError}</p>
          )}
          <button
            className={styles.upgradeBtn}
            onClick={handleUpgrade}
            disabled={loading}
          >
            {loading ? 'Redirecting to checkout…' : 'Upgrade — €29 lifetime'}
          </button>
          <p className={styles.disclaimer}>
            Early bird price. One-time payment, no recurring charges.
          </p>
          <button className={styles.skipBtn} onClick={closeUpgradeModal}>
            Maybe later
          </button>
        </div>
      </div>
    </>
  )
}
