import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AppFooter } from '@/components/AppShell/AppFooter'
import styles from './LegalPage.module.css'

export function PrivacyPage() {
  useEffect(() => {
    // Load the Iubenda embed script
    // Replace 'YOUR_IUBENDA_SITE_ID' with your actual Iubenda policy ID
    // Get it from: https://www.iubenda.com/en/dashboard → your policy → Embed → Privacy Policy
    const existing = document.getElementById('iubenda-loader')
    if (existing) return

    const script = document.createElement('script')
    script.id = 'iubenda-loader'
    script.src = 'https://cdn.iubenda.com/iubenda.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      // Don't remove the script on unmount — Iubenda registers global handlers
    }
  }, [])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.back}>← Back to generator</Link>
        <span className={styles.wordmark}>dsygn.cloud</span>
      </header>

      <div className={styles.content}>
        <h1>Privacy Policy</h1>
        <p className={styles.updated}>Last updated: 2026-03-28</p>

        {/*
          Replace the <a> tag href and text below with the embed code from your Iubenda dashboard.
          Iubenda Dashboard → your policy → Embed → "Privacy Policy" → copy the <a> tag.

          Example:
          <a href="https://www.iubenda.com/privacy-policy/YOUR_POLICY_ID"
             className="iubenda-white iubenda-noiframe iubenda-embed"
             title="Privacy Policy">Privacy Policy</a>

          The Iubenda script (loaded above) will replace this <a> tag with the full policy text.
        */}
        <a
          href="https://www.iubenda.com/privacy-policy/YOUR_POLICY_ID"
          className="iubenda-white iubenda-noiframe iubenda-embed"
          title="Privacy Policy"
        >
          Privacy Policy
        </a>

        {/* Fallback content shown before Iubenda loads or if script is blocked */}
        <noscript>
          <p>
            Please visit <a href="https://www.iubenda.com/privacy-policy/YOUR_POLICY_ID">our Privacy Policy</a> to read our full policy.
          </p>
        </noscript>
      </div>

      <AppFooter />
    </div>
  )
}
