# palette. v4 — Complete Refinement Design Spec

> **Status:** Approved for planning
> **Date:** 2026-03-21
> **Scope:** Four sequential sub-phases (4A–4D) completing all missing interactivity, color system correctness, component polish, and UX quality.

---

## Background

palette. v3 shipped a solid architecture (Phases 1–3) but left the detail mode largely read-only, the showcase using only the brand color, dark mode incompletely covered, and the app UI/UX below the quality bar the product promises. This spec defines the full remediation across four focused sub-phases.

All work targets `v3/src/`. Architecture rules from `docs/ENGINEERING_AND_DESIGN_GUIDE.md` remain in force throughout: CSS Modules only, no inline styles, no hardcoded colors, React components import from `store/` only (not from `core/` directly).

---

## Phase 4A — Editability

**Goal:** Make every token in detail mode editable. Currently colors, effects, and typography scale are read-only display panels. After 4A every value has an input and every change is reflected live in the preview.

### 4A-1: Color Picker on Swatches

**Trigger:** Any color swatch in detail mode (ShadeScaleSection) or generator mode (ColorSlotCard) shows a color picker popover on click.

**Interaction model:**
- Clicking a swatch opens a small popover anchored to the swatch
- Popover contains: native `<input type="color">` (for OS color picker) + a hex text input (`#rrggbb`) that updates in sync
- Changing the color calls `colorActions.overrideHex(slotId, newHex)` which already exists in the store
- Popover closes on outside click or Escape
- On hover, swatches show a subtle edit icon overlay (✎) with `cursor: pointer` to signal editability
- In generator mode (ColorSlotCard): same popover opens; hex label becomes the trigger alongside the existing swatch area

**Scope:** One `ColorPickerPopover` reusable component in `components/ui/`. Used by both `ColorSlotCard` and `ShadeScaleSection`.

### 4A-2: Effects Tab — Rich Shadow Builder

**Each shadow step (sm, md, lg, xl) gets an inline editor row:**
- Toggle: colored (brand-tinted) / neutral (still exists)
- Per-step expansion: x offset, y offset, blur, spread sliders + color swatch (opens ColorPickerPopover)
- A small shadow preview box showing the live result per step
- Reset button calling `effectsActions.resetShadow(key)`
- The full shadow string is auto-composed from the slider values and written via `effectsActions.overrideShadow(key, value)`

**Parsed format:** Shadows are CSS box-shadow strings (e.g. `0 1px 3px rgba(0,0,0,0.12)`). The editor must parse existing values on open (split into x/y/blur/spread/color components) and reconstruct on change.

### 4A-3: Effects Tab — Focus Ring Editor

**FocusRingSection becomes interactive:**
- Color field: swatch + `ColorPickerPopover`
- Width field: number input (1–4px, step 0.5)
- Offset field: number input (0–4px, step 0.5)
- Changes write to `effects.focusRing` via a new `effectsActions.setFocusRing(partial)` action
- Live preview box updates immediately (already shown in the component, just needs to use editable state)

**New store action required:** `setFocusRing(partial: Partial<FocusRingConfig>)` in `store/effects.ts`.

### 4A-4: Effects Tab — Motion Editor

**MotionSection becomes partially interactive:**
- Duration steps: number input for each ms value (10–1000ms range, step 10). Changes call new `effectsActions.setDuration(step, ms)`.
- Easing curves: read-only display (cubic-bezier strings are hard to edit without a full curve editor — deferred). Add a live animation demo: a small circle that plays the easing when the row is hovered.
- Transition presets: read-only computed values (they compose duration + easing, no separate editing needed).

**New store actions required:** `setDuration(step: string, ms: number)` in `store/effects.ts`. The `MotionConfig` type in `core/effects/types.ts` must keep durations as a mutable record.

### 4A-5: Typography Tab — Scale Ratio + Step Overrides

**ScaleEditor gains editing capability:**
- Scale ratio: a segmented button group (1.125 Minor Second / 1.250 Major Third / 1.333 Perfect Fourth / 1.414 Augmented Fourth / 1.500 Perfect Fifth) + a custom number input for non-preset values. Calls `typographyActions.setScaleRatio(ratio)`.
- Per-step overrides (optional unlock): clicking a step row reveals inputs for size (px), weight, line-height. Changes call a new `typographyActions.overrideStep(stepName, partial)` action.
- A "Reset to generated" button per step.
- The live typography specimen in the right preview updates immediately.

**New store action required:** `setScaleRatio(ratio: number)` and `overrideStep(step, partial)` in `store/typography.ts`. Recalculates the full `TypeScale` from the new ratio (or applies overrides on top of the generated scale).

---

## Phase 4B — Color System Completeness

**Goal:** Make the color system fully correct: three-way background mode, greyscale, font color definitions, complete dark token coverage, and all showcase templates using the full palette (secondary, accent, state colors).

### 4B-1: Three-Way Background Mode

**New state:** `AppTheme` type changes from `'light' | 'dark'` to `'white' | 'light' | 'dark'`.

- **white** — pure white surfaces (`--color-background: #ffffff`, `--color-surface: #ffffff`, `--color-border` stays light)
- **light** — current warm off-white derived from brand (existing behavior, rename from `'light'` to `'light'` for clarity — no functional change)
- **dark** — dark mode (existing behavior)

**UI:** The `toggleTheme` action becomes `setTheme(theme: AppTheme)`. The AppHeader theme control becomes a three-way segmented button: ☀ White | ◑ Light | ◐ Dark. The `◐/○` symbols are replaced entirely.

**Token injection:** `injectTokensToDOM` receives a `theme: AppTheme` param. For `'white'` mode it injects overrides: `--color-background: #ffffff`, `--color-surface: #ffffff` on top of the light token map. For `'light'` and `'dark'` existing behavior is unchanged.

**Share snapshot:** `ShareSnapshot.theme` field type updated to `AppTheme`.

### 4B-2: Dark Token Coverage Completion

**Current gap:** `buildTokenMap` only runs `deriveDarkModeRoles()` for the dark map. State/mood colors, data viz colors, effects tokens, and component tokens have no dark variants.

**Fix:**
- State/mood dark: derive dark state tokens (lighten containers, darken base colors) from `deriveStateMoodRoles` output. Add `deriveDarkStateMoodRoles(brandHex)` to `core/color/semantic.ts`.
- Data viz dark: data viz colors are already perceptually uniform at fixed L/C — they work in both modes. Copy the light data viz tokens into the dark map unchanged (no separate derivation needed).
- Effects dark: shadow colors in dark mode should be darker (less visible on dark backgrounds). The existing `deriveNeutralShadows()` already handles this. In dark mode, always use neutral shadows as the base in the dark token map regardless of `shadowMode` setting.
- Component dark: component tokens reference semantic vars which already flip — copy them unchanged into dark map (already implemented correctly).

### 4B-3: Greyscale Section in Colors Tab

**New section `GreyscaleSection`** added to `ColorsTab` between `ShadeScaleSection` and `SemanticRolesSection`.

**Content:**
- A full 11-step strip from near-white to near-black derived from the brand's neutral scale (already computed in `deriveNeutralRoles`)
- Each cell shows the hex value on hover and is click-to-copy (consistent with ShadeScaleSection)
- Labeled: "Neutral Scale — derived from brand hue at low chroma"
- Read-only in this phase (not editable — the neutrals are fully derived from brand)

### 4B-4: Font Colors Section in Colors Tab

**New section `FontColorsSection`** added to `ColorsTab` after `SemanticRolesSection`.

**Content:** A visual hierarchy preview showing each text role on its background:

| Role token | Label | Example text |
|---|---|---|
| `--color-on-surface` | Primary text | "The quick brown fox" |
| `--color-on-surface-subtle` | Secondary text | "Supporting information" |
| `--color-interactive` | Link / interactive text | "Click to learn more →" |
| `--color-on-interactive` | Text on brand bg | "On brand background" |

Each row: colored dot swatch + token name + live text specimen on appropriate background + WCAG contrast ratio badge.

This section is display + copy-on-click. Editing font colors is done via the color swatch popover on the relevant semantic role (out of scope for this phase).

### 4B-5: Showcase Templates — Full Palette Usage

All four templates (Landing, Dashboard, Blog, System) must use secondary, accentA, accentB, and state colors in appropriate roles.

**Rules for color application:**
- Secondary color (`--color-secondary-*` / `--color-secondary-interactive`): navigation accents, section backgrounds, secondary CTAs, chart lines
- Accent A (`--color-accent-a-*`): highlights, badges, pricing callouts, notification dots
- Accent B (`--color-accent-b-*`): decorative elements, gradient endpoints, icon backgrounds
- State colors (`--color-error`, `--color-warning`, `--color-success`, `--color-info`): status badges, form validation indicators, alert banners, notification states

**Per-template specifics:**

*Landing:* Hero badge uses accentA. Feature card icons rotate through brand/secondary/accentA backgrounds. Footer uses secondary for social links. Add a status badge row showing all 4 state colors.

*Dashboard:* Sidebar active state uses brand. Metric cards use accentA for growth indicators. Chart bars use data viz colors. Alert banner uses warning/error tokens. Recent activity uses success/info dot indicators.

*Blog:* Category tags use secondary. Pull quotes use accentB background. Reading time badge uses accentA. Related articles use secondary borders.

*System (design doc template):* Already shows all slot scales. Add a dedicated "State Colors" section with all 4 state swatches. Add a "Semantic Tokens" table showing all `--color-*` CSS vars and their resolved values.

**Implementation note:** All new color references must use CSS custom properties — never hardcoded hex values.

---

## Phase 4C — Components Completeness

**Goal:** Make the Components tab production-quality — all 7 component types have live previews, token color fields use color pickers, and actual icon packages are installed and switchable.

### 4C-1: Live Component Previews for All 7 Components

Each component accordion in `ComponentTokenSection` gets a rendered specimen using `--component-{name}-*` CSS variables.

**Component specimens:**

- **button** (already exists): primary + hover state. Add disabled state.
- **input**: text input field with placeholder text + focus state + error state
- **card**: a small card with title, body text, optional footer
- **badge**: 3 variants — default, success, error — using state color vars
- **tag**: horizontal list of removable tags
- **tooltip**: a trigger button + visible tooltip bubble above it
- **alert**: info, warning, error, success variants in a compact row

All specimens are purely presentational (no event handlers needed beyond hover CSS). All colors/radius/shadow come exclusively from `--component-{name}-*` CSS vars so they react live to token overrides.

### 4C-2: Color Picker on Component Token Color Fields

In the `ComponentTokenSection` token table, fields whose key is a color token (`bg`, `bgHover`, `text`, `border`, `focusBorder`, `placeholder`, `iconColor`) get a color swatch next to the text input that opens `ColorPickerPopover`. Non-color fields (`radius`, `shadow`, `padding`) remain text-only.

Detection: check if the current value is a CSS var reference like `var(--color-*)` or a resolved hex/rgb string. If yes, render swatch + picker; if it's a complex value (e.g. a spacing/shadow), render text input only.

### 4C-3: Real Icon Packages

Install `lucide-react` as the primary icon package. The `IconLibrarySection` renders actual Lucide icons for the 24 `COMMON_SLUGS` defined in `core/components/icons.ts`.

For the other 4 libraries (Heroicons, Phosphor, Tabler, Radix): show a "not installed" placeholder with install instructions (these are heavy packages — installing all 5 by default is unnecessary for the tool's purpose). The active library selector still updates `components.iconLibrary` in the store; only Lucide renders real icons.

**Size display:** The icon grid respects the `deriveIconSizeMap()` output — icons render at the `md` (20px) size by default with a size selector (xs/sm/md/lg/xl) above the grid.

---

## Phase 4D — UX Polish

**Goal:** Fix all readability, affordance, and navigation issues. Make the app model the same quality it promises to generate.

### 4D-1: Fix All Sub-13px Text in App Chrome

Audit and fix every instance of text below 13px in `v3/src/` (excluding the live preview templates, which intentionally use small helper text).

Known violations to fix:
- `ScaleEditor.tsx:29` — inline `fontSize: 10` ratio hint
- `ShowcaseTab.tsx:95` — inline `fontSize: 11` data viz label
- `SpacingScaleSection.tsx:37` — inline `fontSize: 10` base unit hint
- All `.module.css` files using `font-size: 10px` or `11px` for section labels, meta text, helper hints

**Rule:** Minimum 12px for purely decorative/secondary text. 13px for any text communicating state or value. Body/label = 14px minimum for anything interactive.

### 4D-2: Edit Affordance on Color Swatches

In generator mode (`ColorSlotCard`), on hover:
- Show a small ✎ edit icon in the bottom-right corner of the swatch (using CSS `:hover` on the card, icon reveals with `opacity: 0 → 1` transition)
- Change cursor to `pointer`
- The swatch background slightly dims (`filter: brightness(0.9)`)

In detail mode (`ShadeScaleSection`), each swatch row header (the large color square showing the base hex) gets the same hover treatment. Individual shade steps remain click-to-copy only (they're not independently editable — only the base hex drives the scale).

### 4D-3: Undo/Redo in AppHeader

Add undo/redo buttons to `AppHeader` using the existing `temporalUndo()` / `temporalRedo()` exports from `store/index.ts`.

**UI:** Two small icon buttons (← undo, → redo) between the wordmark and the sessions icon. Disabled state when no history/future. Tooltip text reads: "Undo (Cmd+Z)" / "Redo (Cmd+Shift+Z)" — this is informational only. **Do NOT add new keydown event listeners** — the Cmd+Z / Cmd+Shift+Z shortcuts already work via the existing handler in `App.tsx`. Only wire the button `onClick` to call `temporalUndo()` / `temporalRedo()`. A subtle history indicator (e.g. "· 3 changes") next to the buttons.

### 4D-4: AppHeader — Mode Indicator + Redesign

The header gains contextual information about the current state:

**In generator mode:** Show current harmony model name as a small badge (e.g. "triadic"). Show the current font pairing as "Font A + Font B" in a subtle label.

**In detail mode:** Show the active tab name as a breadcrumb: "palette. / Colors" or "palette. / Typography".

**Theme control:** Replace the `◐/○` symbol button with a three-segment control: `☀ White | ◑ Light | ◐ Dark` (matches the 4B-1 three-way background mode).

**Sessions icon:** Replace the clock SVG with a more recognizable "bookmark/save" icon (💾 or a stack icon). Add a tooltip "Saved sessions".

### 4D-5: Detail Mode Tab Navigation — Overflow Handling

When 7 tabs + back button don't fit horizontally:
- Tabs scroll horizontally with `overflow-x: auto; scroll-snap-type: x mandatory`
- The active tab is always scrolled into view on mount and tab change
- On narrow viewports (< 900px): tab labels truncate to icons or 3-letter abbreviations (Clr / Typ / Spc / Eff / Cmp / Shw / Exp)

No redesign needed for wide viewports — current layout works fine at 1200px+.

### 4D-6: Architecture Violation Fixes

Fix the two violations identified in the review:

1. **`ComponentsTab.tsx` inline styles** → move wrapper styles to `ComponentsTab.module.css`

2. **`core/` imports in feature components** — the following files import from `core/` directly and should instead derive values from store-provided computed data or pre-computed CSS vars:
   - `ShadeScaleSection.tsx`: uses `makeShadeScale()` directly. Alternative: read shade scales from injected `--color-{role}-{step}` CSS vars already in `:root`, or expose a `colorTokens` selector from the store.
   - `SemanticRolesSection.tsx`: uses `deriveBrandRoles()`, `deriveStateMoodRoles()`, `deriveNeutralRoles()`, `deriveDarkModeRoles()` directly. These values are already in the TokenMap — expose a `useColorTokens()` selector from the store that reads the built TokenMap.
   - `SystemTemplate.tsx`: same issue. Read from CSS vars or store-computed TokenMap.

   **Implementation approach:** Add a `useColorTokens()` selector to `store/index.ts` that returns the most-recently-built `TokenMap.light` and `TokenMap.dark` as a plain object. Components read from this instead of calling core functions.

---

## Cross-Cutting Constraints

1. **No inline styles** — all new CSS goes in `.module.css` files
2. **No hardcoded colors** — all colors via `var(--color-*)` custom properties
3. **Dark mode** — every new component must work in all three theme modes (white/light/dark)
4. **Tests** — new store actions need unit tests; new core functions need unit tests; React components need no testing beyond TypeScript compilation (no testing infra for components exists yet)
5. **Layer rule** — new React components import from `store/` only; `core/` is called only from `store/`
6. **CSS Modules** — every new component gets its own `.module.css` sibling file

---

## File Structure (new files per phase)

### Phase 4A
```
v3/src/components/ui/ColorPickerPopover/
  ColorPickerPopover.tsx
  ColorPickerPopover.module.css
v3/src/features/detail/tabs/EffectsTab/
  ShadowBuilder.tsx           (replaces current ShadowSection inner content)
  ShadowBuilder.module.css
  FocusRingEditor.tsx         (replaces current FocusRingSection inner content)
  FocusRingEditor.module.css
  MotionEditor.tsx            (replaces current MotionSection inner content)
  MotionEditor.module.css
```
Store changes: `store/effects.ts` (+setFocusRing, +setDuration), `store/typography.ts` (+setScaleRatio, +overrideStep)

### Phase 4B
```
v3/src/features/detail/tabs/ColorsTab/
  GreyscaleSection.tsx
  GreyscaleSection.module.css
  FontColorsSection.tsx
  FontColorsSection.module.css
v3/src/core/color/semantic.ts     (add deriveDarkStateMoodRoles)
```
Store changes: `store/ui.ts` (AppTheme → 'white'|'light'|'dark'), `store/derived.ts` (dark token coverage), template CSS files updated

### Phase 4C
```
v3/src/features/detail/tabs/ComponentsTab/
  ComponentPreview.tsx        (renders specimen for a given ComponentName)
  ComponentPreview.module.css
```
Package: `lucide-react` added to `package.json`

### Phase 4D
```
(no new files — all changes are modifications to existing files)
v3/src/store/index.ts          (add useColorTokens selector)
v3/src/components/AppShell/AppHeader.tsx + AppHeader.module.css
v3/src/features/detail/DetailMode.tsx + DetailMode.module.css
v3/src/features/detail/tabs/ColorsTab/ShadeScaleSection.tsx  (remove core/ import)
v3/src/features/detail/tabs/ColorsTab/SemanticRolesSection.tsx (remove core/ imports)
v3/src/features/preview/templates/SystemTemplate/SystemTemplate.tsx (remove core/ imports)
```

---

## Success Criteria

| Phase | Definition of done |
|---|---|
| 4A | Every color swatch opens a color picker; shadow/focus ring/motion all have editing inputs; type scale ratio is adjustable; all changes reflect in live preview |
| 4B | Three-way theme switch works; greyscale + font colors sections visible; all 4 showcase templates use secondary/accent/state colors; dark mode renders correctly on all token types |
| 4C | All 7 component types show live specimens that update on token change; Lucide icons render in the icon grid; library selector switches icon set |
| 4D | No text below 13px in app chrome; undo/redo buttons in header; swatches have edit hover affordance; `tsc --noEmit` shows zero errors; no `core/` imports in feature components |

---

## Development Cycle (applies to every phase)

Every phase follows the same full-circle discipline. No phase is considered done until every step below passes.

### Step 1 — Read before writing

Before touching any file, the developer reads:
- The relevant plan task in full
- Every file listed under "Files to modify" in that task
- The engineering guide (`docs/ENGINEERING_AND_DESIGN_GUIDE.md`) section relevant to the work

### Step 2 — Write tests first (core/ and store/ changes only)

For any new function in `core/` or new action in `store/`:
1. Create the test file first (e.g. `core/effects/__tests__/effects.test.ts`)
2. Write failing tests that specify the exact expected behaviour
3. Run `cd v3 && npx vitest run` — confirm tests fail with the expected error
4. Implement the function/action
5. Run tests again — confirm they pass

React components (`features/`, `components/`) do not require Vitest tests. TypeScript compilation is the test for components.

### Step 3 — Implement

Follow the plan task by task, in order. Mark each task done only when:
- The code compiles (`tsc --noEmit` passes)
- The feature works visually in the browser (run `cd v3 && npm run dev`)
- No console errors appear for that feature

Never mark a task done speculatively. Verify in the browser.

### Step 4 — Per-task verification commands

Run after completing each task:

```bash
cd v3

# TypeScript — zero errors required
npx tsc --noEmit

# Unit tests — all must pass (current count shown for reference)
npx vitest run

# Dev server smoke test — open browser, exercise the feature
npm run dev
```

If `tsc --noEmit` reports errors, fix them before moving to the next task. Do not accumulate type errors.

### Step 5 — Lint and format

After all tasks in a phase are complete:

```bash
cd v3

# Lint
npx eslint src --ext .ts,.tsx --max-warnings 0

# If the project has prettier configured:
npx prettier --check src
```

Fix all warnings. Zero warnings is the bar.

### Step 6 — Full test suite

```bash
cd v3
npx vitest run
```

All tests must pass. The test count must be ≥ the count at phase start (new tests added for new core/store logic; no regressions allowed).

### Step 7 — Build verification

```bash
cd v3
npm run build
```

The production build must complete with zero errors and zero warnings. Bundle size should not increase by more than 50 KB gzipped without justification.

### Step 8 — Browser QA checklist

Before calling a phase complete, manually verify each item:

**All phases:**
- [ ] App loads without console errors
- [ ] Space bar generates a new palette in generator mode
- [ ] Cmd+Z undoes the last generation
- [ ] Detail mode opens and all tabs are accessible
- [ ] All three background modes (white / light / dark) render correctly
- [ ] Live preview updates when tokens change

**Phase 4A specific:**
- [ ] Clicking any color swatch in generator mode opens the color picker
- [ ] Clicking a color swatch in detail mode (Colors tab) opens the color picker
- [ ] Changing a color via the picker updates the live preview immediately
- [ ] Shadow builder sliders update the shadow preview in real time
- [ ] Focus ring editor updates the focus ring preview in real time
- [ ] Motion duration inputs accept values and update CSS vars
- [ ] Type scale ratio buttons change the typography specimen immediately
- [ ] All new inputs have visible focus states

**Phase 4B specific:**
- [ ] Three-way theme selector (White / Light / Dark) in header works
- [ ] White mode: all surfaces are pure `#ffffff`
- [ ] Dark mode: all text is readable (no white-on-white or black-on-black)
- [ ] Greyscale section appears in Colors tab
- [ ] Font Colors section appears in Colors tab showing specimens
- [ ] Landing template: hero badge uses accentA, feature icons use secondary
- [ ] Dashboard template: chart bars use data viz colors, alerts use state colors
- [ ] Blog template: category tags use secondary, pull quotes use accentB
- [ ] System template: state color section visible

**Phase 4C specific:**
- [ ] All 7 component accordions show a live specimen when expanded
- [ ] Changing a color token override updates the component specimen immediately
- [ ] Lucide icons render in the icon grid (real icons, not placeholders)
- [ ] Icon size selector changes icon sizes in the grid

**Phase 4D specific:**
- [ ] No text in the app chrome appears smaller than 13px (use browser inspector)
- [ ] Undo/redo buttons appear in header; they are disabled when no history exists
- [ ] Hovering a color swatch shows the ✎ edit affordance
- [ ] Header shows harmony model badge in generator mode
- [ ] Detail mode tab bar scrolls horizontally when window is narrow (< 900px)
- [ ] `grep -r "from '@/core/" v3/src/features v3/src/components` returns zero results

### Step 9 — Commit

One commit per logical task (not per file). Commit message format:

```
feat(phase): short description of what was added

- bullet describing key implementation detail
- bullet for any non-obvious decision made

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

Examples:
- `feat(4a): add ColorPickerPopover component with hex input sync`
- `feat(4b): derive dark state/mood tokens in buildTokenMap`
- `fix(4d): remove core/ imports from ShadeScaleSection`

### Step 10 — Update TO_BE_CONTINUED.md

After every phase (not every task), append a new session log entry to `docs/superpowers/TO_BE_CONTINUED.md` following the existing format:
- What was built (file by file)
- Test results (count)
- Commits (hashes)
- What the next phase receives

---

## Testing Strategy by Layer

### `core/` — Pure unit tests (Vitest)

Every new or modified function in `core/` needs a test file in `core/**/__tests__/`. Tests must:
- Cover the happy path with a concrete example
- Cover edge cases (empty input, boundary values, single-slot palette)
- Not import from React, store, or any browser API

**New functions requiring tests:**
- `core/color/semantic.ts` → `deriveDarkStateMoodRoles(brandHex)` — test that output colors are darker than input state colors
- `core/effects/types.ts` / `shadows.ts` — `parseShadowString(css)` utility if added — test parsing of various shadow formats
- `store/effects.ts` — `setFocusRing`, `setDuration` actions — test state mutations via store snapshot

### `store/` — State mutation tests (Vitest)

New store actions must be tested by:
1. Setting up a default store state
2. Calling the action
3. Asserting the new state shape

Do not test React rendering in Vitest. Use `useStore.getState()` / `useStore.setState()` directly in tests.

### `components/` and `features/` — TypeScript + browser

No Vitest for React components. The acceptance criteria are:
1. `tsc --noEmit` passes (type safety)
2. Visual verification in browser (see QA checklist above)
3. No console errors during normal usage

### Regression guard

The test count at the start of each phase is a floor. Record it:

```bash
cd v3 && npx vitest run --reporter=verbose 2>&1 | tail -5
```

At phase end, the count must be ≥ start count. Any test that was passing must still pass.

---

## API Reference for New Store Actions

Developers must implement these exact signatures. Do not rename or change parameter types.

### Phase 4A store additions

```typescript
// store/effects.ts — EffectsActions additions
setFocusRing(partial: Partial<{ color: string; width: string; offset: string }>): void
setDuration(step: string, ms: number): void

// store/typography.ts — TypographyActions additions
setScaleRatio(ratio: number): void
overrideStep(step: keyof TypeScale, partial: Partial<TypeScaleStep>): void
resetStep(step: keyof TypeScale): void
```

### Phase 4B store additions

```typescript
// store/ui.ts — AppTheme type change
type AppTheme = 'white' | 'light' | 'dark'  // was 'light' | 'dark'

// store/ui.ts — UIActions change
setTheme(theme: AppTheme): void  // REPLACES toggleTheme entirely
// toggleTheme is REMOVED. All callers (AppHeader, ShowcaseTab) must switch to setTheme().

// store/derived.ts — signature change
buildTokenMap(
  slots, scale, pairing, dataVizN, spacing, effects, opts?,
  theme?: AppTheme  // new param
): TokenMap
```

### Phase 4D store additions

```typescript
// store/index.ts — new selector
useColorTokens(): { light: Record<string, string>; dark: Record<string, string> }
// Returns the most recently built TokenMap. Updated on every palette change.
// Allows feature components to read computed color values without importing core/.
```

---

## Error Handling Requirements

**ColorPickerPopover:**
- If `hex` prop is not a valid 6-digit hex, default to `#888888` without throwing
- If `onChange` callback throws, log to console but do not crash the picker

**Shadow parser (`parseShadowString`):**
- If the CSS shadow string cannot be parsed (e.g. contains `var()` references), display the raw string in a read-only text input instead of the sliders. Do not throw.

**Font loader in ScaleEditor:**
- If `setScaleRatio` is called with a ratio < 1.0 or > 2.0, clamp to [1.0, 2.0] in the store action before applying.

**Dark token derivation:**
- If `deriveDarkStateMoodRoles` is called with an invalid hex, return the light values unchanged (graceful degradation, no error).

---

## Accessibility Requirements

Every new interactive element must meet:

1. **Keyboard accessible** — reachable via Tab, operable via Enter/Space/Arrow keys as appropriate
2. **Focus visible** — uses `var(--focus-ring-color)` / `var(--focus-ring-width)` for focus outline (the existing `:focus-visible` rule in `globals.css` handles this if the element does not override `outline`)
3. **ARIA labels** — any icon-only button must have `aria-label`. Color pickers must have `aria-label="Edit [role] color"`.
4. **Color contrast** — all new text must meet WCAG AA (4.5:1 for normal text, 3:1 for large text) against its background token

---

## Definition of Done — Per Phase

A phase is done when ALL of the following are true:

```
[ ] npx tsc --noEmit          → 0 errors
[ ] npx vitest run            → all tests pass, count ≥ phase-start count
[ ] npm run build             → 0 errors, 0 warnings
[ ] npx eslint src            → 0 warnings (--max-warnings 0)
[ ] Browser QA checklist      → all items checked off
[ ] TO_BE_CONTINUED.md        → new session log appended
[ ] Git commits               → one commit per task, correct format
```

No partial credit. If any item is not checked, the phase is not done.
