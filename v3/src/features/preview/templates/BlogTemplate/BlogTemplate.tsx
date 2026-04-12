import { TemplateIcon } from '../shared/TemplateIcon'
import { PreviewFooter } from '../shared/PreviewFooter'
import styles from './BlogTemplate.module.css'

const POSTS = [
  {
    tag: 'Typography', tagCls: 'tagSecondary',
    title: 'The quiet revolution of variable fonts',
    excerpt: 'Variable fonts compress hundreds of weight variants into a single file. Here\'s how to leverage them in a design system.',
    date: 'Mar 20', read: '7 min',
  },
  {
    tag: 'Components', tagCls: 'tagAccentA',
    title: 'Composing design system components',
    excerpt: 'The difference between a good and a great component library often comes down to composition patterns and slot APIs.',
    date: 'Mar 15', read: '6 min',
  },
  {
    tag: 'Dark Mode', tagCls: 'tagAccentB',
    title: 'Dark mode that actually works',
    excerpt: 'Most dark mode implementations just invert the colors. Here\'s how to adapt the full palette perceptually.',
    date: 'Mar 10', read: '5 min',
  },
]

const TAGS = [
  { label: 'Design Systems',        cls: 'tagBrand' },
  { label: 'Color Theory',          cls: 'tagSecondary' },
  { label: 'OKLCH',                 cls: 'tagAccentA' },
  { label: 'Typography',            cls: 'tagAccentB' },
  { label: 'Component Architecture',cls: 'tagBrand' },
  { label: 'Dark Mode',             cls: 'tagSecondary' },
  { label: 'Accessibility',         cls: 'tagAccentA' },
  { label: 'Design Tokens',         cls: 'tagAccentB' },
]

export function BlogTemplate() {
  return (
    <div className={styles.page}>

      {/* ── NAV ──────────────────────────────────────────── */}
      <nav className={styles.nav}>
        <span className={styles.logo}>The Journal</span>
        <div className={styles.navLinks}>
          {['Design', 'Typography', 'Dev', 'Color'].map(l => (
            <a key={l} className={styles.navLink}>{l}</a>
          ))}
        </div>
        <button className={styles.navSearch} aria-label="Search">
          <TemplateIcon slug="search" size={14} />
        </button>
      </nav>

      <main className={styles.main}>

        {/* ── FEATURED POST ────────────────────────────── */}
        <article className={styles.featured}>
          <div className={styles.featuredGrid}>

            {/* Left — headline */}
            <div className={styles.featuredLeft}>
              <div className={styles.featuredCategory}>Featured</div>
              <h1 className={styles.featuredTitle}>
                The perceptual revolution: why OKLCH is replacing HSL
              </h1>
              <div className={styles.featuredMeta}>
                <TemplateIcon slug="calendar" size={11} />
                <span>March 21, 2026</span>
                <span className={styles.dot} />
                <TemplateIcon slug="clock" size={11} />
                <span>8 min read</span>
              </div>
            </div>

            {/* Right — excerpt + pull quote */}
            <div className={styles.featuredRight}>
              <p className={styles.featuredExcerpt}>
                For decades, designers worked in RGB and HSL — color spaces that feel
                intuitive but are perceptually uneven. OKLCH changes everything by
                separating lightness from chroma in a way the human eye actually perceives.
              </p>
              <blockquote className={styles.pullQuote}>
                "Colors that look equally saturated in HSL can differ wildly in perceived
                lightness. OKLCH fixes this in one elegant formula."
              </blockquote>
              <a className={styles.readMore}>
                Read the full article
                <TemplateIcon slug="arrow-right" size={13} />
              </a>
            </div>

          </div>
        </article>

        {/* ── LATEST POSTS ─────────────────────────────── */}
        <section className={styles.postSection}>
          <h2 className={styles.postSectionTitle}>Latest articles</h2>
          <div className={styles.postGrid}>
            {POSTS.map(post => (
              <article key={post.title} className={styles.postCard}>
                <span className={`${styles.postTag} ${styles[post.tagCls]}`}>{post.tag}</span>
                <h2 className={styles.postTitle}>{post.title}</h2>
                <p className={styles.postExcerpt}>{post.excerpt}</p>
                <div className={styles.postMeta}>
                  <TemplateIcon slug="calendar" size={10} />
                  <span>{post.date}</span>
                  <span className={styles.dot} />
                  <TemplateIcon slug="clock" size={10} />
                  <span>{post.read}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── NEWSLETTER ───────────────────────────────── */}
        <section className={styles.newsletter}>
          <div className={styles.newsletterInner}>
            <div className={styles.newsletterLeft}>
              <div className={styles.newsletterIcon}>
                <TemplateIcon slug="mail" size={22} />
              </div>
              <h2 className={styles.newsletterTitle}>Stay in the loop</h2>
              <p className={styles.newsletterSub}>
                Weekly deep-dives on design systems, color science, and typography.
                No noise, unsubscribe anytime.
              </p>
            </div>
            <div className={styles.newsletterForm}>
              <div className={styles.inputWrap}>
                <input className={styles.emailInput} placeholder="you@company.com" readOnly />
              </div>
              <button className={styles.subscribeBtn}>Subscribe</button>
            </div>
          </div>
        </section>

        {/* ── TOKEN SHOWCASE ───────────────────────────── */}
        <section className={styles.tokenShowcase}>
          <div className={styles.tokenShowcaseLabel}>This blog's design system</div>
          <div className={styles.tokenShowcaseRow}>
            {/* Color palette strip */}
            <div className={styles.tokenPaletteStrip}>
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div
                  key={n}
                  className={styles.tokenPaletteSegment}
                  style={{ background: `var(--color-dataviz-${n}, var(--color-interactive))` }}
                />
              ))}
            </div>
            {/* State chips */}
            <div className={styles.tokenStateChips}>
              {(['success', 'warning', 'error', 'info'] as const).map(s => (
                <span
                  key={s}
                  className={styles.tokenStateChip}
                  style={{ background: `var(--color-${s}-container)`, color: `var(--color-${s})` }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── TOPICS ───────────────────────────────────── */}
        <section className={styles.topics}>
          <h3 className={styles.topicsTitle}>Explore topics</h3>
          <div className={styles.tagCloud}>
            {TAGS.map(t => (
              <span key={t.label} className={`${styles.tag} ${styles[t.cls]}`}>{t.label}</span>
            ))}
          </div>
        </section>

      </main>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>The Journal</div>
        <div className={styles.footerLinks}>
          {['Design', 'Typography', 'Color', 'Archive'].map(l => (
            <a key={l} className={styles.footerLink}>{l}</a>
          ))}
        </div>
        <span className={styles.footerCopy}>
          Built with <a href="https://dsygn.cloud" className={styles.footerBrand} target="_blank" rel="noopener noreferrer">dsygn.cloud</a> · &copy; 2026
        </span>
      </footer>
      <PreviewFooter />

    </div>
  )
}
