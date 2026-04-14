import { Link } from 'react-router-dom'
import { AppFooter } from '@/components/AppShell/AppFooter'
import styles from './LegalPage.module.css'

export function PrivacyPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.back}>← Back to dsygn.cloud</Link>
        <Link to="/" className={styles.wordmark}>dsygn.cloud</Link>
      </header>

      <div className={styles.content}>
        <h1>Privacy Policy</h1>
        <p className={styles.updated}>Last updated: 2026-04-14</p>

        <h2>1. Controller</h2>
        <p>
          The controller responsible for processing your personal data under the GDPR is:<br />
          <strong>Florian Antretter</strong><br />
          Hochriesstr. 3<br />
          83064 Raubling<br />
          Germany<br />
          E-Mail: <a href="mailto:hello@dsygn.cloud">hello@dsygn.cloud</a>
        </p>

        <h2>2. What data we collect and why</h2>

        <h2>2.1 Account data (if you sign in)</h2>
        <p>
          When you sign in via GitHub or Google OAuth, we receive your name, email address,
          and profile picture from the OAuth provider. We store this to identify your account,
          associate your saved designs with your profile, and display your username on hosted
          design system pages.
        </p>
        <p>
          <strong>Legal basis:</strong> Performance of a contract (Art. 6(1)(b) GDPR) — your
          account is necessary to provide cloud saves and hosted pages.
        </p>

        <h2>2.2 Design data</h2>
        <p>
          Designs you save (color palettes, typography scales, tokens) are stored in our database
          (Supabase, hosted in Frankfurt, Germany / EU). Free accounts may store up to 3 designs;
          paid accounts have unlimited storage. You own your design data entirely.
        </p>
        <p>
          <strong>Legal basis:</strong> Performance of a contract (Art. 6(1)(b) GDPR).
        </p>

        <h2>2.3 Payment data</h2>
        <p>
          Payments for the Lifetime tier are processed by <strong>Stripe, Inc.</strong> We never
          receive or store your card details. Stripe may process your name, email, and billing
          address as required for payment processing and fraud prevention. See{' '}
          <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">
            Stripe's Privacy Policy
          </a>
          .
        </p>
        <p>
          We store only: whether your account has paid status (a boolean flag), and your Stripe
          customer ID for subscription management.
        </p>
        <p>
          <strong>Legal basis:</strong> Performance of a contract (Art. 6(1)(b) GDPR).
        </p>

        <h2>2.4 Analytics</h2>
        <p>
          We use <strong>Plausible Analytics</strong> — a privacy-first, cookie-free analytics
          service hosted in the EU. Plausible does not track individuals, does not set cookies,
          and does not collect IP addresses or personal identifiers. It counts aggregated page
          views and custom events only. No consent banner is required.
        </p>
        <p>
          <strong>Legal basis:</strong> Legitimate interest (Art. 6(1)(f) GDPR) — understanding
          aggregate usage to improve the service.
        </p>

        <h2>2.5 Technical logs</h2>
        <p>
          Our hosting infrastructure (Vercel) may log standard HTTP request data (IP address,
          user agent, timestamp) for security and debugging purposes. These logs are retained
          for a short period and are not used for profiling.
        </p>

        <h2>3. Data processors (sub-processors)</h2>
        <p>We use the following sub-processors to deliver the service:</p>
        <ul>
          <li>
            <strong>Supabase</strong> — database and authentication (Frankfurt, Germany, EU).
            Data is stored within the EU.
          </li>
          <li>
            <strong>Vercel</strong> — hosting and serverless functions (primarily EU regions).
          </li>
          <li>
            <strong>Stripe</strong> — payment processing (global, with Standard Contractual Clauses
            for international transfers).
          </li>
          <li>
            <strong>Plausible Analytics</strong> — privacy-first analytics (EU).
          </li>
          <li>
            <strong>GitHub / Google</strong> — OAuth authentication. Only your public profile
            data is shared with us at sign-in.
          </li>
        </ul>

        <h2>4. Data retention</h2>
        <p>
          Account and design data is retained until you delete your account. You may request
          deletion at any time by emailing{' '}
          <a href="mailto:hello@dsygn.cloud">hello@dsygn.cloud</a>. We will delete all personal
          data within 30 days of a confirmed deletion request, unless we are legally obliged to
          retain it longer.
        </p>

        <h2>5. Cookies</h2>
        <p>
          dsygn.cloud does not use tracking cookies. We use browser <code>localStorage</code> and{' '}
          <code>sessionStorage</code> to store your current design system state and anonymous
          session data locally on your device. This data never leaves your browser unless you
          explicitly save a design to the cloud.
        </p>

        <h2>6. Your rights under GDPR</h2>
        <p>As a person in the EU/EEA, you have the right to:</p>
        <ul>
          <li><strong>Access</strong> — request a copy of the personal data we hold about you.</li>
          <li><strong>Rectification</strong> — request correction of inaccurate data.</li>
          <li><strong>Erasure</strong> — request deletion of your data ("right to be forgotten").</li>
          <li><strong>Portability</strong> — receive your data in a structured, machine-readable format.</li>
          <li><strong>Restriction</strong> — request that we limit how we process your data.</li>
          <li><strong>Objection</strong> — object to processing based on legitimate interest.</li>
          <li>
            <strong>Withdraw consent</strong> — where processing is based on consent, you may
            withdraw it at any time without affecting prior processing.
          </li>
        </ul>
        <p>
          To exercise any of these rights, email{' '}
          <a href="mailto:hello@dsygn.cloud">hello@dsygn.cloud</a>. We will respond within 30 days.
          You also have the right to lodge a complaint with your local supervisory authority. In
          Germany, this is the{' '}
          <a href="https://www.bfdi.bund.de" target="_blank" rel="noopener noreferrer">
            Bundesbeauftragte für den Datenschutz und die Informationsfreiheit (BfDI)
          </a>
          .
        </p>

        <h2>7. International transfers</h2>
        <p>
          Our primary data processing occurs within the EU (Supabase Frankfurt). Where sub-processors
          operate outside the EU/EEA, we rely on Standard Contractual Clauses (SCCs) or adequacy
          decisions as the transfer mechanism.
        </p>

        <h2>8. Children's privacy</h2>
        <p>
          dsygn.cloud is not directed at children under 16. We do not knowingly collect personal
          data from children. If you believe we have inadvertently collected such data, please
          contact us immediately.
        </p>

        <h2>9. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Material changes will be announced
          on this page with an updated date. Continued use of the service after changes constitute
          acceptance of the revised policy.
        </p>

        <h2>10. Contact</h2>
        <p>
          Privacy enquiries:{' '}
          <a href="mailto:hello@dsygn.cloud">hello@dsygn.cloud</a>
          <br />
          Postal address: see <Link to="/impressum">Impressum</Link>.
        </p>
      </div>

      <AppFooter />
    </div>
  )
}
