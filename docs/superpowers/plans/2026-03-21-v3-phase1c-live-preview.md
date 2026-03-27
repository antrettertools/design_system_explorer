# Phase 1C — Live Preview & Theme

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the live preview stub with a fully implemented SaaS landing page template that updates in real time as the user generates new palettes. Every color, font, and type size in the template is driven by CSS custom properties — no hardcoded values. The template must look like something you'd actually show a client.

**Architecture:** The live preview is a self-contained React component that renders a SaaS landing page. It reads zero props — it only uses CSS custom properties that Phase 1A injects into `:root`. This means any palette change automatically re-renders the template via CSS without any React re-render.

**Prerequisites:** Phase 1A (token injection into `:root`) and Phase 1B (generator panel) complete.

---

## File Map

```
v3/src/features/preview/
├── LivePreview.tsx                   # Root — replaces LivePreviewStub, houses template
├── LivePreview.module.css            # Preview panel wrapper styles
└── templates/
    └── LandingTemplate/
        ├── LandingTemplate.tsx       # The full SaaS landing page
        └── LandingTemplate.module.css
```

---

## Design reference

From the brainstorming session: The preview should feel like a real SaaS product, not a demo. It uses the token design from the system-view.html mockup and refined design. Key sections:
1. **Nav** — logo, nav links, CTA button
2. **Hero** — headline (Display size), subheadline, two CTAs, screenshot/mockup placeholder
3. **Features** — 3-column grid of feature cards with icons
4. **Testimonial** — centered quote block with brand accent
5. **CTA section** — colored band (brand color background)
6. **Footer** — simple links row

Everything uses CSS vars:
- `var(--font-heading)` / `var(--font-body)` for fonts
- `var(--font-size-display)` / `var(--font-size-h1)` etc for sizes
- `var(--color-interactive)` / `var(--color-background)` / `var(--color-surface)` for colors
- `var(--color-on-surface)` for text
- `var(--color-border)` for dividers

---

## Task 1: Landing template

**Files:**
- Create: `v3/src/features/preview/templates/LandingTemplate/LandingTemplate.module.css`
- Create: `v3/src/features/preview/templates/LandingTemplate/LandingTemplate.tsx`

- [ ] **Step 1: Implement `LandingTemplate.module.css`**

```css
/* ========================================
   Landing Template — all colors/fonts from CSS vars
   ======================================== */

.page {
  font-family: var(--font-body, sans-serif);
  background: var(--color-background, #f8f7f4);
  color: var(--color-on-surface, #111);
  min-height: 100%;
  font-size: var(--font-size-body, 16px);
  line-height: var(--line-height-body, 1.6);
}

/* ---- NAV ---- */
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  height: 60px;
  background: var(--color-surface, #fff);
  border-bottom: 1px solid var(--color-border, #e8e4df);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navLogo {
  font-family: var(--font-heading, Georgia, serif);
  font-size: 20px;
  font-weight: 800;
  color: var(--color-on-surface, #111);
  letter-spacing: -0.03em;
}

.navLinks {
  display: flex;
  gap: 28px;
  list-style: none;
}

.navLink {
  font-size: 13px;
  color: var(--color-on-surface-subtle, #555);
  text-decoration: none;
  transition: color 0.15s;
  cursor: pointer;
}

.navLink:hover { color: var(--color-on-surface, #111); }

.navCta {
  height: 36px;
  padding: 0 16px;
  background: var(--color-interactive, #e8543a);
  color: var(--color-on-interactive, #fff);
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-body, sans-serif);
  transition: opacity 0.15s;
}

.navCta:hover { opacity: 0.85; }

/* ---- HERO ---- */
.hero {
  padding: 80px 40px 60px;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.heroBadge {
  display: inline-block;
  padding: 4px 12px;
  background: var(--color-interactive-subtle, #fde8e3);
  color: var(--color-interactive, #e8543a);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 20px;
  font-family: var(--font-body, sans-serif);
}

.heroHeadline {
  font-family: var(--font-heading, Georgia, serif);
  font-size: var(--font-size-display, 62px);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--color-on-surface, #111);
  margin-bottom: 16px;
}

.heroSub {
  font-size: var(--font-size-h3, 20px);
  line-height: 1.5;
  color: var(--color-on-surface-subtle, #555);
  max-width: 560px;
  margin: 0 auto 32px;
  font-family: var(--font-body, sans-serif);
}

.heroActions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.heroPrimary {
  height: 48px;
  padding: 0 24px;
  background: var(--color-interactive, #e8543a);
  color: var(--color-on-interactive, #fff);
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-body, sans-serif);
  transition: opacity 0.15s;
}

.heroPrimary:hover { opacity: 0.85; }

.heroSecondary {
  height: 48px;
  padding: 0 24px;
  background: transparent;
  color: var(--color-on-surface, #111);
  border: 1px solid var(--color-border-strong, #ccc);
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  font-family: var(--font-body, sans-serif);
  transition: background 0.15s;
}

.heroSecondary:hover { background: var(--color-surface, #fff); }

/* ---- MOCKUP ---- */
.mockup {
  margin: 48px 40px 0;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 12px;
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.mockupInner {
  display: grid;
  grid-template-columns: 220px 1fr;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.mockupSidebar {
  background: var(--color-interactive-subtle, #fde8e3);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mockupSidebarItem {
  height: 28px;
  background: var(--color-interactive, #e8543a);
  border-radius: 4px;
  opacity: 0.2;
}

.mockupSidebarItem:first-child { opacity: 0.6; }

.mockupMain {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mockupRow {
  display: flex;
  gap: 10px;
}

.mockupCard {
  flex: 1;
  background: var(--color-background, #f8f7f4);
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 6px;
  height: 60px;
}

.mockupLine {
  height: 10px;
  background: var(--color-border, #e8e4df);
  border-radius: 4px;
  width: 60%;
}

.mockupLineLong { width: 85%; }
.mockupLineShort { width: 35%; }

/* ---- FEATURES ---- */
.features {
  padding: 72px 40px;
  background: var(--color-background, #f8f7f4);
}

.featuresTitle {
  text-align: center;
  font-family: var(--font-heading, Georgia, serif);
  font-size: var(--font-size-h1, 40px);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--color-on-surface, #111);
  margin-bottom: 8px;
}

.featuresSub {
  text-align: center;
  font-size: var(--font-size-body, 16px);
  color: var(--color-on-surface-subtle, #666);
  margin-bottom: 48px;
}

.featureGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  max-width: 960px;
  margin: 0 auto;
}

.featureCard {
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 10px;
  padding: 24px;
  transition: box-shadow 0.2s, transform 0.2s;
}

.featureCard:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.featureIcon {
  width: 40px;
  height: 40px;
  background: var(--color-interactive-subtle, #fde8e3);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-bottom: 14px;
}

.featureTitle {
  font-family: var(--font-heading, Georgia, serif);
  font-size: var(--font-size-h3, 20px);
  font-weight: 700;
  color: var(--color-on-surface, #111);
  margin-bottom: 6px;
  letter-spacing: -0.01em;
}

.featureBody {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-on-surface-subtle, #666);
}

/* ---- TESTIMONIAL ---- */
.testimonial {
  background: var(--color-surface, #fff);
  border-top: 1px solid var(--color-border, #e8e4df);
  border-bottom: 1px solid var(--color-border, #e8e4df);
  padding: 64px 40px;
  text-align: center;
}

.testimonialQuote {
  font-family: var(--font-heading, Georgia, serif);
  font-size: var(--font-size-h2, 28px);
  font-weight: 400;
  font-style: italic;
  line-height: 1.4;
  color: var(--color-on-surface, #111);
  max-width: 680px;
  margin: 0 auto 20px;
  letter-spacing: -0.01em;
}

.testimonialQuote::before { content: '\201C'; color: var(--color-interactive, #e8543a); }
.testimonialQuote::after  { content: '\201D'; color: var(--color-interactive, #e8543a); }

.testimonialAuthor {
  font-size: 13px;
  color: var(--color-on-surface-subtle, #777);
  font-family: var(--font-body, sans-serif);
}

.testimonialAuthorName {
  font-weight: 600;
  color: var(--color-on-surface, #333);
}

/* ---- CTA BAND ---- */
.ctaBand {
  background: var(--color-interactive, #e8543a);
  padding: 64px 40px;
  text-align: center;
}

.ctaTitle {
  font-family: var(--font-heading, Georgia, serif);
  font-size: var(--font-size-h1, 40px);
  font-weight: 800;
  color: var(--color-on-interactive, #fff);
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.ctaSub {
  font-size: var(--font-size-body, 16px);
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 28px;
}

.ctaButton {
  height: 48px;
  padding: 0 28px;
  background: var(--color-on-interactive, #fff);
  color: var(--color-interactive, #e8543a);
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  font-family: var(--font-body, sans-serif);
  transition: opacity 0.15s;
}

.ctaButton:hover { opacity: 0.9; }

/* ---- FOOTER ---- */
.footer {
  background: var(--color-surface, #fff);
  border-top: 1px solid var(--color-border, #e8e4df);
  padding: 28px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footerLogo {
  font-family: var(--font-heading, Georgia, serif);
  font-size: 16px;
  font-weight: 800;
  color: var(--color-on-surface, #111);
  letter-spacing: -0.03em;
}

.footerLinks {
  display: flex;
  gap: 24px;
  list-style: none;
}

.footerLink {
  font-size: 12px;
  color: var(--color-on-surface-subtle, #777);
  cursor: pointer;
}

.footerCopy {
  font-size: 12px;
  color: var(--color-on-surface-subtle, #aaa);
}

@media (max-width: 768px) {
  .nav { padding: 0 20px; }
  .navLinks { display: none; }
  .hero { padding: 48px 20px 40px; }
  .heroHeadline { font-size: clamp(32px, 8vw, 62px); }
  .featureGrid { grid-template-columns: 1fr; }
  .mockupInner { grid-template-columns: 1fr; }
  .mockupSidebar { display: none; }
  .footer { flex-direction: column; gap: 12px; text-align: center; }
}
```

- [ ] **Step 2: Implement `LandingTemplate.tsx`**

```typescript
import styles from './LandingTemplate.module.css'

const FEATURES = [
  {
    icon: '⚡',
    title: 'Ship in minutes',
    body: 'Generate a complete design system in one keystroke. CSS variables, Tailwind config, and W3C tokens — all ready to paste.',
  },
  {
    icon: '🎨',
    title: 'Color science built in',
    body: 'OKLCH harmony models ensure your colors look great together. 7 models, perceptually uniform, automatically correct.',
  },
  {
    icon: '✦',
    title: 'Designed for vibe coders',
    body: 'No design background required. Lock what you love, cycle what you don\'t. The system knows color theory so you don\'t have to.',
  },
]

export function LandingTemplate() {
  return (
    <div className={styles.page}>
      {/* NAV */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>Acme</div>
        <ul className={styles.navLinks}>
          <li><a className={styles.navLink}>Product</a></li>
          <li><a className={styles.navLink}>Pricing</a></li>
          <li><a className={styles.navLink}>Docs</a></li>
          <li><a className={styles.navLink}>Blog</a></li>
        </ul>
        <button className={styles.navCta}>Get started →</button>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>Now in public beta</div>
        <h1 className={styles.heroHeadline}>
          Build better products,<br />ship them faster
        </h1>
        <p className={styles.heroSub}>
          The all-in-one platform for modern teams. Collaborate in real time,
          ship with confidence, and scale without limits.
        </p>
        <div className={styles.heroActions}>
          <button className={styles.heroPrimary}>Start for free</button>
          <button className={styles.heroSecondary}>Watch demo</button>
        </div>
      </section>

      {/* APP MOCKUP */}
      <div className={styles.mockup}>
        <div className={styles.mockupInner}>
          <div className={styles.mockupSidebar}>
            {[0, 1, 2, 3, 4].map(i => <div key={i} className={styles.mockupSidebarItem} />)}
          </div>
          <div className={styles.mockupMain}>
            <div className={styles.mockupLine} />
            <div className={styles.mockupLineLong} />
            <div className={styles.mockupRow}>
              <div className={styles.mockupCard} />
              <div className={styles.mockupCard} />
              <div className={styles.mockupCard} />
            </div>
            <div className={styles.mockupLineShort} />
            <div className={styles.mockupRow}>
              <div className={styles.mockupCard} />
              <div className={styles.mockupCard} />
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section className={styles.features}>
        <h2 className={styles.featuresTitle}>Everything you need</h2>
        <p className={styles.featuresSub}>
          Built for teams who move fast without breaking things.
        </p>
        <div className={styles.featureGrid}>
          {FEATURES.map(f => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureBody}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className={styles.testimonial}>
        <blockquote className={styles.testimonialQuote}>
          We went from zero to a complete design system in an afternoon.
          Our engineers were shipping new components the same day.
        </blockquote>
        <div className={styles.testimonialAuthor}>
          <span className={styles.testimonialAuthorName}>Sarah Chen</span>
          {' — Head of Design, Vercel'}
        </div>
      </section>

      {/* CTA BAND */}
      <section className={styles.ctaBand}>
        <h2 className={styles.ctaTitle}>Ready to ship?</h2>
        <p className={styles.ctaSub}>Join 10,000+ teams using palette. today.</p>
        <button className={styles.ctaButton}>Get started for free</button>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>Acme</div>
        <ul className={styles.footerLinks}>
          <li><a className={styles.footerLink}>Privacy</a></li>
          <li><a className={styles.footerLink}>Terms</a></li>
          <li><a className={styles.footerLink}>Status</a></li>
        </ul>
        <span className={styles.footerCopy}>© 2026 Acme, Inc.</span>
      </footer>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add v3/src/features/preview/templates/
git commit -m "feat(preview): SaaS landing page template — all tokens from CSS vars"
```

---

## Task 2: Live preview wrapper

**Files:**
- Create: `v3/src/features/preview/LivePreview.tsx`
- Create: `v3/src/features/preview/LivePreview.module.css`

- [ ] **Step 1: Implement `LivePreview.module.css`**

```css
.panel {
  height: 100%;
  overflow-y: auto;
  background: var(--color-background, #f8f7f4);
  /* Slight inset shadow to distinguish from the generator panel */
  box-shadow: inset 2px 0 8px rgba(0, 0, 0, 0.04);
}
```

- [ ] **Step 2: Implement `LivePreview.tsx`**

```typescript
import styles from './LivePreview.module.css'
import { LandingTemplate } from './templates/LandingTemplate/LandingTemplate'

export function LivePreview() {
  return (
    <div className={styles.panel}>
      <LandingTemplate />
    </div>
  )
}
```

- [ ] **Step 3: Wire `LivePreview` into `App.tsx`**

Replace the `LivePreviewStub` import with `LivePreview`:

```typescript
// In App.tsx — change:
import { LivePreviewStub } from './features/preview/LivePreviewStub'
// to:
import { LivePreview } from './features/preview/LivePreview'

// And in the JSX:
// Change:  right={<LivePreviewStub />}
// To:      right={<LivePreview />}
```

- [ ] **Step 4: Verify live updates**

```bash
cd v3 && npm run dev
```

Test:
1. Press SPACE — the landing page colors and fonts change immediately
2. Lock a swatch — press SPACE again — locked colors remain but surrounding colors update
3. Theme toggle — entire landing page switches to dark mode
4. All font families update when pairing changes (heading in nav logo, hero headline; body in paragraphs)
5. Feature card hover shows box-shadow with slight lift

- [ ] **Step 5: Commit**

```bash
git add v3/src/features/preview/LivePreview.tsx v3/src/features/preview/LivePreview.module.css v3/src/App.tsx
git commit -m "feat(preview): wire live preview — landing template replaces stub"
```

---

## Task 3: Dark mode CSS completeness

The dark mode works via `[data-theme="dark"]` on `<html>`. Phase 1A already injects the dark token overrides. This task ensures the CSS is complete and no light values leak through.

- [ ] **Step 1: Audit CSS for hardcoded colors**

Search the entire `v3/src/` directory for any hardcoded hex values or `rgb()` calls that should be CSS vars:

```bash
grep -r "#[0-9a-fA-F]\{3,6\}\b" v3/src/features/ v3/src/components/ --include="*.css" --include="*.tsx"
```

Any hardcoded color found in CSS Module files for structural UI (not for the template demo content) should be replaced with the appropriate CSS var. For example:
- `#111` → `var(--color-on-surface, #111)`
- `#fff` → `var(--color-surface, #fff)`
- `#e8e4df` → `var(--color-border, #e8e4df)`

Exception: Hardcoded colors in `LandingTemplate.module.css` fallback values (the part after the comma in `var(...)`) are acceptable.

- [ ] **Step 2: Add transition for smooth theme switching**

In `v3/src/styles/globals.css`:
```css
/* Smooth dark mode transitions */
*, *::before, *::after {
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.15s ease;
}

/* Disable transitions during initial load to avoid flash */
.no-transitions * { transition: none !important; }
```

In `App.tsx`, add a brief `no-transitions` class on mount:
```typescript
useEffect(() => {
  document.documentElement.classList.add('no-transitions')
  // Initial generation
  colorActions.generate()
  typographyActions.generate()
  // Re-enable transitions after paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('no-transitions')
    })
  })
}, [])
```

- [ ] **Step 3: Verify dark mode on landing template**

Toggle dark mode. Check:
- Nav background is dark (surface-dark)
- Hero text is light (on-surface-dark)
- Feature cards have dark background
- CTA band is still brand color (it's semantic-interactive, same in light/dark but slightly lighter in dark)
- Footer is dark

- [ ] **Step 4: Commit**

```bash
git add v3/src/
git commit -m "feat(theme): dark mode completeness — smooth transitions, audited CSS vars"
```

---

## Task 4: Mobile preview slide-in

On mobile, the preview is hidden behind the generator. A "Preview →" button in the generator footer slides it in. The back button returns to the generator.

- [ ] **Step 1: Add mobile preview toggle to the store**

In `v3/src/store/ui.ts`, add to `UIState`:
```typescript
mobileShowPreview: boolean
```

Add to `defaultUIState`:
```typescript
mobileShowPreview: false
```

Add to `UIActions`:
```typescript
showMobilePreview: () => void
hideMobilePreview: () => void
```

Add to `createUIActions`:
```typescript
showMobilePreview: () => set({ ui: { ...(get() as { ui: UIState }).ui, mobileShowPreview: true } }),
hideMobilePreview: () => set({ ui: { ...(get() as { ui: UIState }).ui, mobileShowPreview: false } }),
```

- [ ] **Step 2: Update `App.tsx` for mobile layout**

On mobile (≤768px), render the generator and preview as full-width panels stacked with CSS `transform` for slide animation. Only one is visible at a time.

In `App.tsx`:
```typescript
import { useUI, useUIActions } from './store'

// Inside the component:
const { mobileShowPreview } = useUI()

// In the JSX, replace the SplitPane with:
<>
  <SplitPane
    left={<GeneratorPanel />}
    right={<LivePreview />}
  />
  {/* Mobile preview button — shown in GeneratorFooter (see below) */}
</>
```

- [ ] **Step 3: Add "Preview →" button to `GeneratorFooter.tsx`**

Add to `GeneratorFooter.module.css`:
```css
.previewBtn {
  display: none;
}

@media (max-width: 768px) {
  .previewBtn {
    display: block;
    height: 40px;
    padding: 0 16px;
    background: var(--color-surface, #fff);
    color: var(--color-on-surface, #111);
    border: 1px solid var(--color-border, #e8e4df);
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    margin-right: 8px;
  }
}
```

In `GeneratorFooter.tsx`:
```typescript
import { useUIActions } from '@/store'
const { showMobilePreview } = useUIActions()

// Add in the footer JSX (next to the Generate button):
<button className={styles.previewBtn} onClick={showMobilePreview}>
  Preview →
</button>
```

- [ ] **Step 4: Update `SplitPane.tsx` for mobile**

In `SplitPane.module.css`, extend the mobile block:
```css
@media (max-width: 768px) {
  .container {
    position: relative;
    overflow: hidden;
  }
  .left {
    width: 100% !important;
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    transform: translateX(0);
    transition: transform 0.3s ease;
    z-index: 1;
  }
  .left.slideOut {
    transform: translateX(-100%);
  }
  .right {
    width: 100% !important;
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  }
  .right.slideIn {
    transform: translateX(0);
  }
  .divider { display: none; }
}
```

Update `SplitPane.tsx` to accept and apply `mobileShowPreview`:
```typescript
import { useUI } from '@/store'

// Inside SplitPane, read from store:
const { mobileShowPreview } = useUI()

// Apply classes:
<div className={`${styles.left} ${mobileShowPreview ? styles.slideOut : ''}`}>
  {left}
</div>
<div className={`${styles.right} ${mobileShowPreview ? styles.slideIn : ''}`}>
  {right}
</div>
```

- [ ] **Step 5: Add "← Back" button in the live preview on mobile**

In `LivePreview.module.css`:
```css
.backBtn {
  display: none;
}

@media (max-width: 768px) {
  .backBtn {
    display: flex;
    align-items: center;
    gap: 6px;
    position: sticky;
    top: 0;
    z-index: 10;
    background: var(--color-surface, #fff);
    border-bottom: 1px solid var(--color-border, #e8e4df);
    padding: 10px 16px;
    font-size: 13px;
    color: var(--color-on-surface, #111);
    cursor: pointer;
    border: none;
    width: 100%;
    text-align: left;
  }
}
```

In `LivePreview.tsx`:
```typescript
import { useUIActions } from '@/store'

export function LivePreview() {
  const { hideMobilePreview } = useUIActions()
  return (
    <div className={styles.panel}>
      <button className={styles.backBtn} onClick={hideMobilePreview}>
        ← Back to generator
      </button>
      <LandingTemplate />
    </div>
  )
}
```

- [ ] **Step 6: Test mobile flow**

Narrow browser to 375px:
1. Generator panel visible
2. "Preview →" button visible at bottom
3. Tap "Preview →" — panel slides right-in, generator slides out
4. Landing template visible
5. "← Back" button at top — tap it — generator returns

- [ ] **Step 7: Commit**

```bash
git add v3/src/
git commit -m "feat(mobile): preview slide-in — Preview button + back navigation"
```

---

## Task 5: Final verification

- [ ] **Step 1: Full manual test on desktop**

1. Load app — 4 swatches appear, landing template rendered immediately
2. Press SPACE — everything updates smoothly
3. Lock brand swatch — press SPACE — brand stays, others cycle
4. Hint bar appears with harmony model name
5. Theme toggle — dark mode applied everywhere
6. All text uses heading/body font from the pairing
7. CTA band uses brand color
8. Feature card hover effects work

- [ ] **Step 2: Full manual test on mobile (375px)**

1. Generator panel full width
2. "Generate ✦" button visible
3. Tap Generate — swatches update
4. Tap "Preview →" — slide animation
5. Landing page renders with tokens
6. Tap "← Back" — returns

- [ ] **Step 3: Run type check**

```bash
cd v3 && npx tsc --noEmit
```

Zero errors.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(1C): live preview complete — landing template, dark mode, mobile slide-in"
```

---

## What Phase 1D receives from 1C

Phase 1D developers:
- Full split-pane app with working generator left and landing template right
- The store has `useUI().mode` — in `generator` mode the current UI shows. When mode becomes `detail`, Phase 1D's `DetailMode` component should render instead of the generator panel
- Token injection is live — all CSS vars available
- `LivePreview` is in `v3/src/features/preview/LivePreview.tsx`
- Phase 1D adds a second template option (System view) — hook it into `LivePreview` via the `showcaseTemplate` store state
