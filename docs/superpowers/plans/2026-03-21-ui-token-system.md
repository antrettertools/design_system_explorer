# UI Token System — Hardcoded Value Elimination

## Goal

Introduce a static `--ui-*` CSS custom property layer in `globals.css` to replace all hardcoded
px values in the app UI chrome. The design system tokens (`--color-*`, `--spacing-*`, `--radius-*`,
`--font-size-*`, etc.) are user-configurable and generated at runtime — they must not be used for
app chrome. The `--ui-*` tokens are static, never exported, and live in `globals.css` only.

---

## Token Definitions (Phase 0 — globals.css)

### Typography
```css
--ui-text-sm:   13px;   /* primary chrome text: buttons, tabs, labels, badges */
--ui-text-md:   14px;   /* secondary chrome text: breadcrumbs, panel titles */
--ui-text-base: 15px;   /* icon button emoji, slightly larger interactive */
--ui-text-lg:   18px;   /* wordmark */
--ui-text-xl:   20px;   /* drawer/panel header titles */
```

### Spacing (4px-grid numeric scale)
```css
--ui-space-1:   2px;
--ui-space-2:   4px;
--ui-space-3:   6px;
--ui-space-4:   8px;
--ui-space-5:  10px;
--ui-space-6:  12px;
--ui-space-7:  14px;
--ui-space-8:  16px;
--ui-space-9:  20px;
--ui-space-10: 24px;
```

### Border Radii (numeric scale, with normalization)
```css
--ui-radius-1:    2px;     /* chart bar corners, absolute minimum */
--ui-radius-2:    4px;     /* normalizes: 3, 4, 5px → small interactive */
--ui-radius-3:    6px;     /* standard buttons, form controls */
--ui-radius-4:    8px;     /* cards, popovers */
--ui-radius-5:   12px;     /* panels, modals; normalizes: 12, 14px */
--ui-radius-6:   16px;     /* large bottom sheets; normalizes: 16, 20px */
--ui-radius-full: 9999px;  /* pills */
```

### Fixed Layout Dimensions
```css
--ui-size-header:  48px;   /* AppHeader + DetailMode top bar height */
--ui-size-btn-sm:  28px;   /* small button/chip height */
--ui-size-btn-md:  32px;   /* standard action button height */
--ui-size-btn-lg:  36px;   /* primary CTA button height */
--ui-size-btn-xl:  40px;   /* mobile sticky footer buttons */
--ui-size-divider:  4px;   /* SplitPane drag handle */
--ui-size-drawer: 360px;   /* SessionsDrawer width */
```

### Breakpoints
```css
--ui-bp-mobile: 768px;
--ui-bp-tablet: 900px;
```

### Transition Durations
```css
--ui-duration-1: 0.10s;
--ui-duration-2: 0.12s;
--ui-duration-3: 0.15s;   /* most common — hover feedback, subtle fades */
--ui-duration-4: 0.20s;   /* overlay/drawer entry */
--ui-duration-5: 0.30s;   /* mobile panel slide */
```

---

## Normalization Map

When replacing raw values, apply these normalizations:

| Raw value | Token | Notes |
|-----------|-------|-------|
| `3px` radius | `--ui-radius-2` (4px) | Normalizes small inconsistency |
| `5px` radius | `--ui-radius-2` (4px) | Same tier as 4px |
| `14px` radius | `--ui-radius-5` (12px) | GeneratorFooter vibeChip |
| `20px` radius | `--ui-radius-6` (16px) | LandingTemplate pill-ish btn |
| `0.1s` transition | `--ui-duration-1` | |
| `0.12s` transition | `--ui-duration-2` | |
| `0.15s` transition | `--ui-duration-3` | Most common |
| `0.2s` transition | `--ui-duration-4` | |
| `0.3s` transition | `--ui-duration-5` | |

---

## Special Case: SessionsDrawer.module.css

This file was written using a **phantom token system** that does not exist in the codebase.
The following tokens are referenced but never defined anywhere:

| Phantom token | Correct replacement |
|---------------|---------------------|
| `--spacing-xs` | `--ui-space-2` (4px) |
| `--spacing-sm` | `--ui-space-4` (8px) |
| `--spacing-md` | `--ui-space-6` (12px) |
| `--spacing-lg` | `--ui-space-8` (16px) |
| `--spacing-xl` | `--ui-space-9` (20px) |
| `--radius-sm`  | `--ui-radius-2` (4px) |
| `--radius-md`  | `--ui-radius-3` (6px) |
| `--font-size-body` | `--ui-text-md` (14px) |
| `--font-size-label` | `--ui-text-sm` (13px) |
| `--color-text-primary` | `--color-on-surface` |
| `--color-text-secondary` | `--color-on-surface-subtle` |
| `--color-text-muted` | `--color-on-surface-subtle` |
| `--color-interactive-hover` | `--color-interactive` (no hover variant exists) |
| `--font-heading` | valid — keep (it's a real generated token) |

---

## Execution Plan

Each phase = one PR / one commit. Work through files in order.
Check off each file as done.

---

### Phase 0 — Define token layer
**File:** `src/styles/globals.css`
- [ ] Add all `--ui-*` custom properties under a `/* UI Chrome Tokens */` comment block
- [ ] Add `--ui-bp-*` as CSS custom properties (note: can't use custom props in `@media`,
      but define them here as documentation and use the raw value in media queries with a comment)

---

### Phase 1 — AppShell
**File:** `src/components/AppShell/AppHeader.module.css`

Tokens needed: `--ui-text-*`, `--ui-space-*`, `--ui-radius-*`, `--ui-size-*`, `--ui-duration-*`

| Property | Current | Token |
|----------|---------|-------|
| `.header` padding | `0 20px` | `0 var(--ui-space-9)` |
| `.header` height | `48px` | `var(--ui-size-header)` |
| `.header` gap | `12px` | `var(--ui-space-6)` |
| `.wordmark` font-size | `18px` | `var(--ui-text-lg)` |
| `.wordmark` letter-spacing | `-0.5px` | keep (intentional design choice) |
| `.contextArea` gap | `8px` | `var(--ui-space-4)` |
| `.harmonyBadge` font-size | `13px` | `var(--ui-text-sm)` |
| `.harmonyBadge` padding | `2px 8px` | `var(--ui-space-1) var(--ui-space-4)` |
| `.harmonyBadge` border-radius | `4px` | `var(--ui-radius-2)` |
| `.pairingLabel` font-size | `13px` | `var(--ui-text-sm)` |
| `.contextBreadcrumb` font-size | `14px` | `var(--ui-text-md)` |
| `.breadcrumbSep` margin-right | `2px` | `var(--ui-space-1)` |
| `.actions` gap | `8px` | `var(--ui-space-4)` |
| `.historyGroup` gap | `2px` | `var(--ui-space-1)` |
| `.historyBtn` width/height | `28px` | `var(--ui-size-btn-sm)` |
| `.historyBtn` border-radius | `5px` | `var(--ui-radius-2)` |
| `.historyBtn` font-size | `15px` | `var(--ui-text-base)` |
| `.historyBtn` transition | `0.12s` | `var(--ui-duration-2)` |
| `.themeToggle` width/height | `32px` | `var(--ui-size-btn-md)` |
| `.themeToggle` border-radius | `6px` | `var(--ui-radius-3)` |
| `.themeToggle` font-size | `14px` | `var(--ui-text-md)` |
| `.themeToggle` transition | `0.15s` | `var(--ui-duration-3)` |
| `.themeSegment` border-radius | `6px` | `var(--ui-radius-3)` |
| `.themeBtn` padding | `4px 8px` | `var(--ui-space-2) var(--ui-space-4)` |
| `.themeBtn` font-size | `13px` | `var(--ui-text-sm)` |
| `.themeBtn` height | `32px` | `var(--ui-size-btn-md)` |
| `.themeBtn` transition | `0.12s` | `var(--ui-duration-2)` |
| `.exportBtn` height | `32px` | `var(--ui-size-btn-md)` |
| `.exportBtn` padding | `0 12px` | `0 var(--ui-space-6)` |
| `.exportBtn` border-radius | `6px` | `var(--ui-radius-3)` |
| `.exportBtn` font-size | `13px` | `var(--ui-text-sm)` |
| `.exportBtn` transition | `0.15s` | `var(--ui-duration-3)` |

---

### Phase 2 — Core shared components
**Files:**
- `src/components/SplitPane/SplitPane.module.css`
- `src/components/ui/ColorPickerPopover/ColorPickerPopover.module.css`

#### SplitPane.module.css

| Property | Current | Token |
|----------|---------|-------|
| `.divider` width | `4px` | `var(--ui-size-divider)` |
| `.divider` transition | `0.15s` | `var(--ui-duration-3)` |
| mobile `.left`/`.right` transition | `0.3s ease` | `var(--ui-duration-5) ease` |
| `@media (max-width: 768px)` | `768px` | keep raw, add `/* --ui-bp-mobile */` comment |

#### ColorPickerPopover.module.css

| Property | Current | Token |
|----------|---------|-------|
| `.popover` border-radius | `8px` | `var(--ui-radius-4)` |
| `.popover` padding | `12px` | `var(--ui-space-6)` |
| `.popover` gap | `8px` | `var(--ui-space-4)` |
| `.colorInput` height | `36px` | `var(--ui-size-btn-lg)` |
| `.colorInput` border-radius | `4px` | `var(--ui-radius-2)` |
| `.hexInput` font-size | `13px` | `var(--ui-text-sm)` |
| `.hexInput` padding | `6px 8px` | `var(--ui-space-3) var(--ui-space-4)` |
| `.hexInput` border-radius | `4px` | `var(--ui-radius-2)` |

---

### Phase 3 — Generator
**Files:**
- `src/features/generator/ColorSwatches/ColorSlotCard.module.css`
- `src/features/generator/ColorSwatches/ShadeStrip.module.css`
- `src/features/generator/ColorSwatches/ColorSwatches.module.css`
- `src/features/generator/HarmonyHint.module.css`
- `src/features/generator/TypographySpecimen/TypographySpecimen.module.css`
- `src/features/generator/GeneratorFooter/GeneratorFooter.module.css`

#### ColorSlotCard.module.css

| Property | Current | Token |
|----------|---------|-------|
| `.card` border-radius | `8px` | `var(--ui-radius-4)` |
| `.card` transition | `0.15s` | `var(--ui-duration-3)` |
| `.swatch` padding | `8px` | `var(--ui-space-4)` |
| `.roleLabel` font-size | `13px` | `var(--ui-text-sm)` |
| `.lockBtn` width/height | `24px` | keep (specific icon button) |
| `.lockBtn` border-radius | `4px` | `var(--ui-radius-2)` |
| `.lockBtn` font-size | `13px` | `var(--ui-text-sm)` |
| `.lockBtn` transition | `0.15s` | `var(--ui-duration-3)` |
| `.hex` font-size | `13px` | `var(--ui-text-sm)` |
| `.locked .swatch` border-radius | `8px 8px 0 0` | `var(--ui-radius-4) var(--ui-radius-4) 0 0` |
| `.removeBtn` top | `4px` | `var(--ui-space-2)` |
| `.removeBtn` right | `32px` | keep (specific positioning) |
| `.removeBtn` width/height | `20px` | keep (specific icon button) |
| `.removeBtn` border-radius | `3px` | `var(--ui-radius-2)` |
| `.removeBtn` font-size | `13px` | `var(--ui-text-sm)` |
| `swatch::after` font-size | `13px` | `var(--ui-text-sm)` |
| `swatch::after` bottom/right | `6px` | `var(--ui-space-3)` |
| `swatch::after` transition | `0.15s` | `var(--ui-duration-3)` |
| `.lockBtn` transition | `0.15s` | `var(--ui-duration-3)` |

#### ShadeStrip.module.css

| Property | Current | Token |
|----------|---------|-------|
| transition | `0.15s` | `var(--ui-duration-3)` |
| (check file for any px values) | — | — |

#### HarmonyHint.module.css

| Property | Current | Token |
|----------|---------|-------|
| border-radius | `6px` | `var(--ui-radius-3)` |
| transition | `0.2s` | `var(--ui-duration-4)` |
| (check for font-size, padding) | — | — |

#### TypographySpecimen.module.css

| Property | Current | Token |
|----------|---------|-------|
| border-radius occurrences | `4px` | `var(--ui-radius-2)` |
| transition | `0.15s` | `var(--ui-duration-3)` |
| (check for font-size, padding) | — | — |

#### GeneratorFooter.module.css

| Property | Current | Token |
|----------|---------|-------|
| `.footer` padding | `12px 16px` | `var(--ui-space-6) var(--ui-space-8)` |
| `.footer` gap | `8px` | `var(--ui-space-4)` |
| `.hint` font-size | `13px` | `var(--ui-text-sm)` |
| `.hint kbd` padding | `1px 5px` | `var(--ui-space-1) var(--ui-space-2)` |
| `.hint kbd` border-radius | `3px` | `var(--ui-radius-2)` |
| `.hint kbd` font-size | `13px` | `var(--ui-text-sm)` |
| `.actions` gap | `6px` | `var(--ui-space-3)` |
| `.vibeChip` height | `28px` | `var(--ui-size-btn-sm)` |
| `.vibeChip` padding | `0 10px` | `0 var(--ui-space-5)` |
| `.vibeChip` border-radius | `14px` | `var(--ui-radius-5)` |
| `.vibeChip` font-size | `13px` | `var(--ui-text-sm)` |
| `.addBtn` height | `28px` | `var(--ui-size-btn-sm)` |
| `.addBtn` padding | `0 10px` | `0 var(--ui-space-5)` |
| `.addBtn` border-radius | `6px` | `var(--ui-radius-3)` |
| `.addBtn` font-size | `13px` | `var(--ui-text-sm)` |
| `.addBtn` transition | `0.15s` | `var(--ui-duration-3)` |
| `.detailBtn` height | `28px` | `var(--ui-size-btn-sm)` |
| `.detailBtn` padding | `0 12px` | `0 var(--ui-space-6)` |
| `.detailBtn` border-radius | `6px` | `var(--ui-radius-3)` |
| `.detailBtn` font-size | `13px` | `var(--ui-text-sm)` |
| `.detailBtn` transition | `0.15s` | `var(--ui-duration-3)` |
| `.generateMobile` height | `40px` | `var(--ui-size-btn-xl)` |
| `.generateMobile` border-radius | `8px` | `var(--ui-radius-4)` |
| `.generateMobile` font-size | `14px` | `var(--ui-text-md)` |
| `.previewBtn` height | `40px` | `var(--ui-size-btn-xl)` |
| `.previewBtn` padding | `0 16px` | `0 var(--ui-space-8)` |
| `.previewBtn` border-radius | `8px` | `var(--ui-radius-4)` |
| `.previewBtn` font-size | `14px` | `var(--ui-text-md)` |
| `.previewBtn` margin-right | `8px` | `var(--ui-space-4)` |
| `@media` breakpoint | `768px` | keep raw, add comment |

---

### Phase 4 — Detail shell
**File:** `src/features/detail/DetailMode.module.css`

| Property | Current | Token |
|----------|---------|-------|
| `.topBar` gap | `12px` | `var(--ui-space-6)` |
| `.topBar` padding | `0 16px` | `0 var(--ui-space-8)` |
| `.topBar` height | `48px` | `var(--ui-size-header)` |
| `.backLink` font-size | `13px` | `var(--ui-text-sm)` |
| `.backLink` gap | `4px` | `var(--ui-space-2)` |
| `.backLink` transition | `0.15s` | `var(--ui-duration-3)` |
| `.divider` height | `16px` | keep (specific chrome divider) |
| `.tab` padding | `0 14px` | `0 var(--ui-space-7)` |
| `.tab` height | `46px` | keep (intentionally 2px less than header) |
| `.tab` font-size | `13px` | `var(--ui-text-sm)` |
| `.tab` transition | `0.15s` | `var(--ui-duration-3)` |
| `.tab` gap | `3px` | `var(--ui-space-1)` *(round up from 3)*|
| `.tabBadge` font-size | `13px` | `var(--ui-text-sm)` |
| `.tabBadge` margin-left | `3px` | `var(--ui-space-1)` |
| `.content` padding | `20px 16px` | `var(--ui-space-9) var(--ui-space-8)` |
| `.comingSoon` font-size | `14px` | `var(--ui-text-md)` |
| `@media (max-width: 900px)` | `900px` | keep raw, add comment |

---

### Phase 5 — Colors tab
**Files:**
- `src/features/detail/tabs/ColorsTab/ColorsTab.module.css`
- `src/features/detail/tabs/ColorsTab/ShadeScaleSection.module.css`
- `src/features/detail/tabs/ColorsTab/SemanticRolesSection.module.css`
- `src/features/detail/tabs/ColorsTab/ContrastGrid.module.css`
- `src/features/detail/tabs/ColorsTab/DataVizSection.module.css`
- `src/features/detail/tabs/ColorsTab/FontColorsSection.module.css`
- `src/features/detail/tabs/ColorsTab/GreyscaleSection.module.css`

Key replacements per file (do a read-replace pass on each):
- All `font-size: 13px` → `var(--ui-text-sm)`
- All `font-size: 14px` → `var(--ui-text-md)`
- All `border-radius: 6px` → `var(--ui-radius-3)`
- All `border-radius: 8px` → `var(--ui-radius-4)`
- All `border-radius: 4px` → `var(--ui-radius-2)`
- All `border-radius: 3px` → `var(--ui-radius-2)`
- All `border-radius: 2px` → `var(--ui-radius-1)`
- All `transition: ... 0.15s` → `var(--ui-duration-3)`
- Spacing/gaps/padding per the scale

Notable specifics:
- `ShadeScaleSection` `.scaleRow` height `40px` — keep (it's a visual element, not a button)
- `ShadeScaleSection` `.colorSwatch` 48×48 — keep (content swatch, not chrome)
- `ContrastGrid` has `border-radius: 5px` on `.grid` → `var(--ui-radius-2)` (4px)
- `ContrastGrid` has `border-radius: 3px` on badges → `var(--ui-radius-2)` (4px)

---

### Phase 6 — Typography tab
**Files:**
- `src/features/detail/tabs/TypographyTab/TypographyTab.tsx` (inline styles only)
- `src/features/detail/tabs/TypographyTab/ScaleEditor.module.css`
- `src/features/detail/tabs/TypographyTab/FontBrowser.module.css`
- `src/features/detail/tabs/TypographyTab/FontBrowserGrid.module.css`
- `src/features/detail/tabs/TypographyTab/CharacterSet.module.css`
- `src/features/detail/tabs/TypographyTab/ReadabilityScore.module.css`

Key per-file:

**ScaleEditor.module.css** (heavy usage):
- `font-size: 13px` → `var(--ui-text-sm)` (many occurrences)
- `border-radius: 4px` → `var(--ui-radius-2)` (many)
- `border-radius: 6px` → `var(--ui-radius-3)`
- `padding: 3px 8px` → `var(--ui-space-1) var(--ui-space-4)` (presetBtn)
- `padding: 6px 10px` → `var(--ui-space-3) var(--ui-space-5)` (scaleRow)
- `gap: 10px` → `var(--ui-space-5)`
- `gap: 4px` → `var(--ui-space-2)`
- `transition: 0.15s` → `var(--ui-duration-3)`

**FontBrowserGrid.module.css:**
- `border-radius: 8px` → `var(--ui-radius-4)`
- `border-radius: 4px` → `var(--ui-radius-2)`
- `transition: 0.15s` → `var(--ui-duration-3)`

**CharacterSet.module.css:**
- `border-radius: 8px` → `var(--ui-radius-4)`

**ReadabilityScore.module.css:**
- `border-radius: 8px` → `var(--ui-radius-4)`
- `border-radius: 4px` → `var(--ui-radius-2)`
- `border-radius: 6px` → `var(--ui-radius-3)`

---

### Phase 7 — Spacing tab
**Files:**
- `src/features/detail/tabs/SpacingTab/SpacingTab.module.css`
- `src/features/detail/tabs/SpacingTab/SpacingScaleSection.module.css`
- `src/features/detail/tabs/SpacingTab/RadiusSection.module.css`
- `src/features/detail/tabs/SpacingTab/MiscSection.module.css`

Note: these files render the user's spacing/radius tokens visually. The chrome around those
visuals (labels, section headers, control buttons) uses `--ui-*`. The swatch sizes and bar
widths driven by design token values are NOT chrome — do not replace those.

**MiscSection.module.css inline styles:** This file has inline styles in the TSX that reference
hardcoded px values (`width: 60`, `gap: 4`). Fix those to CSS module classes in Phase 13.

---

### Phase 8 — Effects tab
**Files:**
- `src/features/detail/tabs/EffectsTab/EffectsTab.module.css`
- `src/features/detail/tabs/EffectsTab/ShadowSection.module.css`
- `src/features/detail/tabs/EffectsTab/ShadowBuilder.module.css`
- `src/features/detail/tabs/EffectsTab/FocusRingSection.module.css`
- `src/features/detail/tabs/EffectsTab/MotionSection.module.css`

**ShadowBuilder.module.css** is detailed — many occurrences:
- `.builder` border-radius `8px` → `var(--ui-radius-4)`
- `.builder` padding `14px` → `var(--ui-space-7)`
- `.builder` gap `10px` → `var(--ui-space-5)`
- `.stepLabel` font-size `13px` → `var(--ui-text-sm)`
- `.resetBtn` font-size `13px` → `var(--ui-text-sm)`
- `.resetBtn` border-radius `4px` → `var(--ui-radius-2)`
- `.resetBtn` padding `2px 8px` → `var(--ui-space-1) var(--ui-space-4)`
- `.resetBtn` transition `0.15s` → `var(--ui-duration-3)`
- `.richEditor` gap `14px` → `var(--ui-space-7)`
- `.shadowPreview` border-radius `8px` → `var(--ui-radius-4)`
- `.sliders` gap `6px` → `var(--ui-space-3)`
- `.sliderRow` gap `8px` → `var(--ui-space-4)`
- `.sliderLabel` font-size `13px` → `var(--ui-text-sm)`
- `.sliderValue` font-size `13px` → `var(--ui-text-sm)`
- `.colorSwatch` border-radius `4px` → `var(--ui-radius-2)`
- `.colorSwatch` transition `0.15s` → `var(--ui-duration-3)`
- `.infoNote` font-size `13px` → `var(--ui-text-sm)`
- `.textInput` font-size `13px` → `var(--ui-text-sm)`
- `.textInput` padding `6px 8px` → `var(--ui-space-3) var(--ui-space-4)`
- `.textInput` border-radius `4px` → `var(--ui-radius-2)`
- `.textFallback` gap `6px` → `var(--ui-space-3)`

**MotionSection.tsx inline styles:** `style={{ marginTop: 12 }}` → fix in Phase 13.

---

### Phase 9 — Components tab
**Files:**
- `src/features/detail/tabs/ComponentsTab/ComponentsTab.module.css`
- `src/features/detail/tabs/ComponentsTab/ComponentPreview.module.css`
- `src/features/detail/tabs/ComponentsTab/ComponentTokenSection.module.css`
- `src/features/detail/tabs/ComponentsTab/IconLibrarySection.module.css`

**IconLibrarySection.module.css** is large:
- `border-radius: 6px` → `var(--ui-radius-3)`
- `border-radius: 2px` → `var(--ui-radius-1)`
- `transition: 0.15s` → `var(--ui-duration-3)`
- `transition: 0.12s` → `var(--ui-duration-2)`

**ComponentTokenSection.module.css:**
- `transition: 0.15s` → `var(--ui-duration-3)`
- `transition: 0.2s` → `var(--ui-duration-4)`
- `transition: 0.1s` → `var(--ui-duration-1)`

---

### Phase 10 — Showcase + Export tabs
**Files:**
- `src/features/detail/tabs/ShowcaseTab/ShowcaseTab.module.css`
- `src/features/detail/tabs/ExportTab/ExportTab.module.css`

**ExportTab.module.css:**
- `font-size: 13px` → `var(--ui-text-sm)` (many)
- `border-radius: 6px` → `var(--ui-radius-3)` (many)
- `border-radius: 5px` → `var(--ui-radius-2)` (normalize)
- `height: 36px` → `var(--ui-size-btn-lg)` (copyBtn, downloadBtn)
- `padding: 0 20px` → `0 var(--ui-space-9)` (copyBtn)
- `padding: 0 14px` → `0 var(--ui-space-7)` (downloadBtn)
- `transition: 0.15s` → `var(--ui-duration-3)`

**ShowcaseTab.module.css:**
- `border-radius: 8px` → `var(--ui-radius-4)`
- `border-radius: 6px` → `var(--ui-radius-3)`
- `border-radius: 3px` → `var(--ui-radius-2)`
- `transition: 0.15s` → `var(--ui-duration-3)`

---

### Phase 11 — Overlay panels
**Files:**
- `src/features/sessions/SessionsDrawer.module.css` ← also fix phantom tokens (see table above)
- `src/features/export/ExportPanel.module.css`

**SessionsDrawer.module.css** — two tasks:
1. Fix all phantom token references (see Special Case table)
2. Replace any remaining raw px values

Specific phantom → replacement:
- `--spacing-md` / `--spacing-lg` etc. → appropriate `--ui-space-*`
- `--radius-sm` / `--radius-md` → appropriate `--ui-radius-*`
- `--color-text-primary` → `--color-on-surface`
- `--color-text-muted` / `--color-text-secondary` → `--color-on-surface-subtle`
- `--color-interactive-hover` → `--color-interactive`
- `--font-size-body` → `--ui-text-md` (14px is appropriate for drawer body)
- `--font-size-label` → `--ui-text-sm` (13px)
- `font-size: 20px` (closeBtn) → `var(--ui-text-xl)`
- `.drawer` width `360px` → `var(--ui-size-drawer)`
- animation durations `0.15s`, `0.2s` → `var(--ui-duration-3)`, `var(--ui-duration-4)`
- `transition: 0.1s` → `var(--ui-duration-1)`
- `padding: 2px 8px` (actionBtn) → `var(--ui-space-1) var(--ui-space-4)`

**ExportPanel.module.css:**
- `border-radius: 12px 12px 0 0` → `var(--ui-radius-5) var(--ui-radius-5) 0 0`
- `border-radius: 16px 16px 0 0` (mobile) → `var(--ui-radius-6) var(--ui-radius-6) 0 0`
- `border-radius: 6px` → `var(--ui-radius-3)` (many)
- `font-size: 14px` → `var(--ui-text-md)` (panelTitle)
- `font-size: 13px` → `var(--ui-text-sm)` (tabs, code, meta, buttons)
- `width: 28px / height: 28px` (closeBtn) → `var(--ui-size-btn-sm)`
- `height: 36px` (copyBtn, downloadBtn) → `var(--ui-size-btn-lg)`
- `padding: 16px 20px` → `var(--ui-space-8) var(--ui-space-9)`
- `padding: 12px 20px` → `var(--ui-space-6) var(--ui-space-9)`
- `padding: 6px 12px` (formatTab) → `var(--ui-space-3) var(--ui-space-6)`
- `gap: 4px` (formatTabs) → `var(--ui-space-2)`
- `gap: 8px` (footerActions) → `var(--ui-space-4)`
- `padding: 0 20px` (copyBtn) → `0 var(--ui-space-9)`
- `padding: 0 14px` (downloadBtn) → `0 var(--ui-space-7)`
- transition durations → `var(--ui-duration-3)`, `var(--ui-duration-4)`
- `@media (max-width: 768px)` → keep raw, add comment
- `#15803d` (copied state) → keep (one-off semantic color)

---

### Phase 12 — Preview templates
**Files:**
- `src/features/preview/LivePreview.module.css`
- `src/features/preview/templates/BlogTemplate/BlogTemplate.module.css`
- `src/features/preview/templates/DashboardTemplate/DashboardTemplate.module.css`
- `src/features/preview/templates/LandingTemplate/LandingTemplate.module.css`
- `src/features/preview/templates/SystemTemplate/SystemTemplate.module.css`

**Scope rule for templates:** Templates simulate real design system consumers. They already
correctly use `--color-*`, `--font-*`. Their layout dimensions (nav heights, section paddings)
are intentional art direction — leave them. Only replace:
- `font-size: 13px` → `var(--ui-text-sm)` (nav links, labels, small UI within the template)
- `transition: 0.15s` → `var(--ui-duration-3)` (hover states)
- `transition: 0.2s` → `var(--ui-duration-4)`
- `border-radius` values on chrome-like elements (buttons, badges) → appropriate `--ui-radius-*`

Do NOT replace:
- Nav/hero/section heights (60px, 200px, 300px, etc.) — art direction
- Section padding (40px horizontal padding on nav, etc.) — layout decisions
- Font sizes driven by the design system scale (h1, h2, body text) — those use `--font-size-*`

---

### Phase 13 — Inline style cleanup in TSX + globals.css fallbacks

**Inline styles to remove** (replace with CSS module class or var()):

| File | Line | Current | Fix |
|------|------|---------|-----|
| `MotionSection.tsx` | 61 | `style={{ marginTop: 12 }}` | add `.subsectionLabelSpaced` class |
| `SemanticRolesSection.tsx` | 77 | `style={{ marginTop: 16 }}` | add CSS class |
| `MiscSection.tsx` | 19 | `style={{ height: ..., width: 60 }}` | keep (driven by token value) |
| `MiscSection.tsx` | 32, 51 | `style={{ display: 'flex', ..., gap: 4 }}` | add CSS class |
| `ContrastGrid.tsx` | 100 | `style={{ display: 'flex', alignItems: 'center', gap: 6 }}` | add CSS class |
| `SessionsDrawer.tsx` | 153 | `style={{ marginTop: 4 }}` | add CSS class |
| `ExportTab.tsx` | 81 | `style={{ width: 100 }}` | keep (driven by logic) |

**globals.css fallback hex values:**
The fallback hexes in `var(--color-x, #hex)` throughout the CSS are benign since tokens are
always injected before paint. However:
- `globals.css` line 7: `var(--color-interactive, #e8543a)` — acceptable to keep as ultimate fallback
- All other files: consider removing the `, #hex` fallbacks since tokens are guaranteed at runtime
  (do this as a last cleanup pass — low risk, low value)

---

## What NOT to tokenize

- `letter-spacing` values (e.g., `-0.5px`, `2px` for uppercase tracking) — intentional design choices
- `opacity` values (`0.3`, `0.4`, `0.85`) — not a spacing/size concern
- `rgba(0,0,0,0.x)` overlays and shadows — context-dependent
- `z-index` values — keep as-is (already logical)
- Template section/layout heights and horizontal paddings — art direction
- Content swatch dimensions (e.g., 48×48 color swatches, 110px swatch height) — driven by design
- `width: 100 / style={{ width: 100 }}` driven by dynamic calculation — keep
- `max-width: 680px` (ExportPanel) — layout constraint, not a token

---

## File Checklist

- [ ] Phase 0: `src/styles/globals.css`
- [ ] Phase 1: `AppHeader.module.css`
- [ ] Phase 2a: `SplitPane.module.css`
- [ ] Phase 2b: `ColorPickerPopover.module.css`
- [ ] Phase 3a: `ColorSlotCard.module.css`
- [ ] Phase 3b: `ShadeStrip.module.css`
- [ ] Phase 3c: `ColorSwatches.module.css`
- [ ] Phase 3d: `HarmonyHint.module.css`
- [ ] Phase 3e: `TypographySpecimen.module.css`
- [ ] Phase 3f: `GeneratorFooter.module.css`
- [ ] Phase 4: `DetailMode.module.css`
- [ ] Phase 5a: `ColorsTab.module.css`
- [ ] Phase 5b: `ShadeScaleSection.module.css`
- [ ] Phase 5c: `SemanticRolesSection.module.css`
- [ ] Phase 5d: `ContrastGrid.module.css`
- [ ] Phase 5e: `DataVizSection.module.css`
- [ ] Phase 5f: `FontColorsSection.module.css`
- [ ] Phase 5g: `GreyscaleSection.module.css`
- [ ] Phase 6a: `ScaleEditor.module.css`
- [ ] Phase 6b: `FontBrowser.module.css`
- [ ] Phase 6c: `FontBrowserGrid.module.css`
- [ ] Phase 6d: `CharacterSet.module.css`
- [ ] Phase 6e: `ReadabilityScore.module.css`
- [ ] Phase 7a: `SpacingTab.module.css`
- [ ] Phase 7b: `SpacingScaleSection.module.css`
- [ ] Phase 7c: `RadiusSection.module.css`
- [ ] Phase 7d: `MiscSection.module.css`
- [ ] Phase 8a: `EffectsTab.module.css`
- [ ] Phase 8b: `ShadowSection.module.css`
- [ ] Phase 8c: `ShadowBuilder.module.css`
- [ ] Phase 8d: `FocusRingSection.module.css`
- [ ] Phase 8e: `MotionSection.module.css`
- [ ] Phase 9a: `ComponentsTab.module.css`
- [ ] Phase 9b: `ComponentPreview.module.css`
- [ ] Phase 9c: `ComponentTokenSection.module.css`
- [ ] Phase 9d: `IconLibrarySection.module.css`
- [ ] Phase 10a: `ShowcaseTab.module.css`
- [ ] Phase 10b: `ExportTab.module.css`
- [ ] Phase 11a: `SessionsDrawer.module.css` (phantom token fix + ui tokens)
- [ ] Phase 11b: `ExportPanel.module.css`
- [ ] Phase 12a: `LivePreview.module.css`
- [ ] Phase 12b: `BlogTemplate.module.css`
- [ ] Phase 12c: `DashboardTemplate.module.css`
- [ ] Phase 12d: `LandingTemplate.module.css`
- [ ] Phase 12e: `SystemTemplate.module.css`
- [ ] Phase 13: Inline TSX cleanup + globals.css fallback hex pass
