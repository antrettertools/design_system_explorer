import type { TokenMap } from './types'
import type { ColorSlot } from '@/core/color/types'
import type { FontPairing } from '@/core/typography/types'

interface BrandingPdfOptions {
  designName?: string
  tokens: TokenMap
  colors: ColorSlot[]
  pairing: FontPairing
  scaleRatio: number
}

function getFontUrl(fontName: string, source: FontPairing['source']): string {
  const encoded = encodeURIComponent(fontName)
  switch (source) {
    case 'google':
      return `https://fonts.googleapis.com/css2?family=${encoded}:wght@300;400;500;600;700;800;900&display=swap`
    case 'fontshare':
      return `https://api.fontshare.com/v2/css?f[]=${encoded.toLowerCase().replace(/%20/g, '-')}@400,700&display=swap`
    case 'bunny':
      return `https://fonts.bunny.net/css?family=${encoded.toLowerCase().replace(/%20/g, '-')}:400,700&display=swap`
  }
}

export function openBrandingPdf(opts: BrandingPdfOptions): void {
  const { designName = 'Design System', tokens, colors, pairing, scaleRatio } = opts
  const t = tokens.light

  const cssVars = Object.entries(t).map(([k, v]) => `${k}: ${v};`).join('\n  ')
  const fontUrl1 = getFontUrl(pairing.heading, pairing.source)
  const fontUrl2 = getFontUrl(pairing.body, pairing.source)
  const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

  const swatchRows = colors.map(slot => `
    <div class="swatch">
      <div class="swatch-block" style="background:${slot.hex}"></div>
      <div class="swatch-meta">
        <strong>${slot.name ?? slot.role}</strong>
        <code>${slot.hex}</code>
      </div>
    </div>`).join('')

  const typeRows = [
    { label: 'Display', size: t['--font-display-size'], weight: t['--font-display-weight'] },
    { label: 'H1',      size: t['--font-h1-size'],      weight: t['--font-h1-weight'] },
    { label: 'H2',      size: t['--font-h2-size'],      weight: t['--font-h2-weight'] },
    { label: 'Body',    size: t['--font-body-size'],     weight: t['--font-body-weight'] },
    { label: 'Small',   size: t['--font-small-size'],    weight: t['--font-small-weight'] },
  ].map(({ label, size, weight }) => `
    <tr>
      <td>${label}</td>
      <td style="font-family:'${pairing.heading}',sans-serif;font-size:${size};font-weight:${weight}">The quick brown fox</td>
      <td>${size ?? '—'}</td>
      <td>${weight ?? '—'}</td>
    </tr>`).join('')

  const brandColor = colors[0]?.hex ?? '#6366f1'

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${designName} — Brand Guide</title>
<link rel="stylesheet" href="${fontUrl1}">
<link rel="stylesheet" href="${fontUrl2}">
<style>
  :root { ${cssVars} }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: '${pairing.body}', system-ui, sans-serif;
    background: #fff;
    color: #111;
    padding: 0;
  }
  @media print {
    .cover { page-break-after: always; }
    .section { page-break-inside: avoid; }
  }
  .cover {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 80px;
    background: ${brandColor};
    color: #fff;
  }
  .cover-title {
    font-family: '${pairing.heading}', sans-serif;
    font-size: 56px;
    font-weight: 800;
    letter-spacing: -0.04em;
    line-height: 1;
    margin-bottom: 12px;
  }
  .cover-sub { font-size: 16px; opacity: 0.75; margin-bottom: 48px; }
  .cover-date { font-size: 13px; opacity: 0.6; }
  .cover-credit { margin-top: 8px; font-size: 12px; opacity: 0.5; }
  .content { padding: 64px 80px; }
  .section { margin-bottom: 64px; }
  h2 {
    font-family: '${pairing.heading}', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #aaa;
    margin-bottom: 24px;
  }
  .swatches { display: flex; flex-wrap: wrap; gap: 16px; }
  .swatch { display: flex; flex-direction: column; gap: 8px; }
  .swatch-block { width: 96px; height: 72px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.06); }
  .swatch-meta { display: flex; flex-direction: column; gap: 2px; }
  .swatch-meta strong { font-size: 12px; font-weight: 600; text-transform: capitalize; }
  .swatch-meta code { font-size: 11px; color: #888; }
  table { width: 100%; border-collapse: collapse; }
  th { font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #aaa; text-align: left; padding: 4px 0 8px; }
  td { padding: 10px 0; border-top: 1px solid #f0f0f0; font-size: 13px; }
  td:first-child { font-size: 11px; font-weight: 600; color: #aaa; width: 60px; }
  td:last-child { color: #aaa; font-size: 11px; }
  .font-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
  .font-card { padding: 24px; border: 1px solid #f0f0f0; border-radius: 8px; }
  .font-sample { font-size: 32px; font-weight: 700; margin-bottom: 8px; }
  .font-name { font-size: 12px; color: #aaa; }
</style>
</head>
<body>
<div class="cover">
  <h1 class="cover-title">${designName}</h1>
  <p class="cover-sub">Brand &amp; Design System Guide</p>
  <p class="cover-date">${today}</p>
  <p class="cover-credit">Created with dsygn.cloud</p>
</div>
<div class="content">
  <section class="section">
    <h2>Color Palette</h2>
    <div class="swatches">${swatchRows}</div>
  </section>
  <section class="section">
    <h2>Typography Scale · Ratio ${scaleRatio.toFixed(3)}</h2>
    <table>
      <thead><tr><th>Step</th><th>Sample</th><th>Size</th><th>Weight</th></tr></thead>
      <tbody>${typeRows}</tbody>
    </table>
  </section>
  <section class="section">
    <h2>Font Pairing</h2>
    <div class="font-pair">
      <div class="font-card">
        <div class="font-sample" style="font-family:'${pairing.heading}',sans-serif">Aa</div>
        <div class="font-name">Heading · ${pairing.heading}</div>
      </div>
      <div class="font-card">
        <div class="font-sample" style="font-family:'${pairing.body}',sans-serif">Aa</div>
        <div class="font-name">Body · ${pairing.body}</div>
      </div>
    </div>
  </section>
</div>
</body>
</html>`

  const win = window.open('', '_blank')
  if (!win) {
    alert('Pop-ups are blocked. Please allow pop-ups for dsygn.cloud and try again.')
    return
  }
  win.document.write(html)
  win.document.close()
  // Wait for fonts to load before printing
  win.onload = () => {
    setTimeout(() => win.print(), 600)
  }
}
