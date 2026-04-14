# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure `DsygnLanding` with new section order, a prominent spacebar key, a magazine-grid live-system section, and add real browser routes for `/pricing` and `/blog`.

**Architecture:** `DsygnLanding` is refactored into smaller sub-components (`HowItWorksSection`, `LiveSystemSection`) extracted into the same `LandingTemplate/` directory. The `onNavigate` prop type is narrowed to legal routes only — pricing becomes anchor-scroll, blog becomes a real React Router route. Two new standalone pages (`PricingPage`, `BlogPage`) are added to the router.

**Tech Stack:** React, TypeScript, CSS Modules, React Router v6, Zustand (via existing selectors), Vitest + Testing Library

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `v3/src/features/preview/templates/LandingTemplate/DsygnLanding.tsx` | Full restructure: new section order, nav, hero, footer |
| Create | `v3/src/features/preview/templates/LandingTemplate/HowItWorksSection.tsx` | 3-step numbered "How it works" layout |
| Create | `v3/src/features/preview/templates/LandingTemplate/LiveSystemSection.tsx` | Magazine grid merging colors, type, components, spacing |
| Modify | `v3/src/features/preview/templates/LandingTemplate/LandingTemplate.module.css` | CSS for all new elements |
| Modify | `v3/src/features/preview/LivePreview.tsx` | Remove 'pricing' from PanelRoute; remove PricingView |
| Modify | `v3/src/router.tsx` | Add `/pricing` and `/blog` routes |
| Create | `v3/src/pages/PricingPage.tsx` | Standalone pricing page |
| Create | `v3/src/pages/PricingPage.module.css` | Styles for standalone pricing page |
| Create | `v3/src/pages/BlogPage.tsx` | Coming-soon stub blog page |
| Create | `v3/src/pages/BlogPage.module.css` | Styles for blog stub page |
| Create | `v3/src/features/preview/templates/LandingTemplate/__tests__/DsygnLanding.test.tsx` | Render tests for section IDs + spacebar key |

---

## Task 1: Add new CSS classes to LandingTemplate.module.css

**Files:**
- Modify: `v3/src/features/preview/templates/LandingTemplate/LandingTemplate.module.css`

- [ ] **Step 1: Append all new CSS classes at the bottom of the file**

Open the file and append the following block after all existing content:

```css
/* ── SPACEBAR KEY VISUAL ─────────────────────────────────── */

.spacebarVisual {
  display: flex;
  justify-content: center;
  padding: var(--ui-space-lg, 24px) 0 var(--ui-space-xl, 32px);
}

.spaceKey {
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-sm, 12px);
  width: 200px;
  padding: 10px 16px;
  background: var(--color-surface-raised, #f5f5f5);
  border: 1.5px solid var(--color-border, #e0e0e0);
  border-radius: var(--radius-md, 8px);
  box-shadow: 0 2px 0 0 var(--color-border, #e0e0e0), inset 0 -1px 0 0 var(--color-border, #e0e0e0);
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-on-surface-subtle, #666);
  cursor: default;
  user-select: none;
  justify-content: center;
}

.spaceKeyGlyph {
  font-size: 18px;
  color: var(--color-on-surface, #111);
}

/* ── SOCIAL PROOF ────────────────────────────────────────── */

.socialProof {
  text-align: center;
  font-size: 13px;
  color: var(--color-on-surface-subtle, #777);
  margin: 0;
  padding-bottom: var(--ui-space-md, 16px);
}

/* ── HOW IT WORKS ────────────────────────────────────────── */

.howItWorksGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--ui-space-xl, 32px);
}

@media (max-width: 640px) {
  .howItWorksGrid {
    grid-template-columns: 1fr;
  }
}

.howItWorksStep {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-xs, 8px);
}

.stepNumber {
  font-family: var(--font-heading, sans-serif);
  font-size: var(--font-size-display, 48px);
  font-weight: 800;
  line-height: 1;
  color: var(--color-interactive, #6366f1);
  opacity: 0.25;
}

.stepTitle {
  font-family: var(--font-heading, sans-serif);
  font-size: var(--font-size-h3, 20px);
  font-weight: 700;
  color: var(--color-on-surface, #111);
}

.stepBody {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-on-surface-subtle, #555);
  margin: 0;
}

/* ── LIVE SYSTEM SECTION (magazine grid) ─────────────────── */

.liveSystemIntro {
  margin-bottom: var(--ui-space-lg, 24px);
}

.liveSystemSubLabel {
  font-size: 13px;
  color: var(--color-on-surface-subtle, #666);
  margin: var(--ui-space-xs, 8px) 0 0;
}

.liveSystemGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto auto;
  gap: var(--ui-space-lg, 24px);
}

.liveSystemColors {
  grid-column: 1;
  grid-row: 1;
  background: var(--color-surface-raised, #f8f8f8);
  border-radius: var(--radius-lg, 12px);
  padding: var(--ui-space-lg, 20px);
}

.liveSystemTypography {
  grid-column: 2;
  grid-row: 1;
  background: var(--color-surface-raised, #f8f8f8);
  border-radius: var(--radius-lg, 12px);
  padding: var(--ui-space-lg, 20px);
}

.liveSystemComponents {
  grid-column: 1 / -1;
  grid-row: 2;
  background: var(--color-surface-raised, #f8f8f8);
  border-radius: var(--radius-lg, 12px);
  padding: var(--ui-space-lg, 20px);
}

.liveSystemSpacing {
  grid-column: 1 / -1;
  grid-row: 3;
  background: var(--color-surface-raised, #f8f8f8);
  border-radius: var(--radius-lg, 12px);
  padding: var(--ui-space-lg, 20px);
}

.liveSystemBlockLabel {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-on-surface-subtle, #888);
  margin-bottom: var(--ui-space-sm, 12px);
}

/* Compact spacing scale for live system block */
.compactSpacingScale {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-xs, 6px);
}

.compactSpacingRow {
  display: flex;
  align-items: center;
  gap: var(--ui-space-sm, 10px);
}

.compactSpacingKey {
  font-size: 11px;
  color: var(--color-on-surface-subtle, #888);
  width: 24px;
  flex-shrink: 0;
}

.compactSpacingBar {
  height: 8px;
  background: var(--color-interactive, #6366f1);
  border-radius: 2px;
  opacity: 0.6;
}

/* ── DEEP DIVE ────────────────────────────────────────────── */

.deepDive {
  border-top: 1px solid var(--color-border, #e5e5e5);
  padding-top: var(--ui-space-xl, 40px);
}

.deepDiveLabel {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-on-surface-subtle, #888);
  margin-bottom: var(--ui-space-xl, 32px);
}
```

- [ ] **Step 2: Verify the file saved correctly (no duplicate class names)**

```bash
cd v3
npx tsc --noEmit
```
Expected: zero errors (the CSS module changes don't affect TypeScript).

---

## Task 2: Create HowItWorksSection component

**Files:**
- Create: `v3/src/features/preview/templates/LandingTemplate/HowItWorksSection.tsx`
- Create: `v3/src/features/preview/templates/LandingTemplate/__tests__/HowItWorksSection.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `v3/src/features/preview/templates/LandingTemplate/__tests__/HowItWorksSection.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HowItWorksSection } from '../HowItWorksSection'

describe('HowItWorksSection', () => {
  it('renders the section with id="how-it-works"', () => {
    render(<HowItWorksSection />)
    const section = document.getElementById('how-it-works')
    expect(section).not.toBeNull()
  })

  it('renders all three step titles', () => {
    render(<HowItWorksSection />)
    expect(screen.getByText('Hit ␣ Space')).toBeTruthy()
    expect(screen.getByText('Lock & refine')).toBeTruthy()
    expect(screen.getByText('Export & ship')).toBeTruthy()
  })

  it('renders step numbers 1, 2, 3', () => {
    render(<HowItWorksSection />)
    expect(screen.getByText('1')).toBeTruthy()
    expect(screen.getByText('2')).toBeTruthy()
    expect(screen.getByText('3')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd v3
npm test -- HowItWorksSection --run
```
Expected: FAIL — `Cannot find module '../HowItWorksSection'`

- [ ] **Step 3: Create the component**

Create `v3/src/features/preview/templates/LandingTemplate/HowItWorksSection.tsx`:

```tsx
import styles from './LandingTemplate.module.css'

const STEPS = [
  {
    number: '1',
    title: 'Hit ␣ Space',
    body: 'A complete design system generates instantly — OKLCH-calibrated colors, a font pairing, spacing scale, and every semantic token.',
  },
  {
    number: '2',
    title: 'Lock & refine',
    body: "Love the color? Lock it. Not the font? Hit space again. Build exactly what you want by locking what's working and regenerating the rest.",
  },
  {
    number: '3',
    title: 'Export & ship',
    body: 'CSS variables, Tailwind v3/v4, SCSS, W3C Design Tokens, Figma JSON — copy and paste. No config files, no setup rituals.',
  },
]

export function HowItWorksSection() {
  return (
    <section className={styles.section} id="how-it-works">
      <div className={styles.sectionLabel}>How it works</div>
      <div className={styles.howItWorksGrid}>
        {STEPS.map((step) => (
          <div key={step.number} className={styles.howItWorksStep}>
            <div className={styles.stepNumber}>{step.number}</div>
            <div className={styles.stepTitle}>{step.title}</div>
            <p className={styles.stepBody}>{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd v3
npm test -- HowItWorksSection --run
```
Expected: PASS — 3 tests pass.

- [ ] **Step 5: Commit**

```bash
cd v3 && cd ..
git add v3/src/features/preview/templates/LandingTemplate/HowItWorksSection.tsx \
        v3/src/features/preview/templates/LandingTemplate/__tests__/HowItWorksSection.test.tsx \
        v3/src/features/preview/templates/LandingTemplate/LandingTemplate.module.css
git commit -m "feat: add HowItWorksSection + new CSS classes"
```

---

## Task 3: Create LiveSystemSection component (magazine grid)

This merges `PaletteSection`, `TypographySection`, `ComponentsSection`, and a compact `SpacingSection` (spacing bars only) into one component.

**Files:**
- Create: `v3/src/features/preview/templates/LandingTemplate/LiveSystemSection.tsx`
- Create: `v3/src/features/preview/templates/LandingTemplate/__tests__/LiveSystemSection.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `v3/src/features/preview/templates/LandingTemplate/__tests__/LiveSystemSection.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useStore } from '@/store'
import { LiveSystemSection } from '../LiveSystemSection'

vi.mock('@/auth/useAuth', () => ({
  useAuth: () => ({ user: null }),
}))

beforeEach(() => {
  useStore.setState(s => ({
    ...s,
    color: {
      ...s.color,
      slots: [
        { id: 'slot-0', role: 'brand' as const, hex: '#6366f1', locked: false },
        { id: 'slot-1', role: 'secondary' as const, hex: '#a855f7', locked: false },
      ],
      dataVizN: 3,
      stateOverrides: {},
    },
    typography: {
      ...s.typography,
      pairing: { heading: 'Inter', body: 'Inter' },
    },
  }))
})

describe('LiveSystemSection', () => {
  it('renders without crashing', () => {
    render(<LiveSystemSection />)
    expect(document.querySelector('[class]')).not.toBeNull()
  })

  it('renders the section headline', () => {
    render(<LiveSystemSection />)
    expect(screen.getByText('This page runs on your tokens.')).toBeTruthy()
  })

  it('renders the colors block label', () => {
    render(<LiveSystemSection />)
    expect(screen.getByText('Colors')).toBeTruthy()
  })

  it('renders the typography block label', () => {
    render(<LiveSystemSection />)
    expect(screen.getByText('Typography')).toBeTruthy()
  })

  it('renders the components block label', () => {
    render(<LiveSystemSection />)
    expect(screen.getByText('Components')).toBeTruthy()
  })

  it('renders the spacing block label', () => {
    render(<LiveSystemSection />)
    expect(screen.getByText('Spacing')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd v3
npm test -- LiveSystemSection --run
```
Expected: FAIL — `Cannot find module '../LiveSystemSection'`

- [ ] **Step 3: Create the component**

Create `v3/src/features/preview/templates/LandingTemplate/LiveSystemSection.tsx`:

```tsx
import { useColor, useTypography } from '@/store'
import { POSITION_LABELS } from '@/core/color/types'
import styles from './LandingTemplate.module.css'

type SpecimenRow = {
  label: string
  fontFamily: string
  fontSize: string
  fontWeight: string
  sample: string
}

const SPECIMEN_ROWS: SpecimenRow[] = [
  { label: 'Display',  fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-display)', fontWeight: 'var(--font-weight-display)', sample: 'The quick brown fox' },
  { label: 'Heading',  fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h1)',      fontWeight: 'var(--font-weight-h1)',      sample: 'The quick brown fox' },
  { label: 'Subhead',  fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h2)',      fontWeight: 'var(--font-weight-h2)',      sample: 'The quick brown fox' },
  { label: 'Body',     fontFamily: 'var(--font-body)',    fontSize: 'var(--font-size-body)',    fontWeight: 'var(--font-weight-body)',    sample: 'The quick brown fox jumps over the lazy dog.' },
  { label: 'Small',    fontFamily: 'var(--font-body)',    fontSize: 'var(--font-size-small)',   fontWeight: 'var(--font-weight-small)',   sample: 'Caption · Label · Meta' },
]

const COMPACT_SPACING_STEPS = [
  { key: 'xs',  varName: 'var(--ui-space-xs)' },
  { key: 'sm',  varName: 'var(--ui-space-sm)' },
  { key: 'md',  varName: 'var(--ui-space-md)' },
  { key: 'lg',  varName: 'var(--ui-space-lg)' },
  { key: 'xl',  varName: 'var(--ui-space-xl)' },
  { key: '2xl', varName: 'var(--ui-space-2xl)' },
  { key: '3xl', varName: 'var(--ui-space-3xl)' },
]

const SEMANTIC_STATES = [
  { key: 'success', label: 'Success' },
  { key: 'warning', label: 'Warning' },
  { key: 'error',   label: 'Error' },
  { key: 'info',    label: 'Info' },
]

export function LiveSystemSection() {
  const { slots, dataVizN, stateOverrides } = useColor()
  const { pairing } = useTypography()

  const headingFont = pairing?.heading ?? '—'
  const bodyFont    = pairing?.body    ?? '—'

  return (
    <section className={styles.section}>
      <div className={styles.liveSystemIntro}>
        <div className={styles.sectionLabel}>This page runs on your tokens.</div>
        <p className={styles.liveSystemSubLabel}>
          Every color, font, and component below is rendered live using your current design system.
        </p>
      </div>

      <div className={styles.liveSystemGrid}>

        {/* ── Colors block ── */}
        <div className={styles.liveSystemColors}>
          <div className={styles.liveSystemBlockLabel}>Colors</div>

          {/* Core swatches */}
          <div className={styles.paletteRow}>
            {slots.map((slot) => (
              <div key={slot.id} className={styles.swatchCard}>
                <div className={styles.swatch} style={{ background: `var(--color-${slot.role}-500)` }} />
                <span className={styles.swatchLabel}>{slot.name ?? POSITION_LABELS[slot.role]}</span>
                <span className={styles.swatchHex}>{slot.hex}</span>
              </div>
            ))}
          </div>

          {/* Semantic states */}
          <div className={styles.paletteRow}>
            {SEMANTIC_STATES.map(({ key, label }) => {
              const overrideHex = stateOverrides[key as keyof typeof stateOverrides]
              return (
                <div key={key} className={styles.swatchCard}>
                  <div className={styles.swatch} style={{ background: `var(--color-${key})` }} />
                  <span className={styles.swatchLabel}>{label}</span>
                  {overrideHex !== undefined && <span className={styles.swatchHex}>{overrideHex}</span>}
                </div>
              )
            })}
          </div>

          {/* Data viz strip */}
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

        {/* ── Typography block ── */}
        <div className={styles.liveSystemTypography}>
          <div className={styles.liveSystemBlockLabel}>Typography</div>

          <div className={styles.fontPairingBadge}>{headingFont} + {bodyFont}</div>

          <div className={styles.typeScale}>
            {SPECIMEN_ROWS.map((row) => (
              <div key={row.label} className={styles.typeRow}>
                <span className={styles.typeLabel}>{row.label}</span>
                <span
                  className={styles.typeSpecimen}
                  style={{ fontFamily: row.fontFamily, fontSize: row.fontSize, fontWeight: row.fontWeight }}
                >
                  {row.sample}
                </span>
                <span className={styles.typeMeta}>{row.fontSize} / {row.fontWeight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Components block ── */}
        <div className={styles.liveSystemComponents}>
          <div className={styles.liveSystemBlockLabel}>Components</div>

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
              <span className={styles.demoBadge} style={{ background: 'var(--color-surface-raised)', color: 'var(--color-on-surface-subtle)' }}>Default</span>
              <span className={styles.demoBadge} style={{ background: 'var(--color-success-container)', color: 'var(--color-success)' }}>Success</span>
              <span className={styles.demoBadge} style={{ background: 'var(--color-warning-container)', color: 'var(--color-warning)' }}>Warning</span>
              <span className={styles.demoBadge} style={{ background: 'var(--color-error-container)', color: 'var(--color-error)' }}>Error</span>
              <span className={styles.demoBadge} style={{ background: 'var(--color-info-container)', color: 'var(--color-info)' }}>Info</span>
            </div>
          </div>

          {/* Input */}
          <div className={styles.componentGroup}>
            <div className={styles.componentGroupLabel}>Input</div>
            <div className={styles.inputGroup}>
              <label className={styles.demoLabel} htmlFor="live-system-email">Email</label>
              <input id="live-system-email" className={styles.demoInput} type="email" placeholder="you@example.com" />
            </div>
          </div>

          {/* Alerts */}
          <div className={styles.componentGroup}>
            <div className={styles.componentGroupLabel}>Alerts</div>
            <div className={styles.alertGrid}>
              <div className={styles.alertCard} style={{ background: 'var(--color-success-container)', borderLeftColor: 'var(--color-success)' }}>
                <span className={styles.alertIcon}>✓</span>
                <div><div className={styles.alertTitle}>Tokens compiled</div><div className={styles.alertBody}>47 tokens · no contrast errors</div></div>
              </div>
              <div className={styles.alertCard} style={{ background: 'var(--color-info-container)', borderLeftColor: 'var(--color-info)' }}>
                <span className={styles.alertIcon}>ℹ</span>
                <div><div className={styles.alertTitle}>New harmony model</div><div className={styles.alertBody}>Triadic — 4 accents generated</div></div>
              </div>
              <div className={styles.alertCard} style={{ background: 'var(--color-warning-container)', borderLeftColor: 'var(--color-warning)' }}>
                <span className={styles.alertIcon}>⚠</span>
                <div><div className={styles.alertTitle}>Breaking change</div><div className={styles.alertBody}>Token names changed in v2</div></div>
              </div>
              <div className={styles.alertCard} style={{ background: 'var(--color-error-container)', borderLeftColor: 'var(--color-error)' }}>
                <span className={styles.alertIcon}>✕</span>
                <div><div className={styles.alertTitle}>Contrast failed</div><div className={styles.alertBody}>Body text below 4.5:1 on surface-raised</div></div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Spacing (compact) block ── */}
        <div className={styles.liveSystemSpacing}>
          <div className={styles.liveSystemBlockLabel}>Spacing</div>
          <div className={styles.compactSpacingScale}>
            {COMPACT_SPACING_STEPS.map((step) => (
              <div key={step.key} className={styles.compactSpacingRow}>
                <span className={styles.compactSpacingKey}>{step.key}</span>
                <div className={styles.compactSpacingBar} style={{ width: step.varName }} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd v3
npm test -- LiveSystemSection --run
```
Expected: PASS — 6 tests pass.

- [ ] **Step 5: Commit**

```bash
cd v3 && cd ..
git add v3/src/features/preview/templates/LandingTemplate/LiveSystemSection.tsx \
        v3/src/features/preview/templates/LandingTemplate/__tests__/LiveSystemSection.test.tsx
git commit -m "feat: add LiveSystemSection magazine grid component"
```

---

## Task 4: Restructure DsygnLanding

This is the main rewrite. The new section order is:
Nav → Hero (with spacebar key + social proof) → HowItWorks → LiveSystem → Features (6-card) → Pricing (id="pricing") → Deep Dive → Footer

**Files:**
- Modify: `v3/src/features/preview/templates/LandingTemplate/DsygnLanding.tsx`
- Create: `v3/src/features/preview/templates/LandingTemplate/__tests__/DsygnLanding.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `v3/src/features/preview/templates/LandingTemplate/__tests__/DsygnLanding.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useStore } from '@/store'
import { DsygnLanding } from '../DsygnLanding'

vi.mock('@/auth/useAuth', () => ({
  useAuth: () => ({ user: null }),
}))

vi.mock('@/analytics', () => ({ trackEvent: vi.fn() }))

const onNavigate = vi.fn()

function renderLanding(mode: 'generator' | 'detail' = 'generator') {
  useStore.setState(s => ({
    ...s,
    color: {
      ...s.color,
      slots: [{ id: 'slot-0', role: 'brand' as const, hex: '#6366f1', locked: false }],
      dataVizN: 3,
      stateOverrides: {},
    },
    typography: {
      ...s.typography,
      pairing: { heading: 'Inter', body: 'Inter' },
    },
    ui: { ...s.ui, mode },
  }))
  return render(
    <MemoryRouter>
      <DsygnLanding onNavigate={onNavigate} />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('DsygnLanding — section IDs', () => {
  it('renders section with id="how-it-works"', () => {
    renderLanding()
    expect(document.getElementById('how-it-works')).not.toBeNull()
  })

  it('renders section with id="features"', () => {
    renderLanding()
    expect(document.getElementById('features')).not.toBeNull()
  })

  it('renders section with id="pricing"', () => {
    renderLanding()
    expect(document.getElementById('pricing')).not.toBeNull()
  })
})

describe('DsygnLanding — spacebar key', () => {
  it('renders spacebar key when mode is generator', () => {
    renderLanding('generator')
    expect(screen.getByText(/Space — regenerate/)).toBeTruthy()
  })

  it('does not render spacebar key when mode is detail', () => {
    renderLanding('detail')
    expect(screen.queryByText(/Space — regenerate/)).toBeNull()
  })
})

describe('DsygnLanding — nav links', () => {
  it('renders nav links for How it works, Features, Pricing, Blog', () => {
    renderLanding()
    expect(screen.getByRole('link', { name: /blog/i })).toBeTruthy()
    expect(screen.getByText('How it works')).toBeTruthy()
    expect(screen.getByText('Features')).toBeTruthy()
    // "Pricing" appears in nav
    const pricingButtons = screen.getAllByText('Pricing')
    expect(pricingButtons.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd v3
npm test -- DsygnLanding.test --run
```
Expected: FAIL — tests fail because section IDs and spacebar key don't match the new spec.

- [ ] **Step 3: Rewrite DsygnLanding.tsx**

Replace the entire file `v3/src/features/preview/templates/LandingTemplate/DsygnLanding.tsx` with:

```tsx
import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { useUIActions, useUI } from '@/store'
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
            <TemplateIcon slug="lock" size={28} />
          </div>
          <div className={styles.featTitle}>Lock & Refine</div>
          <div className={styles.featBody}>
            Love the color? Lock it. Hate the font? Regenerate just that. Build your perfect system incrementally.
          </div>
        </div>

        <div className={styles.featCard}>
          <div className={styles.featIcon} style={{ color: 'var(--color-accent-b-500, var(--color-accent-b, var(--color-interactive, #6366f1)))' }}>
            <TemplateIcon slug="moon" size={28} />
          </div>
          <div className={styles.featTitle}>Dark Mode Ready</div>
          <div className={styles.featBody}>
            Every token has a light and dark value. Toggle themes instantly — the full system adapts without code changes.
          </div>
        </div>

        <div className={styles.featCard}>
          <div className={styles.featIcon} style={{ color: 'var(--color-brand-500, var(--color-interactive, #e8543a))' }}>
            <TemplateIcon slug="text" size={28} />
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
  const { dataVizN } = useColor() // imported from @/store below in DsygnLanding context
  return (
    <section className={`${styles.section} ${styles.deepDive}`}>
      <div className={styles.deepDiveLabel}>Explore the full system</div>

      {/* Full spacing scale */}
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

      {/* Border radius */}
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

      {/* Shadows */}
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

      {/* Data viz strip */}
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

// needs useColor — import it alongside the others
import { useColor } from '@/store'

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
```

**Note:** The `import { useColor } from '@/store'` at the bottom of the file is invalid — move it to the top imports block. The final file should have all imports at the top:

```tsx
import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { useColor, useUIActions, useUI } from '@/store'
import { TemplateIcon } from '../shared/TemplateIcon'
import { HowItWorksSection } from './HowItWorksSection'
import { LiveSystemSection } from './LiveSystemSection'
import styles from './LandingTemplate.module.css'
```

And remove the duplicate `import { useColor } from '@/store'` at the bottom.

- [ ] **Step 4: Run the DsygnLanding tests**

```bash
cd v3
npm test -- DsygnLanding.test --run
```
Expected: PASS — all tests in DsygnLanding.test.tsx pass.

- [ ] **Step 5: Run full test suite to check no regressions**

```bash
cd v3
npm test --run
```
Expected: all tests pass.

- [ ] **Step 6: Type check**

```bash
cd v3
npx tsc --noEmit
```
Expected: zero errors.

- [ ] **Step 7: Commit**

```bash
cd v3 && cd ..
git add v3/src/features/preview/templates/LandingTemplate/DsygnLanding.tsx \
        v3/src/features/preview/templates/LandingTemplate/__tests__/DsygnLanding.test.tsx
git commit -m "feat: restructure DsygnLanding — new section order, spacebar key, anchor scroll"
```

---

## Task 5: Update LivePreview — remove 'pricing' panel route

**Files:**
- Modify: `v3/src/features/preview/LivePreview.tsx`

The `DsygnLandingProps.onNavigate` no longer accepts `'pricing'`, so `setPanelRoute('pricing')` must not be called. Remove 'pricing' from PanelRoute, remove the PricingView import and its case.

- [ ] **Step 1: Edit LivePreview.tsx**

Change `v3/src/features/preview/LivePreview.tsx`:

1. Remove the PricingView import (line 9)
2. Change the `PanelRoute` type to exclude 'pricing'
3. Remove the `'pricing'` case from `renderTemplate`

The updated file content:

```tsx
import { useRef, useState, useEffect } from 'react'
import { useUI, useUIActions, useColor } from '@/store'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import styles from './LivePreview.module.css'
import { DsygnLanding } from './templates/LandingTemplate/DsygnLanding'
import { SystemTemplate } from './templates/SystemTemplate/SystemTemplate'
import { DashboardTemplate } from './templates/DashboardTemplate/DashboardTemplate'
import { BlogTemplate } from './templates/BlogTemplate/BlogTemplate'
import { LegalView } from './views/LegalView'
import { ShowcaseStrip } from './ShowcaseStrip/ShowcaseStrip'

type PanelRoute = 'home' | 'privacy' | 'terms' | 'impressum'

function LivePreviewErrorFallback() {
  return (
    <div className={`${styles.panel} ${styles.errorFallback}`}>
      <p className={styles.errorMessage}>Preview unavailable.</p>
      <button className={styles.errorReload} onClick={() => window.location.reload()}>
        Reload page
      </button>
    </div>
  )
}

function LivePreviewContent() {
  const { showcaseTemplate } = useUI()
  const { hideMobilePreview } = useUIActions()
  const { lastBaseHue } = useColor()

  const [panelRoute, setPanelRoute] = useState<PanelRoute>('home')
  const panelRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  // Reset to home when a new palette is generated
  useEffect(() => {
    setPanelRoute('home')
  }, [lastBaseHue])

  // Scroll to top on route change
  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.scrollTop = 0
    }
  }, [panelRoute])

  const template = showcaseTemplate

  const renderTemplate = () => {
    // Non-landing templates bypass panelRoute (panelRoute is Landing-only)
    if (template !== 'landing') {
      switch (template) {
        case 'system': return <SystemTemplate />
        case 'dashboard': return <DashboardTemplate />
        case 'blog': return <BlogTemplate />
      }
    }

    // Landing template: honour panelRoute for legal sub-pages
    switch (panelRoute) {
      case 'privacy':
      case 'terms':
      case 'impressum':
        return <LegalView page={panelRoute} onBack={() => setPanelRoute('home')} />
      default:
        return <DsygnLanding onNavigate={setPanelRoute} />
    }
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    if (touch.clientX < 48) {
      touchStartX.current = touch.clientX
      touchStartY.current = touch.clientY
    }
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartX.current
    const deltaY = Math.abs(touch.clientY - (touchStartY.current ?? touch.clientY))
    if (deltaX > 60 && deltaY < 40) {
      hideMobilePreview()
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  return (
    <div
      className={styles.panel}
      ref={panelRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button className={styles.backBtn} onClick={hideMobilePreview} aria-label="Back to generator">
        &larr; Back to generator
      </button>
      <ShowcaseStrip />
      {renderTemplate()}
    </div>
  )
}

export function LivePreview() {
  return (
    <ErrorBoundary fallback={<LivePreviewErrorFallback />}>
      <LivePreviewContent />
    </ErrorBoundary>
  )
}
```

- [ ] **Step 2: Type check**

```bash
cd v3
npx tsc --noEmit
```
Expected: zero errors.

- [ ] **Step 3: Run full test suite**

```bash
cd v3
npm test --run
```
Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
cd v3 && cd ..
git add v3/src/features/preview/LivePreview.tsx
git commit -m "refactor: remove pricing panel route from LivePreview"
```

---

## Task 6: Create standalone PricingPage

**Files:**
- Create: `v3/src/pages/PricingPage.tsx`
- Create: `v3/src/pages/PricingPage.module.css`

- [ ] **Step 1: Create the CSS module**

Create `v3/src/pages/PricingPage.module.css`:

```css
.page {
  min-height: 100vh;
  background: var(--color-background, #fff);
  color: var(--color-on-surface, #111);
  font-family: var(--font-body, sans-serif);
  font-size: var(--font-size-body, 16px);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--ui-space-xl, 40px);
  height: 56px;
  border-bottom: 1px solid var(--color-border, #e5e5e5);
}

.wordmark {
  font-family: var(--font-heading, sans-serif);
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--color-on-surface, #111);
  text-decoration: none;
}

.back {
  font-size: 13px;
  color: var(--color-on-surface-subtle, #666);
  text-decoration: none;
}
.back:hover { color: var(--color-on-surface, #111); }

.content {
  max-width: 680px;
  margin: 0 auto;
  padding: var(--ui-space-xl, 40px) var(--ui-space-xl, 40px) var(--ui-space-3xl, 80px);
}
```

- [ ] **Step 2: Create the page component**

Create `v3/src/pages/PricingPage.tsx`:

```tsx
import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { useUIActions } from '@/store'
import landingStyles from '@/features/preview/templates/LandingTemplate/LandingTemplate.module.css'
import styles from './PricingPage.module.css'

const EARLY_BIRD_ACTIVE = import.meta.env.VITE_EARLY_BIRD_ACTIVE === 'true'

export function PricingPage() {
  const { user } = useAuth()
  const { openSignInPrompt, openUpgradeModal, openDonateModal } = useUIActions()

  const isSignedIn = user !== null
  const isPaid = user?.plan === 'paid'

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.back}>← Back to generator</Link>
        <span className={styles.wordmark}>dsygn.cloud</span>
      </header>

      <div className={styles.content}>
        <div className={landingStyles.sectionLabel} style={{ marginBottom: '32px' }}>
          Simple pricing
        </div>

        <div className={landingStyles.pricingGrid}>

          {/* Free card */}
          <div className={landingStyles.pricingCard}>
            <div className={landingStyles.pricingLabel}>Free</div>
            <div className={landingStyles.pricingPrice}>€0</div>
            <div className={landingStyles.pricingSubtext}>forever</div>
            <ul className={landingStyles.pricingList}>
              <li className={landingStyles.pricingListItem}>Generator (all features)</li>
              <li className={landingStyles.pricingListItem}>CSS export</li>
              <li className={landingStyles.pricingListItem}>3 saved designs</li>
              <li className={landingStyles.pricingListItem}>No account required to start</li>
            </ul>
            <button className={landingStyles.pricingCta} onClick={() => openSignInPrompt('manual')}>
              Start free
            </button>
          </div>

          {/* Lifetime card */}
          <div className={`${landingStyles.pricingCard} ${landingStyles.pricingCardHighlight}`}>
            <div className={landingStyles.pricingLabelRow}>
              <span className={landingStyles.pricingLabel}>Lifetime</span>
              {EARLY_BIRD_ACTIVE && <span className={landingStyles.earlyBirdBadge}>Early Bird</span>}
            </div>
            <div className={landingStyles.pricingPrice}>€29</div>
            <div className={landingStyles.pricingSubtext}>one-time · no subscription</div>
            <ul className={landingStyles.pricingList}>
              <li className={landingStyles.pricingListItem}>Everything in Free</li>
              <li className={landingStyles.pricingListItem}>Unlimited cloud saves</li>
              <li className={landingStyles.pricingListItem}>All export formats (ZIP, Figma, W3C, SCSS, Tailwind)</li>
              <li className={landingStyles.pricingListItem}>Branding PDF</li>
              <li className={landingStyles.pricingListItem}>Hosted public design system page</li>
              <li className={landingStyles.pricingListItem}>Version history</li>
            </ul>
            {!isSignedIn && (
              <button className={landingStyles.pricingCta} onClick={() => openSignInPrompt('manual')}>
                Get lifetime access
              </button>
            )}
            {isSignedIn && !isPaid && (
              <button className={landingStyles.pricingCta} onClick={openUpgradeModal}>
                Upgrade — €29
              </button>
            )}
            {isSignedIn && isPaid && (
              <button className={`${landingStyles.pricingCta} ${landingStyles.pricingCtaDisabled}`} disabled>
                You&apos;re all set ✓
              </button>
            )}
          </div>

        </div>

        <div className={landingStyles.coffeeRow}>
          Enjoying dsygn.cloud? ☕{' '}
          <button className={landingStyles.coffeeBtn} onClick={() => openDonateModal('footer')}>
            Buy me a coffee
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Type check**

```bash
cd v3
npx tsc --noEmit
```
Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
cd v3 && cd ..
git add v3/src/pages/PricingPage.tsx v3/src/pages/PricingPage.module.css
git commit -m "feat: add standalone PricingPage at /pricing"
```

---

## Task 7: Create BlogPage stub

**Files:**
- Create: `v3/src/pages/BlogPage.tsx`
- Create: `v3/src/pages/BlogPage.module.css`

- [ ] **Step 1: Create the CSS module**

Create `v3/src/pages/BlogPage.module.css`:

```css
.page {
  min-height: 100vh;
  background: var(--color-background, #fff);
  color: var(--color-on-surface, #111);
  font-family: var(--font-body, sans-serif);
  font-size: var(--font-size-body, 16px);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--ui-space-xl, 40px);
  height: 56px;
  border-bottom: 1px solid var(--color-border, #e5e5e5);
}

.wordmark {
  font-family: var(--font-heading, sans-serif);
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--color-on-surface, #111);
}

.back {
  font-size: 13px;
  color: var(--color-on-surface-subtle, #666);
  text-decoration: none;
}
.back:hover { color: var(--color-on-surface, #111); }

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 56px);
  gap: var(--ui-space-md, 16px);
  padding: var(--ui-space-xl, 40px);
  text-align: center;
}

.title {
  font-family: var(--font-heading, sans-serif);
  font-size: var(--font-size-h1, 32px);
  font-weight: 700;
  color: var(--color-on-surface, #111);
}

.subtitle {
  font-size: 16px;
  color: var(--color-on-surface-subtle, #666);
  max-width: 400px;
}
```

- [ ] **Step 2: Create the page component**

Create `v3/src/pages/BlogPage.tsx`:

```tsx
import { Link } from 'react-router-dom'
import styles from './BlogPage.module.css'

export function BlogPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.back}>← Back to generator</Link>
        <span className={styles.wordmark}>dsygn.cloud</span>
      </header>
      <div className={styles.content}>
        <div className={styles.title}>Blog — coming soon</div>
        <p className={styles.subtitle}>
          We&apos;re working on articles about design tokens, color theory, and building design systems. Check back soon.
        </p>
        <Link to="/" className={styles.back}>← Back to generator</Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Type check**

```bash
cd v3
npx tsc --noEmit
```
Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
cd v3 && cd ..
git add v3/src/pages/BlogPage.tsx v3/src/pages/BlogPage.module.css
git commit -m "feat: add BlogPage stub at /blog"
```

---

## Task 8: Add /pricing and /blog to the router

**Files:**
- Modify: `v3/src/router.tsx`

- [ ] **Step 1: Update the router**

Replace `v3/src/router.tsx` with:

```tsx
import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import { SignInPage } from './pages/SignInPage'
import { DesignSystemViewer } from './pages/DesignSystemViewer'
import { AccountPage } from './pages/AccountPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { TermsPage } from './pages/TermsPage'
import { ImpressumPage } from './pages/ImpressumPage'
import { PricingPage } from './pages/PricingPage'
import { BlogPage } from './pages/BlogPage'

export const router = createBrowserRouter([
  { path: '/',                     element: <App /> },
  { path: '/sign-in',              element: <SignInPage /> },
  { path: '/s/:username/:slug',    element: <DesignSystemViewer /> },
  { path: '/account',              element: <AccountPage /> },
  { path: '/legal/privacy',        element: <PrivacyPage /> },
  { path: '/legal/terms',          element: <TermsPage /> },
  { path: '/impressum',            element: <ImpressumPage /> },
  { path: '/pricing',              element: <PricingPage /> },
  { path: '/blog',                 element: <BlogPage /> },
])
```

- [ ] **Step 2: Type check**

```bash
cd v3
npx tsc --noEmit
```
Expected: zero errors.

- [ ] **Step 3: Run full test suite**

```bash
cd v3
npm test --run
```
Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
cd v3 && cd ..
git add v3/src/router.tsx
git commit -m "feat: register /pricing and /blog routes"
```

---

## Task 9: Final verification

- [ ] **Step 1: Full type check**

```bash
cd v3
npx tsc --noEmit
```
Expected: zero errors.

- [ ] **Step 2: Full test suite**

```bash
cd v3
npm test --run
```
Expected: all tests pass.

- [ ] **Step 3: Build check**

```bash
cd v3
npm run build
```
Expected: successful build, no TypeScript errors, no console warnings about missing CSS vars.

- [ ] **Step 4: Manual success criteria checklist**

Verify against spec §9:
- [ ] Section order: Nav → Hero → How it works → Live system → Features → Pricing → Deep dive → Footer
- [ ] `#how-it-works` reachable from nav "How it works" button
- [ ] `#features` reachable from nav "Features" button
- [ ] `#pricing` reachable from nav "Pricing" button and hero "See pricing" CTA
- [ ] Spacebar `<kbd>` renders when mode=generator, absent when mode=detail
- [ ] Magazine grid shows Colors, Typography, Components, Spacing in one section
- [ ] `/pricing` renders without the tool UI
- [ ] `/blog` renders without error
- [ ] Zero TypeScript errors
- [ ] All tests pass
- [ ] No hardcoded colors (all via CSS vars)

---

## Self-Review

**Spec coverage check:**
- §3.1 Nav — covered in Task 4 (new links, anchor scroll) ✓
- §3.2 Hero — covered in Task 4 (spacebar key, social proof, anchor CTA) ✓
- §3.3 How it works — covered in Task 2 (HowItWorksSection) ✓
- §3.4 Live design system — covered in Task 3 (LiveSystemSection magazine grid) ✓
- §3.5 Features — covered in Task 4 (6 cards, id="features") ✓
- §3.6 Pricing — covered in Task 4 (id="pricing") ✓
- §3.7 Deep dive — covered in Task 4 (DeepDiveSection) ✓
- §3.8 Footer — covered in Task 4 (two columns, anchor/Link) ✓
- §4.1 /pricing route — covered in Tasks 6 + 8 ✓
- §4.2 /blog route — covered in Tasks 7 + 8 ✓
- §6 DsygnLandingProps update — covered in Task 4 (narrowed type) ✓
- §6 LivePreview update — covered in Task 5 ✓

**Placeholder check:** No TBD/TODO in any code blocks above. All code is complete and runnable.

**Type consistency check:**
- `LegalRoute` defined as `'privacy' | 'terms' | 'impressum'` in DsygnLanding.tsx — passed as `onNavigate` and used as the narrowed type for `setPanelRoute` in LivePreview (PanelRoute includes all three). ✓
- `scrollToSection` is defined before use in DsygnLanding. ✓
- `DeepDiveSection` uses `useColor()` — `useColor` is imported in the top-level imports. ✓
- `LiveSystemSection` uses `useColor()` and `useTypography()` — both imported. ✓
