'use client'

import { useState, useTransition } from 'react'
import { Locale } from '../../lib/i18n'

type BookingManagePanelProps = {
  locale: Locale
  token: string
  booking: {
    customerName: string
    serviceName: string
    appointmentDate: string
    appointmentTime: string
    status: string
  }
}

function formatDate(isoDate: string, locale: Locale) {
  return new Date(isoDate).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function isWithinOneHour(isoDate: string, timeStr: string): boolean {
  const datePart = isoDate.slice(0, 10)
  const apptDateTime = new Date(`${datePart}T${timeStr}:00`)
  return apptDateTime <= new Date(Date.now() + 60 * 60 * 1000)
}

export function BookingManagePanel({ locale, token, booking }: BookingManagePanelProps) {
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [currentBooking, setCurrentBooking] = useState(booking)
  const [date, setDate] = useState(booking.appointmentDate.slice(0, 10))
  const [time, setTime] = useState(booking.appointmentTime)
  const [rescheduleNotes, setRescheduleNotes] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [isPending, startTransition] = useTransition()

  const today = new Date().toISOString().slice(0, 10)
  const tooLate = isWithinOneHour(currentBooking.appointmentDate, currentBooking.appointmentTime)

  const t = locale === 'de'
    ? {
        manage: 'Termin verwalten',
        customer: 'Name',
        service: 'Behandlung',
        date: 'Datum',
        time: 'Uhrzeit',
        status: 'Status',
        cancelSection: 'Termin stornieren',
        cancelReason: 'Grund (optional)',
        cancel: 'Jetzt stornieren',
        rescheduleSection: 'Termin verschieben',
        rescheduleNotes: 'Hinweis (optional)',
        reschedule: 'Termin verschieben',
        saving: 'Wird verarbeitet…',
        cancelSuccess: 'Der Termin wurde erfolgreich storniert.',
        rescheduleSuccess: 'Der Termin wurde erfolgreich geändert.',
        locked: 'Dieser Termin kann nicht mehr online geändert werden.',
        tooLate: 'Stornierungen und Änderungen sind nur bis 1 Stunde vor dem Termin möglich. Bitte kontaktieren Sie uns direkt.',
        disabled: 'Die Online-Verwaltung dieses Termins ist derzeit deaktiviert.',
        error: 'Die Aktion konnte nicht durchgeführt werden. Bitte versuchen Sie es später erneut.',
        confirmCancel: 'Termin wirklich stornieren?',
        timePlaceholder: 'z. B. 10:00',
      }
    : {
        manage: 'Manage booking',
        customer: 'Name',
        service: 'Service',
        date: 'Date',
        time: 'Time',
        status: 'Status',
        cancelSection: 'Cancel booking',
        cancelReason: 'Reason (optional)',
        cancel: 'Cancel now',
        rescheduleSection: 'Reschedule booking',
        rescheduleNotes: 'Notes (optional)',
        reschedule: 'Reschedule',
        saving: 'Processing…',
        cancelSuccess: 'The booking was cancelled successfully.',
        rescheduleSuccess: 'The booking was rescheduled successfully.',
        locked: 'This booking can no longer be changed online.',
        tooLate: 'Cancellations and changes are only possible up to 1 hour before the appointment. Please contact us directly.',
        disabled: 'Online management for this booking is currently disabled.',
        error: 'The action could not be completed. Please try again later.',
        confirmCancel: 'Cancel this booking?',
        timePlaceholder: 'e.g. 10:00',
      }

  const statusLabel: Record<string, string> = locale === 'de'
    ? { PENDING: 'Ausstehend', CONFIRMED: 'Bestätigt', COMPLETED: 'Abgeschlossen', CANCELLED: 'Storniert', NO_SHOW: 'Nicht erschienen' }
    : { PENDING: 'Pending', CONFIRMED: 'Confirmed', COMPLETED: 'Completed', CANCELLED: 'Cancelled', NO_SHOW: 'No show' }

  const isLocked = currentBooking.status === 'CANCELLED' || currentBooking.status === 'COMPLETED' || tooLate

  function runAction(payload: Record<string, unknown>, successMessage: string) {
    setMessage('')
    startTransition(async () => {
      try {
        const response = await fetch(`/api/booking/manage/${token}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error(t.disabled)
          }
          throw new Error('Booking action failed')
        }

        const result = await response.json()
        const item = result?.data?.item
        if (item) {
          setCurrentBooking((current) => ({
            ...current,
            appointmentDate: item.appointmentDate ? new Date(item.appointmentDate).toISOString() : current.appointmentDate,
            appointmentTime: item.appointmentTime || current.appointmentTime,
            status: item.status || current.status,
          }))

          if (item.appointmentDate) setDate(new Date(item.appointmentDate).toISOString().slice(0, 10))
          if (item.appointmentTime) setTime(item.appointmentTime)
        }

        setStatus('success')
        setMessage(successMessage)
      } catch {
        setStatus('error')
        setMessage(t.error)
      }
    })
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      {/* Booking details */}
      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-semibold text-stone-900">{t.manage}</h2>
        <div className="mt-6 space-y-3 text-sm text-stone-700">
          <div className="flex items-center justify-between rounded-2xl border border-stone-200 px-4 py-3">
            <span>{t.customer}</span>
            <span className="font-medium text-stone-900">{currentBooking.customerName}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-stone-200 px-4 py-3">
            <span>{t.service}</span>
            <span className="font-medium text-stone-900">{currentBooking.serviceName}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-stone-200 px-4 py-3">
            <span>{t.date}</span>
            <span className="font-medium text-stone-900">{formatDate(currentBooking.appointmentDate, locale)}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-stone-200 px-4 py-3">
            <span>{t.time}</span>
            <span className="font-medium text-stone-900">{currentBooking.appointmentTime}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-stone-200 px-4 py-3">
            <span>{t.status}</span>
            <span className="font-medium text-stone-900">{statusLabel[currentBooking.status] ?? currentBooking.status}</span>
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-6">
          {isLocked ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {tooLate ? t.tooLate : t.locked}
            </div>
          ) : (
            <>
              {/* Cancel section */}
              <div className="rounded-3xl border border-rose-100 p-5">
                <h3 className="text-base font-semibold text-stone-900">{t.cancelSection}</h3>
                <div className="mt-3">
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder={t.cancelReason}
                    rows={2}
                    className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-stone-500"
                  />
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    if (!window.confirm(t.confirmCancel)) return
                    runAction({ action: 'cancel', notes: cancelReason || undefined }, t.cancelSuccess)
                  }}
                  className="mt-3 w-full rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isPending ? t.saving : t.cancel}
                </button>
              </div>

              {/* Reschedule section */}
              <div className="rounded-3xl border border-stone-200 p-5">
                <h3 className="text-base font-semibold text-stone-900">{t.rescheduleSection}</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <input
                    type="date"
                    value={date}
                    min={today}
                    onChange={(e) => setDate(e.target.value)}
                    className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-500"
                  />
                  <input
                    type="time"
                    value={time}
                    placeholder={t.timePlaceholder}
                    onChange={(e) => setTime(e.target.value)}
                    className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-500"
                  />
                  <textarea
                    value={rescheduleNotes}
                    onChange={(e) => setRescheduleNotes(e.target.value)}
                    placeholder={t.rescheduleNotes}
                    rows={3}
                    className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-500 sm:col-span-2"
                  />
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => runAction({ action: 'reschedule', appointmentDate: date, appointmentTime: time, notes: rescheduleNotes || undefined }, t.rescheduleSuccess)}
                  className="mt-4 w-full rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isPending ? t.saving : t.reschedule}
                </button>
              </div>
            </>
          )}

          {message ? (
            <p className={`text-sm ${status === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>
              {message}
            </p>
          ) : null}
        </div>
      </section>
    </div>
  )
}
