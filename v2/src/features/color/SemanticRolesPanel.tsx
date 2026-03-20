import { useSemanticTokens } from '@/hooks/useSemanticTokens'
import { useSemanticOverridesActions, useSemanticOverrides } from '@/store'
import type { SemanticRoleId } from '@/core/tokens/types'
import styles from './SemanticRolesPanel.module.css'

const ROLE_GROUPS: Array<{ label: string; roles: SemanticRoleId[] }> = [
  {
    label: 'Interactive',
    roles: ['interactive', 'on-interactive', 'interactive-container', 'on-interactive-container', 'interactive-subtle', 'interactive-hover'],
  },
  {
    label: 'Accent',
    roles: ['accent', 'on-accent', 'accent-container', 'on-accent-container', 'accent-subtle', 'accent-hover'],
  },
  {
    label: 'Surface & Neutral',
    roles: ['background', 'surface', 'surface-raised', 'surface-overlay', 'on-background', 'on-surface', 'on-surface-subtle', 'on-surface-disabled', 'border', 'border-strong', 'scrim', 'shadow-color', 'inverse-surface', 'on-inverse-surface'],
  },
  {
    label: 'Error',
    roles: ['error', 'on-error', 'error-container', 'on-error-container'],
  },
  {
    label: 'Warning',
    roles: ['warning', 'on-warning', 'warning-container', 'on-warning-container'],
  },
  {
    label: 'Success',
    roles: ['success', 'on-success', 'success-container', 'on-success-container'],
  },
  {
    label: 'Info',
    roles: ['info', 'on-info', 'info-container', 'on-info-container'],
  },
]

export function SemanticRolesPanel() {
  const semantic = useSemanticTokens()
  const overrides = useSemanticOverrides()
  const { clearOverride } = useSemanticOverridesActions()

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Semantic Roles</h2>
        <p className={styles.subheading}>42 roles auto-derived from your primary color in OKLCH space.</p>
      </div>
      {ROLE_GROUPS.map(group => (
        <div key={group.label} className={styles.group}>
          <div className={styles.groupLabel}>{group.label}</div>
          <div className={styles.roleList}>
            {group.roles.map(roleId => {
              const val = semantic[roleId]
              const isOverriddenLight = !!overrides.light[roleId]
              const isOverriddenDark = !!overrides.dark[roleId]
              return (
                <div key={roleId} className={styles.roleRow}>
                  <div className={styles.swatches}>
                    <div
                      className={styles.swatch}
                      style={{ background: val.light }}
                      title={`Light: ${val.light}`}
                    />
                    <div
                      className={styles.swatch}
                      style={{ background: val.dark }}
                      title={`Dark: ${val.dark}`}
                    />
                  </div>
                  <div className={styles.roleName}>{roleId}</div>
                  <div className={styles.roleMeta}>
                    {(isOverriddenLight || isOverriddenDark) ? (
                      <>
                        <span className={styles.overrideBadge}>custom</span>
                        <button
                          className={styles.resetBtn}
                          onClick={() => {
                            if (isOverriddenLight) clearOverride('light', roleId)
                            if (isOverriddenDark) clearOverride('dark', roleId)
                          }}
                          aria-label="Reset override"
                        >
                          reset
                        </button>
                      </>
                    ) : (
                      <span className={styles.autoBadge}>auto</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
