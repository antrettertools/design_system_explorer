import { useAuth } from '@/auth/useAuth'
import { useColor, useTypography, useUIActions, useUI } from '@/store'
import type { ColorSlot } from '@/core/color/types'
import { POSITION_LABELS } from '@/core/color/types'
import { TemplateIcon } from '../shared/TemplateIcon'
import styles from './LandingTemplate.module.css'

type PanelRoute = 'home' | 'pricing' | 'privacy' | 'terms' | 'impressum'

type DsygnLandingProps = {
  onNavigate: (route: PanelRoute) => void
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function toCssRole(role: ColorSlot['role']): string {
  // ColorRole values like 'accentA' → 'accent-a', 'brand' → 'brand'
  return role.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`)
}

// ── Section 03: Live Palette ──────────────────────────────────────────────────

function PaletteSection() {
  const color = useColor()
  const { slots, dataVizN, stateOverrides } = color

  const semanticStates: Array<{ key: string; label: string }> = [
    { key: 'success', label: 'Success' },
    { key: 'warning', label: 'Warning' },
    { key: 'error', label: 'Error' },
    { key: 'info', label: 'Info' },
  ]

  return (
    <section className={styles.section}>
      <div className={styles.sectionLabel}>Your colors</div>

      {/* Row 1 — Core palette */}
      <div className={styles.paletteRow}>
        {slots.map((slot) => {
          const cssRole = toCssRole(slot.role)
          return (
            <div key={slot.id} className={styles.swatchCard}>
              <div
                className={styles.swatch}
                style={{ background: `var(--color-${cssRole}-500)` }}
              />
              <span className={styles.swatchLabel}>
                {slot.name ?? POSITION_LABELS[slot.role]}
              </span>
              <span className={styles.swatchHex}>{slot.hex}</span>
            </div>
          )
        })}
      </div>

      {/* Row 2 — Semantic states */}
      <div className={styles.paletteRow}>
        {semanticStates.map(({ key, label }) => {
          const overrideHex = stateOverrides[key as keyof typeof stateOverrides]
          return (
            <div key={key} className={styles.swatchCard}>
              <div
                className={styles.swatch}
                style={{ background: `var(--color-${key})` }}
              />
              <span className={styles.swatchLabel}>{label}</span>
              {overrideHex !== undefined && (
                <span className={styles.swatchHex}>{overrideHex}</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Row 3 — Data viz strip */}
      <div className={styles.datavizStrip}>
        {Array.from({ length: dataVizN }, (_, i) => (
          <div
            key={i}
            className={styles.datavizSegment}
            style={{ background: `var(--color-dataviz-${i + 1})` }}
          />
        ))}
      </div>
    </section>
  )
}

// ── Section 04: Typography Scale ──────────────────────────────────────────────

type SpecimenRow = {
  label: string
  fontFamily: string
  fontSize: string
  fontWeight: string
  sample: string
}

const SPECIMEN_ROWS: SpecimenRow[] = [
  {
    label: 'Display',
    fontFamily: 'var(--font-heading)',
    fontSize: 'var(--font-size-display)',
    fontWeight: 'var(--font-weight-display)',
    sample: 'The quick brown fox',
  },
  {
    label: 'Heading',
    fontFamily: 'var(--font-heading)',
    fontSize: 'var(--font-size-h1)',
    fontWeight: 'var(--font-weight-h1)',
    sample: 'The quick brown fox',
  },
  {
    label: 'Subhead',
    fontFamily: 'var(--font-heading)',
    fontSize: 'var(--font-size-h2)',
    fontWeight: 'var(--font-weight-h2)',
    sample: 'The quick brown fox',
  },
  {
    label: 'Body',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--font-size-body)',
    fontWeight: 'var(--font-weight-body)',
    sample: 'The quick brown fox jumps over the lazy dog.',
  },
  {
    label: 'Small',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--font-size-small)',
    fontWeight: 'var(--font-weight-small)',
    sample: 'Caption · Label · Meta',
  },
]

function TypographySection() {
  const typography = useTypography()
  const { pairing } = typography

  const headingFont = pairing?.heading ?? '—'
  const bodyFont = pairing?.body ?? '—'

  return (
    <section className={styles.section}>
      <div className={styles.sectionLabel}>Your typography</div>

      <div className={styles.fontPairingBadge}>
        {headingFont} + {bodyFont}
      </div>

      <div className={styles.typeScale}>
        {SPECIMEN_ROWS.map((row) => (
          <div key={row.label} className={styles.typeRow}>
            <span className={styles.typeLabel}>{row.label}</span>
            <span
              className={styles.typeSpecimen}
              style={{
                fontFamily: row.fontFamily,
                fontSize: row.fontSize,
                fontWeight: row.fontWeight,
              }}
            >
              {row.sample}
            </span>
            <span className={styles.typeMeta}>
              {row.fontSize} / {row.fontWeight}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Section 05: Components in Action ─────────────────────────────────────────

function ComponentsSection() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionLabel}>Your components</div>

      {/* Buttons */}
      <div className={styles.componentGroup}>
        <div className={styles.componentGroupLabel}>Buttons</div>
        <div className={styles.buttonRow}>
          <button className={`${styles.demoBtn} ${styles.demoBtnPrimary}`}>Save design</button>
          <button className={`${styles.demoBtn} ${styles.demoBtnSecondary}`}>Preview</button>
          <button className={`${styles.demoBtn} ${styles.demoBtnGhost}`}>Cancel</button>
          <button className={`${styles.demoBtn} ${styles.demoBtnDestructive}`}>Delete</button>
        </div>
      </div>

      {/* Badges */}
      <div className={styles.componentGroup}>
        <div className={styles.componentGroupLabel}>Badges</div>
        <div className={styles.badgeRow}>
          <span
            className={styles.demoBadge}
            style={{ background: 'var(--color-surface-raised)', color: 'var(--color-on-surface-subtle)' }}
          >
            Default
          </span>
          <span
            className={styles.demoBadge}
            style={{ background: 'var(--color-success-container)', color: 'var(--color-success)' }}
          >
            Success
          </span>
          <span
            className={styles.demoBadge}
            style={{ background: 'var(--color-warning-container)', color: 'var(--color-warning)' }}
          >
            Warning
          </span>
          <span
            className={styles.demoBadge}
            style={{ background: 'var(--color-error-container)', color: 'var(--color-error)' }}
          >
            Error
          </span>
          <span
            className={styles.demoBadge}
            style={{ background: 'var(--color-info-container)', color: 'var(--color-info)' }}
          >
            Info
          </span>
        </div>
      </div>

      {/* Input */}
      <div className={styles.componentGroup}>
        <div className={styles.componentGroupLabel}>Input</div>
        <div className={styles.inputGroup}>
          <label className={styles.demoLabel} htmlFor="demo-email">Email</label>
          <input
            id="demo-email"
            className={styles.demoInput}
            type="email"
            placeholder="you@example.com"
          />
        </div>
      </div>

      {/* Alert cards */}
      <div className={styles.componentGroup}>
        <div className={styles.componentGroupLabel}>Alerts</div>
        <div className={styles.alertGrid}>
          <div
            className={styles.alertCard}
            style={{
              background: 'var(--color-success-container)',
              borderLeftColor: 'var(--color-success)',
            }}
          >
            <span className={styles.alertIcon}>✓</span>
            <div>
              <div className={styles.alertTitle}>Tokens compiled</div>
              <div className={styles.alertBody}>47 tokens · no contrast errors</div>
            </div>
          </div>
          <div
            className={styles.alertCard}
            style={{
              background: 'var(--color-info-container)',
              borderLeftColor: 'var(--color-info)',
            }}
          >
            <span className={styles.alertIcon}>ℹ</span>
            <div>
              <div className={styles.alertTitle}>New harmony model</div>
              <div className={styles.alertBody}>Triadic — 4 accents generated</div>
            </div>
          </div>
          <div
            className={styles.alertCard}
            style={{
              background: 'var(--color-warning-container)',
              borderLeftColor: 'var(--color-warning)',
            }}
          >
            <span className={styles.alertIcon}>⚠</span>
            <div>
              <div className={styles.alertTitle}>Breaking change</div>
              <div className={styles.alertBody}>Token names changed in v2</div>
            </div>
          </div>
          <div
            className={styles.alertCard}
            style={{
              background: 'var(--color-error-container)',
              borderLeftColor: 'var(--color-error)',
            }}
          >
            <span className={styles.alertIcon}>✕</span>
            <div>
              <div className={styles.alertTitle}>Contrast failed</div>
              <div className={styles.alertBody}>Body text below 4.5:1 on surface-raised</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Section 06: Spacing + Effects ────────────────────────────────────────────

type SpacingStep = { key: string; varName: string }
type RadiusStep = { key: string; varName: string }
type ShadowStep = { key: string; varName: string }

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

function SpacingSection() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionLabel}>Your spacing + effects</div>

      {/* Spacing scale */}
      <div className={styles.componentGroup}>
        <div className={styles.componentGroupLabel}>Spacing scale</div>
        <div className={styles.spacingScale}>
          {SPACING_STEPS.map((step) => (
            <div key={step.key} className={styles.spacingRow}>
              <span className={styles.spacingLabel}>{step.key}</span>
              <div
                className={styles.spacingBar}
                style={{ width: step.varName }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Border radius chips */}
      <div className={styles.componentGroup}>
        <div className={styles.componentGroupLabel}>Border radius</div>
        <div className={styles.radiusRow}>
          {RADIUS_STEPS.map((step) => (
            <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                className={styles.radiusChip}
                style={{ borderRadius: step.varName }}
              />
              <div className={styles.radiusChipLabel}>{step.key}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Shadow boxes */}
      <div className={styles.componentGroup}>
        <div className={styles.componentGroupLabel}>Shadows</div>
        <div className={styles.shadowRow}>
          {SHADOW_STEPS.map((step) => (
            <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                className={styles.shadowBox}
                style={{ boxShadow: step.varName }}
              />
              <div className={styles.shadowBoxLabel}>shadow-{step.key}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Section 07: Features — 3 Cards ───────────────────────────────────────────

function FeaturesSection() {
  return (
    <section className={styles.section} id="features">
      <div className={styles.sectionLabel}>How it works</div>
      <div className={styles.featuresGrid}>

        {/* Card 1 — OKLCH Color Science */}
        <div className={styles.featCard}>
          <div className={styles.featIcon} style={{ color: 'var(--color-accent-a-500, var(--color-accent-a, var(--color-interactive, #6366f1)))' }}>
            <TemplateIcon slug="star" size={28} />
          </div>
          <div className={styles.featTitle}>OKLCH Color Science</div>
          <div className={styles.featBody}>
            Perceptually uniform colors. Every shade looks intentional — no muddy mid-tones,
            no blown-out lights. Semantic state colors generated automatically.
          </div>
        </div>

        {/* Card 2 — Token Export */}
        <div className={styles.featCard}>
          <div className={styles.featIcon} style={{ color: 'var(--color-accent-b-500, var(--color-accent-b, var(--color-interactive, #6366f1)))' }}>
            <TemplateIcon slug="file" size={28} />
          </div>
          <div className={styles.featTitle}>Token Export</div>
          <div className={styles.featBody}>
            CSS variables, Tailwind v3/v4, SCSS, W3C Design Tokens, Figma JSON. One click. Always in sync.
          </div>
        </div>

        {/* Card 3 — Ship in Seconds */}
        <div className={styles.featCard}>
          <div className={styles.featIcon} style={{ color: 'var(--color-brand-500, var(--color-interactive, #e8543a))' }}>
            <TemplateIcon slug="arrow-right" size={28} />
          </div>
          <div className={styles.featTitle}>Ship in Seconds</div>
          <div className={styles.featBody}>
            Hit ␣ space to regenerate. Lock what you love. Export and paste. No config files, no rituals.
          </div>
        </div>

      </div>
    </section>
  )
}

// ── Section 08: Pricing ───────────────────────────────────────────────────────

const EARLY_BIRD_ACTIVE = import.meta.env.VITE_EARLY_BIRD_ACTIVE === 'true'

function PricingSection() {
  const { user } = useAuth()
  const { openSignInPrompt, openUpgradeModal, openDonateModal } = useUIActions()

  const isSignedIn = user !== null
  const isPaid = user?.plan === 'paid'

  return (
    <section className={styles.section}>
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
          <button
            className={styles.pricingCta}
            onClick={() => openSignInPrompt('manual')}
          >
            Start free
          </button>
        </div>

        {/* Lifetime card */}
        <div className={`${styles.pricingCard} ${styles.pricingCardHighlight}`}>
          <div className={styles.pricingLabelRow}>
            <span className={styles.pricingLabel}>Lifetime</span>
            {EARLY_BIRD_ACTIVE && (
              <span className={styles.earlyBirdBadge}>Early Bird</span>
            )}
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
            <button
              className={styles.pricingCta}
              onClick={() => openSignInPrompt('manual')}
            >
              Get lifetime access
            </button>
          )}
          {isSignedIn && !isPaid && (
            <button
              className={styles.pricingCta}
              onClick={openUpgradeModal}
            >
              Upgrade — €29
            </button>
          )}
          {isSignedIn && isPaid && (
            <button
              className={`${styles.pricingCta} ${styles.pricingCtaDisabled}`}
              disabled
            >
              You&apos;re all set ✓
            </button>
          )}
        </div>

      </div>

      <div className={styles.coffeeRow}>
        Enjoying dsygn.cloud? ☕{' '}
        <button
          className={styles.coffeeBtn}
          onClick={() => openDonateModal('footer')}
        >
          Buy me a coffee
        </button>
      </div>
    </section>
  )
}

export function DsygnLanding({ onNavigate }: DsygnLandingProps) {
  const { user } = useAuth()
  const { openSignInPrompt, openUpgradeModal } = useUIActions()
  const { mode } = useUI()

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
        {mode === 'generator' && (
          <p className={styles.spaceHint}>Hit ␣ to regenerate this page</p>
        )}
      </section>

      {/* ── SECTION 03: LIVE PALETTE ────────────────────────── */}
      <PaletteSection />

      {/* ── SECTION 04: TYPOGRAPHY SCALE ────────────────────── */}
      <TypographySection />

      {/* ── SECTION 05: COMPONENTS IN ACTION ────────────────── */}
      <ComponentsSection />

      {/* ── SECTION 06: SPACING + EFFECTS ───────────────────── */}
      <SpacingSection />

      {/* ── SECTION 07: FEATURES — 3 CARDS ─────────────────── */}
      <FeaturesSection />

      {/* ── SECTION 08: PRICING ─────────────────────────────── */}
      <PricingSection />

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
