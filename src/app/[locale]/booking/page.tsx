import { notFound } from 'next/navigation'
import { SiteHeader } from '../../../components/site/SiteHeader'
import { SiteFooter } from '../../../components/site/SiteFooter'
import { SectionShell } from '../../../components/site/SectionShell'
import { BookingForm } from '../../../components/site/BookingForm'
import { getMessages } from '../../../lib/copy'
import { isLocale, Locale } from '../../../lib/i18n'
import { getActiveServices, getSystemSettings } from '../../../server/services/site.service'

export default async function BookingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const typedLocale = locale as Locale
  const t = getMessages(typedLocale)
  const [services, settings] = await Promise.all([
    getActiveServices(typedLocale).catch(() => []),
    getSystemSettings().catch(() => null),
  ])

  const configuredNotice = typedLocale === 'en' ? settings?.bookingNoticeEn : ''

  return (
    <main>
      <SiteHeader locale={typedLocale} />
      <SectionShell
        eyebrow={typedLocale === 'de' ? 'Reservierung' : 'Booking'}
        title={t.nav.booking}
        description={
          configuredNotice ||
          (typedLocale === 'de'
            ? '这里先打通面向客户的预约入口，后续再把营业时间校验、邮件通知和后台处理完整接上。'
            : 'This page establishes the customer-facing booking flow first; business-hour validation, email notifications and admin processing will be connected next.')
        }
      >
        <BookingForm locale={typedLocale} services={services.map((service) => ({ ...service, price: service.price.toString() }))} />
      </SectionShell>
      <SiteFooter locale={typedLocale} />
    </main>
  )
}
