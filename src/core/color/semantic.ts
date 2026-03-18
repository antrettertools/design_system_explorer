import chroma from 'chroma-js'
import { bestCandidateHue } from './harmony'
import type { StateColors } from '../tokens/types'

/**
 * Derives semantic state colors (success, warning, error, info) from a
 * set of palette hues already in use.
 *
 * Algorithm: for each role we have candidate hues within the typical visual
 * range (green for success, amber for warning, red for error, blue for info).
 * We pick the candidate that maximizes minimum angular distance from all
 * palette hues already in use — ensuring state colors are visually distinct.
 *
 * chroma-js convention: h from .hsl() is 0-360 degrees; chroma.hsl() also
 * expects 0-360 degrees. No * 360 / / 360 conversions needed.
 */
export function deriveStateColors(paletteHexes: string[]): StateColors {
  // Extract hues in 0-360 degrees — chroma .hsl() already returns degrees
  const paletteHues = paletteHexes.map((hex) => {
    const [h] = chroma(hex).hsl()
    return h ?? 0
  })

  const successH = bestCandidateHue([120, 135, 150, 110, 165, 142, 128], paletteHues)
  const warningH = bestCandidateHue([40, 45, 35, 50, 30, 38, 48], paletteHues)
  const errorH   = bestCandidateHue([0, 5, 355, 10, 350, 3, 358], paletteHues)
  const infoH    = bestCandidateHue([210, 200, 220, 195, 225, 215, 205], paletteHues)

  return {
    success: chroma.hsl(successH, 0.68, 0.46).hex(),
    warning: chroma.hsl(warningH, 0.85, 0.50).hex(),
    error:   chroma.hsl(errorH,   0.72, 0.50).hex(),
    info:    chroma.hsl(infoH,    0.65, 0.50).hex(),
  }
}

/**
 * Returns the hue of a hex color in degrees [0, 360).
 */
export function getHueDeg(hex: string): number {
  const [h] = chroma(hex).hsl()
  return ((h ?? 0) + 360) % 360
}
