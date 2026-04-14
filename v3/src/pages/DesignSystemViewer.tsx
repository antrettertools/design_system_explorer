import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { trackEvent } from '@/analytics'
import { supabase } from '@/lib/supabase'
import { buildTokenMap } from '@/store/derived'
import { deriveTypeScale } from '@/core/typography/scale'
import { loadActivePairing } from '@/core/typography/fontLoader'
import { defaultSpacingState } from '@/store/spacing'
import { defaultEffectsState } from '@/store/effects'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import type { ShareSnapshot } from '@/core/share/types'
import type { ColorSlot } from '@/core/color/types'
import styles from './DesignSystemViewer.module.css'

interface PublicDesign {
  id: string
  name: string
  data: ShareSnapshot
  slug: string
  username: string
}

/** Relative luminance per WCAG 2.1 */
function getLuminance(hex: string): number {
  const rgb = hex.replace('#', '').match(/.{2}/g)!.map(c => {
    const v = parseInt(c, 16) / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]
}

function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1)
  const l2 = getLuminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function contrastBadge(ratio: number): string {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  if (ratio >= 3) return 'AA Large'
  return 'Fail'
}

function ViewerErrorFallback() {
  return (
    <div className={styles.state}>
      <p className={styles.notFoundText}>Something went wrong rendering this design system.</p>
      <a href="/" className={styles.ctaLink}>Go to dsygn.cloud →</a>
    </div>
  )
}

function DesignSystemViewerContent() {
  const { username, slug } = useParams<{ username: string; slug: string }>()
  const [design, setDesign] = useState<PublicDesign | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!username || !slug) return

    async function load() {
      setLoading(true)
      try {
        // Get user id by username
        const { data: user, error: userErr } = await supabase
          .from('users')
          .select('id')
          .eq('username', username)
          .single()

        if (userErr || !user) { setNotFound(true); return }

        // Get the public design
        const { data: row, error: designErr } = await supabase
          .from('designs')
          .select('id, name, data, slug')
          .eq('user_id', user.id)
          .eq('slug', slug)
          .eq('is_public', true)
          .single()

        if (designErr || !row) { setNotFound(true); return }

        setDesign({ id: row.id, name: row.name, data: row.data as ShareSnapshot, slug: row.slug, username: username! })
        trackEvent('Hosted Page View', { username: username ?? '', slug: slug ?? '' })
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [username, slug])

  // Derive tokens from the snapshot — memoized so this only reruns when design changes
  const tokens = useMemo(() => {
    if (!design) return null
    const snap = design.data
    const typeScale = deriveTypeScale({ ratio: snap.scaleRatio })
    return buildTokenMap(
      snap.colors,
      typeScale,
      snap.pairing,
      5,
      defaultSpacingState,
      defaultEffectsState,
      {},
      snap.theme,
    )
  }, [design])

  const tokenSet = useMemo(() => {
    if (!tokens || !design) return null
    return design.data.theme === 'dark' ? tokens.dark : tokens.light
  }, [tokens, design])

  // Load fonts + inject tokens as CSS custom properties on the viewer container
  useEffect(() => {
    if (!design || !tokens) return
    const snap = design.data
    loadActivePairing(snap.pairing)

    const style = document.getElementById('viewer-tokens') as HTMLStyleElement | null
      ?? Object.assign(document.createElement('style'), { id: 'viewer-tokens' })
    const tokenSet = snap.theme === 'dark' ? tokens.dark : tokens.light
    style.textContent = `.viewer-tokens {\n${
      Object.entries(tokenSet).map(([k, v]) => `  ${k}: ${v};`).join('\n')
    }\n}`
    if (!style.parentNode) document.head.appendChild(style)

    document.title = `${design.name} — dsygn.cloud`
    return () => {
      style.textContent = ''
      document.title = 'dsygn.cloud'
    }
  }, [design, tokens])

  // Inject OG meta tags for social sharing
  useEffect(() => {
    if (!design) return

    const brandColors = design.data.colors
      .slice(0, 6)
      .map(c => encodeURIComponent(c.hex))
      .join(',')

    const ogImageUrl =
      `${window.location.origin}/api/og-image` +
      `?colors=${brandColors}` +
      `&name=${encodeURIComponent(design.name)}`

    const metas: [string, string][] = [
      ['og:title',       `${design.name} — dsygn.cloud`],
      ['og:description', `A design system by ${design.username} · ${design.data.colors.length} colors · Built with dsygn.cloud`],
      ['og:image',       ogImageUrl],
      ['og:url',         window.location.href],
      ['og:type',        'website'],
      ['twitter:card',   'summary_large_image'],
      ['twitter:title',  `${design.name} — dsygn.cloud`],
      ['twitter:image',  ogImageUrl],
    ]

    const injected: HTMLMetaElement[] = []
    // Track pre-existing tags that were mutated so we can restore them on cleanup
    const restored: Array<{ el: Element; prevContent: string | null }> = []

    for (const [property, content] of metas) {
      const attr = property.startsWith('twitter:') ? 'name' : 'property'
      const existing = document.querySelector(`meta[${attr}="${property}"]`)
      if (existing) {
        const prevContent = existing.getAttribute('content')
        existing.setAttribute('content', content)
        restored.push({ el: existing, prevContent })
      } else {
        const meta = document.createElement('meta')
        meta.setAttribute(attr, property)
        meta.setAttribute('content', content)
        document.head.appendChild(meta)
        injected.push(meta)
      }
    }

    return () => {
      // Remove newly created tags
      for (const meta of injected) {
        meta.parentNode?.removeChild(meta)
      }
      // Restore pre-existing tags to their original content
      for (const { el, prevContent } of restored) {
        if (prevContent !== null) {
          el.setAttribute('content', prevContent)
        } else {
          el.removeAttribute('content')
        }
      }
    }
  }, [design])

  if (loading) return (
    <div className={styles.state}>Loading design system…</div>
  )

  if (notFound) return (
    <div className={styles.state}>
      <p className={styles.notFoundText}>Design system not found.</p>
      <Link to="/" className={styles.ctaLink}>Build yours free at dsygn.cloud →</Link>
    </div>
  )

  if (!design) return null

  const snap = design.data
  const brandHex = snap.colors[0]?.hex ?? '#888'

  return (
    <div
      className={`viewer-tokens ${styles.page}`}
      data-theme={snap.theme}
    >
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.designName}>{design.name}</h1>
            <p className={styles.byLine}>by {design.username}</p>
          </div>
          <a
            href="/"
            className={styles.builtWith}
            target="_blank"
            rel="noopener noreferrer"
          >
            Built with dsygn.cloud
          </a>
        </div>
      </header>

      <main className={styles.content}>
        {/* Color Palette */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Colors</h2>
          <div className={styles.swatches}>
            {snap.colors.map((slot: ColorSlot) => {
              const ratioWhite = getContrastRatio(slot.hex, '#ffffff')
              const ratioBlack = getContrastRatio(slot.hex, '#000000')
              const bestRatio = Math.max(ratioWhite, ratioBlack)
              return (
                <div key={slot.id} className={styles.swatch}>
                  <div
                    className={styles.swatchColor}
                    style={{ background: slot.hex }}
                  />
                  <div className={styles.swatchInfo}>
                    <span className={styles.swatchRole}>{slot.name ?? slot.role}</span>
                    <span className={styles.swatchHex}>{slot.hex}</span>
                    <span className={`${styles.swatchContrast} ${bestRatio >= 4.5 ? styles.pass : styles.fail}`}>
                      {contrastBadge(bestRatio)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Typography */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Typography</h2>
          <p className={styles.typeMeta}>
            {snap.pairing.heading} / {snap.pairing.body} · Ratio {snap.scaleRatio.toFixed(3)}
          </p>
          {tokens && (
            <div className={styles.typeSpecimens}>
              {[
                { label: 'Display', varSize: '--font-display-size', varWeight: '--font-display-weight' },
                { label: 'H1',      varSize: '--font-h1-size',      varWeight: '--font-h1-weight' },
                { label: 'H2',      varSize: '--font-h2-size',      varWeight: '--font-h2-weight' },
                { label: 'Body',    varSize: '--font-body-size',     varWeight: '--font-body-weight' },
                { label: 'Small',   varSize: '--font-small-size',    varWeight: '--font-small-weight' },
              ].map(({ label, varSize, varWeight }) => (
                <div key={label} className={styles.typeRow}>
                  <span className={styles.typeLabel}>{label}</span>
                  <span
                    className={styles.typeSpecimen}
                    style={{
                      fontFamily: `"${snap.pairing.heading}", sans-serif`,
                      fontSize: `var(${varSize})`,
                      fontWeight: `var(${varWeight})`,
                    }}
                  >
                    The quick brown fox
                  </span>
                  <span className={styles.typeMeta}>
                    {tokenSet?.[varSize] ?? '—'} · {tokenSet?.[varWeight] ?? '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Spacing */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Spacing</h2>
          <div className={styles.spacingScale}>
            {[2, 4, 6, 8, 10, 12].map(step => {
              const varName = `--ui-space-${step}`
              const value = tokenSet?.[varName] ?? `${step * 4}px`
              return (
                <div key={step} className={styles.spacingRow}>
                  <div
                    className={styles.spacingBar}
                    style={{ width: value, background: brandHex, opacity: 0.7 }}
                  />
                  <span className={styles.spacingLabel}>{varName}</span>
                  <span className={styles.spacingValue}>{value}</span>
                </div>
              )
            })}
          </div>
        </section>

        {/* Export CTA */}
        <section className={`${styles.section} ${styles.ctaSection}`}>
          <h2 className={styles.ctaHeading}>Use this design system</h2>
          <p className={styles.ctaBody}>
            Generate your own in seconds — free at dsygn.cloud
          </p>
          <a href="/" className={styles.ctaBtn} style={{ background: brandHex }}>
            Start building →
          </a>
        </section>
      </main>
    </div>
  )
}

export function DesignSystemViewer() {
  return (
    <ErrorBoundary fallback={<ViewerErrorFallback />}>
      <DesignSystemViewerContent />
    </ErrorBoundary>
  )
}
