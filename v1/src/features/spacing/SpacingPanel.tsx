import { PreviewCard } from '@/components/layout/PreviewCard'
import { useTokens } from '@/hooks/useTokens'
import { useSpacing } from '@/store'

export function SpacingPanel() {
  const tokens = useTokens()
  const spacing = useSpacing()
  const steps = Object.entries(tokens.spacingScale)
  const maxVal = Math.max(...steps.map(([, v]) => v))

  return (
    <>
      <PreviewCard title="Spacing Scale">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {steps.map(([key, val]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)', width: 100, flexShrink: 0 }}>
                --{key}
              </div>
              <div style={{ flex: 1, height: 20, display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    height: 8,
                    width: `${Math.min(100, (val / maxVal) * 100)}%`,
                    background: 'var(--accent)',
                    borderRadius: 2,
                    opacity: 0.7,
                  }}
                />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-2)', width: 48, textAlign: 'right', flexShrink: 0 }}>
                {val}px
              </div>
            </div>
          ))}
        </div>
      </PreviewCard>

      <PreviewCard title="Border Radius Scale">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
          {Object.entries(tokens.radiusScale).map(([key, val]) => (
            <div key={key} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  background: 'var(--accent)',
                  opacity: 0.6,
                  borderRadius: val === 9999 ? '50%' : val,
                  margin: '0 auto 6px',
                }}
              />
              <div style={{ fontSize: 10, color: 'var(--text-2)', fontFamily: 'var(--mono)' }}>
                --radius-{key}
                <br />
                {val === 9999 ? 'full' : `${val}px`}
              </div>
            </div>
          ))}
        </div>
      </PreviewCard>

      <PreviewCard title="Spacing Grid Preview">
        <div
          style={{
            position: 'relative',
            height: 120,
            backgroundImage: [
              `repeating-linear-gradient(90deg, rgba(232,168,48,0.08) 0, rgba(232,168,48,0.08) 1px, transparent 1px, transparent ${spacing.base}px)`,
              `repeating-linear-gradient(0deg, rgba(232,168,48,0.08) 0, rgba(232,168,48,0.08) 1px, transparent 1px, transparent ${spacing.base}px)`,
            ].join(', '),
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              bottom: 8,
              right: 12,
              fontSize: 10,
              color: 'var(--text-3)',
              fontFamily: 'var(--mono)',
            }}
          >
            {spacing.base}pt base grid
          </div>
        </div>
      </PreviewCard>

      <PreviewCard title="Z-Index Scale">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {Object.entries(tokens.zIndexScale).map(([key, val]) => (
            <div key={key} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)', width: 120 }}>
                --z-{key}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-2)' }}>{val}</div>
            </div>
          ))}
        </div>
      </PreviewCard>
    </>
  )
}
