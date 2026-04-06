import { useState, useEffect } from 'react'
import { trackEvent } from '@/analytics'
import styles from './DonateModal.module.css'

const DONATE_LINKS = {
  3:      'https://buy.stripe.com/00wdR856i7zlbna9ctdEs00',
  7:      'https://buy.stripe.com/00w3cuaqCbPB3UI0FXdEs01',
  15:     'https://buy.stripe.com/5kQaEWcyKcTF76U4WddEs02',
  custom: 'https://buy.stripe.com/4gM00ieGSdXJ76U0FXdEs03',
} as const

function getDonateUrl(preset: 3 | 7 | 15 | null, customAmount: string): string {
  if (preset !== null) return DONATE_LINKS[preset]
  const cents = Math.round(parseFloat(customAmount) * 100)
  return `${DONATE_LINKS.custom}?prefilled_amount=${cents}`
}

type DonateModalProps = {
  open: boolean
  onClose: () => void
  source: 'footer' | 'dropdown'
}

export function DonateModal({ open, onClose, source }: DonateModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<3 | 7 | 15 | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [customError, setCustomError] = useState<string | null>(null)

  // Fire analytics on open
  useEffect(() => {
    if (open) trackEvent('Donate Modal Open', { source })
  }, [open, source])

  // Reset local state when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedPreset(null)
      setCustomAmount('')
      setCustomError(null)
    }
  }, [open])

  // Dismiss on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const hasSelection = selectedPreset !== null || customAmount.trim() !== ''

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPreset(null)
    setCustomAmount(e.target.value)
    setCustomError(null)
  }

  const handlePresetClick = (amount: 3 | 7 | 15) => {
    setSelectedPreset(amount)
    setCustomAmount('')
    setCustomError(null)
  }

  const handleDonate = () => {
    if (selectedPreset !== null) {
      trackEvent('Donate Click', { amount: selectedPreset })
      window.location.href = getDonateUrl(selectedPreset, '')
      return
    }

    const parsed = parseInt(customAmount, 10)
    if (isNaN(parsed) || parsed < 1 || parsed > 100) {
      setCustomError('Please enter an amount between €1 and €100.')
      return
    }

    trackEvent('Donate Click', { amount: parsed })
    window.location.href = getDonateUrl(null, String(parsed))
  }

  const PRESETS: Array<{ amount: 3 | 7 | 15; label: string }> = [
    { amount: 3,  label: '€3' },
    { amount: 7,  label: '€7' },
    { amount: 15, label: '€15' },
  ]

  return (
    <>
      <div
        className={styles.overlay}
        onClick={onClose}
        aria-hidden="true"
        data-testid="donate-overlay"
      />
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Support the maker"
      >
        <div className={styles.header}>
          <div className={styles.badge}>Buy me a coffee</div>
          <h2 className={styles.heading}>Support this project</h2>
          <p className={styles.sub}>
            dsygn.cloud is built and maintained by one person.
            If it saves you time, a coffee means a lot.
          </p>
        </div>

        <div className={styles.presets}>
          {PRESETS.map(({ amount, label }) => (
            <button
              key={amount}
              className={`${styles.presetBtn} ${selectedPreset === amount ? styles.presetBtnActive : ''}`}
              onClick={() => handlePresetClick(amount)}
              data-testid={`preset-${amount}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className={styles.customRow}>
          <span className={styles.currencySymbol}>€</span>
          <input
            className={`${styles.customInput} ${customAmount && !customError ? styles.customInputActive : ''}`}
            type="number"
            min={1}
            max={100}
            placeholder="Custom"
            value={customAmount}
            onChange={handleCustomChange}
            data-testid="custom-input"
            aria-label="Custom donation amount in euros"
          />
        </div>

        {customError && (
          <p className={styles.customError} data-testid="custom-error">{customError}</p>
        )}

        <div className={styles.footer}>
          <button
            className={styles.donateBtn}
            onClick={handleDonate}
            disabled={!hasSelection}
            data-testid="donate-cta"
          >
            {selectedPreset !== null
              ? `Support with €${selectedPreset} ☕`
              : customAmount
                ? `Support with €${customAmount} ☕`
                : 'Choose an amount'}
          </button>
          <button className={styles.skipBtn} onClick={onClose}>
            Maybe next time
          </button>
        </div>
      </div>
    </>
  )
}
