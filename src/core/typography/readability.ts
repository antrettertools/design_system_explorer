import type { FontDefinition, FontCategory } from '../tokens/types'

export interface ReadabilityScore {
  total: number          // 0–100
  label: string
  description: string
  breakdown: ReadabilityBreakdown
}

export interface ReadabilityBreakdown {
  weight: number
  category: number
  lineHeight: number
  letterSpacing: number
  size: number
  variableFontBonus: number
}

/**
 * Computes a readability score (0–100) for the current typography settings.
 *
 * This is a heuristic model based on established typographic principles,
 * not a rigorous psychophysical measurement. It serves as a useful guide,
 * not a guarantee.
 *
 * Scoring weights:
 * - Font weight suitability for body text: max 20pts
 * - Font category suitability: max 12pts
 * - Line height optimality: max 15pts
 * - Letter spacing: max 8pts
 * - Base size adequacy: max 10pts
 * - Variable font optical tuning bonus: max 5pts
 *
 * Total maximum: 70 base points + up to 30 from optimal combinations.
 * Score is normalized to 0–100.
 */
export function computeReadabilityScore(params: {
  font: FontDefinition
  weight: number
  size: number
  lineHeight: number
  letterSpacing: number
}): ReadabilityScore {
  const { font, weight, size, lineHeight, letterSpacing } = params
  const breakdown: ReadabilityBreakdown = {
    weight: scoreWeight(weight),
    category: scoreCategory(font.category),
    lineHeight: scoreLineHeight(lineHeight),
    letterSpacing: scoreLetterSpacing(letterSpacing),
    size: scoreSize(size),
    variableFontBonus: font.variable ? 5 : 0,
  }

  const raw =
    breakdown.weight +
    breakdown.category +
    breakdown.lineHeight +
    breakdown.letterSpacing +
    breakdown.size +
    breakdown.variableFontBonus

  // Max possible = 20 + 12 + 15 + 8 + 10 + 5 = 70
  // Normalize to 0–100
  const total = Math.min(100, Math.max(0, Math.round((raw / 70) * 100)))

  return {
    total,
    ...labelForScore(total, font.category),
    breakdown,
  }
}

// ── Scoring functions ──────────────────────────────────────────

function scoreWeight(weight: number): number {
  // Body text reads best at 300–500. Heavy weights reduce readability.
  if (weight >= 300 && weight <= 500) return 20
  if (weight > 500 && weight <= 600) return 14
  if (weight > 600 && weight <= 700) return 8
  if (weight < 300) return 10  // too thin for small sizes
  return 2  // 800+ — display only
}

function scoreCategory(category: FontCategory): number {
  // Serif fonts have a slight edge for long-form reading (serifs guide the eye)
  // Sans-serif is excellent for screen UI
  // Mono fonts hurt reading speed for prose
  if (category === 'serif') return 12
  if (category === 'sans') return 10
  return 2  // mono: suited for code, not prose
}

function scoreLineHeight(lh: number): number {
  // Optimal range for body text: 1.4–1.8
  if (lh >= 1.45 && lh <= 1.75) return 15
  if (lh >= 1.35 && lh < 1.45) return 10
  if (lh > 1.75 && lh <= 2.0) return 8
  if (lh < 1.35) return 2   // too tight, lines run together
  return 4  // > 2.0: too airy, loses connection
}

function scoreLetterSpacing(ls: number): number {
  // Body text reads best near 0. Very tight or wide tracking hurts.
  const abs = Math.abs(ls)
  if (abs <= 0.02) return 8
  if (abs <= 0.05) return 5
  if (abs <= 0.1) return 2
  return 0
}

function scoreSize(size: number): number {
  // Comfortable reading size for screens: 15–20px
  if (size >= 15 && size <= 20) return 10
  if (size >= 13 && size < 15) return 6
  if (size > 20 && size <= 24) return 7
  if (size < 13) return 2
  return 3
}

// ── Labels ────────────────────────────────────────────────────

function labelForScore(
  total: number,
  category: FontCategory,
): { label: string; description: string } {
  if (category === 'mono') {
    return {
      label: 'Optimized for code',
      description: 'Monospace fonts are ideal for code, tabular data, and terminal UI.',
    }
  }

  if (total >= 88) {
    return {
      label: 'Excellent readability',
      description: 'Ideal for long-form content and body text at any length.',
    }
  }
  if (total >= 72) {
    return {
      label: 'Good readability',
      description: 'Works well for UI text and medium-length passages.',
    }
  }
  if (total >= 55) {
    return {
      label: 'Moderate readability',
      description: 'Best for headings, labels, or short copy. Adjust weight or line height.',
    }
  }
  return {
    label: 'Display use only',
    description:
      'High impact for display sizes. Not recommended for body text — consider increasing size or reducing weight.',
  }
}
