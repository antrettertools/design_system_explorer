import chroma from 'chroma-js'
import { bestCandidateHue } from './harmony'
import type { StateColors } from '../tokens/types'

/**
 * Derives semantic state colors (success, warning, error, info) from a
 * set of palette hues already in use.
 *
 * Algorithm: for each state semantic role, we have a set of candidate
 * hue values (within the typical visual range for that role). We pick
 * the candidate that maximizes the minimum angular distance from all
 * palette hues already in use. This ensures state colors are visually
 * distinct from the brand palette.
 *
 * All derived colors use fixed saturation (0.68–0.85) and lightness
 * (0.46–0.52) tuned to be legible on both dark and light backgrounds.
 */
export function deriveStateColors(paletteHexes: string[]): StateColors {
  const paletteHues = paletteHexes.map((hex) => {
    const [h] = chroma(hex).hsl()
    return (h ?? 0) * 360
  })

  const successH = bestCandidateHue([120, 135, 150, 110, 165, 142], paletteHues)
  const warningH = bestCandidateHue([40, 45, 35, 50, 30, 38], paletteHues)
  const errorH = bestCandidateHue([0, 5, 355, 10, 350, 3], paletteHues)
  const infoH = bestCandidateHue([210, 200, 220, 195, 225, 215], paletteHues)

  return {
    success: chroma.hsl(successH / 360, 0.68, 0.46).hex(),
    warning: chroma.hsl(warningH / 360, 0.85, 0.50).hex(),
    error: chroma.hsl(errorH / 360, 0.72, 0.50).hex(),
    info: chroma.hsl(infoH / 360, 0.65, 0.50).hex(),
  }
}

/**
 * Returns the hue of a hex color in degrees [0, 360).
 */
export function getHueDeg(hex: string): number {
  const [h] = chroma(hex).hsl()
  return ((h ?? 0) * 360 + 360) % 360
}

/**
 * Returns the angular distance (in degrees) between a state color and the
 * nearest palette color. Used for UI validation display.
 */
export function stateColorDistanceFromPalette(stateHex: string, paletteHexes: string[]): number {
  if (paletteHexes.length === 0) return 180
  const stateH = getHueDeg(stateHex)
  return Math.min(
    ...paletteHexes.map((hex) => {
      const h = getHueDeg(hex)
      const diff = Math.abs(stateH - h) % 360
      return Math.min(diff, 360 - diff)
    }),
  )
}
