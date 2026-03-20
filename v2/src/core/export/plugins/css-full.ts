import type { ExportPlugin, ExportInput } from '../plugin'
import { cssPlugin } from './css'

export const cssFull: ExportPlugin = {
  id: 'css-full',
  label: 'CSS Full (all layers)',
  filename: 'design-tokens-full.css',
  language: 'css',
  description: 'Three-block CSS: primitives, semantic roles, and component tokens.',
  generate(input: ExportInput): string {
    // Reuse css plugin for primitives + semantic
    const base = cssPlugin.generate({
      ...input,
      config: { ...input.config, layers: { primitives: true, semantic: true, component: false } },
    })

    // Add component tokens block
    const componentLines = ['\n/* Component Tokens */\n:root {']
    for (const [component, tokens] of Object.entries(input.component)) {
      for (const [prop, val] of Object.entries(tokens)) {
        componentLines.push(`  --${input.config.prefix}${component}-${prop}: ${val};`)
      }
    }
    componentLines.push('}')

    return base + componentLines.join('\n')
  },
}
