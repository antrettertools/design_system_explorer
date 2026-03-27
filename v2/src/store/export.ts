import type { ExportConfig } from '@/core/export/plugin'
import { DEFAULT_EXPORT_CONFIG } from '@/core/export/plugin'

export interface ExportState {
  config: ExportConfig
  activePluginId: string
}

export interface ExportActions {
  setExportConfig(config: Partial<ExportConfig>): void
  setActivePlugin(id: string): void
}

export const defaultExportState: ExportState = {
  config: DEFAULT_EXPORT_CONFIG,
  activePluginId: 'css',
}

export function createExportActions(
  set: (fn: (s: { export: ExportState }) => Partial<{ export: ExportState }>) => void,
): ExportActions {
  return {
    setExportConfig: patch => set(s => ({
      export: { ...s.export, config: { ...s.export.config, ...patch } }
    })),
    setActivePlugin: id => set(s => ({ export: { ...s.export, activePluginId: id } })),
  }
}
