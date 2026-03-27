# UX Polish — Option C: Full Fix + Static Lucide App Chrome

**Date:** 2026-03-22
**Branch:** feat/v3-phase1a
**Scope:** Full audit fix — 20 issues across icons, token wiring, animations, inline styles, and UX polish

---

## Decision

**Option C**: Fix all 20 issues in one coherent pass. App chrome statically imports Lucide (independent of the user's selected icon library). Component preview sections (IconLibrarySection, template previews) continue to use the user-selected library.

**TypographySpecimen**: heading uses `var(--font-size-h1)`, body uses `var(--font-size-body)` — actual scale values.

---

## Architecture Principle

```
App Chrome (AppHeader, DetailMode, SessionsDrawer, ColorSlotCard, etc.)
  → Always uses Lucide React (statically imported, version-stable)
  → Does NOT react to iconLibrary store value

Component Previews (IconLibrarySection, template previews)
  → Uses user-selected icon library (lucide / heroicons / phosphor / tabler / radix)
```

---

## Issue Registry & Fixes

### Category 1: Icons — Critical (6 files)

| Location | Problem | Fix |
|---|---|---|
| `AppHeader.tsx:64-75` | `↩` / `↪` for undo/redo | Lucide `Undo2` / `Redo2` |
| `AppHeader.tsx:83-86` | Inline `<svg>` path for sessions bookmark | Lucide `Bookmark` |
| `AppHeader.tsx:11-13` | `☀` / `◑` / `◐` for theme switcher | Lucide `Sun` / `SunDim` / `Moon` |
| `AppHeader.tsx:101` | `Export ↓` text arrow | Lucide `Download` |
| `DetailMode.tsx:60` | `← Generator` text arrow | Lucide `ArrowLeft` |
| `ColorSlotCard.tsx:65,78` | `🔒` / `🔓` emoji | Lucide `Lock` / `LockOpen` |
| `TypographySpecimen.tsx:35,40,45` | `🔒` / `🔓` emoji | Lucide `Lock` / `LockOpen` |
| `SessionsDrawer.tsx:125,176` | `×` / `✕` text chars | Lucide `X` |
| `GeneratorFooter.tsx:43,50` | `→` text arrows in buttons | Lucide `ArrowRight` |
| `GeneratorFooter.tsx:28,58` | `✦` unicode sparkle | Lucide `Sparkles` |

### Category 2: Typography — Not wired to design system

| Location | Problem | Fix |
|---|---|---|
| `TypographySpecimen.module.css:44` | `font-size: 26px` hardcoded | `var(--font-size-h1)` |
| `TypographySpecimen.module.css:57` | `font-size: 14px` hardcoded | `var(--font-size-body)` |
| `ReadabilityScore.module.css:53` | `font-size: 16px` hardcoded | `var(--font-size-body)` |

### Category 3: Colors — Hardcoded, not semantic tokens

| Location | Problem | Fix |
|---|---|---|
| `ContrastGrid.module.css:62-74` | `#dcfce7/#15803d` pass, `#fee2e2/#dc2626` fail, `#dbeafe/#1d4ed8` AAA | `var(--color-success-container)` / `var(--color-success)` etc. |
| `ReadabilityScore.module.css:48-50` | Same green/yellow/red hardcoded | Semantic tokens |
| `ExportPanel.module.css:142` | `.copied { background: #15803d }` | `var(--color-success, #15803d)` |

### Category 4: Animation & Hover States

| Location | Problem | Fix |
|---|---|---|
| `ColorSlotCard.module.css:98-106` | `display: none → flex` (can't animate) | `opacity: 0; visibility: hidden` → `opacity: 1; visibility: visible` + transition |
| `AppHeader.module.css` | No `:active` on export/history buttons | `transform: scale(0.96)` on `:active` |
| `GeneratorFooter.module.css` | No `:active` on CTA buttons | Same |
| `TypographySpecimen.module.css` | No explicit transition on lockBtn | `transition: all var(--ui-duration-2)` |
| `ColorSlotCard.module.css:117` | `swatch::after` always white (invisible on light swatches) | Adaptive color using `[data-light=true]` |

### Category 5: Inline Styles → CSS Modules

| Location | Fix |
|---|---|
| `SemanticRolesSection.tsx:77` | Add `.subsectionTitleSpaced` class |
| `ContrastGrid.tsx:100` | Add `.cellRight` class |
| `MotionSection.tsx:61` | Add `.subsectionLabelSpaced` class |
| `MiscSection.tsx:32` | Add `.iconSizeItem` class |
| `MiscSection.tsx:19` | Add `.borderWidthBar` class (fix `width: 60` number bug) |
| `SessionsDrawer.tsx:153` | Add `.emptyStateHint` class |

### Category 6: UX Polish

| Location | Problem | Fix |
|---|---|---|
| `SplitPane.module.css` | 4px divider too narrow to grab | Add `::before` pseudo-element as 12px transparent hit zone |
| `TypographySpecimen.module.css` | `white-space: nowrap` clips heading | `-webkit-line-clamp: 2` + `white-space: normal` |
| `ShadeStrip.module.css` | Labels always white (invisible on light shades) | Detect via JS computed luminance, set dark label variant |
| `ContrastGrid.module.css` | No hover feedback on cells | Subtle `outline` on hover |
| `SessionsDrawer.module.css` | No transition on closeBtn | `transition: background var(--ui-duration-2)` |

---

## Files Modified

```
v3/src/components/AppShell/AppHeader.tsx
v3/src/components/AppShell/AppHeader.module.css
v3/src/components/SplitPane/SplitPane.module.css
v3/src/features/detail/DetailMode.tsx
v3/src/features/detail/DetailMode.module.css
v3/src/features/generator/ColorSwatches/ColorSlotCard.tsx
v3/src/features/generator/ColorSwatches/ColorSlotCard.module.css
v3/src/features/generator/ColorSwatches/ShadeStrip.tsx
v3/src/features/generator/ColorSwatches/ShadeStrip.module.css
v3/src/features/generator/TypographySpecimen/TypographySpecimen.tsx
v3/src/features/generator/TypographySpecimen/TypographySpecimen.module.css
v3/src/features/generator/GeneratorFooter/GeneratorFooter.tsx
v3/src/features/generator/GeneratorFooter/GeneratorFooter.module.css
v3/src/features/sessions/SessionsDrawer.tsx
v3/src/features/sessions/SessionsDrawer.module.css
v3/src/features/detail/tabs/ColorsTab/ContrastGrid.tsx
v3/src/features/detail/tabs/ColorsTab/ContrastGrid.module.css
v3/src/features/detail/tabs/ColorsTab/SemanticRolesSection.tsx
v3/src/features/detail/tabs/ColorsTab/SemanticRolesSection.module.css
v3/src/features/detail/tabs/TypographyTab/ReadabilityScore.module.css
v3/src/features/export/ExportPanel.module.css
v3/src/features/detail/tabs/EffectsTab/MotionSection.tsx
v3/src/features/detail/tabs/EffectsTab/MotionSection.module.css
v3/src/features/detail/tabs/SpacingTab/MiscSection.tsx
v3/src/features/detail/tabs/SpacingTab/MiscSection.module.css
```

---

## Non-Goals

- No changes to design system token generation logic
- No changes to store/state management
- No changes to component preview icon rendering (already correct)
- No changes to export formats
- The `⚬` in `HarmonyHint.tsx` is a status dot — intentional decorative text, keep as-is
- Hardcoded fallback values (e.g. `#e8543a` as fallback in `var(--color-interactive, #e8543a)`) are acceptable — they only fire if CSS vars fail
