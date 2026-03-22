# Color Recipe Engine — Design Spec
**Date:** 2026-03-22
**Branch:** `claude/design-system-architecture-BM2jR`
**Status:** Approved for implementation

---

## Problem Statement

The current color generator produces palettes that feel uniform and repetitive:

1. **Repetition bug**: when slot count exceeds a model's hue-offset count (e.g. triadic has 3, but you have 8 slots), the code wraps with `i % hueOffsets.length` — producing near-identical duplicate hues.
2. **Narrow L/C ranges**: all models sample from a small window (±7% L, ±4% C), so all slots look similar in brightness and saturation.
3. **No neutral anchors**: no near-white or near-black — palettes can't serve as complete UI color systems.
4. **No secondary mode**: extra slots beyond the harmony count have no principled source — they're just repeats of primary hues.
5. **No model override UI**: harmony mode only appears when slots are locked; there's no way to pin a preferred generation style.

---

## Solution Overview

Replace the current single-model generation system with a **Recipe Engine**:

- **25 hand-crafted recipes**, each defining a primary mode, an optional secondary mode, and a typed fill order.
- **Depth levels** (pale · vivid · deep) give each hue family a wide lightness spread.
- **Slot type fill queue** eliminates the wrap-around repetition bug.
- **Primary type pill row** above the swatches lets users pin a mode family (Triadic, Analogous, etc.), narrowing the random recipe pool.
- **Special vibe recipes** (Jewel, Earth, Pastel Cloud) are always available regardless of any pin.

---

## Architecture

### 1. Slot Types

Each slot in a palette is described by a `SlotType` that encodes both its **hue source** and **depth level**:

```typescript
type HueSource = 'P1' | 'P2' | 'P3' | 'P4' | 'S1' | 'S2'
type DepthLevel = 'pale' | 'vivid' | 'deep'
type SpecialSlot = 'neutral-light' | 'neutral-dark'
type SlotType = `${HueSource}-${DepthLevel}` | SpecialSlot
// Valid examples: 'P1-vivid', 'S2-pale', 'neutral-dark'
// Duplicate entries in fillOrder are allowed — each occurrence
// samples fresh random L/C within the depth range.
```

**Depth level OKLCH ranges:**

| Level | L range | C range | Character |
|---|---|---|---|
| `pale` | 0.84 – 0.93 | 0.03 – 0.08 | pastel, background, hover |
| `vivid` | 0.52 – 0.72 | 0.14 – 0.26 | full color, buttons, highlights |
| `deep` | 0.22 – 0.38 | 0.08 – 0.16 | text on light, dark surfaces |
| `neutral-light` | 0.92 – 0.97 | 0.01 – 0.03 | near-white (tiny warm tint at base hue) |
| `neutral-dark` | 0.10 – 0.18 | 0.01 – 0.03 | near-black (tiny cool tint) |

Each slot also gets a **hue jitter** of ±6° applied randomly, preventing the mechanical look of exact harmony angles.

### 2. Recipe Definition

```typescript
type PrimaryType =
  | 'triadic' | 'analogous' | 'complementary' | 'split-comp'
  | 'mono' | 'tetradic' | 'compound' | 'special'

interface RecipeDef {
  id: string                    // stable slug, e.g. 'triadic-accent'
  label: string                 // display name, e.g. 'Triadic + Accent'
  primaryType: PrimaryType      // determines which pill filters it
  primaryHueOffsets: number[]   // angles added to baseHue for P1..P4
                                // primaryHues[i] = (baseHue + primaryHueOffsets[i] + jitter) % 360
  secondaryHueOffsets?: number[] // angles for S1..S2, ALSO relative to baseHue
                                // (NOT relative to P1 — same basis as primaryHueOffsets)
                                // secondaryHues[i] = (baseHue + secondaryHueOffsets[i] + jitter) % 360
  secondaryChromaScale?: number  // default 1.0; set to e.g. 0.4 for muted accents
  fillOrder: SlotType[]         // exactly 8 entries; trimmed to count from the front
  minCount?: number             // if set, recipe is excluded from pool when count < minCount
  monoLadder?: true             // if set, ignores depth L ranges and instead spreads L
                                // evenly from 0.10 to 0.90 across all slots (recipe 20 only)
  vibeConstraint?: {            // optional forced L/C override (vibe recipes only)
    lRange: [number, number]
    cRange: [number, number]
    hueRange?: [number, number] // if present, picks baseHue from this range instead of 0–360
  }
}
```

The `fillOrder` always has exactly 8 entries. When `count < 8`, take the first `count` entries. This means the most important slots (vivid primary hues, neutrals) come first, and tints/extras drop off gracefully at lower counts.

**`secondaryHueOffsets` note for recipe 9**: Split-Comp's primary offsets are `[0, 150, 210]`. To get secondary hues that are +25° from P2 and P3, set `secondaryHueOffsets: [175, 235]` (150+25, 210+25) — both are relative to `baseHue`, no special struct needed.

### 3. The 25 Recipes

**Fill order abbreviation legend** (used in the tables below):

| Abbreviation | Canonical `SlotType` |
|---|---|
| `NL` | `'neutral-light'` |
| `ND` | `'neutral-dark'` |
| `P1v` | `'P1-vivid'` |
| `P1p` | `'P1-pale'` |
| `P1d` | `'P1-deep'` |
| `P2v`, `P2p`, `P2d` | `'P2-vivid'`, `'P2-pale'`, `'P2-deep'` |
| `P3v`, `P3p`, `P3d` | `'P3-vivid'`, `'P3-pale'`, `'P3-deep'` |
| `P4v`, `P4p` | `'P4-vivid'`, `'P4-pale'` |
| `S1v`, `S1p` | `'S1-vivid'`, `'S1-pale'` |
| `S2v`, `S2p` | `'S2-vivid'`, `'S2-pale'` |

Duplicate abbreviations in a fill order (e.g. `P1p, P1p`) are allowed — each gets an independent fresh random sample within the pale range.

---

Organized by `primaryType`. When a user pins a type, only that type's recipes + all `special` recipes enter the random pool.

#### Triadic (pool size: 3)

| # | id | Label | `primaryHueOffsets` | `secondaryHueOffsets` | `secondaryChromaScale` | `fillOrder[0..7]` |
|---|---|---|---|---|---|---|
| 1 | `triadic-accent` | Triadic + Accent | `[0,120,240]` | `[150,210]` | 1.0 | `NL,P1v,P2v,P3v,S1v,P1p,S1p,ND` |
| 10 | `triadic-muted` | Triadic · Muted Harmony | `[0,120,240]` | `[20,345]` | 0.4 | `P1v,P2v,P3v,S1v,S2v,P1p,P2p,P3p` |
| 16 | `triadic-pure` | Triadic · Pure | `[0,120,240]` | — | — | `P1v,P1p,P1d,P2v,P2p,P3v,P3p,P3d` |

#### Analogous (pool size: 4)

| # | id | Label | `primaryHueOffsets` | `secondaryHueOffsets` | `secondaryChromaScale` | `fillOrder[0..7]` |
|---|---|---|---|---|---|---|
| 2 | `analogous-pop` | Analogous + Pop | `[0,22,44]` | `[180]` | 1.0 | `NL,P1v,P2v,P3v,S1v,P1p,S1p,ND` |
| 8 | `analogous-cool-breath` | Analogous + Cool Breath | `[0,22,44]` | `[175]` | 0.6 | `P1v,P2v,P3v,S1v,P1p,P2p,P3p,S1p` |
| 13 | `analogous-warm-pop` | Analogous Cool + Warm Pop | `[0,22,44]` | `[155]` | 1.0 | `NL,P1v,P2v,P3v,S1v,P1p,S1p,ND` |
| 17 | `analogous-pure` | Analogous · Pure | `[0,30,55]` | — | — | `P1v,P2v,P3v,P1p,P1d,P2p,P2d,P3p` |

#### Complementary (pool size: 3)

| # | id | Label | `primaryHueOffsets` | `secondaryHueOffsets` | `secondaryChromaScale` | `fillOrder[0..7]` |
|---|---|---|---|---|---|---|
| 3 | `comp-cluster` | Complementary + Cluster | `[0,180]` | `[25,335]` | 1.0 | `NL,P1v,P2v,S1v,S2v,P1p,P2p,ND` |
| 11 | `comp-quartet` | Double Complement · Quartet | `[0,180]` | `[90,270]` | 1.0 | `NL,P1v,P2v,S1v,S2v,P1p,P2p,S1p` |
| 18 | `comp-pure` | Complementary · Pure | `[0,180]` | — | — | `P1v,P1p,P1d,P2v,P2p,P2d,P1p,P2p` |

*(Recipe 18's last two entries are duplicate `P1-pale` and `P2-pale` — fresh samples, each independently randomised within the pale range.)*

#### Split-Complementary (pool size: 3)

| # | id | Label | `primaryHueOffsets` | `secondaryHueOffsets` | `secondaryChromaScale` | `fillOrder[0..7]` |
|---|---|---|---|---|---|---|
| 4 | `split-warm` | Split-Comp + Warm | `[0,150,210]` | `[25]` | 1.0 | `NL,P1v,P2v,P3v,S1v,P1p,P1d,ND` |
| 9 | `split-spectrum` | Split-Comp · Full Spectrum | `[0,150,210]` | `[175,235]` | 1.0 | `P1v,P2v,P3v,S1v,S2v,P1p,P2p,P3p` |
| 19 | `split-pure` | Split-Comp · Pure | `[0,150,210]` | — | — | `P1v,P1p,P2v,P2p,P3v,P3p,P1d,P2d` |

#### Monochromatic (pool size: 3)

| # | id | Label | `primaryHueOffsets` | `secondaryHueOffsets` | `secondaryChromaScale` | `fillOrder[0..7]` | Notes |
|---|---|---|---|---|---|---|---|
| 5 | `mono-burst` | Mono + Burst | `[0]` | `[150,210]` | 1.0 | `NL,P1p,P1v,P1d,S1v,S2v,P1p,ND` | |
| 12 | `mono-bridge` | Mono · Warm-Cool Bridge | `[0]` | `[90,270]` | 1.0 | `P1p,P1v,P1d,S1v,S2v,S1p,S2p,P1p` | |
| 20 | `mono-rich` | Mono · Rich | `[0]` | — | — | `P1v,P1v,P1v,P1v,P1v,P1v,P1v,P1v` | `monoLadder: true` — all 8 slots use the same hue; the generator **ignores the depth ranges** and instead evenly spaces L from 0.10 to 0.90 (step = 0.114 per slot), with C held in 0.04–0.18 and a small ±3° hue drift per step to create warm→cool feel. `fillOrder` is formally all `'P1-vivid'` so the type system is satisfied; the ladder overrides L/C. |

#### Tetradic (pool size: 3)

`minCount: 5` applies to recipes 15 and 21 — they require at least 5 slots to produce 2+ distinct hues at count=4. At `count < 5` the pool selection simply skips these two and uses recipe 6 only.

| # | id | Label | `primaryHueOffsets` | `secondaryHueOffsets` | `fillOrder[0..7]` |
|---|---|---|---|---|---|
| 6 | `tet-balance` | Tetradic + Balance | `[0,90,180,270]` | — | `NL,P1v,P2v,P3v,P4v,P1p,P3p,ND` |
| 15 | `tet-rhythmic` | Square · Rhythmic | `[0,90,180,270]` | — | `P1v,P1p,P2v,P2p,P3v,P3p,P4v,P4p` |
| 21 | `tet-pure` | Tetradic · Pure | `[0,90,180,270]` | — | `P1v,P1p,P2v,P2p,P3v,P3p,P4v,P4p` |

*(Recipes 15 and 21 share the same fillOrder structure; their difference is that recipe 21 uses slightly narrower jitter ±4° for a more orderly feel.)*

#### Compound (pool size: 3)

| # | id | Label | `primaryHueOffsets` | `secondaryHueOffsets` | `fillOrder[0..7]` |
|---|---|---|---|---|---|
| 7 | `comp-depth` | Compound + Depth | `[0,25,180,205]` | — | `NL,P1v,P2v,P3v,P4v,P1d,P3d,ND` |
| 14 | `comp-soft` | Compound · Soft | `[0,25,180,205]` | — | `NL,P1p,P2p,P3p,P4p,P1v,P1p,P2p` |
| 22 | `comp-pure` | Compound · Pure | `[0,30,180,210]` | — | `P1v,P2v,P3v,P4v,P1p,P2p,P3p,P4p` |

*(Recipe 14's slot 5 is `P1-vivid` — one vivid anchor amid the pastel field. The last two entries are duplicate pale slots for graceful 4-slot trimming.)*

#### Special / Vibe (always in pool — `primaryType: 'special'`)

| # | id | Label | `vibeConstraint` | `fillOrder[0..7]` |
|---|---|---|---|---|
| 23 | `jewel-tones` | Jewel Tones | `{ lRange:[0.42,0.58], cRange:[0.22,0.28] }` | `P1v,P2v,P3v,P4v,S1v,S2v,P1v,P2v` (primaryHueOffsets `[0,51,102,153,204,255]`, no secondary) |
| 24 | `earth-palette` | Earth Palette | `{ lRange:[0.30,0.78], cRange:[0.05,0.13], hueRange:[15,65] }` | `P1v,P2v,P3v,P4v,P1d,P2d,P1p,P2p` (primaryHueOffsets `[0,12,24,38]`) |
| 25 | `pastel-cloud` | Pastel Cloud | `{ lRange:[0.84,0.93], cRange:[0.04,0.08] }` | `NL,P1p,P2p,P3p,P4p,S1p,S2p,P1p` (primaryHueOffsets `[0,51,102,153]`, secondaryHueOffsets `[204,255]`) |

*(For vibe recipes the vibeConstraint L/C overrides all depth-range sampling. The fillOrder entries still determine hue sources; `NL` in recipe 25 uses vibeConstraint's upper L bound.)*

---

### 4. Concrete fillOrder Example

Recipe 1 (`triadic-accent`) as valid TypeScript, to confirm the type system works end-to-end:

```typescript
const TRIADIC_ACCENT: RecipeDef = {
  id: 'triadic-accent',
  label: 'Triadic + Accent',
  primaryType: 'triadic',
  primaryHueOffsets: [0, 120, 240],
  secondaryHueOffsets: [150, 210],
  secondaryChromaScale: 1.0,
  fillOrder: [
    'neutral-light',  // slot 0 — always first, drops last at low count
    'P1-vivid',       // slot 1 — brand
    'P2-vivid',       // slot 2
    'P3-vivid',       // slot 3
    'S1-vivid',       // slot 4 — split-comp accent
    'P1-pale',        // slot 5 — tint of brand
    'S1-pale',        // slot 6 — pale of accent
    'neutral-dark',   // slot 7 — near-black, last to drop
  ],
}
// At count=4: fillOrder.slice(0,4) = ['neutral-light','P1-vivid','P2-vivid','P3-vivid']
// At count=6: fillOrder.slice(0,6) = ['neutral-light','P1-vivid','P2-vivid','P3-vivid','S1-vivid','P1-pale']  — S1-pale and neutral-dark dropped
```

---

### 5. Generation Algorithm

```
generatePalette(opts: { count, existing, pinnedRecipeId, pinnedPrimaryType }):

  1. Determine recipe pool:
       if pinnedRecipeId → [RECIPES.find(r => r.id === pinnedRecipeId)]
       else if pinnedPrimaryType →
         RECIPES.filter(r => r.primaryType === pinnedPrimaryType || r.primaryType === 'special')
       else → RECIPES (all 25)
     Apply minCount filter: remove recipes where recipe.minCount > count

  2. Pick recipe randomly (uniform weight) from filtered pool.

  3. Pick baseHue:
       if recipe.vibeConstraint.hueRange → randomInRange(hueRange)
       else → Math.random() * 360

  4. Compute hues (all relative to baseHue):
       primaryHues[i]   = (baseHue + primaryHueOffsets[i] + jitter(±6°)) % 360
       secondaryHues[i] = (baseHue + secondaryHueOffsets[i] + jitter(±6°)) % 360
       (if no secondaryHueOffsets, secondaryHues is empty)

  5. effectiveFillOrder = recipe.fillOrder.slice(0, count)

  6. For each position i in effectiveFillOrder:
       existingSlot = existing[i]
       if existingSlot?.locked → slots[i] = { ...existingSlot }; continue

       slotType = effectiveFillOrder[i]

       if recipe.monoLadder:
         L = lerp(0.10, 0.90, i / (count - 1))   // evenly spaced
         C = randomInRange(0.04, 0.18)
         H = primaryHues[0] + (i * 3)             // ±3° drift per step
         hex = oklchToHex(L, C, H)

       else if slotType === 'neutral-light':
         L = randomInRange(0.92, 0.97)
         C = randomInRange(0.01, 0.03)
         H = baseHue   // tiny tint of base hue
         hex = oklchToHex(L, C, H)

       else if slotType === 'neutral-dark':
         L = randomInRange(0.10, 0.18)
         C = randomInRange(0.01, 0.03)
         H = baseHue + 180   // tiny cool tint
         hex = oklchToHex(L, C, H)

       else:
         [sourceType, depth] = slotType.split('-')  // e.g. ['P1','vivid']
         hueIndex = parseInt(sourceType[1]) - 1      // P1→0, S2→1 etc.
         hues = sourceType[0] === 'P' ? primaryHues : secondaryHues
         H = hues[hueIndex] ?? primaryHues[0]        // fallback to P1 if index missing

         [lMin, lMax] = DEPTH_RANGES[depth].lRange
         [cMin, cMax] = DEPTH_RANGES[depth].cRange

         if sourceType[0] === 'S' && recipe.secondaryChromaScale !== undefined:
           cMin *= recipe.secondaryChromaScale
           cMax *= recipe.secondaryChromaScale

         if recipe.vibeConstraint:
           [lMin, lMax] = recipe.vibeConstraint.lRange
           [cMin, cMax] = recipe.vibeConstraint.cRange

         L = randomInRange(lMin, lMax)
         C = randomInRange(cMin, cMax)
         hex = oklchToHex(L, C, H)   // oklchToHex = clampChroma + formatHex via culori

       slots[i] = { id: existing[i]?.id ?? makeId(), role: ..., hex, locked: false }

  7. All-locked edge case: if every slot in existing is locked, all slots are kept
     unchanged but activeRecipe is still updated to the newly picked recipe.
     (This keeps the pill row reflecting the last picked type even if nothing regenerated.)

  8. Assign roles: brand = unlocked slot with highest C; others by position order.

  9. Return { slots, activeRecipe: recipe }
```

---

### 6. Store Changes

```typescript
// store/color.ts — ColorState additions / removals

interface ColorState {
  slots: ColorSlot[]
  // REMOVED: activeModel: HarmonyModelName | null
  activeRecipe: RecipeDef | null        // the recipe used in the last generate (or null on init)
  pinnedRecipeId: string | null         // null = pick randomly
  pinnedPrimaryType: PrimaryType | null // null = no type filter
  dataVizN: number
  stateOverrides: Partial<Record<StateColorPrefix, string>>
}

// New actions added to ColorActions:
pinRecipe(id: string | null): void        // null unpins; clears pinnedPrimaryType too
pinPrimaryType(type: PrimaryType | null): void  // null unpins; clears pinnedRecipeId too

// Updated actions:
generate(): void   // now calls new generatePalette(), stores activeRecipe
addSlot(): void    // see §7 below
```

`defaultColorState`: `activeRecipe: null`, `pinnedRecipeId: null`, `pinnedPrimaryType: null`.

**Backwards compatibility**: `activeModel` is **removed** from `ColorState`. Any existing test that accesses `state.color.activeModel` must be updated to `state.color.activeRecipe?.id ?? null`. The `HarmonyModelName` type and `HARMONY_MODELS` constant are kept in `types.ts` as `@deprecated` exports (marked with JSDoc `@deprecated`) so that existing test imports of those names do not break at the TypeScript level, but no generation code uses them.

---

### 7. `addSlot()` New Behavior

```
addSlot():
  if slots.length >= 8: return
  newCount = slots.length + 1
  recipe = activeRecipe ?? RECIPES[0]  // fallback to first recipe if none yet

  // Determine what SlotType the new slot should be
  slotType = recipe.fillOrder[slots.length]  // the next entry in fill order

  // Re-run full generatePalette with:
  //   count = newCount
  //   existing = current slots (all positions preserved, last slot is new/unlocked)
  //   pinnedRecipeId = activeRecipe?.id (keep same recipe)
  // This ensures the new slot is generated in context of the same hues as
  // the existing palette. The baseHue is NOT re-randomised —
  // store must persist baseHue from last generate() call.
```

**Implication**: add `lastBaseHue: number` to `ColorState` (initialized 0). `generate()` saves `baseHue` there. `addSlot()` passes it through so hue context is preserved.

---

### 8. UI — RecipePillRow Component

**New files:**
- `v3/src/features/generator/RecipePillRow/RecipePillRow.tsx`
- `v3/src/features/generator/RecipePillRow/RecipePillRow.module.css`

**Placement in `GeneratorPanel.tsx`**: Insert `<RecipePillRow />` as the **first child** inside the existing `<div className={styles.content}>`, immediately before `<ColorSwatches />`.

```tsx
// GeneratorPanel.tsx after change:
<div className={styles.content}>
  <RecipePillRow />     {/* ← new */}
  <ColorSwatches />
  <HarmonyHint />
  <TypographySpecimen />
</div>
```

**Pill layout:**

- One horizontally scrollable row.
- Left pill: **"Any"** — highlighted when `pinnedPrimaryType === null && pinnedRecipeId === null`. Clicking it calls `pinPrimaryType(null)`.
- Following pills: **Triadic · Analogous · Complement · Split-Comp · Mono · Tetradic · Compound · Special** — each calls `pinPrimaryType(type)` on click. Active (highlighted) when matching `pinnedPrimaryType`.
- Below the pill row (same component, secondary line): when a type is pinned, show `activeRecipe?.label ?? ''` as small dimmed text with a `↻` suffix indicating it's the current random pick within the pool. E.g.: `"Triadic + Accent ↻"`.

**HarmonyHint changes:**

`HarmonyHint.tsx` currently reads `{ slots, activeModel }` from `useColor()` and gates on `!hasLocked || !activeModel`. After this change:
- Read `{ activeRecipe }` from `useColor()` instead of `activeModel`.
- Remove the `hasLocked` guard entirely.
- Render whenever `activeRecipe !== null`.
- Display: `⬤ {activeRecipe.label}` (replacing the old model description map).
- Null state (before first generate): component returns `null`.

---

## File Change Summary

| File | Change type | Summary |
|---|---|---|
| `core/color/types.ts` | Modify | Add `SlotType`, `DepthLevel`, `HueSource`, `SpecialSlot`, `PrimaryType`, `RecipeDef`, `RECIPES` (25 entries), `DEPTH_RANGES`. Mark `HarmonyModelName` / `HARMONY_MODELS` `@deprecated`. |
| `core/color/harmony.ts` | Rewrite | Replace `generatePalette()` with recipe engine. Add `computeSlotColor()`, `applyJitter()`, `pickRecipe()`, `oklchToHex()` (already exists, keep). Remove `generateColorForPosition()`, `pickHarmonyModel()`. |
| `core/color/__tests__/harmony.test.ts` | Update | Update tests for new `generatePalette()` API. Add tests for slot fill, depth ranges, locked preservation, all-locked edge case, minCount filter. |
| `store/color.ts` | Modify | Remove `activeModel`. Add `activeRecipe`, `pinnedRecipeId`, `pinnedPrimaryType`, `lastBaseHue`. Add `pinRecipe()`, `pinPrimaryType()`. Update `generate()`, `addSlot()`. |
| `store/__tests__/` | Update | Replace `activeModel` references with `activeRecipe?.id`. |
| `features/generator/RecipePillRow/RecipePillRow.tsx` | New | Pill row component. |
| `features/generator/RecipePillRow/RecipePillRow.module.css` | New | Styles. |
| `features/generator/GeneratorPanel.tsx` | Modify | Add `<RecipePillRow />` as first child of `styles.content`. |
| `features/generator/HarmonyHint.tsx` | Modify | Read `activeRecipe` not `activeModel`. Remove `hasLocked` guard. Show `activeRecipe.label`. |

---

## What Is NOT Changing

- `ColorSlot` shape — no new fields needed.
- Shade scale generation (`scales.ts`) — untouched.
- Semantic colors, dark mode, data viz — untouched.
- Export pipeline — untouched.
- Locked-slot preservation logic — preserved exactly.
- `COLOR_ROLES` assignment logic — preserved.
- `HarmonyModelName` type and `HARMONY_MODELS` constant — kept as `@deprecated` exports, no removal.

---

## Success Criteria

1. Pressing Space produces visually distinct palettes every time — no repeated hues within a single palette.
2. All 25 recipes produce aesthetically valid palettes across all slot counts (4–8), with `minCount` recipes excluded from pool at low counts.
3. Pinning a primary type reliably limits generation to that type's recipe pool (+ special recipes always included).
4. Locked slots are always preserved regardless of recipe; `activeRecipe` updates even when all slots are locked.
5. `addSlot()` generates the new slot using `activeRecipe.fillOrder[existingCount]` at the preserved `lastBaseHue`.
6. All existing tests pass after `activeModel → activeRecipe` migration; new tests added for recipe system.
7. `tsc --noEmit` clean. Vitest suite green.
