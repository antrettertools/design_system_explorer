import { EffectsSummaryCard } from './EffectsSummaryCard'
import { ShadowSection } from './ShadowSection'
import { FocusRingSection } from './FocusRingSection'
import { MotionSection } from './MotionSection'

export function EffectsTab() {
  return (
    <>
      <EffectsSummaryCard />
      <ShadowSection />
      <FocusRingSection />
      <MotionSection />
    </>
  )
}
