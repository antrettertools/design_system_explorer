# "Buy Me a Coffee" Integration Plan
**Date:** 2026-04-05
**Status:** Draft

---

## Summary

Add a lightweight, low-friction donation mechanism to dsygn.cloud that lets users voluntarily tip the maker without any account requirement. The implementation reuses the existing Stripe infrastructure (already in production for the Lifetime upgrade flow) via pre-configured **Stripe Payment Links** — static URLs created once in the Stripe dashboard, requiring zero new serverless functions. The UI surface is a small heart/coffee button in the **footer** plus a context-aware entry in the **user dropdown menu**, opening a minimal modal with three preset amounts and a custom amount option. Post-donation, the existing `?donated=1` query-param + toast pattern (identical to `?upgraded=1`) handles the thank-you moment.

Total new code: ~3 small files, modifications to 4 existing files. Estimated effort: 3–4 hours.

---

## Provider Analysis

### Option A — Stripe Payment Links (recommended)

Stripe Payment Links are static, pre-configured checkout URLs created in the Stripe dashboard (Products → Payment Links). Each link maps to a one-time price object. No server code is needed: clicking a link opens Stripe-hosted checkout, the user pays, and Stripe redirects to `APP_URL/?donated=1` on success.

**Pros:**
- Zero new API routes — no `create-donation-checkout.ts` needed
- Stripe is already integrated, trusted by users, and handles EU VAT/tax display
- PCI compliant by default, no card data touches the app
- Payment Links support `?prefilled_amount=500` (in cents) for dynamic amount selection
- Webhook is optional: donations don't need to mutate user state, so `stripe-webhook.ts` needs no changes
- Single source of truth for payment processing already audited in production

**Cons:**
- Slightly less flexibility than a custom Checkout Session (can't attach `metadata` for analytics without a webhook)
- Amount customization requires either multiple Payment Links (one per preset) or the "customer chooses quantity" trick

**Mitigation:** Create three Payment Links — one per preset amount (€3, €7, €15). A custom-amount flow can use a single "donate €1" link with quantity driven by user input, or simply link out to a fourth "custom" Payment Link with the customer-sets-price feature enabled.

### Option B — Buy Me a Coffee widget/API

BMC offers an embeddable widget script and a hosted page (buymeacoffee.com/username). The widget injects a floating button and iframe.

**Cons:**
- Third-party script injection with unknown performance characteristics
- Iframe/widget does not match the app's design language (white-label customization is minimal on free plan)
- BMC takes a 5% fee on top of Stripe's 1.4% + €0.25
- User must create and maintain a BMC account separate from Stripe
- Cookie/GDPR implications of loading a third-party widget without user consent
- No programmatic control over the UI position or animation

**Verdict:** Rejected. Extra fee, design mismatch, third-party script risk.

### Option C — Ko-fi

Same structural problems as BMC: third-party widget, Ko-fi fee, design mismatch, separate account. Ko-fi's API is also significantly less mature than Stripe's.

**Verdict:** Rejected for the same reasons as BMC.

### Option D — GitHub Sponsors

Requires a GitHub account from the donor. Works well for developer-to-developer appreciation but excludes non-GitHub designers who are a significant portion of the target audience. No in-app integration possible — it's an external link only.

**Verdict:** Viable as a supplementary link in the footer (one `<a>` tag, zero code), but not a primary tip-jar mechanism.

### Recommendation

**Use Stripe Payment Links (Option A)** as the primary mechanism. Optionally include a GitHub Sponsors link as a secondary text link in the footer for developers who prefer that channel. This delivers the fastest implementation, zero recurring fees beyond Stripe's standard rate, and complete design consistency.

---

## UI/UX Design

### Placement Strategy

**Primary: Footer button (always visible)**
The footer (`AppFooter.tsx`) currently has a two-column flex layout: brand wordmark on the left, legal nav links on the right. There is clear horizontal space to add a third element — a small "Support this project" button or heart icon between the two existing regions. This is unobtrusive, discoverable without being pushy, and visible on every page.

**Secondary: User dropdown menu item**
The user dropdown in `AppHeader.tsx` already has a pattern for contextual action items. A "Support the maker" item (with a small heart icon) can be added after the "My designs" item. This targets logged-in users who are clearly engaged.

**Tertiary: Onboarding/post-action moment (optional, Phase 2)**
After a successful export, a subtle "Enjoying dsygn.cloud? Buy me a coffee" nudge could appear. This is out of scope for the initial implementation.

### Visual Treatment

The donation button in the footer should be visually softer than the primary Export CTA in the header. Design language rules from the CSS:
- Use `var(--color-on-surface-subtle)` text color at rest (matches `.link` in `AppFooter.module.css`)
- On hover: shift to `var(--color-interactive)` with a heart icon fill transition
- No border at rest — add `border: 1px solid var(--color-border)` only on hover or use an underline treatment
- Font size: `12px` matching the existing footer link style
- Icon: Lucide `Heart` (size 12, `strokeWidth={1.75}`) inline before the label, same icon library already imported in `AppHeader.tsx`

The modal follows the exact `UpgradeModal` pattern:
- Fixed overlay + centered card, `z-index: 201`
- `border-radius: 14px`, `padding: 32px`, `width: min(420px, calc(100vw - 32px))`
- `slideUp` + `fadeIn` keyframe animations (copy from `UpgradeModal.module.css`)
- Preset amount buttons as a pill-group row (3 options), custom input below
- Primary action button: amber/orange accent color (`#f59e0b`) to differentiate from the indigo Upgrade button — this signals "optional generosity" not "commercial transaction"
- Dismiss: same `skipBtn` ghost-button pattern

### Micro-interactions

- Heart icon in footer pulses once on page load after a donation (`?donated=1` param) — CSS `animation: heartbeat 0.6s ease` keyframe
- Selected preset amount button gets `background: rgba(245,158,11,0.12); border-color: #f59e0b` active state
- Primary CTA button: `transform: scale(0.97)` on `:active` (matches existing button patterns)
- Modal entry: `slideUp 0.18s ease` (identical to UpgradeModal — no new keyframes needed)

### Amount Presets

Three tiers calibrated for micro-SaaS tooling appreciation:
- **€3** — "A coffee"
- **€7** — "A big coffee"
- **€15** — "A round of coffees"
- **Custom** — free-text input (integer euros, min €1, max €100), validated client-side before opening the link

Each preset maps to a distinct Stripe Payment Link URL stored as a static constant in the component (Payment Links are public URLs — not secrets). The custom amount uses the "customer sets price" Payment Link feature.

---

## Implementation Blueprint

### Files to Create

```
v3/
├── src/
│   └── components/
│       └── DonateModal/
│           ├── DonateModal.tsx              # Modal component
│           └── DonateModal.module.css       # Scoped styles
```

### Files to Modify

```
v3/
├── src/
│   ├── store/ui.ts                          # Add donateModalOpen state + actions
│   ├── components/AppShell/
│   │   ├── AppFooter.tsx                    # Add heart/coffee button
│   │   ├── AppFooter.module.css             # Add .donateBtn styles
│   │   ├── AppHeader.tsx                    # Add "Support the maker" dropdown item
│   │   └── AppHeader.module.css             # Add .dropdownDonate style
│   ├── App.tsx                              # Add ?donated=1 toast detection + <DonateModal />
│   └── App.module.css                       # Add .donateToast style
```

### Component Architecture

#### `DonateModal`

**Responsibilities:** Render preset amount selector, custom amount input, redirect to Stripe Payment Link on confirmation, handle Escape key dismiss.

**Props:** None — reads `donateModalOpen` from Zustand, calls `closeDonateModal` action.

**State (local):**
- `selectedPreset: 3 | 7 | 15 | null` — which preset is active
- `customAmount: string` — raw input value for custom tier
- `customError: string | null` — validation message

**Stripe Payment Link constants** (defined in the component file):
```ts
const DONATE_LINKS = {
  3:  'https://buy.stripe.com/XXXX',   // €3 Payment Link
  7:  'https://buy.stripe.com/XXXX',   // €7 Payment Link
  15: 'https://buy.stripe.com/XXXX',   // €15 Payment Link
  custom: 'https://buy.stripe.com/XXXX', // customer-sets-price Payment Link
}
```
These are plain public URLs — not secrets. Replace `XXXX` placeholders with real IDs after creating them in the Stripe dashboard.

**Key behavior:**
- `handleDonate()`: validates custom amount if `selectedPreset === null`, calls `trackEvent('Donate Click', { amount })`, then `window.location.href = DONATE_LINKS[amount]`
- Escape key listener follows the exact pattern from `UpgradeModal.tsx`

---

## Data Flow

```
User clicks footer heart button
  → openDonateModal() [Zustand action]
    → ui.donateModalOpen = true
      → <DonateModal /> renders

User selects €7 preset
  → selectedPreset = 7 [local useState]
  → "Support with €7" CTA becomes active

User clicks CTA
  → trackEvent('Donate Click', { amount: 7 })    [Plausible]
  → window.location.href = DONATE_LINKS[7]        [Stripe Payment Link]
    → Stripe hosted checkout page
      → User pays
        → Stripe redirects to APP_URL/?donated=1
          → App.tsx useEffect detects donated=1
            → setShowDonateToast(true)
            → trackEvent('Donate Complete')
            → window.history.replaceState(...)
            → Toast auto-dismisses after 5s
```

---

## Step-by-Step Implementation

- [ ] **Step 1 — Stripe Dashboard setup**
  Create four Payment Links in the Stripe dashboard:
  - Product name: "dsygn.cloud — Support the maker"
  - Type: "One-time"
  - Amounts: €3, €7, €15 (one link each), plus one "Customer chooses" link for custom amounts
  - Success URL: `https://dsygn.cloud/?donated=1`
  - Cancel URL: `https://dsygn.cloud/`
  - Disable "Collect billing address" (reduces friction for a tip)
  - Copy the four `buy.stripe.com/...` URLs

- [ ] **Step 2 — Extend Zustand UI store**
  In `v3/src/store/ui.ts`:
  - Add `donateModalOpen: boolean` to `UIState` interface
  - Add `openDonateModal` and `closeDonateModal` to `UIActions` interface
  - Add `donateModalOpen: false` to `defaultUIState`
  - Add both action implementations following the existing `openUpgradeModal`/`closeUpgradeModal` pattern

- [ ] **Step 3 — Create `DonateModal` component**
  Create `v3/src/components/DonateModal/DonateModal.tsx` and `DonateModal.module.css`

- [ ] **Step 4 — Add `<DonateModal />` and toast to `App.tsx`**
  Mirror the `upgraded=1` toast pattern for donations

- [ ] **Step 5 — Update `AppFooter`**
  Add Heart button calling `openDonateModal`

- [ ] **Step 6 — Update `AppHeader` dropdown**
  Add "Support the maker" dropdown item

- [ ] **Step 7 — TypeScript check**
  Run `npx tsc --noEmit` and fix any type errors

- [ ] **Step 8 — Manual smoke test**
  - Footer heart button → modal opens
  - Select €7 → CTA becomes active
  - Click CTA → redirected to Stripe
  - Navigate to `/?donated=1` → toast appears, disappears after 5s, URL cleans up
  - Escape key dismisses modal
  - Test in mobile viewport

- [ ] **Step 9 — Plausible Goals**
  Register custom event goals: `Donate Modal Open`, `Donate Click`, `Donate Complete`

---

## Effort Estimate

| Task | Estimate |
|---|---|
| Stripe Payment Links setup (4 links) | 15 min |
| `ui.ts` store extension | 10 min |
| `DonateModal.tsx` component | 45 min |
| `DonateModal.module.css` | 20 min |
| `App.tsx` toast + modal integration | 15 min |
| `AppFooter.tsx` + `.module.css` | 20 min |
| `AppHeader.tsx` dropdown item | 10 min |
| TypeScript check + fix | 10 min |
| Manual smoke test | 15 min |
| Plausible goals registration | 5 min |
| **Total** | **~2.75 hours** |

---

## Thank-You Flow

**Chosen approach: query-param toast (identical to upgrade flow)**

When the user completes a Stripe Payment Link checkout, Stripe redirects to `https://dsygn.cloud/?donated=1`. `App.tsx` detects this param on mount, fires `trackEvent('Donate Complete')`, shows a warm amber toast for 5 seconds, then cleans the URL with `window.history.replaceState`.

Toast copy: `"Thank you so much! Your support genuinely means a lot."`

**Why not confetti?** Confetti libraries add ~15 KB to the bundle. For a tip-jar moment that most users will never trigger, this weight is not justified. The toast + warm color is sufficient emotional acknowledgement.

**Why not a dedicated `/donate/thank-you` route?** The query-param approach reuses existing infrastructure (`?upgraded=1`). The user lands back on the familiar app rather than a blank thank-you page.

---

## Legal / Compliance

1. **No 14-day withdrawal right for digital goods** — Donations are gratuitous transfers, not product purchases. The withdrawal waiver text used on the upgrade Payment Links **should not** appear on donation links.

2. **No VAT on donations** — Voluntary tips with no quid-pro-quo are generally not subject to VAT in Germany/EU. Keep the language clearly gratuitous: "Support the maker", not "Pay for the app".

3. **Stripe fee transparency** — Stripe deducts its fee (1.4% + €0.25 for European cards). No disclosure obligation, but good practice.

4. **Privacy Policy** — No personal data from the donor is stored in Supabase. A one-line addition noting Stripe handles donation payment processing is sufficient.

5. **No tax receipts** — Donations to a for-profit individual/business are not tax-deductible charitable contributions. Do not imply otherwise.

---

## Analytics

| Event Name | When Fired | Props |
|---|---|---|
| `Donate Modal Open` | Modal becomes visible | `source: 'footer' \| 'dropdown'` |
| `Donate Click` | User clicks CTA / redirects to Stripe | `amount: number` |
| `Donate Complete` | `App.tsx` detects `?donated=1` on mount | — |

**Funnel:** `Donate Modal Open` → `Donate Click` → `Donate Complete`

All events use the existing `trackEvent()` utility from `v3/src/analytics.ts`.

---

## Design Tokens Used

All styles reference existing design tokens for automatic dark/light/white theme support:

| Token | Usage |
|---|---|
| `var(--color-interactive)` | Active preset border/text |
| `var(--color-border)` | Preset button borders at rest |
| `var(--color-on-surface)` | Modal heading, preset button text |
| `var(--color-on-surface-subtle)` | Footer button text at rest |
| `var(--ui-surface-1)` | Modal background |
| `var(--ui-border)` | Modal border |

The amber accent (`#f59e0b` / `#b45309`) is hardcoded — intentionally distinct from the app's interactive indigo and does not shift with the design system theme.

---

## Out of Scope (Future Enhancements)

- Recurring donation / "membership" tier via Stripe Subscriptions
- GitHub Sponsors supplementary link in footer
- Post-export donation nudge
- Donor recognition (e.g., "Supporter" badge)
- BMC/Ko-fi as a backup processor
- Webhook to record donations in Supabase for analytics aggregation
