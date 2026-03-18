import { useComponents, useComponentsActions } from '@/store'
import { SidebarSection, ControlGroup } from '@/components/layout/AppLayout'
import { Select } from '@/components/controls/Select'
import { RadioGroup } from '@/components/controls/RadioGroup'
import type { ButtonStyle, ComponentSize } from '@/core/tokens/types'

export function ComponentsSidebar() {
  const components = useComponents()
  const { setButtonStyle, setRadius, setSize } = useComponentsActions()

  return (
    <>
      <SidebarSection title="Component Options" />
      <ControlGroup>
        <Select
          label="Button Style"
          value={components.buttonStyle}
          options={[
            { label: 'Filled', value: 'filled' as ButtonStyle },
            { label: 'Outline', value: 'outline' as ButtonStyle },
            { label: 'Ghost', value: 'ghost' as ButtonStyle },
          ]}
          onChange={setButtonStyle}
        />
      </ControlGroup>

      <ControlGroup>
        <Select
          label="Radius Preset"
          value={String(components.radius)}
          options={[
            { label: 'Sharp (0px)', value: '0' },
            { label: 'Subtle (4px)', value: '4' },
            { label: 'Default (8px)', value: '8' },
            { label: 'Rounded (12px)', value: '12' },
            { label: 'Pill (100px)', value: '100' },
          ]}
          onChange={(v) => setRadius(Number(v))}
        />
      </ControlGroup>

      <ControlGroup>
        <RadioGroup
          options={[
            { label: 'SM', value: 'sm' as ComponentSize },
            { label: 'MD', value: 'md' as ComponentSize },
            { label: 'LG', value: 'lg' as ComponentSize },
          ]}
          value={components.size}
          onChange={setSize}
        />
      </ControlGroup>
    </>
  )
}
