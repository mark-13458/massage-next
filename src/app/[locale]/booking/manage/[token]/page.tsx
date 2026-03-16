import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteFooter } from '../../../../../components/site/SiteFooter'
import { SiteHeader } from '../../../../../components/site/SiteHeader'
import { FloatingActions } from '../../../../../components/site/FloatingActions'
import { SectionShell } from '../../../../../components/site/SectionShell'
import { BookingManagePanel } from '../../../../../components/site/BookingManagePanel'
import { isLocale, Locale } from '../../../../../lib/i18n'
import { createPageMetadata } from '../../../../../lib/seo'
import { getAppointmentByToken } from '../../../../../server/services/admin-booking.service'
import { getSystemSettings } from '../../../../../server/services/site.service'

export async function generateMetadata({ params }: { params: Promise<{ locale: string; token: string }> }): Promise<Metadata> {
  const { locale } = await params

  if (!isLocale(locale)) {
    return {}
  }

  return createPageMetadata({
    locale,
    pathname: '/booking/manage',
    title: locale === 'de' ? 'Termin verwalten' : 'Manage booking',
    description:
      locale === 'de'
        ? 'Verwalten Sie Ihre Buchung sicher über Ihren persönlichen Link.'
        : 'Manage your booking securely through your personal link.',
  })
}

export default async function BookingManagePage({ params }: { params: Promise<{ locale: string; token: string }> }) {
  const { locale, token } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const typedLocale = locale as Locale
  const settings = await getSystemSettings().catch(() => null)
  if (settings?.featureEnableBookingManage === false) {
    notFound()
  }

  const appointment = await getAppointmentByToken(token)
  if (!appointment) {
    notFound()
  }

  return (
    <main>
      <SiteHeader locale={typedLocale} />
      <SectionShell
        eyebrow={typedLocale === 'de' ? 'Buchung verwalten' : 'Manage booking'}
        title={typedLocale === 'de' ? 'Termin sicher verwalten' : 'Manage your booking securely'}
        description={
          typedLocale === 'de'
            ? 'Über diesen sicheren Link können Sie Ihren Termin verschieben oder stornieren.'
            : 'Use this secure link to reschedule or cancel your appointment.'
        }
      >
        <BookingManagePanel
          locale={typedLocale}
          token={token}
          booking={{
            customerName: appointment.customerName,
            serviceName: typedLocale === 'en' ? appointment.service.nameEn : appointment.service.nameDe,
            appointmentDate: appointment.appointmentDate.toISOString(),
            appointmentTime: appointment.appointmentTime,
            status: appointment.status,
          }}
        />
      </SectionShell>
      <FloatingActions locale={typedLocale} />
      <SiteFooter locale={typedLocale} />
    </main>
  )
}
