# Phase 1D — Detail Mode: Colors & Typography Tabs

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Detail Mode shell (tab bar, back link, mode transition) and the first two tabs — Colors and Typography. By end of 1D, users can enter detail mode, explore the full shade scale per color slot, see semantic roles with auto/override badges, see state/mood colors, browse data viz palette, contrast grid, and the full typography tab with font browser, character set, and APCA readability score.

**Architecture:** Detail mode replaces the left (generator) panel. The right panel stays as the live preview but gains a template switcher header (implemented in 1E). Detail mode tabs are completely independent components — each reads from a named store slice and writes only to that slice. The `ui.mode` and `ui.activeTab` state values control routing.

**Prerequisites:** Phases 1A, 1B, 1C complete. Store slices available. CSS vars on `:root`.

---

## File Map

```
v3/src/features/detail/
├── DetailMode.tsx                        # Shell — tab bar + back link + tab router
├── DetailMode.module.css
├── tabs/
│   ├── ColorsTab/
│   │   ├── ColorsTab.tsx                 # Tab root — assembles all color sections
│   │   ├── ColorsTab.module.css
│   │   ├── ShadeScaleSection.tsx         # Per-slot shade scale rows
│   │   ├── ShadeScaleSection.module.css
│   │   ├── SemanticRolesSection.tsx      # Brand-derived + state/mood swatches
│   │   ├── SemanticRolesSection.module.css
│   │   ├── ContrastGrid.tsx              # WCAG AA/AAA matrix
│   │   ├── ContrastGrid.module.css
│   │   ├── DataVizSection.tsx            # Categorical palette + mini chart
│   │   └── DataVizSection.module.css
│   └── TypographyTab/
│       ├── TypographyTab.tsx             # Tab root
│       ├── TypographyTab.module.css
│       ├── FontBrowser.tsx               # Full browser with search/filter + quick picks
│       ├── FontBrowser.module.css
│       ├── FontBrowserGrid.tsx           # IntersectionObserver grid of font cells
│       ├── FontBrowserGrid.module.css
│       ├── ScaleEditor.tsx               # Per-step size/weight/lh/ls controls
│       ├── ScaleEditor.module.css
│       ├── CharacterSet.tsx              # Full A–Z/0–9/punctuation/diacritics display
│       └── CharacterSet.module.css
```

---

## Task 1: Detail mode shell

**Files:**
- Create: `v3/src/features/detail/DetailMode.tsx`
- Create: `v3/src/features/detail/DetailMode.module.css`
- Modify: `v3/src/App.tsx`

- [ ] **Step 1: Implement `DetailMode.module.css`**

```css
.shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-background, #f8f7f4);
}

.topBar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  height: 48px;
  border-bottom: 1px solid var(--color-border, #e8e4df);
  background: var(--color-surface, #fff);
  flex-shrink: 0;
}

.backLink {
  background: none;
  border: none;
  font-size: 12px;
  color: var(--color-on-surface-subtle, #777);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  transition: color 0.15s;
}

.backLink:hover { color: var(--color-on-surface, #111); }

.divider {
  width: 1px;
  height: 16px;
  background: var(--color-border, #e8e4df);
}

.tabs {
  display: flex;
  gap: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.tabs::-webkit-scrollbar { display: none; }

.tab {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 0 14px;
  height: 46px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-on-surface-subtle, #888);
  cursor: pointer;
  white-space: nowrap;
  letter-spacing: 0.01em;
  transition: color 0.15s, border-color 0.15s;
  font-family: sans-serif;
}

.tab:hover { color: var(--color-on-surface, #333); }

.tab.active {
  color: var(--color-interactive, #e8543a);
  border-bottom-color: var(--color-interactive, #e8543a);
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
}

/* Phase 2+ tab placeholders */
.comingSoon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--color-on-surface-subtle, #aaa);
  font-size: 14px;
  font-family: sans-serif;
}
```

- [ ] **Step 2: Implement `DetailMode.tsx`**

```typescript
import styles from './DetailMode.module.css'
import { useUI, useUIActions } from '@/store'
import type { DetailTab } from '@/store/ui'
import { ColorsTab } from './tabs/ColorsTab/ColorsTab'
import { TypographyTab } from './tabs/TypographyTab/TypographyTab'

const PHASE_1_TABS: { id: DetailTab; label: string }[] = [
  { id: 'colors', label: 'Colors' },
  { id: 'typography', label: 'Typography' },
  { id: 'spacing', label: 'Spacing' },
  { id: 'effects', label: 'Effects' },
  { id: 'components', label: 'Components' },
  { id: 'showcase', label: 'Showcase' },
  { id: 'export', label: 'Export' },
]

const PHASE_1_IMPLEMENTED: DetailTab[] = ['colors', 'typography', 'showcase', 'export']

export function DetailMode() {
  const { activeTab } = useUI()
  const { setMode, setActiveTab } = useUIActions()

  const renderTab = () => {
    switch (activeTab) {
      case 'colors': return <ColorsTab />
      case 'typography': return <TypographyTab />
      default:
        return (
          <div className={styles.comingSoon}>
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} tab — coming in Phase 2
          </div>
        )
    }
  }

  return (
    <div className={styles.shell}>
      <div className={styles.topBar}>
        <button
          className={styles.backLink}
          onClick={() => setMode('generator')}
          aria-label="Back to generator"
        >
          ← Generator
        </button>
        <div className={styles.divider} />
        <nav className={styles.tabs} aria-label="Detail mode tabs">
          {PHASE_1_TABS.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
              aria-selected={activeTab === tab.id}
              aria-label={
                PHASE_1_IMPLEMENTED.includes(tab.id)
                  ? tab.label
                  : `${tab.label} (coming soon)`
              }
            >
              {tab.label}
              {!PHASE_1_IMPLEMENTED.includes(tab.id) && (
                <span style={{ opacity: 0.4, fontSize: 9, marginLeft: 3 }}>2+</span>
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className={styles.content}>
        {renderTab()}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Wire detail mode into `App.tsx`**

In `App.tsx`, the left panel should render `GeneratorPanel` or `DetailMode` based on `ui.mode`:

```typescript
import { useUI } from './store'
import { GeneratorPanel } from './features/generator/GeneratorPanel'
import { DetailMode } from './features/detail/DetailMode'

// Inside App component:
const { mode } = useUI()
const leftPanel = mode === 'detail' ? <DetailMode /> : <GeneratorPanel />

// In JSX:
<SplitPane left={leftPanel} right={<LivePreview />} />
```

- [ ] **Step 4: Verify transition**

```bash
cd v3 && npm run dev
```

Click "Detail Mode →" — left panel shows tab bar. Click "← Generator" — returns to swatches. Tabs are clickable. Colors and Typography show content (even if just stubs for now); others show "coming in Phase 2".

- [ ] **Step 5: Commit**

```bash
git add v3/src/features/detail/ v3/src/App.tsx
git commit -m "feat(detail): detail mode shell — tab bar, back link, mode transition"
```

---

## Task 2: Colors tab — shade scale section

**Files:**
- Create: `v3/src/features/detail/tabs/ColorsTab/ShadeScaleSection.tsx`
- Create: `v3/src/features/detail/tabs/ColorsTab/ShadeScaleSection.module.css`

Each color slot gets a full 9-step shade scale row with: role label, source hex + OKLCH display, and 9 clickable swatches with hex values shown on hover.

- [ ] **Step 1: Implement `ShadeScaleSection.module.css`**

```css
.section { margin-bottom: 28px; }

.sectionTitle {
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-on-surface-subtle, #aaa);
  margin-bottom: 14px;
  font-family: sans-serif;
}

.colorRow {
  margin-bottom: 16px;
}

.colorHeader {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 8px;
}

.roleName {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-on-surface, #222);
  font-family: sans-serif;
}

.colorMeta {
  font-size: 10px;
  color: var(--color-on-surface-subtle, #888);
  font-family: monospace;
}

.scaleRow {
  display: flex;
  gap: 3px;
  border-radius: 6px;
  overflow: hidden;
  height: 40px;
}

.scaleCell {
  flex: 1;
  position: relative;
  cursor: pointer;
  transition: flex 0.15s;
}

.scaleCell:hover { flex: 1.6; }

.scaleCellLabel {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 4px;
  opacity: 0;
  transition: opacity 0.15s;
}

.scaleCell:hover .scaleCellLabel { opacity: 1; }
.scaleCell:first-child .scaleCellLabel,
.scaleCell:last-child .scaleCellLabel { opacity: 0.5; }

.scaleCellStep {
  font-size: 7px;
  font-family: monospace;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(0, 0, 0, 0.3);
  padding: 1px 3px;
  border-radius: 2px;
}

.scaleCellHex {
  font-size: 7px;
  font-family: monospace;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
}

/* For light cells */
.scaleCellLight .scaleCellStep { color: rgba(0,0,0,0.5); background: rgba(0,0,0,0.08); }
.scaleCellLight .scaleCellHex { color: rgba(0,0,0,0.4); }
```

- [ ] **Step 2: Implement `ShadeScaleSection.tsx`**

```typescript
import { converter, formatHex } from 'culori'
import { useColor } from '@/store'
import { makeShadeScale } from '@/core/color/scales'
import { SHADE_STEPS } from '@/core/color/types'
import styles from './ShadeScaleSection.module.css'

const toOklch = converter('oklch')

const ROLE_LABELS: Record<string, string> = {
  brand: 'Brand',
  secondary: 'Secondary',
  accentA: 'Accent A',
  accentB: 'Accent B',
}

function isLightStep(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150
}

function hexToOklchLabel(hex: string): string {
  const c = toOklch(hex)
  if (!c) return hex
  return `oklch(${(c.l ?? 0).toFixed(2)} ${(c.c ?? 0).toFixed(2)} ${Math.round(c.h ?? 0)})`
}

export function ShadeScaleSection() {
  const { slots } = useColor()

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Shade Scales</div>
      {slots.map(slot => {
        const scale = makeShadeScale(slot.hex)
        const oklchLabel = hexToOklchLabel(slot.hex)
        return (
          <div key={slot.id} className={styles.colorRow}>
            <div className={styles.colorHeader}>
              <span className={styles.roleName}>{ROLE_LABELS[slot.role] ?? slot.role}</span>
              <span className={styles.colorMeta}>{slot.hex.toUpperCase()} · {oklchLabel}</span>
            </div>
            <div className={styles.scaleRow} role="list" aria-label={`${ROLE_LABELS[slot.role] ?? slot.role} shade scale`}>
              {SHADE_STEPS.map(step => {
                const stepHex = scale[step]
                const isLight = isLightStep(stepHex)
                return (
                  <div
                    key={step}
                    className={`${styles.scaleCell} ${isLight ? styles.scaleCellLight : ''}`}
                    style={{ background: stepHex }}
                    role="listitem"
                    title={`${slot.role}-${step}: ${stepHex}`}
                    onClick={() => { navigator.clipboard?.writeText(stepHex) }}
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter') navigator.clipboard?.writeText(stepHex) }}
                    aria-label={`Step ${step}: ${stepHex}`}
                  >
                    <div className={styles.scaleCellLabel}>
                      <span className={styles.scaleCellStep}>{step}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add v3/src/features/detail/tabs/ColorsTab/ShadeScaleSection.*
git commit -m "feat(colors-tab): shade scale section — 9-step OKLCH scales per slot with click-to-copy"
```

---

## Task 3: Colors tab — semantic roles section

**Files:**
- Create: `v3/src/features/detail/tabs/ColorsTab/SemanticRolesSection.tsx`
- Create: `v3/src/features/detail/tabs/ColorsTab/SemanticRolesSection.module.css`

- [ ] **Step 1: Implement `SemanticRolesSection.module.css`**

```css
.section { margin-bottom: 28px; }

.sectionTitle {
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-on-surface-subtle, #aaa);
  margin-bottom: 14px;
  font-family: sans-serif;
}

.subsectionTitle {
  font-size: 10px;
  font-weight: 700;
  color: var(--color-on-surface-subtle, #777);
  margin-bottom: 8px;
  font-family: sans-serif;
  letter-spacing: 0.5px;
}

/* Brand-derived roles grid */
.rolesGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 20px;
}

.roleCard {
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--color-border, #e8e4df);
}

.roleColorBar {
  height: 32px;
}

.roleMeta {
  padding: 5px 7px;
  background: var(--color-surface, #fff);
}

.roleName {
  font-size: 9px;
  font-weight: 600;
  color: var(--color-on-surface, #333);
  font-family: sans-serif;
}

.roleHex {
  font-size: 8px;
  color: var(--color-on-surface-subtle, #888);
  font-family: monospace;
}

/* Light/dark paired display */
.pairedRow {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.pairedSwatch {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: 1px solid var(--color-border, #e8e4df);
  flex-shrink: 0;
}

.pairedLabel {
  font-size: 10px;
  font-family: sans-serif;
  color: var(--color-on-surface, #333);
}

.pairedHex {
  font-size: 9px;
  font-family: monospace;
  color: var(--color-on-surface-subtle, #888);
  margin-left: 4px;
}

/* Dark mode column */
.darkColumn {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
}

.themeBadge {
  font-size: 8px;
  padding: 1px 5px;
  border-radius: 3px;
  background: var(--color-border, #e8e4df);
  color: var(--color-on-surface-subtle, #888);
  font-family: sans-serif;
}

/* State/mood groups */
.stateGrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}

.stateCard {
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 6px;
  overflow: hidden;
}

.statePair {
  display: flex;
  gap: 3px;
  padding: 8px 8px 0;
}

.stateSwatch {
  height: 20px;
  flex: 1;
  border-radius: 3px;
}

.stateLabel {
  padding: 4px 8px 8px;
  font-size: 9px;
  color: var(--color-on-surface-subtle, #888);
  font-family: sans-serif;
  text-transform: capitalize;
}
```

- [ ] **Step 2: Implement `SemanticRolesSection.tsx`**

```typescript
import { useColor } from '@/store'
import { makeShadeScale } from '@/core/color/scales'
import { deriveBrandRoles, deriveStateMoodRoles, deriveNeutralRoles } from '@/core/color/semantic'
import { deriveDarkModeRoles } from '@/core/color/darkMode'
import styles from './SemanticRolesSection.module.css'

const BRAND_ROLES = [
  'interactive',
  'on-interactive',
  'interactive-container',
  'on-interactive-container',
  'interactive-subtle',
  'interactive-hover',
] as const

const NEUTRAL_ROLES = [
  'background',
  'surface',
  'surface-raised',
  'on-surface',
  'on-surface-subtle',
  'border',
  'border-strong',
] as const

const STATE_PREFIXES = ['error', 'warning', 'success', 'info'] as const

export function SemanticRolesSection() {
  const { slots } = useColor()
  const brandSlot = slots.find(s => s.role === 'brand') ?? slots[0]
  const brandHex = brandSlot?.hex ?? '#888888'
  const brandScale = makeShadeScale(brandHex)

  const brandRoles = deriveBrandRoles(brandScale)
  const neutralRoles = deriveNeutralRoles(brandScale)
  const stateMoodRoles = deriveStateMoodRoles(brandHex)
  const darkRoles = deriveDarkModeRoles(brandScale)

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Semantic Roles</div>

      {/* Brand-derived roles */}
      <div className={styles.subsectionTitle}>Brand</div>
      <div className={styles.rolesGrid}>
        {BRAND_ROLES.map(role => {
          const hex = brandRoles[role] ?? '#888'
          return (
            <div key={role} className={styles.roleCard}>
              <div className={styles.roleColorBar} style={{ background: hex }} />
              <div className={styles.roleMeta}>
                <div className={styles.roleName}>{role}</div>
                <div className={styles.roleHex}>{hex.toUpperCase()}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Neutral roles with light/dark comparison */}
      <div className={styles.subsectionTitle}>Neutral</div>
      {NEUTRAL_ROLES.map(role => {
        const lightHex = neutralRoles[role] ?? '#888'
        const darkHex = darkRoles[role] ?? '#888'
        return (
          <div key={role} className={styles.pairedRow}>
            <div className={styles.pairedSwatch} style={{ background: lightHex }} title={`Light: ${lightHex}`} />
            <div>
              <span className={styles.pairedLabel}>{role}</span>
              <span className={styles.pairedHex}>{lightHex.toUpperCase()}</span>
            </div>
            <div className={styles.darkColumn}>
              <span className={styles.themeBadge}>dark</span>
              <div className={styles.pairedSwatch} style={{ background: darkHex }} title={`Dark: ${darkHex}`} />
              <span className={styles.pairedHex}>{darkHex.toUpperCase()}</span>
            </div>
          </div>
        )
      })}

      {/* State/mood roles */}
      <div className={styles.subsectionTitle} style={{ marginTop: 16 }}>State & Mood</div>
      <div className={styles.stateGrid}>
        {STATE_PREFIXES.map(prefix => {
          const baseHex = stateMoodRoles[prefix] ?? '#888'
          const containerHex = stateMoodRoles[`${prefix}-container`] ?? '#eee'
          return (
            <div key={prefix} className={styles.stateCard}>
              <div className={styles.statePair}>
                <div className={styles.stateSwatch} style={{ background: baseHex }} title={`${prefix}: ${baseHex}`} />
                <div className={styles.stateSwatch} style={{ background: containerHex }} title={`${prefix}-container: ${containerHex}`} />
              </div>
              <div className={styles.stateLabel}>{prefix}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add v3/src/features/detail/tabs/ColorsTab/SemanticRolesSection.*
git commit -m "feat(colors-tab): semantic roles — brand-derived, neutral light/dark pairs, state/mood"
```

---

## Task 4: Colors tab — data viz + contrast grid

**Files:**
- Create: `v3/src/features/detail/tabs/ColorsTab/DataVizSection.tsx`
- Create: `v3/src/features/detail/tabs/ColorsTab/DataVizSection.module.css`
- Create: `v3/src/features/detail/tabs/ColorsTab/ContrastGrid.tsx`
- Create: `v3/src/features/detail/tabs/ColorsTab/ContrastGrid.module.css`

- [ ] **Step 1: Implement `DataVizSection.tsx`**

`DataVizSection.module.css`:
```css
.section { margin-bottom: 28px; }

.sectionTitle {
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-on-surface-subtle, #aaa);
  margin-bottom: 14px;
  font-family: sans-serif;
}

.nControl {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  font-size: 12px;
  font-family: sans-serif;
  color: var(--color-on-surface-subtle, #666);
}

.nControl select {
  padding: 3px 8px;
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 4px;
  font-size: 12px;
  background: var(--color-surface, #fff);
  color: var(--color-on-surface, #111);
}

.palette {
  display: flex;
  gap: 4px;
  margin-bottom: 10px;
  height: 44px;
  border-radius: 6px;
  overflow: hidden;
}

.paletteCell {
  flex: 1;
  border-radius: 0;
  cursor: pointer;
  transition: flex 0.15s;
}

.paletteCell:hover { flex: 1.5; }

/* Mini bar chart */
.chart {
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 6px;
  padding: 10px 12px;
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 64px;
}

.bar {
  flex: 1;
  border-radius: 2px 2px 0 0;
  transition: height 0.3s ease;
}
```

`DataVizSection.tsx`:
```typescript
import { useColor, useColorActions } from '@/store'
import { generateDataVizPalette } from '@/core/color/dataViz'
import styles from './DataVizSection.module.css'

const DEMO_HEIGHTS = [80, 55, 70, 40, 90, 60, 45, 75]

export function DataVizSection() {
  const { slots, dataVizN } = useColor()
  const { setDataVizN } = useColorActions()
  const brandHex = slots.find(s => s.role === 'brand')?.hex ?? '#888888'
  const palette = generateDataVizPalette(brandHex, dataVizN)

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Data Visualization — Categorical Palette</div>

      <div className={styles.nControl}>
        <label htmlFor="dataviz-n">Colors:</label>
        <select
          id="dataviz-n"
          value={dataVizN}
          onChange={e => setDataVizN(Number(e.target.value))}
        >
          {[4, 6, 8, 10, 12, 16, 20].map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <span style={{ fontSize: 10, opacity: 0.6 }}>
          OKLCH-equidistant · L≈0.65 · C≈0.15
        </span>
      </div>

      <div className={styles.palette} role="list" aria-label={`${dataVizN}-color data viz palette`}>
        {palette.map((hex, i) => (
          <div
            key={i}
            className={styles.paletteCell}
            style={{ background: hex }}
            role="listitem"
            title={`Series ${i + 1}: ${hex}`}
            onClick={() => navigator.clipboard?.writeText(hex)}
            aria-label={`Series ${i + 1}: ${hex}`}
          />
        ))}
      </div>

      <div className={styles.chart} aria-label="Sample bar chart preview">
        {palette.slice(0, 8).map((hex, i) => (
          <div
            key={i}
            className={styles.bar}
            style={{
              background: hex,
              height: `${DEMO_HEIGHTS[i % DEMO_HEIGHTS.length]}%`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Implement `ContrastGrid.tsx`**

Shows a matrix of color slot pairs with WCAG AA/AAA pass/fail badges.

`ContrastGrid.module.css`:
```css
.section { margin-bottom: 28px; }

.sectionTitle {
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-on-surface-subtle, #aaa);
  margin-bottom: 14px;
  font-family: sans-serif;
}

.grid {
  display: grid;
  gap: 3px;
}

.cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: 5px;
  font-size: 10px;
  font-family: monospace;
}

.cellColors {
  display: flex;
  align-items: center;
  gap: 6px;
}

.swatch {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 1px solid rgba(0,0,0,0.1);
  flex-shrink: 0;
}

.cellLabel {
  font-size: 10px;
  color: inherit;
  font-family: sans-serif;
}

.badges {
  display: flex;
  gap: 4px;
}

.badge {
  font-size: 8px;
  padding: 1px 5px;
  border-radius: 3px;
  font-family: sans-serif;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.badgePass {
  background: #dcfce7;
  color: #15803d;
}

.badgeFail {
  background: #fee2e2;
  color: #dc2626;
}

.badgeAAA {
  background: #dbeafe;
  color: #1d4ed8;
}

.ratio {
  font-size: 10px;
  color: var(--color-on-surface-subtle, #888);
  font-family: monospace;
  margin-left: 8px;
}
```

`ContrastGrid.tsx`:
```typescript
import { useColor } from '@/store'
import { getWcagContrastRatio, getWcagLevels } from '@/core/color/scales'
import { deriveBrandRoles, deriveNeutralRoles } from '@/core/color/semantic'
import { makeShadeScale } from '@/core/color/scales'
import styles from './ContrastGrid.module.css'

interface ContrastPair {
  fgLabel: string
  bgLabel: string
  fgHex: string
  bgHex: string
}

export function ContrastGrid() {
  const { slots } = useColor()
  const brandHex = slots.find(s => s.role === 'brand')?.hex ?? '#888'
  const brandScale = makeShadeScale(brandHex)
  const brandRoles = deriveBrandRoles(brandScale)
  const neutralRoles = deriveNeutralRoles(brandScale)

  const pairs: ContrastPair[] = [
    {
      fgLabel: 'on-surface / background',
      bgLabel: 'background',
      fgHex: neutralRoles['on-surface'],
      bgHex: neutralRoles['background'],
    },
    {
      fgLabel: 'on-interactive / interactive',
      bgLabel: 'interactive',
      fgHex: brandRoles['on-interactive'],
      bgHex: brandRoles['interactive'],
    },
    {
      fgLabel: 'interactive / background',
      bgLabel: 'background',
      fgHex: brandRoles['interactive'],
      bgHex: neutralRoles['background'],
    },
    {
      fgLabel: 'on-surface-subtle / surface',
      bgLabel: 'surface',
      fgHex: neutralRoles['on-surface-subtle'],
      bgHex: neutralRoles['surface'],
    },
    ...slots.flatMap(slot =>
      slots
        .filter(s => s.id !== slot.id)
        .map(bg => ({
          fgLabel: `${slot.role} / ${bg.role}`,
          bgLabel: bg.role,
          fgHex: slot.hex,
          bgHex: bg.hex,
        })),
    ).slice(0, 4), // limit to avoid too many rows
  ]

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Contrast — WCAG AA/AAA</div>
      <div className={styles.grid} role="list">
        {pairs.map((pair, i) => {
          const ratio = getWcagContrastRatio(pair.fgHex, pair.bgHex)
          const levels = getWcagLevels(ratio)
          return (
            <div
              key={i}
              className={styles.cell}
              style={{ background: pair.bgHex, color: pair.fgHex }}
              role="listitem"
            >
              <div className={styles.cellColors}>
                <div className={styles.swatch} style={{ background: pair.fgHex }} />
                <span className={styles.cellLabel}>{pair.fgLabel}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div className={styles.badges}>
                  <span className={`${styles.badge} ${levels.aaBodyText ? styles.badgePass : styles.badgeFail}`}>AA</span>
                  {levels.aaaBodyText && <span className={`${styles.badge} ${styles.badgeAAA}`}>AAA</span>}
                </div>
                <span className={styles.ratio}>{ratio.toFixed(1)}:1</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Import getWcagLevels — add to scales.ts if not already there:
// export function getWcagLevels(ratio: number) {
//   return { aaLargeText: ratio >= 3, aaBodyText: ratio >= 4.5, aaaLargeText: ratio >= 4.5, aaaBodyText: ratio >= 7 }
// }
```

- [ ] **Step 3: Assemble `ColorsTab.tsx`**

`ColorsTab.module.css`:
```css
.tab { /* inherits padding from DetailMode .content */ }
```

`ColorsTab.tsx`:
```typescript
import { ShadeScaleSection } from './ShadeScaleSection'
import { SemanticRolesSection } from './SemanticRolesSection'
import { DataVizSection } from './DataVizSection'
import { ContrastGrid } from './ContrastGrid'

export function ColorsTab() {
  return (
    <>
      <ShadeScaleSection />
      <SemanticRolesSection />
      <DataVizSection />
      <ContrastGrid />
    </>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add v3/src/features/detail/tabs/ColorsTab/
git commit -m "feat(colors-tab): complete — shade scales, semantic roles, data viz, contrast grid"
```

---

## Task 5: Typography tab — font browser

**Files:**
- Create: `v3/src/features/detail/tabs/TypographyTab/FontBrowserGrid.tsx`
- Create: `v3/src/features/detail/tabs/TypographyTab/FontBrowserGrid.module.css`
- Create: `v3/src/features/detail/tabs/TypographyTab/FontBrowser.tsx`
- Create: `v3/src/features/detail/tabs/TypographyTab/FontBrowser.module.css`

- [ ] **Step 1: Implement `FontBrowserGrid.tsx`**

The grid uses `IntersectionObserver` to load fonts as cells scroll into view. Each cell shows a sample string in the font (if loaded) or a skeleton placeholder.

`FontBrowserGrid.module.css`:
```css
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 8px 0;
}

.cell {
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  background: var(--color-surface, #fff);
  transition: border-color 0.15s, box-shadow 0.15s;
  min-height: 72px;
}

.cell:hover {
  border-color: var(--color-interactive, #e8543a);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.cell.selected {
  border-color: var(--color-interactive, #e8543a);
  background: var(--color-interactive-subtle, #fde8e3);
}

.cellPreview {
  font-size: 22px;
  line-height: 1.2;
  margin-bottom: 6px;
  color: var(--color-on-surface, #111);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.cellMeta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cellName {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-on-surface, #333);
  font-family: sans-serif;
}

.cellSource {
  font-size: 9px;
  color: var(--color-on-surface-subtle, #aaa);
  font-family: sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.skeleton {
  height: 26px;
  background: var(--color-border, #e8e4df);
  border-radius: 4px;
  margin-bottom: 6px;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}
```

`FontBrowserGrid.tsx`:
```typescript
import { useEffect, useRef, useState } from 'react'
import { createFontBrowserObserver, isFontLoaded } from '@/core/typography/fontLoader'
import pairingsData from '@/core/typography/pairings.json'
import type { FontPairing } from '@/core/typography/types'
import styles from './FontBrowserGrid.module.css'

const ALL_FONTS = (pairingsData as FontPairing[]).reduce<
  { name: string; source: FontPairing['source'] }[]
>((acc, p) => {
  if (!acc.find(f => f.name === p.heading)) acc.push({ name: p.heading, source: p.source })
  if (!acc.find(f => f.name === p.body)) acc.push({ name: p.body, source: p.source })
  return acc
}, [])

const PREVIEW_TEXT = 'Aa Bb Cc'

interface FontBrowserGridProps {
  filter: string
  selectedHeading: string | null
  selectedBody: string | null
  onSelectHeading: (name: string, source: FontPairing['source']) => void
  onSelectBody: (name: string, source: FontPairing['source']) => void
  mode: 'heading' | 'body'
}

export function FontBrowserGrid({ filter, selectedHeading, selectedBody, onSelectHeading, onSelectBody, mode }: FontBrowserGridProps) {
  const [loaded, setLoaded] = useState<Set<string>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = filter
    ? ALL_FONTS.filter(f => f.name.toLowerCase().includes(filter.toLowerCase()))
    : ALL_FONTS

  useEffect(() => {
    const observer = createFontBrowserObserver(fontName => {
      setLoaded(prev => new Set([...prev, fontName]))
    })

    const cells = containerRef.current?.querySelectorAll('[data-font]')
    cells?.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [filtered.length])

  const handleSelect = (name: string, source: FontPairing['source']) => {
    if (mode === 'heading') onSelectHeading(name, source)
    else onSelectBody(name, source)
  }

  return (
    <div className={styles.grid} ref={containerRef}>
      {filtered.map(({ name, source }) => {
        const isLoaded = loaded.has(name) || isFontLoaded(name)
        const isSelected = mode === 'heading'
          ? selectedHeading === name
          : selectedBody === name

        return (
          <div
            key={name}
            className={`${styles.cell} ${isSelected ? styles.selected : ''}`}
            data-font={name}
            data-source={source}
            onClick={() => handleSelect(name, source)}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleSelect(name, source) }}
            aria-pressed={isSelected}
            aria-label={`Select ${name} font`}
          >
            {isLoaded ? (
              <div
                className={styles.cellPreview}
                style={{ fontFamily: `"${name}", serif` }}
              >
                {PREVIEW_TEXT}
              </div>
            ) : (
              <div className={styles.skeleton} />
            )}
            <div className={styles.cellMeta}>
              <span className={styles.cellName}>{name}</span>
              <span className={styles.cellSource}>{source}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Implement `FontBrowser.tsx`**

`FontBrowser.module.css`:
```css
.browser { margin-bottom: 24px; }

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.sectionTitle {
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-on-surface-subtle, #aaa);
  font-family: sans-serif;
}

.modeSwitch {
  display: flex;
  gap: 4px;
}

.modeBtn {
  padding: 3px 10px;
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 4px;
  font-size: 11px;
  background: none;
  cursor: pointer;
  color: var(--color-on-surface-subtle, #777);
  font-family: sans-serif;
}

.modeBtn.active {
  background: var(--color-interactive-subtle, #fde8e3);
  border-color: var(--color-interactive, #e8543a);
  color: var(--color-interactive, #e8543a);
  font-weight: 600;
}

.searchRow {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.search {
  flex: 1;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 6px;
  font-size: 12px;
  background: var(--color-surface, #fff);
  color: var(--color-on-surface, #111);
  font-family: sans-serif;
}

.search:focus {
  outline: 2px solid var(--color-interactive, #e8543a);
  outline-offset: 1px;
}

/* Quick picks row */
.quickPicks {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: none;
  margin-bottom: 8px;
}

.quickPicks::-webkit-scrollbar { display: none; }

.quickPick {
  flex-shrink: 0;
  padding: 5px 10px;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
  font-family: sans-serif;
  color: var(--color-on-surface, #333);
  white-space: nowrap;
  transition: all 0.15s;
}

.quickPick:hover {
  border-color: var(--color-interactive, #e8543a);
  color: var(--color-interactive, #e8543a);
}

.quickPickLabel {
  font-size: 9px;
  color: var(--color-on-surface-subtle, #aaa);
  display: block;
  margin-bottom: 2px;
}
```

`FontBrowser.tsx`:
```typescript
import { useState } from 'react'
import { useTypography, useTypographyActions } from '@/store'
import pairingsData from '@/core/typography/pairings.json'
import type { FontPairing } from '@/core/typography/types'
import { FontBrowserGrid } from './FontBrowserGrid'
import styles from './FontBrowser.module.css'

const PAIRINGS = pairingsData as FontPairing[]

export function FontBrowser() {
  const [mode, setMode] = useState<'heading' | 'body'>('heading')
  const [filter, setFilter] = useState('')
  const { pairing } = useTypography()
  const { setHeadingFont, setBodyFont } = useTypographyActions()

  const applyQuickPick = (p: FontPairing) => {
    setHeadingFont(p.heading, p.source)
    setBodyFont(p.body, p.source)
  }

  return (
    <div className={styles.browser}>
      <div className={styles.header}>
        <div className={styles.sectionTitle}>Font Browser</div>
        <div className={styles.modeSwitch}>
          <button
            className={`${styles.modeBtn} ${mode === 'heading' ? styles.active : ''}`}
            onClick={() => setMode('heading')}
            aria-pressed={mode === 'heading'}
          >
            Heading
          </button>
          <button
            className={`${styles.modeBtn} ${mode === 'body' ? styles.active : ''}`}
            onClick={() => setMode('body')}
            aria-pressed={mode === 'body'}
          >
            Body
          </button>
        </div>
      </div>

      {/* Quick picks */}
      <div className={styles.quickPicks} aria-label="Curated pairings">
        {PAIRINGS.slice(0, 20).map(p => (
          <button
            key={`${p.heading}-${p.body}`}
            className={styles.quickPick}
            onClick={() => applyQuickPick(p)}
            title={`${p.heading} + ${p.body}`}
          >
            <span className={styles.quickPickLabel}>{p.character}</span>
            {p.heading} / {p.body}
          </button>
        ))}
      </div>

      <div className={styles.searchRow}>
        <input
          className={styles.search}
          type="search"
          placeholder={`Search ${mode} fonts…`}
          value={filter}
          onChange={e => setFilter(e.target.value)}
          aria-label={`Search ${mode} fonts`}
        />
      </div>

      <FontBrowserGrid
        filter={filter}
        selectedHeading={pairing?.heading ?? null}
        selectedBody={pairing?.body ?? null}
        onSelectHeading={(name, source) => setHeadingFont(name, source)}
        onSelectBody={(name, source) => setBodyFont(name, source)}
        mode={mode}
      />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add v3/src/features/detail/tabs/TypographyTab/FontBrowser*
git commit -m "feat(typography-tab): font browser — quick picks, search, IntersectionObserver lazy loading"
```

---

## Task 6: Typography tab — scale editor and character set

**Files:**
- Create: `v3/src/features/detail/tabs/TypographyTab/ScaleEditor.tsx`
- Create: `v3/src/features/detail/tabs/TypographyTab/ScaleEditor.module.css`
- Create: `v3/src/features/detail/tabs/TypographyTab/CharacterSet.tsx`
- Create: `v3/src/features/detail/tabs/TypographyTab/CharacterSet.module.css`

- [ ] **Step 1: Implement `ScaleEditor.tsx`**

Shows the current type scale as a visual list. Each step shows size, weight, line-height with editable fields.

`ScaleEditor.module.css`:
```css
.section { margin-bottom: 24px; }

.sectionTitle {
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-on-surface-subtle, #aaa);
  margin-bottom: 14px;
  font-family: sans-serif;
}

.ratioRow {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  font-size: 12px;
  font-family: sans-serif;
  color: var(--color-on-surface-subtle, #666);
}

.ratioValue {
  font-family: monospace;
  font-weight: 700;
  color: var(--color-on-surface, #111);
}

.scaleList { display: flex; flex-direction: column; gap: 4px; }

.scaleRow {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 6px;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e8e4df);
  gap: 10px;
}

.specimen {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--color-on-surface, #111);
}

.meta {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  align-items: center;
}

.metaItem {
  font-size: 9px;
  font-family: monospace;
  color: var(--color-on-surface-subtle, #888);
  min-width: 40px;
  text-align: right;
}

.stepLabel {
  font-size: 9px;
  font-weight: 700;
  font-family: sans-serif;
  color: var(--color-on-surface-subtle, #999);
  width: 36px;
  flex-shrink: 0;
}
```

`ScaleEditor.tsx`:
```typescript
import { useTypography } from '@/store'
import styles from './ScaleEditor.module.css'
import type { TypeScale, TypeScaleStep } from '@/core/typography/types'

const SCALE_ORDER: (keyof TypeScale)[] = ['display', 'h1', 'h2', 'h3', 'h4', 'body', 'small', 'xs', 'label']

const SPECIMEN_STRINGS: Partial<Record<keyof TypeScale, string>> = {
  display: 'Display — The quick brown fox',
  h1: 'Heading 1 — jumps over the lazy dog',
  h2: 'Heading 2 — Pack my box',
  h3: 'Heading 3 — with five dozen',
  h4: 'Heading 4 — liquor jugs',
  body: 'Body — How vexingly quick daft zebras jump',
  small: 'Small — The five boxing wizards',
  xs: 'XS — jump quickly',
  label: 'LABEL',
}

export function ScaleEditor() {
  const { scale, pairing } = useTypography()
  if (!scale || !pairing) return null

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Type Scale</div>
      <div className={styles.ratioRow}>
        <span>Scale ratio:</span>
        <span className={styles.ratioValue}>{scale._ratio.toFixed(3)}</span>
        <span style={{ opacity: 0.5, fontSize: 10 }}>base 16px × ratio^n</span>
      </div>
      <div className={styles.scaleList} role="list">
        {SCALE_ORDER.map(key => {
          const step = scale[key] as TypeScaleStep | undefined | number
          if (!step || typeof step === 'number') return null
          const fontFamily = key === 'body' || key === 'small' || key === 'xs' || key === 'label'
            ? `"${pairing.body}", sans-serif`
            : `"${pairing.heading}", serif`
          return (
            <div key={key} className={styles.scaleRow} role="listitem">
              <span className={styles.stepLabel}>{step.label}</span>
              <div
                className={styles.specimen}
                style={{
                  fontFamily,
                  fontSize: `${Math.min(step.size, 28)}px`,
                  fontWeight: step.weight,
                  lineHeight: step.lineHeight,
                  letterSpacing: step.letterSpacing,
                }}
              >
                {SPECIMEN_STRINGS[key] ?? key}
              </div>
              <div className={styles.meta}>
                <span className={styles.metaItem}>{Math.round(step.size)}px</span>
                <span className={styles.metaItem}>{step.weight}</span>
                <span className={styles.metaItem}>lh {step.lineHeight}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Implement `CharacterSet.tsx`**

Displays the complete character set for both heading and body fonts. This triggers full font loading (not just the sample string). Per SPEC §9.4: "Full character set display: loaded only when the System view is opened, not at generation time." However for the Typography tab it makes sense to show it when the user navigates here.

`CharacterSet.module.css`:
```css
.section { margin-bottom: 24px; }

.sectionTitle {
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-on-surface-subtle, #aaa);
  margin-bottom: 14px;
  font-family: sans-serif;
}

.fontBlock {
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.fontName {
  font-size: 10px;
  font-weight: 700;
  color: var(--color-on-surface-subtle, #888);
  margin-bottom: 10px;
  font-family: sans-serif;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.charset {
  font-size: 16px;
  line-height: 1.8;
  letter-spacing: 0.03em;
  color: var(--color-on-surface, #222);
  word-break: break-all;
}

.charsetMuted { color: var(--color-on-surface-subtle, #aaa); }

.weightRow {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.weightSample {
  font-size: 14px;
  color: var(--color-on-surface, #333);
}
```

`CharacterSet.tsx`:
```typescript
import { useTypography } from '@/store'
import styles from './CharacterSet.module.css'

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const DIGITS = '0123456789'
const PUNCTUATION = '! @ # $ % ^ & * ( ) - + = [ ] { } | ; : \' " , . / < > ? ` ~'
const DIACRITICS = 'À Á Â Ã Ä Å Æ Ç È É Ê Ë Ì Í Î Ï Ð Ñ Ò Ó Ô Õ Ö'

const WEIGHTS = [
  { weight: 400, label: 'Regular 400' },
  { weight: 500, label: 'Medium 500' },
  { weight: 600, label: 'Semi-bold 600' },
  { weight: 700, label: 'Bold 700' },
  { weight: 800, label: 'Extra-bold 800' },
]

export function CharacterSet() {
  const { pairing } = useTypography()
  if (!pairing) return null

  const renderFont = (name: string, role: 'Heading' | 'Body', isSerif: boolean) => (
    <div key={name} className={styles.fontBlock}>
      <div className={styles.fontName}>{name} — {role}</div>
      <div
        className={styles.charset}
        style={{ fontFamily: `"${name}", ${isSerif ? 'serif' : 'sans-serif'}` }}
      >
        <div>{UPPERCASE}</div>
        <div>{LOWERCASE}</div>
        <div>{DIGITS}</div>
        <div className={styles.charsetMuted}>{PUNCTUATION}</div>
        <div className={styles.charsetMuted}>{DIACRITICS}</div>
      </div>
      <div className={styles.weightRow}>
        {WEIGHTS.map(({ weight, label }) => (
          <span
            key={weight}
            className={styles.weightSample}
            style={{ fontFamily: `"${name}", serif`, fontWeight: weight }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Character Sets</div>
      {renderFont(pairing.heading, 'Heading', true)}
      {pairing.body !== pairing.heading && renderFont(pairing.body, 'Body', false)}
    </div>
  )
}
```

- [ ] **Step 3: Assemble `TypographyTab.tsx`**

`TypographyTab.tsx`:
```typescript
import { FontBrowser } from './FontBrowser'
import { ScaleEditor } from './ScaleEditor'
import { CharacterSet } from './CharacterSet'

export function TypographyTab() {
  return (
    <>
      <FontBrowser />
      <ScaleEditor />
      <CharacterSet />
    </>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add v3/src/features/detail/tabs/TypographyTab/
git commit -m "feat(typography-tab): scale editor + character sets (A–Z, diacritics, weights)"
```

---

## Task 7: APCA readability score

**Files:**
- Create: `v3/src/features/detail/tabs/TypographyTab/ReadabilityScore.tsx`
- Create: `v3/src/features/detail/tabs/TypographyTab/ReadabilityScore.module.css`
- Modify: `v3/src/features/detail/tabs/TypographyTab/TypographyTab.tsx`

- [ ] **Step 1: Implement `ReadabilityScore.tsx`**

Uses `apca-w3` to compute the APCA contrast between body text and background.

`ReadabilityScore.module.css`:
```css
.section { margin-bottom: 24px; }

.sectionTitle {
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-on-surface-subtle, #aaa);
  margin-bottom: 14px;
  font-family: sans-serif;
}

.card {
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 8px;
  padding: 16px;
}

.scoreRow {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.score {
  font-size: 36px;
  font-weight: 800;
  font-family: monospace;
  color: var(--color-on-surface, #111);
  line-height: 1;
}

.scoreLabel {
  font-size: 11px;
  font-family: sans-serif;
  color: var(--color-on-surface-subtle, #777);
}

.grade {
  font-size: 13px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
}

.gradeGood { background: #dcfce7; color: #15803d; }
.gradeMedium { background: #fef3c7; color: #d97706; }
.gradePoor { background: #fee2e2; color: #dc2626; }

.sampleText {
  font-size: 16px;
  line-height: 1.6;
  padding: 10px 12px;
  border-radius: 6px;
  background: var(--color-background, #f8f7f4);
  color: var(--color-on-surface, #111);
  font-family: var(--font-body, sans-serif);
}
```

`ReadabilityScore.tsx`:
```typescript
import { APCAcontrast, sRGBtoY } from 'apca-w3'
import { useColor, useTypography } from '@/store'
import { makeShadeScale, getWcagContrastRatio } from '@/core/color/scales'
import { deriveNeutralRoles } from '@/core/color/semantic'
import styles from './ReadabilityScore.module.css'

function hexToRGB(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

function computeAPCA(fgHex: string, bgHex: string): number {
  const [fr, fg, fb] = hexToRGB(fgHex)
  const [br, bg, bb] = hexToRGB(bgHex)
  const fgY = sRGBtoY([fr, fg, fb])
  const bgY = sRGBtoY([br, bg, bb])
  return Math.abs(Number(APCAcontrast(fgY, bgY)))
}

function apcaGrade(score: number): { label: string; className: string } {
  if (score >= 75) return { label: 'Excellent', className: styles.gradeGood }
  if (score >= 60) return { label: 'Good', className: styles.gradeMedium }
  return { label: 'Low', className: styles.gradePoor }
}

export function ReadabilityScore() {
  const { slots } = useColor()
  const { pairing } = useTypography()
  const brandHex = slots.find(s => s.role === 'brand')?.hex ?? '#888'
  const brandScale = makeShadeScale(brandHex)
  const neutralRoles = deriveNeutralRoles(brandScale)
  const textHex = neutralRoles['on-surface']
  const bgHex = neutralRoles['background']

  const apcaScore = computeAPCA(textHex, bgHex)
  const grade = apcaGrade(apcaScore)
  const wcagRatio = getWcagContrastRatio(textHex, bgHex)

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Readability — APCA Score</div>
      <div className={styles.card}>
        <div className={styles.scoreRow}>
          <div className={styles.score}>{apcaScore.toFixed(0)}</div>
          <div>
            <div className={styles.scoreLabel}>APCA Lc · body text on background</div>
            <span className={`${styles.grade} ${grade.className}`}>{grade.label}</span>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div className={styles.scoreLabel}>WCAG</div>
            <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-on-surface)' }}>
              {wcagRatio.toFixed(1)}:1
            </div>
          </div>
        </div>
        <div
          className={styles.sampleText}
          style={{ fontFamily: pairing ? `"${pairing.body}", sans-serif` : 'sans-serif' }}
        >
          Body text at 16px — The five boxing wizards jump quickly.
          How vexingly quick daft zebras jump. Pack my box with five dozen liquor jugs.
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add to `TypographyTab.tsx`**

```typescript
import { FontBrowser } from './FontBrowser'
import { ScaleEditor } from './ScaleEditor'
import { CharacterSet } from './CharacterSet'
import { ReadabilityScore } from './ReadabilityScore'

export function TypographyTab() {
  return (
    <>
      <FontBrowser />
      <ScaleEditor />
      <ReadabilityScore />
      <CharacterSet />
    </>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add v3/src/features/detail/tabs/TypographyTab/ReadabilityScore* v3/src/features/detail/tabs/TypographyTab/TypographyTab.tsx
git commit -m "feat(typography-tab): APCA readability score + WCAG contrast"
```

---

## Task 8: Final detail mode integration test

- [ ] **Step 1: Manual test — Colors tab**

1. Enter detail mode → Colors tab
2. Shade scales show all 4 color slots with 9-step strips
3. Each step is click-to-copy (check clipboard)
4. Semantic roles section: brand roles, neutral roles with light/dark columns, state/mood grid
5. Data viz section: 8 colored blocks + mini bar chart
6. N selector changes number of blocks
7. Contrast grid: shows ratio + AA/AAA badges

- [ ] **Step 2: Manual test — Typography tab**

1. Enter detail mode → Typography tab
2. Quick picks row scrollable with pairing names
3. Click a quick pick — preview panel updates font
4. Search: type "Playfair" — only matching fonts shown
5. Toggle Heading/Body mode — different selection highlighted
6. Scale editor: shows all 9 steps with sizes rendered in actual fonts
7. APCA score: shows a number and grade
8. Character set: full A–Z shown in actual heading/body fonts

- [ ] **Step 3: Run type check**

```bash
cd v3 && npx tsc --noEmit
```

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(1D): detail mode Colors + Typography tabs complete"
```

---

## What Phase 1E receives from 1D

Phase 1E developers:
- Detail mode shell complete — tab bar, back link, routing in `DetailMode.tsx`
- `ui.activeTab` controls which tab renders — add `'showcase'` and `'export'` cases to `renderTab()` in `DetailMode.tsx`
- Live preview is at `v3/src/features/preview/LivePreview.tsx` — add template switcher logic based on `ui.showcaseTemplate`
- Export formatters are in `v3/src/core/export/index.ts` — call `formatTokens(format, tokens)` to get the code string
- `buildTokenMap()` is in `v3/src/store/derived.ts` — call it to get the current token map for export
