'use client'

import { useState, useTransition } from 'react'
import { adminRequest } from '../../lib/admin-request'

type Props = {
  lang: 'zh' | 'en'
}

function t(lang: 'zh' | 'en', zh: string, en: string) {
  return lang === 'en' ? en : zh
}

export function AdminPasswordForm({ lang }: Props) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  function submit() {
    setMessage('')
    startTransition(async () => {
      try {
        await adminRequest('/api/admin/password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
        })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setMessage(t(lang, '密码已更新', 'Password updated'))
      } catch (error) {
        setMessage(error instanceof Error ? error.message : t(lang, '修改密码失败', 'Failed to update password'))
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, '当前密码', 'Current password')}</span>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, '新密码', 'New password')}</span>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, '确认新密码', 'Confirm new password')}</span>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>
      </div>
      <div className="flex items-center gap-4">
        <button type="button" onClick={submit} disabled={isPending} className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70">
          {isPending ? t(lang, '提交中…', 'Submitting...') : t(lang, '修改密码', 'Update password')}
        </button>
        {message ? <span className="text-sm text-stone-500">{message}</span> : null}
      </div>
    </div>
  )
}
