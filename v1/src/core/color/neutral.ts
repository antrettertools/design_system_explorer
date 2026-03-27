import chroma from 'chroma-js'
import { SHADE_STEPS } from '../tokens/types'
import type { ShadeScale, ShadeStep } from '../tokens/types'
import type { NeutralTint } from './types'

/**
 * Generates an 11-step neutral scale (50→950).
 *
 * The tint option controls how much of the primary hue bleeds into the grays:
 * - 'pure':   true neutral (saturation = 0)
 * - 'warm':   slight amber/yellow tint (H≈30°, S≈4%)
 * - 'cool':   slight blue tint (H≈220°, S≈6%)
 * - 'tinted': uses the primary hue at moderate saturation (S≈9%)
 *
 * Lightness is computed from 0.97 (step 50) down to 0.04 (step 950)
 * with a gentle curve that matches perceptual expectations.
 */
export function makeNeutralScale(primaryHex: string, tint: NeutralTint): ShadeScale {
  const [primaryH] = chroma(primaryHex).hsl()
  const primaryHDeg = (primaryH ?? 0) * 360

  const tintConfig: Record<NeutralTint, { hue: number; sat: number }> = {
    pure: { hue: 0, sat: 0 },
    warm: { hue: 30, sat: 0.04 },
    cool: { hue: 220, sat: 0.06 },
    tinted: { hue: primaryHDeg, sat: 0.09 },
  }

  const { hue, sat } = tintConfig[tint]

  // Lightness curve: 0.97 at step 50 → 0.04 at step 950
  const lightnessAt = (step: ShadeStep): number => {
    // Map step [50..950] to t [0..1]
    const t = (step - 50) / 900
    // Gentle easing: slightly compressed in midrange
    return 0.97 - t * 0.93
  }

  const scale: Partial<ShadeScale> = {}
  for (const step of SHADE_STEPS) {
    const l = lightnessAt(step)
    scale[step] = chroma.hsl(hue / 360, sat, l).hex()
  }

  return scale as ShadeScale
}
