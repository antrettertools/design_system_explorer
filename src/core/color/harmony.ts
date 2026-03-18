import chroma from 'chroma-js'
import type { HarmonyModel } from './types'
import { HARMONY_MODELS } from './types'

/**
 * chroma-js convention (important):
 *   chroma(hex).hsl()      → returns [h, s, l] where h is in 0–360 DEGREES
 *   chroma.hsl(h, s, l)    → expects h in 0–360 DEGREES
 *
 * Do NOT multiply/divide by 360 — h is already in degrees on both sides.
 */

/**
 * Given a primary hex color and a harmony model, returns an array of hex
 * colors (primary first, then derived). Saturation and lightness of the
 * primary are preserved in derived colors.
 */
export function getHarmonyColors(primaryHex: string, model: HarmonyModel): string[] {
  const base = chroma(primaryHex)
  const [h, s, l] = base.hsl()
  const hDeg = h ?? 0   // already 0-360 degrees

  const info = HARMONY_MODELS[model]
  const colors: string[] = [primaryHex]

  for (const angle of info.angles) {
    const newH = ((hDeg + angle) % 360 + 360) % 360
    colors.push(chroma.hsl(newH, s ?? 0.6, l ?? 0.5).hex())
  }

  return colors
}

/**
 * Derive a sub-brand color for a given slot.
 * - auto-harmony: pulls from harmony positions derived from primaryHex
 * - auto-secondary: pulls from harmony positions derived from secondaryHex
 * Skips colors too close to the two brand colors, then deduplicates.
 */
export function deriveSubBrandColor(
  sourceHex: string,
  otherBrandHex: string,
  model: HarmonyModel,
  slotIndex: number,
): string {
  const harmonyColors = getHarmonyColors(sourceHex, model)
  // Also generate equally-spaced extras so there are always enough candidates
  const extras = getEquallySpacedColors(sourceHex, 8)
  const allOptions = [...harmonyColors.slice(1), ...extras]

  // Filter out colors too close to either brand color
  const usedHexes = [sourceHex, otherBrandHex]
  const filtered = allOptions.filter((c) => !isColorTooClose(c, usedHexes))

  const deduped = deduplicate(filtered)

  // Each slot gets a distinct entry
  if (deduped.length === 0) return extras[slotIndex % extras.length]
  return deduped[slotIndex % deduped.length]
}

// ── Internal helpers ──────────────────────────────────────────

function getEquallySpacedColors(hex: string, count: number): string[] {
  const [h, s, l] = chroma(hex).hsl()
  const hDeg = h ?? 0   // already 0-360 degrees
  const result: string[] = []

  for (let i = 1; i <= count; i++) {
    const newH = ((hDeg + (360 / count) * i) % 360 + 360) % 360
    result.push(chroma.hsl(newH, s ?? 0.6, l ?? 0.5).hex())
  }

  return result
}

function isColorTooClose(hex: string, references: string[], threshold = 30): boolean {
  const [h] = chroma(hex).hsl()
  const hDeg = h ?? 0

  return references.some((ref) => {
    const [rh] = chroma(ref).hsl()
    const rhDeg = rh ?? 0
    const diff = Math.abs(hDeg - rhDeg) % 360
    return Math.min(diff, 360 - diff) < threshold
  })
}

function deduplicate(colors: string[]): string[] {
  const seen: number[] = []
  return colors.filter((c) => {
    const [h] = chroma(c).hsl()
    const bucket = Math.round((h ?? 0) / 15) * 15  // round to nearest 15°
    if (seen.includes(bucket)) return false
    seen.push(bucket)
    return true
  })
}

/**
 * Returns the minimum angular distance (in degrees) from a test hue to any
 * hue in a reference array.
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
