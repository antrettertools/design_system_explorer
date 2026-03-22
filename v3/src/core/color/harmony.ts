import { formatHex, clampChroma, converter } from 'culori'
import { RECIPES } from './recipes'
import { DEPTH_RANGES, COLOR_ROLES } from './types'
import type { ColorSlot, RecipeDef, PrimaryType, SlotType } from './types'

// Re-export deprecated helpers so old imports don't break at runtime
export { pickHarmonyModel } from './harmonyLegacy'

const toOklch = converter('oklch')

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function jitter(degrees: number): number {
  return (Math.random() - 0.5) * 2 * degrees
}

function oklchToHex(l: number, c: number, h: number): string {
  const clamped = clampChroma({ mode: 'oklch', l, c, h }, 'oklch')
  return formatHex(clamped) ?? '#888888'
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 10)
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export interface GenerateOptions {
  count?: number
  existing?: ColorSlot[]
  pinnedRecipeId?: string | null
  pinnedPrimaryType?: PrimaryType | null
  forceBaseHue?: number
}

export interface GenerateResult {
  slots: ColorSlot[]
  recipe: RecipeDef
  baseHue: number
}

function pickRecipe(
  pinnedRecipeId: string | null | undefined,
  pinnedPrimaryType: PrimaryType | null | undefined,
  count: number,
): RecipeDef {
  if (pinnedRecipeId) {
    return RECIPES.find(r => r.id === pinnedRecipeId) ?? RECIPES[0]
  }
  let pool = RECIPES.filter(r => (r.minCount ?? 0) <= count)
  if (pinnedPrimaryType) {
    pool = pool.filter(r => r.primaryType === pinnedPrimaryType || r.primaryType === 'special')
  }
  if (pool.length === 0) pool = RECIPES.filter(r => (r.minCount ?? 0) <= count)
  return pool[Math.floor(Math.random() * pool.length)]
}

function computeSlotColor(
  slotType: SlotType,
  i: number,
  count: number,
  primaryHues: number[],
  secondaryHues: number[],
  recipe: RecipeDef,
  baseHue: number,
): string {
  // monoLadder: override everything with evenly-spaced L
  if (recipe.monoLadder) {
    const L = lerp(0.10, 0.90, count > 1 ? i / (count - 1) : 0.5)
    const C = randomInRange(0.04, 0.18)
    const H = (primaryHues[0] + i * 3) % 360
    return oklchToHex(L, C, H)
  }

  if (slotType === 'neutral-light') {
    // vibeConstraint overrides L range even for neutral slots (e.g. pastel-cloud)
    const [lMin, lMax] = recipe.vibeConstraint ? recipe.vibeConstraint.lRange : [0.92, 0.97]
    const [cMin, cMax] = recipe.vibeConstraint ? recipe.vibeConstraint.cRange : [0.01, 0.03]
    return oklchToHex(randomInRange(lMin, lMax), randomInRange(cMin, cMax), baseHue)
  }

  if (slotType === 'neutral-dark') {
    return oklchToHex(
      randomInRange(0.10, 0.18),
      randomInRange(0.01, 0.03),
      (baseHue + 180) % 360,
    )
  }

  // e.g. 'P1-vivid', 'S2-pale'
  const dashIdx = slotType.indexOf('-')
  const sourceStr = slotType.slice(0, dashIdx)   // 'P1', 'S2', …
  const depthStr = slotType.slice(dashIdx + 1) as 'pale' | 'vivid' | 'deep'
  const sourceFamily = sourceStr[0]  // 'P' or 'S'
  const sourceIdx = parseInt(sourceStr[1], 10) - 1  // P1→0, S2→1

  const hues = sourceFamily === 'P' ? primaryHues : secondaryHues
  const H = hues[sourceIdx] ?? primaryHues[0]

  const depthRange = DEPTH_RANGES[depthStr]
  let lMin = depthRange.lRange[0]
  let lMax = depthRange.lRange[1]
  let cMin = depthRange.cRange[0]
  let cMax = depthRange.cRange[1]

  if (sourceFamily === 'S' && recipe.secondaryChromaScale !== undefined) {
    cMin *= recipe.secondaryChromaScale
    cMax *= recipe.secondaryChromaScale
  }

  if (recipe.vibeConstraint) {
    lMin = recipe.vibeConstraint.lRange[0]
    lMax = recipe.vibeConstraint.lRange[1]
    cMin = recipe.vibeConstraint.cRange[0]
    cMax = recipe.vibeConstraint.cRange[1]
  }

  return oklchToHex(randomInRange(lMin, lMax), randomInRange(cMin, cMax), H)
}

export function generatePalette(opts: GenerateOptions): GenerateResult {
  const count = opts.count ?? 4
  const existing = opts.existing ?? []

  const recipe = pickRecipe(opts.pinnedRecipeId, opts.pinnedPrimaryType, count)

  // Base hue: forced (addSlot continuity) or random, with vibe range override
  let baseHue: number
  if (opts.forceBaseHue !== undefined) {
    baseHue = opts.forceBaseHue
  } else if (recipe.vibeConstraint?.hueRange) {
    const [hMin, hMax] = recipe.vibeConstraint.hueRange
    baseHue = randomInRange(hMin, hMax)
  } else {
    baseHue = Math.random() * 360
  }

  // Compute hues (all relative to baseHue)
  const primaryHues = recipe.primaryHueOffsets.map(
    offset => (baseHue + offset + jitter(6)) % 360,
  )
  const secondaryHues = (recipe.secondaryHueOffsets ?? []).map(
    offset => (baseHue + offset + jitter(6)) % 360,
  )

  const effectiveFillOrder = recipe.fillOrder.slice(0, count)

  const slots: ColorSlot[] = []
  for (let i = 0; i < count; i++) {
    const existingSlot = existing[i]
    if (existingSlot?.locked) {
      slots.push({ ...existingSlot })
      continue
    }

    const slotType = effectiveFillOrder[i] ?? 'P1-vivid'
    const hex = computeSlotColor(slotType, i, count, primaryHues, secondaryHues, recipe, baseHue)
    const role = COLOR_ROLES[Math.min(i, COLOR_ROLES.length - 1)]
    slots.push({
      id: existingSlot?.id ?? makeId(),
      role,
      hex,
      locked: false,
    })
  }

  // Assign brand = unlocked slot with highest chroma
  const unlocked = slots.filter(s => !s.locked)
  if (unlocked.length > 0) {
    let maxC = -1
    let brandIdx = -1
    for (const slot of unlocked) {
      const oklch = toOklch(slot.hex)
      const c = oklch?.c ?? 0
      if (c > maxC) { maxC = c; brandIdx = slots.indexOf(slot) }
    }
    if (brandIdx >= 0 && brandIdx !== 0 && !slots[0].locked) {
      // de-brand any slot that was previously brand (e.g. a locked slot from a prior generation)
      for (let j = 0; j < slots.length; j++) {
        if (j !== brandIdx && slots[j].role === 'brand') {
          slots[j] = { ...slots[j], role: COLOR_ROLES[Math.min(1, COLOR_ROLES.length - 1)] }
        }
      }
      const tmp = slots[0]
      slots[0] = slots[brandIdx]
      slots[brandIdx] = tmp
      slots[0].role = 'brand'
      slots[brandIdx].role = COLOR_ROLES[Math.min(brandIdx, COLOR_ROLES.length - 1)]
    } else if (brandIdx >= 0) {
      // de-brand any slot that was previously brand (e.g. a locked slot from a prior generation)
      for (let j = 0; j < slots.length; j++) {
        if (j !== brandIdx && slots[j].role === 'brand') {
          slots[j] = { ...slots[j], role: COLOR_ROLES[Math.min(1, COLOR_ROLES.length - 1)] }
        }
      }
      slots[brandIdx].role = 'brand'
    }
    // Assign remaining roles by position
    slots.forEach((slot, i) => {
      if (!slot.locked && slot.role !== 'brand') {
        slot.role = COLOR_ROLES[Math.min(i, COLOR_ROLES.length - 1)]
      }
    })
  }

  return { slots, recipe, baseHue }
}
