import styles from './LandingTemplate.module.css'

const FEATURES = [
  {
    icon: '⚡',
    title: 'Ship in minutes',
    body: 'Generate a complete design system in one keystroke. CSS variables, Tailwind config, and W3C tokens — all ready to paste.',
  },
  {
    icon: '🎨',
    title: 'Color science built in',
    body: 'OKLCH harmony models ensure your colors look great together. 7 models, perceptually uniform, automatically correct.',
  },
  {
    icon: '✦',
    title: 'Designed for vibe coders',
    body: "No design background required. Lock what you love, cycle what you don't. The system knows color theory so you don't have to.",
  },
]

export function LandingTemplate() {
  return (
    <div className={styles.page}>
      {/* NAV */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>Acme</div>
        <ul className={styles.navLinks}>
          <li><a className={styles.navLink}>Product</a></li>
          <li><a className={styles.navLink}>Pricing</a></li>
          <li><a className={styles.navLink}>Docs</a></li>
          <li><a className={styles.navLink}>Blog</a></li>
        </ul>
        <button className={styles.navCta}>Get started &rarr;</button>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>Now in public beta</div>
        <h1 className={styles.heroHeadline}>
          Build better products,<br />ship them faster
        </h1>
        <p className={styles.heroSub}>
          The all-in-one platform for modern teams. Collaborate in real time,
          ship with confidence, and scale without limits.
        </p>
        <div className={styles.heroActions}>
          <button className={styles.heroPrimary}>Start for free</button>
          <button className={styles.heroSecondary}>Watch demo</button>
        </div>
      </section>

      {/* APP MOCKUP */}
      <div className={styles.mockup}>
        <div className={styles.mockupInner}>
          <div className={styles.mockupSidebar}>
            {[0, 1, 2, 3, 4].map(i => <div key={i} className={styles.mockupSidebarItem} />)}
          </div>
          <div className={styles.mockupMain}>
            <div className={styles.mockupLine} />
            <div className={styles.mockupLineLong} />
            <div className={styles.mockupRow}>
              <div className={styles.mockupCard} />
              <div className={styles.mockupCard} />
              <div className={styles.mockupCard} />
            </div>
            <div className={styles.mockupLineShort} />
            <div className={styles.mockupRow}>
              <div className={styles.mockupCard} />
              <div className={styles.mockupCard} />
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section className={styles.features}>
        <h2 className={styles.featuresTitle}>Everything you need</h2>
        <p className={styles.featuresSub}>
          Built for teams who move fast without breaking things.
        </p>
        <div className={styles.featureGrid}>
          {FEATURES.map(f => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureBody}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className={styles.testimonial}>
        <blockquote className={styles.testimonialQuote}>
          We went from zero to a complete design system in an afternoon.
          Our engineers were shipping new components the same day.
        </blockquote>
        <div className={styles.testimonialAuthor}>
          <span className={styles.testimonialAuthorName}>Sarah Chen</span>
          {' \u2014 Head of Design, Vercel'}
        </div>
      </section>

      {/* CTA BAND */}
      <section className={styles.ctaBand}>
        <h2 className={styles.ctaTitle}>Ready to ship?</h2>
        <p className={styles.ctaSub}>Join 10,000+ teams using palette. today.</p>
        <button className={styles.ctaButton}>Get started for free</button>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>Acme</div>
        <ul className={styles.footerLinks}>
          <li><a className={styles.footerLink}>Privacy</a></li>
          <li><a className={styles.footerLink}>Terms</a></li>
          <li><a className={styles.footerLink}>Status</a></li>
        </ul>
        <span className={styles.footerCopy}>&copy; 2026 Acme, Inc.</span>
      </footer>
    </div>
  )
}
