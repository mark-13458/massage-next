import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteHeader } from '../../../components/site/SiteHeader'
import { SiteFooter } from '../../../components/site/SiteFooter'
import { FloatingActions } from '../../../components/site/FloatingActions'
import { SectionShell } from '../../../components/site/SectionShell'
import { BookingForm } from '../../../components/site/BookingForm'
import { getMessages } from '../../../lib/copy'
import { isLocale, Locale } from '../../../lib/i18n'
import { createPageMetadata } from '../../../lib/seo'
import { getActiveServices, getBusinessHours, getContactSettings, getSystemSettings } from '../../../server/services/site.service'
import { getTurnstileSettings } from '../../../lib/turnstile'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params

  if (!isLocale(locale)) {
    return {}
  }

  const settings = await getSystemSettings().catch(() => null)

  return {
    ...createPageMetadata({
      locale,
      pathname: '/booking',
      title: locale === 'de' ? 'Termin anfragen' : 'Request an Appointment',
      description:
        locale === 'de'
          ? settings?.seoMetaDescriptionDe || 'Fragen Sie Ihren Termin bei China TCM Massage in München online an – einfach, klar und mobilfreundlich.'
          : settings?.seoMetaDescriptionEn || 'Request your appointment at China TCM Massage in Munich online with a simple, clear and mobile-friendly booking flow.',
      titleTemplate: locale === 'de' ? settings?.seoTitleTemplateDe : settings?.seoTitleTemplateEn,
      siteNameOverride: settings?.siteName,
    }),
    robots: { index: false, follow: true },
  }
}

export default async function BookingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const typedLocale = locale as Locale
  const t = getMessages(typedLocale)
  const [services, settings, contact, hours, turnstile] = await Promise.all([
    getActiveServices(typedLocale).catch(() => []),
    getSystemSettings().catch(() => null),
    getContactSettings().catch(() => null),
    getBusinessHours(typedLocale).catch(() => []),
    getTurnstileSettings().catch(() => ({ enabled: false, siteKey: '' })),
  ])

  const configuredNotice = typedLocale === 'de' ? settings?.bookingNoticeDe : settings?.bookingNoticeEn

  return (
    <main>
      <SiteHeader locale={typedLocale} />
      <SectionShell
        eyebrow={typedLocale === 'de' ? 'Reservierung' : 'Booking'}
        title={t.nav.booking}
        description={
          configuredNotice ||
          (typedLocale === 'de'
            ? 'Fragen Sie Ihren Wunschtermin schnell und unkompliziert an. Wir melden uns zur Bestätigung mit allen Details zurück.'
            : 'Request your preferred appointment quickly and easily. We will follow up with all details to confirm your booking.')
        }
      >
        <BookingForm
          locale={typedLocale}
          services={services.map((service) => ({ ...service, slug: service.slug, price: service.price.toString() }))}
          contact={contact}
          hours={hours}
          currency={settings?.currency || 'EUR'}
          turnstile={turnstile}
          privacy={{
            consentRequired: settings?.privacyConsentRequired !== false,
            retentionDays: settings?.bookingRetentionDays || 180,
            allowDeletionRequests: Boolean(settings?.allowDeletionRequests),
          }}
        />
      </SectionShell>
      <FloatingActions locale={typedLocale} />
      <SiteFooter locale={typedLocale} />
    </main>
  )
}
