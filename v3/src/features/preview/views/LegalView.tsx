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
      <p>Content coming soon.</p>
    </div>
  )
}
