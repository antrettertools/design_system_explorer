import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { useUIActions } from '@/store'
import styles from './AccountPage.module.css'

export function AccountPage() {
  const { user, loading, signOut } = useAuth()
  const { openUpgradeModal } = useUIActions()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) navigate('/')
  }, [user, loading, navigate])

  if (loading || !user) return null

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.back}>← Back to generator</Link>
      </header>

      <main className={styles.content}>
        <section className={styles.card}>
          <h2 className={styles.heading}>Account</h2>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Username</span>
            <span className={styles.rowValue}>{user.username}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Email</span>
            <span className={styles.rowValue}>{user.email ?? '—'}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Plan</span>
            <span className={`${styles.rowValue} ${user.plan === 'paid' ? styles.paid : styles.free}`}>
              {user.plan === 'paid' ? 'Lifetime' : 'Free'}
            </span>
          </div>

          {user.plan === 'free' && (
            <div className={styles.upgradeCta}>
              <p className={styles.upgradeText}>
                Upgrade to unlock all export formats, unlimited saves, ZIP download, and your hosted design system page.
              </p>
              <button className={styles.upgradeBtn} onClick={openUpgradeModal}>
                Upgrade — €29 lifetime
              </button>
            </div>
          )}
        </section>

        <button className={styles.signOut} onClick={signOut}>
          Sign out
        </button>
      </main>
    </div>
  )
}
