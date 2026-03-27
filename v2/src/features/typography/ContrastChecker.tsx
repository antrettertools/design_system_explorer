import { useContrast } from '@/hooks/useContrast'
import { useTypography } from '@/store'

export function ContrastChecker() {
  const { textColor, bgColor } = useTypography()
  const result = useContrast(textColor, bgColor)

  const ratioColor =
    result.ratio >= 4.5
      ? '#4ade80'
      : result.ratio >= 3
        ? 'var(--chrome-accent)'
        : '#f87171'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 12px',
          background: 'var(--chrome-surface)',
          borderRadius: 'var(--chrome-radius)',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 4,
            background: bgColor,
            color: textColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 700,
            flexShrink: 0,
            border: '1px solid var(--chrome-border)',
          }}
        >
          Aa
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: ratioColor, fontFamily: 'var(--chrome-font-mono)' }}>
            {result.ratioDisplay}:1
          </div>
          <div style={{ fontSize: 10, color: 'var(--chrome-text-subtle)' }}>Contrast Ratio</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {[
          { label: 'AA Normal', pass: result.aaBodyText },
          { label: 'AA Large', pass: result.aaLargeText },
          { label: 'AAA Normal', pass: result.aaaBodyText },
          { label: 'AAA Large', pass: result.aaaLargeText },
        ].map(({ label, pass }) => (
          <span
            key={label}
            style={{
              fontSize: 9,
              fontWeight: 700,
              padding: '3px 7px',
              borderRadius: 3,
              fontFamily: 'var(--chrome-font-mono)',
              letterSpacing: '0.04em',
              background: pass ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
              color: pass ? '#4ade80' : '#f87171',
            }}
          >
            {label} {pass ? '✓' : '✗'}
          </span>
        ))}
      </div>
    </div>
  )
}
