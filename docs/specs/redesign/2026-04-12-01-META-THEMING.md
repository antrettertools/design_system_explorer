# Spec 01 — Meta-Theming System

**Spec date:** 2026-04-12  
**Phase:** 1 (prerequisite for all other visual changes)  
**Status:** Specced — not yet implemented

---

## What This Is

The meta-theming system is the architectural foundation of the entire redesign. It means:

> The dsygn.cloud UI is styled by the design system tokens it is currently generating.

When the user hits SPACE and the active palette shifts, every chip, button, card, border, shadow, and typeface in the left panel shifts with it in real-time. The generator panel is the first and most credible showcase.

**This must be implemented first.** Every other spec depends on the UI consuming these tokens. Doing it in the wrong order means styling changes in Phase 1–2 will have to be re-done once meta-theming lands.

---

## Current State

`store/derived.ts` → `injectTokensToDOM()` already injects ALL design system tokens to `:root` as inline CSS custom properties on every state change. The tokens exist. The gap is that the UI components do not fully consume them — they mostly use the fixed `--ui-*` tokens defined in `src/styles/ui-tokens.css`.

**What already works:**
- `GeneratorPanel.module.css` already references `--color-background`, `--color-border`, `--color-on-surface`, `--color-interactive`
- `DetailMode.module.css` already references `--color-background`, `--color-surface`, `--color-interactive`
- Some token consumption is in place but incomplete

**What needs to change:**
- Harmony chips (`RecipePillRow`) need `--radius-full`, `--color-interactive` active bg, `--color-border-strong` inactive border
- Color swatch cards need `--radius-md`, `--shadow-sm`
- Lock icons need `--color-interactive` (locked) / `--color-on-surface-subtle` (unlocked)
- Buttons (Detail Mode entry, Export) need `--color-interactive` / `--color-on-interactive`
- Section labels need `--font-heading`
- Font pair display must render in `--font-heading` / `--font-body` at the correct sizes
- Card surfaces must use `--color-surface-raised` for raised elements
- Focus rings must use `--focus-ring-color` / `--focus-ring-width`
- Transitions for color tokens: 150ms cross-fade (currently absent or inconsistent)

---

## Token Mapping Table

This is the complete set of UI elements that must consume design system tokens. Reference this when updating each component's `.module.css`.

| UI Element | Token to Use | Effect |
|---|---|---|
| Active harmony chip background | `--color-interactive` | Shifts with palette on SPACE |
| Active harmony chip text | `--color-on-interactive` | Ensures contrast at all times |
| Inactive harmony chip border | `--color-border-strong` | Recessive but present |
| Inactive harmony chip hover border | `--color-interactive` | Indicates interactivity |
| Primary button background | `--color-interactive` | "Explore Detail Mode", export actions |
| Primary button text | `--color-on-interactive` | Contrast text on interactive |
| Primary button hover background | `--color-interactive-hover` | Hover state |
| Ghost button / secondary actions | `--color-interactive-subtle` | "Unlock all", secondary CTAs |
| Left generator panel background | `--color-surface` | The panel container itself |
| Swatch cards, Detail Mode section cards | `--color-surface-raised` | Slightly elevated above panel |
| Dividers, input borders | `--color-border` | All structural borders |
| Lock icon — locked state | `--color-interactive` | Filled lock = protected |
| Lock icon — unlocked state | `--color-on-surface-subtle` | Outline lock = open to regen |
| Focus ring color | `--focus-ring-color` | Tab focus on all interactive elements |
| Focus ring width | `--focus-ring-width` | |
| Focus ring offset | `--focus-ring-offset` | |
| Section label font family | `--font-heading` | "COLORS", "TYPOGRAPHY" labels |
| Font pair heading display | `--font-heading` | Name rendered in its own typeface |
| Font pair body display | `--font-body` | Name rendered in its own typeface |
| Swatch card shadows | `--shadow-sm` | Subtle lift on swatch cards |
| Harmony chip border radius | `--radius-full` | Pill shape |
| Card/swatch border radius | `--radius-md` | Section cards, color swatches |
| Active tab indicator | `--color-interactive` | 3px bottom border on active tab |
| Active tab label color | `--color-interactive` | Label matches indicator |
| Inactive tab label color | `--color-on-surface-subtle` | Recessive, still legible |
| "Back to Generator" button | `--color-interactive` ghost style | Always accessible |

---

## Update Timing — Two-Phase Application

Token re-application happens in two phases to avoid jarring layout shifts:

### Phase A — Structural Tokens
**Tokens:** `--radius-*`, `--shadow-*` (mode change from colored→neutral or vice versa), `--spacing-*`  
**When:** Applied *after* SPACE generation completes — not during the animation  
**Why:** These affect layout and element geometry. Mid-generation animation of border radii looks broken.  
**How:** No CSS transition on these properties. The DOM update happens synchronously after `generate()` resolves.

### Phase B — Color + Typography Tokens
**Tokens:** `--color-*`, `--font-heading`, `--font-body`, `--font-size-*`  
**When:** Applied immediately on token injection, with a 150ms cross-fade  
**Why:** Color shifts are the primary visual "wow" moment and should feel smooth  
**How:** CSS transitions on the properties that consume these tokens in each `.module.css`:

```css
/* Applied to containers that consume color tokens */
transition:
  background-color 150ms ease-out,
  border-color 150ms ease-out,
  color 150ms ease-out,
  box-shadow 150ms ease-out;
```

> **Note on CSS variable transitions:** CSS custom properties themselves cannot be transitioned directly. The transition must be on the property (e.g., `background-color`) that consumes the var. Each affected component declares its own transition rules.

### Initial Page Load
- Before first generation completes (< 500ms), the UI displays the neutral baseline using `--ui-color-*` fallback values defined in `ui-tokens.css`
- On first generation: color/typography tokens apply with the 150ms cross-fade
- Structural tokens apply immediately (no previous state to animate from)
- The `no-transitions` class on `<html>` during hydration (already in `App.tsx`) prevents flash

---

## Baseline Fallback System

Before the first design system is generated, UI components must still look reasonable. The approach: CSS custom properties with fallback chains.

**Pattern for component CSS:**
```css
/* The design system token is tried first; --ui-color-* is the safe fallback */
.card {
  background: var(--color-surface-raised, var(--ui-color-surface-raised));
  border-radius: var(--radius-md, var(--ui-radius-3));
  box-shadow: var(--shadow-sm, var(--ui-shadow-1));
}
```

**New additions to `src/styles/ui-tokens.css`** — add the following `--ui-color-*` baseline tokens. These are the neutral starting values before any design system is active. They are NOT styled by the generated system — they are the static container defaults:

```css
/* Baseline color fallbacks — used only before first generation */
--ui-color-background:        #FAFAFA;
--ui-color-surface:           #FFFFFF;
--ui-color-surface-raised:    #FFFFFF;
--ui-color-border:            #E5E7EB;
--ui-color-border-strong:     #D1D5DB;
--ui-color-on-surface:        #111827;
--ui-color-on-surface-subtle: #6B7280;
--ui-color-interactive:       #009E8E;   /* dsygn brand teal — baseline before system loads */
--ui-color-on-interactive:    #FFFFFF;
--ui-shadow-1: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
```

---

## File-Level Change Inventory

### Phase 1 — Required for meta-theming to work

| File | Change |
|---|---|
| `src/styles/ui-tokens.css` | Add `--ui-color-*` and `--ui-shadow-1` baseline fallback tokens |
| `src/features/generator/RecipePillRow/RecipePillRow.module.css` | Active chip: `background: var(--color-interactive)`, `color: var(--color-on-interactive)`. Inactive: `border: 1px solid var(--color-border-strong)`. Chip shape: `border-radius: var(--radius-full)`. Hover inactive: border shifts to `var(--color-interactive)`. Add 150ms transitions on `background-color`, `border-color`, `color`. |
| `src/features/generator/ColorSwatches/ColorSlotCard.module.css` | Card surface: `background: var(--color-surface-raised, var(--ui-color-surface-raised))`. Border radius: `var(--radius-md, var(--ui-radius-3))`. Shadow: `var(--shadow-sm, var(--ui-shadow-1))`. Add 150ms transitions. |
| `src/features/generator/ColorSwatches/ColorSlotCard.tsx` | Lock icon color: locked = CSS class with `color: var(--color-interactive)`, unlocked = `color: var(--color-on-surface-subtle)`. Use CSS class on lock icon, not inline styles. |
| `src/features/generator/GeneratorPanel.module.css` | Panel bg: `var(--color-surface, var(--ui-color-surface))`. Section title `font-family: var(--font-heading)`. Add 150ms color transitions. |
| `src/features/generator/GeneratorFooter/GeneratorFooter.module.css` | Primary "Detail Mode" button: `background: var(--color-interactive)`, `color: var(--color-on-interactive)`, `border-radius: var(--radius-md)`. Hover: `background: var(--color-interactive-hover)`. Add transitions. |
| `src/features/detail/DetailMode.module.css` | Tab active indicator: `border-bottom: 3px solid var(--color-interactive)`. Active label: `color: var(--color-interactive)`. Inactive label: `color: var(--color-on-surface-subtle)`. Panel bg: `var(--color-surface)`. Add transitions. |
| `src/features/generator/TypographySpecimen/TypographySpecimen.module.css` | Heading font display: `font-family: var(--font-heading)`. Body font display: `font-family: var(--font-body)`. See font transition note. |

> **Font transition note:** CSS `font-family` cannot be transitioned. The 200ms "fade out → in" on typography change must be achieved with `opacity` transitions: on SPACE, the specimen fades to 0 opacity (100ms), the font changes, then fades back to 1 (100ms). This is a JS-coordinated animation, not a pure CSS transition.

---

## Acceptance Criteria

- [ ] Hitting SPACE causes the harmony chips to change background/border color to match the new palette
- [ ] Hitting SPACE causes color swatch cards to update their shadow and border radius if those tokens changed
- [ ] The "Explore Detail Mode" button background color matches `--color-interactive` at all times
- [ ] Lock icons are visually `--color-interactive` when locked, and `--color-on-surface-subtle` when unlocked
- [ ] Section labels ("COLORS", "TYPOGRAPHY") render in `--font-heading`
- [ ] Font pair names render in their own respective typefaces
- [ ] Color transitions are smooth (150ms), not instant snaps
- [ ] Structural token changes (radius, shadow mode) do not animate mid-generation
- [ ] Before first generation, the UI looks clean using the `--ui-color-*` fallback values
- [ ] No TypeScript changes are required — this is purely a CSS modules change
- [ ] No `any`, no `@ts-ignore`, no inline styles introduced
- [ ] `prefers-reduced-motion` is respected: all transitions fall back to instant cuts

---

## Session Log

> Most recent entry first.

### 2026-04-12 — Initial spec authoring
- Spec written from design brief §2 (Meta-Theming System) and §2.1 (Token Mapping), §2.2 (Update Timing)
- Confirmed token names against `store/derived.ts` — all names match exactly
- Confirmed `injectTokensToDOM()` already writes to `:root` inline styles — no store changes needed
- Identified gap: components use `--ui-*` tokens where they should use `--color-*` / `--radius-*` / `--shadow-*`
- Baseline fallback approach: CSS fallback chain `var(--color-surface, var(--ui-color-surface))`
- Font transition approach: opacity fade-out/in via JS coordination (font-family is not animatable)
- No code changed in this session
