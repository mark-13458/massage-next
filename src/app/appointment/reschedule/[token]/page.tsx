'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  validateRescheduleLink,
  submitReschedule,
  formatDateTime,
  getAvailableRescheduleSlots,
  AppointmentLink,
} from '@/lib/appointment-link.utils'

export default function ReschedulePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [appointment, setAppointment] = useState<AppointmentLink | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // Form state
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null)
  const [availableSlots, setAvailableSlots] = useState<Date[]>([])

  // Load appointment details
  useEffect(() => {
    async function loadAppointment() {
      const data = await validateRescheduleLink(token)
      if (data) {
        setAppointment(data)
        const slots = getAvailableRescheduleSlots(data.appointmentDate, data.locale)
        setAvailableSlots(slots)
        setError(null)
      } else {
        setError('Invalid or expired reschedule link')
      }
      setLoading(false)
    }

    loadAppointment()
  }, [token])

  const isGerman = appointment?.locale === 'de'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newDate || !newTime) {
      setError(isGerman ? 'Bitte füllen Sie alle Felder aus' : 'Please fill in all fields')
      return
    }

    setSubmitting(true)
    setError(null)

    const result = await submitReschedule(token, new Date(newDate), newTime)

    if (result.success) {
      setSuccess(true)
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push(isGerman ? '/de' : '/en')
      }, 3000)
    } else {
      setError(result.error || (isGerman ? 'Fehler beim Ändern des Termins' : 'Error rescheduling appointment'))
    }

    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900 mx-auto mb-4"></div>
          <p className="text-stone-700">{isGerman ? 'Laden...' : 'Loading...'}</p>
        </div>
      </div>
    )
  }

  if (error && !appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-stone-900 mb-4">
            {isGerman ? 'Ungültiger Link' : 'Invalid Link'}
          </h1>
          <p className="text-stone-600 mb-6">{error}</p>
          <a
            href={isGerman ? '/de' : '/en'}
            className="inline-block bg-stone-900 text-white px-6 py-2 rounded-lg hover:bg-stone-800"
          >
            {isGerman ? 'Zur Startseite' : 'Back to home'}
          </a>
        </div>
      </div>
    )
  }

  if (!appointment) {
    return null
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <div className="inline-block p-3 bg-green-100 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mb-4">
            {isGerman ? 'Termin erfolgreich geändert' : 'Appointment rescheduled'}
          </h1>
          <p className="text-stone-600 mb-2">
            {isGerman
              ? 'Sie erhalten in Kürze eine Bestätigungsmail.'
              : 'You will receive a confirmation email shortly.'}
          </p>
          <p className="text-stone-500 text-sm">
            {isGerman ? 'Weitergeleitet in 3 Sekunden...' : 'Redirecting in 3 seconds...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">
            {isGerman ? 'Termin ändern' : 'Reschedule Appointment'}
          </h1>
          <p className="text-stone-600">
            {isGerman
              ? 'Wählen Sie ein neues Datum und eine neue Uhrzeit für Ihren Termin.'
              : 'Choose a new date and time for your appointment.'}
          </p>
        </div>

        {/* Current Appointment Info */}
        <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-stone-900 uppercase mb-4 text-stone-700">
            {isGerman ? 'Aktueller Termin' : 'Current Appointment'}
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-stone-600">{isGerman ? 'Datum:' : 'Date:'}</span>
              <span className="font-medium text-stone-900">
                {formatDateTime(appointment.appointmentDate, appointment.locale)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">{isGerman ? 'Uhrzeit:' : 'Time:'}</span>
              <span className="font-medium text-stone-900">{appointment.appointmentTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">{isGerman ? 'Dauer:' : 'Duration:'}</span>
              <span className="font-medium text-stone-900">{appointment.durationMin} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">{isGerman ? 'Name:' : 'Name:'}</span>
              <span className="font-medium text-stone-900">{appointment.customerName}</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Reschedule Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
          <div className="space-y-6">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-stone-900 mb-2">
                {isGerman ? 'Neues Datum' : 'New Date'} *
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                required
              />
              {availableSlots.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-stone-500">
                    {isGerman ? 'Verfügbare Tage:' : 'Available dates:'}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.slice(0, 10).map((slot) => (
                      <button
                        key={slot.toISOString()}
                        type="button"
                        onClick={() => setNewDate(slot.toISOString().split('T')[0])}
                        className="text-left px-3 py-2 rounded-lg border border-stone-200 hover:border-stone-900 hover:bg-stone-50 text-sm"
                      >
                        {slot.toLocaleDateString(
                          isGerman ? 'de-DE' : 'en-GB',
                          { weekday: 'short', month: 'short', day: 'numeric' }
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-sm font-medium text-stone-900 mb-2">
                {isGerman ? 'Neue Uhrzeit' : 'New Time'} *
              </label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                required
              />
              <p className="text-xs text-stone-500 mt-2">
                {isGerman ? 'Bitte wählen Sie eine Zeit zwischen 09:00 und 18:00 Uhr.' : 'Please choose a time between 09:00 and 18:00.'}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-stone-900 text-white py-3 rounded-lg font-medium hover:bg-stone-800 disabled:bg-stone-400 disabled:cursor-not-allowed transition"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  {isGerman ? 'Wird gespeichert...' : 'Saving...'}
                </span>
              ) : (
                isGerman ? 'Termin ändern' : 'Reschedule Appointment'
              )}
            </button>
          </div>

          <p className="text-xs text-stone-500 mt-4">
            {isGerman
              ? '* Erforderliche Felder. Sie erhalten nach der Änderung eine Bestätigungsmail.'
              : '* Required fields. You will receive a confirmation email after rescheduling.'}
          </p>
        </form>
      </div>
    </div>
  )
}
