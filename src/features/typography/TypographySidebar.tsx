import { useTypography, useTypographyActions } from '@/store'
import { SidebarSection, ControlGroup } from '@/components/layout/AppLayout'
import { Slider } from '@/components/controls/Slider'
import { ColorPicker } from '@/components/controls/ColorPicker'
import { FontList } from './FontList'
import { AxesPanel } from './AxesPanel'
import { ContrastChecker } from './ContrastChecker'

export function TypographySidebar() {
  const typography = useTypography()
  const { setFontSize, setLineHeight, setLetterSpacing, setCustomText, setTextColor, setBgColor } =
    useTypographyActions()

  return (
    <>
      <SidebarSection title="Primary Font" />
      <ControlGroup>
        <FontList />
      </ControlGroup>

      <SidebarSection title="Variable Axes" />
      <ControlGroup>
        <AxesPanel />
      </ControlGroup>

      <SidebarSection title="Type Scale" />
      <ControlGroup>
        <Slider
          label="Font Size (body)"
          value={typography.fontSize}
          min={12}
          max={24}
          step={1}
          displayValue={`${typography.fontSize}px`}
          onChange={setFontSize}
        />
        <Slider
          label="Line Height"
          value={typography.lineHeight}
          min={1.1}
          max={2.2}
          step={0.05}
          displayValue={typography.lineHeight.toFixed(2)}
          onChange={setLineHeight}
        />
        <Slider
          label="Letter Spacing"
          value={typography.letterSpacing}
          min={-0.05}
          max={0.2}
          step={0.005}
          displayValue={`${typography.letterSpacing.toFixed(3)}em`}
          onChange={setLetterSpacing}
        />
      </ControlGroup>

      <SidebarSection title="Accessibility" />
      <ControlGroup>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Text
            </div>
            <ColorPicker value={typography.textColor} onChange={setTextColor} label="Text color" />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Background
            </div>
            <ColorPicker value={typography.bgColor} onChange={setBgColor} label="Background color" />
          </div>
        </div>
        <ContrastChecker />
      </ControlGroup>

      <SidebarSection title="Custom Text" />
      <ControlGroup>
        <textarea
          rows={3}
          value={typography.customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="Type your custom preview text…"
          style={{
            width: '100%',
            background: 'var(--bg-2)',
            border: '1px solid var(--line-2)',
            borderRadius: 'var(--radius)',
            color: 'var(--text-0)',
            fontFamily: 'var(--mono)',
            fontSize: 12,
            padding: '8px 12px',
            outline: 'none',
            resize: 'vertical',
            minHeight: 80,
          }}
        />
      </ControlGroup>
    </>
  )
}
