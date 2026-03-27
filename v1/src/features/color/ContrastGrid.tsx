import { buildContrastEntries } from '@/core/color/contrast'
import { getOnColor } from '@/core/color/scales'
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
    { hex: tokens.neutral.scale[500], label: 'Neutral 500' },
    { hex: tokens.stateColors.success, label: 'Success' },
    { hex: tokens.stateColors.warning, label: 'Warning' },
    { hex: tokens.stateColors.error, label: 'Error' },
    { hex: tokens.stateColors.info, label: 'Info' },
  ]

  const entries = buildContrastEntries(keyColors)

  // Level → label + color for pill
  const levelLabel = {
    aaa: { text: 'AAA', bg: 'rgba(34,197,94,0.25)', color: '#4ade80' },
    aa: { text: 'AA', bg: 'rgba(34,197,94,0.15)', color: '#86efac' },
    'aa-large': { text: 'AA Lg', bg: 'rgba(251,191,36,0.2)', color: '#fcd34d' },
    fail: { text: 'Fail', bg: 'rgba(239,68,68,0.2)', color: '#f87171' },
  }

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 8,
        }}
      >
        {entries.map((entry) => {
          const onColor = getOnColor(entry.hex)
          const isLight = onColor === '#111111'

          return (
            <div
              key={entry.label}
              style={{ background: entry.hex, borderRadius: 8, padding: '10px 12px' }}
            >
              {/* Name + hex */}
              <div
                style={{
                  fontSize: 9,
                  color: onColor,
                  opacity: 0.6,
                  fontFamily: 'var(--mono)',
                  marginBottom: 2,
                  letterSpacing: '0.05em',
                }}
              >
                {entry.label}
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: onColor,
                  fontFamily: 'var(--mono)',
                  marginBottom: 8,
                  opacity: 0.85,
                }}
              >
                {entry.hex}
              </div>

              {/* On White row */}
              <ContrastRow
                label="on #fff"
                ratio={entry.onWhite.ratioDisplay}
                level={entry.onWhite.level}
                isLight={isLight}
                levelLabel={levelLabel}
              />
              {/* On Dark background (#111) row */}
              <ContrastRow
                label="on #111"
                ratio={entry.onBlack.ratioDisplay}
                level={entry.onBlack.level}
                isLight={isLight}
                levelLabel={levelLabel}
              />
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div
        style={{
          marginTop: 16,
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
          borderTop: '1px solid var(--line)',
          paddingTop: 12,
        }}
      >
        {Object.entries(levelLabel).map(([, v]) => (
          <div key={v.text} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span
              style={{
                fontSize: 9,
                padding: '2px 6px',
                borderRadius: 3,
                background: v.bg,
                color: v.color,
                fontFamily: 'var(--mono)',
              }}
            >
              {v.text}
            </span>
            <span style={{ fontSize: 9, color: 'var(--text-3)' }}>
              {v.text === 'AAA'
                ? '≥ 7:1'
                : v.text === 'AA'
                ? '≥ 4.5:1'
                : v.text === 'AA Lg'
                ? '≥ 3:1'
                : '< 3:1'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ContrastRow({
  label,
  ratio,
  level,
  isLight,
  levelLabel,
}: {
  label: string
  ratio: string
  level: 'aaa' | 'aa' | 'aa-large' | 'fail'
  isLight: boolean
  levelLabel: Record<string, { text: string; bg: string; color: string }>
}) {
  // Badge colors use the levelLabel palette (always readable — they have their own bg)
  const lv = levelLabel[level]
  // For ratio text: use a semi-transparent version of the on-color so it's always readable
  const ratioColor = isLight ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.55)'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        marginBottom: 3,
      }}
    >
      <span
        style={{
          fontSize: 8,
          color: ratioColor,
          fontFamily: 'var(--mono)',
          minWidth: 38,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 8,
          color: ratioColor,
          fontFamily: 'var(--mono)',
          minWidth: 28,
        }}
      >
        {ratio}
      </span>
      <span
        style={{
          fontSize: 8,
          padding: '1px 5px',
          borderRadius: 3,
          background: lv.bg,
          color: lv.color,
          fontFamily: 'var(--mono)',
          whiteSpace: 'nowrap',
        }}
      >
        {lv.text}
      </span>
    </div>
  )
}
