import { Link } from 'react-router-dom'
import { AppFooter } from '@/components/AppShell/AppFooter'
import styles from './LegalPage.module.css'

export function ImpressumPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.back}>← Back to dsygn.cloud</Link>
        <Link to="/" className={styles.wordmark}>dsygn.cloud</Link>
      </header>

      <div className={styles.content}>
        <h1>Legal Notice (Impressum)</h1>
        <p className={styles.updated}>Information pursuant to § 5 TMG (German Telemedia Act)</p>

        <h2>Service Provider</h2>
        <p>
          <strong>Florian Antretter</strong><br />
          Hochriesstr. 3<br />
          83064 Raubling<br />
          Germany
        </p>

        <h2>Contact</h2>
        <p>
          E-Mail: <a href="mailto:hello@dsygn.cloud">hello@dsygn.cloud</a>
        </p>

        <h2>VAT</h2>
        <p>
          Pursuant to § 19 UStG (German Value Added Tax Act — small business regulation),
          VAT is not charged and is therefore not shown separately.
        </p>

        <h2>Responsible for Content</h2>
        <p>
          Responsible for editorial content pursuant to § 18 (2) MStV (German Interstate
          Media Treaty):<br />
          <strong>Florian Antretter</strong>, address as above.
        </p>

        <h2>EU Online Dispute Resolution</h2>
        <p>
          The European Commission provides a platform for online dispute resolution (ODR):{' '}
          <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">
            https://ec.europa.eu/consumers/odr/
          </a>.<br />
          Our e-mail address can be found above.
        </p>
        <p>
          We are neither willing nor obliged to participate in dispute resolution proceedings
          before a consumer arbitration board.
        </p>

        <h2>Liability for Content</h2>
        <p>
          As a service provider we are responsible for our own content on these pages in
          accordance with general law pursuant to § 7 (1) TMG. According to §§ 8–10 TMG,
          however, we are not obligated to monitor transmitted or stored third-party information
          or to investigate circumstances that indicate illegal activity.
        </p>
        <p>
          Obligations to remove or block the use of information under general law remain
          unaffected. However, liability in this respect is only possible from the time of
          knowledge of a specific infringement. Upon notification of such violations, we will
          remove the content immediately.
        </p>

        <h2>Liability for Links</h2>
        <p>
          Our service contains links to external third-party websites over whose content we
          have no control. Therefore, we cannot accept any liability for these external
          contents. The respective provider or operator of the linked pages is always
          responsible for the content of those pages.
        </p>
        <p>
          The linked pages were checked for possible legal violations at the time of linking.
          Illegal content was not recognisable at the time of linking. Permanent monitoring of
          the content of the linked pages is not reasonable without concrete indications of a
          violation. Upon notification of violations, we will remove such links immediately.
        </p>

        <h2>Copyright</h2>
        <p>
          The content and works created by the site operator on these pages are subject to
          German copyright law. Duplication, processing, distribution, or any form of
          commercialisation of such material beyond the scope of the copyright law requires
          the prior written consent of the respective author or creator.
        </p>
        <p>
          Downloads and copies of this site are only permitted for private, non-commercial
          use. Insofar as the content on this site was not created by the operator, the
          copyrights of third parties are respected. Third-party content is identified as
          such. Should you nevertheless become aware of a copyright infringement, please
          notify us. Upon notification of violations, we will remove such content immediately.
        </p>

        <h2>Privacy</h2>
        <p>
          For information on how we handle personal data, please see our{' '}
          <Link to="/legal/privacy">Privacy Policy</Link>.
        </p>
      </div>

      <AppFooter />
    </div>
  )
}
