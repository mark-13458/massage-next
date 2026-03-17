'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { adminRequest } from '../../lib/admin-request'
import { MathCaptcha } from './MathCaptcha'

function t(lang: 'zh' | 'en', zh: string, en: string) {
  return lang === 'en' ? en : zh
}

interface Props {
  lang?: 'zh' | 'en'
  turnstileSiteKey?: string | null
}

export function AdminLoginForm({ lang = 'zh', turnstileSiteKey }: Props) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()
  const [turnstileToken, setTurnstileToken] = useState('')
  const [captchaChallenge, setCaptchaChallenge] = useState('')
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [scriptReady, setScriptReady] = useState(false)
  const widgetContainerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  const hasTurnstile = Boolean(turnstileSiteKey)
  // Use math captcha when Turnstile is not configured
  const useMathCaptcha = !hasTurnstile

  // Render Turnstile widget once script is loaded
  useEffect(() => {
    if (!hasTurnstile || !scriptReady || !widgetContainerRef.current || !window.turnstile) return
    if (widgetIdRef.current) return

    widgetIdRef.current = window.turnstile.render(widgetContainerRef.current, {
      sitekey: turnstileSiteKey,
      callback: (token: string) => setTurnstileToken(token),
      'expired-callback': () => setTurnstileToken(''),
      'error-callback': () => setTurnstileToken(''),
      theme: 'light',
    })

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current) } catch {}
        widgetIdRef.current = null
      }
    }
  }, [hasTurnstile, scriptReady, turnstileSiteKey])

  async function submit() {
    setMessage('')

    if (hasTurnstile && !turnstileToken) {
      setMessage(t(lang, '请先完成验证码', 'Please complete the captcha'))
      return
    }
    if (useMathCaptcha && !captchaChallenge) {
      setMessage(t(lang, '请先完成数学验证', 'Please complete the math verification'))
      return
    }

    startTransition(async () => {
      try {
        await adminRequest('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            turnstileToken: turnstileToken || undefined,
            captchaChallenge: captchaChallenge || undefined,
            captchaAnswer: captchaAnswer || undefined,
          }),
        })
        router.push('/admin')
        router.refresh()
      } catch (error) {
        setMessage(error instanceof Error ? error.message : t(lang, '登录失败', 'Login failed'))
        if (widgetIdRef.current && window.turnstile) {
          try { window.turnstile.reset(widgetIdRef.current) } catch {}
        }
        setTurnstileToken('')
        setCaptchaChallenge('')
        setCaptchaAnswer('')
      }
    })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !isPending) submit()
  }

  const captchaReady = hasTurnstile ? Boolean(turnstileToken) : Boolean(captchaChallenge && captchaAnswer)

  return (
    <>
      {hasTurnstile && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={() => setScriptReady(true)}
        />
      )}

      <div className="grid gap-5">
        <label className="flex flex-col gap-2 text-sm font-medium text-stone-300">
          <span>{t(lang, '邮箱', 'Email')}</span>
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            className="rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-white outline-none placeholder:text-stone-500 transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-stone-300">
          <span>{t(lang, '密码', 'Password')}</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-white outline-none placeholder:text-stone-500 transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          />
        </label>

        {hasTurnstile && (
          <div>
            <div ref={widgetContainerRef} className="min-h-[65px]" />
            {!scriptReady && (
              <p className="mt-1 text-xs text-stone-400">{t(lang, '验证码加载中…', 'Loading captcha...')}</p>
            )}
          </div>
        )}

        {useMathCaptcha && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-stone-300">{t(lang, '安全验证', 'Security check')}</span>
            <MathCaptcha lang={lang} onVerified={(ch, ans) => { setCaptchaChallenge(ch); setCaptchaAnswer(ans) }} />
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={submit}
          disabled={isPending || !captchaReady}
          className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-stone-900 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? t(lang, '登录中…', 'Signing in...') : t(lang, '登录后台', 'Sign in')}
        </button>
        {message ? <span className="text-sm text-rose-400">{message}</span> : null}
      </div>
    </>
  )
}
