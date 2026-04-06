import { useAuth } from '@/auth/useAuth'
import { useColor, useTypography, useUIActions } from '@/store'
import type { ColorSlot } from '@/core/color/types'
import { POSITION_LABELS } from '@/core/color/types'
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

      {/* ── SECTION 03: LIVE PALETTE ────────────────────────── */}
      <PaletteSection />

      {/* ── SECTION 04: TYPOGRAPHY SCALE ────────────────────── */}
      <TypographySection />

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
