# Phase 1E — Showcase, Export & URL Sharing

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete Phase 1 by implementing the Showcase tab (template switcher + System view), the Export slide-up panel (always-accessible in generator mode), the Export tab (full controls in detail mode), and URL sharing (encode session to hash, decode on load). By end of 1E, palette. is fully functional and shippable.

**Architecture:** The Showcase tab's left panel is controls-only (no editable tokens). The System view is a scrollable, screenshot-worthy document. The Export slide-up is a viewport-anchored overlay. URL sharing is triggered from the Showcase tab and decoded on app load.

**Prerequisites:** Phases 1A–1D complete.

---

## File Map

```
v3/src/features/
├── detail/
│   ├── DetailMode.tsx                        # MODIFY — add showcase + export cases
│   └── tabs/
│       ├── ShowcaseTab/
│       │   ├── ShowcaseTab.tsx               # Template switcher controls + share link
│       │   └── ShowcaseTab.module.css
│       └── ExportTab/
│           ├── ExportTab.tsx                 # Full export controls (detail mode)
│           └── ExportTab.module.css
├── preview/
│   ├── LivePreview.tsx                       # MODIFY — add template switcher
│   └── templates/
│       ├── LandingTemplate/                  # Already exists (1C)
│       ├── SystemTemplate/
│       │   ├── SystemTemplate.tsx            # The screenshot-worthy design system doc
│       │   └── SystemTemplate.module.css
│       ├── DashboardTemplate/
│       │   ├── DashboardTemplate.tsx         # Simple dashboard preview
│       │   └── DashboardTemplate.module.css
│       └── BlogTemplate/
│           ├── BlogTemplate.tsx              # Simple blog preview
│           └── BlogTemplate.module.css
└── export/
    ├── ExportPanel.tsx                       # Slide-up overlay panel
    └── ExportPanel.module.css
```

---

## Task 1: Template switcher in live preview

Wire the live preview to render different templates based on `ui.showcaseTemplate`. This only activates in detail mode (template switcher is in the Showcase tab). In generator mode the template is always `landing`.

- [ ] **Step 1: Modify `LivePreview.tsx`**

```typescript
import styles from './LivePreview.module.css'
import { LandingTemplate } from './templates/LandingTemplate/LandingTemplate'
import { SystemTemplate } from './templates/SystemTemplate/SystemTemplate'
import { DashboardTemplate } from './templates/DashboardTemplate/DashboardTemplate'
import { BlogTemplate } from './templates/BlogTemplate/BlogTemplate'
import { useUI, useUIActions } from '@/store'

export function LivePreview() {
  const { showcaseTemplate, mode } = useUI()
  const { hideMobilePreview } = useUIActions()

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

  return (
    <div className={styles.panel}>
      <button className={styles.backBtn} onClick={hideMobilePreview}>
        ← Back to generator
      </button>
      {renderTemplate()}
    </div>
  )
}
```

- [ ] **Step 2: Create stub `DashboardTemplate.tsx`**

```typescript
// v3/src/features/preview/templates/DashboardTemplate/DashboardTemplate.tsx
import styles from './DashboardTemplate.module.css'

export function DashboardTemplate() {
  return (
    <div className={styles.page}>
      <div className={styles.sidebar}>
        <div className={styles.logo}>Acme</div>
        {['Dashboard', 'Analytics', 'Projects', 'Settings'].map(item => (
          <div key={item} className={`${styles.navItem} ${item === 'Dashboard' ? styles.active : ''}`}>
            {item}
          </div>
        ))}
      </div>
      <div className={styles.main}>
        <div className={styles.header}>
          <div className={styles.title}>Dashboard</div>
          <button className={styles.cta}>New project</button>
        </div>
        <div className={styles.statsGrid}>
          {[
            { label: 'Revenue', value: '$48,295', delta: '+12%' },
            { label: 'Users', value: '12,847', delta: '+8%' },
            { label: 'Conversion', value: '3.24%', delta: '+0.4%' },
            { label: 'Avg. session', value: '4m 32s', delta: '-2%' },
          ].map(stat => (
            <div key={stat.label} className={styles.statCard}>
              <div className={styles.statLabel}>{stat.label}</div>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statDelta}>{stat.delta}</div>
            </div>
          ))}
        </div>
        <div className={styles.chartArea}>
          <div className={styles.chartTitle}>Revenue over time</div>
          <div className={styles.chartBars}>
            {[65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95, 65].map((h, i) => (
              <div key={i} className={styles.bar} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

`DashboardTemplate.module.css`:
```css
.page {
  display: flex;
  height: 100%;
  font-family: var(--font-body, sans-serif);
  background: var(--color-background, #f8f7f4);
  color: var(--color-on-surface, #111);
  font-size: 14px;
}

.sidebar {
  width: 200px;
  flex-shrink: 0;
  background: var(--color-surface, #fff);
  border-right: 1px solid var(--color-border, #e8e4df);
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.logo {
  font-family: var(--font-heading, Georgia, serif);
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.03em;
  padding: 0 8px 16px;
  border-bottom: 1px solid var(--color-border, #e8e4df);
  margin-bottom: 8px;
}

.navItem {
  padding: 7px 10px;
  border-radius: 6px;
  font-size: 13px;
  color: var(--color-on-surface-subtle, #666);
  cursor: pointer;
  transition: background 0.15s;
}

.navItem:hover { background: var(--color-interactive-subtle, #f5f3f0); }

.navItem.active {
  background: var(--color-interactive-subtle, #fde8e3);
  color: var(--color-interactive, #e8543a);
  font-weight: 600;
}

.main { flex: 1; overflow-y: auto; padding: 24px; }

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.title {
  font-family: var(--font-heading, Georgia, serif);
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.cta {
  height: 34px;
  padding: 0 14px;
  background: var(--color-interactive, #e8543a);
  color: var(--color-on-interactive, #fff);
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.statsGrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.statCard {
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 8px;
  padding: 14px;
}

.statLabel { font-size: 11px; color: var(--color-on-surface-subtle, #888); margin-bottom: 4px; }
.statValue { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 2px; }
.statDelta { font-size: 11px; color: var(--color-interactive, #e8543a); }

.chartArea {
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 8px;
  padding: 16px;
}

.chartTitle { font-size: 12px; font-weight: 600; margin-bottom: 12px; color: var(--color-on-surface-subtle, #888); }

.chartBars {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 120px;
}

.bar {
  flex: 1;
  background: var(--color-interactive, #e8543a);
  border-radius: 2px 2px 0 0;
  opacity: 0.8;
  transition: opacity 0.15s;
}

.bar:hover { opacity: 1; }
```

- [ ] **Step 3: Create stub `BlogTemplate.tsx`**

```typescript
// v3/src/features/preview/templates/BlogTemplate/BlogTemplate.tsx
import styles from './BlogTemplate.module.css'

const POSTS = [
  { tag: 'Design', title: 'How color theory changed the way we think about interfaces', date: 'March 2026', read: '5 min' },
  { tag: 'Typography', title: 'The quiet revolution of variable fonts in modern web design', date: 'March 2026', read: '7 min' },
  { tag: 'Product', title: 'Building for vibe coders: design systems that ship in minutes', date: 'February 2026', read: '4 min' },
]

export function BlogTemplate() {
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <span className={styles.logo}>The Journal</span>
        <div className={styles.navLinks}>
          {['Design', 'Typography', 'Product'].map(l => (
            <span key={l} className={styles.navLink}>{l}</span>
          ))}
        </div>
      </nav>
      <main className={styles.main}>
        <div className={styles.featured}>
          <div className={styles.featuredTag}>Featured</div>
          <h1 className={styles.featuredTitle}>
            The perceptual revolution: why OKLCH is replacing HSL
          </h1>
          <p className={styles.featuredExcerpt}>
            For decades, designers worked in RGB and HSL — color spaces that feel intuitive
            but are perceptually uneven. Here is why the future belongs to OKLCH.
          </p>
          <div className={styles.meta}>March 21, 2026 · 8 min read</div>
        </div>
        <div className={styles.postGrid}>
          {POSTS.map(post => (
            <article key={post.title} className={styles.postCard}>
              <div className={styles.postTag}>{post.tag}</div>
              <h2 className={styles.postTitle}>{post.title}</h2>
              <div className={styles.postMeta}>{post.date} · {post.read} read</div>
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}
```

`BlogTemplate.module.css`:
```css
.page { font-family: var(--font-body, sans-serif); background: var(--color-background, #f8f7f4); min-height: 100%; }

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  height: 56px;
  border-bottom: 1px solid var(--color-border, #e8e4df);
  background: var(--color-surface, #fff);
}

.logo {
  font-family: var(--font-heading, Georgia, serif);
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.navLinks { display: flex; gap: 24px; }

.navLink {
  font-size: 13px;
  color: var(--color-on-surface-subtle, #666);
  cursor: pointer;
}

.main { max-width: 800px; margin: 0 auto; padding: 48px 40px; }

.featured {
  margin-bottom: 48px;
  padding-bottom: 40px;
  border-bottom: 1px solid var(--color-border, #e8e4df);
}

.featuredTag {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--color-interactive, #e8543a);
  margin-bottom: 10px;
}

.featuredTitle {
  font-family: var(--font-heading, Georgia, serif);
  font-size: var(--font-size-h1, 40px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--color-on-surface, #111);
  margin-bottom: 14px;
}

.featuredExcerpt {
  font-size: 16px;
  line-height: 1.65;
  color: var(--color-on-surface-subtle, #555);
  margin-bottom: 12px;
}

.meta { font-size: 12px; color: var(--color-on-surface-subtle, #aaa); }

.postGrid { display: flex; flex-direction: column; gap: 20px; }

.postCard {
  padding: 20px;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 8px;
  cursor: pointer;
  transition: box-shadow 0.15s;
}

.postCard:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }

.postTag {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-interactive, #e8543a);
  margin-bottom: 6px;
}

.postTitle {
  font-family: var(--font-heading, Georgia, serif);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.01em;
  color: var(--color-on-surface, #111);
  margin-bottom: 6px;
}

.postMeta { font-size: 11px; color: var(--color-on-surface-subtle, #aaa); }
```

- [ ] **Step 4: Commit**

```bash
git add v3/src/features/preview/
git commit -m "feat(preview): template switcher wired + Dashboard + Blog templates"
```

---

## Task 2: System view template

The System view is the "screenshot-worthy artifact" — a scrollable design system document.

**Files:**
- Create: `v3/src/features/preview/templates/SystemTemplate/SystemTemplate.tsx`
- Create: `v3/src/features/preview/templates/SystemTemplate/SystemTemplate.module.css`

- [ ] **Step 1: Implement `SystemTemplate.module.css`**

```css
/* System view — beautiful design system document */
.doc {
  font-family: var(--font-body, sans-serif);
  background: var(--color-background, #f8f7f4);
  color: var(--color-on-surface, #111);
  padding: 32px 40px;
  max-width: 780px;
  margin: 0 auto;
}

/* Header */
.header { margin-bottom: 40px; }

.systemLabel {
  font-size: 9px;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--color-on-surface-subtle, #bbb);
  margin-bottom: 6px;
  font-family: sans-serif;
}

.wordmark {
  font-family: var(--font-heading, Georgia, serif);
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1;
  color: var(--color-on-surface, #111);
}

.systemMeta {
  font-size: 10px;
  color: var(--color-on-surface-subtle, #aaa);
  margin-top: 4px;
  font-family: sans-serif;
}

/* Section headers */
.sectionLabel {
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-on-surface-subtle, #bbb);
  margin-bottom: 16px;
  font-family: sans-serif;
}

/* Dividers between sections */
.section {
  margin-bottom: 40px;
  padding-bottom: 40px;
  border-bottom: 1px solid var(--color-border, #e8e4df);
}

.section:last-child { border-bottom: none; }

/* COLOR SECTION */
.brandScaleRow {
  margin-bottom: 18px;
}

.colorRowHeader {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 6px;
}

.colorRoleName {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-on-surface, #333);
  font-family: sans-serif;
}

.colorMeta {
  font-size: 9px;
  color: var(--color-on-surface-subtle, #aaa);
  font-family: monospace;
}

.brandScale {
  display: flex;
  gap: 3px;
  border-radius: 8px;
  overflow: hidden;
  height: 44px;
}

.brandScaleCell {
  flex: 1;
  position: relative;
  display: flex;
  align-items: flex-end;
  padding: 4px;
}

.brandScaleStep {
  font-size: 7px;
  color: rgba(255,255,255,0.5);
  font-family: monospace;
}

.brandScaleStepDark {
  color: rgba(0,0,0,0.3);
}

/* Secondary/accent compact scales */
.compactScaleRow {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.compactScaleBlock { flex: 1; }

.compactScaleLabel {
  font-size: 9px;
  color: var(--color-on-surface-subtle, #aaa);
  margin-bottom: 4px;
  font-family: sans-serif;
}

.compactScale {
  display: flex;
  gap: 2px;
  border-radius: 4px;
  overflow: hidden;
  height: 20px;
}

.compactScaleCell { flex: 1; }

/* Semantic roles swatches */
.semanticGrid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  margin-bottom: 16px;
}

.semanticSwatch {
  border-radius: 5px;
  height: 32px;
  border: 1px solid rgba(0,0,0,0.06);
  margin-bottom: 3px;
}

.semanticLabel {
  font-size: 7px;
  color: var(--color-on-surface-subtle, #aaa);
  font-family: sans-serif;
  text-align: center;
  line-height: 1.2;
}

/* State colors */
.stateRow {
  display: flex;
  gap: 8px;
}

.stateCard {
  flex: 1;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 6px;
  padding: 8px;
}

.statePair {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
}

.stateSwatch {
  width: 14px;
  height: 14px;
  border-radius: 3px;
}

.stateLabel {
  font-size: 8px;
  color: var(--color-on-surface-subtle, #aaa);
  font-family: sans-serif;
}

/* TYPOGRAPHY SECTION */
.fontSpecimen { margin-bottom: 16px; }

.fontHeadingName {
  font-family: var(--font-heading, Georgia, serif);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: var(--color-on-surface-subtle, #888);
  margin-bottom: 8px;
  text-transform: uppercase;
  font-style: normal;
}

.displaySpec {
  font-family: var(--font-heading, Georgia, serif);
  font-size: var(--font-size-display, 62px);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.04em;
  color: var(--color-on-surface, #111);
  margin-bottom: 0;
  border-left: 4px solid var(--color-interactive, #e8543a);
  padding-left: 14px;
  /* Clamp so it doesn't overflow */
  font-size: clamp(28px, 6vw, var(--font-size-display, 62px));
}

.h1Spec {
  font-family: var(--font-heading, Georgia, serif);
  font-size: clamp(20px, 4vw, var(--font-size-h1, 44px));
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-on-surface, #111);
  line-height: 1.1;
  margin-bottom: 2px;
}

.h2Spec {
  font-family: var(--font-heading, Georgia, serif);
  font-size: clamp(16px, 3vw, var(--font-size-h2, 31px));
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-on-surface, #222);
  line-height: 1.15;
  margin-bottom: 2px;
}

.h3Spec {
  font-family: var(--font-heading, Georgia, serif);
  font-size: clamp(14px, 2vw, var(--font-size-h3, 22px));
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-on-surface, #333);
  line-height: 1.25;
  margin-bottom: 6px;
}

.bodySpec {
  font-family: var(--font-body, sans-serif);
  font-size: 14px;
  line-height: 1.65;
  color: var(--color-on-surface-subtle, #555);
  max-width: 480px;
  margin-bottom: 14px;
}

.charsetBlock {
  background: var(--color-surface, #fff);
  border-radius: 8px;
  padding: 14px 16px;
  border: 1px solid var(--color-border, #e8e4df);
  margin-bottom: 12px;
}

.charsetLabel {
  font-size: 8px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-on-surface-subtle, #bbb);
  margin-bottom: 8px;
  font-family: sans-serif;
}

.charset {
  font-size: 14px;
  line-height: 1.75;
  letter-spacing: 0.03em;
  color: var(--color-on-surface, #333);
  word-break: break-all;
}

.charsetMuted { color: var(--color-on-surface-subtle, #bbb); }

.weightRow {
  margin-top: 8px;
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  font-size: 13px;
  color: var(--color-on-surface, #333);
}

/* DATA VIZ SECTION */
.dataVizPalette {
  display: flex;
  gap: 5px;
  height: 44px;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 10px;
}

.dataVizCell { flex: 1; border-radius: 0; }

.miniChart {
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 6px;
  padding: 10px 12px;
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 64px;
}

.miniBar {
  flex: 1;
  border-radius: 2px 2px 0 0;
}
```

- [ ] **Step 2: Implement `SystemTemplate.tsx`**

```typescript
import { useColor, useTypography } from '@/store'
import { makeShadeScale, getContrastColor } from '@/core/color/scales'
import { deriveBrandRoles, deriveStateMoodRoles, deriveNeutralRoles } from '@/core/color/semantic'
import { generateDataVizPalette } from '@/core/color/dataViz'
import { SHADE_STEPS } from '@/core/color/types'
import styles from './SystemTemplate.module.css'

const ROLE_LABELS: Record<string, string> = {
  brand: 'Brand', secondary: 'Secondary', accentA: 'Accent A', accentB: 'Accent B',
}

const TODAY = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

const DEMO_HEIGHTS = [80, 55, 70, 40, 90, 60, 45, 75]

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const DIGITS = '0123456789'
const SPECIAL = '! @ # $ % & * ( ) - + = [ ] | ; : \' " , . / < > ? `'
const DIACRITICS = 'À Á Â Ã Ä Å Æ Ç È É Ê Ë'

export function SystemTemplate() {
  const { slots, dataVizN, activeModel } = useColor()
  const { pairing, scale } = useTypography()

  const brandSlot = slots.find(s => s.role === 'brand') ?? slots[0]
  const brandHex = brandSlot?.hex ?? '#888888'
  const brandScale = makeShadeScale(brandHex)
  const brandRoles = deriveBrandRoles(brandScale)
  const neutralRoles = deriveNeutralRoles(brandScale)
  const stateMoodRoles = deriveStateMoodRoles(brandHex)
  const dvPalette = generateDataVizPalette(brandHex, Math.min(dataVizN, 8))

  const otherSlots = slots.filter(s => s.role !== 'brand')

  const KEY_SEMANTIC = ['interactive', 'interactive-subtle', 'background', 'on-surface', 'border'] as const

  const STATE_PREFIXES = ['error', 'warning', 'success', 'info'] as const

  function isLightHex(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return (r * 299 + g * 587 + b * 114) / 1000 > 150
  }

  return (
    <div className={styles.doc}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.systemLabel}>Design System</div>
        <div className={styles.wordmark}>palette.</div>
        <div className={styles.systemMeta}>
          Generated {TODAY}
          {activeModel ? ` · ${activeModel} harmony` : ''}
          {pairing ? ` · ${pairing.heading} + ${pairing.body}` : ''}
        </div>
      </div>

      {/* COLORS */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Colors</div>

        {/* Brand scale — full width */}
        <div className={styles.brandScaleRow}>
          <div className={styles.colorRowHeader}>
            <span className={styles.colorRoleName}>Brand</span>
            <span className={styles.colorMeta}>{brandHex.toUpperCase()}</span>
          </div>
          <div className={styles.brandScale}>
            {SHADE_STEPS.map(step => {
              const hex = brandScale[step]
              const isLight = isLightHex(hex)
              return (
                <div key={step} className={styles.brandScaleCell} style={{ background: hex }}>
                  {(step === 50 || step === 500 || step === 950) && (
                    <span className={`${styles.brandScaleStep} ${isLight ? styles.brandScaleStepDark : ''}`}>
                      {step}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Secondary + accent compact rows */}
        {otherSlots.length > 0 && (
          <div className={styles.compactScaleRow}>
            {otherSlots.map(slot => {
              const slotScale = makeShadeScale(slot.hex)
              return (
                <div key={slot.id} className={styles.compactScaleBlock}>
                  <div className={styles.compactScaleLabel}>{ROLE_LABELS[slot.role] ?? slot.role}</div>
                  <div className={styles.compactScale}>
                    {SHADE_STEPS.map(step => (
                      <div key={step} className={styles.compactScaleCell} style={{ background: slotScale[step] }} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Key semantic swatches */}
        <div className={styles.semanticGrid}>
          {KEY_SEMANTIC.map(role => {
            const hex = brandRoles[role] ?? neutralRoles[role] ?? '#888'
            return (
              <div key={role} style={{ textAlign: 'center' }}>
                <div
                  className={styles.semanticSwatch}
                  style={{ background: hex }}
                  title={role}
                />
                <div className={styles.semanticLabel}>{role}</div>
              </div>
            )
          })}
        </div>

        {/* State colors */}
        <div className={styles.stateRow}>
          {STATE_PREFIXES.map(prefix => (
            <div key={prefix} className={styles.stateCard}>
              <div className={styles.statePair}>
                <div className={styles.stateSwatch} style={{ background: stateMoodRoles[prefix] ?? '#888' }} />
                <div className={styles.stateSwatch} style={{ background: stateMoodRoles[`${prefix}-container`] ?? '#eee' }} />
              </div>
              <div className={styles.stateLabel}>{prefix}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TYPOGRAPHY */}
      {pairing && (
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Typography</div>

          <div className={styles.fontSpecimen}>
            <div className={styles.fontHeadingName}>{pairing.heading} — Heading</div>
            <div className={styles.displaySpec}>Display — 72px / 800</div>
            <div className={styles.h1Spec}>Heading 1 — The quick brown fox jumps</div>
            <div className={styles.h2Spec}>Heading 2 — over the lazy dog. Pack my box</div>
            <div className={styles.h3Spec}>Heading 3 — with five dozen liquor jugs.</div>
          </div>

          <div className={styles.bodySpec} style={{ fontFamily: `"${pairing.body}", sans-serif` }}>
            Body 16px — The five boxing wizards jump quickly. How vexingly quick daft zebras jump.
            The jay, pig, fox, zebra and my wolves quack.
          </div>

          {/* Character sets */}
          <div className={styles.charsetBlock}>
            <div className={styles.charsetLabel}>Character Set — {pairing.heading}</div>
            <div className={styles.charset} style={{ fontFamily: `"${pairing.heading}", serif` }}>
              <div>{UPPERCASE}</div>
              <div>{LOWERCASE}</div>
              <div>{DIGITS}</div>
              <div className={styles.charsetMuted}>{SPECIAL}</div>
              <div className={styles.charsetMuted}>{DIACRITICS}</div>
            </div>
            <div className={styles.weightRow} style={{ fontFamily: `"${pairing.heading}", serif` }}>
              {[400, 500, 600, 700, 800].map(w => (
                <span key={w} style={{ fontWeight: w }}>Weight {w}</span>
              ))}
            </div>
          </div>

          {pairing.body !== pairing.heading && (
            <div className={styles.charsetBlock}>
              <div className={styles.charsetLabel}>Character Set — {pairing.body} (Body)</div>
              <div className={styles.charset} style={{ fontFamily: `"${pairing.body}", sans-serif` }}>
                <div>{UPPERCASE} · {LOWERCASE} · {DIGITS}</div>
                <div className={styles.charsetMuted}>{SPECIAL}</div>
              </div>
              <div className={styles.weightRow} style={{ fontFamily: `"${pairing.body}", sans-serif` }}>
                {[400, 500, 600, 700].map(w => (
                  <span key={w} style={{ fontWeight: w }}>Weight {w}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* DATA VIZ */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Data Visualization · {dvPalette.length}-color categorical palette</div>
        <div className={styles.dataVizPalette}>
          {dvPalette.map((hex, i) => (
            <div key={i} className={styles.dataVizCell} style={{ background: hex }} title={hex} />
          ))}
        </div>
        <div className={styles.miniChart}>
          {dvPalette.map((hex, i) => (
            <div
              key={i}
              className={styles.miniBar}
              style={{ background: hex, height: `${DEMO_HEIGHTS[i % DEMO_HEIGHTS.length]}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add v3/src/features/preview/templates/SystemTemplate/
git commit -m "feat(system-view): screenshot-worthy design system document — colors, typography, data viz"
```

---

## Task 3: Showcase tab

**Files:**
- Create: `v3/src/features/detail/tabs/ShowcaseTab/ShowcaseTab.tsx`
- Create: `v3/src/features/detail/tabs/ShowcaseTab/ShowcaseTab.module.css`
- Modify: `v3/src/features/detail/DetailMode.tsx`

Per spec: The Showcase tab's left panel has only: template switcher, theme toggle, full-screen button, copy share link. No editable token controls.

- [ ] **Step 1: Implement `ShowcaseTab.module.css`**

```css
.panel { display: flex; flex-direction: column; gap: 20px; }

.sectionTitle {
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-on-surface-subtle, #aaa);
  margin-bottom: 10px;
  font-family: sans-serif;
}

.templateGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.templateBtn {
  padding: 12px;
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 8px;
  background: var(--color-surface, #fff);
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  font-family: sans-serif;
}

.templateBtn:hover {
  border-color: var(--color-interactive, #e8543a);
}

.templateBtn.active {
  border-color: var(--color-interactive, #e8543a);
  background: var(--color-interactive-subtle, #fde8e3);
}

.templateName {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-on-surface, #333);
  display: block;
}

.templateDesc {
  font-size: 10px;
  color: var(--color-on-surface-subtle, #888);
  margin-top: 2px;
  display: block;
}

.actions { display: flex; flex-direction: column; gap: 8px; }

.actionBtn {
  height: 36px;
  padding: 0 14px;
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 6px;
  background: var(--color-surface, #fff);
  cursor: pointer;
  font-size: 12px;
  font-family: sans-serif;
  color: var(--color-on-surface, #333);
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.15s;
}

.actionBtn:hover { border-color: var(--color-interactive, #e8543a); }

.actionBtnPrimary {
  background: var(--color-interactive, #e8543a);
  color: var(--color-on-interactive, #fff);
  border-color: transparent;
}

.actionBtnPrimary:hover { opacity: 0.85; }

.copied {
  color: #15803d;
  font-size: 10px;
  font-family: sans-serif;
  margin-top: 4px;
}
```

- [ ] **Step 2: Implement `ShowcaseTab.tsx`**

```typescript
import { useState } from 'react'
import { useUI, useUIActions, useColor, useTypography } from '@/store'
import { encodeShare } from '@/core/share/encode'
import type { ShareSnapshot } from '@/core/share/types'
import styles from './ShowcaseTab.module.css'
import type { ShowcaseTemplate } from '@/store/ui'

const TEMPLATES: { id: ShowcaseTemplate; name: string; desc: string }[] = [
  { id: 'landing', name: 'Landing', desc: 'SaaS homepage' },
  { id: 'dashboard', name: 'Dashboard', desc: 'Admin panel' },
  { id: 'blog', name: 'Blog', desc: 'Editorial layout' },
  { id: 'system', name: 'System', desc: 'Design system doc' },
]

export function ShowcaseTab() {
  const { showcaseTemplate, theme, mode, activeTab } = useUI()
  const { setShowcaseTemplate, toggleTheme } = useUIActions()
  const { slots, activeModel, dataVizN } = useColor()
  const { pairing, scale, locks } = useTypography()
  const [copied, setCopied] = useState(false)

  const copyShareLink = async () => {
    if (!pairing || !scale) return
    const snapshot: ShareSnapshot = {
      v: 3,
      colors: slots,
      harmonyModel: activeModel,
      pairing,
      typographyLocks: locks,
      scaleRatio: scale._ratio,
      mode,
      activeTab: activeTab,
      theme,
    }
    const hash = await encodeShare(snapshot)
    const url = `${window.location.origin}${window.location.pathname}${hash}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  return (
    <div className={styles.panel}>
      <div>
        <div className={styles.sectionTitle}>Template</div>
        <div className={styles.templateGrid}>
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              className={`${styles.templateBtn} ${showcaseTemplate === t.id ? styles.active : ''}`}
              onClick={() => setShowcaseTemplate(t.id)}
              aria-pressed={showcaseTemplate === t.id}
            >
              <span className={styles.templateName}>{t.name}</span>
              <span className={styles.templateDesc}>{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className={styles.sectionTitle}>Actions</div>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={toggleTheme}>
            {theme === 'light' ? '◐' : '○'} {theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          </button>
          <button className={styles.actionBtn} onClick={toggleFullscreen}>
            ⛶ Fullscreen preview
          </button>
          <button className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={copyShareLink}>
            ↗ Copy share link
          </button>
          {copied && <div className={styles.copied}>✓ Link copied to clipboard</div>}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Add Showcase to DetailMode.tsx**

In `DetailMode.tsx`, update the `renderTab` switch:
```typescript
import { ShowcaseTab } from './tabs/ShowcaseTab/ShowcaseTab'

// In renderTab():
case 'showcase': return <ShowcaseTab />
```

Also update `PHASE_1_IMPLEMENTED` to include `'showcase'`.

- [ ] **Step 4: Commit**

```bash
git add v3/src/features/detail/tabs/ShowcaseTab/ v3/src/features/detail/DetailMode.tsx
git commit -m "feat(showcase-tab): template switcher, share link copy, fullscreen"
```

---

## Task 4: Export slide-up panel

The Export ↓ button in the header opens a compact slide-up panel. It shows format tabs and a live code preview with a Copy CTA. Accessible from both generator and detail mode.

**Files:**
- Create: `v3/src/features/export/ExportPanel.tsx`
- Create: `v3/src/features/export/ExportPanel.module.css`
- Modify: `v3/src/App.tsx`

- [ ] **Step 1: Implement `ExportPanel.module.css`**

```css
/* Overlay + slide-up panel */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 200;
  display: flex;
  align-items: flex-end;
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.panel {
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
  background: var(--color-surface, #fff);
  border-radius: 12px 12px 0 0;
  box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.12);
  animation: slideUp 0.2s ease;
  max-height: 75vh;
  display: flex;
  flex-direction: column;
}

@keyframes slideUp {
  from { transform: translateY(40px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.panelHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 0;
  flex-shrink: 0;
}

.panelTitle {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-on-surface, #111);
  font-family: sans-serif;
}

.closeBtn {
  width: 28px;
  height: 28px;
  background: none;
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: var(--color-on-surface-subtle, #888);
  display: flex;
  align-items: center;
  justify-content: center;
}

.closeBtn:hover { background: var(--color-interactive-subtle, #f5f3f0); }

.formatTabs {
  display: flex;
  gap: 4px;
  padding: 12px 20px 0;
  border-bottom: 1px solid var(--color-border, #e8e4df);
  flex-shrink: 0;
}

.formatTab {
  padding: 6px 12px;
  border: none;
  background: none;
  border-bottom: 2px solid transparent;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  color: var(--color-on-surface-subtle, #888);
  font-family: sans-serif;
  margin-bottom: -1px;
  transition: color 0.15s;
}

.formatTab.active {
  color: var(--color-interactive, #e8543a);
  border-bottom-color: var(--color-interactive, #e8543a);
}

.codeWrapper {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  position: relative;
}

.code {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 11px;
  line-height: 1.6;
  color: var(--color-on-surface, #333);
  white-space: pre;
  background: var(--color-background, #f8f7f4);
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 6px;
  padding: 12px 14px;
  overflow-x: auto;
}

.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid var(--color-border, #e8e4df);
  flex-shrink: 0;
}

.meta {
  font-size: 11px;
  color: var(--color-on-surface-subtle, #aaa);
  font-family: sans-serif;
}

.footerActions { display: flex; gap: 8px; }

.copyBtn {
  height: 36px;
  padding: 0 20px;
  background: var(--color-interactive, #e8543a);
  color: var(--color-on-interactive, #fff);
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: sans-serif;
  transition: opacity 0.15s;
}

.copyBtn:hover { opacity: 0.85; }
.copyBtn.copied { background: #15803d; }

.downloadBtn {
  height: 36px;
  padding: 0 14px;
  background: none;
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  color: var(--color-on-surface, #333);
  font-family: sans-serif;
}

@media (max-width: 768px) {
  .panel { border-radius: 16px 16px 0 0; max-height: 85vh; }
}
```

- [ ] **Step 2: Implement `ExportPanel.tsx`**

```typescript
import { useEffect, useRef, useState } from 'react'
import { useUI, useUIActions, useColor, useTypography } from '@/store'
import { buildTokenMap } from '@/store/derived'
import { formatTokens } from '@/core/export'
import type { ExportFormat } from '@/core/export/types'
import styles from './ExportPanel.module.css'

const FORMATS: { id: ExportFormat; label: string }[] = [
  { id: 'css', label: 'CSS' },
  { id: 'tailwind-v3', label: 'Tailwind v3' },
  { id: 'tailwind-v4', label: 'Tailwind v4' },
  { id: 'w3c', label: 'W3C JSON' },
  { id: 'scss', label: 'SCSS' },
]

const FILE_EXT: Record<ExportFormat, string> = {
  'css': 'tokens.css',
  'tailwind-v3': 'tailwind.config.js',
  'tailwind-v4': 'tokens.css',
  'w3c': 'tokens.json',
  'scss': 'tokens.scss',
}

export function ExportPanel() {
  const { exportPanelOpen, activeExportFormat } = useUI()
  const { closeExportPanel, setExportFormat } = useUIActions()
  const { slots, dataVizN } = useColor()
  const { pairing, scale } = useTypography()
  const [copied, setCopied] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Build token map from current state
  const tokens = buildTokenMap(slots, scale, pairing, dataVizN)
  const code = formatTokens(activeExportFormat, tokens)

  // Close on Escape
  useEffect(() => {
    if (!exportPanelOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeExportPanel()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [exportPanelOpen, closeExportPanel])

  if (!exportPanelOpen) return null

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = FILE_EXT[activeExportFormat]
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) closeExportPanel()
  }

  const lineCount = code.split('\n').length
  const charCount = code.length

  return (
    <div className={styles.overlay} ref={overlayRef} onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label="Export tokens">
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>Export tokens</span>
          <button className={styles.closeBtn} onClick={closeExportPanel} aria-label="Close export panel">×</button>
        </div>

        <div className={styles.formatTabs} role="tablist">
          {FORMATS.map(f => (
            <button
              key={f.id}
              className={`${styles.formatTab} ${activeExportFormat === f.id ? styles.active : ''}`}
              onClick={() => setExportFormat(f.id)}
              role="tab"
              aria-selected={activeExportFormat === f.id}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className={styles.codeWrapper} role="tabpanel">
          <pre className={styles.code}>{code}</pre>
        </div>

        <div className={styles.footer}>
          <span className={styles.meta}>{lineCount} lines · {charCount} chars · {FILE_EXT[activeExportFormat]}</span>
          <div className={styles.footerActions}>
            <button className={styles.downloadBtn} onClick={handleDownload}>
              Download
            </button>
            <button
              className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
              onClick={handleCopy}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Mount `ExportPanel` in `App.tsx`**

```typescript
import { ExportPanel } from './features/export/ExportPanel'

// In App JSX — add after the SplitPane:
<ExportPanel />
```

The `ExportPanel` renders `null` when `exportPanelOpen` is false, so it's always mounted but invisible.

- [ ] **Step 4: Verify export panel**

```bash
cd v3 && npm run dev
```

Test:
1. Click "Export ↓" in header — panel slides up
2. Default tab is CSS — code block shows `--color-*` vars
3. Switch to Tailwind v3 — code updates
4. "Copy" button copies to clipboard
5. "Download" downloads a file
6. Click overlay / press Escape — panel closes
7. × button closes
8. Mobile: panel is bottom sheet style

- [ ] **Step 5: Commit**

```bash
git add v3/src/features/export/ v3/src/App.tsx
git commit -m "feat(export-panel): slide-up overlay — CSS/Tailwind/W3C/SCSS, copy + download"
```

---

## Task 5: Export tab (detail mode)

**Files:**
- Create: `v3/src/features/detail/tabs/ExportTab/ExportTab.tsx`
- Create: `v3/src/features/detail/tabs/ExportTab/ExportTab.module.css`
- Modify: `v3/src/features/detail/DetailMode.tsx`

- [ ] **Step 1: Implement `ExportTab.tsx`**

The Export tab has the same core functionality as the slide-up panel but with more controls: naming convention, partial layer selection.

`ExportTab.module.css`:
```css
.tab { display: flex; flex-direction: column; gap: 20px; }

.sectionTitle {
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-on-surface-subtle, #aaa);
  margin-bottom: 10px;
  font-family: sans-serif;
}

.formatGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.formatBtn {
  padding: 8px 12px;
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 6px;
  background: var(--color-surface, #fff);
  cursor: pointer;
  font-size: 11px;
  font-family: sans-serif;
  color: var(--color-on-surface, #333);
  text-align: left;
  transition: all 0.15s;
}

.formatBtn.active {
  border-color: var(--color-interactive, #e8543a);
  background: var(--color-interactive-subtle, #fde8e3);
  color: var(--color-interactive, #e8543a);
  font-weight: 600;
}

.optionRow {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  font-family: sans-serif;
  color: var(--color-on-surface, #333);
}

.optionRow select, .optionRow input {
  padding: 4px 8px;
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 5px;
  font-size: 12px;
  background: var(--color-surface, #fff);
  color: var(--color-on-surface, #111);
}

.layerChecks { display: flex; flex-direction: column; gap: 6px; }

.layerCheck {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-family: sans-serif;
  color: var(--color-on-surface, #333);
  cursor: pointer;
}

.code {
  font-family: 'SF Mono', monospace;
  font-size: 10px;
  line-height: 1.6;
  background: var(--color-background, #f8f7f4);
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 6px;
  padding: 12px;
  overflow-x: auto;
  max-height: 280px;
  overflow-y: auto;
  white-space: pre;
  color: var(--color-on-surface, #333);
}

.actions { display: flex; gap: 8px; }

.copyBtn {
  height: 36px;
  padding: 0 20px;
  background: var(--color-interactive, #e8543a);
  color: var(--color-on-interactive, #fff);
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: sans-serif;
}

.downloadBtn {
  height: 36px;
  padding: 0 14px;
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  background: none;
  color: var(--color-on-surface, #333);
  font-family: sans-serif;
}
```

`ExportTab.tsx`:
```typescript
import { useState } from 'react'
import { useUI, useUIActions, useColor, useTypography } from '@/store'
import { buildTokenMap } from '@/store/derived'
import { formatTokens } from '@/core/export'
import type { ExportFormat } from '@/core/export/types'
import styles from './ExportTab.module.css'

const FORMATS: { id: ExportFormat; label: string; desc: string }[] = [
  { id: 'css', label: 'CSS Custom Properties', desc: 'Drop into any project' },
  { id: 'tailwind-v3', label: 'Tailwind v3', desc: 'theme.extend config' },
  { id: 'tailwind-v4', label: 'Tailwind v4', desc: '@theme CSS syntax' },
  { id: 'w3c', label: 'W3C Design Tokens', desc: 'Figma / Style Dictionary' },
  { id: 'scss', label: 'SCSS Variables', desc: 'Legacy codebases' },
]

const FILE_EXT: Record<ExportFormat, string> = {
  'css': 'tokens.css',
  'tailwind-v3': 'tailwind.config.js',
  'tailwind-v4': 'tokens.css',
  'w3c': 'tokens.json',
  'scss': 'tokens.scss',
}

export function ExportTab() {
  const { activeExportFormat } = useUI()
  const { setExportFormat } = useUIActions()
  const { slots, dataVizN } = useColor()
  const { pairing, scale } = useTypography()
  const [prefix, setPrefix] = useState('')
  const [copied, setCopied] = useState(false)

  const tokens = buildTokenMap(slots, scale, pairing, dataVizN)
  const code = formatTokens(activeExportFormat, tokens, { prefix })

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = prefix ? `${prefix}${FILE_EXT[activeExportFormat]}` : FILE_EXT[activeExportFormat]
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={styles.tab}>
      <div>
        <div className={styles.sectionTitle}>Format</div>
        <div className={styles.formatGrid}>
          {FORMATS.map(f => (
            <button
              key={f.id}
              className={`${styles.formatBtn} ${activeExportFormat === f.id ? styles.active : ''}`}
              onClick={() => setExportFormat(f.id)}
              aria-pressed={activeExportFormat === f.id}
              title={f.desc}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className={styles.sectionTitle}>Options</div>
        <div className={styles.optionRow}>
          <label htmlFor="export-prefix">Prefix</label>
          <input
            id="export-prefix"
            value={prefix}
            onChange={e => setPrefix(e.target.value)}
            placeholder="e.g. ds-"
            style={{ width: 100 }}
            aria-label="Token prefix"
          />
        </div>
      </div>

      <div>
        <div className={styles.sectionTitle}>Preview</div>
        <pre className={styles.code}>{code}</pre>
      </div>

      <div className={styles.actions}>
        <button className={styles.copyBtn} onClick={handleCopy}>
          {copied ? '✓ Copied' : 'Copy to clipboard'}
        </button>
        <button className={styles.downloadBtn} onClick={handleDownload}>
          Download {FILE_EXT[activeExportFormat]}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add Export to DetailMode.tsx**

```typescript
import { ExportTab } from './tabs/ExportTab/ExportTab'

// In renderTab():
case 'export': return <ExportTab />
```

Update `PHASE_1_IMPLEMENTED` to include `'export'`.

- [ ] **Step 3: Commit**

```bash
git add v3/src/features/detail/tabs/ExportTab/ v3/src/features/detail/DetailMode.tsx
git commit -m "feat(export-tab): full export controls — prefix, all formats, copy + download"
```

---

## Task 6: URL sharing — decode on load

Phase 1A implemented `encodeShare` and `decodeShare`. The Showcase tab already calls `encodeShare`. Now wire the decode step so a shared URL loads the correct session state.

- [ ] **Step 1: Add `loadFromHash` function to share module**

Create `v3/src/core/share/loadFromHash.ts`:
```typescript
import { decodeShare } from './decode'
import type { ShareSnapshot } from './types'

/**
 * Attempt to load session state from the current URL hash.
 * Returns the snapshot if valid, null if no valid hash found.
 *
 * Called once on app startup. Silent failure — a bad hash just
 * opens the tool fresh (see spec §14 error handling).
 */
export async function loadFromHash(): Promise<ShareSnapshot | null> {
  const hash = window.location.hash
  if (!hash.startsWith('#v3/')) return null
  return decodeShare(hash)
}
```

- [ ] **Step 2: Apply snapshot to store on load**

In `App.tsx`, after the initial `generate()` call, check for a URL hash and restore state:

```typescript
import { loadFromHash } from './core/share/loadFromHash'
import { useStore } from './store'

// Inside App component, in the useEffect:
useEffect(() => {
  document.documentElement.classList.add('no-transitions')

  // Try loading from shared URL first
  loadFromHash().then(snapshot => {
    if (snapshot) {
      // Restore state from snapshot
      useStore.setState(prev => ({
        ...prev,
        color: {
          ...prev.color,
          slots: snapshot.colors,
          activeModel: snapshot.harmonyModel,
        },
        typography: {
          ...prev.typography,
          pairing: snapshot.pairing,
          scale: prev.typography.scale, // keep current scale — regenerate if needed
          locks: snapshot.typographyLocks,
        },
        ui: {
          ...prev.ui,
          theme: snapshot.theme,
          mode: snapshot.mode,
          activeTab: snapshot.activeTab as any ?? 'colors',
        },
      }))
      // Apply theme immediately
      document.documentElement.setAttribute('data-theme', snapshot.theme)
      // Generate typography scale for the restored ratio
      useStore.getState().typographyActions.generate()
    } else {
      // Fresh start — cold random generation
      useStore.getState().colorActions.generate()
      useStore.getState().typographyActions.generate()
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.classList.remove('no-transitions')
      })
    })
  })
}, [])
```

Note: `useStore.getState()` is the imperative Zustand accessor — use it in async contexts where hooks aren't available. Remove the `colorActions` and `typographyActions` destructuring from the `useEffect` deps since we now call via `getState()`.

- [ ] **Step 3: Clear hash after loading (optional UX)**

After successfully loading from hash, optionally clean the URL without a page reload:
```typescript
if (snapshot) {
  // ... restore state ...
  // Clean URL so sharing the current URL doesn't re-trigger stale state
  history.replaceState(null, '', window.location.pathname)
}
```

Note: Do NOT clean the URL — it should remain so the user can share the current URL. Only clean if the hash decode fails. Actually per spec, leave the URL as-is. Skip this step.

- [ ] **Step 4: Test URL sharing roundtrip**

```bash
cd v3 && npm run dev
```

1. Generate a palette — lock the brand color
2. Enter detail mode → Showcase tab → click "Copy share link"
3. Paste the URL in a new tab or incognito window
4. The locked brand color should be restored
5. Typography pairing should match
6. If mode was 'detail', detail mode should open

- [ ] **Step 5: Commit**

```bash
git add v3/src/core/share/ v3/src/App.tsx
git commit -m "feat(sharing): decode URL hash on load — restore session state from #v3/ share links"
```

---

## Task 7: Final Phase 1 integration test

- [ ] **Step 1: Full flow test**

1. Load fresh — 4 swatches, landing template
2. Press SPACE 10 times — each time different colors + typography
3. Lock brand — press SPACE — brand stays, harmony hint shows model name
4. Lock heading font — press SPACE — heading font stays, body changes
5. Add 2 color slots → 6 slots total
6. Remove an accent slot → 5 slots
7. Drag reorder — swatches reorder correctly
8. Enter Detail Mode → Colors tab — shade scales, semantic roles, contrast grid visible
9. Change N in data viz → palette updates
10. Typography tab — quick pick applies font pair, character set renders, APCA score shows
11. Showcase tab → System template — screenshot-worthy document visible
12. Export ↓ in header — slide-up opens, copy CSS, paste in editor — valid CSS vars
13. Export tab → download Tailwind v3 — valid JS config
14. Showcase → Copy share link → open in new tab → state restored

- [ ] **Step 2: Dark mode throughout**

1. Toggle dark mode in header
2. Generator panel — all swatches still readable
3. Landing template — dark theme applied
4. Detail mode Colors tab — dark token column visible
5. Export panel in dark mode
6. System view in dark mode

- [ ] **Step 3: Mobile (375px)**

1. Generator panel full width, Generate ✦ button visible
2. Preview → slides in, template visible
3. ← Back returns to generator
4. Detail mode: tabs scroll horizontally
5. Export panel: bottom sheet style

- [ ] **Step 4: Type check and test**

```bash
cd v3 && npx tsc --noEmit && npm test
```

All type errors: zero. All tests: passing.

- [ ] **Step 5: Final commit and tag**

```bash
git add -A
git commit -m "feat(1E): showcase + export + sharing — Phase 1 complete"
git tag v3-phase1
```

---

## Phase 1 complete — what's next

After Phase 1, the full core loop is shippable:
- Generator (7 harmony models, lock/unlock, typography)
- Live preview (landing template, dark mode, mobile)
- Detail mode (Colors + Typography tabs, Showcase, Export)
- URL sharing
- Export in 5 formats

**Phase 2** adds Spacing and Effects tabs — all pure detail mode additions with no changes to the existing generator or core engine.

**Phase 3** adds the Components tab with icon set selection — the bridge between abstract tokens and real UI.

**Phase 4** enables the "✦ vibe" chip — keyword/mood-based generation seed. The UI chip is already rendered (disabled) in the generator footer. Phase 4 only needs to wire it up.
