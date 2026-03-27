import { TemplateIcon } from '../shared/TemplateIcon'
import type { IconSlug } from '../shared/TemplateIcon'
import styles from './LandingTemplate.module.css'

const FEATURES: { icon: IconSlug; title: string; body: string; cls: string }[] = [
  { icon: 'star',     title: 'OKLCH Color Science',    body: 'Perceptually uniform colors built on the OKLCH model. Every shade looks intentional — no more muddy mid-tones or blown-out lights.',          cls: 'iconBrand' },
  { icon: 'settings', title: 'Design Token Engine',     body: 'Every value — color, type, spacing, radius, shadow — lives as a CSS variable. Export to Tailwind, SCSS, W3C, or Figma in one click.',     cls: 'iconSecondary' },
  { icon: 'check',    title: 'Accessibility Built In',  body: 'APCA contrast analysis runs on every color pair. Your system ships compliant by default — no manual checking required.',                    cls: 'iconAccentA' },
  { icon: 'heart',    title: 'Loved by Teams',          body: 'From solo founders to 50-person design teams. One spacebar regenerates everything. Lock what you love, cycle what you don\'t.',            cls: 'iconAccentB' },
  { icon: 'file',     title: 'Multi-Format Export',     body: 'CSS variables, Tailwind v3/v4, SCSS, W3C Design Tokens, and Figma JSON — all in perfect sync, always up to date.',                          cls: 'iconAccentC' },
  { icon: 'calendar', title: 'Ship in Minutes',         body: 'Generate your entire design system in a single keystroke. Paste the output, start building. No configuration files, no setup rituals.',    cls: 'iconAccentD' },
]

const ALERTS: { state: string; icon: IconSlug; title: string; body: string }[] = [
  { state: 'success', icon: 'check',    title: 'All checks passed',       body: '47 tokens compiled, contrast ratios verified across all color pairs.' },
  { state: 'info',    icon: 'bell',     title: 'Harmony model updated',   body: 'Switched to triadic — 4 accent slots regenerated automatically.' },
  { state: 'warning', icon: 'calendar', title: 'Breaking change in v2',   body: 'Token names are changing. Review the migration guide before upgrading.' },
  { state: 'error',   icon: 'x',        title: 'Contrast check failed',   body: 'Body text on surface-raised is below 4.5:1. Adjust lightness by 8–12%.' },
]

const TRUST_NAMES = ['Figma', 'Linear', 'Vercel', 'Stripe', 'Loom']

export function LandingTemplate() {
  return (
    <div className={styles.page}>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>Spectrum</div>
        <ul className={styles.navLinks}>
          {['Product', 'Solutions', 'Pricing', 'Blog'].map(l => (
            <li key={l}><a className={styles.navLink}>{l}</a></li>
          ))}
        </ul>
        <div className={styles.navRight}>
          <button className={styles.iconBtn} aria-label="Search">
            <TemplateIcon slug="search" size={15} />
          </button>
          <button className={styles.iconBtnNotif} aria-label="Notifications">
            <TemplateIcon slug="bell" size={15} />
            <span className={styles.notifDot} />
          </button>
          <div className={styles.navDivider} />
          <button className={styles.navCtaOutline}>Sign in</button>
          <button className={styles.navCta}>Get started</button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <TemplateIcon slug="star" size={11} />
          <span>v2.0 — 7 harmony models, instant export</span>
        </div>
        <h1 className={styles.heroHeadline}>
          Design systems<br />
          <span className={styles.heroAccent}>built to scale</span>
        </h1>
        <p className={styles.heroSub}>
          Generate a complete, production-ready design system in one keystroke.
          OKLCH color science, modular typography, and tokens for every framework.
        </p>
        <div className={styles.heroActions}>
          <button className={styles.heroPrimary}>
            Start building free
            <TemplateIcon slug="arrow-right" size={15} />
          </button>
          <button className={styles.heroGhost}>Watch the demo</button>
        </div>
        <div className={styles.trustBar}>
          <span className={styles.trustLabel}>Trusted by teams at</span>
          <div className={styles.trustLogos}>
            {TRUST_NAMES.map((name, i) => (
              <span key={name} className={styles.trustItem}>
                {i > 0 && <span className={styles.trustDot} />}
                <span className={styles.trustLogo}>{name}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── APP MOCKUP ──────────────────────────────────────── */}
      <div className={styles.mockupWrap}>
        <div className={styles.mockup}>
          <div className={styles.mockupBar}>
            <span className={styles.mockupDot} style={{ background: 'var(--color-error, #dc2626)' }} />
            <span className={styles.mockupDot} style={{ background: 'var(--color-warning, #d97706)' }} />
            <span className={styles.mockupDot} style={{ background: 'var(--color-success, #16a34a)' }} />
            <span className={styles.mockupUrl}>spectrum.design/dashboard</span>
          </div>
          <div className={styles.mockupInner}>
            <div className={styles.mockupSidebar}>
              {[0.7, 0.2, 0.2, 0.2, 0.15].map((op, i) => (
                <div key={i} className={styles.mockupNavItem} style={{ opacity: op }} />
              ))}
            </div>
            <div className={styles.mockupContent}>
              <div className={styles.mockupHeadRow}>
                <div className={styles.mockupHeadLine} />
                <div className={styles.mockupHeadBtn} />
              </div>
              <div className={styles.mockupCards}>
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className={styles.mockupCard}>
                    <div
                      className={styles.mockupCardAccent}
                      style={{ background: `var(--color-dataviz-${n}, var(--color-interactive-subtle))` }}
                    />
                    <div className={styles.mockupCardBody}>
                      <div className={styles.mockupLine} style={{ width: '50%' }} />
                      <div className={styles.mockupLine} style={{ width: '75%' }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.mockupChart}>
                {[65, 42, 78, 55, 88, 62, 72, 48, 82, 58, 92, 68].map((h, i) => (
                  <div
                    key={i}
                    className={styles.mockupBar2}
                    style={{
                      height: `${h}%`,
                      background: `var(--color-dataviz-${(i % 4) + 1}, var(--color-interactive))`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section className={styles.features}>
        <div className={styles.sectionHd}>
          <h2 className={styles.sectionTitle}>Everything your team needs</h2>
          <p className={styles.sectionSub}>From first token to production component — covered.</p>
        </div>
        <div className={styles.featureGrid}>
          {FEATURES.map(f => (
            <div key={f.title} className={styles.featureCard}>
              <div className={`${styles.featureIconWrap} ${styles[f.cls]}`}>
                <TemplateIcon slug={f.icon} size={18} />
              </div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureBody}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATE ALERTS ────────────────────────────────────── */}
      <section className={styles.alertSection}>
        <div className={styles.sectionHd}>
          <h2 className={styles.sectionTitle}>Semantic state colors</h2>
          <p className={styles.sectionSub}>Error, warning, success, and info — generated automatically from your brand hue.</p>
        </div>
        <div className={styles.alertGrid}>
          {ALERTS.map(a => (
            <div
              key={a.state}
              className={styles.alertCard}
              style={{
                background: `var(--color-${a.state}-container)`,
                borderColor: `var(--color-${a.state})`,
              }}
            >
              <div className={styles.alertIcon} style={{ color: `var(--color-${a.state})` }}>
                <TemplateIcon slug={a.icon} size={16} />
              </div>
              <div>
                <div className={styles.alertTitle} style={{ color: `var(--color-${a.state})` }}>
                  {a.title}
                </div>
                <div className={styles.alertBody}>{a.body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIAL ─────────────────────────────────────── */}
      <section className={styles.testimonial}>
        <blockquote className={styles.quote}>
          We went from zero to a production-ready design system in an afternoon.
          The color science alone saved us months of painful iteration.
        </blockquote>
        <div className={styles.quoteAuthor}>
          <div className={styles.quoteAvatar}>
            <TemplateIcon slug="user" size={15} />
          </div>
          <div>
            <div className={styles.quoteAuthorName}>Sarah Chen</div>
            <div className={styles.quoteAuthorRole}>Head of Design · Acme Corp</div>
          </div>
        </div>
      </section>

      {/* ── CTA BAND ────────────────────────────────────────── */}
      <section className={styles.ctaBand}>
        <h2 className={styles.ctaTitle}>Ready to ship your design system?</h2>
        <p className={styles.ctaSub}>Free for individuals. No credit card required.</p>
        <button className={styles.ctaBtn}>
          Get started for free
          <TemplateIcon slug="arrow-right" size={15} />
        </button>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>Spectrum</div>
            <p className={styles.footerTagline}>Design systems that scale with your team.</p>
            <div className={styles.footerSocial}>
              <button className={styles.footerIconBtn}><TemplateIcon slug="mail" size={14} /></button>
              <button className={styles.footerIconBtn}><TemplateIcon slug="heart" size={14} /></button>
              <button className={styles.footerIconBtn}><TemplateIcon slug="star" size={14} /></button>
            </div>
          </div>
          <div className={styles.footerCols}>
            {[
              { label: 'Product',   links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
              { label: 'Resources', links: ['Docs', 'Blog', 'Examples', 'Community'] },
              { label: 'Company',   links: ['About', 'Careers', 'Press', 'Contact'] },
            ].map(col => (
              <div key={col.label} className={styles.footerCol}>
                <div className={styles.footerColLabel}>{col.label}</div>
                {col.links.map(l => <a key={l} className={styles.footerLink}>{l}</a>)}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span className={styles.footerCopy}>&copy; 2026 Spectrum, Inc. All rights reserved.</span>
          <div className={styles.footerLegal}>
            <a className={styles.footerLegalLink}>Privacy</a>
            <a className={styles.footerLegalLink}>Terms</a>
            <a className={styles.footerLegalLink}>Status</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
