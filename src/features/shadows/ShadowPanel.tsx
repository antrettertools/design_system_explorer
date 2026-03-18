import { PreviewCard } from '@/components/layout/PreviewCard'
import { shadowToCss } from '@/core/shadow/presets'
import { useTokens } from '@/hooks/useTokens'
import { useShadow } from '@/store'

export function ShadowPanel() {
  const tokens = useTokens()
  const shadow = useShadow()
  const currentShadow = shadowToCss(shadow.base)

  return (
    <>
      <PreviewCard title="Shadow Preview">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '16px 0' }}>
          <div
            style={{
              width: 160,
              height: 100,
              background: 'var(--bg-2)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: currentShadow,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              color: 'var(--text-2)',
            }}
          >
            Card Surface
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-2)', textAlign: 'center' }}>
            box-shadow: {currentShadow};
          </div>
        </div>
      </PreviewCard>

      <PreviewCard title="Elevation System">
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', padding: '16px 0' }}>
          {Object.entries(tokens.elevation).map(([level, shadowDef]) => (
            <div key={level} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 80,
                  height: 64,
                  background: 'var(--bg-2)',
                  borderRadius: 10,
                  boxShadow: shadowToCss(shadowDef),
                  margin: '0 auto 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>
                  {level}
                </div>
              </div>
            </div>
          ))}
        </div>
      </PreviewCard>
    </>
  )
}
