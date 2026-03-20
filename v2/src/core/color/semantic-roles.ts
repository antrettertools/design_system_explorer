import { formatHex, converter, clampChroma } from 'culori'
import type { SemanticTokens } from '../tokens/types'
import type { HarmonyModel } from './types'
import { bestCandidateHue, getHarmonyColors } from './harmony'

const toOklch = converter('oklch')

export function hexToOklch(hex: string): { l: number; c: number; h: number } {
  const c = toOklch(hex)
  return { l: c?.l ?? 0.5, c: c?.c ?? 0.1, h: c?.h ?? 0 }
}

function ok(l: number, c: number, h: number): string {
  return formatHex(clampChroma({ mode: 'oklch', l, c, h })) ?? '#888888'
}

function clamp(min: number, val: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

function deriveStateHue(range: [number, number], paletteHues: number[]): number {
  const [hMin, hMax] = range
  const candidates = Array.from({ length: 5 }, (_, i) => hMin + (i / 4) * (hMax - hMin))
  return bestCandidateHue(candidates, paletteHues)
}

export function deriveSemanticTokens(
  primaryHex: string,
  secondaryHex: string | null,
  accentHexes: string[],
  harmonyModel: HarmonyModel,
): SemanticTokens {
  const { l: lp, c: cp, h: hp } = hexToOklch(primaryHex)

  const intL = clamp(0.42, lp, 0.65)

  // Secondary: use locked or derive from harmony
  let hs: number
  let ls: number
  let cs: number

  if (secondaryHex) {
    const s = hexToOklch(secondaryHex)
    hs = s.h
    ls = s.l
    cs = s.c
  } else {
    // Derive from harmony model — get second color in harmony array
    const harmonyColors = getHarmonyColors(primaryHex, harmonyModel)
    if (harmonyColors.length > 1) {
      const derived = hexToOklch(harmonyColors[1])
      hs = derived.h
      ls = derived.l
      cs = derived.c
    } else {
      // monochromatic or single result — fall back to complementary hue
      hs = ((hp + 180) % 360 + 360) % 360
      ls = lp
      cs = cp
    }
  }

  const accentL = clamp(0.42, ls, 0.65)

  const paletteHues = [hp, hs, ...accentHexes.map(h => hexToOklch(h).h)]
  const errorH   = deriveStateHue([18, 32],   paletteHues)
  const warningH = deriveStateHue([58, 78],   paletteHues)
  const successH = deriveStateHue([138, 158], paletteHues)
  const infoH    = deriveStateHue([222, 244], paletteHues)

  return {
    'interactive':              { light: ok(intL, cp, hp),                                       dark: ok(Math.min(1, intL + 0.08), cp, hp) },
    'on-interactive':           { light: ok(intL >= 0.52 ? 0.10 : 0.97, 0.01, hp),              dark: ok(intL < 0.52 ? 0.97 : 0.10, 0.01, hp) },
    'interactive-hover':        { light: ok(Math.max(0.1, intL - 0.07), cp * 1.05, hp),         dark: ok(Math.min(1, intL + 0.15), cp * 1.05, hp) },
    'interactive-container':    { light: ok(0.91, cp * 0.20, hp),                               dark: ok(0.25, cp * 0.38, hp) },
    'on-interactive-container': { light: ok(0.15, cp * 0.45, hp),                               dark: ok(0.92, cp * 0.25, hp) },
    'interactive-subtle':       { light: ok(0.96, cp * 0.07, hp),                               dark: ok(0.18, cp * 0.14, hp) },

    'accent':              { light: ok(accentL, cs, hs),                                    dark: ok(Math.min(1, accentL + 0.08), cs, hs) },
    'on-accent':           { light: ok(accentL >= 0.52 ? 0.10 : 0.97, 0.01, hs),           dark: ok(accentL < 0.52 ? 0.97 : 0.10, 0.01, hs) },
    'accent-hover':        { light: ok(Math.max(0.1, accentL - 0.07), cs * 1.05, hs),      dark: ok(Math.min(1, accentL + 0.15), cs * 1.05, hs) },
    'accent-container':    { light: ok(0.91, cs * 0.20, hs),                               dark: ok(0.25, cs * 0.38, hs) },
    'on-accent-container': { light: ok(0.15, cs * 0.45, hs),                               dark: ok(0.92, cs * 0.25, hs) },
    'accent-subtle':       { light: ok(0.96, cs * 0.07, hs),                               dark: ok(0.18, cs * 0.14, hs) },

    'background':           { light: ok(0.98, 0.010, hp), dark: ok(0.08, 0.010, hp) },
    'surface':              { light: ok(1.00, 0.000, hp), dark: ok(0.11, 0.010, hp) },
    'surface-raised':       { light: ok(0.97, 0.010, hp), dark: ok(0.14, 0.012, hp) },
    'surface-overlay':      { light: ok(0.94, 0.012, hp), dark: ok(0.17, 0.015, hp) },
    'on-background':        { light: ok(0.13, 0.010, hp), dark: ok(0.93, 0.008, hp) },
    'on-surface':           { light: ok(0.20, 0.010, hp), dark: ok(0.88, 0.008, hp) },
    'on-surface-subtle':    { light: ok(0.48, 0.008, hp), dark: ok(0.60, 0.008, hp) },
    'on-surface-disabled':  { light: ok(0.68, 0.005, hp), dark: ok(0.38, 0.005, hp) },
    'border':               { light: ok(0.86, 0.010, hp), dark: ok(0.22, 0.010, hp) },
    'border-strong':        { light: ok(0.72, 0.015, hp), dark: ok(0.35, 0.015, hp) },
    'scrim':                { light: 'rgba(0,0,0,0.48)',  dark: 'rgba(0,0,0,0.48)' },
    'shadow-color':         { light: ok(0.15, cp * 0.30, hp), dark: ok(0.05, cp * 0.20, hp) },
    'inverse-surface':      { light: ok(0.20, 0.015, hp), dark: ok(0.90, 0.010, hp) },
    'on-inverse-surface':   { light: ok(0.92, 0.008, hp), dark: ok(0.18, 0.010, hp) },

    'error':               { light: ok(0.50, 0.20, errorH),   dark: ok(0.68, 0.18, errorH) },
    'on-error':            { light: ok(0.98, 0.02, errorH),   dark: ok(0.10, 0.02, errorH) },
    'error-container':     { light: ok(0.92, 0.08, errorH),   dark: ok(0.22, 0.14, errorH) },
    'on-error-container':  { light: ok(0.14, 0.12, errorH),   dark: ok(0.90, 0.06, errorH) },

    'warning':              { light: ok(0.50, 0.20, warningH), dark: ok(0.68, 0.18, warningH) },
    'on-warning':           { light: ok(0.98, 0.02, warningH), dark: ok(0.10, 0.02, warningH) },
    'warning-container':    { light: ok(0.92, 0.08, warningH), dark: ok(0.22, 0.14, warningH) },
    'on-warning-container': { light: ok(0.14, 0.12, warningH), dark: ok(0.90, 0.06, warningH) },

    'success':              { light: ok(0.50, 0.20, successH), dark: ok(0.68, 0.18, successH) },
    'on-success':           { light: ok(0.98, 0.02, successH), dark: ok(0.10, 0.02, successH) },
    'success-container':    { light: ok(0.92, 0.08, successH), dark: ok(0.22, 0.14, successH) },
    'on-success-container': { light: ok(0.14, 0.12, successH), dark: ok(0.90, 0.06, successH) },

    'info':              { light: ok(0.50, 0.20, infoH),    dark: ok(0.68, 0.18, infoH) },
    'on-info':           { light: ok(0.98, 0.02, infoH),    dark: ok(0.10, 0.02, infoH) },
    'info-container':    { light: ok(0.92, 0.08, infoH),    dark: ok(0.22, 0.14, infoH) },
    'on-info-container': { light: ok(0.14, 0.12, infoH),    dark: ok(0.90, 0.06, infoH) },
  }
}
