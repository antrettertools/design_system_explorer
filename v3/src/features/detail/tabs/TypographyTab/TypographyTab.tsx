import { FontPairCard } from './FontPairCard'
import { ScaleEditor } from './ScaleEditor'
import { ReadabilityScore } from './ReadabilityScore'
import { CharacterSet } from './CharacterSet'
import { FontBrowser } from './FontBrowser'

export function TypographyTab() {
  return (
    <>
      <FontPairCard />
      <ScaleEditor />
      <ReadabilityScore />
      <CharacterSet />
      <FontBrowser />
    </>
  )
}
