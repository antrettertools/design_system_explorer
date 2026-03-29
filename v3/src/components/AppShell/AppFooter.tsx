import { Link } from 'react-router-dom'
import styles from './AppFooter.module.css'

export function AppFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <span className={styles.brand}>dsygn.cloud</span>
        <nav className={styles.links} aria-label="Legal">
          <Link className={styles.link} to="/legal/privacy">Privacy Policy</Link>
          <Link className={styles.link} to="/legal/terms">Terms of Service</Link>
          <Link className={styles.link} to="/impressum">Impressum</Link>
        </nav>
      </div>
    </footer>
  )
}
