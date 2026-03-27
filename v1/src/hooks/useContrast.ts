import { useMemo } from 'react'
import { checkContrast } from '@/core/color/contrast'
import type { ContrastResult } from '@/core/color/contrast'

export function useContrast(fg: string, bg: string): ContrastResult {
  return useMemo(() => checkContrast(fg, bg), [fg, bg])
}
