import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { DonateModal } from '@/components/DonateModal/DonateModal'
import styles from './AppFooter.module.css'

export function AppFooter() {
  const [donateOpen, setDonateOpen] = useState(false)

  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <span className={styles.brand}>dsygn.cloud</span>
        <button
          className={styles.donateBtn}
          onClick={() => setDonateOpen(true)}
          aria-label="Support this project"
        >
          <Heart size={12} strokeWidth={1.75} />
          Support this project
        </button>
        <nav className={styles.links} aria-label="Legal">
          <Link className={styles.link} to="/legal/privacy">Privacy Policy</Link>
          <Link className={styles.link} to="/legal/terms">Terms of Service</Link>
          <Link className={styles.link} to="/impressum">Impressum</Link>
        </nav>
      </div>
      <DonateModal
        open={donateOpen}
        onClose={() => setDonateOpen(false)}
        source="footer"
      />
    </footer>
  )
}
