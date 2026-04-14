import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { useColor, useUIActions, useUI } from '@/store'
import { TemplateIcon } from '../shared/TemplateIcon'
import { HowItWorksSection } from './HowItWorksSection'
import { LiveSystemSection } from './LiveSystemSection'
import styles from './LandingTemplate.module.css'

type LegalRoute = 'privacy' | 'terms' | 'impressum'

type DsygnLandingProps = {
  onNavigate: (route: LegalRoute) => void
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

// ── Section: Pricing ─────────────────────────────────────────────────────────

const EARLY_BIRD_ACTIVE = import.meta.env.VITE_EARLY_BIRD_ACTIVE === 'true'

function PricingSection() {
  const { user } = useAuth()
  const { openSignInPrompt, openUpgradeModal, openDonateModal } = useUIActions()

  const isSignedIn = user !== null
  const isPaid = user?.plan === 'paid'

  return (
    <section className={styles.section} id="pricing">
      <div className={styles.sectionLabel}>Simple pricing</div>

      <div className={styles.pricingGrid}>

        {/* Free card */}
        <div className={styles.pricingCard}>
          <div className={styles.pricingLabel}>Free</div>
          <div className={styles.pricingPrice}>€0</div>
          <div className={styles.pricingSubtext}>forever</div>
          <ul className={styles.pricingList}>
            <li className={styles.pricingListItem}>Generator (all features)</li>
            <li className={styles.pricingListItem}>CSS export</li>
            <li className={styles.pricingListItem}>3 saved designs</li>
            <li className={styles.pricingListItem}>No account required to start</li>
          </ul>
          <button className={styles.pricingCta} onClick={() => openSignInPrompt('manual')}>
            Start free
          </button>
        </div>

        {/* Lifetime card */}
        <div className={`${styles.pricingCard} ${styles.pricingCardHighlight}`}>
          <div className={styles.pricingLabelRow}>
            <span className={styles.pricingLabel}>Lifetime</span>
            {EARLY_BIRD_ACTIVE && <span className={styles.earlyBirdBadge}>Early Bird</span>}
          </div>
          <div className={styles.pricingPrice}>€29</div>
          <div className={styles.pricingSubtext}>one-time · no subscription</div>
          <ul className={styles.pricingList}>
            <li className={styles.pricingListItem}>Everything in Free</li>
            <li className={styles.pricingListItem}>Unlimited cloud saves</li>
            <li className={styles.pricingListItem}>All export formats (ZIP, Figma, W3C, SCSS, Tailwind)</li>
            <li className={styles.pricingListItem}>Branding PDF</li>
            <li className={styles.pricingListItem}>Hosted public design system page</li>
            <li className={styles.pricingListItem}>Version history</li>
          </ul>
          {!isSignedIn && (
            <button className={styles.pricingCta} onClick={() => openSignInPrompt('manual')}>
              Get lifetime access
            </button>
          )}
          {isSignedIn && !isPaid && (
            <button className={styles.pricingCta} onClick={openUpgradeModal}>
              Upgrade — €29
            </button>
          )}
          {isSignedIn && isPaid && (
            <button className={`${styles.pricingCta} ${styles.pricingCtaDisabled}`} disabled>
              You&apos;re all set ✓
            </button>
          )}
        </div>

      </div>

      <div className={styles.coffeeRow}>
        Enjoying dsygn.<span className={styles.cloudWord}>cloud</span>? ☕{' '}
        <button className={styles.coffeeBtn} onClick={() => openDonateModal('footer')}>
          Buy me a coffee
        </button>
      </div>
    </section>
  )
}

// ── Section: Features ─────────────────────────────────────────────────────────

function FeaturesSection() {
  return (
    <section className={styles.section} id="features">
      <div className={styles.sectionLabel}>Features</div>
      <div className={styles.featuresGrid}>

        <div className={styles.featCard}>
          <div className={styles.featIcon} style={{ color: 'var(--color-accent-a-500, var(--color-accent-a, var(--color-interactive, #6366f1)))' }}>
            <TemplateIcon slug="star" size={28} />
          </div>
          <div className={styles.featTitle}>OKLCH Color Science</div>
          <div className={styles.featBody}>
            Perceptually uniform colors with no muddy mid-tones. Every shade looks intentional — semantic state colors generated automatically.
          </div>
        </div>

        <div className={styles.featCard}>
          <div className={styles.featIcon} style={{ color: 'var(--color-accent-b-500, var(--color-accent-b, var(--color-interactive, #6366f1)))' }}>
            <TemplateIcon slug="file" size={28} />
          </div>
          <div className={styles.featTitle}>Token Export</div>
          <div className={styles.featBody}>
            CSS variables, Tailwind v3/v4, SCSS, W3C Design Tokens, Figma JSON. One click. Always in sync.
          </div>
        </div>

        <div className={styles.featCard}>
          <div className={styles.featIcon} style={{ color: 'var(--color-brand-500, var(--color-interactive, #e8543a))' }}>
            <TemplateIcon slug="arrow-right" size={28} />
          </div>
          <div className={styles.featTitle}>Ship in Seconds</div>
          <div className={styles.featBody}>
            Hit ␣ space to regenerate. Lock what you love. Export and paste. No config files, no rituals.
          </div>
        </div>

        <div className={styles.featCard}>
          <div className={styles.featIcon} style={{ color: 'var(--color-accent-a-500, var(--color-accent-a, var(--color-interactive, #6366f1)))' }}>
            <TemplateIcon slug="check" size={28} />
          </div>
          <div className={styles.featTitle}>Lock & Refine</div>
          <div className={styles.featBody}>
            Love the color? Lock it. Hate the font? Regenerate just that. Build your perfect system incrementally.
          </div>
        </div>

        <div className={styles.featCard}>
          <div className={styles.featIcon} style={{ color: 'var(--color-accent-b-500, var(--color-accent-b, var(--color-interactive, #6366f1)))' }}>
            <TemplateIcon slug="image" size={28} />
          </div>
          <div className={styles.featTitle}>Dark Mode Ready</div>
          <div className={styles.featBody}>
            Every token has a light and dark value. Toggle themes instantly — the full system adapts without code changes.
          </div>
        </div>

        <div className={styles.featCard}>
          <div className={styles.featIcon} style={{ color: 'var(--color-brand-500, var(--color-interactive, #e8543a))' }}>
            <TemplateIcon slug="edit" size={28} />
          </div>
          <div className={styles.featTitle}>Typography System</div>
          <div className={styles.featBody}>
            Curated font pairings with a modular type scale. Display through caption — every step has a CSS variable.
          </div>
        </div>

      </div>
    </section>
  )
}

// ── Section: Deep Dive ────────────────────────────────────────────────────────

type SpacingStep = { key: string; varName: string }
type RadiusStep  = { key: string; varName: string }
type ShadowStep  = { key: string; varName: string }

const SPACING_STEPS: SpacingStep[] = [
  { key: 'xs',  varName: 'var(--ui-space-xs)' },
  { key: 'sm',  varName: 'var(--ui-space-sm)' },
  { key: 'md',  varName: 'var(--ui-space-md)' },
  { key: 'lg',  varName: 'var(--ui-space-lg)' },
  { key: 'xl',  varName: 'var(--ui-space-xl)' },
  { key: '2xl', varName: 'var(--ui-space-2xl)' },
  { key: '3xl', varName: 'var(--ui-space-3xl)' },
]

const RADIUS_STEPS: RadiusStep[] = [
  { key: 'none', varName: 'var(--radius-none)' },
  { key: 'sm',   varName: 'var(--radius-sm)' },
  { key: 'md',   varName: 'var(--radius-md)' },
  { key: 'lg',   varName: 'var(--radius-lg)' },
  { key: 'xl',   varName: 'var(--radius-xl)' },
  { key: 'full', varName: 'var(--radius-full)' },
]

const SHADOW_STEPS: ShadowStep[] = [
  { key: 'sm', varName: 'var(--shadow-sm)' },
  { key: 'md', varName: 'var(--shadow-md)' },
  { key: 'lg', varName: 'var(--shadow-lg)' },
  { key: 'xl', varName: 'var(--shadow-xl)' },
]

function DeepDiveSection() {
  const { dataVizN } = useColor()

  return (
    <section className={`${styles.section} ${styles.deepDive}`}>
      <div className={styles.deepDiveLabel}>Explore the full system</div>

      <div className={styles.componentGroup}>
        <div className={styles.componentGroupLabel}>Spacing scale</div>
        <div className={styles.spacingScale}>
          {SPACING_STEPS.map((step) => (
            <div key={step.key} className={styles.spacingRow}>
              <span className={styles.spacingLabel}>{step.key}</span>
              <div className={styles.spacingBar} style={{ width: step.varName }} />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.componentGroup}>
        <div className={styles.componentGroupLabel}>Border radius</div>
        <div className={styles.radiusRow}>
          {RADIUS_STEPS.map((step) => (
            <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className={styles.radiusChip} style={{ borderRadius: step.varName }} />
              <div className={styles.radiusChipLabel}>{step.key}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.componentGroup}>
        <div className={styles.componentGroupLabel}>Shadows</div>
        <div className={styles.shadowRow}>
          {SHADOW_STEPS.map((step) => (
            <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className={styles.shadowBox} style={{ boxShadow: step.varName }} />
              <div className={styles.shadowBoxLabel}>shadow-{step.key}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.componentGroup}>
        <div className={styles.componentGroupLabel}>Data visualization</div>
        <div className={styles.datavizStrip}>
          {Array.from({ length: dataVizN }, (_, i) => (
            <div
              key={i}
              className={styles.datavizSegment}
              style={{ background: `var(--color-dataviz-${i + 1})` }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function DsygnLanding({ onNavigate }: DsygnLandingProps) {
  const { user } = useAuth()
  const { openSignInPrompt, openUpgradeModal } = useUIActions()
  const { mode } = useUI()

  const isSignedIn = user !== null
  const isPaid     = user?.plan === 'paid'

  return (
    <div className={styles.page}>

      {/* ── NAV ──────────────────────────────────────────────── */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>dsygn.<span className={styles.cloudWord}>cloud</span></div>
        <ul className={styles.navLinks}>
          <li>
            <button className={styles.navLink} onClick={() => scrollToSection('how-it-works')}>
              How it works
            </button>
          </li>
          <li>
            <button className={styles.navLink} onClick={() => scrollToSection('features')}>
              Features
            </button>
          </li>
          <li>
            <button className={styles.navLink} onClick={() => scrollToSection('pricing')}>
              Pricing
            </button>
          </li>
          <li>
            <Link className={styles.navLink} to="/blog">Blog</Link>
          </li>
        </ul>
        <div className={styles.navRight}>
          {!isSignedIn && (
            <>
              <button className={styles.navCtaOutline} onClick={() => openSignInPrompt('manual')}>
                Sign in
              </button>
              <button className={styles.navCta} onClick={() => openSignInPrompt('manual')}>
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

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <h1 className={styles.heroHeadline}>
          Your design system,<br />
          <span className={styles.heroAccent}>in one keystroke.</span>
        </h1>
        <p className={styles.heroSub}>
          Generate a complete, production-ready design system — colors, typography, spacing, tokens — in seconds.
        </p>
        <div className={styles.heroActions}>
          <button className={styles.heroPrimary} onClick={() => openSignInPrompt('manual')}>
            Start building free
          </button>
          <button className={styles.heroGhost} onClick={() => scrollToSection('pricing')}>
            See pricing
          </button>
        </div>
        {mode === 'generator' && (
          <div className={styles.spacebarVisual}>
            <kbd className={styles.spaceKey}>
              <span className={styles.spaceKeyGlyph}>␣</span>
              <span>Space — regenerate</span>
            </kbd>
          </div>
        )}
        <p className={styles.socialProof}>
          Join hundreds of designers already building with dsygn.cloud
        </p>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <HowItWorksSection />

      {/* ── LIVE DESIGN SYSTEM ───────────────────────────────── */}
      <LiveSystemSection />

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <FeaturesSection />

      {/* ── PRICING ──────────────────────────────────────────── */}
      <PricingSection />

      {/* ── DEEP DIVE ────────────────────────────────────────── */}
      <DeepDiveSection />

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>dsygn.<span className={styles.cloudWord}>cloud</span></div>
          </div>
          <div className={styles.footerCols}>
            <div className={styles.footerCol}>
              <div className={styles.footerColLabel}>Product</div>
              <button className={styles.footerLink} onClick={() => scrollToSection('features')}>Features</button>
              <button className={styles.footerLink} onClick={() => scrollToSection('how-it-works')}>How it works</button>
              <button className={styles.footerLink} onClick={() => scrollToSection('pricing')}>Pricing</button>
              <Link className={styles.footerLink} to="/blog">Blog</Link>
            </div>
            <div className={styles.footerCol}>
              <div className={styles.footerColLabel}>Legal</div>
              <button className={styles.footerLink} onClick={() => onNavigate('privacy')}>Privacy</button>
              <button className={styles.footerLink} onClick={() => onNavigate('terms')}>Terms</button>
              <button className={styles.footerLink} onClick={() => onNavigate('impressum')}>Impressum</button>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span className={styles.footerCopy}>&copy; 2026 dsygn.<span className={styles.cloudWord}>cloud</span></span>
        </div>
      </footer>

    </div>
  )
}
