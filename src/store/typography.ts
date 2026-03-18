import type { FontCategory, TypeScaleAlgorithm, ModularRatio } from '@/core/tokens/types'

export interface TypographyState {
  fontFamily: string
  fontCategory: FontCategory
  fontWeight: number
  fontSize: number         // px
  lineHeight: number
  letterSpacing: number    // em
  extraAxes: Record<string, number>
  scaleAlgorithm: TypeScaleAlgorithm
  modularRatio: ModularRatio
  customText: string
  textColor: string        // for contrast checker
  bgColor: string          // for contrast checker
}

export interface TypographyActions {
  setFont(family: string, category: FontCategory): void
  setFontWeight(weight: number): void
  setFontSize(size: number): void
  setLineHeight(lh: number): void
  setLetterSpacing(ls: number): void
  setExtraAxis(tag: string, value: number): void
  setScaleAlgorithm(algorithm: TypeScaleAlgorithm): void
  setModularRatio(ratio: ModularRatio): void
  setCustomText(text: string): void
  setTextColor(color: string): void
  setBgColor(color: string): void
}

export const defaultTypographyState: TypographyState = {
  fontFamily: 'Inter',
  fontCategory: 'sans',
  fontWeight: 400,
  fontSize: 16,
  lineHeight: 1.6,
  letterSpacing: 0,
  extraAxes: {},
  scaleAlgorithm: 'linear',
  modularRatio: 1.25,
  customText: 'The quick brown fox jumps over the lazy dog.',
  textColor: '#f0ede8',
  bgColor: '#141414',
}

export function createTypographyActions(
  set: (fn: (state: { typography: TypographyState }) => Partial<{ typography: TypographyState }>) => void,
): TypographyActions {
  const update = (patch: Partial<TypographyState>) =>
    set((s) => ({ typography: { ...s.typography, ...patch } }))

  return {
    setFont: (family, category) => update({ fontFamily: family, fontCategory: category, extraAxes: {} }),
    setFontWeight: (weight) => update({ fontWeight: weight }),
    setFontSize: (size) => update({ fontSize: size }),
    setLineHeight: (lh) => update({ lineHeight: lh }),
    setLetterSpacing: (ls) => update({ letterSpacing: ls }),
    setExtraAxis: (tag, value) =>
      set((s) => ({
        typography: {
          ...s.typography,
          extraAxes: { ...s.typography.extraAxes, [tag]: value },
        },
      })),
    setScaleAlgorithm: (algorithm) => update({ scaleAlgorithm: algorithm }),
    setModularRatio: (ratio) => update({ modularRatio: ratio }),
    setCustomText: (text) => update({ customText: text }),
    setTextColor: (color) => update({ textColor: color }),
    setBgColor: (color) => update({ bgColor: color }),
  }
}
