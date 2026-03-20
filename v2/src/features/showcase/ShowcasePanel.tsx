import type { CSSProperties } from 'react'
import { useUI, useUIActions } from '@/store'
import { useSemanticTokens } from '@/hooks/useSemanticTokens'
import { usePrimitiveTokens } from '@/hooks/usePrimitiveTokens'
import { useTypography } from '@/store'
import { DashboardTemplate } from './templates/DashboardTemplate'
import { MarketingTemplate } from './templates/MarketingTemplate'
import { EditorialTemplate } from './templates/EditorialTemplate'
import { ProductTemplate } from './templates/ProductTemplate'
import type { SemanticTokens } from '@/core/tokens/types'
import type { ShowcaseTemplateId } from '@/store/ui'
import styles from './ShowcasePanel.module.css'

const TEMPLATES: Array<{ id: ShowcaseTemplateId; label: string }> = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'product', label: 'Product' },
]

function buildCssVars(
  semantic: SemanticTokens,
  theme: 'dark' | 'light',
  headingFont: string,
  bodyFont: string,
): CSSProperties {
  const vars: Record<string, string> = {}
  for (const [role, val] of Object.entries(semantic)) {
    vars[`--color-${role}`] = val[theme]
  }
  vars['--font-heading'] = `'${headingFont}', sans-serif`
  vars['--font-body'] = `'${bodyFont}', sans-serif`
  return vars as CSSProperties
}

export function ShowcasePanel() {
  const { theme, showcaseTemplate } = useUI()
  const { setShowcaseTemplate } = useUIActions()
  const semantic = useSemanticTokens()
  const primitive = usePrimitiveTokens()
  const typography = useTypography()

  const headingFont = typography.headingFamily ?? 'Inter'
  const bodyFont = typography.bodyFamily ?? 'Inter'
  const cssVars = buildCssVars(semantic, theme, headingFont, bodyFont)

  return (
    <div className={styles.wrapper}>
      <div className={styles.templateBar}>
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            className={`${styles.templateBtn} ${showcaseTemplate === t.id ? styles.templateBtnActive : ''}`}
            onClick={() => setShowcaseTemplate(t.id)}
          >
            {t.label}
          </button>
        ))}
        <div className={styles.spacer} />
        <span className={styles.themeLabel}>{theme === 'dark' ? 'Dark' : 'Light'} mode</span>
      </div>
      <div
        className={`${styles.templateContainer} ${theme === 'dark' ? styles.dark : styles.light}`}
        style={cssVars}
      >
        {showcaseTemplate === 'dashboard' && <DashboardTemplate primitive={primitive} />}
        {showcaseTemplate === 'marketing' && <MarketingTemplate primitive={primitive} />}
        {showcaseTemplate === 'editorial' && <EditorialTemplate primitive={primitive} />}
        {showcaseTemplate === 'product' && <ProductTemplate primitive={primitive} />}
      </div>
    </div>
  )
}
