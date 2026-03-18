import type { ExportPlugin } from './plugin'
import { cssPlugin } from './plugins/css'
import { jsonPlugin } from './plugins/json'
import { tailwindPlugin } from './plugins/tailwind'
import { w3cPlugin } from './plugins/w3c'

/**
 * Central registry of all export plugins.
 * To add a new format, implement ExportPlugin and add it here.
 */
const PLUGINS: ExportPlugin[] = [cssPlugin, jsonPlugin, w3cPlugin, tailwindPlugin]

export const ExportRegistry = {
  all(): ExportPlugin[] {
    return PLUGINS
  },

  get(id: string): ExportPlugin | undefined {
    return PLUGINS.find((p) => p.id === id)
  },

  register(plugin: ExportPlugin): void {
    if (!PLUGINS.find((p) => p.id === plugin.id)) {
      PLUGINS.push(plugin)
    }
  },
}
