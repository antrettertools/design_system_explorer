export type ExportFormat = 'css' | 'tailwind-v3' | 'tailwind-v4' | 'w3c' | 'scss' | 'figma'

export type TokenCasing = 'kebab-case' | 'camelCase' | 'snake_case'

export interface ExportOptions {
  prefix?: string        // e.g. "ds-", "app-", or ""
  casing?: TokenCasing   // default: kebab-case
  layers?: {
    primitives?: boolean   // shade scale values (default: true)
    semantic?: boolean     // role-based tokens (default: true)
    typography?: boolean   // font + scale tokens (default: true)
  }
}

export interface TokenMap {
  light: Record<string, string>
  dark: Record<string, string>
}
