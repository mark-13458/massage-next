import { createHmac } from 'crypto'
import { apiOk } from '../../../../lib/api-response'
import { env } from '../../../../lib/env'

const TTL_MS = 10 * 60 * 1000 // 10 minutes

function signCaptcha(a: number, b: number, ts: number): string {
  return createHmac('sha256', env.sessionSecret)
    .update(`${a}:${b}:${ts}`)
    .digest('hex')
}

export function GET() {
  const a = Math.floor(Math.random() * 9) + 1
  const b = Math.floor(Math.random() * 9) + 1
  const ts = Date.now()
  const sig = signCaptcha(a, b, ts)
  // challenge token: base64(a:b:ts:sig)
  const challenge = Buffer.from(`${a}:${b}:${ts}:${sig}`).toString('base64')
  return apiOk({ challenge, question: `${a} + ${b}` })
}

/**
 * Verify a submitted answer against a challenge token.
 * Called by the login route — exported for reuse.
 */
export function verifyCaptchaToken(challenge: string | undefined, answer: string | undefined): string | null {
  if (!challenge) return 'Captcha challenge missing'
  if (!answer) return 'Captcha answer missing'

  let decoded: string
  try {
    decoded = Buffer.from(challenge, 'base64').toString('utf8')
  } catch {
    return 'Invalid captcha token'
  }

  const parts = decoded.split(':')
  if (parts.length !== 4) return 'Invalid captcha token format'

  const [aStr, bStr, tsStr, sig] = parts
  const a = parseInt(aStr, 10)
  const b = parseInt(bStr, 10)
  const ts = parseInt(tsStr, 10)

  if (isNaN(a) || isNaN(b) || isNaN(ts)) return 'Invalid captcha token values'

  // Check expiry
  if (Date.now() - ts > TTL_MS) return 'Captcha expired, please refresh'

  // Verify HMAC signature
  const expected = signCaptcha(a, b, ts)
  if (sig !== expected) return 'Captcha token tampered'

  // Verify answer
  const userAnswer = parseInt(answer, 10)
  if (isNaN(userAnswer) || userAnswer !== a + b) return 'Incorrect captcha answer'

  return null // OK
}
