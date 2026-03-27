import { ShadeScaleSection } from './ShadeScaleSection'
import { GreyscaleSection } from './GreyscaleSection'
import { SemanticRolesSection } from './SemanticRolesSection'
import { FontColorsSection } from './FontColorsSection'
import { DataVizSection } from './DataVizSection'
import { ContrastGrid } from './ContrastGrid'

export function ColorsTab() {
  return (
    <>
      <ShadeScaleSection />
      <GreyscaleSection />
      <SemanticRolesSection />
      <FontColorsSection />
      <DataVizSection />
      <ContrastGrid />
    </>
  )
}
