import { Link } from 'react-router-dom'
import styles from './BlogPage.module.css'

export function BlogPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.back}>← Back to generator</Link>
        <span className={styles.wordmark}>dsygn.cloud</span>
      </header>
      <div className={styles.content}>
        <div className={styles.title}>Blog — coming soon</div>
        <p className={styles.subtitle}>
          We&apos;re working on articles about design tokens, color theory, and building design systems. Check back soon.
        </p>
        <Link to="/" className={styles.back}>← Back to generator</Link>
      </div>
    </div>
  )
}
