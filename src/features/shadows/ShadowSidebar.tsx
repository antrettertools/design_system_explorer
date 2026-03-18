import { useShadow, useShadowActions } from '@/store'
import { SidebarSection, ControlGroup } from '@/components/layout/AppLayout'
import { Slider } from '@/components/controls/Slider'
import { Button } from '@/components/controls/Button'

export function ShadowSidebar() {
  const shadow = useShadow()
  const { setShadow, applyPreset } = useShadowActions()
  const { x, y, blur, spread, color, opacity } = shadow.base

  return (
    <>
      <SidebarSection title="Shadow Controls" />
      <ControlGroup>
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
          <div style={{ fontSize: 10, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Color
          </div>
          <input
            type="color"
            value={color}
            onChange={(e) => setShadow({ color: e.target.value })}
            style={{ width: 36, height: 28, padding: 2, cursor: 'pointer', border: 'none', background: 'none' }}
          />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-2)' }}>{color}</span>
        </div>
      </ControlGroup>

      <SidebarSection title="Elevation Presets" />
      <ControlGroup>
        {['low', 'medium', 'high', 'inner'].map((preset) => (
          <Button key={preset} variant="secondary" full onClick={() => applyPreset(preset)}>
            {preset.charAt(0).toUpperCase() + preset.slice(1)} Elevation
          </Button>
        ))}
      </ControlGroup>
    </>
  )
}
