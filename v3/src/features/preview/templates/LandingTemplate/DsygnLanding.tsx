import { useAuth } from '@/auth/useAuth'
import { useUIActions } from '@/store'
import styles from './LandingTemplate.module.css'

type PanelRoute = 'home' | 'pricing' | 'privacy' | 'terms' | 'impressum'

type DsygnLandingProps = {
  onNavigate: (route: PanelRoute) => void
}

export function DsygnLanding({ onNavigate }: DsygnLandingProps) {
  const { user } = useAuth()
  const { openSignInPrompt, openUpgradeModal } = useUIActions()

  const isSignedIn = user !== null
  const isPaid = user?.plan === 'paid'

  return (
    <div className={styles.page}>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>dsygn.cloud</div>
        <ul className={styles.navLinks}>
          <li>
            <button className={styles.navLink} onClick={() => onNavigate('pricing')}>
              Pricing
            </button>
          </li>
          <li>
            <a
              className={styles.navLink}
              href="/blog"
              target="_blank"
              rel="noopener noreferrer"
            >
              Blog
            </a>
          </li>
        </ul>
        <div className={styles.navRight}>
          {!isSignedIn && (
            <>
              <button
                className={styles.navCtaOutline}
                onClick={() => openSignInPrompt('manual')}
              >
                Sign in
              </button>
              <button
                className={styles.navCta}
                onClick={() => openSignInPrompt('manual')}
              >
                Get started
              </button>
            </>
          )}
          {isSignedIn && !isPaid && (
            <button className={styles.navCta} onClick={openUpgradeModal}>
              Upgrade — €29
            </button>
          )}
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <h1 className={styles.heroHeadline}>
          Your design system,<br />
          <span className={styles.heroAccent}>in one keystroke.</span>
        </h1>
        <p className={styles.heroSub}>
          Generate a complete, production-ready design system — colors, typography,
          spacing, tokens — in seconds. Built for vibe coders, designers, and dev teams.
        </p>
        <div className={styles.heroActions}>
          <button
            className={styles.heroPrimary}
            onClick={() => openSignInPrompt('manual')}
          >
            Start building free
          </button>
          <button
            className={styles.heroGhost}
            onClick={() => onNavigate('pricing')}
          >
            See pricing
          </button>
        </div>
        <p className={styles.spaceHint}>Hit ␣ to regenerate this page</p>
      </section>

      {/* ── PLACEHOLDER (Sections 03–09) ────────────────────── */}
      <section style={{ padding: '40px', textAlign: 'center', color: 'var(--color-on-surface-subtle)' }}>
        <p>More sections coming…</p>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>dsygn.cloud</div>
          </div>
          <div className={styles.footerCols}>
            <div className={styles.footerCol}>
              <div className={styles.footerColLabel}>Product</div>
              <a className={styles.footerLink} href="#features">Features</a>
              <button
                className={styles.footerLink}
                onClick={() => onNavigate('pricing')}
              >
                Pricing
              </button>
              <a
                className={styles.footerLink}
                href="/blog"
                target="_blank"
                rel="noopener noreferrer"
              >
                Blog
              </a>
            </div>
            <div className={styles.footerCol}>
              <div className={styles.footerColLabel}>Legal</div>
              <button
                className={styles.footerLink}
                onClick={() => onNavigate('privacy')}
              >
                Privacy
              </button>
              <button
                className={styles.footerLink}
                onClick={() => onNavigate('terms')}
              >
                Terms
              </button>
              <button
                className={styles.footerLink}
                onClick={() => onNavigate('impressum')}
              >
                Impressum
              </button>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span className={styles.footerCopy}>&copy; 2026 dsygn.cloud</span>
        </div>
      </footer>

    </div>
  )
}
