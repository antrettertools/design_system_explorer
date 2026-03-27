# Phase 1B — App Shell & Generator UI

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full interactive left panel (generator mode) and the app shell. By end of 1B, users can press space to generate, lock/unlock colors, see shade strips on locked colors, add/remove color slots, see the typography specimen, and navigate to detail mode — all styled and functional. The right panel is a placeholder (`<LivePreview />` stub — implemented in 1C).

**Architecture:** All UI components live in `v3/src/`. Components only import from `v3/src/store/` — never from `v3/src/core/` directly. CSS Modules for component styles. CSS custom properties (`var(--color-brand-500)`) drive all color values in templates. No hardcoded colors in component CSS.

**Prerequisites:** Phase 1A complete. All store actions and CSS token injection working.

**Tech Stack:** React 18, CSS Modules, Zustand store from 1A

---

## File Map

```
v3/src/
├── App.tsx                                   # MODIFY — full app shell
├── styles/
│   └── globals.css                           # MODIFY — layout CSS vars, fonts
├── components/
│   ├── AppShell/
│   │   ├── AppShell.tsx                      # Outer frame: header + split panes
│   │   ├── AppShell.module.css
│   │   ├── AppHeader.tsx                     # "palette." wordmark, theme toggle, Export ↓
│   │   └── AppHeader.module.css
│   ├── SplitPane/
│   │   ├── SplitPane.tsx                     # Draggable 50/50 horizontal split
│   │   └── SplitPane.module.css
│   └── ui/
│       ├── LockIcon.tsx                      # SVG lock/unlock icon
│       └── Badge.tsx                         # "auto" / "overridden" pill badge
├── features/
│   └── generator/
│       ├── GeneratorPanel.tsx                # Left panel root — color section + typography
│       ├── GeneratorPanel.module.css
│       ├── ColorSwatches/
│       │   ├── ColorSwatches.tsx             # Grid of ColorSlotCard
│       │   ├── ColorSwatches.module.css
│       │   ├── ColorSlotCard.tsx             # Single swatch column
│       │   ├── ColorSlotCard.module.css
│       │   └── ShadeStrip.tsx                # 9-step shade strip under locked swatch
│       ├── HarmonyHint.tsx                   # Green hint bar "Unlocked colors harmonizing…"
│       ├── HarmonyHint.module.css
│       ├── TypographySpecimen/
│       │   ├── TypographySpecimen.tsx        # Heading + body + scale pills + font names
│       │   └── TypographySpecimen.module.css
│       └── GeneratorFooter/
│           ├── GeneratorFooter.tsx           # SPACE hint, vibe chip, +Add, Detail Mode →, Export ↓
│           └── GeneratorFooter.module.css
└── features/
    └── preview/
        └── LivePreviewStub.tsx               # Placeholder — "Live preview (coming in 1C)"
```

---

## Design reference

From the brainstorming session and spec (SPEC §6):

**Color swatches (Approach C):**
- Large columns (~110px tall) filling the top of the left panel
- Each column: role label top-left (Brand / Secondary / Accent A / Accent B), hex value, lock icon top-right
- **Locked columns** show a 9-step shade strip immediately below — same width as the column
- **Unlocked columns** no strip — clean, in-flux feeling
- Color names shown (not just hex)

**Typography specimen:**
- Visible whitespace separation from color section
- Big heading (~26px in panel): actual heading font, "The quick brown fox"
- Body text: 2 lines in body font
- Scale pills: H1 / H2 / H3 / Body / sm / xs — size + weight
- Font names: "Heading: Fraunces · Body: Inter"
- Per-font lock toggles

**Footer:**
- "SPACE to generate" hint (desktop) / "Generate ✦" button (mobile)
- "✦ vibe" chip — visible, disabled, tooltip "Coming soon"
- "+ Add color" button
- "Detail Mode →" CTA (brand color background)
- "Export ↓" button

**Theme:** Light by default. `data-theme="dark"` on `<html>` toggles dark mode (CSS handles it).

---

## Task 1: App shell and split pane

**Files:**
- Modify: `v3/src/App.tsx`
- Create: `v3/src/components/AppShell/AppShell.tsx`
- Create: `v3/src/components/AppShell/AppShell.module.css`
- Create: `v3/src/components/AppShell/AppHeader.tsx`
- Create: `v3/src/components/AppShell/AppHeader.module.css`
- Create: `v3/src/components/SplitPane/SplitPane.tsx`
- Create: `v3/src/components/SplitPane/SplitPane.module.css`

- [ ] **Step 1: Implement `SplitPane.tsx`**

The split pane handles the resizable 50/50 split. It uses a mouse drag on the divider to update the left panel width. The divider is 4px wide with a visible hover state. On mobile (≤768px) the split pane renders only one panel at a time (controlled by a prop).

`v3/src/components/SplitPane/SplitPane.module.css`:
```css
.container {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.left {
  flex-shrink: 0;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.divider {
  width: 4px;
  flex-shrink: 0;
  background: var(--color-border, #e8e4df);
  cursor: col-resize;
  transition: background 0.15s;
  position: relative;
  z-index: 10;
}

.divider:hover,
.divider.dragging {
  background: var(--color-interactive, #e8543a);
}

.right {
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

@media (max-width: 768px) {
  .left, .right {
    width: 100% !important;
    flex: none;
  }
  .divider { display: none; }
}
```

`v3/src/components/SplitPane/SplitPane.tsx`:
```typescript
import { useRef, useState, useCallback, useEffect } from 'react'
import styles from './SplitPane.module.css'

interface SplitPaneProps {
  left: React.ReactNode
  right: React.ReactNode
  defaultLeftPercent?: number  // 0–100, default 50
}

export function SplitPane({ left, right, defaultLeftPercent = 50 }: SplitPaneProps) {
  const [leftPercent, setLeftPercent] = useState(defaultLeftPercent)
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  useEffect(() => {
    if (!dragging) return
    const onMouseMove = (e: MouseEvent) => {
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const pct = Math.min(Math.max((x / rect.width) * 100, 20), 80)
      setLeftPercent(pct)
    }
    const onMouseUp = () => setDragging(false)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [dragging])

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.left} style={{ width: `${leftPercent}%` }}>
        {left}
      </div>
      <div
        className={`${styles.divider} ${dragging ? styles.dragging : ''}`}
        onMouseDown={onMouseDown}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panels"
        tabIndex={0}
      />
      <div className={styles.right}>
        {right}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Implement `AppHeader.tsx`**

`v3/src/components/AppShell/AppHeader.module.css`:
```css
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 48px;
  border-bottom: 1px solid var(--color-border, #e8e4df);
  background: var(--color-surface, #fff);
  flex-shrink: 0;
  gap: 12px;
}

.wordmark {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: var(--color-on-surface, #111);
  font-family: Georgia, serif;
  user-select: none;
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.themeToggle {
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border, #e8e4df);
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: background 0.15s;
}

.themeToggle:hover {
  background: var(--color-interactive-subtle, #f8f7f4);
}

.exportBtn {
  height: 32px;
  padding: 0 12px;
  background: var(--color-on-surface, #111);
  color: var(--color-background, #f8f7f4);
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: opacity 0.15s;
}

.exportBtn:hover { opacity: 0.8; }
```

`v3/src/components/AppShell/AppHeader.tsx`:
```typescript
import styles from './AppHeader.module.css'
import { useUI, useUIActions } from '@/store'

interface AppHeaderProps {
  onExportClick: () => void
}

export function AppHeader({ onExportClick }: AppHeaderProps) {
  const { theme } = useUI()
  const { toggleTheme } = useUIActions()

  return (
    <header className={styles.header}>
      <div className={styles.wordmark}>palette.</div>
      <div className={styles.actions}>
        <button
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '◐' : '○'}
        </button>
        <button className={styles.exportBtn} onClick={onExportClick}>
          Export ↓
        </button>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Implement `AppShell.tsx`**

`v3/src/components/AppShell/AppShell.module.css`:
```css
.shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: var(--color-background, #f8f7f4);
}

.body {
  flex: 1;
  min-height: 0;
}
```

`v3/src/components/AppShell/AppShell.tsx`:
```typescript
import styles from './AppShell.module.css'
import { AppHeader } from './AppHeader'
import { useUIActions } from '@/store'

interface AppShellProps {
  left: React.ReactNode
  right: React.ReactNode
}

export function AppShell({ left, right }: AppShellProps) {
  const { openExportPanel } = useUIActions()
  return (
    <div className={styles.shell}>
      <AppHeader onExportClick={openExportPanel} />
      <div className={styles.body}>
        {left}
        {right}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Update `App.tsx` to use AppShell + SplitPane**

```typescript
import { useEffect } from 'react'
import { useColorActions, useTypographyActions } from './store'
import { AppShell } from './components/AppShell/AppShell'
import { SplitPane } from './components/SplitPane/SplitPane'
import { GeneratorPanel } from './features/generator/GeneratorPanel'
import { LivePreviewStub } from './features/preview/LivePreviewStub'

export default function App() {
  const colorActions = useColorActions()
  const typographyActions = useTypographyActions()

  useEffect(() => {
    colorActions.generate()
    typographyActions.generate()
  }, [])

  // Handle spacebar — generate new palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't intercept space when focused on input/button
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault()
        colorActions.generate()
        typographyActions.generate(undefined)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [colorActions, typographyActions])

  return (
    <AppShell
      left={null}
      right={null}
    >
      <SplitPane
        left={<GeneratorPanel />}
        right={<LivePreviewStub />}
      />
    </AppShell>
  )
}
```

Note: AppShell needs to wrap SplitPane. Adjust so shell renders children:

```typescript
// Correct App.tsx:
import { useEffect } from 'react'
import { useColorActions, useTypographyActions } from './store'
import { AppHeader } from './components/AppShell/AppHeader'
import { SplitPane } from './components/SplitPane/SplitPane'
import { GeneratorPanel } from './features/generator/GeneratorPanel'
import { LivePreviewStub } from './features/preview/LivePreviewStub'
import { useUIActions } from './store'
import appStyles from './App.module.css'

export default function App() {
  const colorActions = useColorActions()
  const typographyActions = useTypographyActions()
  const { openExportPanel } = useUIActions()

  useEffect(() => {
    colorActions.generate()
    typographyActions.generate()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault()
        colorActions.generate()
        typographyActions.generate(undefined)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [colorActions, typographyActions])

  return (
    <div className={appStyles.app}>
      <AppHeader onExportClick={openExportPanel} />
      <div className={appStyles.body}>
        <SplitPane
          left={<GeneratorPanel />}
          right={<LivePreviewStub />}
        />
      </div>
    </div>
  )
}
```

Create `v3/src/App.module.css`:
```css
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: var(--color-background, #f8f7f4);
  color: var(--color-on-surface, #111);
}

.body {
  flex: 1;
  min-height: 0;
}
```

- [ ] **Step 5: Create the live preview stub**

`v3/src/features/preview/LivePreviewStub.tsx`:
```typescript
export function LivePreviewStub() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      background: 'var(--color-surface, #fff)',
      color: 'var(--color-on-surface-subtle, #666)',
      fontSize: '14px',
      fontFamily: 'sans-serif',
    }}>
      Live preview — coming in Phase 1C
    </div>
  )
}
```

- [ ] **Step 6: Verify app renders with split pane**

```bash
cd v3 && npm run dev
```

Open browser. Should see header with "palette." wordmark, split pane with "Live preview — coming in Phase 1C" on the right, and an empty left panel (GeneratorPanel is stubbed next).

- [ ] **Step 7: Commit**

```bash
git add v3/src/
git commit -m "feat(shell): app header + split pane with drag resize"
```

---

## Task 2: Color swatches

**Files:**
- Create: `v3/src/features/generator/ColorSwatches/ColorSlotCard.tsx`
- Create: `v3/src/features/generator/ColorSwatches/ColorSlotCard.module.css`
- Create: `v3/src/features/generator/ColorSwatches/ShadeStrip.tsx`
- Create: `v3/src/features/generator/ColorSwatches/ColorSwatches.tsx`
- Create: `v3/src/features/generator/ColorSwatches/ColorSwatches.module.css`

- [ ] **Step 1: Implement `ShadeStrip.tsx`**

The shade strip shows a 9-step scale below a locked swatch. Each cell shows the step number (50, 100, etc.) in small text at the bottom when hovered or for end steps.

```typescript
// v3/src/features/generator/ColorSwatches/ShadeStrip.tsx
import { makeShadeScale } from '@/core/color/scales'
import { SHADE_STEPS } from '@/core/color/types'
import styles from './ShadeStrip.module.css'

interface ShadeStripProps {
  hex: string
  role: string
}

export function ShadeStrip({ hex, role }: ShadeStripProps) {
  const scale = makeShadeScale(hex)
  return (
    <div className={styles.strip} role="list" aria-label={`${role} shade scale`}>
      {SHADE_STEPS.map(step => (
        <div
          key={step}
          className={styles.cell}
          style={{ background: scale[step] }}
          role="listitem"
          title={`${role}-${step}: ${scale[step]}`}
        >
          {(step === 50 || step === 950) && (
            <span className={styles.label}>{step}</span>
          )}
          {step === 500 && (
            <span className={`${styles.label} ${styles.labelCenter}`}>500</span>
          )}
        </div>
      ))}
    </div>
  )
}
```

`ShadeStrip.module.css`:
```css
.strip {
  display: flex;
  height: 24px;
  border-radius: 0 0 6px 6px;
  overflow: hidden;
  gap: 1px;
}

.cell {
  flex: 1;
  position: relative;
  transition: flex 0.15s;
}

.cell:hover { flex: 1.5; }

.label {
  position: absolute;
  bottom: 3px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 6px;
  font-family: monospace;
  color: rgba(255, 255, 255, 0.55);
  pointer-events: none;
  letter-spacing: 0;
}

.labelCenter {
  color: rgba(255, 255, 255, 0.7);
}
```

- [ ] **Step 2: Implement `ColorSlotCard.tsx`**

A single color column. Shows: role label, hex value, lock icon, and (if locked) the shade strip below.

`ColorSlotCard.module.css`:
```css
.card {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  cursor: grab;
  transition: transform 0.15s, box-shadow 0.15s;
  /* Width managed by parent flex */
}

.card:active { cursor: grabbing; transform: scale(1.02); }

.swatch {
  height: 110px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 8px;
}

.topRow {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.roleLabel {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
  font-family: sans-serif;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

/* On light swatches, labels need to be dark */
.card[data-light="true"] .roleLabel {
  color: rgba(0, 0, 0, 0.55);
  text-shadow: none;
}

.lockBtn {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  transition: background 0.15s;
  color: rgba(255, 255, 255, 0.85);
  padding: 0;
}

.lockBtn:hover { background: rgba(255, 255, 255, 0.3); }

.card[data-light="true"] .lockBtn {
  background: rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 0, 0, 0.15);
  color: rgba(0, 0, 0, 0.6);
}

.bottomRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hex {
  font-size: 10px;
  font-family: monospace;
  color: rgba(255, 255, 255, 0.75);
  letter-spacing: 0;
}

.card[data-light="true"] .hex { color: rgba(0, 0, 0, 0.5); }

.locked .swatch {
  border-radius: 8px 8px 0 0;
}

.removeBtn {
  position: absolute;
  top: 4px;
  right: 32px;
  width: 20px;
  height: 20px;
  background: rgba(0,0,0,0.3);
  border: none;
  border-radius: 3px;
  color: white;
  font-size: 10px;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.card:hover .removeBtn {
  display: flex;
}
```

`ColorSlotCard.tsx`:
```typescript
import { useColorActions } from '@/store'
import type { ColorSlot } from '@/core/color/types'
import { ShadeStrip } from './ShadeStrip'
import styles from './ColorSlotCard.module.css'

const ROLE_LABELS: Record<string, string> = {
  brand: 'Brand',
  secondary: 'Secondary',
  accentA: 'Accent A',
  accentB: 'Accent B',
}

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150
}

interface ColorSlotCardProps {
  slot: ColorSlot
  canRemove: boolean
  onDragStart?: (id: string) => void
  onDragOver?: (id: string) => void
  onDrop?: () => void
}

export function ColorSlotCard({ slot, canRemove, onDragStart, onDragOver, onDrop }: ColorSlotCardProps) {
  const { toggleLock, removeSlot } = useColorActions()
  const isLight = isLightColor(slot.hex)

  return (
    <div
      className={`${styles.card} ${slot.locked ? styles.locked : ''}`}
      data-light={isLight}
      draggable
      onDragStart={() => onDragStart?.(slot.id)}
      onDragOver={(e) => { e.preventDefault(); onDragOver?.(slot.id) }}
      onDrop={onDrop}
    >
      <div className={styles.swatch} style={{ background: slot.hex }}>
        <div className={styles.topRow}>
          <span className={styles.roleLabel}>{ROLE_LABELS[slot.role] ?? slot.role}</span>
          <button
            className={styles.lockBtn}
            onClick={() => toggleLock(slot.id)}
            aria-label={slot.locked ? 'Unlock color' : 'Lock color'}
            title={slot.locked ? 'Click to unlock' : 'Click to lock'}
          >
            {slot.locked ? '🔒' : '🔓'}
          </button>
        </div>
        <div className={styles.bottomRow}>
          <span className={styles.hex}>{slot.hex.toUpperCase()}</span>
        </div>
        {canRemove && slot.role !== 'brand' && (
          <button
            className={styles.removeBtn}
            onClick={() => removeSlot(slot.id)}
            aria-label={`Remove ${ROLE_LABELS[slot.role] ?? slot.role} color`}
            title="Remove color"
          >
            ×
          </button>
        )}
      </div>
      {slot.locked && <ShadeStrip hex={slot.hex} role={ROLE_LABELS[slot.role] ?? slot.role} />}
    </div>
  )
}
```

- [ ] **Step 3: Implement `ColorSwatches.tsx`**

Handles drag-to-reorder using HTML5 drag API. Calls `reorderSlots` action on drop.

`ColorSwatches.module.css`:
```css
.grid {
  display: flex;
  gap: 6px;
  padding: 16px 16px 0;
}

.grid > * {
  flex: 1;
  min-width: 0;
}
```

`ColorSwatches.tsx`:
```typescript
import { useRef, useState } from 'react'
import { useColor, useColorActions } from '@/store'
import { ColorSlotCard } from './ColorSlotCard'
import styles from './ColorSwatches.module.css'

export function ColorSwatches() {
  const { slots } = useColor()
  const { reorderSlots } = useColorActions()
  const dragFrom = useRef<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const handleDragStart = (id: string) => { dragFrom.current = id }
  const handleDragOver = (id: string) => { setDragOverId(id) }
  const handleDrop = () => {
    if (!dragFrom.current || dragOverId === null) return
    const fromIdx = slots.findIndex(s => s.id === dragFrom.current)
    const toIdx = slots.findIndex(s => s.id === dragOverId)
    if (fromIdx >= 0 && toIdx >= 0 && fromIdx !== toIdx) {
      reorderSlots(fromIdx, toIdx)
    }
    dragFrom.current = null
    setDragOverId(null)
  }

  return (
    <div className={styles.grid}>
      {slots.map(slot => (
        <ColorSlotCard
          key={slot.id}
          slot={slot}
          canRemove={slots.length > 1}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add v3/src/features/generator/ColorSwatches/
git commit -m "feat(generator): color swatches — shade strips on locked slots, drag to reorder"
```

---

## Task 3: Harmony hint bar

**Files:**
- Create: `v3/src/features/generator/HarmonyHint.tsx`
- Create: `v3/src/features/generator/HarmonyHint.module.css`

- [ ] **Step 1: Implement `HarmonyHint.tsx`**

Shows only when at least one slot is locked. Names the active harmony model.

`HarmonyHint.module.css`:
```css
.hint {
  margin: 8px 16px 0;
  padding: 6px 10px;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 6px;
  font-size: 11px;
  color: #166534;
  font-family: sans-serif;
  letter-spacing: 0.01em;
  transition: opacity 0.2s;
}

[data-theme="dark"] .hint {
  background: #052e16;
  border-color: #166534;
  color: #86efac;
}

.hidden { display: none; }
```

`HarmonyHint.tsx`:
```typescript
import { useColor } from '@/store'
import styles from './HarmonyHint.module.css'

const MODEL_DESCRIPTIONS: Record<string, string> = {
  monochromatic: 'Monochromatic — all hues unified, varied lightness',
  analogous: 'Analogous — neighboring hues in OKLCH',
  complementary: 'Complementary — high-contrast opposites',
  'split-complementary': 'Split-complementary — base + two near-complements',
  triadic: 'Triadic — vibrant 120° triangle',
  tetradic: 'Tetradic — rich 4-point balance',
  compound: 'Compound — analogous group + strong accent',
}

export function HarmonyHint() {
  const { slots, activeModel } = useColor()
  const hasLocked = slots.some(s => s.locked)
  if (!hasLocked || !activeModel) return null

  return (
    <div className={styles.hint} role="status" aria-live="polite">
      ⚬ Unlocked colors harmonizing — {MODEL_DESCRIPTIONS[activeModel] ?? activeModel}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add v3/src/features/generator/HarmonyHint.tsx v3/src/features/generator/HarmonyHint.module.css
git commit -m "feat(generator): harmony hint bar — names active model when slots are locked"
```

---

## Task 4: Typography specimen

**Files:**
- Create: `v3/src/features/generator/TypographySpecimen/TypographySpecimen.tsx`
- Create: `v3/src/features/generator/TypographySpecimen/TypographySpecimen.module.css`

- [ ] **Step 1: Implement `TypographySpecimen.tsx`**

Renders the heading specimen, body text, scale pills, font names, and lock toggles.

`TypographySpecimen.module.css`:
```css
.section {
  padding: 20px 16px 16px;
  border-top: 1px solid var(--color-border, #e8e4df);
  margin-top: 16px;
}

.fontNames {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.fontNameLabel {
  font-size: 10px;
  color: var(--color-on-surface-subtle, #666);
  font-family: sans-serif;
  letter-spacing: 0.03em;
}

.lockRow {
  display: flex;
  gap: 6px;
}

.lockBtn {
  background: none;
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 4px;
  font-size: 10px;
  padding: 2px 6px;
  cursor: pointer;
  color: var(--color-on-surface-subtle, #666);
  transition: all 0.15s;
}

.lockBtn.locked {
  background: var(--color-interactive-subtle, #fde8e3);
  border-color: var(--color-interactive, #e8543a);
  color: var(--color-interactive, #e8543a);
}

.heading {
  font-size: 26px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--color-on-surface, #111);
  margin-bottom: 8px;
  font-family: var(--font-heading, Georgia, serif);
  /* Prevent very long specimen text from overflowing */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.body {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-on-surface-subtle, #444);
  font-family: var(--font-body, sans-serif);
  margin-bottom: 14px;
}

.scalePills {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.pill {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 4px;
  font-size: 10px;
  font-family: monospace;
  color: var(--color-on-surface-subtle, #555);
}

.pillLabel {
  font-weight: 700;
  color: var(--color-on-surface, #111);
  font-family: sans-serif;
}
```

`TypographySpecimen.tsx`:
```typescript
import { useTypography, useTypographyActions } from '@/store'
import styles from './TypographySpecimen.module.css'

const SPECIMEN_TEXT = 'The quick brown fox jumps over the lazy dog'

export function TypographySpecimen() {
  const { pairing, scale, locks } = useTypography()
  const { toggleLock } = useTypographyActions()

  if (!pairing || !scale) return null

  const SCALE_PILLS = [
    { key: 'h1', label: 'H1' },
    { key: 'h2', label: 'H2' },
    { key: 'h3', label: 'H3' },
    { key: 'body', label: 'Body' },
    { key: 'small', label: 'sm' },
    { key: 'xs', label: 'xs' },
  ] as const

  return (
    <div className={styles.section}>
      <div className={styles.fontNames}>
        <span className={styles.fontNameLabel}>
          Heading: <strong>{pairing.heading}</strong> · Body: <strong>{pairing.body}</strong>
        </span>
        <div className={styles.lockRow}>
          <button
            className={`${styles.lockBtn} ${locks.heading ? styles.locked : ''}`}
            onClick={() => toggleLock('heading')}
            title={locks.heading ? 'Unlock heading font' : 'Lock heading font'}
            aria-pressed={locks.heading}
          >
            {locks.heading ? '🔒' : '🔓'} Heading
          </button>
          <button
            className={`${styles.lockBtn} ${locks.body ? styles.locked : ''}`}
            onClick={() => toggleLock('body')}
            title={locks.body ? 'Unlock body font' : 'Lock body font'}
            aria-pressed={locks.body}
          >
            {locks.body ? '🔒' : '🔓'} Body
          </button>
          <button
            className={`${styles.lockBtn} ${locks.scale ? styles.locked : ''}`}
            onClick={() => toggleLock('scale')}
            title={locks.scale ? 'Unlock scale ratio' : 'Lock scale ratio'}
            aria-pressed={locks.scale}
          >
            {locks.scale ? '🔒' : '🔓'} Scale
          </button>
        </div>
      </div>

      <div
        className={styles.heading}
        style={{ fontFamily: `"${pairing.heading}", serif` }}
        aria-label="Heading specimen"
      >
        {SPECIMEN_TEXT}
      </div>

      <div
        className={styles.body}
        style={{ fontFamily: `"${pairing.body}", sans-serif` }}
        aria-label="Body specimen"
      >
        How vexingly quick daft zebras jump! Pack my box with five dozen liquor jugs.
      </div>

      <div className={styles.scalePills} role="list" aria-label="Type scale">
        {SCALE_PILLS.map(({ key, label }) => {
          const step = scale[key as keyof typeof scale] as { size: number; weight: number } | undefined
          if (!step || typeof step !== 'object') return null
          return (
            <div key={key} className={styles.pill} role="listitem">
              <span className={styles.pillLabel}>{label}</span>
              <span>{Math.round(step.size)}px</span>
              <span>·</span>
              <span>{step.weight}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add v3/src/features/generator/TypographySpecimen/
git commit -m "feat(generator): typography specimen — heading/body/scale + lock toggles"
```

---

## Task 5: Generator footer

**Files:**
- Create: `v3/src/features/generator/GeneratorFooter/GeneratorFooter.tsx`
- Create: `v3/src/features/generator/GeneratorFooter/GeneratorFooter.module.css`

- [ ] **Step 1: Implement `GeneratorFooter.tsx`**

`GeneratorFooter.module.css`:
```css
.footer {
  padding: 12px 16px;
  border-top: 1px solid var(--color-border, #e8e4df);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  background: var(--color-surface, #fff);
}

.hint {
  font-size: 11px;
  color: var(--color-on-surface-subtle, #999);
  font-family: sans-serif;
  flex: 1;
  min-width: 120px;
}

.hint kbd {
  display: inline-block;
  padding: 1px 5px;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border-strong, #ccc);
  border-radius: 3px;
  font-family: monospace;
  font-size: 10px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.vibeChip {
  height: 28px;
  padding: 0 10px;
  background: none;
  border: 1px dashed var(--color-border, #e8e4df);
  border-radius: 14px;
  font-size: 11px;
  color: var(--color-on-surface-subtle, #aaa);
  cursor: not-allowed;
  font-family: sans-serif;
}

.addBtn {
  height: 28px;
  padding: 0 10px;
  background: none;
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  color: var(--color-on-surface, #333);
  font-family: sans-serif;
  transition: background 0.15s;
}

.addBtn:hover { background: var(--color-interactive-subtle, #f5f3f0); }
.addBtn:disabled { opacity: 0.4; cursor: not-allowed; }

.detailBtn {
  height: 28px;
  padding: 0 12px;
  background: var(--color-interactive, #e8543a);
  color: var(--color-on-interactive, #fff);
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: sans-serif;
  transition: opacity 0.15s;
}

.detailBtn:hover { opacity: 0.85; }

/* Mobile: full-width "Generate ✦" button instead of SPACE hint */
.generateMobile {
  display: none;
}

@media (max-width: 768px) {
  .hint { display: none; }
  .footer {
    position: sticky;
    bottom: 0;
    border-top: 1px solid var(--color-border, #e8e4df);
  }
  .generateMobile {
    display: block;
    flex: 1;
    height: 40px;
    background: var(--color-on-surface, #111);
    color: var(--color-background, #f8f7f4);
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }
}
```

`GeneratorFooter.tsx`:
```typescript
import { useColor, useColorActions, useUIActions, useTypographyActions } from '@/store'
import styles from './GeneratorFooter.module.css'

export function GeneratorFooter() {
  const { slots } = useColor()
  const { addSlot } = useColorActions()
  const { setMode } = useUIActions()
  const colorActions = useColorActions()
  const typographyActions = useTypographyActions()

  const handleGenerate = () => {
    colorActions.generate()
    typographyActions.generate(undefined)
  }

  return (
    <div className={styles.footer}>
      <span className={styles.hint}>
        Press <kbd>SPACE</kbd> to generate
      </span>
      <div className={styles.actions}>
        <button
          className={styles.vibeChip}
          disabled
          title="Coming soon — vibe-based generation (Phase 4)"
          aria-disabled="true"
        >
          ✦ vibe
        </button>
        <button
          className={styles.addBtn}
          onClick={addSlot}
          disabled={slots.length >= 8}
          aria-label="Add color slot"
        >
          + Add color
        </button>
        <button
          className={styles.detailBtn}
          onClick={() => setMode('detail')}
          aria-label="Enter detail mode"
        >
          Detail Mode →
        </button>
      </div>
      <button className={styles.generateMobile} onClick={handleGenerate} aria-label="Generate new palette">
        Generate ✦
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add v3/src/features/generator/GeneratorFooter/
git commit -m "feat(generator): footer — SPACE hint, vibe chip placeholder, +Add, Detail Mode →, mobile Generate button"
```

---

## Task 6: Assemble the generator panel

**Files:**
- Create: `v3/src/features/generator/GeneratorPanel.tsx`
- Create: `v3/src/features/generator/GeneratorPanel.module.css`

- [ ] **Step 1: Implement `GeneratorPanel.tsx`**

`GeneratorPanel.module.css`:
```css
.panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-background, #f8f7f4);
  overflow-y: auto;
}

.content {
  flex: 1;
}
```

`GeneratorPanel.tsx`:
```typescript
import styles from './GeneratorPanel.module.css'
import { ColorSwatches } from './ColorSwatches/ColorSwatches'
import { HarmonyHint } from './HarmonyHint'
import { TypographySpecimen } from './TypographySpecimen/TypographySpecimen'
import { GeneratorFooter } from './GeneratorFooter/GeneratorFooter'

export function GeneratorPanel() {
  return (
    <div className={styles.panel}>
      <div className={styles.content}>
        <ColorSwatches />
        <HarmonyHint />
        <TypographySpecimen />
      </div>
      <GeneratorFooter />
    </div>
  )
}
```

- [ ] **Step 2: Verify the full generator panel**

```bash
cd v3 && npm run dev
```

Test:
1. Page loads with 4 color swatches
2. Press SPACE — swatches change color, typography updates
3. Click lock icon — swatch stays on next SPACE press; shade strip appears below
4. Hint bar appears below swatches when at least one is locked
5. Click "+ Add color" — 5th swatch appears
6. Hover any non-brand swatch — "×" remove button appears
7. Typography specimen shows heading + body in loaded fonts
8. Scale pills show correct sizes
9. Click "Detail Mode →" — nothing breaks (detail mode UI comes in 1D)
10. Mobile: narrow browser to <768px — "Generate ✦" button appears at bottom

- [ ] **Step 3: Test keyboard accessibility**

Tab through all interactive elements. Lock buttons, remove buttons, add button, detail mode button must all be reachable and labeled.

- [ ] **Step 4: Commit**

```bash
git add v3/src/features/generator/
git commit -m "feat(generator): generator panel complete — color swatches, typography, footer"
```

---

## Task 7: Keyboard shortcuts and accessibility

- [ ] **Step 1: Verify keyboard handlers in App.tsx**

The spacebar handler from Task 1 Step 4 already handles generation. Add undo/redo:

In `App.tsx`, extend the keydown handler:
```typescript
const onKey = (e: KeyboardEvent) => {
  const isInput = ['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT'].includes((e.target as HTMLElement).tagName)

  if (e.code === 'Space' && !isInput) {
    e.preventDefault()
    colorActions.generate()
    typographyActions.generate(undefined)
    return
  }

  if ((e.metaKey || e.ctrlKey) && e.code === 'KeyZ' && !e.shiftKey) {
    e.preventDefault()
    temporalUndo()
    return
  }

  if ((e.metaKey || e.ctrlKey) && (e.code === 'KeyY' || (e.code === 'KeyZ' && e.shiftKey))) {
    e.preventDefault()
    temporalRedo()
    return
  }
}
```

Import `temporalUndo` and `temporalRedo` from `@/store`.

- [ ] **Step 2: Add focus visible styles to globals.css**

```css
/* Append to v3/src/styles/globals.css */
:focus-visible {
  outline: 2px solid var(--color-interactive, #e8543a);
  outline-offset: 2px;
  border-radius: 3px;
}

button:focus:not(:focus-visible) { outline: none; }
```

- [ ] **Step 3: Run dev and verify**

Test undo: Generate → lock a color → generate again → Ctrl+Z. Previous state should restore.

- [ ] **Step 4: Commit**

```bash
git add v3/src/
git commit -m "feat(a11y): keyboard shortcuts — space/undo/redo, focus-visible styles"
```

---

## Task 8: Final visual check and polish

- [ ] **Step 1: Check dark mode**

Click the theme toggle in the header. The entire UI should switch — background, text, borders, swatch labels all derive from CSS custom properties. Check that `[data-theme="dark"]` is set on `<html>`.

- [ ] **Step 2: Check mobile layout**

Narrow browser to 375px. Should see:
- Single-column color swatches (flex wraps or scrolls)
- Divider hidden
- "Generate ✦" button at the bottom
- Header still visible

- [ ] **Step 3: Run type check**

```bash
cd v3 && npx tsc --noEmit
```

Zero errors expected.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(1B): generator UI complete — swatches, typography, shell, keyboard shortcuts"
```

---

## What Phase 1C receives from 1B

Phase 1C developers:
- Have a fully interactive generator panel on the left
- `<LivePreviewStub />` is the placeholder at `v3/src/features/preview/LivePreviewStub.tsx` — **replace its internals** with the real landing page template
- CSS custom properties are already injected on `:root` — use `var(--color-brand-500)`, `var(--font-heading)`, `var(--font-size-display)` freely in the template
- Do not modify any files under `v3/src/features/generator/` or `v3/src/store/`
- The `SplitPane` right slot receives whatever `<LivePreviewStub>` (soon `<LivePreview>`) renders
