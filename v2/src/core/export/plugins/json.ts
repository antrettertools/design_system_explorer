import type { ExportPlugin, ExportInput } from '../plugin'

export const jsonPlugin: ExportPlugin = {
  id: 'json',
  label: 'JSON (flat)',
  filename: 'design-tokens.json',
  language: 'json',
  description: 'Flat JSON object with all semantic tokens (light mode).',
  generate({ semantic, config }: ExportInput): string {
    const p = config.prefix
    const result: Record<string, string> = {}
    for (const [role, val] of Object.entries(semantic)) {
      result[`${p}color-${role}`] = val.light
    }
    return JSON.stringify(result, null, 2)
  },
}
