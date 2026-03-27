import { useExport, useExportActions } from '@/store'
import { EXPORT_PLUGINS } from '@/core/export/registry'
import styles from './ExportSidebar.module.css'

export function ExportSidebar() {
  const { config, activePluginId } = useExport()
  const { setExportConfig, setActivePlugin } = useExportActions()

  return (
    <div className={styles.sidebar}>
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Format</div>
        {EXPORT_PLUGINS.map(plugin => (
          <button
            key={plugin.id}
            className={`${styles.formatBtn} ${activePluginId === plugin.id ? styles.formatBtnActive : ''}`}
            onClick={() => setActivePlugin(plugin.id)}
          >
            <div className={styles.formatName}>{plugin.label}</div>
            <div className={styles.formatDesc}>{plugin.description}</div>
          </button>
        ))}
      </div>
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Options</div>
        <div className={styles.control}>
          <label className={styles.controlLabel}>Dark Mode</label>
          <select
            className={styles.select}
            value={config.darkMode}
            onChange={e => setExportConfig({ darkMode: e.target.value as typeof config.darkMode })}
          >
            <option value="none">None</option>
            <option value="data-theme">data-theme attribute</option>
            <option value="media-query">@media prefers-color-scheme</option>
            <option value="both">Both</option>
          </select>
        </div>
        <div className={styles.control}>
          <label className={styles.controlLabel}>Color Format</label>
          <select
            className={styles.select}
            value={config.colorFormat}
            onChange={e => setExportConfig({ colorFormat: e.target.value as typeof config.colorFormat })}
          >
            <option value="oklch">OKLCH</option>
            <option value="hex">Hex</option>
            <option value="hsl">HSL</option>
            <option value="rgb">RGB</option>
          </select>
        </div>
        <div className={styles.control}>
          <label className={styles.controlLabel}>Prefix</label>
          <input
            type="text"
            className={styles.input}
            value={config.prefix}
            onChange={e => setExportConfig({ prefix: e.target.value })}
            placeholder="e.g. ds-"
          />
        </div>
        <div className={styles.control}>
          <label className={styles.controlLabel}>Layers</label>
          <div className={styles.checkboxGroup}>
            {(['primitives', 'semantic', 'component'] as const).map(layer => (
              <label key={layer} className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={config.layers[layer]}
                  onChange={e => setExportConfig({ layers: { ...config.layers, [layer]: e.target.checked } })}
                />
                {layer.charAt(0).toUpperCase() + layer.slice(1)}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
