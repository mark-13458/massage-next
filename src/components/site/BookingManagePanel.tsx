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

export function BookingManagePanel({ locale, token, booking }: BookingManagePanelProps) {
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [currentBooking, setCurrentBooking] = useState(booking)
  const [date, setDate] = useState(booking.appointmentDate.slice(0, 10))
  const [time, setTime] = useState(booking.appointmentTime)
  const [notes, setNotes] = useState('')
  const [isPending, startTransition] = useTransition()

  const t = locale === 'de'
    ? {
        manage: 'Termin verwalten',
        customer: 'Name',
        service: 'Behandlung',
        date: 'Datum',
        time: 'Uhrzeit',
        status: 'Status',
        cancel: 'Termin stornieren',
        reschedule: 'Termin verschieben',
        notes: 'Hinweis (optional)',
        saving: 'Wird verarbeitet…',
        cancelSuccess: 'Der Termin wurde storniert.',
        rescheduleSuccess: 'Der Termin wurde erfolgreich geändert und wartet erneut auf Bestätigung.',
        locked: 'Dieser Termin kann nicht mehr online geändert werden.',
        disabled: 'Die Online-Verwaltung dieses Termins ist derzeit deaktiviert.',
        error: 'Die Aktion konnte nicht durchgeführt werden. Bitte versuchen Sie es später erneut.',
      }
    : {
        manage: 'Manage booking',
        customer: 'Name',
        service: 'Service',
        date: 'Date',
        time: 'Time',
        status: 'Status',
        cancel: 'Cancel booking',
        reschedule: 'Reschedule booking',
        notes: 'Notes (optional)',
        saving: 'Processing…',
        cancelSuccess: 'The booking was cancelled successfully.',
        rescheduleSuccess: 'The booking was rescheduled and is pending confirmation again.',
        locked: 'This booking can no longer be changed online.',
        disabled: 'Online management for this booking is currently disabled.',
        error: 'The action could not be completed. Please try again later.',
      }

  const statusLabel: Record<string, string> = locale === 'de'
    ? { PENDING: 'Ausstehend', CONFIRMED: 'Bestätigt', COMPLETED: 'Abgeschlossen', CANCELLED: 'Storniert', NO_SHOW: 'Nicht erschienen' }
    : { PENDING: 'Pending', CONFIRMED: 'Confirmed', COMPLETED: 'Completed', CANCELLED: 'Cancelled', NO_SHOW: 'No show' }

  const isLocked = currentBooking.status === 'CANCELLED' || currentBooking.status === 'COMPLETED'

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
            <span className="font-medium text-stone-900">{currentBooking.appointmentDate.slice(0, 10)}</span>
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

      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-4">
          {isLocked ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {t.locked}
            </div>
          ) : null}

          <button
            type="button"
            disabled={isPending || isLocked}
            onClick={() => {
              if (!window.confirm(locale === 'de' ? 'Termin wirklich stornieren?' : 'Cancel this booking?')) return
              runAction({ action: 'cancel', notes }, t.cancelSuccess)
            }}
            className="w-full rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? t.saving : t.cancel}
          </button>

          <div className="rounded-3xl border border-stone-200 p-5">
            <h3 className="text-base font-semibold text-stone-900">{t.reschedule}</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={isLocked} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-500 disabled:bg-stone-50 disabled:text-stone-400" />
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} disabled={isLocked} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-500 disabled:bg-stone-50 disabled:text-stone-400" />
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t.notes} rows={4} disabled={isLocked} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-500 disabled:bg-stone-50 disabled:text-stone-400 sm:col-span-2" />
            </div>
            <button
              type="button"
              disabled={isPending || isLocked}
              onClick={() => runAction({ action: 'reschedule', appointmentDate: date, appointmentTime: time, notes }, t.rescheduleSuccess)}
              className="mt-4 w-full rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? t.saving : t.reschedule}
            </button>
          </div>

          {message ? <p className={`text-sm ${status === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>{message}</p> : null}
        </div>
      </section>
    </div>
  )
}
