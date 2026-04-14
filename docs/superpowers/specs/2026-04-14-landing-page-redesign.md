# Landing Page Redesign — dsygn.cloud

**Date:** 2026-04-14  
**Status:** Approved for implementation  
**Scope:** `DsygnLanding` template redesign + two new browser routes (`/pricing`, `/blog`)

---

## 1. Goal

Restructure the right-panel landing page template (`DsygnLanding`) so that:

1. First-time visitors understand the product *before* encountering the live design system output
2. The spacebar viral hook is visually prominent, not a footnote
3. The live design system is presented as a single unified "wow moment" instead of four separate scroll stops
4. Pricing is positioned near the emotional peak, not buried at the bottom
5. The nav is useful as a page outline with anchor links to all major sections
6. Two key destinations (`/pricing`, `/blog`) get real browser routes for deep-linking

### What does NOT change

- The overall app architecture: the tool stays at `/`, `DsygnLanding` stays as the default showcase template in the right preview pane
- All store/state/token logic — no changes to `core/`, `store/`, or how tokens are injected
- The existing four showcase templates (Landing, Dashboard, Blog, System) and the `ShowcaseStrip`
- All auth, export, sessions, and modal behaviour
- Existing routes: `/`, `/sign-in`, `/s/:username/:slug`, `/account`, `/legal/*`, `/impressum`

---

## 2. Page Structure

The new section order for `DsygnLanding` (top → bottom):

| # | Section | Change from current |
|---|---------|---------------------|
| 1 | Nav | Expanded link set |
| 2 | Hero | Spacebar dramatized |
| 3 | How it works | Moved from section 7 → 3 |
| 4 | Live design system | 4 sections → 1 magazine grid |
| 5 | Features | Kept, copy refined |
| 6 | Pricing | Moved from section 8 → 6 |
| 7 | Deep dive | Spacing + effects (moved to bottom) |
| 8 | Footer | Expanded columns |

---

## 3. Section Specifications

### 3.1 Nav

**Current:** Logo | Pricing (panel-nav) | Blog (external link) | Sign in | Get started

**New:** Logo | How it works | Features | Pricing | Blog | Sign in | Get started

#### Link behaviour

| Link | Behaviour |
|------|-----------|
| `How it works` | Smooth-scroll to `#how-it-works` on the landing page |
| `Features` | Smooth-scroll to `#features` on the landing page |
| `Pricing` | Smooth-scroll to `#pricing` on the landing page AND navigates to `/pricing` route when accessed from outside the tool |
| `Blog` | Navigates to `/blog` route (new) |
| `Sign in` | `openSignInPrompt('manual')` — unchanged |
| `Get started` | `openSignInPrompt('manual')` — unchanged |
| `Upgrade — €29` | `openUpgradeModal()` — shown when user is signed in + free, unchanged |

The `onNavigate` panel-route mechanism for `'pricing'` is replaced by anchor-scroll for the landing page context. The separate `/pricing` route handles direct URL access.

---

### 3.2 Hero

**Headline:** Keep as-is — *"Your design system, in one keystroke."*

**Subheadline:** Tighten to one punchy sentence. Remove the current list of features. Suggested copy:

> *Generate a complete, production-ready design system — colors, typography, spacing, tokens — in seconds.*

**Spacebar visual:** Replace the current small grey hint text (`Hit ␣ to regenerate this page`) with a large, prominent keyboard key component. Rendered only when `mode === 'generator'`. Design:

- A styled `<kbd>` element that looks like a real spacebar key — wide, shallow, with a subtle shadow and border
- Label: `␣  Space  —  regenerate`
- Size: approximately 200px wide, clearly visible, not a footnote
- Positioned between the CTA buttons and the next section, with generous whitespace around it

**Social proof line:** Add a single line below the spacebar key (or below the CTAs):

> *Join N designers already building with dsygn.cloud*

For launch, use a static number (e.g. "hundreds of"). After real usage data is available, wire to a Supabase count or hardcode a meaningful number. This is a single `<p>` element — no backend work required for v1.

**CTAs:** Unchanged — "Start building free" + "See pricing" (anchor scroll to `#pricing`)

---

### 3.3 How it works

**Section id:** `how-it-works`

**Label:** "How it works"

**Format:** Three large numbered steps, replacing the current 3-card icon grid. Each step has:
- A large step number (styled, prominent — not a badge)
- A bold step title
- 1–2 sentence description

**Steps:**

| # | Title | Description |
|---|-------|-------------|
| 1 | Hit ␣ Space | A complete design system generates instantly — OKLCH-calibrated colors, a font pairing, spacing scale, and every semantic token. |
| 2 | Lock & refine | Love the color? Lock it. Not the font? Hit space again. Build exactly what you want by locking what's working and regenerating the rest. |
| 3 | Export & ship | CSS variables, Tailwind v3/v4, SCSS, W3C Design Tokens, Figma JSON — copy and paste. No config files, no setup rituals. |

**Layout:** Steps displayed horizontally on desktop (3 columns), stacked on mobile.

---

### 3.4 Live design system

**Section headline:** `"This page runs on your tokens."`

**Section sublabel:** `"Every color, font, and component below is rendered live using your current design system."`

**Format:** Magazine grid — all four dimensions visible simultaneously in one section, rendered with live CSS variables. No tabs.

**Grid layout:**

```
┌─────────────────────┬─────────────────────┐
│  Colors             │  Typography         │
│  (full swatch row + │  (specimen rows:    │
│   semantic states)  │   Display → Small)  │
├─────────────────────┴─────────────────────┤
│  Components                               │
│  (buttons row + badges row + one input)   │
├───────────────────────────────────────────┤
│  Spacing scale (compact bar visual)       │
└───────────────────────────────────────────┘
```

**Colors block:**
- Row 1: one swatch per color slot (`var(--color-{role}-500)`) — full width
- Row 2: semantic states (success, warning, error, info) — compact chips with label
- Data viz strip: `N` segments from `var(--color-dataviz-{i})`

**Typography block:**
- Font pairing badge: `{heading} + {body}` — unchanged from current
- Specimen rows: Display, Heading, Subhead, Body, Small — rendered with CSS vars, condensed

**Components block:**
- Buttons row: Primary, Secondary, Ghost, Destructive — unchanged from current `ComponentsSection`
- Badges row: Default, Success, Warning, Error, Info — unchanged from current
- One input: Email field with label — unchanged from current
- Alerts grid: 4 semantic alert cards — unchanged from current

**Spacing block (compact):**
- Visual bar scale for xs → 3xl using `var(--ui-space-*)` only — no border radius or shadow in this block
- Border radius and shadows are deferred to the Deep dive section (§3.7) to keep the magazine grid scannable

The `ComponentsSection`, `PaletteSection`, `TypographySection`, and `SpacingSection` sub-components are merged into a single `LiveSystemSection` component rendered as the magazine grid.

---

### 3.5 Features

**Section id:** `features`

**Format:** 6-card grid — unchanged from current `FeaturesSection`.

**Copy:** Refine existing card copy for tighter language (no structural change).

---

### 3.6 Pricing

**Section id:** `pricing`

**Format:** Free + Lifetime cards — unchanged from current `PricingSection`.

**Changes:**
- Add `id="pricing"` to the section element so anchor navigation works
- The "See pricing" CTA in the hero scrolls to this section
- The nav "Pricing" link also scrolls to this section
- No content or card changes

---

### 3.7 Deep dive

A collapsible or simply scrollable section at the bottom for visitors who want to explore the full token set. Contains the full spacing, effects, and data viz sections that were previously interspersed through the page.

**Label:** `"Explore the full system"`

**Contents (in order):**
- Spacing scale (full, from current `SpacingSection`) — already included above in compact form; this is the full version
- Border radius (full)
- Shadow builder
- Data viz strip (full width)

This section is **not** collapsed by default — it is simply below the fold, only reached by scrolling past Pricing. No accordion/toggle needed for v1.

---

### 3.8 Footer

**Changes from current:**

Two columns (the current single column becomes two):

| Column | Links |
|--------|-------|
| Product | Features · How it works · Pricing · Blog |
| Legal | Privacy · Terms · Impressum |

The "Explore" column (for future Gallery etc.) is omitted in v1 — adding an empty column would look broken.

The `onNavigate` panel-route for `'pricing'`, `'privacy'`, `'terms'`, `'impressum'` is replaced by:
- Privacy, Terms, Impressum → use React Router `<Link>` to existing routes (`/legal/privacy`, `/legal/terms`, `/impressum`)
- Pricing → anchor scroll to `#pricing`
- Blog → `<a href="/blog">`

---

## 4. New Routes

### 4.1 `/pricing`

**File:** `v3/src/pages/PricingPage.tsx`

A standalone page that renders the pricing cards outside the tool UI. Layout:

- Minimal page wrapper (no `AppHeader`, no split pane)
- dsygn.cloud wordmark + nav linking back to `/`
- The existing `PricingSection` content (reused as a shared component or inline)
- Footer with legal links

**Purpose:** Deep-linking from blog posts, social shares, external references.

### 4.2 `/blog`

**File:** `v3/src/pages/BlogPage.tsx`

For v1, a simple stub:
- Renders a "Coming soon" or redirects externally if a blog URL exists
- Minimal page wrapper with wordmark and back link
- Can be replaced with real blog content later without changing the route

**Router additions:**

```ts
{ path: '/pricing', element: <PricingPage /> },
{ path: '/blog',    element: <BlogPage /> },
```

---

## 5. Component Architecture

### New / changed components

| Component | File | Change |
|-----------|------|--------|
| `DsygnLanding` | `features/preview/templates/LandingTemplate/DsygnLanding.tsx` | Full restructure per spec |
| `LiveSystemSection` | `features/preview/templates/LandingTemplate/LiveSystemSection.tsx` | New — merges the 4 current sub-sections into one magazine grid |
| `HowItWorksSection` | `features/preview/templates/LandingTemplate/HowItWorksSection.tsx` | New extracted component — replaces the current icon-card "How it works" in `FeaturesSection` |
| `PricingPage` | `pages/PricingPage.tsx` | New standalone page |
| `BlogPage` | `pages/BlogPage.tsx` | New stub page |

### Deleted sub-components (merged into `LiveSystemSection`)

The following are absorbed into `LiveSystemSection` and removed as standalone exports:
- `PaletteSection` (in `DsygnLanding`)
- `TypographySection` (in `DsygnLanding`)
- `ComponentsSection` (in `DsygnLanding`)
- `SpacingSection` (in `DsygnLanding`) — compact version in `LiveSystemSection`, full version remains in deep dive

---

## 6. Anchor Scroll Behaviour

All anchor links (`#how-it-works`, `#features`, `#pricing`) use `element.scrollIntoView({ behavior: 'smooth' })`.

Since `DsygnLanding` renders inside the right preview pane (a scrollable container), `window.scrollIntoView` will not work — the scroll target is the pane container, not the document.

Implementation:

```ts
// In DsygnLanding, replace onNavigate('pricing') calls with:
function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
```

The preview pane's scroll container in `LivePreview` renders `DsygnLanding` in a normally-flowing div, so `document.getElementById` will find the section and `scrollIntoView` will scroll the nearest scrollable ancestor — the pane itself. No ref threading needed.

**`DsygnLandingProps` update:** The `onNavigate` prop type changes from `(route: PanelRoute) => void` to `(route: 'privacy' | 'terms' | 'impressum') => void` — only the legal panel routes remain, since pricing is now anchor-scroll and blog is a real route. Callers in `LivePreview` update accordingly.

---

## 7. CSS / Styling Rules

All existing styling rules from `CLAUDE.md` apply:

- CSS Modules only — new sections get new class names in `LandingTemplate.module.css`
- All colors via CSS custom properties — the live system section uses `var(--color-*)` throughout, which is the whole point
- No inline styles except where dynamically driven by token values (same pattern as current `PaletteSection`)
- No new dependencies

The `PricingPage` and `BlogPage` get their own CSS Module files (`PricingPage.module.css`, `BlogPage.module.css`).

---

## 8. Out of Scope

The following are explicitly deferred and should **not** be built as part of this spec:

- **Gallery / Explore page** (`/gallery`) — future phase
- **Social proof counter** wired to live Supabase data — v1 uses static copy
- **Blog content** — `/blog` is a stub only
- **Mobile / responsive layout** — the preview pane is desktop-oriented; mobile layout improvements are a separate phase
- **Animations** — the spacebar key visual is static for v1; pulse/animation is a nice-to-have for a later pass
- **OG image for `/pricing`** — can be added later

---

## 9. Success Criteria

- [ ] Landing page section order matches spec (Nav → Hero → How it works → Live system → Features → Pricing → Deep dive → Footer)
- [ ] "How it works" section has `id="how-it-works"` and is reachable from nav
- [ ] Features section has `id="features"` and is reachable from nav
- [ ] Pricing section has `id="pricing"` and is reachable from nav + hero CTA
- [ ] Spacebar key visual is prominently rendered when `mode === 'generator'`
- [ ] Live system magazine grid shows all four dimensions (colors, type, components, spacing) in one section
- [ ] `/pricing` route renders pricing content standalone without the tool UI
- [ ] `/blog` route renders without error
- [ ] No TypeScript errors (`npx tsc --noEmit` passes)
- [ ] All existing tests pass (`npm test`)
- [ ] No hardcoded colors — all values via CSS custom properties
