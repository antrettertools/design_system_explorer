import chroma from 'chroma-js'
import type { HarmonyModel } from './types'
import { HARMONY_MODELS } from './types'

/**
 * Given a primary hex color and a harmony model, returns an array of hex
 * colors (primary first, then derived). Saturation and lightness of the
 * primary are preserved in derived colors.
 */
export function getHarmonyColors(primaryHex: string, model: HarmonyModel): string[] {
  const base = chroma(primaryHex)
  const [h, s, l] = base.hsl()
  const hDeg = (h ?? 0) * 360

  const info = HARMONY_MODELS[model]
  const colors: string[] = [primaryHex]

  for (const angle of info.angles) {
    const newH = (((hDeg + angle) % 360) + 360) % 360
    colors.push(chroma.hsl(newH / 360, s ?? 0.6, l ?? 0.5).hex())
  }

  return colors
}

/**
 * Derive sub-brand color from the primary using a specific angle offset.
 * Used for 'auto-harmony' mode in sub-brand slots.
 */
export function deriveSubBrandColor(
  primaryHex: string,
  secondaryHex: string,
  model: HarmonyModel,
  slotIndex: number, // 0, 1, 2 for the three sub-brand slots
): string {
  const harmonyColors = getHarmonyColors(primaryHex, model)

  // Sub-brand slots pull from harmony colors beyond the primary+secondary pair
  // If harmony model doesn't have enough colors, we generate extras via equal spacing
  const extras = getEquallySpacedColors(primaryHex, 6)
  const allOptions = [...harmonyColors, ...extras]

  // Filter out colors too close to primary or secondary
  const usedHexes = [primaryHex, secondaryHex]
  const filtered = allOptions.filter((c) => !isColorTooClose(c, usedHexes))

  // Deduplicate
  const deduped = deduplicate(filtered)

  return deduped[slotIndex % deduped.length] ?? extras[slotIndex % extras.length]
}

// ── Internal helpers ──────────────────────────────────────────

function getEquallySpacedColors(hex: string, count: number): string[] {
  const [h, s, l] = chroma(hex).hsl()
  const hDeg = (h ?? 0) * 360
  const result: string[] = []

  for (let i = 1; i < count; i++) {
    const angle = (hDeg + (360 / count) * i) % 360
    result.push(chroma.hsl(angle / 360, s ?? 0.6, l ?? 0.5).hex())
  }

  return result
}

function isColorTooClose(hex: string, references: string[], threshold = 25): boolean {
  const [h] = chroma(hex).hsl()
  const hDeg = (h ?? 0) * 360

  return references.some((ref) => {
    const [rh] = chroma(ref).hsl()
    const rhDeg = (rh ?? 0) * 360
    const diff = Math.abs(hDeg - rhDeg) % 360
    return Math.min(diff, 360 - diff) < threshold
  })
}

function deduplicate(colors: string[]): string[] {
  const seen: number[] = []
  return colors.filter((c) => {
    const [h] = chroma(c).hsl()
    const hDeg = Math.round(((h ?? 0) * 360) / 15) * 15 // round to nearest 15°
    if (seen.includes(hDeg)) return false
    seen.push(hDeg)
    return true
  })
}

/**
 * Returns the minimum angular distance (in degrees) from a test hue to any
 * hue in a reference array. Used for state color derivation.
 */
export function minAngularDistance(testHueDeg: number, referenceHues: number[]): number {
  if (referenceHues.length === 0) return 180
  return Math.min(
    ...referenceHues.map((ref) => {
      const diff = Math.abs(testHueDeg - ref) % 360
      return Math.min(diff, 360 - diff)
    }),
  )
}

/**
 * From a set of candidate hue values, pick the one with the maximum
 * minimum-angular-distance to all palette hues already in use.
 * This is the core heuristic for state color derivation.
 */
export function bestCandidateHue(candidates: number[], paletteHues: number[]): number {
  let best = candidates[0]
  let bestDist = -1

  for (const candidate of candidates) {
    const dist = minAngularDistance(candidate, paletteHues)
    if (dist > bestDist) {
      bestDist = dist
      best = candidate
    }
  }

  return best
}
