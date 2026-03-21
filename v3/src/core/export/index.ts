export { formatCSS } from './css'
export { formatTailwindV3 } from './tailwindV3'
export { formatTailwindV4 } from './tailwindV4'
export { formatW3C } from './w3c'
export { formatSCSS } from './scss'
export { formatFigmaVariables } from './figma'
export type { ExportFormat, ExportOptions, TokenMap, TokenCasing } from './types'

import { formatCSS } from './css'
import { formatTailwindV3 } from './tailwindV3'
import { formatTailwindV4 } from './tailwindV4'
import { formatW3C } from './w3c'
import { formatSCSS } from './scss'
import { formatFigmaVariables } from './figma'
import type { ExportFormat, ExportOptions, TokenMap } from './types'

export function formatTokens(format: ExportFormat, tokens: TokenMap, opts?: ExportOptions): string {
  switch (format) {
    case 'css': return formatCSS(tokens, opts)
    case 'tailwind-v3': return formatTailwindV3(tokens, opts)
    case 'tailwind-v4': return formatTailwindV4(tokens, opts)
    case 'w3c': return formatW3C(tokens, opts)
    case 'scss': return formatSCSS(tokens, opts)
    case 'figma': return formatFigmaVariables(tokens, opts ?? {})
  }
}
