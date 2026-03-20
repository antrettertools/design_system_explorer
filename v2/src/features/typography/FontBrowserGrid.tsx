import { useEffect } from 'react'
import { getFontsByCategory } from '@/core/typography/fontDatabase'
import { loadFont, buildFontFamilyStack } from '@/core/typography/fontLoader'
import type { FontCategory, FontDefinition, FontSource } from '@/core/tokens/types'

export type FontRole = 'heading' | 'body'

interface FontBrowserGridProps {
  role: FontRole
  selectedHeading: string
  selectedBody: string
  sourceFilter: 'all' | FontSource
  categoryFilter: 'all' | FontCategory
  search: string
  onSelect: (font: FontDefinition) => void
}

export function FontBrowserGrid({
  role,
  selectedHeading,
  selectedBody,
  sourceFilter,
  categoryFilter,
  search,
  onSelect,
}: FontBrowserGridProps) {
  const allFonts = getFontsByCategory(categoryFilter === 'all' ? 'all' : categoryFilter)
  const filtered = allFonts
    .filter((f) => sourceFilter === 'all' || f.source === sourceFilter)
    .filter((f) => f.name.toLowerCase().includes(search.toLowerCase().trim()))

  useEffect(() => {
    filtered.forEach((f) => loadFont(f))
  }, [filtered.length, sourceFilter, categoryFilter, search]) // eslint-disable-line react-hooks/exhaustive-deps

  if (filtered.length === 0) {
    return (
      <div style={{ padding: '16px 0', fontSize: 11, color: 'var(--chrome-text-subtle)', textAlign: 'center' }}>
        No fonts match "{search}"
      </div>
    )
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 6,
      marginTop: 6,
    }}>
      {filtered.map((font) => (
        <FontCard
          key={font.name}
          font={font}
          isSelectedAsHeading={font.name === selectedHeading}
          isSelectedAsBody={font.name === selectedBody}
          activeRole={role}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

interface FontCardProps {
  font: FontDefinition
  isSelectedAsHeading: boolean
  isSelectedAsBody: boolean
  activeRole: FontRole
  onSelect: (font: FontDefinition) => void
}

function FontCard({ font, isSelectedAsHeading, isSelectedAsBody, activeRole, onSelect }: FontCardProps) {
  const isActiveSelection =
    (activeRole === 'heading' && isSelectedAsHeading) ||
    (activeRole === 'body' && isSelectedAsBody)

  const stack = buildFontFamilyStack(font)

  const srcLabel: Record<FontSource, string> = {
    google: 'GF',
    fontshare: 'FS',
    system: 'SYS',
  }

  const catColor: Record<string, string> = {
    sans: 'var(--chrome-accent)',
    serif: '#a78bfa',
    mono: '#34d399',
  }

  return (
    <div
      onClick={() => onSelect(font)}
      style={{
        padding: '10px 10px 8px',
        borderRadius: 'var(--chrome-radius)',
        border: `1px solid ${isActiveSelection ? 'var(--chrome-accent)' : 'var(--chrome-border)'}`,
        background: isActiveSelection ? 'rgba(232,168,48,0.08)' : 'var(--chrome-surface)',
        cursor: 'pointer',
        transition: 'all 0.12s',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Role badges */}
      <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 3 }}>
        {isSelectedAsHeading && (
          <span style={{
            fontSize: 8,
            fontWeight: 700,
            fontFamily: 'var(--chrome-font-mono)',
            padding: '1px 4px',
            borderRadius: 3,
            background: 'var(--chrome-accent)',
            color: '#000',
            letterSpacing: '0.05em',
          }}>H</span>
        )}
        {isSelectedAsBody && (
          <span style={{
            fontSize: 8,
            fontWeight: 700,
            fontFamily: 'var(--chrome-font-mono)',
            padding: '1px 4px',
            borderRadius: 3,
            background: '#6366f1',
            color: '#fff',
            letterSpacing: '0.05em',
          }}>B</span>
        )}
      </div>

      {/* Font name */}
      <div style={{
        fontFamily: stack,
        fontSize: 15,
        fontWeight: 600,
        color: 'var(--chrome-text)',
        lineHeight: 1.2,
        marginBottom: 3,
        paddingRight: (isSelectedAsHeading || isSelectedAsBody) ? 20 : 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {font.name}
      </div>

      {/* Sample text */}
      <div style={{
        fontFamily: stack,
        fontSize: 11,
        color: 'var(--chrome-text-subtle)',
        marginBottom: 7,
        letterSpacing: '0.01em',
      }}>
        Aa Bb 01 &amp; ?!
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Tag color={catColor[font.category] ?? 'var(--chrome-text-subtle)'}>{font.category.toUpperCase()}</Tag>
        <Tag color="var(--chrome-text-subtle)">{srcLabel[font.source]}</Tag>
        {font.variable && <Tag color="#f59e0b">VAR</Tag>}
      </div>
    </div>
  )
}

function Tag({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{
      fontSize: 8,
      fontWeight: 700,
      fontFamily: 'var(--chrome-font-mono)',
      padding: '2px 5px',
      borderRadius: 3,
      background: `${color}18`,
      color,
      letterSpacing: '0.06em',
    }}>
      {children}
    </span>
  )
}
