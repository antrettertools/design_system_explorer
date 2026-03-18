import { getPairingCandidates, getFontByName } from '@/core/typography/fontDatabase'
import { loadFont, buildFontFamilyStack } from '@/core/typography/fontLoader'
import { useTypography, useTypographyActions } from '@/store'
import { Button } from '@/components/controls/Button'
import { useLoadFont } from '@/hooks/useFont'
import styles from './FontPairings.module.css'

export function FontPairings() {
  const { fontFamily, fontWeight } = useTypography()
  const { setFont } = useTypographyActions()
  const primaryFont = getFontByName(fontFamily)
  const pairings = getPairingCandidates(fontFamily)

  if (pairings.length === 0) {
    return (
      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
        No pairing suggestions for this font.
      </div>
    )
  }

  return (
    <div className={styles.list}>
      {pairings.slice(0, 3).map((pair) => (
        <PairingRow
          key={pair.name}
          primaryFamily={fontFamily}
          primaryWeight={fontWeight}
          primaryFamilyStack={
            primaryFont
              ? buildFontFamilyStack(primaryFont)
              : `'${fontFamily}', sans-serif`
          }
          pairFont={pair.name}
          onSwap={() => {
            loadFont(pair)
            setFont(pair.name, pair.category)
          }}
        />
      ))}
    </div>
  )
}

function PairingRow({
  primaryFamily,
  primaryWeight,
  primaryFamilyStack,
  pairFont,
  onSwap,
}: {
  primaryFamily: string
  primaryWeight: number
  primaryFamilyStack: string
  pairFont: string
  onSwap: () => void
}) {
  useLoadFont(pairFont)
  const pair = getFontByName(pairFont)
  const pairStack = pair ? buildFontFamilyStack(pair) : `'${pairFont}', sans-serif`

  return (
    <div className={styles.row}>
      <div className={styles.info}>
        <div
          className={styles.primary}
          style={{ fontFamily: primaryFamilyStack, fontWeight: primaryWeight }}
        >
          {primaryFamily}
        </div>
        <div className={styles.secondary} style={{ fontFamily: pairStack }}>
          paired with {pairFont}
        </div>
        <div className={styles.meta}>
          {pair?.category} · {pair?.source}
          {pair?.variable ? ' · VAR' : ''}
        </div>
      </div>
      <Button variant="secondary" size="sm" onClick={onSwap}>
        ↔ Swap
      </Button>
    </div>
  )
}
