import { useMemo } from 'react'
import { useShadow } from '@/store'
import { shadowToCss, buildElevationScale } from '@/core/shadow/presets'
import { PreviewCard } from '@/components/layout/PreviewCard'

export function ShadowPanel() {
  const shadow = useShadow()
  const currentShadow = shadowToCss(shadow.base)

  const elevation = useMemo(
    () => buildElevationScale(shadow.base),
    [shadow.base],
  )

  return (
    <>
      <PreviewCard title="Shadow Preview">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '16px 0' }}>
          <div
            style={{
              width: 160,
              height: 100,
              background: 'var(--chrome-surface-raised)',
              borderRadius: 'var(--chrome-radius)',
              boxShadow: currentShadow,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              color: 'var(--chrome-text-subtle)',
            }}
          >
            Card Surface
          </div>
          <div style={{ fontFamily: 'var(--chrome-font-mono)', fontSize: 11, color: 'var(--chrome-text-subtle)', textAlign: 'center' }}>
            box-shadow: {currentShadow};
          </div>
        </div>
      </PreviewCard>

      <PreviewCard title="Elevation System">
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', padding: '16px 0' }}>
          {Object.entries(elevation).map(([level, shadowDef]) => (
            <div key={level} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 80,
                  height: 64,
                  background: 'var(--chrome-surface-raised)',
                  borderRadius: 10,
                  boxShadow: shadowToCss(shadowDef),
                  margin: '0 auto 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ fontSize: 9, color: 'var(--chrome-text-subtle)', fontFamily: 'var(--chrome-font-mono)' }}>
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
