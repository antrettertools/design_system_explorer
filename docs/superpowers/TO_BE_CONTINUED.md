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
      2026-03-21-v3-phase1b-generator-ui.md      ← NEXT
      2026-03-21-v3-phase1c-live-preview.md
      2026-03-21-v3-phase1d-detail-colors-typography.md
      2026-03-21-v3-phase1e-showcase-export-sharing.md
      2026-03-21-v3-phase2-spacing-effects.md
      2026-03-21-v3-phase3-components-figma-sessions.md
```

**Active branch:** `feat/v3-phase1a` (merged from `claude/design-system-architecture-BM2jR`)

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

## What's Next — Phase 1B

**Plan file:** `docs/superpowers/plans/2026-03-21-v3-phase1b-generator-ui.md`

Phase 1B builds the Generator mode UI on top of the foundation:
- Left panel: color swatches with lock icons + shade strips for locked slots
- Left panel: typography specimen (heading + body font preview)
- Right panel: live landing page preview (first template)
- Space bar → `colorActions.generate()` + `typographyActions.generate()`
- "Detail Mode →" button wired to `uiActions.setMode('detail')`
- App shell: two-column split layout with AppShell component

**Key reminder for Phase 1B:** CSS Modules only. All colors via `var(--color-*)`. Never import from `core/` in components.

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
