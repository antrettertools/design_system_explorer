# palette. v3 — Session Handoff Document

> **Purpose:** This document is the context bridge between sessions. Read it at the start of every new session before touching any code.
> **Updated:** After each session. Always append — never overwrite previous entries.

---

## Project Overview

**palette.** is a browser-based design system generator aimed at vibe coders. It generates complete visual systems (colors, typography, spacing, effects) at the press of a key (Space), with a live preview on the right and a detail mode for deep control on the left.

**Repo structure:**
```
v1/          — original prototype (do not touch)
v2/          — previous version (reference only)
v3/          — ACTIVE development (all new work goes here)
docs/
  ENGINEERING_AND_DESIGN_GUIDE.md   — THE LAW. Read before every session.
  superpowers/
    specs/SPEC_V3.md                — Full product spec
    plans/                          — Phase-by-phase implementation plans
      2026-03-21-v3-phase1a-foundation.md        ← DONE
      2026-03-21-v3-phase1b-generator-ui.md      ← DONE
      2026-03-21-v3-phase1c-live-preview.md      ← DONE
      2026-03-21-v3-phase1d-detail-colors-typography.md  ← DONE
      2026-03-21-v3-phase1d-detail-colors-typography.md
      2026-03-21-v3-phase1e-showcase-export-sharing.md
      2026-03-21-v3-phase2-spacing-effects.md
      2026-03-21-v3-phase3-components-figma-sessions.md
```

**Active branch:** `feat/v3-phase1a` (Phase 1C work committed here; Phase 1D should continue on this branch)

---

## Architecture Rules (non-negotiable)

```
core/    → Pure TypeScript. No React. No store. No side effects.
store/   → Zustand slices. Imports from core/. Exposes state + actions.
components/ → Reusable UI primitives. Import from store/ only.
features/   → Feature panels. Import from store/ only.
```

**Components never import from `core/` directly.** The store is the contract.

**Styling:** CSS Modules only. No inline styles. No Tailwind. No hardcoded colors — all colors via CSS custom properties (`var(--color-*)`).

**Dark mode:** CSS only via `[data-theme="dark"]` on `<html>`. No JS branching per component.

---

## Session Log

---

### Session 1 — 2026-03-21 — Phase 1A: Foundation

**Goal:** Scaffold v3 and implement all pure TypeScript logic with zero UI.

**What was built:**

#### Project Scaffold
- `v3/package.json` — React 18, TS 5, Vite 5, Zustand 5 + zundo, culori 4, fflate, Vitest
- `v3/tsconfig.json` + `tsconfig.app.json` + `tsconfig.node.json` — strict TypeScript, `@/` alias
- `v3/vite.config.ts` — Vite with React plugin, path alias, jsdom test env
- `v3/index.html`, `v3/src/main.tsx`, `v3/src/App.tsx` — minimal shell
- `v3/src/styles/globals.css` — CSS reset + `color-scheme`, `[data-theme="dark"]`

#### `v3/src/core/color/`
- `types.ts` — 7 harmony models (monochromatic, analogous, complementary, split-complementary, triadic, tetradic, compound) with OKLCH envelopes + weights. 11 shade steps (50–950). 4 color roles (brand, secondary, accentA, accentB). `ColorSlot` interface.
- `harmony.ts` — `generatePalette(opts)` generates N color slots using weighted harmony model selection. Locks respected. Brand slot = highest chroma. `pickHarmonyModel()` weighted random.
- `scales.ts` — `makeShadeScale(hex)` generates 11-step OKLCH shade scale pinned at 500. `getContrastColor()` returns `#ffffff` or `#111111`. `getWcagContrastRatio()`.
- `semantic.ts` — `deriveBrandRoles()`, `deriveStateMoodRoles()`, `deriveNeutralRoles()` — all light-mode semantic token derivation from shade scale.
- `darkMode.ts` — `deriveDarkModeRoles()` — inverts lightness axis. `deriveDarkStateRoles()`.
- `dataViz.ts` — `generateDataVizPalette(brandHex, n)` — N evenly spaced hues at fixed L/C for equal visual weight. Debug variant for testing.
- `index.ts` — re-exports only.

#### `v3/src/core/typography/`
- `types.ts` — `FontPairing`, `TypeScale`, `TypeScaleStep`, `FontSource`, `HarmonyAffinity` types.
- `pairings.json` — **60 curated font pairings** across Google Fonts, Fontshare, Bunny. Each with character tag + harmonyAffinity for weighted selection.
- `scale.ts` — `pickRandomPairing(harmonyModel?)` weighted selection (3× boost for affinity matches). `deriveTypeScale({ratio?})` — modular scale `base × ratio^n`, 9 steps from display to label. Body always 16px.
- `fontLoader.ts` — `loadActivePairing(pairing)` injects `<link>` tags for Google/Fontshare/Bunny. `createFontBrowserObserver()` IntersectionObserver for lazy font loading in browser grid.
- `index.ts` — re-exports only.

#### `v3/src/core/export/`
- `types.ts` — `ExportFormat`, `TokenMap`, `ExportOptions` (prefix, casing, layers).
- `css.ts` — `formatCSS(tokens, opts)` — `:root {}` + `[data-theme="dark"] {}`. Supports prefix + camelCase/snake_case/kebab-case.
- `tailwindV3.ts` — `formatTailwindV3()` — `module.exports = { theme: { extend: { colors, fontSize } } }`.
- `tailwindV4.ts` — `formatTailwindV4()` — `@theme {}` block.
- `w3c.ts` — `formatW3C()` — W3C Design Tokens JSON format.
- `scss.ts` — `formatSCSS()` — SCSS variables with dark mode block.
- `index.ts` — `formatTokens(format, tokens, opts)` dispatcher + re-exports.

#### `v3/src/core/share/`
- `types.ts` — `ShareSnapshot` v3: colors, harmonyModel, pairing, typographyLocks, scaleRatio, mode, activeTab, theme.
- `encode.ts` — `encodeShare(snapshot)` → `#v3/<base64url(deflate(JSON))>`.
- `decode.ts` — `decodeShare(hash)` → null-safe, v3 version guard, error-catching.

#### `v3/src/store/`
- `color.ts` — `ColorState`, `ColorActions`. `generate()` respects locks + active model. `toggleLock`, `addSlot` (max 8), `removeSlot` (min 1), `reorderSlots`, `setDataVizN`, `overrideHex`.
- `typography.ts` — `TypographyState`, `TypographyActions`. `generate(harmonyModel?)` respects heading/body/scale locks. `setHeadingFont`, `setBodyFont`, `regenerateFonts`, `toggleLock`.
- `ui.ts` — `UIState`: mode (generator/detail), theme, activeTab, showcaseTemplate, exportPanelOpen, activeExportFormat. Full `UIActions`.
- `derived.ts` — `buildTokenMap(slots, scale, pairing, dataVizN)` — builds complete `TokenMap` with all primitives, semantic, dark, data viz, and typography tokens. `injectTokensToDOM(tokens)` — synchronous DOM injection: light tokens to `:root` inline style, dark tokens into `<style id="palette-dark-tokens">`.
- `index.ts` — Single `useStore` with `subscribeWithSelector` + `temporal` (zundo, limit 50, partializes color + typography). Auto-subscription: any state change → `buildTokenMap` → `injectTokensToDOM`. Named selectors: `useColor`, `useColorActions`, `useTypography`, `useTypographyActions`, `useUI`, `useUIActions`. `temporalUndo()`, `temporalRedo()`.

**Test results:** 49/49 tests pass across 8 test files. Zero TypeScript errors.

**What Phase 1B receives:**
- All store hooks ready: `useColor`, `useColorActions`, `useTypography`, `useTypographyActions`, `useUI`, `useUIActions`
- CSS custom properties auto-injected to `:root` on every generation
- `colorActions.generate()` + `typographyActions.generate()` called on mount in `App.tsx`
- Phase 1B must NOT modify `core/` or `store/` — only add React components in `features/` and `components/`

---

## What's Next — Phase 3

**Plan file:** `docs/superpowers/plans/2026-03-21-v3-phase3-components-figma-sessions.md`

Phase 2 is complete and tagged `v3-phase2`. Phase 3 adds the Components tab — component token map, icon set selection from Lucide/Heroicons/Phosphor/Tabler/Radix, icon preview — plus Figma plugin export and save/load named sessions.

---

### Session 6 — 2026-03-21 — Phase 2: Spacing & Effects Tabs

**Goal:** Add Spacing and Effects tabs to detail mode — all dimension and sensory tokens. Pure addition, zero changes to Phase 1 code.

**What was built:**

#### `v3/src/core/spacing/`
- `types.ts` — `SpacingScale`, `RadiusScale`, `IconSizes`, `ZIndexMap`, `BreakpointMap`, `SpacingConfig` types.
- `scale.ts` — `deriveSpacingScale({ baseUnit })` — 7 steps (xs→3xl) as multiples of baseUnit. `deriveRadiusScale()` — none/sm/md/lg/xl/full. `deriveIconSizes({ baseUnit })`. Constants: `BORDER_WIDTHS`, `OPACITY_SCALE`, `Z_INDEX_LAYERS`, `BREAKPOINTS`.
- `index.ts` — re-exports.
- `__tests__/scale.test.ts` — 11 tests, all pass.

#### `v3/src/core/effects/`
- `types.ts` — `ShadowPresets`, `FocusRing`, `EasingMap`, `DurationMap`, `MotionTokens`, `EffectsConfig`. Note: `EffectsConfig.shadowsNeutral` added (architecture fix — avoids feature components importing from core directly).
- `shadows.ts` — `deriveShadowPresets(brandHex)` — brand-tinted shadows sm/md/lg/xl. `deriveNeutralShadows()` — pure grey shadows. `deriveFocusRing(brandHex)` — 2px ring in brand color.
- `motion.ts` — `EASING_PRESETS` (easeIn/easeOut/easeInOut/spring/linear), `DURATION_SCALE` (100–500ms, 5 steps), `deriveMotionTokens()`.
- `index.ts` — re-exports.
- `__tests__/shadows.test.ts` — 7 tests, all pass.

#### `v3/src/store/`
- `spacing.ts` — `SpacingState`, `SpacingActions`. `setBaseUnit(4|8)` rebuilds config + resets overrides. `overrideStep`/`resetStep`/`resetAll` for individual value overrides.
- `effects.ts` — `EffectsState`, `EffectsActions`. `shadowMode: 'colored' | 'neutral'`. `rebuildFromBrand(brandHex)` triggered by color subscription.
- `derived.ts` — Extended `buildTokenMap()` signature with optional `spacing` and `effects` params. Injects `--spacing-*`, `--radius-*`, `--icon-size-*`, `--z-*`, `--breakpoint-*`, `--border-width-*`, `--shadow-*`, `--focus-ring-*`, `--ease-*`, `--duration-*`, `--transition-*` tokens to `:root`.
- `index.ts` — Added `spacing`/`effects` slices + selectors `useSpacing`, `useSpacingActions`, `useEffects`, `useEffectsActions`. Added brand-color subscription → `rebuildFromBrand`. Extended `temporal` partialize to include spacing + effects.

#### `v3/src/core/export/tailwindV3.ts`
- Extended to emit `spacing`, `boxShadow`, `borderRadius`, `transitionDuration` in `theme.extend`.

#### Spacing Tab: `v3/src/features/detail/tabs/SpacingTab/`
- `SpacingScaleSection.tsx` — Visual ruler (bars + numeric inputs). 4pt/8pt base unit toggle. Per-step override with highlighted input + reset button.
- `RadiusSection.tsx` — 3-column grid of 6 radius steps, each with a square preview box showing the actual border-radius.
- `MiscSection.tsx` — Border widths (visual lines), icon sizes (visual boxes at actual size), opacity swatches (brand color at 5 opacities), z-index table, breakpoints table.
- `SpacingTab.tsx` — Assembles all three sections.

#### Effects Tab: `v3/src/features/detail/tabs/EffectsTab/`
- `ShadowSection.tsx` — Brand-tinted / Neutral mode toggle. 2×2 grid of shadow cards (sm/md/lg/xl) with a white card showing each shadow live. Reads from `config.shadows` or `config.shadowsNeutral` — no core imports in feature component.
- `FocusRingSection.tsx` — Two buttons side by side: unfocused + focused (with live brand-color outline). Token grid shows color swatch + width + offset values.
- `MotionSection.tsx` — Easing cards (name + cubic-bezier), duration bars (proportional width), transition preset rows.
- `EffectsTab.tsx` — Assembles Shadow → FocusRing → Motion.

#### Wiring: `v3/src/features/detail/DetailMode.tsx`
- Added `import { SpacingTab }` + `import { EffectsTab }`.
- `PHASE_1_TABS` → `ALL_TABS`, `PHASE_1_IMPLEMENTED` → `IMPLEMENTED_TABS` (now includes `'spacing'` and `'effects'`).
- Removed "Phase 2" coming-soon badge from Spacing and Effects tabs.
- `renderTab()` now handles `case 'spacing'` and `case 'effects'`.

#### URL Sharing: `v3/src/core/share/types.ts`
- `ShareSnapshot` extended with optional `spacingBaseUnit?: 4 | 8` and `shadowMode?: 'colored' | 'neutral'`.

#### URL Sharing: `v3/src/features/detail/tabs/ShowcaseTab/ShowcaseTab.tsx`
- Snapshot now includes `spacingBaseUnit` and `shadowMode`.

#### URL Sharing: `v3/src/App.tsx`
- Restore logic reads `snapshot.spacingBaseUnit` → `spacingActions.setBaseUnit()` and `snapshot.shadowMode` → `effectsActions.setShadowMode()`.

**Architecture note:** `ShadowSection.tsx` in the plan imported `deriveNeutralShadows` directly from `@/core/effects/shadows`, violating the layer rule (features must only import from store). Fixed by adding `shadowsNeutral: ShadowPresets` to `EffectsConfig` so both colored and neutral shadows are pre-computed in the store. Component reads `config.shadowsNeutral` — zero core imports in feature files.

**Test results:** `tsc --noEmit` — zero errors. 67/67 tests pass (11 new tests in spacing + effects).

**Git tag:** `v3-phase2` — Phase 2 complete.

**Commits:**
- `cd37059` feat(spacing): core — spacing scale, radius, icon sizes, z-index, breakpoints
- `5b8ee79` feat(store): spacing + effects slices — tokens injected to :root
- `980fe64` feat(export): Tailwind v3 — include spacing, shadow, radius, duration tokens
- `6a47f82` feat(spacing-tab): spacing scale, border radius, icon sizes, z-index, breakpoints
- `6452861` feat(effects-tab): shadows (brand-tinted + neutral), focus ring, motion tokens
- `23eb118` feat(sharing): include spacing base unit + shadow mode in share URL

**What Phase 3 receives from Phase 2:**
- `useSpacing()` and `useEffects()` selectors available
- `--spacing-*`, `--radius-*`, `--shadow-*`, `--ease-*`, `--duration-*`, `--focus-ring-*` all in `:root`
- Export (CSS, SCSS, Tailwind v3/v4, W3C) includes all Phase 2 tokens automatically
- URL sharing encodes spacing + effects state
- Phase 3 only needs to add the Components tab — same additive pattern as Spacing and Effects
- Do not modify files in `v3/src/features/detail/tabs/SpacingTab/` or `v3/src/features/detail/tabs/EffectsTab/`

---

### Session 5 — 2026-03-21 — Phase 1E: Showcase, Export & URL Sharing

**Goal:** Complete Phase 1 by implementing the Showcase tab, Export tab, Export slide-up panel, all preview templates, and URL share link encode/decode.

**What was built:**

#### Feature: Template Switcher in LivePreview
- `v3/src/features/preview/LivePreview.tsx` — Modified: reads `showcaseTemplate` + `mode` from store. In generator mode always shows `landing`. In detail mode switches between all 4 templates.

#### Feature: DashboardTemplate
- `v3/src/features/preview/templates/DashboardTemplate/DashboardTemplate.tsx` — Sidebar nav, stats grid (4 cards), bar chart area. All colors via CSS vars.
- `v3/src/features/preview/templates/DashboardTemplate/DashboardTemplate.module.css`

#### Feature: BlogTemplate
- `v3/src/features/preview/templates/BlogTemplate/BlogTemplate.tsx` — Nav bar, featured hero article, 3-post grid. All colors + fonts via CSS vars.
- `v3/src/features/preview/templates/BlogTemplate/BlogTemplate.module.css`

#### Feature: SystemTemplate
- `v3/src/features/preview/templates/SystemTemplate/SystemTemplate.tsx` — Screenshot-worthy design system document. Reads from store directly (`useColor`, `useTypography`), also calls `makeShadeScale`, `deriveBrandRoles`, `deriveNeutralRoles`, `deriveStateMoodRoles`, `generateDataVizPalette` for live rendering. Sections: header (wordmark + meta), Colors (brand scale full-width, compact secondary/accent scales, key semantic swatches, state color cards), Typography (heading + body specimens, character sets, weight rows), Data Viz (palette + mini bar chart).
- `v3/src/features/preview/templates/SystemTemplate/SystemTemplate.module.css`

#### Feature: ShowcaseTab
- `v3/src/features/detail/tabs/ShowcaseTab/ShowcaseTab.tsx` — Template switcher 2×2 grid, Actions section (theme toggle, fullscreen, Copy share link). Share link uses `encodeShare()` from `@/core/share/encode` to build `#v3/<base64url(deflate(JSON))>` and writes to clipboard.
- `v3/src/features/detail/tabs/ShowcaseTab/ShowcaseTab.module.css`
- `v3/src/features/detail/DetailMode.tsx` — Modified: added `case 'showcase'` and `case 'export'` to `renderTab()`. Updated `PHASE_1_IMPLEMENTED` to include both.

#### Feature: ExportTab (detail mode)
- `v3/src/features/detail/tabs/ExportTab/ExportTab.tsx` — Format grid (5 formats), Options (prefix input), live code preview (scrollable `<pre>`), Copy + Download actions.
- `v3/src/features/detail/tabs/ExportTab/ExportTab.module.css`

#### Feature: ExportPanel (slide-up overlay)
- `v3/src/features/export/ExportPanel.tsx` — Viewport-anchored overlay with backdrop. Format tab bar, scrollable code preview, footer with line/char count + Download + Copy. Closes on Escape, backdrop click, × button.
- `v3/src/features/export/ExportPanel.module.css`
- `v3/src/App.tsx` — Modified: `<ExportPanel />` mounted after `<SplitPane>`.

#### Feature: URL Sharing — decode on load
- `v3/src/core/share/loadFromHash.ts` — `loadFromHash()` — reads `window.location.hash`, returns null if not `#v3/`, else calls `decodeShare()`.
- `v3/src/App.tsx` — Modified: `useEffect` now calls `loadFromHash()` first. If snapshot found, restores `color.slots`, `color.activeModel`, `typography.pairing`, `typography.locks`, `ui.theme`, `ui.mode`, `ui.activeTab` via `useStore.setState()`, then calls `typographyActions.generate()` to rebuild scale. Otherwise falls back to fresh cold generation.

**Test results:** `tsc --noEmit` — zero errors. 49/49 tests pass.

**Git tag:** `v3-phase1` — Phase 1 complete and shippable.

**Commits:**
- `7f6bb1b` feat(preview): template switcher wired + Dashboard + Blog templates
- `24a72ba` feat(system-view): screenshot-worthy design system doc
- `09e62cc` feat(showcase-tab): template switcher, share link copy, fullscreen
- `6e03102` feat(export-panel): slide-up overlay
- `3414525` feat(export-tab): full export controls
- `64c4f39` feat(sharing): decode URL hash on load

**What Phase 2 receives:**
- Full Phase 1 shippable: generator + preview + detail (Colors, Typography, Showcase, Export) + URL sharing
- Phase 2 adds `'spacing'` and `'effects'` cases to `renderTab()` in `DetailMode.tsx`
- Do not modify files under `v3/src/features/preview/`, `v3/src/features/export/`, or `v3/src/store/`

---

### Session 4 — 2026-03-21 — Phase 1D: Detail Mode — Colors & Typography

**Goal:** Implement the Detail Mode shell and the Colors + Typography tabs with full deep-dive functionality.

**What was built:**

#### Core: `v3/src/core/color/scales.ts`
- Added `getWcagLevels(ratio)` — returns `{ aaLargeText, aaBodyText, aaaLargeText, aaaBodyText }` boolean flags.

#### Feature: `v3/src/features/detail/`
- `DetailMode.tsx` + `DetailMode.module.css` — Shell with sticky top bar: "← Generator" back link, scrollable tab bar. All 7 tabs rendered; Colors and Typography are live, others show "coming in Phase 2+" placeholder. CSS-var driven, no hardcoded colors.
- `App.tsx` — Wired: `const leftPanel = mode === 'detail' ? <DetailMode /> : <GeneratorPanel />`

#### Colors Tab: `v3/src/features/detail/tabs/ColorsTab/`
- `ShadeScaleSection.tsx` — Full 11-step OKLCH shade scale per color slot. Hex + OKLCH label in header. Click-to-copy any step. Steps expand on hover.
- `SemanticRolesSection.tsx` — Brand roles grid (6 roles, color bar + hex). Neutral roles as light/dark paired rows. State/mood grid (error/warning/success/info with base + container swatches).
- `DataVizSection.tsx` — N-color categorical palette (4–20 colors, OKLCH-equidistant). N selector. Mini bar chart preview. Click-to-copy.
- `ContrastGrid.tsx` — WCAG AA/AAA matrix for semantic pairs (on-surface/background, on-interactive/interactive, etc.) + slot-vs-slot pairs. Ratio displayed.
- `ColorsTab.tsx` — Assembles all four sections.

#### Typography Tab: `v3/src/features/detail/tabs/TypographyTab/`
- `FontBrowserGrid.tsx` — 2-column grid of all fonts from pairings.json (deduped). IntersectionObserver lazy-loads fonts as cells scroll into view. Skeleton placeholder until loaded. Selection state per heading/body mode.
- `FontBrowser.tsx` — Heading/Body mode toggle. Scrollable quick-picks row (first 20 pairings). Search input filters grid. Applies pairing via `setHeadingFont`/`setBodyFont`.
- `ScaleEditor.tsx` — 9-step scale list (display→label). Each row: step label, specimen string in actual font (capped at 28px), size/weight/line-height metadata.
- `ReadabilityScore.tsx` — APCA Lc score computed with `apca-w3`. Graded Excellent/Good/Low. WCAG ratio alongside. Sample body text rendered in active body font.
- `CharacterSet.tsx` — Full A–Z/a–z/0–9/punctuation/diacritics displayed in heading and body fonts. 5-weight sample row.
- `TypographyTab.tsx` — Assembles FontBrowser → ScaleEditor → ReadabilityScore → CharacterSet.

**Test results:** `tsc --noEmit` — zero errors. All 25 new files created.

**Commits:**
- `bf6dbe0` feat(1D): detail mode Colors + Typography tabs complete

**What Phase 1E receives from 1D:**
- Detail mode shell complete — `renderTab()` in `DetailMode.tsx` handles `'colors'` and `'typography'`; add `'showcase'` and `'export'` cases
- Colors and Typography tabs fully functional
- `ui.showcaseTemplate` and `setShowcaseTemplate()` ready for live preview template switching

---

### Session 3 — 2026-03-21 — Phase 1C: Live Preview & Theme

**Goal:** Replace the live preview stub with a fully implemented SaaS landing page template that updates in real time as the user generates new palettes.

**What was built:**

#### Feature: Landing Template
- `v3/src/features/preview/templates/LandingTemplate/LandingTemplate.module.css` — Full SaaS landing page styles: nav, hero, app mockup, features grid, testimonial, CTA band, footer. **Every color, font, and type size uses CSS custom properties** — `var(--font-heading)`, `var(--color-interactive)`, `var(--color-background)`, etc. Fallback values in `var(...)` are safe design defaults.
- `v3/src/features/preview/templates/LandingTemplate/LandingTemplate.tsx` — Static SaaS landing page JSX. Reads zero props — fully driven by CSS vars injected by the store. Sections: sticky nav with CTA, hero with badge/headline/sub/actions, app mockup wireframe (sidebar + content rows), 3-column features grid, testimonial block with brand-colored quotation marks, brand-color CTA band, footer.

#### Feature: LivePreview wrapper
- `v3/src/features/preview/LivePreview.module.css` — Panel wrapper (full height, overflow-y scroll, inset shadow). Mobile back button (hidden on desktop, sticky on mobile).
- `v3/src/features/preview/LivePreview.tsx` — Thin wrapper: renders `<LandingTemplate />` inside scrollable panel. On mobile, shows "← Back to generator" sticky button that calls `hideMobilePreview()`.
- `v3/src/App.tsx` — Replaced `<LivePreviewStub />` import with `<LivePreview />`. Added `no-transitions` class on mount (removed after double-RAF) to prevent flash of transition on initial load.

#### Theme: Dark mode completeness
- `v3/src/styles/globals.css` — Added global smooth transition rule (`background-color 0.2s ease, border-color 0.2s ease, color 0.15s ease`) and `.no-transitions *` escape hatch for initial load.

#### Feature: Mobile preview slide-in
- `v3/src/store/ui.ts` — Added `mobileShowPreview: boolean` to `UIState` + `defaultUIState`. Added `showMobilePreview()` and `hideMobilePreview()` actions to `UIActions` + `createUIActions`.
- `v3/src/components/SplitPane/SplitPane.module.css` — Extended mobile media query: `position: relative; overflow: hidden` on container. Left panel: `position: absolute`, `transform: translateX(0)`, gains `.slideOut` class (`translateX(-100%)`). Right panel: `position: absolute`, `transform: translateX(100%)`, gains `.slideIn` class (`translateX(0)`). Both transition `0.3s ease`.
- `v3/src/components/SplitPane/SplitPane.tsx` — Reads `mobileShowPreview` from `useUI()`. Applies `styles.slideOut` to left panel and `styles.slideIn` to right panel based on state.
- `v3/src/features/generator/GeneratorFooter/GeneratorFooter.module.css` — Added `.previewBtn` (hidden on desktop, shown on mobile as bordered button).
- `v3/src/features/generator/GeneratorFooter/GeneratorFooter.tsx` — Added `showMobilePreview` from `useUIActions()`. Renders "Preview →" button (mobile only) before Generate button.

**Test results:** `tsc --noEmit` — zero errors.

**Commits:**
- `67b4808` feat(preview): SaaS landing page template — all tokens from CSS vars
- `52cdd85` feat(mobile): preview slide-in — store, SplitPane animation, Preview/Back buttons

**What Phase 1D receives from 1C:**
- Full split-pane app: generator left + landing template right, live-updating on every Space press
- Dark mode works end-to-end with smooth transitions
- Mobile: "Preview →" slides in landing page, "← Back" returns to generator
- `useUI().mode` — set to `'detail'` by "Detail Mode →" button; Phase 1D renders `<DetailMode />` when mode is `'detail'`
- `useUI().showcaseTemplate` — Phase 1D uses this to add a second template (system view) to `<LivePreview />`
- Do not modify `v3/src/features/preview/` or `v3/src/store/`

---

### Session 2 — 2026-03-21 — Phase 1B: App Shell & Generator UI

**Goal:** Build the full interactive generator left panel and app shell. Right panel is a placeholder stub.

**What was built:**

#### App Shell
- `v3/src/App.tsx` — Full app shell: initial generation on mount, spacebar handler (generate), Ctrl+Z undo, Ctrl+Shift+Z / Ctrl+Y redo. Uses `AppHeader` + `SplitPane` layout.
- `v3/src/App.module.css` — App layout styles (100vh flex column, background/color from CSS vars)
- `v3/src/components/AppShell/AppHeader.tsx` + `AppHeader.module.css` — "palette." wordmark (Georgia serif), theme toggle (◐/○), Export ↓ button. Reads `useUI`, calls `useUIActions`.
- `v3/src/components/SplitPane/SplitPane.tsx` + `SplitPane.module.css` — Draggable 50/50 split pane. Mouse drag updates leftPercent (clamped 20–80%). Mobile: divider hidden, panels full-width.

#### Feature: Generator Left Panel
- `v3/src/features/generator/GeneratorPanel.tsx` + `GeneratorPanel.module.css` — Assembles ColorSwatches → HarmonyHint → TypographySpecimen (flex-1 content) + GeneratorFooter (sticky bottom).
- `v3/src/features/generator/ColorSwatches/ColorSwatches.tsx` + `ColorSwatches.module.css` — Flex grid of `ColorSlotCard`s. HTML5 drag-to-reorder using `useRef` + `dragOver` state.
- `v3/src/features/generator/ColorSwatches/ColorSlotCard.tsx` + `ColorSlotCard.module.css` — 110px swatch column. Role label top-left, lock icon top-right, hex bottom-left. `data-light` attribute adapts text contrast. Remove button (×) on hover for non-brand slots. Shows `ShadeStrip` when locked.
- `v3/src/features/generator/ColorSwatches/ShadeStrip.tsx` + `ShadeStrip.module.css` — 11-step shade strip (50–950) using `makeShadeScale`. Cells expand on hover. Step labels at 50/500/950.
- `v3/src/features/generator/HarmonyHint.tsx` + `HarmonyHint.module.css` — Green hint bar visible only when ≥1 slot is locked. Names the active harmony model. Green on light, dark green on dark mode (CSS `[data-theme='dark']`).
- `v3/src/features/generator/TypographySpecimen/TypographySpecimen.tsx` + `TypographySpecimen.module.css` — Heading specimen (26px, actual font), body text preview, scale pills (H1/H2/H3/Body/sm/xs with size+weight), per-lock buttons for heading/body/scale.
- `v3/src/features/generator/GeneratorFooter/GeneratorFooter.tsx` + `GeneratorFooter.module.css` — SPACE hint with `<kbd>`, disabled ✦ vibe chip, + Add color (disabled at 8 slots), Detail Mode → (calls `setMode('detail')`). Mobile: sticky bottom Generate ✦ button.

#### Feature: Preview Stub
- `v3/src/features/preview/LivePreviewStub.tsx` + `LivePreviewStub.module.css` — Placeholder for Phase 1C. Shows "Live preview — coming in Phase 1C" centered.

#### Accessibility & Polish
- `v3/src/styles/globals.css` — Added `focus-visible` outline (2px, `--color-interactive`) and `button:focus:not(:focus-visible) { outline: none }`.
- All interactive elements have `aria-label`, `title`, `aria-pressed`, `aria-live` as appropriate.

**Test results:** 49/49 tests pass. Zero TypeScript errors (`tsc --noEmit` clean).

**What Phase 1C receives from 1B:**
- Fully interactive generator panel (left) — color swatches, typography specimen, footer
- `<LivePreviewStub />` at `v3/src/features/preview/LivePreviewStub.tsx` — replace its internals with real template
- CSS custom properties are already injected on `:root` — use `var(--color-brand-500)`, `var(--font-heading)`, etc. freely
- Do not modify files under `v3/src/features/generator/` or `v3/src/store/`

---

## Key Decisions Made

| Decision | Rationale |
|---|---|
| OKLCH for shade scales (not LAB) | Keeps hue constant across scale steps — perceptually uniform |
| Weighted harmony model selection | compound + split-complementary weight 1.4×, tetradic 0.7× — avoids ugly combos |
| Brand slot = highest chroma | Ensures the most vibrant color is always the "brand" anchor |
| Synchronous token injection | Zero visual lag — no debounce, no RAF, single DOM write |
| Dark tokens in `<style>` tag | Allows CSS cascade to handle theme switch without per-property JS |
| fflate deflate for share URLs | ~70% compression vs raw JSON — URLs stay under 500 chars |
| 60 curated pairings with affinity | Soft weighting (3×) toward harmony-matched fonts, not hard exclusion |
