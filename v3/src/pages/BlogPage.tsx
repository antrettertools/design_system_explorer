import { Link } from 'react-router-dom'
import styles from './BlogPage.module.css'

const POSTS = [
  {
    tag: 'Color Science', tagCls: 'tagBrand',
    title: 'Why OKLCH is the right color space for design tokens',
    excerpt: 'HSL colors that look equally vibrant can differ wildly in perceived brightness. OKLCH fixes this in one elegant formula — and your design system will thank you.',
    date: 'Apr 10, 2026', read: '6 min',
  },
  {
    tag: 'Typography', tagCls: 'tagSecondary',
    title: 'The quiet revolution of variable fonts',
    excerpt: 'Variable fonts compress hundreds of weight variants into a single file. Here\'s how to leverage them in a design system without the configuration overhead.',
    date: 'Mar 28, 2026', read: '5 min',
  },
  {
    tag: 'Dark Mode', tagCls: 'tagAccentA',
    title: 'Dark mode that actually works',
    excerpt: 'Most dark mode implementations just invert the colors. Here\'s how to adapt the full palette perceptually so it looks intentional, not accidental.',
    date: 'Mar 15, 2026', read: '4 min',
  },
]

const TAGS = [
  { label: 'Design Systems',         cls: 'tagBrand' },
  { label: 'Color Theory',           cls: 'tagSecondary' },
  { label: 'OKLCH',                  cls: 'tagAccentA' },
  { label: 'Typography',             cls: 'tagAccentB' },
  { label: 'Component Architecture', cls: 'tagBrand' },
  { label: 'Dark Mode',              cls: 'tagSecondary' },
  { label: 'Accessibility',          cls: 'tagAccentA' },
  { label: 'Design Tokens',          cls: 'tagAccentB' },
]

export function BlogPage() {
  return (
    <div className={styles.page}>

      {/* ── Header ──────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to="/" className={styles.back}>← Generator</Link>
          <Link to="/" className={styles.wordmark}>dsygn.<span>cloud</span></Link>
        </div>
        <nav className={styles.navLinks}>
          <Link className={styles.navLink} to="/pricing">Pricing</Link>
          <Link className={styles.navLink} to="/legal/privacy">Privacy</Link>
        </nav>
      </header>

      {/* ── Featured article ─────────────────────────────── */}
      <article className={styles.featured}>
        <div className={styles.featuredGrid}>

          <div>
            <div className={styles.featuredCategory}>Featured</div>
            <h1 className={styles.featuredTitle}>
              From hex codes to design systems in one keystroke
            </h1>
            <div className={styles.featuredMeta}>
              <span>April 14, 2026</span>
              <span className={styles.dot} />
              <span>8 min read</span>
            </div>
          </div>

          <div>
            <p className={styles.featuredExcerpt}>
              Most designers spend hours wrestling with color pickers, trying to make
              shades look intentionally related. dsygn.cloud takes a different approach:
              start from OKLCH — a perceptually uniform color space — and derive every
              semantic token automatically from a single base hue.
            </p>
            <blockquote className={styles.pullQuote}>
              "The best design system is one you didn't have to configure. Just hit space,
              lock what you love, and ship."
            </blockquote>
            <span className={styles.readMore}>
              Coming soon on this blog ↗
            </span>
          </div>

        </div>
      </article>

      {/* ── Latest posts ─────────────────────────────────── */}
      <section className={styles.postsSection}>
        <h2 className={styles.postsSectionTitle}>Latest articles</h2>
        <div className={styles.postGrid}>
          {POSTS.map(post => (
            <article key={post.title} className={styles.postCard}>
              <span className={`${styles.postTag} ${styles[post.tagCls as keyof typeof styles]}`}>
                {post.tag}
              </span>
              <h2 className={styles.postTitle}>{post.title}</h2>
              <p className={styles.postExcerpt}>{post.excerpt}</p>
              <div className={styles.postMeta}>
                <span>{post.date}</span>
                <span className={styles.dot} />
                <span>{post.read}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Newsletter ────────────────────────────────────── */}
      <section className={styles.newsletter}>
        <div className={styles.newsletterInner}>
          <div>
            <div className={styles.newsletterIcon}>✉</div>
            <h2 className={styles.newsletterTitle}>Stay in the loop</h2>
            <p className={styles.newsletterSub}>
              Deep-dives on design tokens, color science, and typography. No noise, unsubscribe anytime.
            </p>
          </div>
          <div className={styles.newsletterForm}>
            <input className={styles.emailInput} placeholder="you@company.com" readOnly />
            <button className={styles.subscribeBtn}>Subscribe</button>
          </div>
        </div>
      </section>

      {/* ── Topics ────────────────────────────────────────── */}
      <section className={styles.topics}>
        <h3 className={styles.topicsTitle}>Explore topics</h3>
        <div className={styles.tagCloud}>
          {TAGS.map(t => (
            <span key={t.label} className={`${styles.tag} ${styles[t.cls as keyof typeof styles]}`}>
              {t.label}
            </span>
          ))}
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <Link to="/" className={styles.footerLogo}>dsygn.cloud</Link>
        <div className={styles.footerLinks}>
          <Link to="/" className={styles.footerLink}>Generator</Link>
          <Link to="/pricing" className={styles.footerLink}>Pricing</Link>
          <Link to="/legal/privacy" className={styles.footerLink}>Privacy</Link>
          <Link to="/legal/terms" className={styles.footerLink}>Terms</Link>
          <Link to="/impressum" className={styles.footerLink}>Impressum</Link>
        </div>
        <span className={styles.footerCopy}>
          Built with{' '}
          <Link to="/" className={styles.footerBrand}>dsygn.cloud</Link>
          {' '}· © 2026
        </span>
      </footer>

    </div>
  )
}
