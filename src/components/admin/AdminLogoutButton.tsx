'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { adminRequest } from '../../lib/admin-request'

function t(lang: 'zh' | 'en', zh: string, en: string) {
  return lang === 'en' ? en : zh
}

export function AdminLogoutButton({ lang }: { lang: 'zh' | 'en' }) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  function logout() {
    setMessage('')
    startTransition(async () => {
      try {
        await adminRequest('/api/admin/logout', { method: 'POST' })

        router.push('/')
        router.refresh()
      } catch (error) {
        setMessage(error instanceof Error ? error.message : t(lang, '退出失败', 'Logout failed'))
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={logout}
        disabled={isPending}
        className="rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-700 transition hover:border-stone-500 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? t(lang, '退出中…', 'Signing out...') : t(lang, '退出登录', 'Sign out')}
      </button>
      {message ? <span className="text-xs text-rose-600">{message}</span> : null}
    </div>
  )
}
