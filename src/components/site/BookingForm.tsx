'use client'

import Script from 'next/script'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Locale } from '../../lib/i18n'

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string
      reset: (widgetId?: string) => void
      remove: (widgetId?: string) => void
    }
  }
}

type BookingFormProps = {
  locale: Locale
  services: Array<{
    id: number
    slug?: string
    name: string
    summary?: string | null
    durationMin: number
    price: string
  }>
  contact?: {
    address?: string | null
    phone?: string | null
    email?: string | null
  } | null
  hours?: Array<{
    weekday: number
    label: string
    openTime?: string | null
    closeTime?: string | null
    isClosed: boolean
  }>
  currency?: string
  turnstile?: {
    enabled: boolean
    siteKey?: string
  }
  privacy?: {
    consentRequired: boolean
    retentionDays?: number
    allowDeletionRequests?: boolean
  }
}

export function BookingForm({ locale, services, contact, hours = [], currency = 'EUR', turnstile, privacy }: BookingFormProps) {
  const searchParams = useSearchParams()
  const preselectedSlug = searchParams.get('service')
  const preselectedService = preselectedSlug ? services.find((s) => s.slug === preselectedSlug) : null

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [privacyConsent, setPrivacyConsent] = useState(false)
  const [widgetReady, setWidgetReady] = useState(false)
  const [widgetId, setWidgetId] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const labels = useMemo(() => {
    return locale === 'de'
      ? {
          title: 'Termin anfragen',
          subtitle: 'Senden Sie Ihren Wunschtermin. Das Studio bestätigt anschließend die Verfügbarkeit.',
          name: 'Name',
          phone: 'Telefon',
          email: 'E-Mail (optional)',
          service: 'Behandlung',
          date: 'Datum',
          time: 'Uhrzeit',
          notes: 'Hinweise (optional)',
          submit: 'Anfrage senden',
          loading: 'Wird gesendet…',
          success: 'Ihre Anfrage wurde erfolgreich gesendet. Das Studio meldet sich zur Bestätigung.',
          error: 'Die Anfrage konnte gerade nicht gesendet werden. Bitte versuchen Sie es erneut.',
          address: 'Adresse',
          contact: 'Kontakt',
          openingHours: 'Öffnungszeiten',
          closed: 'Geschlossen',
          captcha: 'Sicherheitsprüfung',
          captchaHint: 'Bitte bestätigen Sie, dass Sie kein Bot sind.',
          captchaLoading: 'Captcha wird geladen…',
          privacyConsent: 'Ich stimme der Verarbeitung meiner Angaben zur Terminbearbeitung zu.',
          privacyHint: 'Es werden nur die für die Terminbearbeitung notwendigen Daten gespeichert.',
          privacyRequired: 'Bitte bestätigen Sie zuerst die Datenschutzeinwilligung.',
        }
      : {
          title: 'Request an appointment',
          subtitle: 'Send your preferred slot and the studio will confirm availability afterwards.',
          name: 'Name',
          phone: 'Phone',
          email: 'Email (optional)',
          service: 'Treatment',
          date: 'Date',
          time: 'Time',
          notes: 'Notes (optional)',
          submit: 'Send request',
          loading: 'Sending…',
          success: 'Your request was sent successfully. The studio will confirm the appointment shortly.',
          error: 'The request could not be sent right now. Please try again.',
          address: 'Address',
          contact: 'Contact',
          openingHours: 'Opening hours',
          closed: 'Closed',
          captcha: 'Security check',
          captchaHint: 'Please confirm that you are not a bot.',
          captchaLoading: 'Loading captcha…',
          privacyConsent: 'I agree that my details may be processed for handling this booking request.',
          privacyHint: 'Only the data necessary to process your booking will be stored.',
          privacyRequired: 'Please confirm the privacy consent first.',
        }
  }, [locale])

  const currencySymbol = currency === 'EUR' ? '€' : currency

  useEffect(() => {
    if (!turnstile?.enabled || !turnstile.siteKey || !widgetReady || !window.turnstile) return
    if (widgetId) return

    const container = document.getElementById('turnstile-widget')
    if (!container) return
    container.innerHTML = ''

    const id = window.turnstile.render(container, {
      sitekey: turnstile.siteKey,
      callback: (token: string) => setTurnstileToken(token),
      'expired-callback': () => setTurnstileToken(''),
      'error-callback': () => setTurnstileToken(''),
      theme: 'light',
    })

    setWidgetId(id)

    return () => {
      try {
        if (id && window.turnstile) window.turnstile.remove(id)
      } catch {}
    }
  }, [turnstile?.enabled, turnstile?.siteKey, widgetReady, widgetId])

  async function onSubmit(formData: FormData) {
    setStatus('submitting')
    setMessage('')

    if (privacy?.consentRequired && !privacyConsent) {
      setStatus('error')
      setMessage(labels.privacyRequired)
      return
    }

    const payload = {
      customerName: String(formData.get('customerName') || ''),
      customerPhone: String(formData.get('customerPhone') || ''),
      customerEmail: String(formData.get('customerEmail') || ''),
      serviceId: Number(formData.get('serviceId') || 0),
      appointmentDate: String(formData.get('appointmentDate') || ''),
      appointmentTime: String(formData.get('appointmentTime') || ''),
      notes: String(formData.get('notes') || ''),
      privacyConsent,
      turnstileToken,
      locale,
    }

    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Booking request failed')
      }

      setStatus('success')
      setMessage(labels.success)
      setPrivacyConsent(false)
      setTurnstileToken('')
      formRef.current?.reset()
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.reset(widgetId)
        } catch {}
      }
    } catch {
      setStatus('error')
      setMessage(labels.error)
    }
  }

  return (
    <>
      {turnstile?.enabled && turnstile.siteKey ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={() => setWidgetReady(true)}
        />
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <form action={onSubmit} ref={formRef} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-sm font-medium text-brown-800">{labels.name}</span>
              <input name="customerName" required className="rounded-2xl border border-stone-200 px-4 py-3 outline-none ring-0 focus:border-brown-400" />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-brown-800">{labels.phone}</span>
              <input name="customerPhone" required className="rounded-2xl border border-stone-200 px-4 py-3 outline-none ring-0 focus:border-brown-400" />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-brown-800">{labels.email}</span>
              <input type="email" name="customerEmail" className="rounded-2xl border border-stone-200 px-4 py-3 outline-none ring-0 focus:border-brown-400" />
            </label>

            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-sm font-medium text-brown-800">{labels.service}</span>
              <select name="serviceId" required defaultValue={preselectedService?.id ?? ''} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none ring-0 focus:border-brown-400">
                <option value="">—</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} · {service.durationMin} min · {currencySymbol} {service.price}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-brown-800">{labels.date}</span>
              <input type="date" name="appointmentDate" required className="rounded-2xl border border-stone-200 px-4 py-3 outline-none ring-0 focus:border-brown-400" />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-brown-800">{labels.time}</span>
              <input type="time" name="appointmentTime" required className="rounded-2xl border border-stone-200 px-4 py-3 outline-none ring-0 focus:border-brown-400" />
            </label>

            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-sm font-medium text-brown-800">{labels.notes}</span>
              <textarea name="notes" rows={5} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none ring-0 focus:border-brown-400" />
            </label>

            {privacy?.consentRequired ? (
              <div className="sm:col-span-2 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4">
                <label className="flex items-start gap-3 text-sm text-stone-700">
                  <input type="checkbox" checked={privacyConsent} onChange={(e) => setPrivacyConsent(e.target.checked)} className="mt-1" />
                  <span>
                    <span className="font-medium text-brown-800">
                      {locale === 'de' ? (
                        <>
                          Ich stimme der Verarbeitung meiner Angaben zu (<a href="/de/privacy" target="_blank" className="underline hover:text-brown-600">Datenschutzerklärung</a>).
                        </>
                      ) : (
                        <>
                          I agree to the processing of my data (<a href="/en/privacy" target="_blank" className="underline hover:text-brown-600">Privacy Policy</a>).
                        </>
                      )}
                    </span>
                    <span className="mt-1 block text-xs text-stone-500">{labels.privacyHint}</span>
                    {privacy?.retentionDays ? <span className="mt-1 block text-xs text-stone-500">{locale === 'de' ? `Die Daten werden standardmäßig bis zu ${privacy.retentionDays} Tage aufbewahrt.` : `Data is retained for up to ${privacy.retentionDays} days by default.`}</span> : null}
                  </span>
                </label>
              </div>
            ) : null}

            {turnstile?.enabled ? (
              <div className="sm:col-span-2 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4">
                <p className="text-sm font-medium text-brown-800">{labels.captcha}</p>
                <p className="mt-1 text-xs text-stone-500">{labels.captchaHint}</p>
                <div id="turnstile-widget" className="mt-3 min-h-[65px]" />
                {!widgetReady ? <p className="mt-2 text-xs text-stone-500">{labels.captchaLoading}</p> : null}
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="rounded-full bg-brown-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brown-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === 'submitting' ? labels.loading : labels.submit}
            </button>
            {message ? <p className={`text-sm ${status === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>{message}</p> : null}
          </div>
        </form>

        <aside className="rounded-3xl border border-stone-200 bg-stone-950 p-6 text-stone-100 shadow-sm sm:p-8">
          <h3 className="text-2xl font-semibold text-white">{labels.title}</h3>
          <p className="mt-4 text-sm leading-7 text-stone-300">{labels.subtitle}</p>

          <div className="mt-8 space-y-4 text-sm text-stone-300">
            <div className="rounded-2xl border border-stone-800 bg-stone-900 p-4">
              <p className="font-semibold text-white">{labels.address}</p>
              <p className="mt-2">{contact?.address || 'Arnulfstraße 104, 80636 München'}</p>
            </div>
            <div className="rounded-2xl border border-stone-800 bg-stone-900 p-4">
              <p className="font-semibold text-white">{labels.contact}</p>
              <p className="mt-2"><a href={`tel:${(contact?.phone || '015563188800').replace(/\s/g, '')}`} className="hover:text-white transition">{contact?.phone || '015563 188800'}</a></p>
              <p><a href={`mailto:${contact?.email || 'chinesischemassage8@gmail.com'}`} className="hover:text-white transition">{contact?.email || 'chinesischemassage8@gmail.com'}</a></p>
            </div>
            <div className="rounded-2xl border border-stone-800 bg-stone-900 p-4">
              <p className="font-semibold text-white">{labels.openingHours}</p>
              <div className="mt-2 space-y-1">
                {hours.length > 0 ? hours.map((item) => (
                  <p key={item.weekday}>{item.label}: {item.isClosed ? labels.closed : `${item.openTime} – ${item.closeTime}`}</p>
                )) : (
                  <>
                    <p>Mon–Sat 09:30–20:00</p>
                    <p>{locale === 'de' ? 'Sonntag nach Vereinbarung' : 'Sunday by arrangement'}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
