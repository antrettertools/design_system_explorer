import type { PrimitiveTokens, SemanticTokens, ComponentTokens } from '@/core/tokens/types'
import type { ArchetypeId } from '@/core/personality/types'

export type ExportLanguage = 'css' | 'js' | 'json' | 'scss' | 'ts'

export interface ExportConfig {
  darkMode: 'none' | 'data-theme' | 'media-query' | 'both'
  colorFormat: 'oklch' | 'hex' | 'hsl' | 'rgb'
  prefix: string
  namingConvention: 'kebab-case' | 'camelCase' | 'snake_case'
  layers: { primitives: boolean; semantic: boolean; component: boolean }
}

export const DEFAULT_EXPORT_CONFIG: ExportConfig = {
  darkMode: 'data-theme',
  colorFormat: 'hex',
  prefix: '',
  namingConvention: 'kebab-case',
  layers: { primitives: true, semantic: true, component: false },
}

export interface ExportInput {
  primitive: PrimitiveTokens
  semantic: SemanticTokens
  component: ComponentTokens
  meta: {
    archetype: ArchetypeId
    lockedColors: string[]
    fontPairing: { heading: string; body: string }
  }
  config: ExportConfig
}

export interface ExportPlugin {
  id: string
  label: string
  filename: string
  language: ExportLanguage
  description: string
  generate(input: ExportInput): string
}
