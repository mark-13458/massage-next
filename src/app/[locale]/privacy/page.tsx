import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Locale, isLocale } from '../../../../lib/i18n'
import { SiteHeader } from '../../../../components/site/SiteHeader'
import { SiteFooter } from '../../../../components/site/SiteFooter'
import { SectionShell } from '../../../../components/site/SectionShell'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = await getTranslations({ locale, namespace: 'Metadata' })
  return {
    title: locale === 'de' ? 'Datenschutzerklärung | China TCM Massage' : 'Privacy Policy | China TCM Massage',
    description: locale === 'de' ? 'Datenschutzerklärung und Informationen zum Datenschutz.' : 'Privacy policy and data protection information.',
  }
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const typedLocale = locale as Locale

  return (
    <main>
      <SiteHeader locale={typedLocale} />
      <SectionShell
        eyebrow={typedLocale === 'de' ? 'Rechtliches' : 'Legal'}
        title={typedLocale === 'de' ? 'Datenschutzerklärung' : 'Privacy Policy'}
        description={typedLocale === 'de' ? 'Informationen zur Verarbeitung Ihrer Daten.' : 'Information about how we process your data.'}
      >
        <div className="prose prose-stone prose-lg mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-sm">
          {typedLocale === 'de' ? (
            <>
              <h2>1. Datenschutz auf einen Blick</h2>
              <h3>Allgemeine Hinweise</h3>
              <p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.</p>

              <h3>Datenerfassung auf dieser Website</h3>
              <p><strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong></p>
              <p>Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.</p>

              <p><strong>Wie erfassen wir Ihre Daten?</strong></p>
              <p>Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z. B. um Daten handeln, die Sie in ein Kontaktformular eingeben.</p>
              <p>Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z. B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).</p>

              <h2>2. Hosting</h2>
              <p>Wir hosten die Inhalte unserer Website bei folgenden Anbietern:</p>
              <ul>
                <li>Serverstandort: Deutschland / EU</li>
              </ul>

              <h2>3. Allgemeine Hinweise und Pflichtinformationen</h2>
              <h3>Datenschutz</h3>
              <p>Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.</p>

              <h3>Hinweis zur verantwortlichen Stelle</h3>
              <p>Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:</p>
              <p>China TCM Massage<br />Arnulfstraße 104<br />80636 München</p>
              <p>Telefon: 015563 188800<br />E-Mail: chinesischemassage8@gmail.com</p>

              <h2>4. Datenerfassung auf dieser Website</h2>
              <h3>Kontaktformular</h3>
              <p>Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.</p>
            </>
          ) : (
            <>
              <h2>1. Data Protection at a Glance</h2>
              <h3>General Notes</h3>
              <p>The following notes provide a simple overview of what happens to your personal data when you visit this website. Personal data is all data with which you can be personally identified.</p>

              <h3>Data Collection on this Website</h3>
              <p><strong>Who is responsible for data collection on this website?</strong></p>
              <p>Data processing on this website is carried out by the website operator. You can find their contact details in the imprint of this website.</p>

              <p><strong>How do we collect your data?</strong></p>
              <p>Your data is collected on the one hand by you communicating it to us. This may, for example, be data that you enter in a contact form.</p>
              <p>Other data is collected automatically or with your consent when visiting the website by our IT systems. These are primarily technical data (e.g. internet browser, operating system or time of the page view).</p>

              <h2>2. Hosting</h2>
              <p>We host the content of our website with the following providers:</p>
              <ul>
                <li>Server location: Germany / EU</li>
              </ul>

              <h2>3. General Notes and Mandatory Information</h2>
              <h3>Data Protection</h3>
              <p>The operators of these pages take the protection of your personal data very seriously. We treat your personal data confidentially and in accordance with the statutory data protection regulations and this privacy policy.</p>

              <h3>Note on the Responsible Body</h3>
              <p>The responsible body for data processing on this website is:</p>
              <p>China TCM Massage<br />Arnulfstraße 104<br />80636 Munich</p>
              <p>Phone: 015563 188800<br />Email: chinesischemassage8@gmail.com</p>

              <h2>4. Data Collection on this Website</h2>
              <h3>Contact Form</h3>
              <p>If you send us inquiries via the contact form, your details from the inquiry form, including the contact details you provided there, will be stored by us for the purpose of processing the inquiry and in case of follow-up questions. We do not pass on this data without your consent.</p>
            </>
          )}
        </div>
      </SectionShell>
      <SiteFooter locale={typedLocale} />
    </main>
  )
}
