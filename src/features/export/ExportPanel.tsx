import { useTokens } from '@/hooks/useTokens'
import { ExportRegistry } from '@/core/export/registry'
import { useUIActions } from '@/store'
import { PreviewCard } from '@/components/layout/PreviewCard'
import { Button } from '@/components/controls/Button'

export function ExportPanel() {
  const tokens = useTokens()
  const { showToast } = useUIActions()
  const plugins = ExportRegistry.all()

  const copy = (content: string) => {
    navigator.clipboard.writeText(content).then(() => showToast('Copied to clipboard'))
  }

  const download = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = filename
    a.click()
    URL.revokeObjectURL(a.href)
    showToast(`Downloaded ${filename}`)
  }

  return (
    <>
      {plugins.map((plugin) => {
        const output = plugin.generate(tokens)
        return (
          <PreviewCard key={plugin.id} title={plugin.label} subtitle={`— ${plugin.description}`}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
                paddingBottom: 8,
                borderBottom: '1px solid var(--line)',
              }}
            >
              <span style={{ fontSize: 10, color: 'var(--text-2)', fontFamily: 'var(--mono)' }}>
                {plugin.filename}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <Button variant="secondary" size="sm" onClick={() => copy(output)}>
                  Copy
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => download(output, plugin.filename)}
                >
                  Download
                </Button>
              </div>
            </div>
            <pre
              style={{
                background: 'var(--bg-2)',
                borderRadius: 'var(--radius)',
                padding: 16,
                fontFamily: 'var(--mono)',
                fontSize: 11,
                color: 'var(--text-1)',
                overflowX: 'auto',
                overflowY: 'auto',
                whiteSpace: 'pre',
                maxHeight: 280,
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {output}
            </pre>
          </PreviewCard>
        )
      })}
    </>
  )
}
