import { useTokens } from '@/hooks/useTokens'
import { useFont } from '@/hooks/useFont'
import { useTypography, useSpacing, useShadow, useComponents } from '@/store'
import { SidebarSection, ControlGroup } from '@/components/layout/AppLayout'

export function ShowcaseSidebar() {
  const tokens = useTokens()
  const { fontFamilyStack } = useFont()
  const typography = useTypography()
  const spacing = useSpacing()
  const shadow = useShadow()
  const components = useComponents()

  const swatch = (hex: string, label: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      <div style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        background: hex,
        border: '1px solid var(--line)',
        flexShrink: 0,
      }} />
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-1)' }}>{label}</div>
        <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>{hex}</div>
      </div>
    </div>
  )

  const row = (label: string, value: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
      <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{label}</span>
      <span style={{ fontSize: 11, color: 'var(--text-1)', fontFamily: 'var(--mono)', fontWeight: 500 }}>{value}</span>
    </div>
  )

  return (
    <>
      <SidebarSection title="Live Showcase" />

      <ControlGroup>
        <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5, marginBottom: 4 }}>
          A mock marketing page rendered with your current design tokens. Change any setting in the other tabs to see it reflected here instantly.
        </div>
      </ControlGroup>

      <SidebarSection title="Typography" />
      <ControlGroup>
        {row('Font', tokens.fontFamily)}
        {row('Stack', fontFamilyStack.split(',')[0].trim())}
        {row('Base size', `${typography.fontSize}px`)}
        {row('Weight', String(typography.fontWeight))}
        {row('Line height', String(typography.lineHeight))}
        {row('Scale', typography.scaleAlgorithm)}
        {row('Type xs', `${Math.round(tokens.typeScale.xs)}px`)}
        {row('Type 4xl', `${Math.round(tokens.typeScale['4xl'])}px`)}
      </ControlGroup>

      <SidebarSection title="Colors" />
      <ControlGroup>
        {swatch(tokens.primaryBrand.hex, tokens.primaryBrand.name)}
        {swatch(tokens.secondaryBrand.hex, tokens.secondaryBrand.name)}
        {tokens.subBrandColors.slice(0, 2).map(c => swatch(c.hex, c.name))}
        <div style={{ marginTop: 8 }}>
          {row('Success', tokens.stateColors.success)}
          {row('Warning', tokens.stateColors.warning)}
          {row('Error', tokens.stateColors.error)}
          {row('Info', tokens.stateColors.info)}
        </div>
      </ControlGroup>

      <SidebarSection title="Spacing & Shape" />
      <ControlGroup>
        {row('Base grid', `${spacing.base}px`)}
        {row('Algorithm', spacing.algorithm)}
        {row('Radius base', `${spacing.radiusBase}px`)}
        {row('Radius sm', `${tokens.radiusScale.sm}px`)}
        {row('Radius lg', `${tokens.radiusScale.lg}px`)}
      </ControlGroup>

      <SidebarSection title="Elevation" />
      <ControlGroup>
        {row('Shadow color', shadow.base.color)}
        {row('Shadow opacity', `${Math.round(shadow.base.opacity * 100)}%`)}
        {row('Shadow blur', `${shadow.base.blur}px`)}
      </ControlGroup>

      <SidebarSection title="Components" />
      <ControlGroup>
        {row('Button style', components.buttonStyle)}
        {row('Size', components.size)}
        {row('Radius', `${components.radius}px`)}
      </ControlGroup>
    </>
  )
}
