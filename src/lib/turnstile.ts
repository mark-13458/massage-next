import { getSystemSettings } from '../server/services/site.service'

export async function getTurnstileSettings() {
  const settings = await getSystemSettings().catch(() => null)

  return {
    enabled: Boolean(settings?.cfTurnstileEnabled),
    siteKey: settings?.cfTurnstileSiteKey || '',
    secretKey: settings?.cfTurnstileSecretKey || '',
  }
}

export async function verifyTurnstileToken(token?: string | null, remoteip?: string | null) {
  const settings = await getTurnstileSettings()

  if (!settings.enabled) {
    return { ok: true, skipped: true as const }
  }

  if (!settings.secretKey) {
    return { ok: false, error: 'Turnstile secret key is missing' }
  }

  if (!token) {
    return { ok: false, error: 'Turnstile token is missing' }
  }

  const form = new URLSearchParams()
  form.set('secret', settings.secretKey)
  form.set('response', token)
  if (remoteip) form.set('remoteip', remoteip)

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
    cache: 'no-store',
  })

  if (!response.ok) {
    return { ok: false, error: `Turnstile verify failed with status ${response.status}` }
  }

  const json = await response.json().catch(() => null) as { success?: boolean; ['error-codes']?: string[] } | null

  if (!json?.success) {
    return { ok: false, error: (json?.['error-codes'] || ['turnstile_verification_failed']).join(', ') }
  }

  return { ok: true }
}
