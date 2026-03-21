import { FontBrowser } from './FontBrowser'
import { ScaleEditor } from './ScaleEditor'
import { ReadabilityScore } from './ReadabilityScore'
import { CharacterSet } from './CharacterSet'

export function TypographyTab() {
  return (
    <>
      <FontBrowser />
      <ScaleEditor />
      <ReadabilityScore />
      <CharacterSet />
    </>
  )
}
