import { useSpacing, useSpacingActions } from '@/store'
import { RadioGroup } from '@/components/controls/RadioGroup'
import { Slider } from '@/components/controls/Slider'
import { Select } from '@/components/controls/Select'
import type { SpacingAlgorithm } from '@/core/tokens/types'

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--chrome-text-subtle)',
  fontFamily: 'var(--chrome-font-mono)',
  padding: '12px 16px 6px',
  borderTop: '1px solid var(--chrome-border)',
  marginTop: 4,
}

const groupStyle: React.CSSProperties = {
  padding: '0 16px 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
}

export function SpacingSidebar() {
  const spacing = useSpacing()
  const { setBase, setAlgorithm, setRadiusBase, setRadiusScale } = useSpacingActions()

  return (
    <>
      <div style={{ ...sectionTitleStyle, borderTop: 'none', marginTop: 0 }}>Base Grid</div>
      <div style={groupStyle}>
        <RadioGroup
          options={[
            { label: '4pt', value: '4' },
            { label: '8pt', value: '8' },
          ]}
          value={String(spacing.base)}
          onChange={(v) => setBase(Number(v))}
        />
      </div>

      <div style={groupStyle}>
        <Select
          label="Scale Type"
          value={spacing.algorithm}
          options={[
            { label: 'Linear', value: 'linear' as SpacingAlgorithm },
            { label: 'Modular (1.25×)', value: 'modular' as SpacingAlgorithm },
            { label: 'Tailwind-like', value: 'tailwind' as SpacingAlgorithm },
          ]}
          onChange={(v) => setAlgorithm(v as SpacingAlgorithm)}
        />
      </div>

      <div style={sectionTitleStyle}>Border Radius</div>
      <div style={groupStyle}>
        <Slider
          label="Base Radius"
          value={spacing.radiusBase}
          min={0}
          max={20}
          step={1}
          displayValue={`${spacing.radiusBase}px`}
          onChange={setRadiusBase}
        />
      </div>

      <div style={groupStyle}>
        <Select
          label="Radius Scale"
          value={spacing.radiusScale}
          options={[
            { label: '×2 steps', value: '2x' },
            { label: '×1.5 steps', value: '1.5x' },
            { label: 'Fixed offsets', value: 'fixed' },
          ]}
          onChange={(v) => setRadiusScale(v as '2x' | '1.5x' | 'fixed')}
        />
      </div>
    </>
  )
}
