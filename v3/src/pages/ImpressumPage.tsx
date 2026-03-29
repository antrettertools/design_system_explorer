import { Link } from 'react-router-dom'
import { AppFooter } from '@/components/AppShell/AppFooter'
import styles from './LegalPage.module.css'

export function ImpressumPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.back}>← Back to generator</Link>
        <span className={styles.wordmark}>dsygn.cloud</span>
      </header>

      <div className={styles.content}>
        <h1>Impressum</h1>
        <p className={styles.updated}>Angaben gemäß § 5 TMG / Legal notice</p>

        <h2>Verantwortlich / Responsible</h2>
        <p>
          {/* Replace with your full legal name */}
          [YOUR FULL LEGAL NAME]<br />
          {/* Replace with your registered business address */}
          [STREET ADDRESS]<br />
          [POSTAL CODE] [CITY]<br />
          [COUNTRY]
        </p>

        <h2>Kontakt / Contact</h2>
        <p>
          {/* Replace with your contact email */}
          E-Mail: <a href="mailto:hello@dsygn.cloud">hello@dsygn.cloud</a>
        </p>

        <h2>Umsatzsteuer-ID (if applicable)</h2>
        <p>
          {/*
            If you are registered for VAT (Umsatzsteuer), add your VAT ID here.
            Example: DE123456789
            If you are operating as Kleingewerbe below the Kleinunternehmerregelung
            threshold (§19 UStG), state that instead:
            "Gemäß § 19 UStG wird keine Umsatzsteuer erhoben."
          */}
          Gemäß § 19 UStG wird keine Umsatzsteuer erhoben. {/* Remove this line if VAT-registered */}
        </p>

        <h2>Streitschlichtung / Dispute resolution</h2>
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
          <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">
            https://ec.europa.eu/consumers/odr/
          </a>.
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </div>

      <AppFooter />
    </div>
  )
}
