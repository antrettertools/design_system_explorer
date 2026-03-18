import { useSpacing, useSpacingActions } from '@/store'
import { SidebarSection, ControlGroup } from '@/components/layout/AppLayout'
import { RadioGroup } from '@/components/controls/RadioGroup'
import { Slider } from '@/components/controls/Slider'
import { Select } from '@/components/controls/Select'
import type { SpacingAlgorithm } from '@/core/tokens/types'

export function SpacingSidebar() {
  const spacing = useSpacing()
  const { setBase, setAlgorithm, setRadiusBase, setRadiusScale } = useSpacingActions()

  return (
    <>
      <SidebarSection title="Base Grid" />
      <ControlGroup>
        <RadioGroup
          options={[
            { label: '4pt', value: '4' },
            { label: '8pt', value: '8' },
          ]}
          value={String(spacing.base)}
          onChange={(v) => setBase(Number(v))}
        />
      </ControlGroup>

      <ControlGroup>
        <Select
          label="Scale Type"
          value={spacing.algorithm}
          options={[
            { label: 'Linear', value: 'linear' as SpacingAlgorithm },
            { label: 'Modular (1.25×)', value: 'modular' as SpacingAlgorithm },
            { label: 'Tailwind-like', value: 'tailwind' as SpacingAlgorithm },
          ]}
          onChange={setAlgorithm}
        />
      </ControlGroup>

      <SidebarSection title="Border Radius" />
      <ControlGroup>
        <Slider
          label="Base Radius"
          value={spacing.radiusBase}
          min={0}
          max={20}
          step={1}
          displayValue={`${spacing.radiusBase}px`}
          onChange={setRadiusBase}
        />
      </ControlGroup>

      <ControlGroup>
        <Select
          label="Radius Scale"
          value={spacing.radiusScale}
          options={[
            { label: '×2 steps', value: '2x' },
            { label: '×1.5 steps', value: '1.5x' },
            { label: 'Fixed offsets', value: 'fixed' },
          ]}
          onChange={setRadiusScale}
        />
      </ControlGroup>
    </>
  )
}
