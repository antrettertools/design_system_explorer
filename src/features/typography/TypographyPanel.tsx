import { PreviewCard } from '@/components/layout/PreviewCard'
import { ReadabilityScore } from './ReadabilityScore'
import { TypeSpecimen, CharacterGrid } from './TypeSpecimen'
import { FontPairings } from './FontPairings'
import { useTypography } from '@/store'

export function TypographyPanel() {
  const { customText } = useTypography()

  return (
    <>
      <ReadabilityScore />

      <PreviewCard title="Type Specimen">
        <TypeSpecimen />
      </PreviewCard>

      <PreviewCard title="Custom Text Preview">
        <TypeSpecimen customText={customText} />
      </PreviewCard>

      <PreviewCard title="Font Pairings">
        <FontPairings />
      </PreviewCard>

      <PreviewCard title="Character Set">
        <CharacterGrid />
      </PreviewCard>
    </>
  )
}
