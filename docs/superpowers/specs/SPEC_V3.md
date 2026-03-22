# PALETTE — Design System Builder v3
## Living Design Document

> This document is extended after every design decision round. It is the single source of truth for v3.
> Last updated: 2026-03-21 (round 3)

---

## 1. Vision

A browser-based design system generator aimed primarily at **vibe coders** — developers who code by feel and intuition, often with AI tools, and who struggle to produce a solid visual design system quickly. The tool is playful and fast by default, with the depth to satisfy professional designers and design engineers when they need it.

**Core loop:** Hit space. A complete design system is generated (colors + typography). Lock what you love. Unlocked slots re-harmonize around what is locked. Export immediately or go deeper into detail mode.

**Name (working):** `palette.` — minimal wordmark in the UI header.

---

## 2. Target Users

**Primary:** Vibe coders — developers willing to pay a small amount for a quick, solid design system they can create playfully and ship immediately. They want magic output and copy-pasteable code, not design jargon.

**Secondary (equal weight):** Designers (Figma-oriented, visual thinkers) and design engineers / developers (want CSS vars, Tailwind config, token JSON).

---

## 3. Tech Stack

Carries forward from v2. No changes.

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript 5 |
| Build | Vite 5 |
| State | Zustand + zundo (undo/redo) |
| Color math | culori (OKLCH-native) |
| Contrast / readability | apca-w3 (APCA algorithm for Typography tab readability score) |
| URL compression | fflate (deflate/inflate, tree-shakeable — for share URL encoding) |
| Font loading | Google Fonts API v2 (catalog + CSS) + Fontshare (static list + CSS) + Bunny Fonts (CSS mirror) |
| Styling | CSS Modules + CSS custom properties |
| Token export | Custom plugin system |

---

## 4. Layout

### 4.1 Default split
50/50 horizontal split. Left panel: generator / detail controls. Right panel: live preview.

The divider is **draggable** — user can resize the split freely. Default is 50/50.

### 4.2 Theme
**Light theme by default.** Dark mode available via a toggle in the app header. The toggle affects both panels.

### 4.3 Mobile
On mobile, only the **generator panel** is shown (full width). A "Preview →" button slides in the preview panel, replacing the generator. Back swipe / button returns to generator. Export is accessible from both views. Detail mode on mobile: tabs at top, scrollable content below.

**Mobile generation trigger:** The spacebar shortcut is keyboard-only and unavailable on touch devices. A prominent **"Generate ✦"** button is always visible at the bottom of the generator panel on mobile (equivalent to pressing space). Tapping it triggers the same cold-random or harmony-constrained generation as the spacebar does on desktop.

---

## 5. Two Modes

### 5.1 Generator Mode (default, entry experience)

The full split is the generator. No steps, no wizard. Everything is visible at once:
- Left: color swatches + typography specimen (Approach C)
- Right: single fixed landing page template, live-updated

**No personality/archetype picker.** Removed from v3. Generation starts cold.

### 5.2 Detail Mode (power layer)

Entered via "Detail Mode →" button in the generator panel (bottom of left panel). Left panel becomes a tabbed editor. Right panel gains a template switcher. A persistent "← Back to generator" link returns to generator with all state preserved — nothing is ever lost.

---

## 6. Generator Panel — Left Side

### 6.1 Color swatches (Approach C: Hybrid swatches + instant scale)

- **Large color columns** filling the top portion of the left panel (~110px tall)
- Each column shows: role label (Brand / Secondary / Accent A / Accent B), hex value, lock/unlock icon
- **Locked columns** show a 9-step shade strip immediately below them (full width of that column)
- **Unlocked columns** have no shade strip — clean, indicates they are in flux
- Role labels are visible from the very first generation — vibe coders immediately understand "brand color"

### 6.2 Color count
- **Default:** 4 colors (Brand, Secondary, Accent A, Accent B)
- **Min:** 1 color (Brand only)
- **Max:** 8 colors
- **"+" button:** adds a new slot with a harmonically derived color; appears below swatches
- **"−" button:** appears on hover on any non-Brand slot; removes that slot
- **Brand slot** cannot be removed but another slot can be dragged into the Brand role
- **Role reassignment:** drag-to-reorder changes which color holds which semantic role

**Lock follows color, not slot.** When the user drags a locked color to a new position, the lock state travels with the color value. The shade strip also moves with the color. Slot positions are just ordering — the lock is a property of the color. This preserves harmony model anchoring (Section 8.3) regardless of visual order.

### 6.3 Color theory hint
A subtle green hint bar below the shade strips, visible when at least one color is locked:
> "Unlocked colors are harmonizing with your Brand — analogous hues in OKLCH"
Names the active harmony model. Disappears when nothing is locked (pure cold random mode).

### 6.4 Typography specimen
Below the color section, with visible whitespace separation:
- **Big heading specimen** (~26px in the panel): renders actual heading font — "The quick brown fox"
- **Body text specimen:** 2 lines in body font
- **Scale pills:** H1 / H2 / H3 / Body / sm / xs — each showing size + weight
- **Font names:** "Heading: Fraunces · Body: Inter"
- **Lock toggle** (per heading font, per body font, per scale ratio — independently lockable)

### 6.5 Bottom of generator panel
- "SPACE to generate" hint (keyboard shortcut reminder); replaced by "Generate ✦" button on mobile
- "✦ vibe" chip — **Phase 4 placeholder.** Rendered in Phase 1 as a visible but disabled chip with a tooltip "Coming soon." Does not open anything in Phase 1. Serves as a UI anchor for Phase 4 implementation without requiring rework.
- "+ Add color" button
- "Detail Mode →" primary CTA (brand color)
- "Export ↓" — always visible (see Section 11)

---

## 7. Live Preview Panel — Right Side

### 7.1 Generator mode
A **single fixed template**: a SaaS landing page. It renders immediately with every generation. No template switcher in generator mode — the preview is always the same structure. Colors and typography update live.

### 7.2 Detail mode
Template switcher appears in the preview panel header:
- **Landing** (same as generator)
- **Dashboard**
- **Blog**
- **System** — the design system itself rendered beautifully: color swatches, shade scales, semantic roles, type specimens, character sets

The **System view** is a top-quality visual that users would want to screenshot and share.

---

## 8. Color Science

### 8.1 Generation algorithm

Every space press — including the first cold one — executes:

1. Pick a random **base hue** H ∈ [0°, 360°)
2. Pick a random **harmony model** from the 7 below
3. Derive N hue positions from the model's formula
4. For each hue position, sample L and C from the **model's OKLCH envelope** (each model has its own L/C personality, not a fixed range)
5. Assign roles: highest-chroma → Brand; harmonic opposite or strongest contrast → Secondary; remaining → Accents
6. Simultaneously draw a font pairing (see Section 9)

### 8.2 Harmony models (7 total)

| Model | Hue relationships | Character | OKLCH envelope |
|---|---|---|---|
| **Monochromatic** | All same hue, dramatically different L + C | Sophisticated, premium; near-identical colors are valid | Consistent C, dramatic L spread (0.3 → 0.75) |
| **Analogous** | 0–45° apart | Warm, cohesive, natural | Consistent L, slight C variation |
| **Complementary** | Base + 180° + small variations of each | High contrast, bold, energetic | Brand: high C; complement: slightly lower C |
| **Split-complementary** | Base + 150° + 210° | Softer than comp, very versatile | L: 0.50–0.70, C: 0.12–0.20; base gets highest C, split positions slightly lower |
| **Triadic** | 120° apart | Vibrant, playful, balanced | L: 0.55–0.70, C: 0.14–0.20; all three positions equal C, slight L variation |
| **Tetradic/Square** | 90° apart (4 equally spaced) | Rich, complex; excellent for 4-slot default | L: 0.55–0.68, C: 0.12–0.18; all four equal C and equal L for visual balance |
| **Compound** | Analogous base (0–30°) + complementary accent (180°) | Sophisticated complexity — near-similar group + strong contrast | Analogous group: L 0.55–0.70, C 0.10–0.16; accent: L 0.55–0.65, C 0.18–0.22 (pushed higher for contrast) |

**Weighting:** Split-complementary and compound appear more often (slightly higher random weight). Tetradic appears less often.

Near-similar colors (especially monochromatic, analogous) are **first-class outcomes** — not bugs.

### 8.3 When slots are locked

Locked slots anchor the current harmony model. Unlocked slots re-sample within the same model's remaining hue positions on each press. The model is preserved — not replaced — until the user presses space with everything unlocked (which triggers a full new cold random draw including a new model).

The active harmony model is named in the UI hint bar.

### 8.4 Shade scales

9-step OKLCH interpolation per locked color: 50 → 950. Lightness spread evenly; chroma preserves the character of the source hue. Shown as a strip below the locked swatch in the generator panel.

### 8.5 Semantic color roles

Derived automatically from shade scales. Two tiers:

**Brand-derived roles** (per color):
- interactive, on-interactive, interactive-container, on-interactive-container, interactive-subtle, interactive-hover

**State/mood roles** (global, auto-derived, tuned to harmonize with brand OKLCH profile):
- Error (red hue range): error, on-error, error-container, on-error-container
- Warning (amber): warning, on-warning, warning-container, on-warning-container
- Success (green): success, on-success, success-container, on-success-container
- Info (blue): info, on-info, info-container, on-info-container
- Neutral (brand hue at near-zero chroma): background, surface, surface-raised, on-surface, on-surface-subtle, border, border-strong

All semantic roles are visible in the **Colors tab of detail mode** under a "Semantic" section. All pass WCAG AA by derivation; the UI shows which pass AAA. A contrast grid is available.

### 8.6 Dark mode derivation

Dark mode values are computed from the same shade scales simultaneously with light mode. The mapping inverts the lightness axis:

| Semantic role | Light mode step | Dark mode step |
|---|---|---|
| background | 50 | 950 |
| surface | 100 | 900 |
| surface-raised | 50 (white) | 800 |
| on-surface | 900 | 100 |
| on-surface-subtle | 600 | 400 |
| border | 200 | 800 |
| border-strong | 400 | 600 |
| interactive | 500 | 400 (slightly lighter for contrast on dark bg) |
| on-interactive | white | white |
| interactive-subtle | 50 | 900 |
| interactive-hover | 600 | 300 |

State/mood roles (error, warning, success, info) follow the same inversion pattern: containers become dark-shade steps, base colors lighten slightly for dark backgrounds.

Dark mode tokens export as `[data-theme="dark"] { ... }` in CSS. Individual dark token overrides are available in the Colors tab of detail mode — each semantic role shows its light and dark value side by side with independent override inputs.

**Implementation:** The light/dark derivation runs as part of the same synchronous color derivation pass — no separate computation step. `deriveTokens(palette) → { light: {...}, dark: {...} }`.

### 8.7 Data visualization / categorical palette

A dedicated palette for charts, graphs, and figures with multiple data series (8–12 lines, segments, etc.).

**Generation algorithm:**
1. Take the brand hue as anchor point (H₀)
2. Distribute N hues evenly: H₀, H₀ + 360/N, H₀ + 2×360/N, …
3. Hold L and C constant across all N colors at a perceptually mid-bright level (L ≈ 0.65, C ≈ 0.15) — this ensures each color is equally prominent in a chart
4. Result: a set of N colors that are perceptually equidistant (maximally distinct from each other) while harmonizing with the brand through shared lightness/chroma profile

**User controls (in Colors tab, "Data Viz" section):**
- N selector: 8 (default), up to 20
- Each color in the set can be individually overridden
- Each gets its own shade scale for use in more complex data scenarios (e.g., light fill + dark stroke of the same series color)
- Preview: a mini chart (bar + line) rendered with the palette

**Why this matters:** Generic rainbow palettes (HSL-spaced) are perceptually uneven — yellow and cyan appear brighter than red and blue at the same saturation. OKLCH spacing produces a set where every color carries equal visual weight, which is critical for fair data representation.

---

## 9. Typography System

### 9.1 Font pairing pool

~60 hand-curated pairings stored as a **static JSON config file** in the codebase. Sources:
- **Google Fonts** (~40 pairings) — primary source; fonts loaded via CSS `@import` from `fonts.googleapis.com`; catalog browsable via Google Fonts API v2
- **Fontshare** by Indian Type Foundry (~15 pairings) — Fontshare has no public catalog API; fonts are served via CSS imports from `api.fontshare.com`; the available Fontshare font list is maintained as a static JSON array in the codebase (curated manually, ~100 fonts total)
- **Bunny Fonts** (~5 pairings) — mirrors the Google Fonts catalog; uses the same CSS import pattern; Google Fonts API list is reused for catalog browsing

Each pairing entry:
```json
{
  "heading": "Fraunces",
  "body": "Inter",
  "source": "google",
  "character": "editorial",
  "harmonyAffinity": ["monochromatic", "compound"]
}
```

Loose correlation: monochromatic/compound models slightly favor editorial/serif pairings; triadic/tetradic favor expressive/display. Not enforced — a random draw within a soft weight.

### 9.2 Full scale auto-derivation

Generated immediately on every space press using a **true modular scale**: all step sizes are computed as `base × ratio^n`, where base = 16px and ratio is randomly drawn from 1.25–1.5. The pixel values below are illustrative examples for ratio ≈ 1.4 — the implementation must derive them from the formula, not hardcode them.

| Step | Formula (ratio = 1.4) | Example px | Weight | Line height | Letter spacing |
|---|---|---|---|---|---|
| Display | base × ratio⁴ | ~62px | 800–900 | 1.05 | -0.04em |
| H1 | base × ratio³ | ~44px | 800 | 1.1 | -0.03em |
| H2 | base × ratio² | ~31px | 700 | 1.15 | -0.02em |
| H3 | base × ratio¹ | ~22px | 700 | 1.25 | -0.01em |
| H4 | base × ratio⁰·⁵ | ~19px | 600 | 1.35 | 0 |
| Body | base (16px) | 16px | 400 | 1.55–1.65 | 0 |
| Small | base × ratio⁻¹ | ~11px | 400 | 1.5 | 0 |
| XS | base × ratio⁻¹·⁵ | ~10px | 400 | 1.4 | 0 |
| Label | base × ratio⁻² | ~8px | 500 | 1.2 | +0.06em uppercase |

Weights are derived from the font's available axes — checked at load time, never hardcoded. Line heights are computed from the font's x-height metric where available, otherwise use the values above. All values export immediately as CSS custom properties.

### 9.3 Lock granularity

- Lock heading font alone → space re-rolls body only
- Lock body font alone → space re-rolls heading only
- Lock full pairing → space doesn't touch fonts
- Lock scale ratio → keeps size relationships even when fonts change
- "↺ fonts" button re-rolls fonts independently of color cycling

### 9.4 Font loading strategy

Fonts are loaded **on-demand only** — never eagerly for the full catalog:
- The 60 curated pairings: heading + body fonts loaded when the pairing is active (current generation). Previous pairing fonts are not unloaded immediately — kept for 2 cycles, then released.
- Font browser catalog: fonts load when their grid cell becomes visible (`IntersectionObserver`). Each cell shows a skeleton placeholder until the font loads. A short sample string ("Aa Bb 123") is used for preview loading, not the full character set.
- Error fallback: if a font fails to load (network error, CDN unavailable), the slot falls back to the next font in the pairing pool and logs a console warning. No user-visible error for a single font failure.
- Full character set display (Section 9.5, System view): loaded only when the System view is opened, not at generation time.

### 9.5 Detail mode — full font browser

Full access to entire Google Fonts + Fontshare + Bunny catalog:
- Search by name
- Filter by: style (serif / sans / mono / display / handwriting), weight availability, variable font support
- Live preview with custom sample text (user can type their own)
- Pick heading + body independently
- **Quick picks** at top of browser: the 60 curated pairings shown as a scrollable row. Clicking one applies both heading and body instantly. Quick picks supplement (not replace) the spacebar cycling — cycling in detail mode is not available, but the user can click any Quick pick or browse freely.

### 9.6 Typography showcase (System view)

The typography section of the System view must be visually exceptional:
- Full type specimen in each scale step
- Complete character set for each selected font: A–Z, a–z, 0–9, punctuation, diacritics, special characters — rendered in the actual loaded font
- Weights shown side by side
- Something worth screenshotting and sharing

---

## 10. Detail Mode

### 10.1 Tab structure — complete picture

Seven tabs total. Designed so each can be added in a later phase without interfering with existing tabs — each is a self-contained panel.

| Tab | Phase | Contents |
|---|---|---|
| **Colors** | 1 | Shade scales per color, semantic roles (brand-derived + state/mood groups), data viz categorical palette, contrast grid (WCAG AA/AAA), dark mode derived palette, manual hex/OKLCH override, add/remove/reorder colors |
| **Typography** | 1 | Full font browser (GF + Fontshare + Bunny), scale ratio picker, per-step size/weight/lh/ls override, live type specimen, full character set display (A–Z, a–z, 0–9, punctuation, diacritics), readability score (APCA), lock controls |
| **Spacing** | 2 | Base unit + scale (4pt/8pt grid), named steps (xs → 3xl), border-radius scale, border widths (1/2/4px), opacity scale (5 values), icon size scale, z-index layers, breakpoints, visual ruler preview |
| **Effects** | 2 | Elevation/shadow presets (sm/md/lg/xl), color-tinted shadows from brand hue, custom shadow builder, motion tokens (easing curves, duration scale 100–500ms, transition presets), focus ring style (color + width + offset, auto-derived from brand) |
| **Components** | 3 | Component token map (button, input, card, badge, etc.), icon set selection + preview (Lucide / Heroicons / Phosphor / Tabler / Radix), icon size mapping to spacing scale |
| **Showcase** | 1 | Switchable templates (Landing / Dashboard / Blog / System view), light/dark toggle, full-screen expand, share URL |
| **Export** | 1 | CSS custom properties, Tailwind config (v3 + v4), W3C design token JSON, SCSS variables, copy to clipboard / download, naming convention picker, choose which token layers to include |

**Grouping rationale:**
- Spacing consolidates all "dimension" tokens (spacing, radius, borders, opacity, icon sizes, breakpoints) — they share a visual ruler metaphor and are all unitless-scale concerns
- Effects consolidates shadows + motion + focus — things that affect how elements feel and move, sensory rather than structural
- Components is the bridge between abstract tokens and real UI — icon set lives here because icons are component-level decisions

**Store architecture:** Each tab reads from and writes to its own named slice in the Zustand store. See Section 10.3 for dependency mapping.

### 10.2 UX pattern per tab

- Every value shows **"auto"** badge (derived from generator) or **"overridden"** indicator (user-set)
- Overridden values have a **"reset"** affordance to return to derived value
- WCAG contrast checked live — green/amber/red summary visible in Colors tab

**Showcase tab — left panel:** The Showcase tab's left panel contains only: the template switcher (Landing / Dashboard / Blog / System), the light/dark theme toggle, a full-screen expand button, and a "Copy share link" button. There are no editable token controls in the Showcase tab's left panel. The right panel renders the selected template using the current token state from all other tabs.

### 10.3 Store architecture and tab independence

Each tab reads from and writes to its own **named slice** in the Zustand store: `colorSlice`, `typographySlice`, `spacingSlice`, `effectsSlice`, `componentsSlice`. The generator's derived output writes to a `derivedTokens` object that all slices read as their default values. Tab-specific overrides are stored separately from derived values, enabling the "auto" / "overridden" distinction.

**Known inter-slice dependencies** (mapping them explicitly rather than claiming full isolation):
- The Spacing tab's icon size scale references the spacing base unit (intra-slice, no cross-dependency)
- The Effects tab's focus ring color references `colorSlice.interactive` (cross-slice read, read-only)
- The Components tab reads from all slices to build component tokens (cross-slice read, read-only)
- No slice writes to another slice — all writes are to the owning slice only

Adding a Phase 2 or Phase 3 tab requires adding a new slice and registering it in the store — zero changes to existing slices.

### 10.4 Transition

Generator → Detail: click "Detail Mode →" button. Smooth panel transition. Opens on Colors tab by default. "← Back to generator" link always visible at top of left panel; returns with full state preserved.

---

## 11. Export

### 11.1 Always-visible entry point

A persistent **"Export ↓"** button lives in the app header, visible in **both** generator mode and detail mode.

- **In generator mode:** clicking opens a compact **slide-up panel** anchored to the bottom of the viewport, overlaying both panels. It closes on Escape, on click-outside, or on a close (×) button in its top-right corner. On mobile, it slides up from the bottom of the screen as a bottom sheet. Contents: format tabs (CSS / Tailwind / JSON), a live syntax-highlighted code preview block, and a prominent "Copy" CTA. One-click, zero friction.
- **In detail mode:** same header button opens the same slide-up panel. The **Export tab** in the sidebar additionally gives full control: naming conventions, which token layers to include, partial exports, copy or download as file. "Copy share link" lives in the Showcase tab left panel only (not in the Export slide-up).

### 11.2 Smart defaults (pre-selected, no configuration required)

- **Format:** CSS custom properties — most universal, zero tooling required
- **Secondary quick-pick:** Tailwind v3 — most common in vibe coder stacks
- **Naming:** semantic kebab-case, no prefix
- **Layers:** all included (primitives + semantic + typography)
- **Action:** Copy is the primary CTA; Download is secondary

The user gets something immediately useful without touching a single setting.

### 11.3 Live code preview

A syntax-highlighted code block updates in real time as the user changes format or naming options. Vibe coders see exactly what they're copying before they paste it. No surprises.

### 11.4 Export formats

| Format | Contents | Use case |
|---|---|---|
| **CSS custom properties** | All primitive + semantic tokens as `--var: value` in `:root`, plus `[data-theme="dark"]` overrides | Drop into any web project |
| **Tailwind v3** | `theme.extend` object with colors, fontFamily, fontSize, spacing, boxShadow, transitionDuration | `tailwind.config.js` |
| **Tailwind v4** | `@theme` block with CSS-native syntax | `app.css` in v4 projects |
| **W3C Design Tokens JSON** | Standard `$value` / `$type` format — interoperable with Figma Variables, Style Dictionary | Cross-tool handoff |
| **SCSS** | `$token-name: value` variables | Legacy SCSS codebases | Phase 1 |

### 11.5 Naming conventions (detail mode)

User picks a prefix (blank by default, or "ds-", "app-", custom) and casing style (kebab-case, camelCase, snake_case). Applied consistently across all formats.

### 11.6 Partial exports (detail mode only)

Checkboxes for which layers to include: primitives only, semantic only, component tokens only, or any combination. For teams that already have part of a system and only need specific layers.

### 11.7 Deferred to Phase 3
- Figma Variables / plugin export
- Style Dictionary config output
- Storybook design tokens integration
- Multi-file zip download (all formats at once)

---

## 12. Phase Plan

### Phase 1 — Core loop (build first)
- Generator mode: color swatches, harmony model generation (7 models), typography specimen, spacebar cycling, lock/unlock mechanics, add/remove color slots (1–8)
- Single fixed landing page preview (live update)
- Detail mode: Colors tab (brand palette + semantic roles + state/mood colors + data viz palette), Typography tab (font browser + full character set), Showcase tab (templates + System view), Export tab
- Always-visible Export button in header (compact slide-up in generator, full tab in detail)
- Light/dark theme toggle
- Mobile layout (generator panel only, preview slide-in)
- URL sharing (encode session state in hash)
- 60 curated font pairings (Google Fonts + Fontshare + Bunny Fonts)

### Phase 2 — Dimension + effects tokens
- Spacing tab (scale, radius, border widths, opacity, icon sizes, z-index, breakpoints)
- Effects tab (shadows, motion tokens, focus ring style)

### Phase 3 — Component layer
- Components tab (component token map, icon set selection from Lucide/Heroicons/Phosphor/Tabler/Radix, icon preview)
- Figma plugin export
- Save / load named sessions

### Phase 4 — Growth + monetization
- "Vibe" mood/keyword filter (optional seed for generation)
- Team sharing / paid tier hooks
- Additional export targets (Style Dictionary, Storybook tokens)

---

## 13. System View — Design Spec

The System view is a scrollable, screenshot-worthy document rendered in the right panel of the Showcase tab. It must look beautiful enough to share with a client or teammate without explanation.

**Structure (top to bottom, scrollable):**

1. **Header** — working title ("palette." or user-set name), generation date, harmony model used, font pairing names
2. **Colors**
   - Brand shade scale (9 steps, full width, step numbers 50–950 labeled, color name "Brand" + hex + OKLCH shown above)
   - Secondary, Accent A, Accent B: compact shade scales in a row, each labeled with its role name and source hex
   - Semantic roles: 5–6 key swatches (interactive, interactive-subtle, surface, on-surface, border) with role name labels
   - State colors: Error / Warning / Success / Info — base + container swatch pair each
   - Data viz palette: N colored blocks + mini bar chart preview
3. **Typography**
   - Section clearly labeled "Typography"
   - Heading font name prominently displayed (e.g. "Fraunces — Heading") before its specimens
   - Type scale specimens: Display → H1 → H2 → H3 → Body, each with size + weight labeled
   - Body font name prominently displayed (e.g. "Inter — Body") before its character set
   - Full character set for both fonts: A–Z, a–z, 0–9, punctuation, diacritics; weights shown side by side
4. **Data Viz** (if data viz palette is generated)
   - Labeled "Data Visualization — N-color categorical palette"
   - Color blocks + mini chart

**Visual quality bar:** Think a Notion page or a Linear changelog — clean whitespace, generous type sizes, subtle dividers. Not a dev tool. Something worth screenshotting.

---

## 14. URL Sharing

URL sharing is a Phase 1 deliverable. The share link encodes the current session state in the URL hash.

**What is encoded:**
- All color values and their lock states
- Active harmony model
- Font pairing (heading + body font names + source)
- Typography lock states (heading locked, body locked, scale locked)
- Active mode (generator / detail) and active detail tab
- Theme (light / dark)

**Encoding:** JSON serialized, then compressed with `fflate` (pako/deflate-compatible, tree-shakeable), then base64url encoded. Prefix: `#v3/`. Example: `#v3/eJyrVkrNKynKLFayUlAqS8...`

**Copy trigger:** A "Copy share link" button in the Showcase tab left panel. Also accessible via keyboard shortcut (Cmd/Ctrl+Shift+C).

**Error handling:** If the hash is present but fails to decode (corrupt, wrong version prefix, or missing fields), the app silently ignores it and starts fresh. No error shown to the user — a broken share link just opens the tool normally.

**Version compatibility:** The `#v3/` prefix allows future versions to detect and reject stale hashes gracefully. If a `#v2/` hash is detected, it is ignored (v2 format is incompatible with v3 state shape).

---

## 15. Open Questions

- App name: "palette." is working title — confirm or pick final name before Phase 1 ships
- Pricing model: not yet designed (Phase 3 concern)
- Components tab: v2 had a component token mapper — confirmed deferred to Phase 3
