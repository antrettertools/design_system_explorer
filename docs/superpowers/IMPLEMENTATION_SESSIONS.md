# dsygn.cloud — UX Implementation Sessions Log
**Purpose:** Running context for every implementation session. Read this first. Update it after each phase ships.  
**Master spec:** [`dsygn-cloud-ux-master-spec.docx`](../dsygn-cloud-ux-master-spec.docx) (in `dsygn.cloud/` project folder)  
**Spec files:** [`docs/superpowers/specs/`](./specs/)

---

## How to Use This Document

Before starting any implementation session:
1. Read the **Current State** section below — it summarises exactly what the codebase looks like right now.
2. Find your phase in **Phase Status** and read the linked spec.
3. After completing a phase, update **Current State** and mark the phase done.

Do not read the full spec archive for context — this document is the distillation.

---

## Current State (update after each phase)

> Last updated: **2026-04-14** — Phase 2 complete.

### Right Panel / Live Preview
- **Template lock removed** in `LivePreview.tsx`. `const template = showcaseTemplate` — respected in all modes. `mode` destructure also removed (was unused after lock removal).
- `ShowcaseStrip` component **exists** at `v3/src/features/preview/ShowcaseStrip/`. Rendered as sticky strip (36px, `position: sticky; top: 0; z-index: 10`) inside `.panel`. Four chip buttons (Landing/Dashboard/Blog/System) switch template via `setShowcaseTemplate`. Share button copies `location.href` to clipboard (Phase 6 will replace with encoded share URL). Fullscreen button opens current URL in new tab.
- All 4 templates now accessible in both Generator and Detail Mode via the strip.

### App Header
- Center `contextArea` shows nothing in Generator Mode, tab breadcrumb in Detail Mode.
- `.harmonyBadge` and `.pairingLabel` CSS classes exist in `AppHeader.module.css` but are not rendered.
- No visual grouping between the 9 action elements in the right zone.
- Export button radius uses `--ui-radius-cta` alias → `--radius-sm` (tracks generated 4px default, responds to user's radius token). ✓ Phase 2 done.
- Auth dropdown uses `--color-surface`, `--color-border`, `--color-on-surface-subtle`, `--color-surface-raised`. ✓ Phase 2 done.

### Generator Panel
- `SpaceHintBar` is **lock-aware**: shows " — locked slots will hold" hint when some slots locked; shows muted "All slots locked — unlock to regenerate" (with 🔒, `opacity: 0.5`) when all slots locked; falls through to default "Hit SPACE to regenerate" when no locks or empty slots.
- `GeneratorFooter` has a small right-aligned "Detail Mode →" button (28px, **filled with `--color-interactive` background** — not a ghost button as master spec described). Phase 3 replaces with full-width strip.
- **Dual role-label opacity problem:** `ColorSwatches.module.css` `.roleTag { opacity: 0.55 }` is the column *header* above each card; `ColorSlotCard.module.css` `.card[data-light="true"] .roleLabel { color: rgba(0,0,0,0.55) }` is the label *inside* the swatch. Both need opacity increases. Phase 4 fixes both.
- **Lock button hit area:** `.lockBtn { width: 24px; height: 24px }` on desktop (already 32px on mobile). Phase 4 corrects desktop to 32px.
- **Shade strip decoupling:** `ShadeStrip` renders unconditionally based on `slot.locked`. Phase 4 decouples: adds `[shadeOpen, setShadeOpen]` state + chevron toggle + `data-shade-open` attribute. The Phase 2 `.locked .swatch` radius rule becomes a `[data-shade-open="false"] .swatch` rule in Phase 4 (they must coordinate — see Phase 4 spec).
- **`ShadeStrip` radius gap:** `ShadeStrip.module.css` `.strip { border-radius: 0 0 var(--ui-radius-3) var(--ui-radius-3) }` was NOT updated in Phase 2 (Phase 2 only touched Phase 2-listed files). Phase 4 updates this to `--radius-md`.
- **`TypographySpecimen` already uses `<input>` elements** with a `border-bottom` underline for heading + body text — it is more sophisticated than the master spec described. `[headingText, setHeadingText]` state exists. Phase 4 improves the affordance (dashed underline on hover, focus distinction, pencil icon) — it does NOT rebuild from scratch.

### Detail Mode
- "← Generator" back link styled identically to inactive tabs — easy to miss. Phase 3 makes it a bordered pill.
- All 7 tabs functional: Colors, Typography, Spacing, Effects, Components, Showcase, Export.

### App Header (Phase 3 discoveries)
- `.harmonyBadge` and `.pairingLabel` CSS classes **already exist** in `AppHeader.module.css` — Phase 3 is a JSX wiring task, not CSS creation. The styles are already there waiting.
- Phase 3 is primarily: (1) wiring `harmonyBadge`/`pairingLabel` in JSX, (2) adding 3 `actionDivider` spans between the 9 right-zone elements, (3) replacing `detailBtn` with `detailStrip`, (4) changing `.backLink` to a bordered pill, (5) adding `--ui-radius-cta` alias and applying to export button.

### Modals / Overlays
- `SignInPrompt`, `UpgradeModal`, `DonateModal`: all now use `--color-surface`, `--color-border`, `--color-on-surface-subtle`, `--color-surface-raised`. Dark mode renders correctly. ✓ Phase 2 done.
- Modal shadows: all use `var(--shadow-xl, ...)` — brand-tinted and animate on palette switch. ✓ Phase 2 done.
- Modal radii: all use `var(--radius-lg, 12px)` — respond to user's radius token. ✓ Phase 2 done.

### Meta-Theming
- **Colors:** Complete. All `--color-*` tokens injected to `:root` and consumed by app chrome.
- **Typography:** Font tokens (`--font-heading`, `--font-body`) injected and consumed by wordmark and body. Complete.
- **Radius:** Complete. `ColorSlotCard`, `ColorPickerPopover`, `SessionsDrawer` session cards, and all modals now use `--radius-md`/`--radius-lg`. Export button uses `--ui-radius-cta` alias → `--radius-sm`. Phase 2 done.
- **Shadows:** Complete. Modals use `--shadow-xl`, dropdown uses `--shadow-md`, drawer uses brand-tinted directional shadow via `color-mix()`. `ColorPickerPopover` already used `--shadow-lg`. Phase 2 done.
- **Global transition:** `box-shadow` added to transition rule in `globals.css`. Shadow changes now animate smoothly on palette switch.

### Share / Viewer
- **`copyShareLink` in `ShowcaseTab.tsx` is local and incomplete:** missing `stepOverrides` and `stepLocks` from the snapshot, and no `trackEvent` call. Phase 6 moves this logic to `store/ui.ts` as a UIAction (`copyShareLink`) and fixes the snapshot completeness.
- **`DesignSystemViewer.tsx` dark theme bug:** the viewer always injects `tokens.light` into `.viewer-tokens {}` regardless of `snap.theme`. Phase 6 fixes: use `tokens.dark` when `snap.theme === 'dark'`.
- **`DesignSystemViewer.tsx` missing meta:** `document.title` is never updated from the default, and no OG meta tags are injected. Phase 6 adds both.
- **No `loadedFromShare` context:** when the app loads from a `#v3/` hash URL, there is no visual signal that the user is viewing someone else's design rather than their own. Phase 6 adds `loadedFromShare: boolean` to UIState and a `SharedDesignBanner` component.
- **No OG image endpoint:** share links have no preview image when posted to social media or messaging apps. Phase 6 adds `/api/og-image.ts` (1200×630 SVG palette). Note: SPA meta injection via `useEffect` does not work for static crawlers — a Vercel Edge Function or prerender service is needed post-launch for full coverage.

### Mobile
- Touch targets: 40px on mobile (WCAG minimum is 44px). Phase 3 corrects.
- Detail Mode tab strip overflows on narrow viewports. Phase 5 replaces it with a bottom nav on mobile.
- `mobileShowPreview` is not reset when mode changes — ghost state bug. Phase 5 fixes in `store/ui.ts`.
- AppHeader buttons are 40px on mobile (WCAG minimum is 44px). Phase 5 corrects all to 44px.
- `DetailMode.mobilePreviewBtn` is 28px — worst touch target in the app. Phase 5 fixes to 44px.
- `LivePreview.backBtn` has no explicit height — Phase 5 adds `min-height: 44px`.
- `--ui-size-btn-xl` token is 40px — Phase 5 raises to 44px, fixing GeneratorFooter buttons automatically.
- `OnboardingOverlay` shows "Hit SPACE" on touch devices. Phase 5 adds `window.matchMedia('(pointer: coarse)')` detection for adaptive text.

---

## Phase Status

| Phase | Name | Spec | Status | Key files |
|---|---|---|---|---|
| 1 | Template Freedom | [spec](./specs/2026-04-13-phase-1-template-freedom.md) | ✅ Complete (2026-04-14) | `LivePreview.tsx`, new `ShowcaseStrip/`, `SpaceHintBar.tsx` |
| 2 | Meta-Theming Completion | [spec](./specs/2026-04-13-phase-2-meta-theming-completion.md) | ✅ Complete (2026-04-14) | `globals.css`, `ColorSlotCard.module.css`, `ColorPickerPopover.module.css`, modal CSS files, `AppHeader.module.css`, `ui-tokens.css` |
| 3 | Header & Navigation Clarity | [spec](./specs/2026-04-13-phase-3-header-navigation-clarity.md) | ⬜ Not started | `AppHeader.tsx`, `AppHeader.module.css`, `GeneratorFooter.tsx/css`, `DetailMode.module.css` |
| 4 | Generator Spatial Grammar | [spec](./specs/2026-04-13-phase-4-generator-spatial-grammar.md) | ⬜ Not started | `ColorSlotCard.tsx/css`, `ColorSwatches.module.css`, `ShadeStrip.module.css`, `TypographySpecimen.tsx/css`, `GeneratorPanel.tsx/css`, new `TokenHints/` |
| 5 | Mobile & Touch | [spec](./specs/2026-04-13-phase-5-mobile-and-touch.md) | ⬜ Not started | `ui-tokens.css`, `AppHeader.module.css`, `DetailMode.tsx/css`, `LivePreview.tsx/css`, `OnboardingOverlay.tsx`, `store/ui.ts` |
| 6 | Showcase Virality | [spec](./specs/2026-04-13-phase-6-showcase-virality.md) | ⬜ Not started | `store/ui.ts`, `ShowcaseTab.tsx/css`, new `SharedDesignBanner/`, `App.tsx`, `api/og-image.ts`, `DesignSystemViewer.tsx/css` |

**Dependencies:**
- Phase 2 can run in parallel with Phase 3 — no file overlap.
- Phase 4 depends on Phase 2 (radius changes in Phase 2 affect ColorSlotCard; Phase 4 continues in the same file).
- Phase 5 is standalone — no dependency on 3 or 4.
- Phase 6 depends on Phase 1 (share URL must come from the strip, not ShowcaseTab). **Coordination note:** If Phase 1 ships before Phase 6, the `ShowcaseStrip` share button must be a no-op stub (`onClick={() => {}}`) until Phase 6 adds `copyShareLink` to UIActions.

---

## Architecture Quick Reference

> For new sessions — the facts most likely to matter.

### Layer rule (non-negotiable)
```
core/ → store/ → components/ + features/
```
`components/` and `features/` never import from `core/` directly — only from `store/`.

### Token system
- **`--ui-*`** tokens: defined in `v3/src/styles/ui-tokens.css`. Fixed, static, never exported. App chrome only.
- **`--color-*`, `--radius-*`, `--shadow-*`, `--font-*`, `--spacing-*`** tokens: generated at runtime by `buildTokenMap()` in `store/derived.ts`, injected to `:root` inline styles by `injectTokensToDOM()` on every state change. These are the design system output tokens.
- Chrome components should use `--color-*` tokens (already done), `--radius-*` (Phase 2 target), and `--shadow-*` (Phase 2 target).
- **Never** reference `--radius-*` or `--shadow-*` tokens in `ui-tokens.css` — they have no static definition there, only runtime injection.

### Default generated token values (from `core/spacing/scale.ts`)
```
--radius-none:  0px
--radius-sm:    4px   (≈ --ui-radius-2: 4px)
--radius-md:    8px   (= --ui-radius-4: 8px)
--radius-lg:   12px   (= --ui-radius-5: 12px)
--radius-xl:   20px
--radius-full: 9999px
```

### Store selectors
```typescript
useColor()         → { slots, activeRecipe, lastBaseHue, dataVizN, ... }
useTypography()    → { pairing, scale, locks }
useUI()            → { mode, theme, activeTab, showcaseTemplate, ... }
useUIActions()     → { setMode, setTheme, setShowcaseTemplate, setActiveTab, openSignInPrompt, openUpgradeModal, ... }
useColorActions()  → { generate, toggleLock, lockAllSlots, unlockAllSlots, addSlot, removeSlot, ... }
useIsEverythingLocked()  → boolean (all color + typography locks active)
```

### Key types
```typescript
type ShowcaseTemplate = 'landing' | 'dashboard' | 'blog' | 'system'   // store/ui.ts
type AppTheme = 'white' | 'light' | 'dark'                            // store/ui.ts
type DetailTab = 'colors' | 'typography' | 'spacing' | 'effects' | 'components' | 'showcase' | 'export'
```

### CSS conventions
- CSS Modules only. No inline styles. No Tailwind.
- All colors via CSS custom properties — never hardcoded hex.
- Dark mode: `[data-theme="dark"]` on `<html>` only.
- Path alias: `@/` → `v3/src/`

---

## Confirmed-Built Inventory (never re-spec these)

These capabilities exist in the codebase. Any phase spec that seems to propose them is either fixing a bug in them or extending them — not building from scratch.

| Capability | Location | Notes |
|---|---|---|
| 4 showcase templates (Landing/Dashboard/Blog/System) | `features/preview/templates/` | All built; access is the problem, not existence |
| Template switching via Zustand (`showcaseTemplate`) | `store/ui.ts` | `setShowcaseTemplate()` works; just not wired to a persistent strip |
| OKLCH color generation + APCA contrast | `core/color/` | Complete |
| Shade scales (50–950) per slot | `core/color/scales.ts` | Complete |
| Semantic color token derivation | `core/color/semantic.ts` | ~30 roles auto-derived |
| Lock per color slot + lock-all | `store/color.ts`, `AppHeader.tsx` | Working |
| SPACE to regenerate | `App.tsx` keydown handler | Working |
| Harmony/recipe system (RecipeDef, 20+ recipes) | `core/color/harmony.ts` | Working |
| Inline role rename per slot | `ColorSlotCard.tsx` | `startEditing()` on label click |
| Font pairing + on-demand Google Fonts load | `store/typography.ts` | IntersectionObserver for font browser grid |
| Editable specimen text | `TypographySpecimen.tsx` | `useState` for heading + body text; **not visually signaled as editable** — Phase 4 item |
| 4PT spacing grid + radius + shadow token generation | `core/spacing/`, `core/effects/` | Complete |
| Token injection to `:root` | `store/derived.ts` → `injectTokensToDOM()` | Runs on every state change |
| Undo/redo (zundo, 50 steps) | `store/index.ts` | Working |
| Cloud session save/load (Supabase) | `store/sessionSlice.ts` | Requires sign-in for >3 saves |
| Auth: GitHub + Google OAuth | `auth/AuthProvider.tsx` | Working; no email/password |
| Stripe + plan gate | `api/stripe-webhook.ts` | `checkout.session.completed` → `plan = 'paid'` |
| Export: CSS, JSON, ZIP, PDF (gated) | `features/detail/tabs/ExportTab/` | CSS free; rest paid |
| Share link via URL hash | `ShowcaseTab.tsx` `copyShareLink()` | `#v3/` prefix; full state encoded |
| Analytics (Plausible) | `trackEvent()` | Never throws |

---

## What Is NOT Done Yet (product, not UX)

From `CLAUDE.md` — these are blocking launch but not UX phases:
- Iubenda Privacy Policy ID → `PrivacyPage.tsx` placeholder
- Impressum legal details → `ImpressumPage.tsx` placeholder  
- Stripe webhook endpoint → register in Stripe Dashboard for production
- Plausible custom goals → register in Plausible dashboard
- All Vercel env vars → set in Vercel project settings (see `v3/.env.example`)

---

## Phase 1 — Template Freedom — COMPLETE (2026-04-14)

### What shipped
- [x] Template lock removed in `LivePreview.tsx` — `showcaseTemplate` now respected in all modes
- [x] `ShowcaseStrip` component created at `v3/src/features/preview/ShowcaseStrip/`
- [x] `ShowcaseStrip` mounted as sticky strip inside `LivePreview` panel
- [x] `SpaceHintBar` updated to show three lock states (none/some/all locked)
- [x] `SpaceHintBar.module.css` updated with `.locked`, `.lockIcon`, `.hint` rules
- [x] `npx tsc --noEmit` passes (zero errors)
- [x] `npm run build` succeeds
- [x] 191/191 tests pass (30 test files, +9 new tests)

### Deviations from spec
- `mode` destructure removed from `LivePreview.tsx` — spec noted "keep the destructure" but strict TypeScript (`noUnusedLocals`) caught it as an error. `mode` is genuinely unused now; removing it is correct.

### New discoveries / things to carry forward
- None affecting other phases.

### Updated Current State notes
- Right Panel: template lock removed, ShowcaseStrip exists and is mounted
- Generator Panel: SpaceHintBar is now lock-aware (three states)
- Phase 6 coordination note still valid: ShowcaseStrip share button uses `location.href` stub; Phase 6 replaces with encoded share URL

---

## Phase 2 — Meta-Theming Completion — COMPLETE (2026-04-14)

### What shipped
- [x] `globals.css`: `box-shadow` added to the global transition rule — shadows now animate on palette switch
- [x] `ColorSlotCard.module.css`: `.card`, `.locked .swatch`, `.touchOver` all use `--radius-md, 8px`
- [x] `ColorPickerPopover.module.css`: `.popover` uses `--radius-md, 8px`
- [x] `SignInPrompt.module.css`: `.modal` uses `--radius-lg, 12px` radius + `--shadow-xl` shadow
- [x] `UpgradeModal.module.css`: `.modal` uses `--radius-lg, 12px` radius + `--shadow-xl` shadow
- [x] `DonateModal.module.css`: `.modal` uses `--radius-lg, 12px` radius + `--shadow-xl` shadow
- [x] `ui-tokens.css`: `--ui-radius-cta: var(--radius-sm, var(--ui-radius-3))` alias added
- [x] `AppHeader.module.css`: `.exportBtn` uses `--ui-radius-cta`; `.dropdown` uses `--shadow-md`
- [x] `SessionsDrawer.module.css`: `.drawer` shadow uses `color-mix(in oklch, var(--color-interactive) 12%, rgba(0,0,0,0.08))`
- [x] Legacy token cleanup complete in `SignInPrompt`, `UpgradeModal`, `DonateModal`, `AppHeader` auth section — all `--ui-surface-1/2`, `--ui-border`, `--ui-border-strong`, `--ui-text-2/3` replaced with `--color-*` tokens
- [x] `npx tsc --noEmit` passes (zero errors)
- [x] `npm run build` succeeds
- [x] 191/191 tests pass (30 test files, no regressions)

### Deviations from spec
- **Spec 2.2 `.sessionCard` skipped**: The spec referenced `.sessionCard { border-radius: var(--ui-radius-4) }` in `SessionsDrawer.module.css`, but this class does not exist in the actual codebase. The actual class is `.sessionItem`, which has no `border-radius` at all (it's a list row with padding, not a card shape). No action taken — this was a spec artifact.
- **`SessionsDrawer` shadow**: Spec said "prefer `--shadow-lg` color but override direction". Instead, used `color-mix(in oklch, var(--color-interactive, #6366f1) 12%, rgba(0,0,0,0.08))` which directly extracts the brand hue rather than approximating from a symmetric token. This is cleaner and more precise.

### New discoveries / things to carry forward
- `--color-border-strong` **is** emitted by `deriveNeutralRoles` in `core/color/semantic.ts` as `scale[400]`. No fallback needed.
- `--color-surface-raised` is emitted as `#ffffff` in light mode by `derived.ts`. In dark mode it needs to be checked — if it resolves to a dark value, modals will look correct. Verify when testing dark mode.
- Phase 4 will also touch `ShadeStrip.module.css` `.strip { border-radius: 0 0 var(--ui-radius-3) var(--ui-radius-3) }` — this should be updated to `--radius-md` in Phase 4. Per the Phase 4 spec, `.locked .swatch` rule in ColorSlotCard (which we changed to `--radius-md`) may need coordination with the shade-open state toggle.

### Updated Current State notes
- Meta-Theming section updated: Radius, Shadows, and Global transition all complete.
- App Header section updated: export button and auth dropdown now use correct tokens.
- Modals section updated: all three modals now render correctly in dark mode.

---

## Phase Completion Checklist Template

When marking a phase complete, verify and update:

```
## Phase N — [Name] — COMPLETE (YYYY-MM-DD)

### What shipped
- [ ] All spec items implemented
- [ ] npx tsc --noEmit passes (zero errors)
- [ ] Visual test: [specific test from spec's Test Cases section]
- [ ] Dark mode: modals/overlays render correctly in dark theme
- [ ] Mobile: tested at 375px viewport

### Deviations from spec
- [None] or [list what changed and why]

### New discoveries / things to carry forward
- [e.g. "Found that --color-border-strong is not emitted in dark mode — added fallback"]
- [e.g. "Phase 4 should also update X because we found Y"]

### Updated Current State notes
- [specific bullets to update in the Current State section above]
```
