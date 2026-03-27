import { formatHex, clampChroma, converter } from 'culori'
import { HARMONY_MODELS, COLOR_ROLES } from './types'
import type { HarmonyModelName, ColorSlot } from './types'

const toOklch = converter('oklch')

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function randomHue(): number {
  return Math.random() * 360
}

export function pickHarmonyModel(): HarmonyModelName {
  const entries = Object.entries(HARMONY_MODELS) as [HarmonyModelName, typeof HARMONY_MODELS[HarmonyModelName]][]
  const totalWeight = entries.reduce((sum, [, m]) => sum + m.weight, 0)
  let r = Math.random() * totalWeight
  for (const [name, model] of entries) {
    r -= model.weight
    if (r <= 0) return name
  }
  return entries[entries.length - 1][0]
}

function oklchToHex(l: number, c: number, h: number): string {
  const clamped = clampChroma({ mode: 'oklch', l, c, h }, 'oklch')
  return formatHex(clamped) ?? '#888888'
}

function generateColorForPosition(
  hue: number,
  model: typeof HARMONY_MODELS[HarmonyModelName],
  positionIndex: number,
): string {
  const envelope = model.positionEnvelopes?.[positionIndex]
  const lRange = envelope?.lRange ?? model.lRange
  const cRange = envelope?.cRange ?? model.cRange
  const l = randomInRange(lRange[0], lRange[1])
  const c = randomInRange(cRange[0], cRange[1])
  return oklchToHex(l, c, hue)
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 10)
}

interface GenerateOptions {
  count?: number
  existing?: ColorSlot[]
  forceModel?: HarmonyModelName
}

export function generatePalette(opts: GenerateOptions = {}): ColorSlot[] {
  const count = opts.count ?? 4
  const existing = opts.existing ?? []

  // Determine active model:
  // If any slot is locked, reuse the same model (encoded in slot.id prefix — but here
  // we track it separately). If forceModel given, use it. Otherwise pick randomly.
  const model = opts.forceModel ?? pickHarmonyModel()
  const modelDef = HARMONY_MODELS[model]

  const baseHue = randomHue()

  // Build hue positions for N slots
  // For monochromatic: all same hue, dramatically different L
  const huePositions: number[] = []
  for (let i = 0; i < count; i++) {
    if (model === 'monochromatic') {
      huePositions.push(baseHue)
    } else {
      const offset = modelDef.hueOffsets[i] ?? (modelDef.hueOffsets[i % modelDef.hueOffsets.length] ?? 0)
      huePositions.push((baseHue + offset + 360) % 360)
    }
  }

  // For monochromatic: spread L dramatically across positions
  function monochromaticL(index: number, total: number): number {
    const [lMin, lMax] = modelDef.lRange
    return lMin + (index / Math.max(total - 1, 1)) * (lMax - lMin)
  }

  const slots: ColorSlot[] = []
  for (let i = 0; i < count; i++) {
    const existingSlot = existing[i]
    if (existingSlot?.locked) {
      slots.push({ ...existingSlot })
      continue
    }

    let hex: string
    if (model === 'monochromatic') {
      const l = monochromaticL(i, count)
      const c = randomInRange(modelDef.cRange[0], modelDef.cRange[1])
      hex = oklchToHex(l, c, huePositions[i])
    } else {
      hex = generateColorForPosition(huePositions[i], modelDef, i)
    }

    const role = COLOR_ROLES[Math.min(i, COLOR_ROLES.length - 1)]
    slots.push({
      id: existingSlot?.id ?? makeId(),
      role,
      hex,
      locked: false,
    })
  }

  // Assign brand = highest chroma among unlocked slots
  // (locked slots keep their current role)
  const unlocked = slots.filter(s => !s.locked)
  if (unlocked.length > 0) {
    let maxC = -1
    let brandIdx = -1
    for (const slot of unlocked) {
      const oklch = toOklch(slot.hex)
      const c = oklch?.c ?? 0
      if (c > maxC) { maxC = c; brandIdx = slots.indexOf(slot) }
    }
    if (brandIdx >= 0) {
      // Reassign roles based on position
      slots.forEach((slot, i) => {
        if (!slot.locked) {
          slot.role = COLOR_ROLES[Math.min(i, COLOR_ROLES.length - 1)]
        }
      })
      // Swap brand to position 0 if not already there
      if (brandIdx !== 0 && !slots[0].locked) {
        const tmp = slots[0]
        slots[0] = slots[brandIdx]
        slots[brandIdx] = tmp
        slots[0].role = 'brand'
        if (slots[brandIdx]) slots[brandIdx].role = COLOR_ROLES[brandIdx] as typeof slots[brandIdx]['role']
      }
    }
  }

  return slots
}

export function getActiveModel(slots: ColorSlot[]): HarmonyModelName | null {
  // Returns null when nothing is locked (cold random mode)
  void slots
  return null
  // In practice the model is stored in the Zustand store alongside the palette
}
