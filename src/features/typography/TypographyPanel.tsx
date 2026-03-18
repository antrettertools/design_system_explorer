import { PreviewCard } from '@/components/layout/PreviewCard'
import { ReadabilityScore } from './ReadabilityScore'
import { TypeSpecimen, TypeScaleTable, CharacterGrid } from './TypeSpecimen'
import { useTypography } from '@/store'

export function TypographyPanel() {
  const { customText } = useTypography()

  return (
    <>
      <ReadabilityScore />

      <PreviewCard title="Type System" subtitle="Heading + body font pair in context">
        <TypeSpecimen />
      </PreviewCard>

      <PreviewCard title="Type Scale" subtitle="Semantic roles mapped to scale steps">
        <TypeScaleTable />
      </PreviewCard>

      {customText && (
        <PreviewCard title="Custom Preview">
          <TypeSpecimen customText={customText} />
        </PreviewCard>
      )}

      <PreviewCard title="Character Sets" subtitle="Both fonts · full glyph coverage">
        <CharacterGrid />
      </PreviewCard>
    </>
  )
}
