# palette. v4 — Product Specification

> **Version:** 4.0
> **Date:** 2026-03-21
> **Status:** Approved for implementation
> **Builds on:** palette. v3 (all phases 1–3 complete)
> **Implementation design:** `docs/superpowers/specs/2026-03-21-v4-complete-refinement-design.md`
> **Implementation plans:** `docs/superpowers/plans/2026-03-21-v4-phase4a-editability.md` through `…phase4d-ux-polish.md`

---

## What is palette. v4?

v4 is the quality and completeness release. v3 built the architecture — tokens, store, generator, exports, sessions, templates. v4 makes everything actually work the way a designer expects it to work:

- **Every value is editable.** No read-only panels.
- **The showcase uses your full palette.** Not just the brand color.
- **Dark mode works correctly.** All tokens, all modes.
- **The app models the quality it generates.** Correct font sizes, discoverable interactions, keyboard shortcuts visible.

---

## New in v4

### Editable Everything (Phase 4A)

| Feature | Before | After |
|---|---|---|
| Color swatches | Click = copy hex | Click = color picker popover |
| Shadow tokens | Toggle colored/neutral only | Per-step sliders (x/y/blur/spread/color) |
| Focus ring | Read-only display | Color picker + width/offset sliders |
| Motion durations | Read-only bar chart | Number inputs, live CSS var update |
| Type scale ratio | Read-only label | Segmented preset buttons (1.125/1.250/1.333/1.414/1.500) + custom |
| Type scale steps | Read-only specimens | Expandable per-step size/weight/lineHeight overrides |

### Color System Completeness (Phase 4B)

| Feature | Before | After |
|---|---|---|
| Theme modes | Light / Dark | White / Light / Dark |
| Dark state colors | Missing | Lighter variants (readable on dark bg) |
| Dark data viz | Missing | Copied from light (perceptually correct) |
| Colors tab: greyscale | Not present | 7-step neutral strip with token labels |
| Colors tab: font colors | Not present | 4 text roles with WCAG contrast badges |
| Showcase templates | Only brand color | Secondary + Accent A + Accent B + state colors |
| Landing template | Hero badge = brand | Badge uses Accent A, feature icons rotate 3 tints |
| Dashboard template | No state indicators | Growth = Accent A, alerts = warning/error state |
| Blog template | No accent colors | Category tags = secondary, pull quotes = Accent B |
| System template | State swatches only | Full CSS custom property table |

### Components Completeness (Phase 4C)

| Feature | Before | After |
|---|---|---|
| Component previews | Button only | All 7 components (input, card, badge, tag, tooltip, alert) |
| Token color fields | Text inputs only | Text input + color swatch + color picker |
| Icon library | Placeholder SVGs | Real Lucide icons (24 common icons) |
| Icon size | Fixed | Selectable: XS 12px / SM 16px / MD 20px / LG 24px / XL 32px |

### UX Polish (Phase 4D)

| Issue | Fix |
|---|---|
| Text 10–12px in app chrome | All app chrome text ≥ 13px |
| Undo/redo invisible | ↩ ↪ buttons in AppHeader, disabled when no history |
| No edit affordance on swatches | ✎ icon + cursor:pointer on hover |
| Theme toggle: cryptic ◐/○ | Three-segment: ☀ White / ◑ Light / ◐ Dark |
| AppHeader: no context | Harmony badge + font pairing in generator; tab breadcrumb in detail |
| Sessions icon: clock | Replaced with bookmark icon + tooltip |
| 7 tabs cramped on narrow viewports | Horizontal scroll + 3-letter abbreviations < 900px |
| `core/` imports in feature components | Eliminated — all data from store or CSS vars |
| Inline styles in ComponentsTab | Moved to CSS module |

---

## What v4 does NOT change

- The generator mode interaction (Space bar, lock/unlock, drag reorder) — unchanged
- The architecture (core/ → store/ → features/) — enforced more strictly
- Export formats (CSS, Tailwind v3/v4, SCSS, W3C, Figma) — unchanged
- Sessions drawer — unchanged
- The 60 font pairings and 7 harmony models — unchanged
- Share link / URL encoding — unchanged (AppTheme type extended backwards-compatibly)

---

## User Stories

**"I want to pick an exact color instead of generating randomly."**
→ In generator mode or detail mode Colors tab, click any color swatch. A color picker opens. Choose your color. The shade scale, semantic tokens, and live preview all update immediately. The color is "locked" to your choice until you unlock it or change it again.

**"My brand uses a specific shade of green. Can I set it exactly?"**
→ Click the Brand swatch, type `#2d7a3a` in the hex field, press Enter. Done. All semantic tokens derive from your green. Generate (Space) still respects your locked Brand color and generates new secondary/accent colors in harmony with it.

**"The shadow looks too heavy. Can I adjust it?"**
→ In detail mode → Effects tab → switch to Neutral mode → expand the `md` shadow step → drag the blur slider from 8px to 4px. The shadow preview updates live. The `--shadow-md` CSS var updates. Your exports include the adjusted value.

**"My type scale feels too large. I want a tighter scale."**
→ In detail mode → Typography tab → click the "1.125" (Minor Second) ratio button. The type scale specimen immediately shows tighter size steps. Or enter a custom ratio like 1.2 in the custom input.

**"I want to see my palette in dark mode."**
→ Click the "◐ Dark" button in the header. The entire app and the live preview switch to dark mode. All tokens flip correctly — including state colors (which become lighter for dark backgrounds).

**"My design system uses white backgrounds everywhere, not warm off-white."**
→ Click "☀ White" in the header. All surfaces become `#ffffff`. Your exports include `--color-background: #ffffff`.

**"The showcase only shows my brand color. What about my other 3 colors?"**
→ Switch to a template in the Showcase tab. Your secondary, accent A, and accent B colors now appear in appropriate places — secondary for navigation accents, accent A for badges/highlights, accent B for decorative elements. State colors (error/warning/success/info) appear in alerts and status badges.

---

## Phase Delivery Order

```
Phase 4A — Editability
  ↓ (merged and tested)
Phase 4B — Color System
  ↓ (merged and tested)
Phase 4C — Components
  ↓ (merged and tested)
Phase 4D — UX Polish
  ↓ (merged and tested)
v4 Complete
```

Each phase is a separate branch. Each phase must pass its full QA checklist before the next phase starts. The phases are designed to be sequential — 4B depends on `ColorPickerPopover` from 4A, 4C depends on the three-way theme from 4B, 4D depends on the `useColorTokens` selector introduced in 4B.

---

## Success Definition

v4 is done when a designer can:

1. Open the app and immediately see a beautiful, complete design system
2. Click any color to change it
3. Adjust every effect token with sliders
4. Change the type scale ratio and see it update everywhere
5. See all their palette colors (not just brand) in the showcase templates
6. Switch between white / warm light / dark backgrounds for the whole app
7. Export their tokens and use them immediately in a project
8. Undo any change with Cmd+Z or the undo button

And when a developer reading the code sees:
- Zero `core/` imports in `features/` or `components/`
- Zero inline styles (structural layout)
- Zero text below 13px in app chrome
- All tests passing
- `tsc --noEmit` clean
