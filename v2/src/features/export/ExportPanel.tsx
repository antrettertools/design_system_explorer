import { useExport, useExportActions, useUIActions } from '@/store'
import { useAllTokens } from '@/hooks/useAllTokens'
import { getPlugin, EXPORT_PLUGINS } from '@/core/export/registry'
import styles from './ExportPanel.module.css'

export function ExportPanel() {
  const { activePluginId } = useExport()
  const { showToast } = useUIActions()
  const allTokens = useAllTokens()

  const plugin = getPlugin(activePluginId) ?? EXPORT_PLUGINS[0]
  const code = plugin.generate(allTokens)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      showToast(`Copied ${plugin.filename} to clipboard`)
    } catch {
      showToast('Failed to copy')
    }
  }

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = plugin.filename
    a.click()
    URL.revokeObjectURL(url)
    showToast(`Downloaded ${plugin.filename}`)
  }

  const handleDownloadAll = async () => {
    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      for (const p of EXPORT_PLUGINS) {
        try {
          zip.file(p.filename, p.generate(allTokens))
        } catch {
          // skip plugins that error
        }
      }
      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'design-tokens.zip'
      a.click()
      URL.revokeObjectURL(url)
      showToast('Downloaded all formats as zip')
    } catch {
      showToast('Failed to create zip')
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.toolbar}>
        <div className={styles.filename}>{plugin.filename}</div>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={handleCopy}>Copy</button>
          <button className={styles.actionBtn} onClick={handleDownload}>Download</button>
          <button className={styles.actionBtnPrimary} onClick={handleDownloadAll}>Download All (.zip)</button>
        </div>
      </div>
      <div className={styles.codeWrapper}>
        <pre className={styles.code}>{code}</pre>
      </div>
    </div>
  )
}
