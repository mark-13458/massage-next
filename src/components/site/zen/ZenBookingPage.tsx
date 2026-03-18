import { Locale } from '../../../lib/i18n'
import { getMessages } from '../../../lib/copy'
import { getActiveServices, getBusinessHours, getContactSettings, getSystemSettings } from '../../../server/services/site.service'
import { getTurnstileSettings } from '../../../lib/turnstile'
import { BookingForm } from '../BookingForm'
import { ZenPageShell } from './ZenPageShell'

export async function ZenBookingPage({ locale }: { locale: Locale }) {
  const t = getMessages(locale)
  const [services, settings, contact, hours, turnstile] = await Promise.all([
    getActiveServices(locale).catch(() => []),
    getSystemSettings().catch(() => null),
    getContactSettings().catch(() => null),
    getBusinessHours(locale).catch(() => []),
    getTurnstileSettings().catch(() => ({ enabled: false, siteKey: '' })),
  ])

  const configuredNotice = locale === 'de' ? settings?.bookingNoticeDe : settings?.bookingNoticeEn

  return (
    <ZenPageShell locale={locale}>
      {/* Hero */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9B7E5C]">
            {locale === 'de' ? 'Reservierung' : 'Booking'}
          </p>
          <h1 className="mt-3 text-4xl font-light text-[#3D3630] md:text-5xl">{t.nav.booking}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#8C7D6F]">
            {configuredNotice || (locale === 'de'
              ? 'Fragen Sie Ihren Wunschtermin schnell und unkompliziert an. Wir melden uns zur Bestätigung zurück.'
              : 'Request your preferred appointment quickly and easily. We will follow up to confirm your booking.')}
          </p>
        </div>
      </section>

      {/* Booking form */}
      <section className="bg-[#FAF8F5] py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white p-8 shadow-sm">
            <BookingForm
              locale={locale}
              services={services.map((s) => ({ ...s, slug: s.slug, price: s.price.toString() }))}
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
          </div>
        </div>
      </section>
    </ZenPageShell>
  )
}
