import styles from './LandingTemplate.module.css'

const STEPS = [
  {
    number: '1',
    title: 'Hit ␣ Space',
    body: 'A complete design system generates instantly — OKLCH-calibrated colors, a font pairing, spacing scale, and every semantic token.',
  },
  {
    number: '2',
    title: 'Lock & refine',
    body: "Love the color? Lock it. Not the font? Hit space again. Build exactly what you want by locking what's working and regenerating the rest.",
  },
  {
    number: '3',
    title: 'Export & ship',
    body: 'CSS variables, Tailwind v3/v4, SCSS, W3C Design Tokens, Figma JSON — copy and paste. No config files, no setup rituals.',
  },
]

export function HowItWorksSection() {
  return (
    <section className={styles.section} id="how-it-works">
      <div className={styles.sectionLabel}>How it works</div>
      <div className={styles.howItWorksGrid}>
        {STEPS.map((step) => (
          <div key={step.number} className={styles.howItWorksStep}>
            <div className={styles.stepNumber}>{step.number}</div>
            <div className={styles.stepTitle}>{step.title}</div>
            <p className={styles.stepBody}>{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
