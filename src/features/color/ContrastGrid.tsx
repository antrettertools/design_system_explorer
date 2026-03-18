import { buildContrastEntries } from '@/core/color/contrast'
import type { DesignTokens } from '@/core/tokens/types'

interface ContrastGridProps {
  tokens: DesignTokens
}

export function ContrastGrid({ tokens }: ContrastGridProps) {
  const keyColors = [
    { hex: tokens.primaryBrand.scale[500], label: 'Primary 500' },
    { hex: tokens.secondaryBrand.scale[500], label: 'Secondary 500' },
    ...tokens.subBrandColors.map((sb, i) => ({
      hex: sb.scale[500],
      label: `Sub ${i + 1} 500`,
    })),
    { hex: tokens.stateColors.success, label: 'Success' },
    { hex: tokens.stateColors.warning, label: 'Warning' },
    { hex: tokens.stateColors.error, label: 'Error' },
    { hex: tokens.stateColors.info, label: 'Info' },
  ]

  const entries = buildContrastEntries(keyColors)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 8,
      }}
    >
      {entries.map((entry) => {
        const onColor =
          entry.onWhite.ratio > entry.onBlack.ratio ? '#ffffff' : '#111111'
        return (
          <div
            key={entry.label}
            style={{ background: entry.hex, borderRadius: 8, padding: 12 }}
          >
            <div
              style={{
                fontSize: 9,
                color: onColor,
                opacity: 0.65,
                fontFamily: 'var(--mono)',
                marginBottom: 6,
              }}
            >
              {entry.label}
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <span
                style={{
                  background: `rgba(255,255,255,${entry.onWhite.aaBodyText ? 0.25 : 0.1})`,
                  color: entry.onWhite.aaBodyText ? '#fff' : 'rgba(255,255,255,0.4)',
                  fontSize: 9,
                  padding: '2px 5px',
                  borderRadius: 3,
                  fontFamily: 'var(--mono)',
                }}
              >
                W {entry.onWhite.ratioDisplay} {entry.onWhite.aaBodyText ? '✓' : '✗'}
              </span>
              <span
                style={{
                  background: `rgba(0,0,0,${entry.onBlack.aaBodyText ? 0.3 : 0.15})`,
                  color: entry.onBlack.aaBodyText ? onColor : 'rgba(0,0,0,0.5)',
                  fontSize: 9,
                  padding: '2px 5px',
                  borderRadius: 3,
                  fontFamily: 'var(--mono)',
                }}
              >
                B {entry.onBlack.ratioDisplay} {entry.onBlack.aaBodyText ? '✓' : '✗'}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
