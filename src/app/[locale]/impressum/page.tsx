import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Locale, isLocale } from '../../../lib/i18n'
import { SiteHeader } from '../../../components/site/SiteHeader'
import { SiteFooter } from '../../../components/site/SiteFooter'
import { SectionShell } from '../../../components/site/SectionShell'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = await getTranslations({ locale, namespace: 'Metadata' })
  return {
    title: locale === 'de' ? 'Impressum | China TCM Massage' : 'Imprint | China TCM Massage',
    description: locale === 'de' ? 'Impressum und rechtliche Hinweise.' : 'Imprint and legal information.',
  }
}

export default async function ImprintPage({ params }: Props) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const typedLocale = locale as Locale

  return (
    <main>
      <SiteHeader locale={typedLocale} />
      <SectionShell
        eyebrow={typedLocale === 'de' ? 'Rechtliches' : 'Legal'}
        title={typedLocale === 'de' ? 'Impressum' : 'Imprint'}
        description={typedLocale === 'de' ? 'Anbieterkennzeichnung und rechtliche Hinweise.' : 'Legal provider identification and information.'}
      >
        <div className="prose prose-stone prose-lg mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-sm">
          {typedLocale === 'de' ? (
            <>
              <h2>Angaben gemäß § 5 TMG</h2>
              <p>China TCM Massage<br />Arnulfstraße 104<br />80636 München</p>

              <h2>Kontakt</h2>
              <p>Telefon: 015563 188800<br />E-Mail: chinesischemassage8@gmail.com</p>

              <h2>Redaktionell verantwortlich</h2>
              <p>Inhaber/Geschäftsführer</p>

              <h2>EU-Streitschlichtung</h2>
              <p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a>.<br /> Unsere E-Mail-Adresse finden Sie oben im Impressum.</p>

              <h2>Verbraucherstreitbeilegung / Universalschlichtungsstelle</h2>
              <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>

              <h2>Haftung für Inhalte</h2>
              <p>Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.</p>
              <p>Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.</p>
            </>
          ) : (
            <>
              <h2>Information according to § 5 TMG</h2>
              <p>China TCM Massage<br />Arnulfstraße 104<br />80636 Munich</p>

              <h2>Contact</h2>
              <p>Phone: 015563 188800<br />Email: chinesischemassage8@gmail.com</p>

              <h2>Editorial Responsibility</h2>
              <p>Owner / Managing Director</p>

              <h2>EU Dispute Resolution</h2>
              <p>The European Commission provides a platform for online dispute resolution (ODR): <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a>.<br /> Our email address can be found above in the imprint.</p>

              <h2>Consumer Dispute Resolution / Universal Arbitration Board</h2>
              <p>We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.</p>

              <h2>Liability for Contents</h2>
              <p>As service providers, we are liable for own contents of these websites according to Sec. 7, paragraph 1 German Telemedia Act (TMG). However, according to Sec. 8 to 10 German Telemedia Act (TMG), service providers are not obligated to permanently monitor submitted or stored information or to search for evidences that indicate illegal activities.</p>
              <p>Legal obligations to removing information or to blocking the use of information remain unchallenged. In this case, liability is only possible at the time of knowledge about a specific violation of law. Illegal contents will be removed immediately at the time we get knowledge of them.</p>
            </>
          )}
        </div>
      </SectionShell>
      <SiteFooter locale={typedLocale} />
    </main>
  )
}
