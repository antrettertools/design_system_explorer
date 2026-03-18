import { simulateAllColorblind } from '@/core/color/dataViz'
import type { DataVizColor } from '@/core/tokens/types'
import { useUIActions } from '@/store'

interface DataVizPaletteProps {
  colors: DataVizColor[]
  showColorblind?: boolean
}

export function DataVizPalette({ colors, showColorblind = true }: DataVizPaletteProps) {
  const { showToast } = useUIActions()

  const copy = (hex: string) => {
    navigator.clipboard.writeText(hex).then(() => showToast(`Copied ${hex}`))
  }

  return (
    <div>
      {/* Dark variants row */}
      <div style={{ marginBottom: 4, fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>
        On dark backgrounds
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {colors.map((c) => (
          <div
            key={`dark-${c.name}`}
            style={{
              flex: 1,
              height: 44,
              background: c.dark,
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '3px 4px',
            }}
            onClick={() => copy(c.dark)}
            title={`${c.name} (dark): ${c.dark}`}
          >
            <span style={{ fontSize: 8, color: 'rgba(0,0,0,0.4)', fontFamily: 'var(--mono)' }}>
              {c.name}
            </span>
          </div>
        ))}
      </div>

      {/* Light variants row */}
      <div style={{ marginBottom: 4, fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>
        On light backgrounds
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: showColorblind ? 24 : 0 }}>
        {colors.map((c) => (
          <div
            key={`light-${c.name}`}
            style={{
              flex: 1,
              height: 44,
              background: c.light,
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              border: '1px solid rgba(0,0,0,0.06)',
            }}
            onClick={() => copy(c.light)}
            title={`${c.name} (light): ${c.light}`}
          />
        ))}
      </div>

      {/* Colorblind simulations */}
      {showColorblind && (
        <>
          {(['deuteranopia', 'protanopia', 'tritanopia'] as const).map((type) => (
            <div key={type} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--mono)', marginBottom: 4 }}>
                {type.charAt(0).toUpperCase() + type.slice(1)} simulation
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {colors.map((c) => {
                  const sim = simulateAllColorblind(c.dark)
                  return (
                    <div
                      key={c.name}
                      style={{
                        flex: 1,
                        height: 24,
                        background: sim[type],
                        borderRadius: 4,
                      }}
                      title={`${c.name} simulated: ${sim[type]}`}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
