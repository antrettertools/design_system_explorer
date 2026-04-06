# Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fictional "Spectrum" `LandingTemplate` with a real dsygn.cloud homepage that demonstrates the generated design system live — every section is 100% CSS-var-driven and updates when the user hits space.

**Architecture:** The landing page lives inside `LivePreview` in generator mode. `LivePreview` gains a `panelRoute` local state that switches between `DsygnLanding` (home), `PricingView`, and `LegalView`. `DsygnLanding` is a rename + full content replacement of `LandingTemplate.tsx` — CSS class names and the module file are preserved. New sections (palette, typography scale, components, spacing/effects) are added as self-contained sub-components within `DsygnLanding.tsx`. All CTA buttons call into the existing Zustand store (`openSignInPrompt`, `openUpgradeModal`, `openDonateModal`). Auth state is read via `useAuth()`.

**Tech Stack:** React 18, CSS Modules, Zustand (`useColor`, `useTypography`, `useSpacing`, `useEffects`, `useUIActions`, `useAuth`), `TemplateIcon` (existing), `vite` dev server.

---

## File Map

```
RENAME:
  v3/src/features/preview/templates/LandingTemplate/LandingTemplate.tsx
    → v3/src/features/preview/templates/LandingTemplate/DsygnLanding.tsx

KEEP (same filename, class names preserved, new classes added):
  v3/src/features/preview/templates/LandingTemplate/LandingTemplate.module.css

MODIFY:
  v3/src/features/preview/LivePreview.tsx
    — Add panelRoute state + conditional rendering

CREATE:
  v3/src/features/preview/views/PricingView.tsx
  v3/src/features/preview/views/PricingView.module.css
  v3/src/features/preview/views/LegalView.tsx
  v3/src/features/preview/views/LegalView.module.css
```

---

## Task 1: Add `panelRoute` to LivePreview + scaffold sub-view stubs

This wires the routing skeleton before touching any content. The app must remain functional throughout.

**Files:**
- Modify: `v3/src/features/preview/LivePreview.tsx`
- Create: `v3/src/features/preview/views/PricingView.tsx`
- Create: `v3/src/features/preview/views/PricingView.module.css`
- Create: `v3/src/features/preview/views/LegalView.tsx`
- Create: `v3/src/features/preview/views/LegalView.module.css`

- [ ] **Step 1: Create `PricingView` stub**

```tsx
// v3/src/features/preview/views/PricingView.tsx
import styles from './PricingView.module.css'

interface PricingViewProps {
  onBack: () => void
}

export function PricingView({ onBack }: PricingViewProps) {
  return (
    <div className={styles.view}>
      <button className={styles.backBtn} onClick={onBack}>← Back</button>
      <h2>Pricing</h2>
    </div>
  )
}
```

- [ ] **Step 2: Create `PricingView.module.css` stub**

```css
/* v3/src/features/preview/views/PricingView.module.css */
.view {
  padding: 24px;
  font-family: var(--font-body, sans-serif);
  background: var(--color-background, #fff);
  min-height: 100%;
}

.backBtn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-on-surface-subtle, #666);
  cursor: pointer;
  padding: 0;
  margin-bottom: 24px;
  font-family: var(--font-body, sans-serif);
  position: sticky;
  top: 0;
  background: var(--color-background, #fff);
  padding: 16px 0 12px;
}
.backBtn:hover { color: var(--color-on-surface, #111); }
```

- [ ] **Step 3: Create `LegalView` stub**

```tsx
// v3/src/features/preview/views/LegalView.tsx
import styles from './LegalView.module.css'

type LegalPage = 'privacy' | 'terms' | 'impressum'

interface LegalViewProps {
  page: LegalPage
  onBack: () => void
}

const TITLES: Record<LegalPage, string> = {
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  impressum: 'Impressum',
}

export function LegalView({ page, onBack }: LegalViewProps) {
  return (
    <div className={styles.view}>
      <button className={styles.backBtn} onClick={onBack}>← Back</button>
      <h2 className={styles.title}>{TITLES[page]}</h2>
      <p>Content coming soon.</p>
    </div>
  )
}
```

- [ ] **Step 4: Create `LegalView.module.css` stub**

```css
/* v3/src/features/preview/views/LegalView.module.css */
.view {
  padding: 24px;
  font-family: var(--font-body, sans-serif);
  background: var(--color-background, #fff);
  min-height: 100%;
}

.backBtn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-on-surface-subtle, #666);
  cursor: pointer;
  padding: 0;
  margin-bottom: 24px;
  font-family: var(--font-body, sans-serif);
  position: sticky;
  top: 0;
  background: var(--color-background, #fff);
  padding: 16px 0 12px;
}
.backBtn:hover { color: var(--color-on-surface, #111); }

.title {
  font-family: var(--font-heading, sans-serif);
  font-size: var(--font-size-h1, 32px);
  font-weight: 800;
  letter-spacing: -0.025em;
  color: var(--color-on-surface, #111);
  margin-bottom: 24px;
}
```

- [ ] **Step 5: Update `LivePreview.tsx` to add panelRoute state and routing**

```tsx
// v3/src/features/preview/LivePreview.tsx
import { useState, useEffect, useRef } from 'react'
import { useUI, useUIActions, useColor } from '@/store'
import styles from './LivePreview.module.css'
import { LandingTemplate } from './templates/LandingTemplate/LandingTemplate'
import { SystemTemplate } from './templates/SystemTemplate/SystemTemplate'
import { DashboardTemplate } from './templates/DashboardTemplate/DashboardTemplate'
import { BlogTemplate } from './templates/BlogTemplate/BlogTemplate'
import { PricingView } from './views/PricingView'
import { LegalView } from './views/LegalView'

type PanelRoute = 'home' | 'pricing' | 'privacy' | 'terms' | 'impressum'

export function LivePreview() {
  const { showcaseTemplate, mode } = useUI()
  const { hideMobilePreview } = useUIActions()
  const { lastBaseHue } = useColor()
  const [panelRoute, setPanelRoute] = useState<PanelRoute>('home')
  const panelRef = useRef<HTMLDivElement>(null)

  // Reset to home on regenerate (lastBaseHue changes on every generate())
  useEffect(() => {
    setPanelRoute('home')
  }, [lastBaseHue])

  // Scroll to top when navigating between views
  useEffect(() => {
    if (panelRef.current) panelRef.current.scrollTop = 0
  }, [panelRoute])

  // In generator mode, always show landing (single fixed template per spec)
  const template = mode === 'detail' ? showcaseTemplate : 'landing'

  const renderTemplate = () => {
    switch (template) {
      case 'system': return <SystemTemplate />
      case 'dashboard': return <DashboardTemplate />
      case 'blog': return <BlogTemplate />
      default: return <LandingTemplate />
    }
  }

  const renderGeneratorView = () => {
    switch (panelRoute) {
      case 'pricing':
        return <PricingView onBack={() => setPanelRoute('home')} />
      case 'privacy':
      case 'terms':
      case 'impressum':
        return <LegalView page={panelRoute} onBack={() => setPanelRoute('home')} />
      default:
        return <LandingTemplate />
    }
  }

  return (
    <div className={styles.panel} ref={panelRef}>
      <button className={styles.backBtn} onClick={hideMobilePreview} aria-label="Back to generator">
        &larr; Back to generator
      </button>
      {mode === 'generator' ? renderGeneratorView() : renderTemplate()}
    </div>
  )
}
```

- [ ] **Step 6: Start the dev server and verify routing works**

```bash
cd v3 && npm run dev
```

- Open http://localhost:5173
- Generator mode right panel shows LandingTemplate (unchanged "Spectrum" content)
- TypeScript should compile cleanly: `npx tsc --noEmit`

- [ ] **Step 7: Commit**

```bash
git add v3/src/features/preview/LivePreview.tsx \
        v3/src/features/preview/views/PricingView.tsx \
        v3/src/features/preview/views/PricingView.module.css \
        v3/src/features/preview/views/LegalView.tsx \
        v3/src/features/preview/views/LegalView.module.css
git commit -m "feat(landing): add panelRoute state to LivePreview + scaffold PricingView/LegalView stubs"
```

---

## Task 2: Rename LandingTemplate → DsygnLanding, update nav

**Files:**
- Rename+Modify: `v3/src/features/preview/templates/LandingTemplate/LandingTemplate.tsx` → `DsygnLanding.tsx`
- Modify: `v3/src/features/preview/LivePreview.tsx` (update import)

- [ ] **Step 1: Create `DsygnLanding.tsx` with updated nav (keep rest of Spectrum content for now)**

Copy `LandingTemplate.tsx` to `DsygnLanding.tsx` in the same folder, then replace the file contents:

```tsx
// v3/src/features/preview/templates/LandingTemplate/DsygnLanding.tsx
import { useAuth } from '@/auth/useAuth'
import { useUIActions } from '@/store'
import { TemplateIcon } from '../shared/TemplateIcon'
import styles from './LandingTemplate.module.css'

// Remaining section sub-components will be added in Tasks 3–10.
// Temporarily keep the old section implementations inline until replaced.

type PanelRoute = 'home' | 'pricing' | 'privacy' | 'terms' | 'impressum'

interface DsygnLandingProps {
  onNavigate: (route: PanelRoute) => void
}

export function DsygnLanding({ onNavigate }: DsygnLandingProps) {
  const { user } = useAuth()
  const { openSignInPrompt, openUpgradeModal } = useUIActions()

  const isPaid = user?.plan === 'paid'
  const isFree = !!user && !isPaid

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
          <div className={styles.navDivider} />
          {!isPaid && (
            <button
              className={styles.navCtaOutline}
              onClick={() => openSignInPrompt('manual')}
            >
              Sign in
            </button>
          )}
          {isFree && (
            <button className={styles.navCta} onClick={openUpgradeModal}>
              Upgrade — €29
            </button>
          )}
          {!user && (
            <button
              className={styles.navCta}
              onClick={() => openSignInPrompt('manual')}
            >
              Get started
            </button>
          )}
        </div>
      </nav>

      {/* ── PLACEHOLDER for remaining sections (replaced in Tasks 3–10) ── */}
      <section style={{ padding: '80px 40px', textAlign: 'center', color: 'var(--color-on-surface-subtle)' }}>
        <p>Sections being rebuilt…</p>
      </section>

    </div>
  )
}
```

- [ ] **Step 2: Update `LivePreview.tsx` to import `DsygnLanding` instead of `LandingTemplate`**

Replace the import and all references:

```tsx
// In v3/src/features/preview/LivePreview.tsx
// Remove:
// import { LandingTemplate } from './templates/LandingTemplate/LandingTemplate'
// Add:
import { DsygnLanding } from './templates/LandingTemplate/DsygnLanding'
```

And update `renderGeneratorView()`:
```tsx
const renderGeneratorView = () => {
  switch (panelRoute) {
    case 'pricing':
      return <PricingView onBack={() => setPanelRoute('home')} />
    case 'privacy':
    case 'terms':
    case 'impressum':
      return <LegalView page={panelRoute} onBack={() => setPanelRoute('home')} />
    default:
      return <DsygnLanding onNavigate={setPanelRoute} />
  }
}
```

Note: `LandingTemplate` import is still needed for detail mode's `renderTemplate()`. Keep it.

- [ ] **Step 3: Run TypeScript check**

```bash
cd v3 && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 4: Verify in browser**

- Generator mode: nav shows "dsygn.cloud", "Pricing" (clicking navigates to PricingView stub), "Blog", auth-conditional buttons
- Pressing "← Back" in PricingView returns to DsygnLanding
- Detail mode: still shows original LandingTemplate with template switcher — unaffected

- [ ] **Step 5: Commit**

```bash
git add v3/src/features/preview/templates/LandingTemplate/DsygnLanding.tsx \
        v3/src/features/preview/LivePreview.tsx
git commit -m "feat(landing): rename LandingTemplate → DsygnLanding, wire nav with real links and auth-conditional CTAs"
```

---

## Task 3: Hero section — real copy, space hint, wired CTAs

**Files:**
- Modify: `v3/src/features/preview/templates/LandingTemplate/DsygnLanding.tsx`

Replace the `{/* ── PLACEHOLDER … */}` section with the real hero. Add it inside the JSX after the `</nav>` tag:

- [ ] **Step 1: Replace placeholder with real hero in `DsygnLanding.tsx`**

```tsx
{/* ── HERO ────────────────────────────────────────────── */}
<section className={styles.hero}>
  <div className={styles.heroBadge}>
    <TemplateIcon slug="star" size={11} />
    <span>Design system generator · Free to use</span>
  </div>
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
      <TemplateIcon slug="arrow-right" size={15} />
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
```

- [ ] **Step 2: Add `.spaceHint` CSS class to `LandingTemplate.module.css`**

```css
/* append to LandingTemplate.module.css */
.spaceHint {
  font-size: 11px;
  font-style: italic;
  color: var(--color-on-surface-subtle, #aaa);
  letter-spacing: 0.02em;
  margin-top: 0;
}
```

- [ ] **Step 3: Verify hero renders correctly in browser**

- Headline: "Your design system, in one keystroke." with accent color on second line
- Badge: star icon + text
- Two CTA buttons — primary fires sign-in prompt, ghost navigates to pricing panel
- Space hint italic text below CTAs
- Hit space — all token colors/fonts on the hero update

- [ ] **Step 4: Commit**

```bash
git add v3/src/features/preview/templates/LandingTemplate/DsygnLanding.tsx \
        v3/src/features/preview/templates/LandingTemplate/LandingTemplate.module.css
git commit -m "feat(landing): add real hero section with space hint and wired CTAs"
```

---

## Task 4: Live palette section — all color slots + state colors + dataviz

**Files:**
- Modify: `v3/src/features/preview/templates/LandingTemplate/DsygnLanding.tsx`
- Modify: `v3/src/features/preview/templates/LandingTemplate/LandingTemplate.module.css`

- [ ] **Step 1: Add `useColor` import and palette section to `DsygnLanding.tsx`**

Add to imports at top:
```tsx
import { useUIActions, useColor } from '@/store'
```

Add after the hero section:

```tsx
{/* ── LIVE PALETTE ─────────────────────────────────── */}
<PaletteSection slots={slots} dataVizN={dataVizN} />
```

Add `slots` and `dataVizN` from the hook at the top of the component function:
```tsx
const { slots, dataVizN } = useColor()
```

- [ ] **Step 2: Add `PaletteSection` as a local sub-component above `DsygnLanding`**

```tsx
// Add above the DsygnLanding function, in the same file:
import type { ColorSlot } from '@/core/color/types'

interface PaletteSectionProps {
  slots: ColorSlot[]
  dataVizN: number
}

const STATE_COLORS = [
  { label: 'Success', token: 'success' },
  { label: 'Warning', token: 'warning' },
  { label: 'Error',   token: 'error' },
  { label: 'Info',    token: 'info' },
] as const

function PaletteSection({ slots, dataVizN }: PaletteSectionProps) {
  return (
    <section className={styles.paletteSection}>
      <div className={styles.sectionHd}>
        <h2 className={styles.sectionTitle}>Your colors</h2>
        <p className={styles.sectionSub}>Every swatch updates when you hit space.</p>
      </div>

      {/* Core palette slots */}
      <div className={styles.paletteRow}>
        {slots.map((slot) => (
          <div key={slot.id} className={styles.paletteItem}>
            <div
              className={styles.paletteSwatch}
              style={{ background: `var(--color-${slot.role}-500, ${slot.hex})` }}
            />
            <span className={styles.paletteLabel}>{slot.name ?? slot.role}</span>
            <span className={styles.paletteHex}>{slot.hex}</span>
          </div>
        ))}
      </div>

      {/* Semantic state colors */}
      <div className={styles.paletteSubLabel}>Semantic states</div>
      <div className={styles.paletteRow}>
        {STATE_COLORS.map(({ label, token }) => (
          <div key={token} className={styles.paletteItem}>
            <div
              className={styles.paletteSwatch}
              style={{ background: `var(--color-${token})` }}
            />
            <span className={styles.paletteLabel}>{label}</span>
          </div>
        ))}
      </div>

      {/* Data viz strip */}
      <div className={styles.paletteSubLabel}>Data visualization</div>
      <div className={styles.dataVizRow}>
        {Array.from({ length: dataVizN }, (_, i) => (
          <div
            key={i}
            className={styles.dataVizCell}
            style={{ background: `var(--color-dataviz-${i + 1})` }}
            title={`Dataviz ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Add palette CSS to `LandingTemplate.module.css`**

```css
/* ── PALETTE SECTION ─────────────────────────────────────── */

.paletteSection {
  padding: var(--spacing-3xl, 80px) var(--spacing-xl, 40px);
  background: var(--color-background, #fafafa);
  border-top: 1px solid var(--color-border, #e5e5e5);
}

.paletteRow {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm, 10px);
  max-width: 960px;
  margin: 0 auto var(--spacing-lg, 24px);
}

.paletteItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  min-width: 64px;
}

.paletteSwatch {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md, 8px);
  border: 1px solid rgba(0,0,0,0.06);
  flex-shrink: 0;
}

.paletteLabel {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-on-surface, #111);
  text-align: center;
  text-transform: capitalize;
}

.paletteHex {
  font-size: 10px;
  color: var(--color-on-surface-subtle, #999);
  font-family: monospace;
}

.paletteSubLabel {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-on-surface-subtle, #aaa);
  max-width: 960px;
  margin: 0 auto var(--spacing-sm, 10px);
}

.dataVizRow {
  display: flex;
  gap: 4px;
  max-width: 960px;
  margin: 0 auto;
}

.dataVizCell {
  flex: 1;
  height: 40px;
  border-radius: var(--radius-sm, 6px);
  min-width: 24px;
}
```

- [ ] **Step 4: Verify in browser**

- Hit space — all swatches update with new palette
- State colors (success/warning/error/info) show themed colors
- Data viz strip shows N colored bars
- All colors via CSS vars, no hardcoded hex in the swatch backgrounds

- [ ] **Step 5: Commit**

```bash
git add v3/src/features/preview/templates/LandingTemplate/DsygnLanding.tsx \
        v3/src/features/preview/templates/LandingTemplate/LandingTemplate.module.css
git commit -m "feat(landing): add live palette section — all slots, state colors, dataviz strip"
```

---

## Task 5: Typography scale section

**Files:**
- Modify: `v3/src/features/preview/templates/LandingTemplate/DsygnLanding.tsx`
- Modify: `v3/src/features/preview/templates/LandingTemplate/LandingTemplate.module.css`

- [ ] **Step 1: Add `useTypography` import**

```tsx
import { useUIActions, useColor, useTypography } from '@/store'
```

Add to the component body:
```tsx
const { pairing } = useTypography()
```

- [ ] **Step 2: Add `TypographySection` sub-component**

```tsx
// Add above DsygnLanding function, in the same file:

interface TypographySectionProps {
  headingFont: string
  bodyFont: string
}

const TYPE_ROWS = [
  { label: 'Display', sizeVar: '--font-size-display', weightVar: '--font-display-weight', family: 'heading', sample: 'The quick brown fox' },
  { label: 'Heading', sizeVar: '--font-size-h1',      weightVar: '--font-h1-weight',      family: 'heading', sample: 'The quick brown fox' },
  { label: 'Subhead', sizeVar: '--font-size-h2',      weightVar: '--font-h2-weight',      family: 'heading', sample: 'The quick brown fox' },
  { label: 'Body',    sizeVar: '--font-size-body',    weightVar: '--font-body-weight',    family: 'body',    sample: 'The quick brown fox jumps over the lazy dog.' },
  { label: 'Small',   sizeVar: '--font-size-small',   weightVar: '--font-small-weight',   family: 'body',    sample: 'Caption · Label · Meta' },
] as const

function TypographySection({ headingFont, bodyFont }: TypographySectionProps) {
  return (
    <section className={styles.typeSection}>
      <div className={styles.sectionHd}>
        <h2 className={styles.sectionTitle}>Your typography</h2>
        <p className={styles.sectionSub}>
          <span className={styles.typePairingBadge}>{headingFont} + {bodyFont}</span>
          &nbsp;· updates on regenerate
        </p>
      </div>
      <div className={styles.typeScaleList}>
        {TYPE_ROWS.map(({ label, sizeVar, weightVar, family, sample }) => (
          <div key={label} className={styles.typeScaleRow}>
            <span className={styles.typeScaleLabel}>{label}</span>
            <span
              className={styles.typeScaleSample}
              style={{
                fontFamily: `var(--font-${family}, sans-serif)`,
                fontSize: `var(${sizeVar})`,
                fontWeight: `var(${weightVar})`,
              }}
            >
              {sample}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Add `TypographySection` to `DsygnLanding` JSX after the palette section**

```tsx
{pairing && (
  <TypographySection
    headingFont={pairing.heading}
    bodyFont={pairing.body}
  />
)}
```

- [ ] **Step 4: Add typography CSS to `LandingTemplate.module.css`**

```css
/* ── TYPOGRAPHY SECTION ──────────────────────────────────── */

.typeSection {
  padding: var(--spacing-3xl, 80px) var(--spacing-xl, 40px);
  background: var(--color-surface, #fff);
  border-top: 1px solid var(--color-border, #e5e5e5);
}

.typePairingBadge {
  display: inline-block;
  padding: 2px 10px;
  background: var(--color-interactive-subtle, #fde8e3);
  color: var(--color-interactive, #e8543a);
  border-radius: var(--radius-full, 9999px);
  font-size: 12px;
  font-weight: 600;
}

.typeScaleList {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--color-border, #e5e5e5);
  border-radius: var(--radius-lg, 12px);
  overflow: hidden;
}

.typeScaleRow {
  display: grid;
  grid-template-columns: 72px 1fr;
  align-items: baseline;
  gap: var(--spacing-md, 16px);
  padding: var(--spacing-md, 16px) var(--spacing-lg, 24px);
  border-bottom: 1px solid var(--color-border, #e5e5e5);
  background: var(--color-surface, #fff);
}
.typeScaleRow:last-child { border-bottom: none; }

.typeScaleLabel {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-on-surface-subtle, #aaa);
  flex-shrink: 0;
}

.typeScaleSample {
  color: var(--color-on-surface, #111);
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

- [ ] **Step 5: Verify in browser**

- 5 rows render with correct sizes from Display (large) down to Small (small)
- Font family changes visibly when you hit space — heading rows use heading font, body rows use body font
- Pairing badge shows "{HeadingFont} + {BodyFont}" and updates on regenerate

- [ ] **Step 6: Commit**

```bash
git add v3/src/features/preview/templates/LandingTemplate/DsygnLanding.tsx \
        v3/src/features/preview/templates/LandingTemplate/LandingTemplate.module.css
git commit -m "feat(landing): add live typography scale section with font pairing badge"
```

---

## Task 6: Components section — buttons, badges, input, alerts

**Files:**
- Modify: `v3/src/features/preview/templates/LandingTemplate/DsygnLanding.tsx`
- Modify: `v3/src/features/preview/templates/LandingTemplate/LandingTemplate.module.css`

- [ ] **Step 1: Add `ComponentsSection` sub-component to `DsygnLanding.tsx`**

```tsx
// Add above DsygnLanding function, in the same file:

const ALERT_ITEMS = [
  { state: 'success', icon: 'check'    as const, title: 'Tokens compiled',    body: '47 tokens · no contrast errors' },
  { state: 'info',    icon: 'bell'     as const, title: 'New harmony model',   body: 'Triadic — 4 accents generated' },
  { state: 'warning', icon: 'calendar' as const, title: 'Breaking change',     body: 'Token names changed in v2' },
  { state: 'error',   icon: 'x'        as const, title: 'Contrast failed',     body: 'Body text below 4.5:1 on surface-raised' },
]

const BADGE_ITEMS = [
  { label: 'Default', bg: 'var(--color-surface-raised, #f4f4f4)', color: 'var(--color-on-surface, #111)' },
  { label: 'Success', bg: 'var(--color-success-container, #dcfce7)', color: 'var(--color-success, #16a34a)' },
  { label: 'Warning', bg: 'var(--color-warning-container, #fef9c3)', color: 'var(--color-warning, #ca8a04)' },
  { label: 'Error',   bg: 'var(--color-error-container, #fee2e2)',   color: 'var(--color-error, #dc2626)' },
  { label: 'Info',    bg: 'var(--color-info-container, #dbeafe)',    color: 'var(--color-info, #2563eb)' },
]

function ComponentsSection() {
  return (
    <section className={styles.componentsSection}>
      <div className={styles.sectionHd}>
        <h2 className={styles.sectionTitle}>Your components</h2>
        <p className={styles.sectionSub}>100% CSS custom properties — zero hardcoded values.</p>
      </div>

      <div className={styles.componentsGrid}>
        {/* Buttons */}
        <div className={styles.componentBlock}>
          <div className={styles.componentBlockLabel}>Buttons</div>
          <div className={styles.buttonRow}>
            <button className={styles.compBtnPrimary}>Primary</button>
            <button className={styles.compBtnSecondary}>Secondary</button>
            <button className={styles.compBtnGhost}>Ghost</button>
            <button className={styles.compBtnDestructive}>Destructive</button>
          </div>
        </div>

        {/* Badges */}
        <div className={styles.componentBlock}>
          <div className={styles.componentBlockLabel}>Badges</div>
          <div className={styles.badgeRow}>
            {BADGE_ITEMS.map(({ label, bg, color }) => (
              <span
                key={label}
                className={styles.compBadge}
                style={{ background: bg, color }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className={styles.componentBlock}>
          <div className={styles.componentBlockLabel}>Input</div>
          <div className={styles.inputWrap}>
            <label className={styles.compInputLabel}>Email</label>
            <input
              className={styles.compInput}
              type="email"
              placeholder="you@example.com"
              readOnly
            />
          </div>
        </div>

        {/* Alerts */}
        <div className={styles.componentBlock}>
          <div className={styles.componentBlockLabel}>Alerts</div>
          <div className={styles.alertGrid}>
            {ALERT_ITEMS.map(a => (
              <div
                key={a.state}
                className={styles.alertCard}
                style={{
                  background: `var(--color-${a.state}-container)`,
                  borderColor: `var(--color-${a.state})`,
                }}
              >
                <div className={styles.alertIcon} style={{ color: `var(--color-${a.state})` }}>
                  <TemplateIcon slug={a.icon} size={14} />
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
        </div>
      </div>
    </section>
  )
}
```

Add `<ComponentsSection />` to the JSX after the typography section.

- [ ] **Step 2: Add components CSS to `LandingTemplate.module.css`**

```css
/* ── COMPONENTS SECTION ──────────────────────────────────── */

.componentsSection {
  padding: var(--spacing-3xl, 80px) var(--spacing-xl, 40px);
  background: var(--color-background, #fafafa);
  border-top: 1px solid var(--color-border, #e5e5e5);
}

.componentsGrid {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl, 32px);
}

.componentBlock {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 10px);
}

.componentBlockLabel {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-on-surface-subtle, #aaa);
}

/* Buttons */
.buttonRow {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm, 10px);
  align-items: center;
}

.compBtnPrimary {
  height: 36px;
  padding: 0 16px;
  background: var(--color-interactive, #e8543a);
  color: var(--color-on-interactive, #fff);
  border: none;
  border-radius: var(--radius-md, 8px);
  font-size: 13px;
  font-weight: 600;
  cursor: default;
  font-family: var(--font-body, sans-serif);
}

.compBtnSecondary {
  height: 36px;
  padding: 0 16px;
  background: var(--color-surface-raised, #f4f4f4);
  color: var(--color-on-surface, #111);
  border: 1px solid var(--color-border, #e5e5e5);
  border-radius: var(--radius-md, 8px);
  font-size: 13px;
  font-weight: 500;
  cursor: default;
  font-family: var(--font-body, sans-serif);
}

.compBtnGhost {
  height: 36px;
  padding: 0 16px;
  background: transparent;
  color: var(--color-on-surface, #111);
  border: 1.5px solid var(--color-border-strong, #ccc);
  border-radius: var(--radius-md, 8px);
  font-size: 13px;
  cursor: default;
  font-family: var(--font-body, sans-serif);
}

.compBtnDestructive {
  height: 36px;
  padding: 0 16px;
  background: var(--color-error, #dc2626);
  color: #fff;
  border: none;
  border-radius: var(--radius-md, 8px);
  font-size: 13px;
  font-weight: 600;
  cursor: default;
  font-family: var(--font-body, sans-serif);
}

/* Badges */
.badgeRow {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs, 6px);
}

.compBadge {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  border-radius: var(--radius-full, 9999px);
  font-size: 11px;
  font-weight: 600;
}

/* Input */
.inputWrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 320px;
}

.compInputLabel {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-on-surface, #111);
}

.compInput {
  height: 36px;
  padding: 0 12px;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e5e5e5);
  border-radius: var(--radius-md, 8px);
  font-size: 13px;
  color: var(--color-on-surface-subtle, #666);
  font-family: var(--font-body, sans-serif);
  outline: none;
  width: 100%;
}
```

- [ ] **Step 3: Verify in browser**

- 4 button variants render with correct token colors
- Badges row shows 5 badges with state-color backgrounds
- Input renders with label, placeholder text
- Alert grid (2×2): success/info/warning/error, each with themed icon + colors
- Hit space — button/badge/alert colors update with new palette

- [ ] **Step 4: Commit**

```bash
git add v3/src/features/preview/templates/LandingTemplate/DsygnLanding.tsx \
        v3/src/features/preview/templates/LandingTemplate/LandingTemplate.module.css
git commit -m "feat(landing): add components section — buttons, badges, input, state alerts"
```

---

## Task 7: Spacing + effects section

**Files:**
- Modify: `v3/src/features/preview/templates/LandingTemplate/DsygnLanding.tsx`
- Modify: `v3/src/features/preview/templates/LandingTemplate/LandingTemplate.module.css`

- [ ] **Step 1: Add `useSpacing` and `useEffects` imports**

```tsx
import { useUIActions, useColor, useTypography, useSpacing, useEffects } from '@/store'
```

Add in component body:
```tsx
const { config: spacingConfig, overrides: spacingOverrides, radiusOverrides } = useSpacing()
const { config: effectsConfig, shadowMode, shadowOverrides } = useEffects()
```

- [ ] **Step 2: Add `SpacingEffectsSection` sub-component**

```tsx
// Add above DsygnLanding function, in the same file:
import type { SpacingConfig, SpacingScale, RadiusScale } from '@/core/spacing/types'
import type { EffectsConfig, ShadowPresets } from '@/core/effects/types'

const SPACING_STEPS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const
const RADIUS_STEPS = ['none', 'sm', 'md', 'lg', 'xl', 'full'] as const
const SHADOW_STEPS = ['sm', 'md', 'lg', 'xl'] as const

interface SpacingEffectsSectionProps {
  spacingConfig: SpacingConfig
  spacingOverrides: Partial<SpacingScale>
  radiusOverrides: Partial<RadiusScale>
  effectsConfig: EffectsConfig
  shadowMode: 'colored' | 'neutral'
  shadowOverrides: Partial<ShadowPresets>
}

function SpacingEffectsSection({
  spacingConfig, spacingOverrides, radiusOverrides,
  effectsConfig, shadowMode, shadowOverrides,
}: SpacingEffectsSectionProps) {
  const effectiveSpacing = { ...spacingConfig.scale, ...spacingOverrides }
  const effectiveRadius = { ...spacingConfig.radius, ...radiusOverrides }
  const baseShadows = shadowMode === 'colored' ? effectsConfig.shadows : effectsConfig.shadowsNeutral
  const effectiveShadows = { ...baseShadows, ...shadowOverrides }

  const maxSpacing = Math.max(...SPACING_STEPS.map(s => effectiveSpacing[s] ?? 0))

  return (
    <section className={styles.spacingSection}>
      <div className={styles.sectionHd}>
        <h2 className={styles.sectionTitle}>Your spacing + effects</h2>
        <p className={styles.sectionSub}>Spacing scale, radius, and shadow tokens.</p>
      </div>

      <div className={styles.spacingEffectsGrid}>

        {/* Spacing scale */}
        <div className={styles.spacingBlock}>
          <div className={styles.componentBlockLabel}>Spacing scale</div>
          <div className={styles.spacingList}>
            {SPACING_STEPS.map(step => {
              const value = effectiveSpacing[step] ?? 0
              const pct = maxSpacing > 0 ? (value / maxSpacing) * 100 : 0
              return (
                <div key={step} className={styles.spacingRow}>
                  <span className={styles.spacingStepLabel}>{step}</span>
                  <div className={styles.spacingTrack}>
                    <div
                      className={styles.spacingFill}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className={styles.spacingValue}>{value}px</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Border radius */}
        <div className={styles.spacingBlock}>
          <div className={styles.componentBlockLabel}>Border radius</div>
          <div className={styles.radiusStrip}>
            {RADIUS_STEPS.map(step => {
              const value = effectiveRadius[step as keyof typeof effectiveRadius] ?? 0
              const cssRadius = step === 'full' ? '9999px' : `${value}px`
              return (
                <div key={step} className={styles.radiusItem}>
                  <div
                    className={styles.radiusBox}
                    style={{ borderRadius: cssRadius }}
                  />
                  <span className={styles.radiusLabel}>{step}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Shadows */}
        <div className={styles.spacingBlock}>
          <div className={styles.componentBlockLabel}>Shadows</div>
          <div className={styles.shadowStrip}>
            {SHADOW_STEPS.map(step => (
              <div
                key={step}
                className={styles.shadowBox}
                style={{ boxShadow: effectiveShadows[step as keyof typeof effectiveShadows] ?? 'none' }}
              >
                <span className={styles.shadowLabel}>{step}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
```

Add to `DsygnLanding` JSX after the components section:
```tsx
<SpacingEffectsSection
  spacingConfig={spacingConfig}
  spacingOverrides={spacingOverrides}
  radiusOverrides={radiusOverrides}
  effectsConfig={effectsConfig}
  shadowMode={shadowMode}
  shadowOverrides={shadowOverrides}
/>
```

- [ ] **Step 3: Add spacing + effects CSS to `LandingTemplate.module.css`**

```css
/* ── SPACING + EFFECTS SECTION ───────────────────────────── */

.spacingSection {
  padding: var(--spacing-3xl, 80px) var(--spacing-xl, 40px);
  background: var(--color-surface, #fff);
  border-top: 1px solid var(--color-border, #e5e5e5);
}

.spacingEffectsGrid {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl, 32px);
}

.spacingBlock {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 10px);
}

.spacingList {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.spacingRow {
  display: grid;
  grid-template-columns: 36px 1fr 48px;
  align-items: center;
  gap: var(--spacing-sm, 10px);
}

.spacingStepLabel {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-on-surface-subtle, #aaa);
  text-align: right;
}

.spacingTrack {
  height: 8px;
  background: var(--color-border, #e5e5e5);
  border-radius: var(--radius-full, 9999px);
  overflow: hidden;
}

.spacingFill {
  height: 100%;
  background: var(--color-interactive, #e8543a);
  border-radius: var(--radius-full, 9999px);
  min-width: 4px;
}

.spacingValue {
  font-size: 11px;
  color: var(--color-on-surface-subtle, #aaa);
  font-family: monospace;
  text-align: right;
}

.radiusStrip {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md, 16px);
}

.radiusItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.radiusBox {
  width: 40px;
  height: 40px;
  border: 2px solid var(--color-interactive, #e8543a);
  background: var(--color-interactive-subtle, #fde8e3);
}

.radiusLabel {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-on-surface-subtle, #999);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.shadowStrip {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg, 24px);
}

.shadowBox {
  width: 80px;
  height: 56px;
  background: var(--color-surface, #fff);
  border-radius: var(--radius-md, 8px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 6px;
}

.shadowLabel {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-on-surface-subtle, #aaa);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
```

- [ ] **Step 4: Verify in browser**

- Spacing bars grow proportionally from xs → 3xl
- 6 radius boxes show clearly different corner rounding (none is square, full is circle)
- 4 shadow boxes show increasing depth
- Colors (spacing fill, radius border) update on regenerate

- [ ] **Step 5: Commit**

```bash
git add v3/src/features/preview/templates/LandingTemplate/DsygnLanding.tsx \
        v3/src/features/preview/templates/LandingTemplate/LandingTemplate.module.css
git commit -m "feat(landing): add spacing + effects section — spacing scale, radius chips, shadow boxes"
```

---

## Task 8: Features section — 3 real cards

Replace the old 6-card Spectrum features grid with 3 real dsygn.cloud feature cards.

**Files:**
- Modify: `v3/src/features/preview/templates/LandingTemplate/DsygnLanding.tsx`

- [ ] **Step 1: Replace features array and add features section to JSX**

The existing `.features`, `.featureGrid`, `.featureCard`, `.featureIconWrap`, `.featureTitle`, `.featureBody`, `.sectionHd`, `.sectionTitle`, `.sectionSub` CSS classes are reused — no new CSS needed.

Add `FeaturesSection` sub-component:
```tsx
const FEATURES_REAL = [
  {
    icon: 'star'     as const,
    cls:  'iconBrand',
    title: 'OKLCH Color Science',
    body:  'Perceptually uniform colors. Every shade looks intentional — no muddy mid-tones, no blown-out lights. Semantic states generated automatically from your brand hue.',
  },
  {
    icon: 'file'     as const,
    cls:  'iconAccentA',
    title: 'Token Export',
    body:  'CSS variables, Tailwind v3/v4, SCSS, W3C Design Tokens, Figma JSON. One click. Always in sync.',
  },
  {
    icon: 'check'    as const,
    cls:  'iconAccentB',
    title: 'Ship in Seconds',
    body:  'Hit ␣ space to regenerate. Lock what you love. Export and paste. No config files, no rituals.',
  },
] as const

function FeaturesSection() {
  return (
    <section className={styles.features}>
      <div className={styles.sectionHd}>
        <h2 className={styles.sectionTitle}>How it works</h2>
        <p className={styles.sectionSub}>Simple. Fast. Yours.</p>
      </div>
      <div className={styles.featureGrid}>
        {FEATURES_REAL.map(f => (
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
  )
}
```

Add `<FeaturesSection />` to JSX after the spacing+effects section.

- [ ] **Step 2: Verify in browser**

- 3 cards render (not 6)
- Icon colors use accent tokens and update on regenerate
- No mention of "Spectrum" anywhere

- [ ] **Step 3: Commit**

```bash
git add v3/src/features/preview/templates/LandingTemplate/DsygnLanding.tsx
git commit -m "feat(landing): replace 6-card Spectrum features with 3-card real dsygn.cloud feature section"
```

---

## Task 9: Pricing section — free + lifetime cards + donate link

**Files:**
- Modify: `v3/src/features/preview/templates/LandingTemplate/DsygnLanding.tsx`
- Modify: `v3/src/features/preview/templates/LandingTemplate/LandingTemplate.module.css`

- [ ] **Step 1: Add `PricingSection` sub-component**

```tsx
// Add above DsygnLanding function, in the same file:

interface PricingSectionProps {
  user: import('@/auth/types').AuthUser | null
  onNavigatePricing: () => void
  onSignIn: () => void
  onUpgrade: () => void
  onDonate: () => void
  earlyBirdActive: boolean
}

const FREE_FEATURES = [
  'Full design system generator',
  'CSS variables export',
  '3 saved designs',
  'No account needed to explore',
]

const PAID_FEATURES = [
  'Everything in Free',
  'Unlimited cloud saves',
  'All export formats (Tailwind, SCSS, W3C, Figma)',
  'Branding PDF export',
  'Hosted public design system page',
  'Version history',
]

function PricingSection({ user, onSignIn, onUpgrade, onDonate, earlyBirdActive }: PricingSectionProps) {
  const isPaid = user?.plan === 'paid'
  const isFree = !!user && !isPaid

  return (
    <section className={styles.pricingSection}>
      <div className={styles.sectionHd}>
        <h2 className={styles.sectionTitle}>Simple pricing</h2>
        <p className={styles.sectionSub}>One tool. One price. No subscriptions.</p>
      </div>

      <div className={styles.pricingCards}>
        {/* Free card */}
        <div className={styles.pricingCard}>
          <div className={styles.pricingCardLabel}>Free</div>
          <div className={styles.pricingPrice}>€0</div>
          <ul className={styles.pricingFeatureList}>
            {FREE_FEATURES.map(f => (
              <li key={f} className={styles.pricingFeatureItem}>
                <TemplateIcon slug="check" size={13} />
                {f}
              </li>
            ))}
          </ul>
          <button
            className={styles.pricingCta}
            onClick={onSignIn}
          >
            Start free
          </button>
        </div>

        {/* Lifetime card */}
        <div className={styles.pricingCardFeatured}>
          <div className={styles.pricingCardHeader}>
            <div className={styles.pricingCardLabel}>Lifetime</div>
            {earlyBirdActive && (
              <span className={styles.earlyBirdBadge}>Early bird</span>
            )}
          </div>
          <div className={styles.pricingPrice}>€29</div>
          <div className={styles.pricingPriceSub}>one-time · no subscription</div>
          <ul className={styles.pricingFeatureList}>
            {PAID_FEATURES.map(f => (
              <li key={f} className={styles.pricingFeatureItem}>
                <TemplateIcon slug="check" size={13} />
                {f}
              </li>
            ))}
          </ul>
          {isPaid ? (
            <button className={styles.pricingCtaPaid} disabled>
              You&apos;re all set ✓
            </button>
          ) : isFree ? (
            <button className={styles.pricingCtaFeatured} onClick={onUpgrade}>
              Upgrade — €29
            </button>
          ) : (
            <button className={styles.pricingCtaFeatured} onClick={onSignIn}>
              Get lifetime access
            </button>
          )}
        </div>
      </div>

      {/* Donate */}
      <p className={styles.donateRow}>
        Enjoying dsygn.cloud?{' '}
        <button className={styles.donateLink} onClick={onDonate}>
          ☕ Buy me a coffee
        </button>
      </p>
    </section>
  )
}
```

Add to `DsygnLanding` JSX, first add `openDonateModal` to the destructured actions:
```tsx
const { openSignInPrompt, openUpgradeModal, openDonateModal } = useUIActions()
```

Then add after features section:
```tsx
<PricingSection
  user={user}
  onNavigatePricing={() => onNavigate('pricing')}
  onSignIn={() => openSignInPrompt('manual')}
  onUpgrade={openUpgradeModal}
  onDonate={() => openDonateModal('footer')}
  earlyBirdActive={import.meta.env.VITE_EARLY_BIRD_ACTIVE === 'true'}
/>
```

- [ ] **Step 2: Add pricing CSS to `LandingTemplate.module.css`**

```css
/* ── PRICING SECTION ─────────────────────────────────────── */

.pricingSection {
  padding: var(--spacing-3xl, 80px) var(--spacing-xl, 40px);
  background: var(--color-background, #fafafa);
  border-top: 1px solid var(--color-border, #e5e5e5);
}

.pricingCards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md, 16px);
  max-width: 680px;
  margin: 0 auto var(--spacing-lg, 24px);
}

.pricingCard {
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e5e5e5);
  border-radius: var(--radius-lg, 12px);
  padding: var(--spacing-lg, 24px);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 10px);
}

.pricingCardFeatured {
  background: var(--color-surface, #fff);
  border: 2px solid var(--color-interactive, #e8543a);
  border-radius: var(--radius-lg, 12px);
  padding: var(--spacing-lg, 24px);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 10px);
  box-shadow: var(--shadow-md, 0 4px 16px rgba(0,0,0,0.08));
}

.pricingCardHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pricingCardLabel {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-on-surface-subtle, #aaa);
}

.earlyBirdBadge {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 2px 8px;
  background: var(--color-interactive-subtle, #fde8e3);
  color: var(--color-interactive, #e8543a);
  border-radius: var(--radius-full, 9999px);
}

.pricingPrice {
  font-family: var(--font-heading, sans-serif);
  font-size: var(--font-size-h1, 36px);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-on-surface, #111);
  line-height: 1;
}

.pricingPriceSub {
  font-size: 11px;
  color: var(--color-on-surface-subtle, #aaa);
  margin-top: -6px;
}

.pricingFeatureList {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  margin-top: 4px;
}

.pricingFeatureItem {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  font-size: 12px;
  color: var(--color-on-surface, #111);
  line-height: 1.5;
}
.pricingFeatureItem svg { flex-shrink: 0; margin-top: 2px; color: var(--color-success, #16a34a); }

.pricingCta {
  height: 38px;
  background: var(--color-surface-raised, #f4f4f4);
  color: var(--color-on-surface, #111);
  border: 1px solid var(--color-border, #e5e5e5);
  border-radius: var(--radius-md, 8px);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-body, sans-serif);
  transition: background 0.12s;
  margin-top: auto;
}
.pricingCta:hover { background: var(--color-border, #e5e5e5); }

.pricingCtaFeatured {
  height: 38px;
  background: var(--color-interactive, #e8543a);
  color: var(--color-on-interactive, #fff);
  border: none;
  border-radius: var(--radius-md, 8px);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: var(--font-body, sans-serif);
  transition: opacity 0.15s;
  margin-top: auto;
}
.pricingCtaFeatured:hover { opacity: 0.88; }

.pricingCtaPaid {
  height: 38px;
  background: var(--color-success-container, #dcfce7);
  color: var(--color-success, #16a34a);
  border: none;
  border-radius: var(--radius-md, 8px);
  font-size: 13px;
  font-weight: 600;
  cursor: default;
  font-family: var(--font-body, sans-serif);
  margin-top: auto;
}

.donateRow {
  text-align: center;
  font-size: 13px;
  color: var(--color-on-surface-subtle, #888);
  margin-top: 8px;
}

.donateLink {
  background: none;
  border: none;
  color: var(--color-interactive, #e8543a);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-family: var(--font-body, sans-serif);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.donateLink:hover { opacity: 0.8; }
```

- [ ] **Step 3: Verify in browser**

- Two pricing cards side by side
- Lifetime card has `--color-interactive` border (updates on regenerate)
- Price uses heading font at large size
- CTA state matches auth: anonymous → "Get lifetime access", free → "Upgrade — €29", paid → "You're all set ✓" (disabled)
- "☕ Buy me a coffee" link opens DonateModal
- Early bird badge appears/disappears based on `VITE_EARLY_BIRD_ACTIVE` env var

- [ ] **Step 4: Commit**

```bash
git add v3/src/features/preview/templates/LandingTemplate/DsygnLanding.tsx \
        v3/src/features/preview/templates/LandingTemplate/LandingTemplate.module.css
git commit -m "feat(landing): add pricing section — free/lifetime cards, auth-conditional CTAs, donate link"
```

---

## Task 10: Footer — 2 columns, all legal links

Remove old Spectrum 3-column footer. Replace with 2-column footer (Product + Legal) plus bottom bar.

**Files:**
- Modify: `v3/src/features/preview/templates/LandingTemplate/DsygnLanding.tsx`
- Modify: `v3/src/features/preview/templates/LandingTemplate/LandingTemplate.module.css`

- [ ] **Step 1: Add `FooterSection` sub-component**

```tsx
// Add above DsygnLanding function, in the same file:

interface FooterSectionProps {
  onNavigate: (route: PanelRoute) => void
}

function FooterSection({ onNavigate }: FooterSectionProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div className={styles.footerBrand}>
          <div className={styles.footerLogo}>dsygn.cloud</div>
          <p className={styles.footerTagline}>
            Your design system, in one keystroke.
          </p>
        </div>
        <div className={styles.footerCols}>
          <div className={styles.footerCol}>
            <div className={styles.footerColLabel}>Product</div>
            <button className={styles.footerLink} onClick={() => onNavigate('pricing')}>
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
            <button className={styles.footerLink} onClick={() => onNavigate('privacy')}>
              Privacy Policy
            </button>
            <button className={styles.footerLink} onClick={() => onNavigate('terms')}>
              Terms of Service
            </button>
            <button className={styles.footerLink} onClick={() => onNavigate('impressum')}>
              Impressum
            </button>
          </div>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <span className={styles.footerCopy}>&copy; 2026 dsygn.cloud</span>
      </div>
    </footer>
  )
}
```

Add `<FooterSection onNavigate={onNavigate} />` as the last element inside `<div className={styles.page}>`.

Remove the old `testimonial`, `ctaBand`, and `footer` JSX blocks that were in the original Spectrum template (they should no longer appear in DsygnLanding).

- [ ] **Step 2: The existing footer CSS classes work — no new CSS needed**

The existing `.footer`, `.footerTop`, `.footerBrand`, `.footerLogo`, `.footerTagline`, `.footerCols`, `.footerCol`, `.footerColLabel`, `.footerLink`, `.footerBottom`, `.footerCopy` classes all remain in `LandingTemplate.module.css` and are reused as-is.

Only one addition needed — make `footerLink` work as a `<button>`:
```css
/* Append to LandingTemplate.module.css */
/* Make footer links work as buttons too */
button.footerLink {
  background: none;
  border: none;
  padding: 0;
  text-align: left;
  font-family: var(--font-body, sans-serif);
  cursor: pointer;
}
```

- [ ] **Step 3: Verify in browser**

- Footer shows "dsygn.cloud" logo + tagline
- Product column: Pricing (navigates in-panel), Blog (new tab)
- Legal column: Privacy, Terms, Impressum — each navigates to LegalView in-panel
- Bottom bar: "© 2026 dsygn.cloud"
- No "Spectrum" text anywhere in the page

- [ ] **Step 4: Final check — search for any remaining Spectrum references**

```bash
grep -r "Spectrum" v3/src/features/preview/templates/LandingTemplate/DsygnLanding.tsx
```
Expected: no output (zero matches).

- [ ] **Step 5: Commit**

```bash
git add v3/src/features/preview/templates/LandingTemplate/DsygnLanding.tsx \
        v3/src/features/preview/templates/LandingTemplate/LandingTemplate.module.css
git commit -m "feat(landing): replace Spectrum footer with real dsygn.cloud 2-column footer + legal navigation"
```

---

## Task 11: PricingView — full content

Fill in the `PricingView` stub with real pricing content (mirrors Section 08 but as a full dedicated view with back button).

**Files:**
- Modify: `v3/src/features/preview/views/PricingView.tsx`
- Modify: `v3/src/features/preview/views/PricingView.module.css`

- [ ] **Step 1: Replace `PricingView` stub with full content**

```tsx
// v3/src/features/preview/views/PricingView.tsx
import { useAuth } from '@/auth/useAuth'
import { useUIActions } from '@/store'
import { TemplateIcon } from '../templates/shared/TemplateIcon'
import styles from './PricingView.module.css'

const FREE_FEATURES = [
  'Full design system generator',
  'CSS variables export',
  '3 saved designs',
  'No account needed to explore',
]

const PAID_FEATURES = [
  'Everything in Free',
  'Unlimited cloud saves',
  'All export formats (Tailwind, SCSS, W3C, Figma)',
  'Branding PDF export',
  'Hosted public design system page',
  'Version history',
]

const FAQS = [
  {
    q: 'Is this really one-time?',
    a: 'Yes. Pay once, own it forever. No subscription, no annual renewal.',
  },
  {
    q: 'What happens if I don\'t upgrade?',
    a: 'The free tier stays free, always. Generator, CSS export, and 3 saves are yours to keep.',
  },
  {
    q: 'EU VAT?',
    a: 'Handled automatically at checkout via Stripe Tax based on your location.',
  },
]

interface PricingViewProps {
  onBack: () => void
}

export function PricingView({ onBack }: PricingViewProps) {
  const { user } = useAuth()
  const { openSignInPrompt, openUpgradeModal, openDonateModal } = useUIActions()

  const isPaid = user?.plan === 'paid'
  const isFree = !!user && !isPaid
  const earlyBirdActive = import.meta.env.VITE_EARLY_BIRD_ACTIVE === 'true'

  return (
    <div className={styles.view}>
      <button className={styles.backBtn} onClick={onBack}>← dsygn.cloud</button>

      <div className={styles.header}>
        <h1 className={styles.heading}>Simple, honest pricing</h1>
        <p className={styles.sub}>One tool. One price. No subscriptions.</p>
      </div>

      <div className={styles.cards}>
        {/* Free */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>Free</div>
          <div className={styles.price}>€0</div>
          <ul className={styles.featureList}>
            {FREE_FEATURES.map(f => (
              <li key={f} className={styles.featureItem}>
                <TemplateIcon slug="check" size={13} />
                {f}
              </li>
            ))}
          </ul>
          <button className={styles.cta} onClick={() => openSignInPrompt('manual')}>
            Start free — no account needed
          </button>
        </div>

        {/* Lifetime */}
        <div className={styles.cardFeatured}>
          <div className={styles.cardHeader}>
            <div className={styles.cardLabel}>Lifetime</div>
            {earlyBirdActive && <span className={styles.earlyBirdBadge}>Early bird</span>}
          </div>
          <div className={styles.price}>€29</div>
          <div className={styles.priceSub}>one-time · no subscription</div>
          <ul className={styles.featureList}>
            {PAID_FEATURES.map(f => (
              <li key={f} className={styles.featureItem}>
                <TemplateIcon slug="check" size={13} />
                {f}
              </li>
            ))}
          </ul>
          {isPaid ? (
            <button className={styles.ctaPaid} disabled>You&apos;re all set ✓</button>
          ) : isFree ? (
            <button className={styles.ctaFeatured} onClick={openUpgradeModal}>Upgrade — €29</button>
          ) : (
            <button className={styles.ctaFeatured} onClick={() => openSignInPrompt('manual')}>
              Get lifetime access
            </button>
          )}
        </div>
      </div>

      {/* FAQ */}
      <div className={styles.faq}>
        <h2 className={styles.faqHeading}>Common questions</h2>
        {FAQS.map(({ q, a }) => (
          <div key={q} className={styles.faqItem}>
            <div className={styles.faqQ}>{q}</div>
            <div className={styles.faqA}>{a}</div>
          </div>
        ))}
      </div>

      {/* Footer bar */}
      <div className={styles.footerBar}>
        <button className={styles.footerLink} onClick={onBack}>← Back</button>
        <p className={styles.donateRow}>
          Enjoying dsygn.cloud?{' '}
          <button className={styles.donateLink} onClick={() => openDonateModal('footer')}>
            ☕ Buy me a coffee
          </button>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Replace `PricingView.module.css` stub with full styles**

```css
/* v3/src/features/preview/views/PricingView.module.css */
.view {
  font-family: var(--font-body, sans-serif);
  background: var(--color-background, #fff);
  color: var(--color-on-surface, #111);
  min-height: 100%;
  animation: fadeUp 0.18s ease-out;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.backBtn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--color-background, #fff);
  border: none;
  border-bottom: 1px solid var(--color-border, #e5e5e5);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-on-surface-subtle, #666);
  cursor: pointer;
  padding: 16px 24px;
  width: 100%;
  text-align: left;
  font-family: var(--font-body, sans-serif);
  position: sticky;
  top: 0;
  z-index: 10;
}
.backBtn:hover { color: var(--color-on-surface, #111); }

.header {
  padding: 48px 24px 32px;
  text-align: center;
}

.heading {
  font-family: var(--font-heading, sans-serif);
  font-size: var(--font-size-h1, 36px);
  font-weight: 800;
  letter-spacing: -0.025em;
  color: var(--color-on-surface, #111);
  margin-bottom: 10px;
}

.sub {
  font-size: var(--font-size-body, 16px);
  color: var(--color-on-surface-subtle, #666);
}

.cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 0 24px 32px;
  max-width: 640px;
  margin: 0 auto;
}

.card {
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e5e5e5);
  border-radius: var(--radius-lg, 12px);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cardFeatured {
  background: var(--color-surface, #fff);
  border: 2px solid var(--color-interactive, #e8543a);
  border-radius: var(--radius-lg, 12px);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: var(--shadow-md, 0 4px 16px rgba(0,0,0,0.08));
}

.cardHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cardLabel {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-on-surface-subtle, #aaa);
}

.earlyBirdBadge {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 2px 8px;
  background: var(--color-interactive-subtle, #fde8e3);
  color: var(--color-interactive, #e8543a);
  border-radius: var(--radius-full, 9999px);
}

.price {
  font-family: var(--font-heading, sans-serif);
  font-size: var(--font-size-h1, 36px);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-on-surface, #111);
  line-height: 1;
}

.priceSub {
  font-size: 11px;
  color: var(--color-on-surface-subtle, #aaa);
  margin-top: -6px;
}

.featureList {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  margin-top: 4px;
}

.featureItem {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  font-size: 12px;
  color: var(--color-on-surface, #111);
  line-height: 1.5;
}
.featureItem svg { flex-shrink: 0; margin-top: 2px; color: var(--color-success, #16a34a); }

.cta {
  height: 38px;
  background: var(--color-surface-raised, #f4f4f4);
  color: var(--color-on-surface, #111);
  border: 1px solid var(--color-border, #e5e5e5);
  border-radius: var(--radius-md, 8px);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-body, sans-serif);
  margin-top: auto;
}

.ctaFeatured {
  height: 38px;
  background: var(--color-interactive, #e8543a);
  color: var(--color-on-interactive, #fff);
  border: none;
  border-radius: var(--radius-md, 8px);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: var(--font-body, sans-serif);
  transition: opacity 0.15s;
  margin-top: auto;
}
.ctaFeatured:hover { opacity: 0.88; }

.ctaPaid {
  height: 38px;
  background: var(--color-success-container, #dcfce7);
  color: var(--color-success, #16a34a);
  border: none;
  border-radius: var(--radius-md, 8px);
  font-size: 13px;
  font-weight: 600;
  cursor: default;
  font-family: var(--font-body, sans-serif);
  margin-top: auto;
}

.faq {
  padding: 24px 24px 32px;
  max-width: 640px;
  margin: 0 auto;
  border-top: 1px solid var(--color-border, #e5e5e5);
}

.faqHeading {
  font-family: var(--font-heading, sans-serif);
  font-size: var(--font-size-h3, 20px);
  font-weight: 700;
  color: var(--color-on-surface, #111);
  margin-bottom: 16px;
}

.faqItem {
  margin-bottom: 16px;
}

.faqQ {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-on-surface, #111);
  margin-bottom: 4px;
}

.faqA {
  font-size: 13px;
  color: var(--color-on-surface-subtle, #666);
  line-height: 1.6;
}

.footerBar {
  padding: 16px 24px;
  border-top: 1px solid var(--color-border, #e5e5e5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-surface, #fff);
}

.footerLink {
  font-size: 12px;
  color: var(--color-on-surface-subtle, #aaa);
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-body, sans-serif);
  padding: 0;
}
.footerLink:hover { color: var(--color-on-surface, #111); }

.donateRow {
  font-size: 12px;
  color: var(--color-on-surface-subtle, #888);
  margin: 0;
}

.donateLink {
  background: none;
  border: none;
  color: var(--color-interactive, #e8543a);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-family: var(--font-body, sans-serif);
  text-decoration: underline;
  text-underline-offset: 2px;
}
```

- [ ] **Step 3: Verify in browser**

- Click "Pricing" in the nav → slides to PricingView
- Back button returns to DsygnLanding
- Cards, FAQ, donate link all render correctly
- Hit space while on home → should reset to 'home' (lastBaseHue change)

- [ ] **Step 4: Commit**

```bash
git add v3/src/features/preview/views/PricingView.tsx \
        v3/src/features/preview/views/PricingView.module.css
git commit -m "feat(landing): implement full PricingView with cards, FAQ, and donate link"
```

---

## Task 12: LegalView — privacy, terms, impressum content

**Files:**
- Modify: `v3/src/features/preview/views/LegalView.tsx`
- Modify: `v3/src/features/preview/views/LegalView.module.css`

- [ ] **Step 1: Replace `LegalView` stub with full content**

```tsx
// v3/src/features/preview/views/LegalView.tsx
import styles from './LegalView.module.css'

type LegalPage = 'privacy' | 'terms' | 'impressum'

interface LegalViewProps {
  page: LegalPage
  onBack: () => void
}

function PrivacyContent() {
  return (
    <>
      <p>dsygn.cloud ("we", "us") is committed to protecting your personal data. This policy explains what we collect and why.</p>
      <h3>Data we collect</h3>
      <ul>
        <li><strong>Account data:</strong> email address and display name from your OAuth provider (GitHub or Google) when you sign in.</li>
        <li><strong>Design data:</strong> your saved design systems (colors, typography, spacing tokens) stored in Supabase.</li>
        <li><strong>Usage analytics:</strong> page views and feature events via Plausible Analytics (privacy-friendly, no cookies, no cross-site tracking).</li>
        <li><strong>Payment data:</strong> processed entirely by Stripe. We never see or store your card details.</li>
      </ul>
      <h3>Data processors</h3>
      <ul>
        <li><strong>Supabase</strong> (Frankfurt, EU) — authentication and database.</li>
        <li><strong>Stripe</strong> — payment processing.</li>
        <li><strong>Plausible Analytics</strong> — anonymized usage statistics.</li>
        <li><strong>Vercel</strong> — application hosting (EU-region).</li>
      </ul>
      <h3>Your rights</h3>
      <p>You may request deletion of your account and all associated data at any time by emailing us. Plausible does not store personal data, so no deletion is needed there.</p>
      <h3>Contact</h3>
      <p>For privacy questions: see Impressum for contact details.</p>
    </>
  )
}

function TermsContent() {
  return (
    <>
      <p>These terms govern your use of dsygn.cloud. By using the service you agree to them.</p>
      <h3>Service description</h3>
      <p>dsygn.cloud is a design system generator. It generates CSS tokens, typography scales, and color palettes based on your inputs.</p>
      <h3>Free tier</h3>
      <p>The free tier is provided as-is, without any uptime guarantee. We may change or discontinue it with reasonable notice.</p>
      <h3>Lifetime access</h3>
      <p>The one-time payment grants lifetime access to the features listed at the time of purchase. "Lifetime" means the lifetime of the product.</p>
      <h3>Payment and refunds</h3>
      <p>Payments are processed by Stripe. By completing checkout you explicitly waive your EU statutory right of withdrawal for digital goods delivered immediately upon purchase. All sales are final.</p>
      <h3>Your content</h3>
      <p>You own the design systems you create. We claim no rights over your exported tokens, CSS, or any output generated by the tool.</p>
      <h3>Governing law</h3>
      <p>These terms are governed by the laws of Germany. Disputes are subject to the exclusive jurisdiction of the courts of Germany.</p>
    </>
  )
}

function ImpressumContent() {
  return (
    <>
      <p>Angaben gemäß § 5 TMG (Information according to § 5 German Telemedia Act).</p>
      <h3>Responsible for content</h3>
      <p>
        <strong>[Full legal name]</strong><br />
        [Street address]<br />
        [Postal code, City]<br />
        Germany
      </p>
      <h3>Contact</h3>
      <p>Email: [contact@dsygn.cloud]</p>
      <h3>EU dispute resolution</h3>
      <p>
        The European Commission provides a platform for online dispute resolution (ODR):{' '}
        <a
          href="https://ec.europa.eu/consumers/odr"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          https://ec.europa.eu/consumers/odr
        </a>.
        We are not obliged to participate in dispute resolution proceedings before a consumer arbitration board.
      </p>
    </>
  )
}

const CONTENT: Record<LegalPage, React.FC> = {
  privacy: PrivacyContent,
  terms: TermsContent,
  impressum: ImpressumContent,
}

const TITLES: Record<LegalPage, string> = {
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  impressum: 'Impressum',
}

export function LegalView({ page, onBack }: LegalViewProps) {
  const Content = CONTENT[page]
  return (
    <div className={styles.view}>
      <button className={styles.backBtn} onClick={onBack}>← dsygn.cloud</button>
      <div className={styles.content}>
        <h1 className={styles.title}>{TITLES[page]}</h1>
        <div className={styles.body}>
          <Content />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Replace `LegalView.module.css` stub with full styles**

```css
/* v3/src/features/preview/views/LegalView.module.css */
.view {
  font-family: var(--font-body, sans-serif);
  background: var(--color-background, #fff);
  color: var(--color-on-surface, #111);
  min-height: 100%;
  animation: fadeUp 0.18s ease-out;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.backBtn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--color-background, #fff);
  border: none;
  border-bottom: 1px solid var(--color-border, #e5e5e5);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-on-surface-subtle, #666);
  cursor: pointer;
  padding: 16px 24px;
  width: 100%;
  text-align: left;
  font-family: var(--font-body, sans-serif);
  position: sticky;
  top: 0;
  z-index: 10;
}
.backBtn:hover { color: var(--color-on-surface, #111); }

.content {
  padding: 40px 24px 48px;
  max-width: 640px;
  margin: 0 auto;
}

.title {
  font-family: var(--font-heading, sans-serif);
  font-size: var(--font-size-h1, 32px);
  font-weight: 800;
  letter-spacing: -0.025em;
  color: var(--color-on-surface, #111);
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border, #e5e5e5);
}

.body {
  font-size: 13px;
  line-height: 1.75;
  color: var(--color-on-surface, #111);
}

.body p { margin-bottom: 16px; }

.body h3 {
  font-family: var(--font-heading, sans-serif);
  font-size: 14px;
  font-weight: 700;
  color: var(--color-on-surface, #111);
  margin: 24px 0 8px;
}

.body ul {
  padding-left: 16px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.body li { color: var(--color-on-surface-subtle, #555); }

.link {
  color: var(--color-interactive, #e8543a);
  text-decoration: underline;
  text-underline-offset: 2px;
}
```

- [ ] **Step 3: Note on Impressum placeholders**

The Impressum content has `[Full legal name]`, `[Street address]`, `[Postal code, City]`, `[contact@dsygn.cloud]` as placeholders that must be filled by the product owner before launch. These are intentional — leave them as-is in code. The spec's definition of done does not require them to be filled.

- [ ] **Step 4: Verify in browser**

- Click "Privacy Policy" in footer → shows PrivacyContent with all three sections
- Click "Terms of Service" → shows TermsContent
- Click "Impressum" → shows ImpressumContent with placeholders visible
- Back button on each returns to DsygnLanding
- Scroll to top on each navigation

- [ ] **Step 5: Commit**

```bash
git add v3/src/features/preview/views/LegalView.tsx \
        v3/src/features/preview/views/LegalView.module.css
git commit -m "feat(landing): implement LegalView with privacy, terms, and impressum content"
```

---

## Task 13: Type check, smoke test, and final verification

- [ ] **Step 1: Run full TypeScript check**

```bash
cd v3 && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 2: Run existing test suite**

```bash
cd v3 && npm test
```

Expected: all existing tests pass. This plan does not add tests for the template components because they are purely visual/presentational, read-only from the store, and have no logic branches worth unit-testing beyond what the store tests already cover.

- [ ] **Step 3: Full manual verification checklist**

In the browser at http://localhost:5173 (generator mode):

- [ ] Nav shows "dsygn.cloud" logo, Pricing link, Blog link, auth buttons
- [ ] Clicking Pricing navigates to PricingView (with fade animation)
- [ ] PricingView back button returns to home
- [ ] Footer Privacy/Terms/Impressum open correct LegalView
- [ ] LegalView back button returns to home
- [ ] All 9 sections render without console errors
- [ ] Hit space 5 times — palette, type scale, component colors, spacing fill, shadow depths all update
- [ ] No hardcoded hex visible in swatch backgrounds (open DevTools → Computed styles on any swatch → value should show `var(...)`)
- [ ] Sign in → CTA buttons update state (nav "Get started" → "Upgrade — €29")
- [ ] DonateModal opens from "☕ Buy me a coffee"
- [ ] Detail mode: template switcher still works (System / Dashboard / Blog / Landing tabs in ShowcaseTab)
- [ ] `grep -r "Spectrum" v3/src/features/preview/templates/LandingTemplate/DsygnLanding.tsx` → no output

- [ ] **Step 4: Build check**

```bash
cd v3 && npm run build
```

Expected: completes without errors.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat(landing): dsygn.cloud landing page complete — demo-forward, 100% CSS-var driven, all 9 sections"
```
