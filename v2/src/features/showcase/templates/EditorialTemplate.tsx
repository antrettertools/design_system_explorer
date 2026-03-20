import type { PrimitiveTokens } from '@/core/tokens/types'
import styles from './EditorialTemplate.module.css'

interface EditorialTemplateProps { primitive: PrimitiveTokens }

export function EditorialTemplate({ primitive: _primitive }: EditorialTemplateProps) {
  return (
    <div className={styles.page}>
      <header className={styles.masthead}>
        <div className={styles.mastheadName}>The Observer</div>
        <nav className={styles.mastheadNav}>
          {['Arts', 'Science', 'Politics', 'Culture', 'Opinion'].map(l => (
            <a key={l} className={styles.mastheadLink}>{l}</a>
          ))}
        </nav>
        <div className={styles.mastheadDate}>March 2025</div>
      </header>
      <div className={styles.layout}>
        <article className={styles.article}>
          <div className={styles.category}>Design & Technology</div>
          <h1 className={styles.articleTitle}>The Death of the Neutral Palette: How Color Science Remade UI Design</h1>
          <div className={styles.byline}>By Jordan Williams · 12 min read</div>
          <p className={styles.lead}>For a decade, the dominant aesthetic of the digital product world was restraint — white backgrounds, grey text, the barest whisper of color. But a revolution in color science is changing everything.</p>
          <h2 className={styles.h2}>From RGB to OKLCH</h2>
          <p className={styles.body}>The shift began quietly, as most revolutions do. Designers working with accessibility constraints noticed something troubling: colors that looked vibrant on their calibrated displays turned muddy or inaccessible when exported to production. The problem was perceptual non-uniformity in traditional color models.</p>
          <p className={styles.body}>OKLCH — Oklab Lightness, Chroma, Hue — solved this by building on perceptual research going back decades. A step of 0.1 in the L channel always looks like the same amount of lightness change to the human eye, regardless of hue. This makes palette generation tractable in a way it never was before.</p>
          <blockquote className={styles.blockquote}>"We can finally generate a palette and be confident it will look consistent across every hue. That was essentially impossible before."</blockquote>
          <h2 className={styles.h2}>The Semantic Layer</h2>
          <p className={styles.body}>But the color model was only part of the change. The bigger shift was conceptual: moving from named colors to semantic roles. Instead of "blue-500", designers now think in terms of "interactive" and "on-interactive" — roles that describe how a color is used, not what it looks like.</p>
          <p className={styles.body}>This separation of primitive and semantic layers means the same design system can support multiple brand expressions without rebuilding from scratch. Change the primary hue, and the entire semantic layer recomputes automatically.</p>
        </article>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarTitle}>Related Stories</div>
            {['The Accessibility Reckoning', 'Dark Mode Is Not Enough', 'Typography in the Age of Variable Fonts'].map(s => (
              <div key={s} className={styles.sidebarLink}>{s}</div>
            ))}
          </div>
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarTitle}>Most Read</div>
            {['1. The Type Crisis', '2. Brand at Scale', '3. Token Systems'].map(s => (
              <div key={s} className={styles.sidebarLink}>{s}</div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
