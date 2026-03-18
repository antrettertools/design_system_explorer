import { useComponents } from '@/store'
import { useTokens } from '@/hooks/useTokens'
import { shadowToCss } from '@/core/shadow/presets'

export function ComponentsPanel() {
  const components = useComponents()
  const tokens = useTokens()

  const r = `${components.radius}px`
  const primary = tokens.primaryBrand.hex
  const secondary = tokens.secondaryBrand.hex

  const sizePad = components.size === 'sm'
    ? '6px 14px'
    : components.size === 'lg'
      ? '13px 28px'
      : '10px 20px'
  const sizeFontSize = components.size === 'sm' ? 12 : components.size === 'lg' ? 16 : 14

  const btnBase: React.CSSProperties = {
    borderRadius: r,
    padding: sizePad,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 500,
    margin: 4,
    fontSize: sizeFontSize,
    fontFamily: 'inherit',
    transition: 'all 0.15s',
    display: 'inline-flex',
    alignItems: 'center',
  }

  const shadow = shadowToCss(tokens.elevation.md)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      {/* Buttons */}
      <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16, fontFamily: 'var(--sans)' }}>
          Buttons
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {renderButtons(components.buttonStyle, btnBase, primary, secondary)}
        </div>
      </div>

      {/* Form Inputs */}
      <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16, fontFamily: 'var(--sans)' }}>
          Form Inputs
        </div>
        {['Email address', 'Password'].map((placeholder, i) => (
          <input
            key={i}
            placeholder={placeholder}
            type={i === 1 ? 'password' : 'text'}
            readOnly
            style={{
              width: '100%',
              padding: '9px 13px',
              border: '1px solid var(--line-2)',
              borderRadius: r,
              background: 'var(--bg-2)',
              color: 'var(--text-0)',
              fontSize: sizeFontSize,
              outline: 'none',
              marginBottom: 8,
              fontFamily: 'var(--mono)',
            }}
          />
        ))}
        <select
          style={{
            width: '100%',
            padding: '9px 13px',
            border: '1px solid var(--line-2)',
            borderRadius: r,
            background: 'var(--bg-2)',
            color: 'var(--text-0)',
            fontSize: sizeFontSize,
            cursor: 'pointer',
            fontFamily: 'var(--mono)',
          }}
        >
          <option>Select option</option>
          <option>Option A</option>
          <option>Option B</option>
        </select>
      </div>

      {/* Cards */}
      <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16, fontFamily: 'var(--sans)' }}>
          Cards
        </div>
        <div
          style={{
            background: 'var(--bg-2)',
            borderRadius: r,
            padding: 16,
            border: '1px solid var(--line)',
            boxShadow: shadow,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: r,
              background: primary,
              opacity: 0.2,
              marginBottom: 10,
            }}
          />
          <div style={{ fontWeight: 600, fontSize: sizeFontSize, marginBottom: 4 }}>Card Title</div>
          <div style={{ fontSize: sizeFontSize * 0.85, color: 'var(--text-2)', lineHeight: 1.5 }}>
            Supporting text provides context and description for this card component.
          </div>
        </div>
      </div>

      {/* Badges */}
      <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16, fontFamily: 'var(--sans)' }}>
          Badges & Tags
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {[
            { label: 'Primary', bg: `${primary}26`, color: primary },
            { label: 'Secondary', bg: `${secondary}26`, color: secondary },
            { label: 'Success', bg: 'var(--app-green-bg)', color: 'var(--app-green)' },
            { label: 'Error', bg: 'var(--app-red-bg)', color: 'var(--app-red)' },
            { label: 'Warning', bg: 'var(--accent-bg)', color: 'var(--accent)' },
          ].map(({ label, bg, color }) => (
            <span
              key={label}
              style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: 100,
                fontSize: sizeFontSize * 0.78,
                fontWeight: 600,
                background: bg,
                color,
              }}
            >
              {label}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
          {['Tag', 'Label', 'Category', 'Active'].map((label, i) => (
            <span
              key={label}
              style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: r,
                fontSize: sizeFontSize * 0.78,
                fontWeight: 500,
                background: i === 3 ? primary : 'var(--bg-3)',
                color: i === 3 ? '#111' : 'var(--text-2)',
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function renderButtons(
  style: string,
  base: React.CSSProperties,
  primary: string,
  secondary: string,
): React.ReactNode[] {
  if (style === 'filled') {
    return [
      <button key="p" style={{ ...base, background: primary, color: '#111' }}>Primary</button>,
      <button key="s" style={{ ...base, background: secondary, color: '#111' }}>Secondary</button>,
      <button key="d" style={{ ...base, background: 'var(--bg-4)', color: 'var(--text-0)' }}>Default</button>,
      <button key="e" style={{ ...base, background: 'var(--app-red)', color: '#fff' }}>Danger</button>,
    ]
  }
  if (style === 'outline') {
    return [
      <button key="p" style={{ ...base, background: 'none', border: `2px solid ${primary}`, color: primary }}>Primary</button>,
      <button key="s" style={{ ...base, background: 'none', border: `2px solid ${secondary}`, color: secondary }}>Secondary</button>,
      <button key="d" style={{ ...base, background: 'none', border: '2px solid var(--line-2)', color: 'var(--text-1)' }}>Default</button>,
      <button key="e" style={{ ...base, background: 'none', border: '2px solid var(--app-red)', color: 'var(--app-red)' }}>Danger</button>,
    ]
  }
  return [
    <button key="p" style={{ ...base, background: 'none', color: primary }}>Primary →</button>,
    <button key="s" style={{ ...base, background: 'none', color: secondary }}>Secondary →</button>,
    <button key="d" style={{ ...base, background: 'none', color: 'var(--text-1)' }}>Default</button>,
    <button key="e" style={{ ...base, background: 'none', color: 'var(--app-red)' }}>Danger</button>,
  ]
}
