import type { ExportPlugin, ExportInput } from '../plugin'

export const jsonHierarchicalPlugin: ExportPlugin = {
  id: 'json-hierarchical',
  label: 'JSON (hierarchical)',
  filename: 'design-tokens-hierarchical.json',
  language: 'json',
  description: 'Nested JSON: { color: { roleName: { light, dark } } }',
  generate({ semantic }: ExportInput): string {
    const color: Record<string, { light: string; dark: string }> = {}
    for (const [role, val] of Object.entries(semantic)) {
      color[role] = { light: val.light, dark: val.dark }
    }
    return JSON.stringify({ color }, null, 2)
  },
}
