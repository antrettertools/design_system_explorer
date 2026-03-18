import { simulateAllColorblind } from '@/core/color/dataViz'
import { getOnColor } from '@/core/color/scales'
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
      {/* ── Dark variants ── */}
      <RowLabel>Dark variants — use on dark backgrounds</RowLabel>
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {colors.map((c, i) => {
          const onColor = getOnColor(c.dark)
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: 52,
                background: c.dark,
                borderRadius: 6,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '4px 5px',
                gap: 1,
              }}
              onClick={() => copy(c.dark)}
              title={`${c.name} dark: ${c.dark}`}
            >
              <span
                style={{
                  fontSize: 8,
                  color: onColor,
                  opacity: 0.7,
                  fontFamily: 'var(--mono)',
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                {c.name}
              </span>
              <span
                style={{
                  fontSize: 7,
                  color: onColor,
                  opacity: 0.45,
                  fontFamily: 'var(--mono)',
                  lineHeight: 1,
                }}
              >
                {c.dark}
              </span>
            </div>
          )
        })}
      </div>

      {/* ── Light variants ── */}
      <RowLabel>Light variants — use on light backgrounds</RowLabel>
      <div style={{ display: 'flex', gap: 4, marginBottom: showColorblind ? 24 : 0 }}>
        {colors.map((c, i) => {
          const onColor = getOnColor(c.light)
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: 52,
                background: c.light,
                borderRadius: 6,
                border: '1px solid rgba(0,0,0,0.06)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '4px 5px',
                gap: 1,
              }}
              onClick={() => copy(c.light)}
              title={`${c.name} light: ${c.light}`}
            >
              <span
                style={{
                  fontSize: 8,
                  color: onColor,
                  opacity: 0.7,
                  fontFamily: 'var(--mono)',
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                {c.name}
              </span>
              <span
                style={{
                  fontSize: 7,
                  color: onColor,
                  opacity: 0.45,
                  fontFamily: 'var(--mono)',
                  lineHeight: 1,
                }}
              >
                {c.light}
              </span>
            </div>
          )
        })}
      </div>

      {/* ── Colorblind simulations ── */}
      {showColorblind && (
        <>
          <div
            style={{
              fontSize: 10,
              color: 'var(--text-3)',
              fontFamily: 'var(--mono)',
              marginBottom: 10,
              marginTop: 4,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Colorblind simulations (dark variants)
          </div>
          {(['deuteranopia', 'protanopia', 'tritanopia'] as const).map((type) => (
            <div key={type} style={{ marginBottom: 8 }}>
              <div
                style={{
                  fontSize: 9,
                  color: 'var(--text-3)',
                  fontFamily: 'var(--mono)',
                  marginBottom: 3,
                  opacity: 0.8,
                }}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {colors.map((c, i) => {
                  const sim = simulateAllColorblind(c.dark)
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 20,
                        background: sim[type],
                        borderRadius: 4,
                      }}
                      title={`${c.name} ${type}: ${sim[type]}`}
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

function RowLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        color: 'var(--text-3)',
        fontFamily: 'var(--mono)',
        marginBottom: 5,
        letterSpacing: '0.05em',
      }}
    >
      {children}
    </div>
  )
}
