import type { FontCategory, TypeScaleAlgorithm, ModularRatio } from '@/core/tokens/types'

export interface TypographyState {
  // ── Heading role ───────────────────────────────────────────────
  headingFamily: string
  headingCategory: FontCategory
  headingWeight: number
  headingLineHeight: number
  headingLetterSpacing: number    // em
  headingExtraAxes: Record<string, number>

  // ── Body role ──────────────────────────────────────────────────
  bodyFamily: string
  bodyCategory: FontCategory
  bodyWeight: number
  bodyLineHeight: number
  bodyLetterSpacing: number       // em
  bodyExtraAxes: Record<string, number>

  // ── Type scale (shared; bodySize is the base) ──────────────────
  fontSize: number                // body base size in px
  scaleAlgorithm: TypeScaleAlgorithm
  modularRatio: ModularRatio

  // ── Accessibility / preview ────────────────────────────────────
  customText: string
  textColor: string
  bgColor: string
}

export interface TypographyActions {
  setHeadingFont(family: string, category: FontCategory): void
  setBodyFont(family: string, category: FontCategory): void
  setHeadingWeight(weight: number): void
  setBodyWeight(weight: number): void
  setHeadingLineHeight(lh: number): void
  setBodyLineHeight(lh: number): void
  setHeadingLetterSpacing(ls: number): void
  setBodyLetterSpacing(ls: number): void
  setHeadingExtraAxis(tag: string, value: number): void
  setBodyExtraAxis(tag: string, value: number): void
  setFontSize(size: number): void
  setScaleAlgorithm(algorithm: TypeScaleAlgorithm): void
  setModularRatio(ratio: ModularRatio): void
  setCustomText(text: string): void
  setTextColor(color: string): void
  setBgColor(color: string): void
}

export const defaultTypographyState: TypographyState = {
  headingFamily: 'Fraunces',
  headingCategory: 'serif',
  headingWeight: 700,
  headingLineHeight: 1.1,
  headingLetterSpacing: -0.02,
  headingExtraAxes: {},

  bodyFamily: 'Inter',
  bodyCategory: 'sans',
  bodyWeight: 400,
  bodyLineHeight: 1.6,
  bodyLetterSpacing: 0,
  bodyExtraAxes: {},

  fontSize: 16,
  scaleAlgorithm: 'modular',
  modularRatio: 1.25,

  customText: 'The quick brown fox jumps over the lazy dog.',
  textColor: '#f0ede8',
  bgColor: '#141414',
}

export function createTypographyActions(
  set: (fn: (state: { typography: TypographyState }) => Partial<{ typography: TypographyState }>) => void,
): TypographyActions {
  const update = (patch: Partial<TypographyState>) =>
    set(s => ({ typography: { ...s.typography, ...patch } }))

  return {
    setHeadingFont: (family, category) =>
      update({ headingFamily: family, headingCategory: category, headingExtraAxes: {} }),
    setBodyFont: (family, category) =>
      update({ bodyFamily: family, bodyCategory: category, bodyExtraAxes: {} }),

    setHeadingWeight: weight => update({ headingWeight: weight }),
    setBodyWeight: weight => update({ bodyWeight: weight }),
    setHeadingLineHeight: lh => update({ headingLineHeight: lh }),
    setBodyLineHeight: lh => update({ bodyLineHeight: lh }),
    setHeadingLetterSpacing: ls => update({ headingLetterSpacing: ls }),
    setBodyLetterSpacing: ls => update({ bodyLetterSpacing: ls }),

    setHeadingExtraAxis: (tag, value) =>
      set(s => ({
        typography: {
          ...s.typography,
          headingExtraAxes: { ...s.typography.headingExtraAxes, [tag]: value },
        },
      })),
    setBodyExtraAxis: (tag, value) =>
      set(s => ({
        typography: {
          ...s.typography,
          bodyExtraAxes: { ...s.typography.bodyExtraAxes, [tag]: value },
        },
      })),

    setFontSize: size => update({ fontSize: size }),
    setScaleAlgorithm: algorithm => update({ scaleAlgorithm: algorithm }),
    setModularRatio: ratio => update({ modularRatio: ratio }),
    setCustomText: text => update({ customText: text }),
    setTextColor: color => update({ textColor: color }),
    setBgColor: color => update({ bgColor: color }),
  }
}
