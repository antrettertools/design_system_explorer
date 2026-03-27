import type { ExportPlugin } from './plugin'
import { cssPlugin } from './plugins/css'
import { cssFull } from './plugins/css-full'
import { jsonPlugin } from './plugins/json'
import { jsonHierarchicalPlugin } from './plugins/json-hierarchical'
import { w3cPlugin } from './plugins/w3c'
import { tailwindPlugin } from './plugins/tailwind'
import { scssPlugin } from './plugins/scss'
import { figmaTokensPlugin } from './plugins/figma-tokens'

export const EXPORT_PLUGINS: ExportPlugin[] = [
  cssPlugin, cssFull, jsonPlugin, jsonHierarchicalPlugin,
  w3cPlugin, tailwindPlugin, scssPlugin, figmaTokensPlugin,
]

export function getPlugin(id: string): ExportPlugin | undefined {
  return EXPORT_PLUGINS.find(p => p.id === id)
}
