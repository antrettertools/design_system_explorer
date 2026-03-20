import { formatHex, converter, clampChroma } from 'culori'
import type { HarmonyModel } from './types'
import { HARMONY_MODELS } from './types'

export function getHarmonyColors(primaryHex: string, model: HarmonyModel): string[] {
  const toOklch = converter('oklch')
  const base = toOklch(primaryHex)
  if (!base) return [primaryHex]
  const info = HARMONY_MODELS[model]
  const colors: string[] = [primaryHex]
  for (const angle of info.angles) {
    const h = (((base.h ?? 0) + angle) % 360 + 360) % 360
    const color = clampChroma({ mode: 'oklch', l: base.l, c: base.c, h })
    colors.push(formatHex(color) ?? primaryHex)
  }
  return colors
}

export function minAngularDistance(testHue: number, refs: number[]): number {
  if (refs.length === 0) return 180
  return Math.min(...refs.map(r => { const d = Math.abs(testHue - r) % 360; return Math.min(d, 360 - d) }))
}

export function bestCandidateHue(candidates: number[], paletteHues: number[]): number {
  let best = candidates[0]
  let bestDist = -1
  for (const c of candidates) {
    const d = minAngularDistance(c, paletteHues)
    if (d > bestDist) { bestDist = d; best = c }
  }
  return best
}
