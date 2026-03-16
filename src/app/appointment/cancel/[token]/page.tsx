'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  validateCancelLink,
  submitCancel,
  formatDateTime,
  AppointmentLink,
} from '@/lib/appointment-link.utils'

export default function CancelPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [appointment, setAppointment] = useState<AppointmentLink | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [confirmStep, setConfirmStep] = useState(false)

  // 分开管理 radio 选项和附加备注
  const [selectedReason, setSelectedReason] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')

  useEffect(() => {
    async function loadAppointment() {
      const data = await validateCancelLink(token)
      if (data) {
        setAppointment(data)
        setError(null)
      } else {
        setError('Invalid or expired cancel link')
      }
      setLoading(false)
    }
    loadAppointment()
  }, [token])

  const isGerman = appointment?.locale === 'de'

  const cancelReasons = [
    { value: 'schedule_conflict', label: isGerman ? 'Zeitkonflikt' : 'Schedule conflict' },
    { value: 'feeling_better', label: isGerman ? 'Fühle mich besser' : 'Feeling better' },
    { value: 'other_reason', label: isGerman ? 'Anderer Grund' : 'Other reason' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedReason) {
      setError(isGerman ? 'Bitte wählen Sie einen Grund aus' : 'Please select a reason')
      return
    }

    setSubmitting(true)
    setError(null)

    const reason = additionalNotes ? `${selectedReason}: ${additionalNotes}` : selectedReason
    const result = await submitCancel(token, reason)

    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        router.push(isGerman ? '/de' : '/en')
      }, 3000)
    } else {
      setError(result.error || (isGerman ? 'Fehler beim Absagen des Termins' : 'Error cancelling appointment'))
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

  if (!appointment) return null

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <div className="inline-block p-3 bg-green-100 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mb-4">
            {isGerman ? 'Termin abgesagt' : 'Appointment cancelled'}
          </h1>
          <p className="text-stone-600 mb-2">
            {isGerman ? 'Sie erhalten in Kürze eine Bestätigungsmail.' : 'You will receive a confirmation email shortly.'}
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">
            {isGerman ? 'Termin absagen' : 'Cancel Appointment'}
          </h1>
          <p className="text-stone-600">
            {isGerman
              ? 'Wir sind traurig, dass Sie Ihren Termin absagen möchten. Helfen Sie uns mit einem kurzen Grund.'
              : 'We are sorry that you want to cancel your appointment. Help us with a brief reason.'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6 mb-6">
          <h2 className="text-sm font-semibold uppercase mb-4 text-stone-700">
            {isGerman ? 'Termin Details' : 'Appointment Details'}
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
              <span className="text-stone-600">{isGerman ? 'Name:' : 'Name:'}</span>
              <span className="font-medium text-stone-900">{appointment.customerName}</span>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-amber-800 text-sm">
            {isGerman
              ? '⚠️ Diese Aktion kann nicht rückgängig gemacht werden.'
              : '⚠️ This action cannot be undone.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-900 mb-3">
                {isGerman ? 'Grund für Absage' : 'Reason for cancellation'} *
              </label>
              <div className="space-y-2">
                {cancelReasons.map((r) => (
                  <label key={r.value} className="flex items-center p-3 border border-stone-200 rounded-lg hover:bg-stone-50 cursor-pointer">
                    <input
                      type="radio"
                      name="reason"
                      value={r.value}
                      checked={selectedReason === r.value}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="w-4 h-4 text-stone-900"
                    />
                    <span className="ml-3 text-stone-700">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-900 mb-2">
                {isGerman ? 'Zusätzliche Notizen (optional)' : 'Additional notes (optional)'}
              </label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder={isGerman ? 'Weitere Details...' : 'Additional details...'}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                rows={3}
              />
            </div>

            {!confirmStep ? (
              <button
                type="button"
                onClick={() => {
                  if (!selectedReason) {
                    setError(isGerman ? 'Bitte wählen Sie einen Grund aus' : 'Please select a reason')
                    return
                  }
                  setError(null)
                  setConfirmStep(true)
                }}
                className="w-full bg-amber-600 text-white py-3 rounded-lg font-medium hover:bg-amber-700 transition"
              >
                {isGerman ? 'Weiter zur Bestätigung' : 'Proceed to confirmation'}
              </button>
            ) : (
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:bg-stone-400 disabled:cursor-not-allowed transition"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      {isGerman ? 'Wird verarbeitet...' : 'Processing...'}
                    </span>
                  ) : (
                    isGerman ? 'Termin unwiderruflich absagen' : 'Cancel appointment (cannot be undone)'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmStep(false)}
                  className="w-full bg-stone-200 text-stone-900 py-3 rounded-lg font-medium hover:bg-stone-300 transition"
                >
                  {isGerman ? 'Zurück' : 'Back'}
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-stone-500 mt-4">
            {isGerman
              ? '* Erforderliche Felder. Sie erhalten nach der Absage eine Bestätigungsmail.'
              : '* Required fields. You will receive a confirmation email after cancellation.'}
          </p>
        </form>
      </div>
    </div>
  )
}
