import styles from './PricingView.module.css'

interface PricingViewProps {
  onBack: () => void
}

export function PricingView({ onBack }: PricingViewProps) {
  return (
    <div className={styles.view}>
      <button className={styles.backBtn} onClick={onBack}>← Back</button>
      <h2>Pricing</h2>
    </div>
  )
}
