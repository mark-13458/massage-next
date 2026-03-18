import { Metadata } from 'next'
import { Locale, isLocale } from '../../../lib/i18n'
import { SiteHeader } from '../../../components/site/SiteHeader'
import { SiteFooter } from '../../../components/site/SiteFooter'
import { FloatingActions } from '../../../components/site/FloatingActions'
import { SectionShell } from '../../../components/site/SectionShell'
import { ZenLegalPage } from '../../../components/site/zen/ZenLegalPage'
import { getContactSettings, getSystemSettings } from '../../../server/services/site.service'
import { notFound } from 'next/navigation'
import { createPageMetadata } from '../../../lib/seo'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return {
    ...createPageMetadata({
      locale,
      pathname: '/privacy',
      title: locale === 'de' ? 'Datenschutzerklärung' : 'Privacy Policy',
      description: locale === 'de' ? 'Datenschutzerklärung und Informationen zum Datenschutz.' : 'Privacy policy and data protection information.',
    }),
    robots: { index: false, follow: false },
  }
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const typedLocale = locale as Locale

  const [contact, settings] = await Promise.all([
    getContactSettings().catch(() => null),
    getSystemSettings().catch(() => null),
  ])
  const phone = contact?.phone ?? '015563 188800'
  const email = contact?.email ?? 'chinesischemassage8@gmail.com'
  const address = contact?.address ?? 'Arnulfstraße 104, 80636 München'

  const content = typedLocale === 'de' ? (
    <>
      <h2>1. Datenschutz auf einen Blick</h2>
      <h3>Allgemeine Hinweise</h3>
      <p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.</p>
      <h3>Datenerfassung auf dieser Website</h3>
      <p><strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong></p>
      <p>Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.</p>
      <p><strong>Wie erfassen wir Ihre Daten?</strong></p>
      <p>Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst.</p>
      <h2>2. Hosting</h2>
      <p>Wir hosten die Inhalte unserer Website bei folgenden Anbietern:</p>
      <ul><li>Serverstandort: Deutschland / EU</li></ul>
      <h2>3. Allgemeine Hinweise und Pflichtinformationen</h2>
      <h3>Datenschutz</h3>
      <p>Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.</p>
      <h3>Hinweis zur verantwortlichen Stelle</h3>
      <p>China TCM Massage<br />{address}</p>
      <p>Telefon: <a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a><br />E-Mail: <a href={`mailto:${email}`}>{email}</a></p>
      <h2>4. Datenerfassung auf dieser Website</h2>
      <h3>Kontaktformular</h3>
      <p>Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.</p>
    </>
  ) : (
    <>
      <h2>1. Data Protection at a Glance</h2>
      <h3>General Notes</h3>
      <p>The following notes provide a simple overview of what happens to your personal data when you visit this website.</p>
      <h3>Data Collection on this Website</h3>
      <p><strong>Who is responsible for data collection on this website?</strong></p>
      <p>Data processing on this website is carried out by the website operator. You can find their contact details in the imprint of this website.</p>
      <p><strong>How do we collect your data?</strong></p>
      <p>Your data is collected on the one hand by you communicating it to us. Other data is collected automatically or with your consent when visiting the website by our IT systems.</p>
      <h2>2. Hosting</h2>
      <p>We host the content of our website with the following providers:</p>
      <ul><li>Server location: Germany / EU</li></ul>
      <h2>3. General Notes and Mandatory Information</h2>
      <h3>Data Protection</h3>
      <p>The operators of these pages take the protection of your personal data very seriously. We treat your personal data confidentially and in accordance with the statutory data protection regulations and this privacy policy.</p>
      <h3>Note on the Responsible Body</h3>
      <p>China TCM Massage<br />{address}</p>
      <p>Phone: <a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a><br />Email: <a href={`mailto:${email}`}>{email}</a></p>
      <h2>4. Data Collection on this Website</h2>
      <h3>Contact Form</h3>
      <p>If you send us inquiries via the contact form, your details from the inquiry form, including the contact details you provided there, will be stored by us for the purpose of processing the inquiry. We do not pass on this data without your consent.</p>
    </>
  )

  if (settings?.frontendTheme === 'zen') {
    return (
      <ZenLegalPage
        locale={typedLocale}
        eyebrow={typedLocale === 'de' ? 'Rechtliches' : 'Legal'}
        title={typedLocale === 'de' ? 'Datenschutzerklärung' : 'Privacy Policy'}
        description={typedLocale === 'de' ? 'Informationen zur Verarbeitung Ihrer Daten.' : 'Information about how we process your data.'}
      >
        {content}
      </ZenLegalPage>
    )
  }

  return (
    <main>
      <SiteHeader locale={typedLocale} />
      <SectionShell
        eyebrow={typedLocale === 'de' ? 'Rechtliches' : 'Legal'}
        title={typedLocale === 'de' ? 'Datenschutzerklärung' : 'Privacy Policy'}
        description={typedLocale === 'de' ? 'Informationen zur Verarbeitung Ihrer Daten.' : 'Information about how we process your data.'}
      >
        <div className="prose prose-stone prose-lg mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-sm">
          {content}
        </div>
      </SectionShell>
      <FloatingActions locale={typedLocale} />
      <SiteFooter locale={typedLocale} />
    </main>
  )
}
