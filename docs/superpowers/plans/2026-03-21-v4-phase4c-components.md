# palette. v4 Phase 4C — Components Completeness Implementation Plan

> **Spec reference:** `docs/superpowers/specs/2026-03-21-v4-complete-refinement-design.md` §Phase 4C
> **Branch:** `feat/v4-phase4c-components` (branch off `feat/v4-phase4b-color-system`)
> **Prerequisite:** Phase 4B complete — `tsc --noEmit` clean, all tests passing
> **Goal:** Live component previews for all 7 component types. Color pickers on token color fields. Real Lucide icons in the icon grid.

---

## Before You Start

1. Read `docs/ENGINEERING_AND_DESIGN_GUIDE.md` — the entire Layer Rule section.
2. Read `v3/src/features/detail/tabs/ComponentsTab/ComponentTokenSection.tsx` in full.
3. Read `v3/src/core/components/tokens.ts` in full — understand what tokens are derived for each component.
4. Read `v3/src/core/components/icons.ts` — understand `COMMON_SLUGS` and `ICON_LIBRARIES`.
5. Record the test count: `cd v3 && npx vitest run`
6. Confirm `npx tsc --noEmit` is clean.

---

## Architecture Rules (non-negotiable for this phase)

- `ComponentPreview` goes in `features/detail/tabs/ComponentsTab/` — not a shared primitive (it's feature-specific)
- All specimen colors come from `--component-{name}-*` CSS vars — never hardcoded
- `lucide-react` must be added to `v3/package.json` before any import
- No imports from `core/` in React components
- All new CSS in `.module.css` files, no inline styles

---

## Task 1 — Install `lucide-react`

```bash
cd v3 && npm install lucide-react
```

Verify it added to `package.json` under `dependencies`.

Then run:
```bash
npx tsc --noEmit
```
Should still be clean. If Lucide's types cause issues, add `"skipLibCheck": true` to `tsconfig.json` (only if needed).

**No code changes yet** — just the install. Commit:
```bash
git add v3/package.json v3/package-lock.json
git commit -m "feat(4c): install lucide-react for icon grid

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 2 — `ComponentPreview` component

**Files to create:**
- `v3/src/features/detail/tabs/ComponentsTab/ComponentPreview.tsx`
- `v3/src/features/detail/tabs/ComponentsTab/ComponentPreview.module.css`

**What it does:** Renders a live specimen for a given component name, using `--component-{name}-*` CSS variables. All styling comes from these vars so any token override immediately updates the preview.

**Component API:**
```typescript
interface ComponentPreviewProps {
  componentName: ComponentName  // 'button' | 'input' | 'card' | 'badge' | 'tag' | 'tooltip' | 'alert'
}
```

**Specimens per component:**

All specimens use `var(--component-{name}-{token})` for every color/radius/shadow. Font uses `var(--font-body)`. Font size uses `var(--font-size-body, 14px)`.

**button:**
```tsx
<div className={styles.previewRow}>
  <button className={styles.btnDefault}>Primary</button>
  <button className={styles.btnHover}>Hover</button>
  <button className={styles.btnDefault} disabled>Disabled</button>
</div>
```
CSS:
```css
.btnDefault {
  background: var(--component-button-bg);
  color: var(--component-button-text);
  border: 1px solid var(--component-button-border);
  border-radius: var(--component-button-radius);
  box-shadow: var(--component-button-shadow);
  padding: 8px 16px;
  font-size: var(--font-size-body, 14px);
  font-family: var(--font-body, sans-serif);
  cursor: pointer;
}
.btnDefault:disabled { opacity: 0.4; cursor: not-allowed; }
.btnHover {
  /* Same as btnDefault but with bgHover */
  background: var(--component-button-bg-hover);
  /* ...all other props same */
}
```

**input:**
```tsx
<div className={styles.inputWrapper}>
  <input className={styles.inputField} placeholder="Placeholder text" />
  <input className={styles.inputFieldFocused} placeholder="Focused state" />
  <input className={styles.inputFieldError} placeholder="Error state" value="Invalid input" readOnly />
</div>
```
CSS: Use `--component-input-bg`, `--component-input-text`, `--component-input-border`, `--component-input-placeholder`, `--component-input-focus-border`, `--component-input-radius`.

**card:**
```tsx
<div className={styles.card}>
  <div className={styles.cardTitle}>Card Title</div>
  <div className={styles.cardBody}>Card body text goes here. A short description.</div>
  <div className={styles.cardFooter}>
    <span>Footer text</span>
  </div>
</div>
```
CSS: `--component-card-bg`, `--component-card-border`, `--component-card-radius`, `--component-card-shadow`, text uses `--color-on-surface` and `--color-on-surface-subtle`.

**badge:**
```tsx
<div className={styles.badgeRow}>
  <span className={styles.badge}>Default</span>
  <span className={styles.badgeSuccess} style={{ background: 'var(--color-success-container)', color: 'var(--color-success)' }}>Success</span>
  <span className={styles.badgeError} style={{ background: 'var(--color-error-container)', color: 'var(--color-error)' }}>Error</span>
</div>
```
CSS: `--component-badge-bg`, `--component-badge-text`, `--component-badge-border`, `--component-badge-radius`, `padding: 2px 8px`.

**tag:**
```tsx
<div className={styles.tagRow}>
  {['Design', 'System', 'Tokens'].map(t => (
    <span key={t} className={styles.tag}>
      {t} <button className={styles.tagRemove} aria-label={`Remove ${t}`}>×</button>
    </span>
  ))}
</div>
```
CSS: `--component-tag-bg`, `--component-tag-text`, `--component-tag-border`, `--component-tag-radius`.

**tooltip:**
```tsx
<div className={styles.tooltipWrapper}>
  <button className={styles.tooltipTrigger}>Hover me</button>
  <div className={styles.tooltip} role="tooltip">
    This is a tooltip with helpful context
  </div>
</div>
```
CSS: `--component-tooltip-bg`, text uses `var(--color-on-surface)` or white depending on tooltip bg.

**alert:**
```tsx
<div className={styles.alertStack}>
  {(['info','warning','error','success'] as const).map(type => (
    <div key={type} className={styles.alert}
      style={{
        background: `var(--color-${type}-container, #eee)`,
        border: `1px solid var(--color-${type}, #999)`,
        color: 'var(--color-on-surface)',
        borderRadius: 'var(--component-alert-radius)',
        padding: '10px 14px',
        fontSize: 'var(--font-size-body, 14px)',
      }}
    >
      {type}: This is an {type} alert message.
    </div>
  ))}
</div>
```

**Important:** The alert and badge specimens use inline styles for the state color vars because these are not `--component-*` vars — they are semantic state colors. This is acceptable in specimens (they are presentational content, not structural layout). For structural layout CSS (padding, display, gap), use CSS modules.

**The `.module.css` file** defines only structural layout (display, padding, gap, font-family, font-size using CSS vars). All brand colors go through CSS vars.

---

## Task 3 — Wire `ComponentPreview` into `ComponentTokenSection`

**Files to modify:**
- `v3/src/features/detail/tabs/ComponentsTab/ComponentTokenSection.tsx`

**Read the file first.**

**Changes:**

1. Import `ComponentPreview`.
2. Remove the existing hardcoded button preview block (lines 107–142, the `{comp === 'button' && ...}` block).
3. Replace it with `<ComponentPreview componentName={comp} />` — applies to ALL components when the accordion is open.

```tsx
{isOpen && (
  <div className={styles.accordionBody}>
    <div className={styles.tokenTable}>
      {/* ...existing token rows... */}
    </div>
    <div className={styles.previewWrapper}>
      <span className={styles.previewLabel}>Preview</span>
      <ComponentPreview componentName={comp} />
    </div>
  </div>
)}
```

4. Add `.previewWrapper` to `ComponentTokenSection.module.css`:
```css
.previewWrapper {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}
.previewLabel {
  font-size: 13px;
  color: var(--color-on-surface-subtle);
  margin-bottom: var(--spacing-sm);
  display: block;
  font-family: var(--font-body, sans-serif);
}
```

**Verify in browser:**
- Open each of the 7 component accordions
- All show a rendered specimen
- Change a token (e.g. button bg) → specimen updates immediately
- Three theme modes (white/light/dark) all look correct

```bash
cd v3 && npx tsc --noEmit
```

---

## Task 4 — Color pickers on token color fields in `ComponentTokenSection`

**Files to modify:**
- `v3/src/features/detail/tabs/ComponentsTab/ComponentTokenSection.tsx`
- `v3/src/features/detail/tabs/ComponentsTab/ComponentTokenSection.module.css`

**Read the file first.**

**What changes:**

Token rows whose key is a color field (`bg`, `bgHover`, `text`, `border`, `focusBorder`, `placeholder`, `iconColor`) get an inline color swatch before the text input. Clicking the swatch opens `ColorPickerPopover`.

**Color key detection:**
```typescript
const COLOR_KEYS = new Set(['bg', 'bgHover', 'text', 'border', 'focusBorder', 'placeholder', 'iconColor'])

function isColorKey(key: string): boolean {
  return COLOR_KEYS.has(key)
}
```

**For each token row:**
```tsx
{isColorKey(key) && (
  <div
    className={styles.tokenColorSwatch}
    style={{ background: currentValue }}
    ref={swatchRefs.current[`${comp}-${key}`]}
    onClick={() => setOpenPicker(`${comp}-${key}`)}
    title="Click to edit color"
  />
)}
<input
  className={styles.tokenInput}
  type="text"
  value={currentValue}
  onChange={(e) => overrideComponentToken(comp, key, e.target.value)}
  aria-label={`${comp} ${key}`}
/>
{openPicker === `${comp}-${key}` && (
  <ColorPickerPopover
    hex={currentValue.startsWith('#') ? currentValue : '#888888'}
    onChange={hex => overrideComponentToken(comp, key, hex)}
    onClose={() => setOpenPicker(null)}
    anchorRef={swatchRefs.current[`${comp}-${key}`]!}
  />
)}
```

State management:
```typescript
const [openPicker, setOpenPicker] = useState<string | null>(null)
const swatchRefs = useRef<Record<string, HTMLDivElement | null>>({})
```

**Note:** The current value is typically a CSS var reference like `var(--color-interactive)` — not a hex string. The color swatch will try to render this as a background color; browsers will resolve the var correctly in the swatch. However, `ColorPickerPopover` needs a hex string. If `currentValue` is a CSS var reference, the picker opens with `#888888` as the starting hex (the user then picks the override color). This is correct behavior — it turns a "derived from token" value into an explicit override.

```bash
cd v3 && npx tsc --noEmit
```

**Verify:**
- Open button accordion → bg field has a color swatch (renders the brand color)
- Click swatch → color picker opens
- Pick a color → bg field updates to hex value, button preview updates
- Reset (↺) → bg reverts to `var(--color-interactive)` (or whatever the derived value was)

---

## Task 5 — Real Lucide icons in `IconLibrarySection`

**Files to modify:**
- `v3/src/features/detail/tabs/ComponentsTab/IconLibrarySection.tsx`
- `v3/src/features/detail/tabs/ComponentsTab/IconLibrarySection.module.css`

**Read both files first.**

**What changes:**

The `COMMON_SLUGS` array in `core/components/icons.ts` contains 24 icon names (e.g. `['home', 'search', 'settings', ...]`). These map to Lucide icon component names with PascalCase (e.g. `Home`, `Search`, `Settings`).

**Dynamic Lucide icon rendering:**
```typescript
import * as LucideIcons from 'lucide-react'

function getLucideIcon(slug: string): React.ComponentType<{ size?: number; strokeWidth?: number }> | null {
  // Convert slug to PascalCase: 'arrow-right' → 'ArrowRight'
  const name = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')
  const icon = (LucideIcons as Record<string, unknown>)[name]
  return typeof icon === 'function' ? icon as React.ComponentType<{ size?: number; strokeWidth?: number }> : null
}
```

**Icon grid rendering (when `iconLibrary === 'lucide'`):**
```tsx
{COMMON_SLUGS.map(slug => {
  const Icon = getLucideIcon(slug)
  return (
    <div key={slug} className={styles.iconCell} title={slug}>
      {Icon
        ? <Icon size={iconSize} strokeWidth={1.5} />
        : <span className={styles.iconMissing}>?</span>
      }
    </div>
  )
})}
```

**Add icon size selector above the grid:**
```tsx
const SIZE_OPTIONS = [
  { label: 'XS', value: 12 },
  { label: 'SM', value: 16 },
  { label: 'MD', value: 20 },
  { label: 'LG', value: 24 },
  { label: 'XL', value: 32 },
]
const [iconSize, setIconSize] = useState(20)
```
Render as a segmented button group (same CSS pattern as the existing modeBtn in ShadowSection).

**For non-Lucide libraries:** Show a placeholder state:
```tsx
{iconLibrary !== 'lucide' && (
  <div className={styles.libraryPlaceholder}>
    <span className={styles.libraryPlaceholderTitle}>{iconLibrary} not installed</span>
    <span className={styles.libraryPlaceholderHint}>
      Run <code>npm install @heroicons/react</code> to use this library
    </span>
  </div>
)}
```

The library selector still calls `setIconLibrary()` — the store state updates correctly even when the icons aren't installed.

**CSS updates:** Remove any placeholder SVG rendering code. Icon cells should have consistent sizing: `width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 6px; transition: background 0.12s;` with a hover background.

**Verify in browser:**
- Lucide library selected → 24 real icons render
- Size selector → icons scale to 12/16/20/24/32px
- Switch to Heroicons → "not installed" placeholder message
- Switch back to Lucide → icons reappear

```bash
cd v3 && npx tsc --noEmit
```

---

## Task 6 — Phase 4C full verification

```bash
cd v3

# 1. TypeScript — zero errors
npx tsc --noEmit

# 2. All tests — count >= phase-start count
npx vitest run

# 3. Lint
npx eslint src --ext .ts,.tsx --max-warnings 0

# 4. Build — check bundle size
npm run build
# Bundle should not increase by more than 50KB gzipped over phase-start size
# lucide-react tree-shakes well — using `import * as` will be larger than named imports
# If bundle is too large, switch to named imports: import { Home, Search, ... } from 'lucide-react'
```

**Browser QA:**
- [ ] All 7 component accordions (button, input, card, badge, tag, tooltip, alert) show a specimen
- [ ] Button: Default + Hover + Disabled states visible
- [ ] Input: Default + Focused + Error states visible
- [ ] Card: title + body + footer visible
- [ ] Badge: Default + Success + Error variants
- [ ] Tag: 3 tags with remove buttons
- [ ] Tooltip: trigger button + tooltip bubble visible
- [ ] Alert: 4 state variants (info/warning/error/success) visible
- [ ] Change button bg token → button specimen updates immediately
- [ ] Button bg swatch is clickable → color picker opens
- [ ] Pick a color → bg field becomes hex, specimen updates
- [ ] Reset → reverts to CSS var reference, specimen reverts to derived color
- [ ] Lucide icons: 24 real icons visible in grid (not placeholder SVGs)
- [ ] Icon size XS → icons are tiny; XL → icons are large
- [ ] Switch library to Heroicons → "not installed" message appears
- [ ] Switch back to Lucide → icons reappear
- [ ] All 3 theme modes (white/light/dark) look correct on component specimens
- [ ] No console errors

---

## Task 7 — Commit and update session log

**Commit messages:**
- `feat(4c): install lucide-react`
- `feat(4c): ComponentPreview — live specimens for all 7 component types`
- `feat(4c): wire ComponentPreview into all component accordions`
- `feat(4c): color picker on token color fields in ComponentTokenSection`
- `feat(4c): real Lucide icons in IconLibrarySection with size selector`

**Update `docs/superpowers/TO_BE_CONTINUED.md`** — new session log entry.

---

## Handoff to Phase 4D

Phase 4D receives from Phase 4C:
- All component accordions show live specimens
- `ColorPickerPopover` used in 3 places (color swatches, focus ring, component tokens)
- Lucide icons installed and rendering
- All tests passing, `tsc --noEmit` clean
- Bundle size noted (compare at start of 4D)
