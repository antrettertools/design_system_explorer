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

/**
 * Two-column font card grid. Each card previews the font live (loading
 * it via Google Fonts / Fontshare CSS). Shows H / B badges for whichever
 * role the font is currently assigned to. Clicking selects for the active role.
 */
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

  // Load all visible fonts so their names/samples render in the correct typeface
  useEffect(() => {
    filtered.forEach((f) => loadFont(f))
  }, [filtered.length, sourceFilter, categoryFilter, search]) // eslint-disable-line react-hooks/exhaustive-deps

  if (filtered.length === 0) {
    return (
      <div style={{ padding: '16px 0', fontSize: 11, color: 'var(--text-3)', textAlign: 'center' }}>
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
    sans: 'var(--accent)',
    serif: '#a78bfa',
    mono: '#34d399',
  }

  return (
    <div
      onClick={() => onSelect(font)}
      style={{
        padding: '10px 10px 8px',
        borderRadius: 'var(--radius)',
        border: `1px solid ${isActiveSelection ? 'var(--accent)' : 'var(--line)'}`,
        background: isActiveSelection ? 'var(--accent-bg)' : 'var(--bg-2)',
        cursor: 'pointer',
        transition: 'all 0.12s',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Role badges — top-right corner */}
      <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 3 }}>
        {isSelectedAsHeading && (
          <span style={{
            fontSize: 8,
            fontWeight: 700,
            fontFamily: 'var(--mono)',
            padding: '1px 4px',
            borderRadius: 3,
            background: 'var(--accent)',
            color: '#000',
            letterSpacing: '0.05em',
          }}>H</span>
        )}
        {isSelectedAsBody && (
          <span style={{
            fontSize: 8,
            fontWeight: 700,
            fontFamily: 'var(--mono)',
            padding: '1px 4px',
            borderRadius: 3,
            background: '#6366f1',
            color: '#fff',
            letterSpacing: '0.05em',
          }}>B</span>
        )}
      </div>

      {/* Font name in that font */}
      <div style={{
        fontFamily: stack,
        fontSize: 15,
        fontWeight: 600,
        color: 'var(--text-0)',
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
        color: 'var(--text-2)',
        marginBottom: 7,
        letterSpacing: '0.01em',
      }}>
        Aa Bb 01 &amp; ?!
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Tag color={catColor[font.category] ?? 'var(--text-3)'}>{font.category.toUpperCase()}</Tag>
        <Tag color="var(--text-3)">{srcLabel[font.source]}</Tag>
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
      fontFamily: 'var(--mono)',
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
