import { useTypography } from '@/store'
import { PreviewCard } from '@/components/layout/PreviewCard'
import { ReadabilityScore } from './ReadabilityScore'
import { TypeSpecimen, TypeScaleTable, CharacterGrid } from './TypeSpecimen'

export function TypographyPanel() {
  const { customText } = useTypography()

  return (
    <>
      <ReadabilityScore />

      <PreviewCard title="Type System">
        <TypeSpecimen />
      </PreviewCard>

      <PreviewCard title="Type Scale">
        <TypeScaleTable />
      </PreviewCard>

      {customText && (
        <PreviewCard title="Custom Preview">
          <TypeSpecimen customText={customText} />
        </PreviewCard>
      )}

      <PreviewCard title="Character Sets">
        <CharacterGrid />
      </PreviewCard>
    </>
  )
}
