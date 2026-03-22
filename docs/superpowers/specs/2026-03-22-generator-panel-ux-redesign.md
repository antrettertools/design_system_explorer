# Generator Panel UX Redesign
**Date:** 2026-03-22
**Status:** Approved for implementation
**Branch:** claude/design-system-architecture-BM2jR

---

## 1. Problem Statement

The generator panel is functional but has six concrete UX problems that undermine the "ultimate design system entry experience":

1. **SPACE shortcut buried** — "Press SPACE to generate" is in the footer, mixed with buttons, invisible to most users
2. **"vibe" button broken-looking** — disabled, dashed border, no explanation. Users click it, nothing happens, trust is damaged
3. **"Add color" misplaced** — lives in the footer, far from the swatches
4. **HarmonyHint is redundant × 3** — the active recipe already appears in the AppHeader badge AND in the RecipePillRow label. The green banner adds noise
5. **No visual section hierarchy** — Colors and Typography run together as a flat list of widgets, no clear sections
6. **Colors and Typography use inconsistent control grammars** — recipe pills vs. lock buttons look and behave differently for the same conceptual action (selecting/fixing a parameter)

Additionally, the typography specimen doesn't give enough information to make a lock decision (only one line of heading text is shown, not the full scale), and there is no way to preview the fonts with custom text.

---

## 2. Approved Design

### 2.1 Overall Panel Structure

```
AppHeader  (unchanged — wordmark, font badge, undo/redo, theme, export)
─────────────────────────────────────────────
Space hint bar  ("Hit SPACE to regenerate")
─────────────────────────────────────────────
[Colors section]
  COLORS                         ← section title
  Warm Triadic                   ← result name (heading font, below title)
  [Any] [Triadic] [Analogous]… ← harmony pill row
  [Brand] [Secondary] [Acc A] [Acc B] [+]  ← swatches + add card
─────────────────────────────────────────────
[Typography section]
  TYPOGRAPHY                     ← section title
  Playfair Display + Inter       ← result name (heading font, below title)
  [⌒ Heading] [⌒ Body] [⌒ Scale] ← lock pills (same grammar as harmony pills)
  [Hd input]  [Bd input]         ← editable specimen text
  H1  The quick brown fox…  26px·800   ← full scale rows
  H2  The quick brown fox…  21px·700
  H3  The quick brown fox…  17px·600
      ──────── (divider) ────────
  Bd  How vexingly quick…   14px·400
  sm  How vexingly quick…   12px·400
  xs  How vexingly quick…   10px·400
─────────────────────────────────────────────
Footer  [Detail Mode →]
```

### 2.2 Space Hint Bar

A slim bar (≈28px) immediately below the AppHeader, spanning the full panel width.

- Content: `Hit  [SPACE]  to regenerate`
- Font: `--font-body`, 11px, `--color-on-surface-subtle`
- Background: `--color-surface` (or transparent with a `--color-border` bottom divider)
- `<kbd>` element styled with border + monospace font, same as current footer kbd style
- **Removed from footer** — the hint text is removed entirely from `GeneratorFooter`

### 2.3 Section Identity

Each section starts with a two-line identity block:

```
COLORS          ← font-body, 9px, uppercase, letter-spacing 0.1em, --color-on-surface-subtle
Warm Triadic    ← font-heading, 12px, semibold, --color-on-surface-subtle
```

These are purely informational. They update reactively (the result name updates when a new palette is generated).

**For Colors:** result = `activeRecipe?.label ?? 'Random'`
**For Typography:** result = `"${pairing.heading} + ${pairing.body}"`

The `HarmonyHint` component (`HarmonyHint.tsx` and `HarmonyHint.module.css`) is **deleted**. Its information is now covered by the section identity result name.

### 2.4 Unified Pill Grammar

A single pill visual language is used for **both** the harmony type selector (Colors) and the font lock controls (Typography). The pills are implemented as a **shared CSS class** (`ctrl-pill`, `ctrl-pill--active`, `ctrl-pill--accent`) defined in a new `shared/CtrlPill.module.css` file, imported by both `RecipePillRow.module.css` and the typography section. No new React component is created — both sections apply the same CSS class to their `<button>` elements. This avoids prop-drilling and keeps the two sections independently maintainable.

**States:**

| State | Background | Border | Text |
|---|---|---|---|
| Default | `--color-surface-raised` | `--color-border` | `--color-on-surface-subtle` |
| Hover | `--color-interactive-subtle` | `--color-border` | `--color-on-surface` |
| Active / Selected | `--color-interactive-subtle` | `--color-interactive` | `--color-interactive` |
| Accent (Any pill) | `--color-interactive-subtle` | `--color-interactive` | `--color-interactive` at 80% opacity |
| Locked (font lock) | same as Active | same | same |

Font: `var(--font-body)`, 10px, weight 600, letter-spacing 0.03em.
Height: 22px. Padding: 0 9px. Border-radius: `--ui-radius-full`.

Lock pills show a `<Lock size={10} />` icon before the label when locked, `<LockOpen size={10} />` when unlocked.

**Removed from `RecipePillRow`:** the `recipeLabel` div (shows the current recipe name below pills). This is now the section result name.

### 2.5 Color Swatches — Inline Add Card

The `+` add-color action moves from the footer into the swatches row as a ghost card.

- Rendered as the last item in the `ColorSwatches` flex row
- Same height as swatches (current: 110px)
- Flex: `0 0 44px` (fixed narrow width, not full flex-1)
- Style: dashed border (`--color-border`), `+` character centred, `--color-on-surface-subtle`
- On hover: border brightens to `--color-border-strong`, `+` colour to `--color-on-surface`
- Disabled (opacity 0.4, pointer-events none) when `slots.length >= 8`
- Calls `addSlot()` on click

**Removed from `GeneratorFooter`:** the `addBtn` button.

### 2.6 Full Type Scale Display

The `TypographySpecimen` component is redesigned to show all scale levels as rendered rows.

**Editable specimen inputs:**
- Two `<input>` elements above the scale rows
- Heading input: uses `--font-heading`, populated with current heading specimen text (default: "The quick brown fox jumps over")
- Body input: uses `--font-body`, populated with current body specimen text (default: "How vexingly quick daft zebras jump!")
- Inputs are local state (`useState`) — not persisted to the store
- Small tag labels on the left: "Hd" and "Bd" (9px, uppercase, `--color-on-surface-subtle`)
- Styled as borderless/minimal inputs — subtle border only, no background in default state

**Scale rows:**

Each row: `[tag] [specimen text] [meta]`

- **Tag** (`H1`, `H2`, `H3`, `Bd`, `sm`, `xs`): 24px wide, 9px, uppercase, `--font-body`, `--color-on-surface-subtle`
- **Specimen text**: takes remaining width, white-space nowrap + overflow hidden + text-overflow ellipsis. Uses the appropriate input value (heading text for H1–H3, body text for Bd–xs). Font family and size from the actual scale step.
  - H1: `--font-heading`, `--font-size-h1`, weight 800, letter-spacing -0.02em
  - H2: `--font-heading`, `--font-size-h2`, weight 700
  - H3: `--font-heading`, `--font-size-h3`, weight 600
  - Body: `--font-body`, `--font-size-body`, weight 400
  - sm: `--font-body`, `--font-size-small`, weight 400
  - xs: `--font-body`, `--font-size-xs`, weight 400
- **Meta** (`26px · 800`): right-aligned, `--ui-font-mono`, 9px, `--color-on-surface-subtle`; shows `Math.round(step.size)px · ${step.weight}` — both `size` and `weight` come from the `TypeScaleStep` object in `scale[key]`, no hardcoded values
- A 6px gap row separates headings (H1–H3) from body levels (Bd–xs)
- Each row has a very subtle bottom border (`--color-border` at ~30% opacity) except the last

**Removed:** the old heading specimen `<div>`, the body specimen `<div>`, and the `scalePills` row.
**Removed:** the old `fontNames` + `lockRow` layout (replaced by section identity + unified lock pills above the specimen).

### 2.7 GeneratorFooter Changes

The footer is simplified to a single action:

**Kept:**
- "Detail Mode →" button (`detailBtn`)

**Removed:**
- `hint` ("Press SPACE to generate") — moved to space hint bar
- `vibeChip` ("vibe" disabled button) — removed entirely
- `addBtn` ("Add color") — moved to inline + card in swatches

The footer becomes a minimal single-line with the CTA right-aligned.

---

## 3. Self-Referential UI (Option A)

All app chrome adopts the currently selected font pairing and color system. This is documented as Section 21 of `docs/ENGINEERING_AND_DESIGN_GUIDE.md`.

**Implementation scope for this task:**
- Set `font-family: var(--font-body, sans-serif)` on `body` in `globals.css` (replaces `font-family: sans-serif`)
- All component CSS files that currently use `font-family: sans-serif` (inline or in class rules) are updated to `var(--font-body, sans-serif)`
- All identity/result text (wordmark, section result names) use `var(--font-heading, Georgia, serif)`
- Hex code displays use `var(--ui-font-mono)` (already done in most places — audit and fix stragglers)
- Interactive states already use `--color-interactive` via semantic tokens — verify this is consistent across pills in both sections

**Files to audit for `sans-serif` hardcoding:**
- `AppHeader.module.css`
- `GeneratorPanel.module.css`
- `ColorSlotCard.module.css`
- `ColorSwatches.module.css`
- `RecipePillRow.module.css`
- `TypographySpecimen.module.css`
- `GeneratorFooter.module.css`
- `HarmonyHint.module.css` (deleted)

---

## 4. Files Changed

| File | Change |
|---|---|
| `GeneratorPanel.tsx` | Add `SpaceHintBar`, restructure with section identity, remove `HarmonyHint` |
| `GeneratorPanel.module.css` | Section spacing, font-body on body |
| `ColorSwatches.tsx` | Add `AddColorCard` at end of row |
| `ColorSwatches.module.css` | Update grid to accommodate add card |
| `ColorSlotCard.module.css` | Replace `sans-serif` with `var(--font-body)` |
| `RecipePillRow.tsx` | Remove `recipeLabel`; adopt unified pill CSS |
| `RecipePillRow.module.css` | Unified pill grammar (replaces current pill styles) |
| `TypographySpecimen.tsx` | Full redesign: editable inputs + scale rows; remove old layout |
| `TypographySpecimen.module.css` | Full redesign |
| `GeneratorFooter.tsx` | Remove hint, vibeChip, addBtn |
| `GeneratorFooter.module.css` | Simplify |
| `HarmonyHint.tsx` | **Deleted** |
| `HarmonyHint.module.css` | **Deleted** |
| `globals.css` | Set `font-family: var(--font-body, sans-serif)` on body |
| `AppHeader.module.css` | Replace `sans-serif` → `var(--font-body)` for chrome text; add heading font for wordmark |
| `docs/ENGINEERING_AND_DESIGN_GUIDE.md` | Updated sections 12, 21 (new), 22 checklist |

**New component (optional — can be CSS class only):**
`SpaceHintBar` — a tiny presentational component rendering the hint bar.

---

## 5. Out of Scope

- The "vibe" feature itself — the button is removed now; the feature gets a proper entry point when it ships
- Editable specimen text persistence to the store — inputs are local state only
- Changing the AppHeader structure or its existing controls
- Detail mode tabs — this spec covers generator panel only
- Mobile layout changes beyond what naturally results from the panel changes

---

## 6. Success Criteria

- The SPACE shortcut is immediately visible on landing
- A new user can find "Add color" without hunting in menus or footer
- The Colors and Typography sections are visually parallel: same section structure, same pill grammar
- The full type scale renders at actual sizes with both heading and body fonts applied
- No `sans-serif` or `system-ui` remains hardcoded in generator panel CSS — all chrome uses `var(--font-body)`
- The HarmonyHint green banner is gone
- The "vibe" disabled button is gone
- The footer contains only "Detail Mode →"
- Changing the font pair (by pressing SPACE) is immediately visible in the pill labels, section titles, result names, and inputs — not only in the specimen text
