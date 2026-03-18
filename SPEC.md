# TYPESET — Design System Builder
## Full Technical Specification

---

## 1. Vision

TYPESET is a browser-based design system authoring tool. It helps designers and engineers define, preview, and export a complete design token system — typography, color, spacing, shadows, and component primitives — with real-time preview and multi-format export.

The tool runs entirely client-side. No build step is required to use the output; the exports are framework-agnostic tokens consumable by any project.

---

## 2. Tech Stack

| Layer | Choice | Version |
|---|---|---|
| Framework | React | 18 |
| Language | TypeScript | 5 |
| Build | Vite | 5 |
| State | Zustand | 4 |
| Color Math | chroma-js + culori | latest |
| Font Loading | Google Fonts API v2 + Fontshare | — |
| Font Metrics | opentype.js | latest |
| Styling | CSS Modules + CSS custom properties | — |
| Token Export | custom plugin system | — |
| Routing | React Router | 6 |
| Testing | Vitest + Playwright | latest |
| Linting | ESLint + Prettier | latest |

**No CSS-in-JS.** The tool's own UI is styled with CSS Modules, preserving the dark editorial aesthetic from the prototype. CSS custom properties on `:root` drive theming.

---

## 3. Directory Structure

```
src/
├── core/                          # Pure logic — zero React, zero side effects
│   ├── color/
│   │   ├── types.ts               # Color-related type definitions
│   │   ├── harmony.ts             # Harmony model math (hue rotation)
│   │   ├── scales.ts              # Shade scale generation (50→900)
│   │   ├── neutral.ts             # Neutral scale with tinting
│   │   ├── semantic.ts            # State color derivation (min-distance heuristic)
│   │   ├── dataViz.ts             # OKLCH-spaced data viz palette generation
│   │   ├── contrast.ts            # WCAG 2.x + APCA contrast math
│   │   └── index.ts               # Re-exports
│   ├── typography/
│   │   ├── types.ts
│   │   ├── fontDatabase.ts        # Static font registry + metadata
│   │   ├── fontLoader.ts          # Dynamic <link> injection, cache tracking
│   │   ├── scale.ts               # Type scale generators (modular, fluid)
│   │   ├── readability.ts         # Scoring algorithm (weight, size, lh, category)
│   │   └── index.ts
│   ├── spacing/
│   │   ├── types.ts
│   │   ├── scale.ts               # Linear, modular, Tailwind-like generators
│   │   ├── radius.ts              # Border radius scale
│   │   └── index.ts
│   ├── shadow/
│   │   ├── types.ts
│   │   ├── presets.ts             # Elevation presets
│   │   └── index.ts
│   ├── tokens/
│   │   ├── types.ts               # DesignTokens root type (single source of truth)
│   │   ├── primitives.ts          # Computed primitive tokens from slices
│   │   ├── semantic.ts            # Semantic aliases over primitives
│   │   └── index.ts
│   └── export/
│       ├── plugin.ts              # ExportPlugin interface
│       ├── registry.ts            # ExportRegistry (register/list/run plugins)
│       └── plugins/
│           ├── css.ts             # CSS custom properties
│           ├── json.ts            # Flat JSON (current format)
│           ├── w3c.ts             # W3C Design Token Community Group format
│           ├── tailwind.ts        # tailwind.config.js extend block
│           ├── scss.ts            # SCSS $variable map + @forward
│           └── figma-tokens.ts    # Tokens Studio (Figma plugin) format
│
├── store/                         # Zustand
│   ├── typography.ts
│   ├── color.ts
│   ├── spacing.ts
│   ├── shadow.ts
│   ├── components.ts
│   ├── compare.ts
│   ├── ui.ts                      # Active tab, sidebar state
│   └── index.ts                   # Combined store + undo middleware
│
├── hooks/
│   ├── useTokens.ts               # Derives complete DesignTokens from store
│   ├── useExport.ts               # Runs export plugins reactively
│   ├── useContrast.ts             # Contrast ratio computation
│   └── useFont.ts                 # Font loading orchestration
│
├── features/
│   ├── typography/
│   │   ├── TypographyPanel.tsx    # Preview panel
│   │   ├── TypographySidebar.tsx  # Controls sidebar
│   │   ├── FontList.tsx
│   │   ├── AxesPanel.tsx
│   │   ├── ReadabilityScore.tsx
│   │   ├── TypeSpecimen.tsx
│   │   ├── FontPairings.tsx
│   │   └── CharacterGrid.tsx
│   ├── color/
│   │   ├── ColorPanel.tsx
│   │   ├── ColorSidebar.tsx
│   │   ├── BrandColorEditor.tsx   # 2 main brand colors
│   │   ├── SubBrandEditor.tsx     # 3 sub-brand colors
│   │   ├── HarmonyWheel.tsx       # Canvas-based interactive wheel
│   │   ├── DataVizPalette.tsx     # OKLCH extended palette
│   │   ├── ShadeScale.tsx         # 50→900 swatch row
│   │   ├── NeutralScale.tsx
│   │   ├── StateColors.tsx
│   │   ├── ContrastGrid.tsx
│   │   └── UIPreview.tsx
│   ├── spacing/
│   │   ├── SpacingPanel.tsx
│   │   └── SpacingSidebar.tsx
│   ├── shadows/
│   │   ├── ShadowPanel.tsx
│   │   └── ShadowSidebar.tsx
│   ├── components/
│   │   ├── ComponentsPanel.tsx
│   │   └── ComponentsSidebar.tsx
│   ├── compare/
│   │   ├── ComparePanel.tsx
│   │   └── CompareSidebar.tsx
│   └── export/
│       ├── ExportPanel.tsx
│       └── ExportSidebar.tsx
│
├── components/                    # Shared UI chrome
│   ├── layout/
│   │   ├── AppHeader.tsx
│   │   ├── AppSidebar.tsx
│   │   ├── AppPreview.tsx
│   │   └── TabNav.tsx
│   ├── controls/
│   │   ├── Slider.tsx             # Range input + value display
│   │   ├── ColorPicker.tsx        # Swatch + hex input combo
│   │   ├── RadioGroup.tsx
│   │   ├── Select.tsx
│   │   ├── TextInput.tsx
│   │   └── Button.tsx
│   └── feedback/
│       ├── Toast.tsx
│       └── Badge.tsx
│
├── styles/
│   ├── globals.css                # :root tokens, reset, scrollbars
│   ├── typography.css             # App-level type styles
│   └── utils.css                  # Utility classes
│
├── App.tsx
└── main.tsx
```

---

## 4. Color System Architecture (Core Design Decision)

This is the most sophisticated part of the system. The palette is structured in five distinct layers, each with a clear purpose.

### Layer 1 — Brand Foundation (2 colors)

Two independently set brand colors. Neither is derived from the other; the designer owns both.

- **Primary Brand** — the dominant identity color, used for primary CTAs, active states, key brand moments
- **Secondary Brand** — the supporting identity color, used for secondary actions, complementary surfaces

Both get full 50→900 shade scales.

### Layer 2 — Sub-Brand Colors (3 colors)

Three additional colors that the designer can set manually or derive. These serve roles like:
- Tertiary actions
- Section-specific theming (e.g., "finance section is teal, editorial is purple")
- Supporting illustration palette

**Derivation options (user-selectable per slot):**
- **Auto (Color Theory)** — derived from primary using the selected harmony model
- **Manual** — free color picker
- **From Secondary** — derived from secondary brand using harmony offsets

Each gets a full 50→900 shade scale.

### Layer 3 — Extended Data Visualization Palette (6–12 colors)

A set of colors optimized for categorical data (charts, graphs, maps, tags). The key requirements:
- **Perceptually equidistant** — no color appears more prominent than others
- **Distinguishable** — sufficient differentiation even in colorblind conditions
- **Brand-anchored** — first color is always the primary brand hue
- **Light + dark variants** — each color has an on-dark and on-light version

**Generation algorithm (OKLCH space):**

1. Start at the primary brand's OKLCH hue
2. Distribute N colors at `360/N` degree intervals around the hue wheel
3. Hold Lightness (`L`) and Chroma (`C`) constant for all colors — this ensures perceptual equality
4. L target for dark backgrounds: `0.72` (bright, visible)
5. L target for light backgrounds: `0.52` (deeper, sufficient contrast on white)
6. C target: `0.16` (vivid without being neon)
7. Skip hues within `±15°` of the brand primary and secondary (preserve their distinctiveness)
8. If a skipped interval would produce a duplicate-looking color, nudge `+20°`
9. Output: array of `{ light: string, dark: string, name: string }` tuples

**Colorblind simulation:** generate Deuteranopia/Protanopia/Tritanopia approximations and render side-by-side in the UI for validation.

### Layer 4 — Semantic / State Colors (4 colors)

Success, Warning, Error, Info. Derived to harmonize with the brand palette using the minimum angular distance heuristic from the prototype — pick the candidate hue (from predefined ranges) that maximizes minimum angular distance from all palette hues already in use.

All four are manually overridable.

### Layer 5 — Neutral Scale (11 steps: 50–950)

Semantic-neutral grays with optional tinting:
- `pure` — true neutral (HSL saturation = 0)
- `warm` — slight amber/yellow tint (H≈30°, S≈4%)
- `cool` — slight blue tint (H≈220°, S≈6%)
- `tinted` — uses the primary brand hue at low saturation (S≈8–12%)

### Token Aliasing (Primitive → Semantic)

```
primitive: --amber-500: #e8a830
                             ↓
semantic:  --color-primary:       var(--amber-500)
           --color-cta-bg:        var(--amber-500)
           --color-focus-ring:    var(--amber-300)
           --color-on-primary:    var(--neutral-950)
```

This two-layer structure is exported in all formats.

---

## 5. Typography System

### Font Database
Static registry of ~75 fonts with metadata:
- `name`, `category` (sans/serif/mono), `source` (google/fontshare/system)
- `variable: boolean`
- `axes`: map of OpenType axis tags to `[min, max, default]`
- `pairsWith`: suggested companion fonts

### Type Scale
Three scale algorithms:
- **Linear** — base × multipliers `[0.75, 0.875, 1, 1.125, 1.25, 1.5, 2, 2.5, 3]`
- **Modular** — base × ratio^step, where ratio ∈ {1.125 Major Second, 1.2 Minor Third, 1.25 Major Third, 1.333 Perfect Fourth, 1.414 Aug Fourth, 1.5 Perfect Fifth, 1.618 Golden}
- **Fluid** — `clamp(min, preferred-vw, max)` for each step

### Readability Score
Weighted scoring (0–100):
- Font weight (300–500 = +20, 600–700 = +10, >700 = −10)
- Category (serif +8, sans +5, mono −5)
- Line height (1.4–1.8 = +15, outside = partial)
- Letter spacing (|ls| < 0.03em = +7)
- Line length (45–75 chars per line = +10, computed from size + container)
- Variable font = +5

---

## 6. Spacing System

- **Base unit**: 4pt or 8pt
- **Scales**: Linear, Modular (1.25×), Tailwind-inspired
- **Named steps**: `--space-1` through `--space-12` minimum
- **Border radius**: separate base + scale (×2 steps, ×1.5 steps, fixed offsets)
- **Z-index scale**: `--z-base(0), --z-raised(10), --z-dropdown(100), --z-sticky(200), --z-modal(300), --z-toast(400)`
- **Breakpoints**: `sm(640), md(768), lg(1024), xl(1280), 2xl(1536)` — overridable

---

## 7. Shadow System

- Interactive builder (x, y, blur, spread, color, opacity)
- Elevation presets (none/low/medium/high/overlay)
- Generates 5-level elevation scale in the token set

---

## 8. Export Plugin System

```typescript
interface ExportPlugin {
  id: string
  label: string
  filename: string
  language: 'css' | 'js' | 'json' | 'scss' | 'ts'
  generate(tokens: DesignTokens): string
}
```

Plugins are registered at boot and run reactively whenever tokens change. The Export tab renders each plugin's output in a code block with copy/download controls.

### Formats

| Plugin | Output |
|---|---|
| `css` | `:root { --token: value; }` — flat |
| `css-semantic` | Two-layer `:root` — primitives + semantic aliases |
| `json` | Flat JSON object |
| `w3c` | W3C DTCG format (`{ "$value": …, "$type": "color" }`) |
| `tailwind` | `module.exports = { theme: { extend: { … } } }` |
| `scss` | `$token: value;` maps with `@forward` |
| `figma-tokens` | Tokens Studio JSON structure |

---

## 9. State Management (Zustand)

Each feature owns a slice. The combined store exposes:

```typescript
interface Store {
  typography: TypographyState
  color: ColorState
  spacing: SpacingState
  shadow: ShadowState
  components: ComponentsState
  compare: CompareState
  ui: UIState

  // Actions
  typography: { setFont, setWeight, setSize, … }
  color: { setPrimaryBrand, setSecondaryBrand, setSubBrand, setHarmony, … }
  // …
}
```

**Undo/redo**: Zustand middleware captures snapshots of the entire token-relevant state on every action. Keyboard shortcut `Cmd/Ctrl+Z` restores.

**Persistence**: `zustand/middleware/persist` with `localStorage`. Keyed to `typeset-v1`.

**URL state**: Compressed base64 token snapshot appended to URL hash for sharing.

---

## 10. Design Decisions & Constraints

- **No backend required** — fully client-side, works offline after first load
- **No CSS-in-JS** — the tool's shell uses CSS Modules; no runtime style injection for app chrome
- **Computed values are never stored in state** — derived colors, scales, and scores are computed fresh from primitives using selectors/hooks
- **Type safety throughout** — all token values are strongly typed; export plugins receive a typed `DesignTokens` object
- **Plugin isolation** — each export plugin is a pure function; it cannot access the store directly
- **Feature isolation** — each feature folder is self-contained (its own panel, sidebar, and local components); shared logic lives in `core/`

---

## 11. Implementation Phases

### Phase 1 — Foundation
1. Project scaffold (Vite + React + TS + CSS Modules)
2. Global styles (port CSS variables from prototype)
3. App shell (header, sidebar, preview layout)
4. Tab routing

### Phase 2 — Color Engine
5. Core color types
6. Harmony math
7. Shade scale generation
8. OKLCH data viz palette
9. Neutral + semantic derivation
10. Color store slice

### Phase 3 — Color Feature UI
11. BrandColorEditor (2 colors)
12. SubBrandEditor (3 colors, auto/manual modes)
13. HarmonyWheel (canvas)
14. DataVizPalette display + colorblind simulation
15. ShadeScale, NeutralScale, StateColors
16. ContrastGrid + UIPreview

### Phase 4 — Typography
17. Font database + loader
18. Typography store slice
19. FontList + AxesPanel
20. TypeSpecimen + ReadabilityScore
21. FontPairings + CharacterGrid

### Phase 5 — Spacing, Shadows, Components
22. Spacing store + panel
23. Shadow store + panel
24. Components preview

### Phase 6 — Export
25. Plugin interface + registry
26. All 6 export plugins
27. Export panel UI

### Phase 7 — Compare + Polish
28. Pin/compare system
29. Undo/redo middleware
30. URL sharing
31. Import/export JSON

---

## 12. Aesthetic & UX Principles

- Dark editorial by default; light mode toggle
- Amber (`#e8a830`) accent throughout the tool chrome — always — regardless of the user's chosen primary brand color
- Monospace font (`DM Mono`) for all values, labels, code
- Sans-serif (`Syne`) for headings and section labels only
- Every control shows its live value alongside the input
- No loading spinners for local operations — all rendering is synchronous
- Toasts for copy/save confirmations; never modal dialogs for non-destructive actions
