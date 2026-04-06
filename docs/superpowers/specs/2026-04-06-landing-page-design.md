# dsygn.cloud — Landing Page Design
_Created: 2026-04-06_

---

## Overview

Replace the fictional "Spectrum" content in `LandingTemplate.tsx` with the real dsygn.cloud homepage. The page lives inside the right-panel preview (`LivePreview`) in generator mode — meaning every CSS custom property on it is derived live from the current design system state. Hit space and the whole page regenerates.

**Primary goal:** conversion for vibe coders (fast-moving indie builders who need a design system immediately). Secondary audiences: frontend developers and product designers.

**Design philosophy:** Demo-forward + lean. Every section showcases a specific token category. There is no filler. Features explanation comes *after* the visitor has already experienced the demo.

---

## Architecture: No Change

The existing panel routing architecture from `2026-03-29-live-website-panel.md` applies. The `LandingTemplate` is renamed to `DsygnLanding` and receives an `onNavigate` prop for in-panel routing to Pricing, Privacy, Terms, Impressum. No new routing infrastructure is needed — it already exists or is already specced.

```
LivePreview.tsx
  └── mode === 'generator', panelRoute === 'home'
        → <DsygnLanding onNavigate={setPanelRoute} />
```

All CTA buttons that require app-level actions call into the existing Zustand store:
- `openSignInPrompt('manual')` — Sign in, Get started
- `openUpgradeModal()` — Upgrade CTA (shown to signed-in free users)
- `openDonateModal('footer')` — Buy me a coffee link

CSS: `LandingTemplate.module.css` keeps its filename and all class names. Only string content in the TSX changes, plus new sections added.

---

## Sections — Full Spec

### 01 NAV
**Purpose:** Navigation and primary CTAs.

**Content:**
- Logo: "dsygn.cloud" (heading font, weight 800)
- Links: Pricing (→ `onNavigate('pricing')`), Blog (→ placeholder `/blog`, opens in new tab)
- Right: "Sign in" (ghost button → `openSignInPrompt('manual')`), "Get started" (primary button → `openSignInPrompt('manual')`)
- Signed-in free user: replace "Get started" with "Upgrade — €29" → `openUpgradeModal()`
- Signed-in paid user: hide both auth buttons entirely — they're already a paying user, no CTA needed in the panel nav

**Tokens used:** `--color-surface`, `--color-border`, `--font-heading`, `--color-interactive`, `--color-on-surface-subtle`

---

### 02 HERO
**Purpose:** Value prop. Convert immediately.

**Headline (display size):**
> Your design system,  
> in one keystroke.

**Subline (body):**
> Generate a complete, production-ready design system — colors, typography, spacing, tokens — in seconds. Built for vibe coders, designers, and dev teams.

**CTAs:**
- Primary: "Start building free" → `openSignInPrompt('manual')`
- Ghost: "See pricing" → `onNavigate('pricing')`

**Space hint:** A small label below the CTAs: "Hit ␣ to regenerate this page" — visible only in the panel context, subtle, italic. This is the unique hook that no other tool can claim.

**Tokens used:** `--font-display-size`, `--font-display-weight`, `--font-heading`, `--font-body-size`, `--color-interactive`, `--color-on-surface`

---

### 03 LIVE PALETTE
**Purpose:** Showcase every color in the generated palette — visually, instantly.

**Structure:**
- Section label: "Your colors"
- Row 1 — Core palette: All `ColorSlot` entries rendered as swatches with their role name (brand, interactive, accent-a, accent-b, accent-c, accent-d) and hex value
- Row 2 — Semantic states: success, warning, error, info — each swatch with label
- Row 3 — Data viz strip: dataviz-1 through dataviz-N (from `dataVizN` in store)

All swatches update when the user hits space. This is the "wow" moment.

**Implementation note:** Read colors from the store via `useColor()`. The swatches use `var(--color-brand-500)`, `var(--color-interactive)`, `var(--color-accent-a-500)` etc. — not hardcoded hex. The current `ColorSlot` hex is only used for the small text label.

**Tokens used:** All palette tokens, `--color-success`, `--color-warning`, `--color-error`, `--color-info`, `--color-dataviz-1` through `--color-dataviz-N`

---

### 04 TYPOGRAPHY SCALE
**Purpose:** Showcase the full type scale and font pairing.

**Structure:**
- Section label: "Your typography"
- Font pairing badge: "{HeadingFont} + {BodyFont}" — updates on regenerate
- 5 specimen rows:
  | Label    | Token size               | Token weight               | Sample text              |
  |----------|--------------------------|----------------------------|--------------------------|
  | Display  | `--font-display-size`    | `--font-display-weight`    | "The quick brown fox"    |
  | Heading  | `--font-h1-size`         | `--font-h1-weight`         | "The quick brown fox"    |
  | Subhead  | `--font-h2-size`         | `--font-h2-weight`         | "The quick brown fox"    |
  | Body     | `--font-body-size`       | `--font-body-weight`       | "The quick brown fox jumps over the lazy dog." |
  | Small    | `--font-small-size`      | `--font-small-weight`      | "Caption · Label · Meta" |

Heading rows use `var(--font-heading)` as font-family. Body/Small rows use `var(--font-body)`.

**Tokens used:** `--font-display-*`, `--font-h1-*` through `--font-h3-*`, `--font-body-*`, `--font-small-*`, `--font-heading`, `--font-body`

---

### 05 COMPONENTS IN ACTION
**Purpose:** Show that the design system produces real, usable UI components — all token-driven.

**Section label:** "Your components"

**Sub-sections:**

**Buttons** (one row):
- Primary: filled, `--color-interactive` bg
- Secondary: `--color-surface-raised` bg, border
- Ghost: transparent, border only
- Destructive: `--color-error` bg

**Badges** (one row, varied background from palette):
- Default · Success · Warning · Error · Info
- Uses `--color-{state}-container` bg + `--color-{state}` text

**Input** (one field):
- Labeled "Email" with placeholder
- Uses `--color-surface`, `--color-border`, `--color-on-surface`, `--radius-md`

**Alert cards** (4 cards, 2×2 grid):
- Success: "Tokens compiled" · 47 tokens, no contrast errors
- Info: "New harmony model" · Triadic — 4 accents generated
- Warning: "Breaking change" · Token names changed in v2
- Error: "Contrast failed" · Body text below 4.5:1 on surface-raised

Each card uses `--color-{state}-container` background and `--color-{state}` border + icon color.

**Tokens used:** `--color-interactive`, `--color-surface-raised`, `--color-error`, `--color-success`, `--color-warning`, `--color-info`, `--color-{state}-container`, `--radius-md`, `--shadow-sm`, `--color-border`

---

### 06 SPACING + EFFECTS
**Purpose:** Show spacing, radius, and shadow tokens visually.

**Section label:** "Your spacing + effects"

**Spacing scale** — horizontal bars, 7 steps:
- xs, sm, md, lg, xl, 2xl, 3xl
- Bar width = `var(--ui-space-{step})`, colored with `var(--color-interactive)`
- Value label next to each bar

**Border radius chips** — 6 boxes, same height, varying radius:
- none, sm, md, lg, xl, full
- Outlined box showing the radius shape

**Shadow boxes** — 4 elevated boxes:
- sm, md, lg, xl
- `box-shadow: var(--shadow-{step})`

**Tokens used:** `--ui-space-xs` through `--ui-space-3xl`, `--radius-none` through `--radius-full`, `--shadow-sm` through `--shadow-xl`

---

### 07 FEATURES — 3 CARDS
**Purpose:** Explain the tool *after* the visitor has already experienced it.

**Section label:** "How it works"

**Cards:**
1. **OKLCH Color Science** — Perceptually uniform colors. Every shade looks intentional — no muddy mid-tones, no blown-out lights. Semantic state colors generated automatically.
2. **Token Export** — CSS variables, Tailwind v3/v4, SCSS, W3C Design Tokens, Figma JSON. One click. Always in sync.
3. **Ship in Seconds** — Hit ␣ space to regenerate. Lock what you love. Export and paste. No config files, no rituals.

Each card has an icon (reuse `TemplateIcon`), colored with the corresponding accent slot (`--color-accent-a`, `--color-accent-b`, `--color-brand-500`).

**Tokens used:** `--color-surface-raised`, `--shadow-sm`, `--radius-md`, `--color-accent-a`, `--color-accent-b`, `--color-brand-500`, `--font-h3-size`

---

### 08 PRICING
**Purpose:** Convert. Inline pricing — no modal, no extra click.

**Section label:** "Simple pricing"

**Free card:**
- Label: "Free"
- Price: "€0"
- Included: Generator (all features), CSS export, 3 saved designs, anonymous use
- CTA: "Start free" → `openSignInPrompt('manual')`

**Lifetime card** (accent border: `--color-interactive`):
- Label: "Lifetime" + early-bird badge if `VITE_EARLY_BIRD_ACTIVE === 'true'`
- Price: "€29" (one-time, no subscription)
- Included: Everything in free + unlimited cloud saves, all export formats (ZIP, Figma, W3C, SCSS, Tailwind), branding PDF, hosted public design system page, version history
- CTA:
  - Not signed in → "Get lifetime access" → `openSignInPrompt('manual')`
  - Signed in (free) → "Upgrade — €29" → `openUpgradeModal()`
  - Signed in (paid) → "You're all set ✓" (disabled)

**Buy me a coffee line** (below the cards, centered, small):
> Enjoying dsygn.cloud? ☕ [Buy me a coffee] — triggers `openDonateModal('footer')`

**Tokens used:** `--color-surface-raised`, `--color-interactive`, `--color-on-surface`, `--shadow-md`, `--radius-lg`, `--font-h1-size` (price), `--font-body-size`

---

### 09 FOOTER
**Purpose:** Legal links and product navigation. Small, clean.

**Two columns:**
- **Product:** Features (scrolls to #features on landing), Pricing (→ `onNavigate('pricing')`), Blog (→ `/blog`, new tab)
- **Legal:** Privacy (→ `onNavigate('privacy')`), Terms (→ `onNavigate('terms')`), Impressum (→ `onNavigate('impressum')`)

**Bottom bar:**
- Left: © 2026 dsygn.cloud
- Right: (empty or optional social icon)

**Tokens used:** `--color-surface-sunken`, `--color-border`, `--color-on-surface-subtle`, `--font-small-size`

---

## Design Token Coverage

| Category | Tokens showcased |
|---|---|
| Color — palette | brand-500, interactive, accent-a/b/c/d, all shade scales |
| Color — semantic | success, warning, error, info + container variants |
| Color — data viz | dataviz-1 through dataviz-N |
| Color — surface | surface, surface-raised, surface-sunken, background |
| Typography | display, h1, h2, h3, body, small — size + weight + family |
| Spacing | xs, sm, md, lg, xl, 2xl, 3xl |
| Border radius | none, sm, md, lg, xl, full |
| Shadows | sm, md, lg, xl |
| Components | buttons (4 variants), badges (5), input, alerts (4 states) |

---

## What's Intentionally Excluded

| Excluded | Reason |
|---|---|
| Trust bar ("Trusted by Figma…") | Fiction — remove entirely |
| Testimonials | No real quotes at launch |
| 6-card feature grid | Too corporate; 3 cards is enough |
| Duplicate CTA band | Pricing section already converts |
| App mockup browser widget | Palette + components sections do this better |
| 4-column footer | Solo indie tool; 2 columns is honest |

---

## Files to Create / Modify

```
RENAME + MODIFY:
  v3/src/features/preview/templates/LandingTemplate/LandingTemplate.tsx
    → DsygnLanding.tsx (update import in LivePreview.tsx)
    — Replace all "Spectrum" content with real dsygn.cloud content
    — Add sections 03–06 (palette, type scale, components, spacing/effects)
    — Add onNavigate prop calls to all nav/footer links
    — Add store action calls to all CTA buttons
    — Conditional rendering for auth state (signed-in vs signed-out vs paid)

MODIFY (minimal):
  v3/src/features/preview/templates/LandingTemplate/LandingTemplate.module.css
    — Keep all existing class names
    — Add classes for new sections (palette strip, type scale, component grid, spacing/effects)
    — No structural changes to existing styles

MODIFY:
  v3/src/features/preview/LivePreview.tsx
    — Add local state: `const [panelRoute, setPanelRoute] = useState<PanelRoute>('home')`
      where `type PanelRoute = 'home' | 'pricing' | 'privacy' | 'terms' | 'impressum'`
    — Reset panelRoute to 'home' on regenerate (useEffect watching lastGeneratedAt or color slot changes)
    — Update import: LandingTemplate → DsygnLanding
    — Pass `onNavigate={setPanelRoute}` prop to DsygnLanding
    — For non-home panelRoute values, render PricingView / LegalView per 2026-03-29-live-website-panel.md
    Note: panelRoute state does NOT exist in the current codebase — it must be added here.
```

Note: `PricingView` and `LegalView` (in-panel sub-pages) are already specced in `2026-03-29-live-website-panel.md`. This spec covers only the `DsygnLanding` homepage content.

---

## Copy Tone

**Voice:** Terse, confident, indie. No corporate filler. Respect the reader's time.
- Good: "Your design system, in one keystroke."
- Bad: "Empowering teams to collaborate on design systems at scale."

**Brand name:** "dsygn.cloud" in nav/footer logo, "dsygn.cloud" in body copy where needed.

---

## Definition of Done

- [ ] "Spectrum" brand name appears nowhere in the panel
- [ ] All 9 sections render correctly in generator mode
- [ ] Live palette (section 03) shows all color slots from current store state
- [ ] Typography scale (section 04) shows actual selected fonts at actual token sizes
- [ ] Component section (section 05) — all 4 button variants, badges, input, 4 alert cards
- [ ] Spacing/effects section (section 06) — spacing bars, radius chips, shadow boxes
- [ ] Features section (section 07) — 3 cards, accent-colored icons
- [ ] Pricing section (section 08) — Free + Lifetime cards, correct CTA state per auth
- [ ] "Buy me a coffee" link opens `DonateModal` with `source='footer'`
- [ ] Footer has Product column (Features, Pricing, Blog) and Legal column (Privacy, Terms, Impressum)
- [ ] All footer legal links navigate correctly (in-panel for privacy/terms/impressum)
- [ ] Blog link opens `/blog` in new tab
- [ ] Hitting ␣ space regenerates the full page (colors, fonts, spacing all update)
- [ ] No hardcoded hex colors anywhere in the new sections — 100% CSS vars
- [ ] No regressions in detail mode template switching
