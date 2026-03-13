'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

function t(lang: 'zh' | 'en', zh: string, en: string) {
  return lang === 'en' ? en : zh
}

export function AdminLoginForm({ lang = 'zh' }: { lang?: 'zh' | 'en' }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  async function submit() {
    setMessage('')

    startTransition(async () => {
      try {
        const response = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        if (!response.ok) {
          const json = await response.json().catch(() => ({}))
          throw new Error(json.error || 'Login failed')
        }

        router.push('/admin')
        router.refresh()
      } catch (error) {
        setMessage(error instanceof Error ? error.message : t(lang, '登录失败', 'Login failed'))
      }
    })
  }

  return (
    <div className="rounded-3xl bg-white p-8 shadow-sm">
      <div className="grid gap-4">
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, '邮箱', 'Email')}</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, '密码', 'Password')}</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <button type="button" onClick={submit} disabled={isPending} className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70">
          {isPending ? t(lang, '登录中…', 'Signing in...') : t(lang, '登录后台', 'Sign in')}
        </button>
        {message ? <span className="text-sm text-rose-600">{message}</span> : null}
      </div>
    </div>
  )
}
