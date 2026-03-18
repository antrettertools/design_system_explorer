import { getFontByName } from '@/core/typography/fontDatabase'
import { useTypography, useTypographyActions } from '@/store'
import { Slider } from '@/components/controls/Slider'

const AXIS_LABELS: Record<string, string> = {
  wght: 'Weight',
  wdth: 'Width',
  slnt: 'Slant',
  ital: 'Italic',
  opsz: 'Optical Size',
  GRAD: 'Grade',
}

export function AxesPanel() {
  const typography = useTypography()
  const { setFontWeight, setExtraAxis } = useTypographyActions()
  const font = getFontByName(typography.fontFamily)

  if (!font?.axes) {
    return (
      <div style={{ padding: '12px 20px', fontSize: 11, color: 'var(--text-3)' }}>
        No variable axes available for this font.
      </div>
    )
  }

  return (
    <>
      {Object.entries(font.axes).map(([tag, range]) => {
        if (!range) return null
        const isWeight = tag === 'wght'
        const value = isWeight
          ? typography.fontWeight
          : (typography.extraAxes[tag] ?? range.default)
        const label = AXIS_LABELS[tag] ?? tag.toUpperCase()

        return (
          <Slider
            key={tag}
            label={label}
            value={value}
            min={range.min}
            max={range.max}
            step={1}
            displayValue={String(value)}
            onChange={(v) => {
              if (isWeight) setFontWeight(v)
              else setExtraAxis(tag, v)
            }}
          />
        )
      })}
    </>
  )
}
