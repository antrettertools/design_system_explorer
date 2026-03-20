import { useUI, useUIActions } from '@/store'
import type { ShowcaseTemplateId } from '@/store/ui'

const TEMPLATES: Array<{ id: ShowcaseTemplateId; label: string; desc: string }> = [
  { id: 'dashboard', label: 'Dashboard', desc: 'Data-dense SaaS interface' },
  { id: 'marketing', label: 'Marketing', desc: 'Hero + features + CTA' },
  { id: 'editorial', label: 'Editorial', desc: 'Long-form article layout' },
  { id: 'product', label: 'Product', desc: 'E-commerce product grid' },
]

export function ShowcaseSidebar() {
  const { showcaseTemplate } = useUI()
  const { setShowcaseTemplate } = useUIActions()

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--chrome-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Template</div>
      {TEMPLATES.map(t => (
        <button
          key={t.id}
          onClick={() => setShowcaseTemplate(t.id)}
          style={{
            background: showcaseTemplate === t.id ? 'var(--chrome-surface-raised)' : 'none',
            border: `1px solid ${showcaseTemplate === t.id ? 'var(--chrome-accent)' : 'var(--chrome-border)'}`,
            borderRadius: 'var(--chrome-radius)',
            color: showcaseTemplate === t.id ? 'var(--chrome-text)' : 'var(--chrome-text-subtle)',
            cursor: 'pointer',
            fontFamily: 'var(--chrome-font-ui)',
            fontSize: '0.8rem',
            padding: '0.625rem 0.75rem',
            textAlign: 'left',
            transition: 'all 0.15s',
          }}
        >
          <div style={{ fontWeight: 600 }}>{t.label}</div>
          <div style={{ fontSize: '0.7rem', marginTop: '0.2rem', opacity: 0.7 }}>{t.desc}</div>
        </button>
      ))}
    </div>
  )
}
