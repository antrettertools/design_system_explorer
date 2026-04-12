import styles from './LegalView.module.css'

type LegalPage = 'privacy' | 'terms' | 'impressum'

interface LegalViewProps {
  page: LegalPage
  onBack: () => void
}

const TITLES: Record<LegalPage, string> = {
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  impressum: 'Impressum',
}

export function LegalView({ page, onBack }: LegalViewProps) {
  return (
    <div className={styles.view}>
      <button className={styles.backBtn} onClick={onBack}>← Back</button>
      <h2 className={styles.title}>{TITLES[page]}</h2>
      <p style={{ color: 'var(--color-on-surface-subtle)', fontSize: '14px', lineHeight: 1.6 }}>
        Full content available at{' '}
        <a
          href={`/${page}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--color-interactive)', textDecoration: 'underline' }}
        >
          dsygn.cloud/{page}
        </a>
      </p>
    </div>
  )
}
