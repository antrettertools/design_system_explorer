import type { DesignTokens } from '../tokens/types'

export type ExportLanguage = 'css' | 'js' | 'json' | 'scss' | 'ts'

/**
 * Every export format is a plugin implementing this interface.
 * Plugins are pure functions — they receive a typed token object
 * and return a string. No access to the store.
 */
export interface ExportPlugin {
  id: string
  label: string
  filename: string
  language: ExportLanguage
  description: string
  generate(tokens: DesignTokens): string
}
