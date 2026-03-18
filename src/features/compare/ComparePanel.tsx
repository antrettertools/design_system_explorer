import { useCompare } from '@/store'

const PIN_COLORS = ['var(--accent)', 'var(--app-teal)', '#c080e0']

export function ComparePanel() {
  const { pinned, layout } = useCompare()

  if (pinned.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-3)' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⊞</div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 16, marginBottom: 6, color: 'var(--text-2)' }}>
          No systems pinned
        </div>
        <div style={{ fontSize: 12 }}>
          Use the{' '}
          <strong style={{ color: 'var(--accent)' }}>Pin Current</strong> button to save
          font combinations for comparison
        </div>
      </div>
    )
  }

  const cols = layout === 'side' ? pinned.length : 1

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 16,
      }}
    >
      {pinned.map((p, i) => (
        <div
          key={p.id}
          style={{
            background: 'var(--bg-1)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -1,
              left: 20,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.1em',
              padding: '4px 10px',
              borderRadius: '0 0 6px 6px',
              background: PIN_COLORS[i],
              color: 'var(--bg-0)',
              fontFamily: 'var(--sans)',
            }}
          >
            Pin {i + 1}
          </div>

          <div style={{ marginBottom: 16, fontSize: 11, color: 'var(--text-2)', fontFamily: 'var(--mono)' }}>
            {p.label}
          </div>

          <div style={{ fontStyle: 'normal' }}>
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                marginBottom: 8,
                lineHeight: 1.1,
                fontFamily: `'${p.fontFamily}', sans-serif`,
                fontVariationSettings: `'wght' ${p.fontWeight}`,
              }}
            >
              {p.fontFamily}
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 500,
                marginBottom: 8,
                fontFamily: `'${p.fontFamily}', sans-serif`,
              }}
            >
              Section Heading
            </div>
            <div
              style={{
                fontSize: p.fontSize,
                lineHeight: p.lineHeight,
                color: 'var(--text-1)',
                fontFamily: `'${p.fontFamily}', sans-serif`,
                fontWeight: p.fontWeight,
              }}
            >
              Body text at {p.fontSize}px. The quick brown fox jumps over the lazy dog.
              Pack my box with five dozen liquor jugs.
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'var(--text-2)',
                marginTop: 8,
                fontFamily: `'${p.fontFamily}', sans-serif`,
              }}
            >
              Caption / metadata — {p.fontWeight}wt
            </div>
          </div>

          <div style={{ marginTop: 16, display: 'flex', gap: 6 }}>
            <div style={{ width: 20, height: 20, borderRadius: 4, background: p.primaryHex }} />
            <div style={{ width: 20, height: 20, borderRadius: 4, background: p.secondaryHex }} />
          </div>
        </div>
      ))}
    </div>
  )
}
