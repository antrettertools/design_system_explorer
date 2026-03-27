import { useComponentTokensActions } from '@/store'
import { useComponentTokens } from '@/hooks/useComponentTokens'
import { DEFAULT_COMPONENT_TOKENS } from '@/core/components/defaults'
import styles from './ComponentTokenMap.module.css'

interface ComponentTokenMapProps {
  componentKey: string
}

export function ComponentTokenMap({ componentKey }: ComponentTokenMapProps) {
  const tokens = useComponentTokens()
  const { setComponentToken, resetComponent } = useComponentTokensActions()

  const componentTokens = tokens[componentKey] ?? {}
  const defaults = DEFAULT_COMPONENT_TOKENS[componentKey] ?? {}
  const isOverridden = (tokenName: string) => defaults[tokenName] !== componentTokens[tokenName]
  const hasAnyOverride = Object.keys(componentTokens).some(k => isOverridden(k))

  return (
    <div className={styles.map}>
      <div className={styles.mapHeader}>
        <div className={styles.mapTitle}>{componentKey.replace(/-/g, ' ')}</div>
        {hasAnyOverride && (
          <button className={styles.resetAllBtn} onClick={() => resetComponent(componentKey)}>
            Reset all
          </button>
        )}
      </div>
      <div className={styles.tokenList}>
        {Object.entries(componentTokens).map(([tokenName, value]) => {
          const overridden = isOverridden(tokenName)
          return (
            <div key={tokenName} className={`${styles.tokenRow} ${overridden ? styles.overridden : ''}`}>
              <div className={styles.tokenName}>{tokenName}</div>
              <div className={styles.tokenValue} title={value}>{value}</div>
              {overridden && (
                <button
                  className={styles.resetBtn}
                  onClick={() => setComponentToken(componentKey, tokenName, defaults[tokenName])}
                  aria-label="Reset token"
                >
                  ↺
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
