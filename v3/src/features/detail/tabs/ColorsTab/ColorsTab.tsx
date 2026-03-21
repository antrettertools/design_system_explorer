import { ShadeScaleSection } from './ShadeScaleSection'
import { SemanticRolesSection } from './SemanticRolesSection'
import { DataVizSection } from './DataVizSection'
import { ContrastGrid } from './ContrastGrid'

export function ColorsTab() {
  return (
    <>
      <ShadeScaleSection />
      <SemanticRolesSection />
      <DataVizSection />
      <ContrastGrid />
    </>
  )
}
