import { Link } from 'react-router-dom'
import { AppFooter } from '@/components/AppShell/AppFooter'
import styles from './LegalPage.module.css'

export function TermsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.back}>← Back to generator</Link>
        <span className={styles.wordmark}>dsygn.cloud</span>
      </header>

      <div className={styles.content}>
        <h1>Terms of Service</h1>
        <p className={styles.updated}>Last updated: 2026-03-28</p>

        <h2>1. Service description</h2>
        <p>
          dsygn.cloud is a browser-based design system generator available at https://dsygn.cloud.
          The service generates color palettes, typography scales, spacing tokens, and export files.
          It is provided in two tiers: a free tier and a paid lifetime tier.
        </p>

        <h2>2. Free tier</h2>
        <p>
          The free tier provides access to the generator, detail mode, CSS and CSS variables export,
          and up to 3 saved designs in local browser storage (or cloud storage for registered accounts).
          No credit card is required.
        </p>

        <h2>3. Paid lifetime tier</h2>
        <p>
          The paid tier is available as a one-time payment of €29 (early bird) or €49 (regular).
          Payment is processed by Stripe. The lifetime tier includes: all export formats, unlimited
          cloud saves, ZIP download, custom CSS variable prefix, hosted design system page,
          branding document PDF, and design version history.
        </p>

        <h2>4. Payment terms and right of withdrawal</h2>
        <p>
          All prices include applicable VAT. Payment is collected via Stripe at the time of purchase.
          The license is personal and non-transferable.
        </p>
        <p>
          <strong>
            By completing this purchase you acknowledge that digital content is delivered immediately
            upon payment and you expressly waive your 14-day right of withdrawal under EU consumer law
            (Article 16(m) of Directive 2011/83/EU), as confirmed at checkout.
          </strong>
        </p>
        <p>
          All sales are final and non-refundable. If you experience a technical issue that prevents
          you from using the service, please contact us at the email address in the Impressum.
        </p>

        <h2>5. User accounts and data</h2>
        <p>
          Accounts are created via GitHub or Google OAuth. You own your design data. We store it
          solely to provide the cloud save and hosted page features. You can delete your account
          and all associated data at any time by contacting us.
        </p>

        <h2>6. Hosted design system pages</h2>
        <p>
          Paid users may publish designs to a public URL (dsygn.cloud/s/username/slug).
          Published pages carry a "Built with dsygn.cloud" attribution link. You retain all rights
          to your design content. We do not claim ownership of any designs you create.
        </p>

        <h2>7. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Reverse-engineer, copy, or redistribute the service or its code</li>
          <li>Use the service to create content that violates applicable law</li>
          <li>Attempt to circumvent payment gates or access controls</li>
          <li>Share login credentials with others</li>
        </ul>

        <h2>8. Availability and changes</h2>
        <p>
          We aim for continuous availability but do not guarantee uptime. We reserve the right to
          change the feature set, pricing, or service. Existing paid users will not lose access
          to features available at the time of their purchase unless we discontinue the service
          entirely, in which case we will provide reasonable notice.
        </p>

        <h2>9. Limitation of liability</h2>
        <p>
          The service is provided "as is." To the maximum extent permitted by applicable law,
          we are not liable for any indirect, incidental, or consequential damages arising from
          your use of the service.
        </p>

        <h2>10. Governing law</h2>
        <p>
          These terms are governed by the laws of the jurisdiction specified in the Impressum.
          Any disputes shall be subject to the exclusive jurisdiction of the courts of that jurisdiction.
        </p>

        <h2>11. Contact</h2>
        <p>
          For questions about these Terms, please see our <Link to="/impressum">Impressum</Link> for contact details.
        </p>
      </div>

      <AppFooter />
    </div>
  )
}
