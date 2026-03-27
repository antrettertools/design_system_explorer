import pairings from './pairings.json'
import type { FontPairing, TypeScale, TypeScaleStep } from './types'
import type { HarmonyModelName } from '../color/types'

const BASE = 16  // px

/**
 * Pick a random font pairing from the pool.
 * Optionally bias toward pairings that match the active harmony model.
 * The affinity is a soft weight — doesn't exclude pairings, just boosts them.
 */
export function pickRandomPairing(harmonyModel?: HarmonyModelName): FontPairing {
  const pool = pairings as FontPairing[]
  if (!harmonyModel) {
    return pool[Math.floor(Math.random() * pool.length)]
  }

  // Weighted selection: pairings with matching affinity get 3× weight
  const weights = pool.map(p => p.harmonyAffinity.includes(harmonyModel) ? 3 : 1)
  const total = weights.reduce((s, w) => s + w, 0)
  let r = Math.random() * total
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i]
    if (r <= 0) return pool[i]
  }
  return pool[pool.length - 1]
}

/**
 * Derive the full modular type scale from a ratio.
 * Formula: size = BASE × ratio^n
 *
 * Steps and their exponents:
 *   display: ratio^4    h1: ratio^3    h2: ratio^2    h3: ratio^1
 *   h4: ratio^0.5       body: ratio^0  small: ratio^-1  xs: ratio^-1.5  label: ratio^-2
 */
export function deriveTypeScale(opts: { ratio?: number }): TypeScale {
  const ratio = opts.ratio ?? (1.25 + Math.random() * 0.25)  // [1.25, 1.5)

  const px = (exp: number) => Math.round(BASE * Math.pow(ratio, exp) * 10) / 10

  const step = (
    exp: number,
    weight: number,
    lineHeight: number,
    letterSpacing: string,
    label: string,
  ): TypeScaleStep => ({
    size: px(exp),
    weight,
    lineHeight,
    letterSpacing,
    label,
  })

  return {
    display: step(4, 800, 1.05, '-0.04em', 'Display'),
    h1:      step(3, 800, 1.10, '-0.03em', 'H1'),
    h2:      step(2, 700, 1.15, '-0.02em', 'H2'),
    h3:      step(1, 700, 1.25, '-0.01em', 'H3'),
    h4:      step(0.5, 600, 1.35, '0', 'H4'),
    body:    step(0, 400, 1.60, '0', 'Body'),
    small:   step(-1, 400, 1.50, '0', 'Small'),
    xs:      step(-1.5, 400, 1.40, '0', 'XS'),
    label:   step(-2, 500, 1.20, '0.06em', 'Label'),
    _ratio: ratio,
  }
}
