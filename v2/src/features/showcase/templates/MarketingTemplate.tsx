import type { PrimitiveTokens } from '@/core/tokens/types'
import styles from './MarketingTemplate.module.css'

interface MarketingTemplateProps { primitive: PrimitiveTokens }

export function MarketingTemplate({ primitive: _primitive }: MarketingTemplateProps) {
  return (
    <div className={styles.page}>
      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.navBrand}>Acme Co.</div>
        <div className={styles.navLinks}>
          {['Product', 'Pricing', 'Company', 'Blog'].map(l => (
            <a key={l} className={styles.navLink}>{l}</a>
          ))}
        </div>
        <button className={styles.navCta}>Get started</button>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>Now in public beta</div>
        <h1 className={styles.heroTitle}>Build better products, faster.</h1>
        <p className={styles.heroSub}>The design-to-code platform that ships your tokens automatically. From palette to production in minutes.</p>
        <div className={styles.heroBtns}>
          <button className={styles.heroPrimary}>Start for free</button>
          <button className={styles.heroSecondary}>Watch demo →</button>
        </div>
      </section>

      {/* Stats */}
      <div className={styles.stats}>
        {[
          { value: '10k+', label: 'Design systems' },
          { value: '98%', label: 'Customer satisfaction' },
          { value: '40%', label: 'Faster delivery' },
        ].map(s => (
          <div key={s.label} className={styles.stat}>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Everything you need</h2>
        <div className={styles.featureGrid}>
          {[
            { title: 'OKLCH Color', desc: 'Generate perceptually uniform palettes with automatic contrast checking.' },
            { title: 'Live Preview', desc: 'See your system in action across four real-world templates instantly.' },
            { title: 'Export Ready', desc: 'CSS, Tailwind, W3C tokens, and Figma Tokens out of the box.' },
            { title: 'Semantic Roles', desc: '42 pre-mapped roles — interactive, surface, state — all derived automatically.' },
            { title: 'Type System', desc: 'Heading + body font pairing with modular scale and readability scoring.' },
            { title: 'URL Sharing', desc: 'Share your entire system as a compressed URL. No account needed.' },
          ].map(f => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>◆</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h2 className={styles.ctaTitle}>Ready to ship your design system?</h2>
        <p className={styles.ctaSub}>Join thousands of teams already using Acme.</p>
        <button className={styles.ctaBtn}>Get started — it's free</button>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>Acme Co.</div>
        <div className={styles.footerLinks}>
          {['Privacy', 'Terms', 'Blog', 'Status'].map(l => (
            <a key={l} className={styles.footerLink}>{l}</a>
          ))}
        </div>
        <div className={styles.footerCopy}>© 2025 Acme Inc.</div>
      </footer>
    </div>
  )
}
