# TYPESET — Design System Builder
## Full Technical Specification — v2

---

## 1. Vision

TYPESET is a browser-based design system authoring tool with two modes of operation.

**Quick Mode** is the entry experience: choose a personality archetype, cycle through color candidates with the spacebar, lock what you like, and get a mathematically complete, production-ready design system in under two minutes. The output immediately renders as a live mock product — you see your system in context before you've written a line of CSS.

**Explore Mode** is the power layer: every derived value is inspectable and overridable. Color science, typography, spacing, shadows, components, and semantic token aliases are all adjustable. Explore Mode opens on top of whatever Quick Mode produced; nothing is discarded.

The tool runs entirely client-side. No backend, no account, no build step. The output is a URL-shareable, multi-format token export consumable by any project.

**Core value proposition:** One personality selection and one brand color mathematically derives a complete, perceptually consistent, WCAG-AA compliant design token system — primitive scales, semantic role aliases, and component-level tokens — exported in any format your stack needs.

---

## 2. Tech Stack

| Layer | Choice | Version |
|---|---|---|
| Framework | React | 18 |
| Language | TypeScript | 5 |
| Build | Vite | 5 |
| State | Zustand + zundo (undo/redo) | 4 + latest |
| Color Math | culori (OKLCH-native) | 4 |
| Font Loading | Google Fonts API v2 + Fontshare | — |
| Styling | CSS Modules + CSS custom properties | — |
| Token Export | Custom plugin system | — |
| Routing | None (single-page, mode-toggled) | — |
| Testing | Vitest + Playwright | latest |
| Linting | ESLint + Prettier | latest |

**Notes:**
- Replace `chroma-js` with `culori` throughout. culori has first-class OKLCH support, is tree-shakeable, and does not depend on Node.js globals.
- Remove `react-router-dom`. Navigation is purely UI state (mode toggle + section selection), not URL-based.
- Add `zundo` for temporal state (undo/redo middleware for Zustand).
- URL sharing is handled by a custom base64url + zlib compression utility, not a router.

---

## 3. Application Modes

### 3.1 The Two Modes

| | Quick Mode | Explore Mode |
|---|---|---|
| **Layout** | Full-screen wizard, 3 sequential steps | Two-column: sidebar controls + live preview |
| **Entry** | Default on first visit | Toggle in header, or auto-entered after Quick Mode |
| **Audience** | Any user; the primary onboarding path | Power users, design engineers |
| **What's visible** | Personality picker → Color discovery → Showcase | All sections: Color, Typography, Spacing, Shadows, Components, Showcase, Export |
| **State** | Personality + locked colors + derived system | Quick Mode state + all Explore overrides |

### 3.2 The Persistent Toggle

A mode toggle in the application header switches between Quick and Explore at any time. The toggle is always visible.

**Quick → Explore:** Opens Explore Mode with the Quick Mode output already applied. All Quick Mode decisions (archetype, locked colors) remain active and are visible in the Explore sidebar. The user continues from where they are.

**Explore → Quick:** Returns to the Color Discovery step with the current primary color pre-seeded. The user can re-cycle from there or immediately transition back to the Showcase. Explore Mode overrides are preserved in state and reapplied when returning to Explore Mode.

### 3.3 State Relationship

Quick Mode and Explore Mode share the same underlying token state. The distinction is:

- **Quick Mode state:** personality archetype, locked color hexes (1–5)
- **Explore Mode state:** overrides to any derived value — individual semantic role overrides, component token overrides, typography choices, spacing/shadow adjustments

Explore Mode overrides are stored separately from Quick Mode state. When both exist, the override takes precedence. The UI in Explore Mode always shows whether a value is "derived" (from Quick Mode) or "overridden" (user-set), with a reset affordance on each overridden value.

---

## 4. Quick Mode — Full Specification

Quick Mode is a three-step full-screen wizard. No sidebar. No scrolling. The full viewport is used for each step.

### 4.1 Step 1: Personality Archetype Selection

Six archetype cards are displayed in a 2×3 or 3×2 grid (responsive). Each card shows:
- The archetype name
- A one-sentence description
- A live micro-preview: a small 3-color swatch strip + a 2-line typography specimen rendered with the archetype's default font pairing

The user clicks a card to select it and advance to Step 2. The selected archetype persists for the entire session and influences all subsequent auto-derivation.

**Archetypes:** Bold, Editorial, Minimal, Playful, Professional, Technical. See Section 7 for full parameter definitions.

### 4.2 Step 2: Color Discovery

This is the core Quick Mode interaction. The interface shows between one and five color candidate "cards", each occupying a prominent area of the screen.

**Initial state:** One card, showing a generated color candidate seeded by the archetype's OKLCH parameters (see Section 7). A subtle keyboard hint reads "space to cycle · click to lock".

**Spacebar / Cycle button:** Regenerates all unlocked cards simultaneously. Each press steps through a pre-shuffled sequence of hue positions within the archetype's OKLCH L and C constraints, at 15° hue increments (24 stops around the wheel). The sequence is deterministic per session (seeded from timestamp) so the same session always produces the same cycle order. A "used" ring marker is shown around hues already visited.

**Lock:** Clicking a card (or pressing L) locks it. Locked cards do not change on spacebar. A locked card shows a small padlock icon and the hex value.

**"+" button:** Appears after the first lock. Clicking it adds a second card (maximum five cards total). Additional cards are initialized to a harmony position relative to the locked primary, using the archetype's default harmony model. Each additional card can be independently cycled and locked.

**Card display:** Each card fills a column. The card background is the candidate color. The hex value, OKLCH values, and a contrast indicator (white vs black on this color) are shown. Below the color area: a mini shade strip showing the auto-generated 50→950 scale.

**"Build System" button:** Appears once at least one color is locked. Clicking it triggers the system derivation (synchronous, <16ms) and transitions to Step 3.

**Keyboard shortcuts in Step 2:**
- `Space` — cycle all unlocked cards
- `1`–`5` — lock/unlock card by index
- `+` — add a card
- `Enter` / `→` — proceed to Step 3 (if at least one card is locked)
- `Backspace` — go back to Step 1

### 4.3 Step 3: System Reveal (Showcase)

The full-viewport Showcase renders immediately using the derived token system. This is not a loading screen — derivation is synchronous. The transition from Step 2 to Step 3 should feel instantaneous.

**What's shown:**
- The active Showcase template, fully rendered with the derived tokens (see Section 13)
- A floating "system summary" panel (collapsible) in the bottom-right: shows the 5 primary semantic colors, the font pairing, and a compact shade strip
- A template switcher in the top bar (icon buttons for each template)
- The mode toggle prominently in the header: "Open in Explore Mode →"
- A share button (generates the URL hash, copies to clipboard)

**From this step, the user can:**
- Switch showcase templates to see the system in different contexts
- Click "Explore Mode" to open the full tool
- Click "Share" to get a URL
- Click "Export" to jump directly to the Export panel in Explore Mode
- Click "Start Over" to return to Step 1

---

## 5. Explore Mode — Full Specification

### 5.1 Layout

Three-column layout:

```
┌────────────────────────────────────────────────────────┐
│  Header: TYPESET logo · Section tabs · Mode toggle · Actions │
├──────────────┬─────────────────────────────────────────┤
│              │                                         │
│   Sidebar    │         Preview / Showcase              │
│   280px      │         (flex: 1)                       │
│   (controls) │                                         │
│              │                                         │
└──────────────┴─────────────────────────────────────────┘
```

The sidebar is 280px, resizable by dragging (min: 240px, max: 420px). The preview fills the remaining space. Both scroll independently. A "Show Showcase" toggle in the preview header switches between section-specific preview and the full Showcase view.

### 5.2 Section Navigation

Eight sections accessible via tabs in the header:

| Tab | Content | Mode |
|---|---|---|
| Color | Brand palette, semantic roles, data viz, contrast | Both |
| Typography | Font browser, type scale, readability, specimen | Both |
| Spacing | Spacing scale, radius, z-index, breakpoints | Explore only |
| Shadows | Elevation presets + custom builder | Explore only |
| Components | Token-mapped component library + overrides | Explore only |
| Showcase | Template switcher + full-page preview | Both |
| Export | Multi-format output + naming config | Both |

Spacing, Shadows, and Components tabs are hidden in Quick Mode (they are accessible only after switching to Explore Mode).

### 5.3 Explore Mode Sidebar Behavior

Each section's sidebar shows:
1. **Derived values** (from Quick Mode) — shown with a subtle "auto" badge. Clicking opens an override input.
2. **Overridden values** — shown with a colored dot and a "reset" affordance.
3. **Explore-only controls** — unlabeled in Quick Mode, fully visible in Explore Mode.

The sidebar has a persistent "Quick Mode Settings" section at the top (collapsed by default in Explore Mode) showing the locked colors and archetype, with a button to re-enter Quick Mode Step 2.

---

## 6. Color System — Three-Layer Architecture

The color system is organized in three layers. Each layer is derived from the one below. Export plugins can output any combination of layers.

```
Layer 1 — Primitive Palette
  Raw shade scales (50→950) for each locked color
  Generated via LAB-interpolated chroma-preserving algorithm

Layer 2 — Semantic Role System
  42 named roles derived from the primitive palette in OKLCH
  Covers interactive, accent, surface, neutral, and four state groups
  Both light and dark mode values are derived simultaneously

Layer 3 — Component Token System
  Per-component CSS custom property mappings
  Default values reference semantic roles
  Every value is individually overridable in Explore Mode
```

### 6.1 Layer 1: Primitive Palette

Generated for each locked color using the existing shade scale algorithm (LAB interpolation, 11 steps: 50→950). The first locked color is always the "primary". The second is the "secondary". Additional locked colors are "accent-1", "accent-2", "accent-3".

The neutral scale is derived from the primary hue at near-zero chroma (tinted neutral — see Section 8.4).

### 6.2 Layer 2: Semantic Role System

See Section 8 for the full mathematical derivation. The 42 roles are organized into five groups:

| Group | Roles | Source |
|---|---|---|
| Interactive (6) | interactive, on-interactive, interactive-container, on-interactive-container, interactive-subtle, interactive-hover | Primary hue |
| Accent (6) | accent, on-accent, accent-container, on-accent-container, accent-subtle, accent-hover | Secondary hue (or complementary if no secondary) |
| Surface / Neutral (14) | background, surface, surface-raised, surface-overlay, on-background, on-surface, on-surface-subtle, on-surface-disabled, border, border-strong, scrim, shadow-color, inverse-surface, on-inverse-surface | Primary hue at C≈0.01 |
| State — Error (4) | error, on-error, error-container, on-error-container | Red hue range |
| State — Warning (4) | warning, on-warning, warning-container, on-warning-container | Amber hue range |
| State — Success (4) | success, on-success, success-container, on-success-container | Green hue range |
| State — Info (4) | info, on-info, info-container, on-info-container | Blue hue range |

**Total: 42 semantic roles.**

Each role has a light-mode value and a dark-mode value. Both are computed simultaneously during derivation. The export layer produces either a single-theme flat output or a two-block output with a `[data-theme="dark"]` / `@media (prefers-color-scheme: dark)` variant.

### 6.3 Layer 3: Component Tokens

See Section 12. Each UI component has a set of CSS custom properties that reference semantic roles. These properties are the values engineers actually write in component CSS. They are overridable per-component in Explore Mode.

---

## 7. Personality Archetypes

Each archetype defines a set of parameters that influence color candidate generation, default typography pairing, spacing density, border radius feel, default harmony model, and the default showcase template.

### 7.1 Archetype Definitions

#### Bold
- **Description:** High-impact, confident, brand-forward. Works for consumer products, fintechs, and high-contrast marketing.
- **Color parameters:** L ∈ [0.48, 0.60], C ∈ [0.18, 0.26], H: full wheel
- **Harmony model:** Complementary
- **Typography:** Geometric sans heading (e.g., Syne, Space Grotesk) + readable sans body (e.g., Inter, DM Sans)
- **Heading weight:** 800–900; Body weight: 400–500
- **Spacing density:** Balanced (8pt base, standard multipliers)
- **Border radius:** Moderate (6–8px base, no pill defaults)
- **Default showcase:** Marketing

#### Editorial
- **Description:** Sophisticated, typography-led, content-first. Works for media, publishing, luxury, and culture brands.
- **Color parameters:** L ∈ [0.38, 0.65], C ∈ [0.06, 0.14], H: prefers 20–80° (warm) or 200–280° (cool)
- **Harmony model:** Analogous
- **Typography:** Serif display heading (e.g., Fraunces, Playfair Display) + humanist sans body (e.g., Source Serif, Lora)
- **Heading weight:** 400–700 (variable if available); Body weight: 400
- **Spacing density:** Airy (8pt base, generous scale multiplier 1.5×)
- **Border radius:** Subtle (2–4px base)
- **Default showcase:** Editorial / Blog

#### Minimal
- **Description:** Restrained, functional, high signal-to-noise. Works for SaaS tools, developer products, and premium lifestyle.
- **Color parameters:** L ∈ [0.40, 0.70], C ∈ [0.04, 0.10], H: prefers blues (220–260°) or warm neutrals (30–60°)
- **Harmony model:** Monochromatic
- **Typography:** Geometric sans throughout (e.g., DM Sans, Geist, Inter)
- **Heading weight:** 600–700; Body weight: 400
- **Spacing density:** Airy (8pt base, large multipliers)
- **Border radius:** Extremes — either 2px (sharp) or full pill (100px). Default: 4px.
- **Default showcase:** Dashboard / Admin

#### Playful
- **Description:** Energetic, expressive, approachable. Works for consumer apps, edtech, communities, and games.
- **Color parameters:** L ∈ [0.52, 0.70], C ∈ [0.20, 0.30], H: prefers warm/energetic (0–60°, 300–360°)
- **Harmony model:** Triadic
- **Typography:** Rounded or expressive sans heading (e.g., Nunito, Poppins) + friendly body (e.g., Nunito, Quicksand)
- **Heading weight:** 700–800; Body weight: 500
- **Spacing density:** Balanced (4pt or 8pt base)
- **Border radius:** Large (12–16px base) defaulting toward pill on interactive elements
- **Default showcase:** Marketing

#### Professional
- **Description:** Structured, trustworthy, clear. Works for enterprise software, financial services, healthcare, and B2B.
- **Color parameters:** L ∈ [0.38, 0.58], C ∈ [0.10, 0.17], H: strongly prefers blues/slates (200–270°)
- **Harmony model:** Split-complementary
- **Typography:** Humanist sans throughout (e.g., Outfit, Nunito Sans, IBM Plex Sans)
- **Heading weight:** 600–700; Body weight: 400
- **Spacing density:** Compact-to-balanced (8pt base, conservative multipliers)
- **Border radius:** Moderate (4–6px base)
- **Default showcase:** Dashboard / Admin

#### Technical
- **Description:** Precise, systematic, data-forward. Works for dev tools, documentation, monitoring, and data products.
- **Color parameters:** L ∈ [0.42, 0.60], C ∈ [0.08, 0.15], H: prefers blues, greens, teals (150–260°)
- **Harmony model:** Complementary (with muted secondary)
- **Typography:** Geometric sans heading (e.g., IBM Plex Sans, Geist) + monospace accent for labels (DM Mono)
- **Heading weight:** 600; Body weight: 400
- **Spacing density:** Compact (4pt base)
- **Border radius:** Minimal (2–4px base)
- **Default showcase:** Dashboard / Admin

### 7.2 Archetype Influence on Auto-Derivation

The archetype remains active in Explore Mode and influences all defaults that haven't been explicitly overridden. If a user switches archetypes in Explore Mode (an advanced option), all non-overridden derived values update to reflect the new archetype's parameters.

---

## 8. Semantic Role Derivation — OKLCH Mathematics

All derivation is performed in OKLCH (CSS Color Level 4). culori is used for all color math.

`L` = lightness [0, 1]. `C` = chroma [0, ~0.37]. `H` = hue [0°, 360°].

### 8.1 Input Normalization

Given a locked primary hex, compute OKLCH: `(L_p, C_p, H_p)`.

The **interactive** role uses the primary hue but normalizes lightness to ensure it's always functional as a UI color:

```
interactive.L = clamp(0.42, L_p, 0.65)
interactive.C = C_p
interactive.H = H_p
```

If the user's input is a very light pastel (L > 0.75), this normalization brings it down to a usable interactive shade. The original L_p shade is still available in the primitive shade scale.

### 8.2 Interactive Group (from primary)

Light mode values are listed first; dark mode values in parentheses.

```
interactive:
  L = clamp(0.42, L_p, 0.65)   C = C_p            H = H_p

on-interactive:
  L = (interactive.L >= 0.52) ? 0.10 : 0.97
  C = 0.01
  H = H_p

interactive-hover:
  L = interactive.L - 0.07     C = C_p × 1.05     H = H_p
  (dark: L = interactive.L + 0.08)

interactive-container:
  light: L = 0.91   C = C_p × 0.20   H = H_p
  dark:  L = 0.25   C = C_p × 0.38   H = H_p

on-interactive-container:
  light: L = 0.15   C = C_p × 0.45   H = H_p
  dark:  L = 0.92   C = C_p × 0.25   H = H_p

interactive-subtle:
  light: L = 0.96   C = C_p × 0.07   H = H_p
  dark:  L = 0.18   C = C_p × 0.14   H = H_p
```

### 8.3 Accent Group (from secondary)

If the user locked a secondary color, use its `(L_s, C_s, H_s)`. If no secondary was locked, derive one using the archetype's default harmony model applied to `H_p` (e.g., complementary = H_p + 180°, normalized to [0, 360)).

Apply the same six-role pattern as the interactive group, substituting `H_s`, `L_s`, `C_s` as inputs.

### 8.4 Surface / Neutral Group (from primary hue at near-zero chroma)

The neutral/surface group uses the primary hue at very low chroma to create a "tinted" feel that ties the neutrals to the brand without visible color. This is what differentiates a design system that feels coherent from one that uses generic grays.

```
background:
  light: L = 0.98   C = 0.010   H = H_p
  dark:  L = 0.08   C = 0.010   H = H_p

surface:
  light: L = 1.00   C = 0.000   H = H_p   (pure white in light mode)
  dark:  L = 0.11   C = 0.010   H = H_p

surface-raised:
  light: L = 0.97   C = 0.010   H = H_p
  dark:  L = 0.14   C = 0.012   H = H_p

surface-overlay:
  light: L = 0.94   C = 0.012   H = H_p
  dark:  L = 0.17   C = 0.015   H = H_p

on-background:
  light: L = 0.13   C = 0.010   H = H_p
  dark:  L = 0.93   C = 0.008   H = H_p

on-surface:
  light: L = 0.20   C = 0.010   H = H_p
  dark:  L = 0.88   C = 0.008   H = H_p

on-surface-subtle:
  light: L = 0.48   C = 0.008   H = H_p
  dark:  L = 0.60   C = 0.008   H = H_p

on-surface-disabled:
  light: L = 0.68   C = 0.005   H = H_p
  dark:  L = 0.38   C = 0.005   H = H_p

border:
  light: L = 0.86   C = 0.010   H = H_p
  dark:  L = 0.22   C = 0.010   H = H_p

border-strong:
  light: L = 0.72   C = 0.015   H = H_p
  dark:  L = 0.35   C = 0.015   H = H_p

scrim:
  rgba(0, 0, 0, 0.48) in both modes
  (not OKLCH-derived — fixed by convention)

shadow-color:
  light: L = 0.15   C = C_p × 0.30   H = H_p   (for box-shadow color)
  dark:  L = 0.05   C = C_p × 0.20   H = H_p

inverse-surface:
  light: L = 0.20   C = 0.015   H = H_p
  dark:  L = 0.90   C = 0.010   H = H_p

on-inverse-surface:
  light: L = 0.92   C = 0.008   H = H_p
  dark:  L = 0.18   C = 0.010   H = H_p
```

### 8.5 State Color Groups

Each state group occupies a target hue range in OKLCH. The minimum-distance heuristic adjusts the chosen hue within the range to maximize angular distance from all palette hues already in use.

**Target hue ranges:**
- Error: H ∈ [18°, 32°] (OKLCH red-orange)
- Warning: H ∈ [58°, 78°] (OKLCH amber-yellow)
- Success: H ∈ [138°, 158°] (OKLCH green)
- Info: H ∈ [222°, 244°] (OKLCH blue)

**Hue selection algorithm per state:**
```
palette_hues = [H_p, H_s, ...all locked hue values]
For each state range [H_min, H_max]:
  candidates = 5 evenly-spaced hue values within the range
  chosen = candidate that maximizes min(angular_distance(candidate, h) for h in palette_hues)
  If primary hue falls within the state range: push chosen to the range boundary
    farthest from H_p
```

**Per-state role derivation** (same pattern for all four states, substituting H_state):
```
state (e.g., error):
  light: L = 0.50   C = 0.20   H = H_state
  dark:  L = 0.68   C = 0.18   H = H_state

on-state:
  light: L = 0.98   C = 0.02   H = H_state
  dark:  L = 0.10   C = 0.02   H = H_state

state-container:
  light: L = 0.92   C = 0.08   H = H_state
  dark:  L = 0.22   C = 0.14   H = H_state

on-state-container:
  light: L = 0.14   C = 0.12   H = H_state
  dark:  L = 0.90   C = 0.06   H = H_state
```

### 8.6 Dark Mode Strategy

Every semantic role has both light and dark mode values computed simultaneously at derivation time. The export layer then produces:

- **Flat (light only):** `:root { --color-interactive: oklch(…); }`
- **Flat (dark only):** `:root { --color-interactive: oklch(…); }`
- **Two-block:** `:root { … } [data-theme="dark"] { … }`
- **Media query:** `:root { … } @media (prefers-color-scheme: dark) { … }`

The choice is an export configuration option (see Section 14.3).

### 8.7 Data Visualization Palette

Unchanged from v1 in algorithm. Generates 6–12 perceptually equidistant colors in OKLCH, anchored to the primary hue, with distinct light and dark variants. Colorblind simulation (Deuteranopia, Protanopia, Tritanopia) is computed and displayed alongside. Count and chroma target are configurable in Explore Mode.

---

## 9. Typography System

### 9.1 Quick Mode Font Assignment

In Quick Mode, the archetype selects a default font pairing from a curated list of pairings per archetype category. The pairing is applied automatically — no user input required.

Each archetype ships three curated pairings (heading / body):
- Pairing A: the archetype's "canonical" choice
- Pairing B: an alternative of the same character
- Pairing C: a contrasting pairing (e.g., serif heading + sans body for Editorial)

In Quick Mode Step 2, a small font pairing indicator at the bottom of the screen cycles through the three pairings with each press of `F` (or a dedicated swap button). This is optional — the default pairing is applied without user action.

### 9.2 Explore Mode Typography

In Explore Mode, the Typography section provides:
- **Dual-role font browser:** heading and body fonts selected independently, same font browser as v1 with filter pills (source, category, variable) and search
- **Per-role controls:** weight, line height, letter spacing, variable font axes
- **Type scale controls:** base size, algorithm (modular / linear / fluid), modular ratio
- **Readability score:** same weighted algorithm as v1 (weight, category, line height, letter spacing, line length, variable font)
- **Pairing suggestions:** curated pairings from the active font's `pairsWith` list
- **Contrast checker:** foreground/background color picker with live WCAG 2.x result
- **Custom preview text:** user-editable specimen text

### 9.3 Font Database

Same as v1: ~75 fonts with metadata. Adding per-archetype `defaultPairings` property to each archetype definition in the font database.

### 9.4 Type Scale

Three algorithms unchanged from v1:
- **Modular:** base × ratio^step
- **Linear:** fixed multiplier steps
- **Fluid:** `clamp(min, preferred-vw, max)` per step

Named steps: `xs, sm, base, md, lg, xl, 2xl, 3xl, 4xl, 5xl`

---

## 10. Spacing System (Explore Mode)

Simplified from v1. Spacing is a supporting parameter, not a design decision with high creative variance.

### 10.1 Controls
- **Base unit:** 4pt or 8pt (radio)
- **Algorithm:** Linear, Modular (1.25×), Tailwind-inspired (radio)
- **Named steps:** `--space-1` through `--space-12`
- **Border radius:** base + scale algorithm (same 7-step scale as v1)
- **Z-index scale:** fixed preset (not user-configurable)
- **Breakpoints:** sm/md/lg/xl/2xl — overridable values in Explore Mode

### 10.2 Preview

A visual rhythm grid (dot grid or line grid) showing the base unit visually. A component density preview showing a card and button at the current spacing scale. No separate Spacing tab — this lives in the Explore Mode Foundation sidebar section.

---

## 11. Shadow / Elevation System (Explore Mode)

Simplified from v1.

### 11.1 Approach

Five elevation presets (none, sm, md, lg, xl). Each preset is defined relative to the `shadow-color` semantic role (derived from the primary hue — see Section 8.4), so shadows are always on-brand.

The user can optionally customize one level (md) with the interactive builder (x, y, blur, spread, opacity). All other levels scale proportionally from the custom `md`.

### 11.2 Preview

Each elevation level is demonstrated on a realistic surface:
- `none`: flat card
- `sm`: button hover state
- `md`: floating card with content
- `lg`: dropdown/popover
- `xl`: modal dialog

The preview updates live as parameters change.

---

## 12. Component Token System (Explore Mode)

### 12.1 Concept

Component tokens are the third layer of the token hierarchy. They are CSS custom properties that reference semantic roles and are the values engineers actually write in component CSS. They give teams a clean seam between "design system definition" and "component implementation."

```
Primitive:   --oklch-amber-500: oklch(0.65 0.18 72deg)
Semantic:    --color-interactive: var(--oklch-amber-500)
Component:   --button-primary-bg: var(--color-interactive)
```

### 12.2 Component Set

The following components ship with default token mappings:

| Component | Token properties |
|---|---|
| Button (primary) | bg, text, bg-hover, border, radius, padding-x, padding-y, font-size, font-weight |
| Button (secondary) | bg, text, bg-hover, border, radius |
| Button (ghost) | text, text-hover, bg-hover, border |
| Button (danger) | bg, text, bg-hover |
| Input | bg, border, border-focus, border-error, text, placeholder, radius, padding-x, padding-y |
| Select | Same as Input + chevron-color |
| Textarea | Same as Input + resize |
| Checkbox | bg-checked, border, border-checked, checkmark-color, radius |
| Card | bg, border, radius, shadow, padding |
| Badge (semantic variants) | bg, text, border per variant (success/warning/error/info/neutral) |
| Tag | bg, text, border, radius |
| Tooltip | bg, text, radius |
| Nav item | text, text-active, bg-active, border-active |
| Table | bg, border, header-bg, row-hover-bg, text |

### 12.3 Default Token Mappings

All defaults reference semantic roles. Example — Button (primary):

```css
--button-primary-bg:           var(--color-interactive);
--button-primary-text:         var(--color-on-interactive);
--button-primary-bg-hover:     var(--color-interactive-hover);
--button-primary-border:       transparent;
--button-primary-radius:       var(--radius-md);
--button-primary-padding-x:    var(--space-5);
--button-primary-padding-y:    var(--space-2);
--button-primary-font-size:    var(--text-sm);
--button-primary-font-weight:  600;
```

### 12.4 Explore Mode Override UI

In the Components section in Explore Mode:
- Each component is shown in a preview panel with realistic states (default, hover, active, disabled, focus)
- A "Token Map" panel alongside shows the full property list, the current value, and the resolved chain (component → semantic → primitive → hex)
- Any value can be overridden: clicking it opens an input (color picker for color values, slider for numeric, select for named options)
- Overridden values are marked with a colored dot and have a "reset to default" button
- Dark mode variants can be previewed in-place with a toggle

### 12.5 State Variants in Preview

The component preview shows all interactive states side by side: default, hover, active, disabled, focus ring. This requires no user interaction — all states render simultaneously in a static layout so the full state range is visible at once.

---

## 13. Showcase Templates

Four templates, each a React component that receives `tokens`, `fonts`, and `components` props. Every value — color, type scale, spacing, radius, elevation — comes from the token system. No hardcoded values.

### Template 1: Marketing / Landing Page
**Stress-tests:** Brand identity, hero section, feature cards, CTA hierarchy, data viz palette, state colors, footer.
**Sections:** Nav bar, hero with gradient background, feature cards (3-up), stats row, testimonial, email sign-up, footer.
**Typography focus:** Display headings, body copy, caption text at full scale range.

### Template 2: Dashboard / Admin UI
**Stress-tests:** Dense data display, neutral surface hierarchy, sidebar navigation, table styling, chart colors (data viz palette), badge/tag variants, form inputs.
**Sections:** Sidebar nav, top bar, metrics row, data table, small charts (bar + line using data viz colors), notification/alert area.
**Typography focus:** Compact label text, monospace values, table content.

### Template 3: Editorial / Blog
**Stress-tests:** Typography quality at scale, serif/sans pairing, reading line length, article hierarchy, blockquote styling, inline link color, image caption.
**Sections:** Masthead, hero article (full-bleed image area), article body (long-form with subheadings, pull quote, inline elements), sidebar, related articles grid.
**Typography focus:** Maximum typography expression — this template surfaces readability score implications immediately.

### Template 4: Product / E-commerce
**Stress-tests:** Product cards with pricing, badge variants (sale, new, out of stock), star ratings using accent color, add-to-cart button states, breadcrumb navigation, filter UI.
**Sections:** Category nav, product grid, product card components, pagination.
**Typography focus:** Medium density — product names, prices, descriptions.

### Template Switching

In Quick Mode Step 3 and in Explore Mode Showcase view: a template switcher bar at the top of the preview. The default template is determined by the active archetype (see Section 7). Switching is instantaneous — all templates share the same token system.

---

## 14. Export System

### 14.1 Architecture

Export plugins receive the full three-layer token object:

```typescript
interface ExportInput {
  primitive: PrimitiveTokens   // shade scales for each locked color
  semantic: SemanticTokens     // 42 roles, light + dark mode
  component: ComponentTokens   // all component token properties
  meta: {
    archetype: ArchetypeId
    lockedColors: LockedColor[]
    fontPairing: { heading: string; body: string }
  }
}
```

### 14.2 Export Formats

| Plugin | Output | Layer(s) |
|---|---|---|
| `css` | `:root { --token: value; }` with optional dark mode block | Primitive + Semantic |
| `css-full` | Three-block output: primitives, semantic aliases, component tokens | All three |
| `json` | Flat JSON object | Configurable |
| `json-hierarchical` | Nested JSON: `{ color: { interactive: { default: "…", dark: "…" } } }` | Semantic + Component |
| `w3c` | W3C DTCG format (`{ "$value": …, "$type": "color" }`) | Semantic |
| `tailwind` | `module.exports = { theme: { extend: { … } } }` | Primitive + Semantic |
| `scss` | `$token: value;` maps with `@forward` | Configurable |
| `figma-tokens` | Tokens Studio JSON structure | All three |

### 14.3 Export Configuration

Users can configure the output before downloading. Configuration is persisted:

- **Dark mode strategy:** None (light only) / `[data-theme="dark"]` attribute / `@media (prefers-color-scheme: dark)` / Both (separate outputs)
- **Color format:** `oklch(…)` / `#rrggbb` hex / `hsl(…)` / `rgb(…)`
- **Naming prefix:** Free text field (e.g., `acme-`, `ds-`). Applied to all variable names: `--acme-color-interactive`.
- **Naming convention:** kebab-case / camelCase / snake_case
- **Layers to include:** Primitives / Semantic / Component (checkboxes — at least one required)
- **Include component tokens:** Toggle (off by default in simple formats, on by default in `css-full`)

### 14.4 Export UI

In the Export section (available in both modes):
- Live code preview for the selected plugin, updating as tokens change
- Format selector tabs
- Configuration panel (collapsible)
- Copy button and Download button per format
- "Download All" button: generates a `.zip` containing all enabled formats

The Export section is also accessible directly from Quick Mode Step 3 via the "Export" button in the summary panel.

---

## 15. URL Sharing

URL sharing is a P0 feature, not a phase-7 addition.

### 15.1 Encoding

The shareable URL encodes the full token-affecting state as a URL-safe base64 string in the location hash:

```
https://typeset.app/#v2/{base64url(zlib_compress(JSON.stringify(shareSnapshot)))}
```

### 15.2 Share Snapshot Schema

```typescript
interface ShareSnapshot {
  v: 2                          // schema version
  archetype: ArchetypeId
  colors: string[]              // locked hex values in order (primary first)
  // Explore Mode overrides — only present if non-empty
  overrides?: {
    semantic?: Partial<SemanticOverrides>
    component?: Partial<ComponentOverrides>
    typography?: Partial<TypographyOverrides>
    spacing?: Partial<SpacingOverrides>
    shadow?: Partial<ShadowOverrides>
  }
}
```

Overrides are the only Explore Mode state included. Derived values are not stored — they are recomputed from the locked colors and archetype on load.

### 15.3 Share Button

Available in:
- Quick Mode Step 3 (prominent, in the floating summary panel)
- Explore Mode header actions

On click: generates the URL, copies to clipboard, shows a toast "Link copied". The URL is immediately valid — loading it restores the exact session state.

### 15.4 Import

On page load, if a `#v2/…` hash is present:
1. Decode and decompress the snapshot
2. Hydrate the store with the archetype and locked colors
3. Apply any overrides
4. Skip Quick Mode Steps 1–2; open directly to Quick Mode Step 3 (Showcase) or Explore Mode if overrides are present
5. If decoding fails: ignore hash, start normally

---

## 16. State Management

### 16.1 Store Slices

```typescript
interface AppStore {
  // Quick Mode
  personality: PersonalityState     // archetype + color candidates + lock state

  // Token-generating state
  color: ColorState                 // locked colors (replaces primaryHex/secondaryHex model)
  typography: TypographyState       // heading + body roles
  spacing: SpacingState
  shadow: ShadowState

  // Explore Mode overrides
  semanticOverrides: SemanticOverrides    // partial overrides to derived semantic roles
  componentTokens: ComponentTokenState   // component token overrides
  components: ComponentsState            // button style, size, radius controls

  // UI
  ui: UIState                       // mode, activeTab, showcaseTemplate, theme, toast
}
```

### 16.2 Personality Slice

```typescript
interface PersonalityState {
  archetype: ArchetypeId | null
  candidates: ColorCandidate[]      // current set of color cards
  locked: (string | null)[]         // hex for each locked slot, null if unlocked
  step: 1 | 2 | 3                   // Quick Mode step
  cycleSequence: number[]           // pre-shuffled hue sequence for this session
  cycleIndex: number                // current position in cycle sequence
}
```

### 16.3 Color Slice (Updated)

The `ColorState` replaces the fixed `primaryHex`/`secondaryHex`/`subBrand` model:

```typescript
interface ColorState {
  // Derived from personality.locked
  // These are the processed values after normalization
  primary: LockedColor       // { hex, name, oklch }
  secondary: LockedColor | null
  accents: LockedColor[]     // 0–3 additional locked colors

  // Explore Mode overrides (for neutral tint, data viz params)
  neutralTint: NeutralTint
  dataVizCount: number
  dataVizChroma: number
  stateColorsLocked: boolean
  stateColorOverrides: Partial<StateColors>
  harmonyModel: HarmonyModel   // affects secondary derivation when no secondary locked
}
```

### 16.4 Semantic Overrides Slice

```typescript
interface SemanticOverrides {
  // Partial record — only contains explicitly overridden roles
  light: Partial<Record<SemanticRoleId, string>>  // hex or oklch string
  dark: Partial<Record<SemanticRoleId, string>>
}
```

The `useSemanticTokens()` hook computes the full 42-role set and then applies overrides on top.

### 16.5 UI Slice (Updated)

```typescript
interface UIState {
  mode: 'quick' | 'explore'
  activeTab: TabId
  showcaseTemplate: ShowcaseTemplateId
  theme: 'dark' | 'light'
  toastMessage: string | null
  sidebarWidth: number           // px, user-resizable in Explore Mode
}
```

### 16.6 Undo / Redo

Using `zundo` middleware wrapping the Zustand store. Configuration:
- **Tracked slices:** `color`, `typography`, `spacing`, `shadow`, `semanticOverrides`, `componentTokens`, `components` — not `ui`, not `personality.step` or `personality.cycleIndex`.
- **History limit:** 50 entries
- **Keyboard shortcuts:** `Cmd/Ctrl+Z` (undo), `Cmd/Ctrl+Shift+Z` (redo)
- Undo/redo buttons visible in Explore Mode header

### 16.7 Persistence

`zustand/middleware/persist` with `localStorage`, key `typeset-v2`.

Persisted:
```typescript
{
  personality: { archetype, locked },     // not candidates or step
  color: { ... },
  typography: { ... },
  spacing: { ... },
  shadow: { ... },
  semanticOverrides: { ... },
  componentTokens: { ... },
  components: { ... },
  ui: { mode, theme, showcaseTemplate }   // not toast, not activeTab
}
```

Deep-merge on hydration (same strategy as v1 to prevent partial-state crashes).

---

## 17. Computed Token Hooks

Three hooks replace the single `useTokens()` monolith. Each subscribes only to the slices it needs.

```typescript
// Primitive shade scales for all locked colors
usePrimitiveTokens(): PrimitiveTokens

// Full 42-role semantic layer, applying overrides
useSemanticTokens(): SemanticTokens

// Component token layer, applying Explore Mode overrides
useComponentTokens(): ComponentTokens

// Convenience: full three-layer object for export plugins
useAllTokens(): { primitive, semantic, component }
```

Each hook uses `useMemo` internally and subscribes to the minimum required slice(s). `useSemanticTokens` subscribes to `color` and `semanticOverrides` only — a typography change will not cause semantic roles to recompute.

---

## 18. Directory Structure

```
src/
├── core/
│   ├── color/
│   │   ├── types.ts
│   │   ├── harmony.ts
│   │   ├── scales.ts              # Primitive shade scale generation
│   │   ├── neutral.ts             # Tinted neutral scale
│   │   ├── semantic-roles.ts      # NEW: 42-role derivation (OKLCH math)
│   │   ├── candidates.ts          # NEW: Quick Mode color candidate generation
│   │   ├── contrast.ts            # WCAG 2.x + APCA
│   │   ├── dataViz.ts             # OKLCH data viz palette
│   │   └── index.ts
│   ├── personality/               # NEW
│   │   ├── types.ts               # ArchetypeId, ArchetypeDefinition
│   │   ├── archetypes.ts          # 6 archetype definitions + parameters
│   │   └── index.ts
│   ├── typography/
│   │   ├── fontDatabase.ts        # + defaultPairings per archetype
│   │   ├── fontLoader.ts
│   │   ├── scale.ts
│   │   ├── readability.ts
│   │   └── index.ts
│   ├── spacing/
│   │   ├── scale.ts
│   │   └── index.ts
│   ├── shadow/
│   │   ├── presets.ts             # Updated: references shadow-color semantic role
│   │   └── index.ts
│   ├── components/                # NEW
│   │   ├── types.ts               # ComponentTokenMap type
│   │   ├── defaults.ts            # Auto-generated defaults from semantic tokens
│   │   └── index.ts
│   ├── tokens/
│   │   ├── types.ts               # UPDATED: PrimitiveTokens, SemanticTokens, ComponentTokens
│   │   └── index.ts
│   └── export/
│       ├── plugin.ts              # UPDATED: ExportPlugin receives ExportInput
│       ├── registry.ts
│       └── plugins/
│           ├── css.ts
│           ├── css-full.ts        # NEW: all three layers
│           ├── json.ts
│           ├── json-hierarchical.ts  # NEW
│           ├── w3c.ts
│           ├── tailwind.ts
│           ├── scss.ts
│           └── figma-tokens.ts
│
├── store/
│   ├── personality.ts             # NEW
│   ├── color.ts                   # UPDATED: LockedColor model
│   ├── typography.ts
│   ├── spacing.ts
│   ├── shadow.ts
│   ├── semanticOverrides.ts       # NEW
│   ├── componentTokens.ts         # NEW
│   ├── components.ts
│   ├── ui.ts                      # UPDATED: mode, showcaseTemplate
│   └── index.ts                   # UPDATED: zundo, remove compare
│
├── hooks/
│   ├── usePrimitiveTokens.ts      # NEW (extracted from useTokens)
│   ├── useSemanticTokens.ts       # NEW
│   ├── useComponentTokens.ts      # NEW
│   ├── useAllTokens.ts            # NEW (combines above for export)
│   ├── useFont.ts
│   ├── useContrast.ts
│   └── useToast.ts
│
├── features/
│   ├── quick/                     # NEW: full-screen wizard
│   │   ├── QuickModeLayout.tsx
│   │   ├── PersonalityPicker.tsx
│   │   ├── ColorDiscovery.tsx
│   │   ├── ColorCandidateCard.tsx
│   │   └── SystemReveal.tsx       # wraps ShowcasePanel with summary overlay
│   ├── color/
│   │   ├── ColorPanel.tsx         # UPDATED: now shows semantic roles layer too
│   │   ├── ColorSidebar.tsx
│   │   ├── SemanticRolesPanel.tsx # NEW: 42-role display + override UI
│   │   ├── ShadeScale.tsx
│   │   ├── DataVizPalette.tsx
│   │   ├── HarmonyWheel.tsx
│   │   └── ContrastGrid.tsx
│   ├── typography/
│   │   (same as v1 + archetype-aware pairing defaults)
│   ├── spacing/
│   │   (same, simplified — no dedicated tab, Explore sidebar section)
│   ├── shadows/
│   │   (simplified — preset-first, one custom level)
│   ├── components/                # UPDATED: token mapping UI + overrides
│   │   ├── ComponentsPanel.tsx
│   │   ├── ComponentTokenMap.tsx  # NEW: token chain display + override inputs
│   │   └── ComponentsSidebar.tsx
│   ├── showcase/                  # UPDATED: 4 templates
│   │   ├── ShowcasePanel.tsx      # template switcher + active template
│   │   ├── ShowcaseSidebar.tsx
│   │   ├── templates/
│   │   │   ├── MarketingTemplate.tsx
│   │   │   ├── DashboardTemplate.tsx
│   │   │   ├── EditorialTemplate.tsx
│   │   │   └── ProductTemplate.tsx
│   └── export/
│       ├── ExportPanel.tsx        # UPDATED: config panel + per-format code view
│       └── ExportSidebar.tsx
│
├── components/
│   ├── layout/
│   │   ├── AppHeader.tsx          # UPDATED: mode toggle, undo/redo buttons
│   │   ├── AppLayout.tsx          # UPDATED: resizable sidebar
│   │   └── PreviewCard.tsx
│   ├── controls/
│   │   (same set; all use CSS Modules, no inline styles)
│   └── feedback/
│       └── Toast.tsx
│
├── styles/
│   ├── globals.css
│   ├── typography.css
│   └── utils.css
│
├── utils/
│   ├── share.ts                   # NEW: URL encode/decode for sharing
│   └── compress.ts                # NEW: zlib wrapper (browser-compatible)
│
├── App.tsx                        # Mode-aware root
└── main.tsx
```

---

## 19. Design Principles (Updated)

### What this tool is
- A **generator** first: one color in, a complete system out. The science does the work.
- A **previewer** second: you see your system in real context before you commit to anything.
- A **precision tool** third: Explore Mode lets you override any derived value with full transparency about what you're changing and why it was set that way.

### Visual language
- Dark editorial by default; light mode toggle
- Amber (`#e8a830`) accent for the tool's own chrome — fixed, regardless of the user's brand color
- Monospace (`DM Mono`) for all token values, hex strings, and code
- Sans-serif (`Syne`) for section headings and UI labels
- Every derived value shows how it was derived (tooltip or inline label: "auto from primary · OKLCH")
- Overridden values are visually distinct from derived values throughout

### Interaction philosophy
- **No loading states for local operations.** All color derivation, scale generation, and semantic role computation is synchronous and happens in < 16ms.
- **The preview is always live.** No "apply" buttons. Every change reflects immediately in the Showcase.
- **Undo is always available.** Cmd+Z works everywhere in Explore Mode. Users should feel safe to experiment.
- **Transparency builds trust.** When the system makes a decision (choice of state color hue, automatic secondary derivation), it explains why. Users who understand the output trust it enough to ship it.
- **The export is the product.** Every design decision in the tool maps to a token variable name. The connection between visual choice and code output is never hidden.

### What this tool is not
- Not a Figma plugin (though it exports to Figma Tokens format)
- Not a component library (it defines the tokens components consume, not the components themselves)
- Not opinionated about your stack (CSS, Tailwind, SCSS, W3C, JSON — your choice)

---

## 20. Removed from v1

| Removed | Reason | Replacement |
|---|---|---|
| Compare tab | Wrong mental model; snapshot comparison is not how designers iterate | Spacebar cycling in Quick Mode; archetype default swapping in Explore Mode |
| `chroma-js` | culori is lighter, fully OKLCH-native, no Node.js globals | culori throughout |
| `react-router-dom` | Navigation is UI state, not URL routing | Mode toggle in UIState |
| Fixed 2-color model | Not flexible enough; semantic derivation needs only 1 color | 1–5 locked colors model |
| `store/compare.ts` | See Compare tab removal | — |
| `useTokens()` monolith | O(N) recomputation on every state change | Three targeted hooks |
| Backward-compat flat aliases on DesignTokens | Creates dual-truth bugs | Canonical `semantic.*` and `component.*` paths only |
| Inline styles throughout components | Violates CSS Modules principle; visual inconsistency | All component styles in CSS Modules |

---

## 21. Implementation Phases

### Phase 1 — Foundation Refactor
1. Migrate from `chroma-js` to `culori`; update all color math
2. Implement the three-hook architecture (`usePrimitiveTokens`, `useSemanticTokens`, `useComponentTokens`)
3. Implement semantic role derivation (`core/color/semantic-roles.ts`) with full 42-role OKLCH math
4. Update store slices (new `ColorState` with locked colors model, `semanticOverrides`, remove compare)
5. Add `zundo` undo/redo middleware
6. Implement URL sharing (`utils/share.ts`)

### Phase 2 — Quick Mode
7. Personality archetype definitions (`core/personality/archetypes.ts`)
8. Color candidate generation (`core/color/candidates.ts`)
9. `PersonalityState` store slice
10. `PersonalityPicker` component (Step 1)
11. `ColorDiscovery` component with spacebar mechanic (Step 2)
12. `SystemReveal` component wrapping Showcase (Step 3)
13. Mode toggle in `AppHeader`

### Phase 3 — Showcase Templates
14. `DashboardTemplate` (most needed in Explore Mode default)
15. `EditorialTemplate` (highest typography stress-test value)
16. `ProductTemplate`
17. Template switcher UI
18. Archetype → default template mapping

### Phase 4 — Semantic Role UI
19. `SemanticRolesPanel` in Color section (42-role display + override UI)
20. Override affordances throughout Explore Mode sidebar
21. "Derived / overridden" visual distinction system-wide

### Phase 5 — Component Tokens
22. `core/components/defaults.ts` — default token mappings
23. `ComponentTokenMap` component (token chain display)
24. Override UI in Components section
25. Component state previews (hover, active, disabled, focus)

### Phase 6 — Export Upgrade
26. Update all export plugins to handle three-layer `ExportInput`
27. Implement `css-full`, `json-hierarchical` plugins
28. Register `scss` and `figma-tokens` plugins (currently unregistered)
29. Export configuration panel (dark mode strategy, color format, prefix, naming convention)
30. "Download All" zip functionality

### Phase 7 — Polish
31. Resizable sidebar
32. Keyboard shortcuts documentation overlay
33. "Why this value?" tooltips on derived semantic roles
34. First-visit guided tour (Quick Mode auto-starts)
35. Performance audit: verify all hooks recompute only when their slice changes
36. Accessibility audit: keyboard navigation, ARIA labels, focus management
