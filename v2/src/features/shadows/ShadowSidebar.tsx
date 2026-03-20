import { useShadow, useShadowActions } from '@/store'
import { Slider } from '@/components/controls/Slider'
import { Button } from '@/components/controls/Button'

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

export function ShadowSidebar() {
  const shadow = useShadow()
  const { setShadow, applyPreset } = useShadowActions()
  const { x, y, blur, spread, color, opacity } = shadow.base

  return (
    <>
      <div style={{ ...sectionTitleStyle, borderTop: 'none', marginTop: 0 }}>Shadow Controls</div>
      <div style={groupStyle}>
        <Slider label="Offset X" value={x} min={-20} max={20} displayValue={`${x}px`}
          onChange={(v) => setShadow({ x: v })} />
        <Slider label="Offset Y" value={y} min={-20} max={20} displayValue={`${y}px`}
          onChange={(v) => setShadow({ y: v })} />
        <Slider label="Blur" value={blur} min={0} max={60} displayValue={`${blur}px`}
          onChange={(v) => setShadow({ blur: v })} />
        <Slider label="Spread" value={spread} min={-10} max={20} displayValue={`${spread}px`}
          onChange={(v) => setShadow({ spread: v })} />
        <Slider
          label="Opacity"
          value={opacity}
          min={0}
          max={1}
          step={0.05}
          displayValue={opacity.toFixed(2)}
          onChange={(v) => setShadow({ opacity: v })}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 10, color: 'var(--chrome-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Color
          </div>
          <input
            type="color"
            value={color}
            onChange={(e) => setShadow({ color: e.target.value })}
            style={{ width: 36, height: 28, padding: 2, cursor: 'pointer', border: 'none', background: 'none' }}
          />
          <span style={{ fontFamily: 'var(--chrome-font-mono)', fontSize: 11, color: 'var(--chrome-text-subtle)' }}>{color}</span>
        </div>
      </div>

      <div style={sectionTitleStyle}>Elevation Presets</div>
      <div style={groupStyle}>
        {['low', 'medium', 'high', 'inner'].map((preset) => (
          <Button key={preset} variant="secondary" full onClick={() => applyPreset(preset)}>
            {preset.charAt(0).toUpperCase() + preset.slice(1)} Elevation
          </Button>
        ))}
      </div>
    </>
  )
}
