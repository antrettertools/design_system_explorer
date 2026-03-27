# Detail Mode — Typography & Type Scale Specification

This document is the single source of truth for font usage across all detail mode tabs
(Colors, Typography, Spacing, Effects, Components, Export, Showcase).

---

## Design Token Reference

### UI Shell Tokens (fixed, not generated — always available)

| Token | Value | Purpose |
|-------|-------|---------|
| `--ui-text-sm` | ~12px | All UI meta text (labels, captions, annotations) |
| `--ui-text-base` | ~14px | Body text within UI chrome |
| `--ui-font-mono` | monospace stack | All code, hex values, numeric values |

### Generated Typography Tokens (from active type scale — may vary per session)

| Token | Example value | Purpose |
|-------|--------------|---------|
| `--font-heading` | `"Inter", serif` | Active heading font family |
| `--font-body` | `"Source Serif 4", sans-serif` | Active body font family |
| `--font-size-display` | 52px | Display step size |
| `--font-size-h1` | 40px | H1 step size |
| `--font-size-h2` | 32px | H2 step size |
| `--font-size-h3` | 24px | H3 step size |
| `--font-size-h4` | 20px | H4 step size |
| `--font-size-body` | 16px | Body step size |
| `--font-size-small` | 14px | Small step size |
| `--font-size-xs` | 12px | XS step size |
| `--font-size-label` | 11px | Label step size |
| `--font-weight-{step}` | 700 | Weight per scale step |

> **Rule:** Use `--ui-text-sm` for ALL UI chrome text. Only use `--font-size-*` tokens when
> the purpose is to *demonstrate* that scale step (i.e., as a specimen).

---

## Typography Roles

### 1. Section Title
Used above every top-level section in any detail tab.

```css
font-size:      var(--ui-text-sm);
letter-spacing: 2px;
text-transform: uppercase;
font-family:    var(--font-body, sans-serif);
color:          var(--color-on-surface-subtle);
font-weight:    400;             /* intentionally light — it's a label, not a heading */
margin-bottom:  var(--ui-space-7);
```

**Examples:** "Shade Scales", "Type Scale", "Contrast — WCAG AA / AAA", "Font Browser"

---

### 2. Card / Row Label (primary text within a tile or row)
The main name or identifier on a card, row, or chip.

```css
font-size:   var(--ui-text-sm);
font-weight: 600;
font-family: var(--font-body, sans-serif);
color:       var(--color-on-surface);
```

**Examples:** color role names ("Brand", "Accent"), font names ("Inter"), scale step
labels ("Display", "H1", "Body"), spacing token names ("--space-4")

---

### 3. Secondary / Meta Text
Supplementary information — descriptions, hints, source labels.

```css
font-size:   var(--ui-text-sm);
font-weight: 400;
font-family: var(--font-body, sans-serif);
color:       var(--color-on-surface-subtle);
```

**Examples:** "OKLCH · hue 25°", "Google Fonts", "base 16px × ratio^n",
role descriptions, section hints

---

### 4. Monospaced Value (hex codes, px numbers, ratios, CSS tokens)
Anything that is a raw value, not human text.

```css
font-size:   var(--ui-text-sm);
font-family: var(--ui-font-mono);
color:       var(--color-on-surface-subtle);   /* secondary values */
/* OR */
color:       var(--color-on-surface);          /* primary / emphasized values */
```

**Examples:** `#3B82F6`, `16px`, `1.250`, `--color-brand`, `700`

---

### 5. Uppercase Micro Badge / Tag
Tiny categorical labels on chips, role tags, source indicators.

```css
font-size:      var(--ui-text-sm);             /* or 10px max for truly micro badges */
font-weight:    500;
font-family:    var(--font-body, sans-serif);
letter-spacing: 0.06em;
text-transform: uppercase;
color:          var(--color-on-surface-subtle);
```

**Examples:** "humanist" character type tag, "GOOGLE" source badge, "SYSTEM" source badge

---

### 6. Specimen Text — UI Chrome Specimen
Text used *within the UI* to preview a font or layout (not the user's design system).
These specimens are functional illustrations, not the generated scale itself.

```css
font-family: var(--font-heading, serif);       /* or --font-body — whichever is being shown */
font-size:   var(--font-size-body);            /* scale-generated — preview at body size */
color:       var(--color-on-surface);
```

**Examples:** FontPairCard heading/body specimen rows, ReadabilityScore sample paragraph,
CharacterSet preview

---

### 7. Scale Specimen (in ScaleEditor rows)
Text demonstrating a specific scale step. Font size comes from the step itself — set inline.

```css
/* Set inline — font-size, font-weight, line-height, letter-spacing all from step data */
font-family: var(--font-heading, serif)   /* or --font-body for body/small/xs/label steps */
color:       var(--color-on-surface);
/* Cap visual size at 28px to prevent overflow */
```

**Note:** This is the only legitimate use of inline font-size that overrides the CSS.

---

### 8. Font Browser Grid Preview
Large "Aa Bb Cc" previews in the font tile grid. Shows the font at a comfortable reading size.

```css
font-family: /* set inline from font name */;
font-size:   var(--font-size-h3);    /* ~24px — big enough to judge character, not overwhelming */
color:       var(--color-on-surface);
```

---

### 9. Hero Number
Large single-number display (e.g. APCA score). Intentional exception — not a UI label.

```css
font-size:   36px;                  /* intentional — hero display, not UI meta */
font-weight: 800;
font-family: var(--ui-font-mono);
color:       var(--color-on-surface);
```

---

### 10. Keyboard Shortcut (kbd element)
For shortcut hints in hint rows.

```css
font-size:        var(--ui-text-sm);
font-family:      var(--ui-font-mono);
font-weight:      600;
color:            var(--color-on-surface-subtle);
```

---

## Violations to Fix

| File | Class | Current | Should be |
|------|-------|---------|-----------|
| `FontPairCard.module.css` | `.specimen` | `15px` hardcoded | `var(--font-size-body)` |
| `FontBrowserGrid.module.css` | `.cellPreview` | `var(--font-size-h2, 22px)` | `var(--font-size-h3)` (drop fallback) |
| `ReadabilityScore.module.css` | `.sampleText` | `var(--font-size-body, 16px)` | `var(--font-size-body)` (drop fallback) |
| `ColorsTab.module.css` | `.kbd` | `11px` hardcoded | `var(--ui-text-sm)` |
| `ComponentPreview.module.css` | various | `var(--font-size-body, 14px)` | `var(--font-size-body)` (drop fallback) |
| `CharacterSet.module.css` | `.charset`, `.weightSample` | `var(--font-size-body, 16px)` etc. | `var(--font-size-body)` (drop fallback) |
| `ComponentTokenSection.module.css` | `.sectionTitle` | uses `--font-heading` | use `--font-body` like all others |

> **Rule on fallback px values:** Don't use them. `var(--font-size-body, 16px)` is misleading —
> the generated body size is whatever the active scale says, not 16px. The token is always
> present after first generate(), so fallbacks are never actually needed.

---

## Summary — Decision Rules

1. **Is it UI text?** → `var(--ui-text-sm)` + `var(--font-body)` or `var(--ui-font-mono)` for values
2. **Is it showing a font specimen?** → `var(--font-size-body)` or `var(--font-size-h3)` based on context
3. **Is it showing a scale step?** → inline size from step data, capped at 28px for ScaleEditor rows
4. **Is it a hero number?** → 36px explicit, font-weight 800, document as intentional
5. **Never use px values except** for the hero score (36px) and the 28px specimen cap
6. **Never add px fallbacks** to generated tokens — they're always present post-load
