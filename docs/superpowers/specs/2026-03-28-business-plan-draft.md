# dsygn.cloud — Business Plan Draft
_Last updated: 2026-03-28_

---

## Product

Browser-based design system generator for **vibe coders** — developers who build by feel, often with AI tools, who need a solid visual system fast without knowing design theory. Generates colors, typography, spacing, and components in seconds. Exports production-ready tokens in all major formats.

---

## Goals (12-month horizon)

- **Primary:** build reputation and recognition in the vibe coding / indie hacker community
- **Secondary:** generate side income to cover costs and create a small revenue stream
- **Not:** a full SaaS business — no complex infrastructure, no team features at launch

---

## Entry Experience

**Generator IS the homepage.** dsygn.cloud at `/` lands directly into the running generator — no landing page, no friction. First-time visitors see a thin 5-second auto-dismissing overlay with the core pitch. Like Coolors.co. The tool sells itself.

---

## Business Model

**Freemium + lifetime deal.**

| | Free | Paid (lifetime) |
|---|---|---|
| Generator + Detail mode | ✓ | ✓ |
| CSS / CSS variables export | ✓ | ✓ |
| All export formats (Tailwind, design tokens, JSON, SCSS…) | — | ✓ |
| Saved designs | 3 (local storage) | Unlimited (cloud) |
| Download as ZIP (all formats) | — | ✓ |
| Custom CSS variable prefix | — | ✓ |
| Branding document (PDF brand guide) | — | ✓ |
| Hosted design system page (public shareable URL) | — | ✓ |
| Design history / named versions | — | ✓ |

**Sign-in is required for:**
1. Saving more than 3 designs (cloud persistence)
2. Accessing non-CSS export formats

Sign-in is always free. The paid tier unlocks the full feature set.

---

## Pricing

| Tier | Price | Notes |
|---|---|---|
| Free | €0 | Forever |
| Early Bird Lifetime | **€29** | Product Hunt launch window, first ~200 buyers |
| Regular Lifetime | **€49** | After early bird period |

One-time payment. No subscriptions. No recurring billing. Revisit recurring if/when team features or ongoing cloud costs justify it.

---

## Sign-in Gates

- Attempting to save a 4th design → sign-in prompt
- Attempting to export in any format other than CSS → sign-in prompt
- After sign-in: free tier, still gates on paid features → upgrade prompt

---

## Tech Stack

| Layer | Choice | Cost |
|---|---|---|
| Frontend | Vite + React (current — no migration) | €0 |
| Auth + Database + Storage | Supabase (free up to 50k MAU) | €0 → €25/month at scale |
| Hosting | Vercel Pro (required for commercial use) | €20/month |
| Payments | Stripe (one-time checkout + Stripe Tax for EU VAT) | ~1.4% + €0.25/transaction |
| Analytics | Plausible (no cookies, GDPR-exempt, no consent banner) | €9/month or self-hosted |
| Domain | dsygn.cloud | ~€2/month |
| **Total at launch** | | **~€31/month** |

Break-even: 2 lifetime sales/month at €29.

---

## Legal Requirements

| Item | Action | Service |
|---|---|---|
| Privacy Policy | Generate GDPR-compliant policy | Iubenda (~€30/year) |
| Terms of Service | Include EU digital goods withdrawal waiver | Iubenda or template |
| Impressum | Static page (name, address, email) | Write manually |
| Business registration | Kleingewerbe / Freiberufler registration | Local trade office |
| EU VAT (digital services) | Enable Stripe Tax from day 1 | Stripe Tax (~0.5%/transaction) |
| Cookie consent banner | **Not needed** — Plausible is cookie-free | — |
| Data residency | Use Supabase EU region (Frankfurt) | Supabase config |

---

## Marketing Strategy

**Launch channels (priority order):**

1. **Product Hunt** — primary launch event. Prepare 2 weeks in advance: GIF demo, clear tagline, teaser posts. Best day: Tuesday. One-shot — launch with the full paid tier including hosted pages.
2. **Twitter/X** — 30-second screen recording demos. "Generated a design system in 10 seconds." Post weekly. Show real examples.
3. **Hacker News (Show HN)** — "Show HN: free design system generator for vibe coders." High upside if it lands.
4. **Indie Hackers** — build in public. Share revenue milestones honestly. IH community actively roots for and shares indie tools.
5. **Reddit** — r/webdev, r/SideProject, r/IndieHackers after some traction.

**Built-in viral loops:**
- Hosted design system pages carry "Built with dsygn.cloud" footer — every shared page is a referral
- Branding document PDF has dsygn.cloud cover credit
- Share-via-URL already built in (loadFromHash)

**What to avoid at this stage:** SEO content campaigns (takes 6–12 months), paid ads (ROAS doesn't work at €29 lifetime), influencer outreach.

---

## Launch Timeline (Approach B — Considered Launch)

| Week | Milestone |
|---|---|
| 1–2 | Supabase auth + save gate + cloud saves |
| 2–3 | Export gate + full export formats unlock |
| 3–4 | Stripe checkout + plan tracking + upgrade modal |
| 4–5 | Hosted design system page viewer |
| 5 | Branding PDF, ZIP download, custom prefix, design history |
| 5–6 | Legal pages, Impressum, business registration, Plausible |
| 6 | First-visit onboarding overlay, polish, QA |
| 6+ | Product Hunt launch |
