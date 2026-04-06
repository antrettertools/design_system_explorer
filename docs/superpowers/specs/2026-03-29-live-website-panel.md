# dsygn.cloud — Live Website Panel
_Implementation Design · Created: 2026-03-29_

---

## Problem Statement

The right-hand preview panel currently shows a beautiful, polished website mockup — but it's fictional. The brand is "Spectrum", the testimonials are fake, the footer links go nowhere. The generator works, the UI is production-quality, and yet a real user landing on dsygn.cloud has no way to see pricing, no path to legal pages, and no explanation of what they can actually do.

We need marketing content, pricing, and legal to be visible and accessible. The question is: where?

---

## The Insight

The right panel already does the hardest thing: it renders a full, themed website using 100% CSS custom properties derived from the live design system. Every color, font, spacing value in the panel is a `var(--...)` call. When you hit space and regenerate, the panel updates instantly — not because React re-renders it, but because the browser recalculates CSS variables on `:root`. The "recompute cost" is zero.

This means there is no technical penalty for making the panel content real. The structure already works as a live demo. We just need to swap the content from fictional to actual.

The deeper insight: **if we put the real dsygn.cloud website in the right panel, the product is demonstrating itself on its own marketing page.** Hit space — the pricing section changes color. Hit space again — the typography updates. The CTA button, the feature cards, the footer — all driven by whatever design system the user just generated. No other SaaS can do this.

---

## Decision: Option A — Internal Panel Router

Rather than integrating with `react-router` (which would navigate the whole app and destroy the generator view) or using dead `<a target="_blank">` links (which breaks context), we give the LivePreview panel its own internal navigation state.

```
panelRoute: 'home' | 'pricing' | 'privacy' | 'terms' | 'impressum'
```

This state lives in the `LivePreview` component (or a thin context wrapper). When `panelRoute === 'home'`, the full landing view renders. When the user clicks "Privacy" in the footer, `panelRoute` becomes `'privacy'` and the panel swaps to a legal content view — no URL change, no navigation, generator stays live.

CTA buttons that require app-level action (Sign in, Upgrade, Get started) call back into the existing Zustand store via `openSignInPrompt()` / `openUpgradeModal()` — both already exist and are already wired to the correct modals.

### Why not URL routing?

Changing `window.location` from inside the preview panel would:
- Potentially interfere with the app's own router state
- Remove the split-pane view (routing takes over the full page)
- Make the "back" button confusing (back to where? The generator?)

The panel is a self-contained widget. It should behave like one.

### Why not `<a target="_blank">`?

Opening legal pages in a new tab is a reasonable fallback but creates a jarring context switch. The user leaves dsygn.cloud to read a privacy policy in a separate tab. For something as mundane as a privacy page, an in-panel view is far less disruptive.

---

## Architecture

### Current structure

```
LivePreview.tsx
  └── renders: LandingTemplate | SystemTemplate | DashboardTemplate | BlogTemplate
      (based on `showcaseTemplate` store state + `mode`)
```

In generator mode, `mode === 'generator'` always forces `LandingTemplate`. In detail mode, the user can switch templates. This split is intentional and must stay.

### New structure

```
LivePreview.tsx
  ├── local state: panelRoute ('home' | 'pricing' | 'privacy' | 'terms' | 'impressum')
  │
  ├── mode === 'generator':
  │     panelRoute === 'home'      → <DsygnLanding onNavigate={setPanelRoute} />
  │     panelRoute === 'pricing'   → <PricingView onBack={() => setPanelRoute('home')} />
  │     panelRoute === 'privacy'   → <LegalView page="privacy" onBack={...} />
  │     panelRoute === 'terms'     → <LegalView page="terms" onBack={...} />
  │     panelRoute === 'impressum' → <LegalView page="impressum" onBack={...} />
  │
  └── mode === 'detail':
        (unchanged — template switcher works as before)
```

### Reset behavior

When the user generates a new design (space bar), `panelRoute` should reset to `'home'`. This keeps the experience coherent: you don't want someone stuck on a legal page after hitting space. A `useEffect` watching the design generation timestamp (already in the store) can handle this.

Alternatively, reset only when the user explicitly goes back. Either is defensible — the simpler `useEffect` reset is recommended.

---

## Component Breakdown

### 1. `DsygnLanding` (rename / replace `LandingTemplate`)

This is the main view. It replaces the fictional "Spectrum" content with real dsygn.cloud content. The structural sections remain the same — nav, hero, features, pricing preview, CTA band, footer. The CSS file needs minimal changes because the class names and token usage stay the same.

**Props:**
```ts
interface DsygnLandingProps {
  onNavigate: (route: PanelRoute) => void
}
```

**Sections (structure — content TBD in separate session):**

| Section | Role | Notes |
|---|---|---|
| Nav | Brand + top links | "Features", "Pricing", "Sign in", "Get started" |
| Hero | Value prop headline + CTA | Primary and ghost CTA |
| App mockup | Visual proof | Keep existing mockup widget — it's already token-driven |
| Features | 6 capability cards | Real dsygn.cloud features (replace Spectrum copy) |
| Pricing preview | Teaser with link | Short version — "Free · Lifetime €29" — links to full pricing view |
| Testimonial | Social proof | Real or placeholder for now |
| CTA band | Conversion | Bottom of page |
| Footer | Links + legal | Columns + legal row |

**Interactive elements:**

| Element | Action |
|---|---|
| "Sign in" nav button | `openSignInPrompt('manual')` via store |
| "Get started" nav button | `openSignInPrompt('manual')` via store |
| "Pricing" nav link | `onNavigate('pricing')` |
| Hero primary CTA | `openSignInPrompt('manual')` |
| Pricing preview link | `onNavigate('pricing')` |
| Footer "Privacy" | `onNavigate('privacy')` |
| Footer "Terms" | `onNavigate('terms')` |
| Footer "Impressum" | `onNavigate('impressum')` |

Note: CTAs for signed-in users (e.g. "Upgrade") can be conditionally rendered using `useAuth()`. If the user is signed in and on a free plan, the hero CTA becomes "Upgrade — €29 lifetime" and calls `openUpgradeModal()` instead.

---

### 2. `PricingView`

A focused pricing page rendered inside the panel. Two cards: Free tier and Lifetime. This is where the Stripe CTA lives.

**Props:**
```ts
interface PricingViewProps {
  onBack: () => void
}
```

**Content (structure — copy TBD):**

```
← Back to dsygn.cloud         (back button, sticky top)

PRICING HEADER
  "Simple, honest pricing"

FREE TIER CARD
  - What's included (list)
  - "Start free — no account needed"

LIFETIME CARD (accent border)
  - What's unlocked (list)
  - Price: €29 (early bird badge if VITE_EARLY_BIRD_ACTIVE)
  - CTA: "Get lifetime access"
    → if not signed in: openSignInPrompt('manual')
    → if signed in (free): openUpgradeModal()
    → if signed in (paid): "You're all set ✓" (disabled state)

FAQ (2–3 questions)
  - "Is this really one-time?" Yes
  - "What happens if I don't upgrade?" Free tier stays free
  - "EU VAT?" Handled at checkout via Stripe Tax

FOOTER BAR
  Privacy · Terms · Impressum (navigate within panel)
```

The pricing cards must use design system tokens fully — the accent border on the paid card uses `var(--color-interactive)`, the price uses `var(--font-heading)` and `var(--font-size-h2)`, etc. The cards should visibly update when you regenerate.

---

### 3. `LegalView`

One component handles all three legal pages. It receives a `page` prop and renders the appropriate static content.

**Props:**
```ts
interface LegalViewProps {
  page: 'privacy' | 'terms' | 'impressum'
  onBack: () => void
}
```

**Structure:**
```
← Back                        (back button, sticky)

LEGAL HEADING
  [page title]

CONTENT
  [static text — see content spec below]
```

The legal content is intentionally minimal in styling — mostly `<p>`, `<h3>`, `<ul>` with base token styles. It should not look designed; it should look like a legal document. This is appropriate and builds trust.

**Content sources (TBD in content session):**
- **Privacy Policy**: Iubenda embed OR manually written policy listing Supabase, Stripe, Plausible as processors. Keep it short and honest.
- **Terms of Service**: Standard clauses — service description, payment terms (one-time, non-refundable with EU withdrawal waiver), user content ownership, governing law.
- **Impressum**: Full name, address, email. Required for DE/AT/CH. One paragraph.

> **Note on the real routes:** Even with in-panel legal views, the routes `/legal/privacy`, `/legal/terms`, `/impressum` should still exist in the app router and render the same content. These are needed for GDPR compliance (the policy must be accessible at a stable URL) and for the Supabase/Stripe dashboards where you must enter a privacy policy URL.

---

## Implementation Sequence

### Step 1 — Add `panelRoute` state to `LivePreview`

Minimal change. Add local state, pass `onNavigate` prop to `LandingTemplate`. No visible changes yet.

```ts
// LivePreview.tsx
type PanelRoute = 'home' | 'pricing' | 'privacy' | 'terms' | 'impressum'
const [panelRoute, setPanelRoute] = useState<PanelRoute>('home')
```

Reset on regenerate:
```ts
const { lastGeneratedAt } = useUI() // add this timestamp to store if not present
useEffect(() => { setPanelRoute('home') }, [lastGeneratedAt])
```

### Step 2 — Create `PricingView` and `LegalView` components

Scaffold both components with placeholder content. Wire the `onBack` buttons. No content yet.

File locations:
```
v3/src/features/preview/views/
  PricingView.tsx
  PricingView.module.css
  LegalView.tsx
  LegalView.module.css
```

### Step 3 — Wire `LivePreview` routing

Update `LivePreview` to render the correct component based on `panelRoute`. Verify navigation works end-to-end before touching `LandingTemplate` content.

### Step 4 — Replace `LandingTemplate` content

This is the content session. Replace "Spectrum" with real dsygn.cloud copy section by section. The CSS stays almost entirely the same — only string content changes, no structural rework.

Rename file: `LandingTemplate.tsx` → `DsygnLanding.tsx` (and update imports). The CSS file can keep its name since the class names don't change.

### Step 5 — Wire CTA buttons to store

Add store action calls to the interactive elements in `DsygnLanding`. Verify `openSignInPrompt` and `openUpgradeModal` fire correctly. Add conditional rendering for signed-in vs. signed-out states using `useAuth()`.

### Step 6 — Fill `PricingView` content

Real pricing copy, free tier list, paid tier list, FAQ. Wire the Stripe CTA.

### Step 7 — Fill `LegalView` content

Privacy, Terms, Impressum text. Verify real routes (`/legal/privacy` etc.) also contain the same content.

### Step 8 — Remove `OnboardingOverlay`

Once the landing panel tells the full story (pricing visible, features visible, CTA visible), the onboarding overlay is redundant. Remove it. The panel replaces it entirely.

---

## CSS / Animation Considerations

### Panel transitions

When `panelRoute` changes, the panel should do a simple fade or slide. The simplest approach is a CSS class swap with a transition on `opacity` + `transform`. No animation library needed.

```css
/* views should all get this base treatment */
.view {
  animation: panelEnter 0.18s ease-out;
}

@keyframes panelEnter {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

The back button in `PricingView` and `LegalView` should be `position: sticky; top: 0` so it stays visible while reading long legal text.

### Scroll reset

When navigating to a sub-view, the panel scroll position should reset to the top. The `.panel` element in `LivePreview.module.css` is the scroll container (`overflow-y: auto`). A `useEffect` on `panelRoute` change can call `panelRef.current.scrollTop = 0`.

### Token coverage in Pricing / Legal views

Pricing cards: use `var(--color-interactive)` for the paid tier accent, `var(--font-heading)` for the price, `var(--color-surface-raised)` for card backgrounds.

Legal views: use `var(--color-surface)` for background, `var(--color-on-surface)` for text, `var(--color-border)` for `<hr>` dividers. These are neutral tokens — they update with regeneration but the document never looks "designed", just themed.

---

## What Does NOT Change

- The detail mode template switcher (System, Dashboard, Blog, Landing) is completely unaffected. This change only affects the generator mode right panel.
- The `LandingTemplate.module.css` CSS file needs minimal changes — mostly content copy changes in the TSX, not structural CSS.
- `SplitPane`, `AppHeader`, `GeneratorPanel`, `DetailMode` — untouched.
- The real router routes (`/legal/privacy`, `/impressum`, etc.) remain. The in-panel views are additive, not a replacement.
- The Zustand store has no new actions needed — `openSignInPrompt` and `openUpgradeModal` already exist.

---

## Open Questions for Content Session

1. **Hero headline** — what is the single-sentence value proposition of dsygn.cloud?
2. **Feature grid** — which 6 capabilities to highlight? (Color science, token export, accessibility, hosted pages, cloud saves, lifetime pricing?)
3. **Pricing free tier** — what exactly is free? (Generator, CSS export, 3 local saves — confirm the exact limit messaging)
4. **Pricing paid tier** — full list of what €29 unlocks
5. **Testimonials** — real quotes or placeholders for launch?
6. **Trust bar** — remove the "Trusted by Figma, Linear..." (that was Spectrum fiction) or replace with something honest ("Built for designers and developers")
7. **Impressum** — your full legal name, address, and contact email
8. **Privacy policy** — Iubenda embed or manual? If manual, which data processors to list?
9. **Brand voice** — copy tone for dsygn.cloud (terse and confident? warm and indie? technical?)
10. **Footer columns** — which nav columns make sense for a solo tool at launch? ("Product", "Legal", "Contact" is probably enough — skip "Careers", "Press")

---

## Files to Create / Modify

```
MODIFY:
  v3/src/features/preview/LivePreview.tsx
    — add panelRoute state, conditional rendering

RENAME + MODIFY:
  v3/src/features/preview/templates/LandingTemplate/LandingTemplate.tsx
    → DsygnLanding.tsx (same folder, update import in LivePreview)
    — replace Spectrum content with dsygn.cloud content
    — add onNavigate prop calls to footer + nav links
    — add store action calls to CTA buttons

CREATE:
  v3/src/features/preview/views/PricingView.tsx
  v3/src/features/preview/views/PricingView.module.css
  v3/src/features/preview/views/LegalView.tsx
  v3/src/features/preview/views/LegalView.module.css

OPTIONALLY REMOVE (step 8):
  v3/src/components/OnboardingOverlay.tsx
  v3/src/components/OnboardingOverlay.module.css
  (and remove its import/usage from App.tsx)
```

---

## Definition of Done

- [ ] Right panel in generator mode shows real dsygn.cloud content (brand, features, pricing preview, footer)
- [ ] Hitting space regenerates the design system and the panel visibly updates (colors, fonts)
- [ ] "Pricing" nav link and pricing preview link navigate to `PricingView` within the panel
- [ ] PricingView has correct free/paid tier content and the paid CTA fires the correct modal
- [ ] Footer legal links navigate to `LegalView` with the correct page content
- [ ] Back button in all sub-views returns to `DsygnLanding`
- [ ] "Sign in" and "Get started" CTAs open `SignInPrompt` modal
- [ ] Signed-in free user sees "Upgrade" CTA; paid user sees confirmation state
- [ ] Panel scrolls to top when navigating between views
- [ ] Panel view resets to 'home' on regenerate
- [ ] Real routes (`/legal/privacy`, `/legal/terms`, `/impressum`) still work
- [ ] `OnboardingOverlay` removed (or confirmed redundant and deferred)
- [ ] No regressions in detail mode template switching
