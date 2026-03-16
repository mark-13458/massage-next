'use client'

import { useEffect, useState } from 'react'

type NoticeTone = 'success' | 'error' | 'info'

function noticeToneClassName(tone: NoticeTone) {
  if (tone === 'success') return 'bg-emerald-50 text-emerald-700'
  if (tone === 'error') return 'bg-rose-50 text-rose-700'
  return 'bg-stone-100 text-stone-500'
}

export function NoticePill({
  message,
  tone = 'info',
  className = '',
  autoDismiss = true,
}: {
  message: string
  tone?: NoticeTone
  className?: string
  autoDismiss?: boolean
}) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true)
    if (!autoDismiss || tone === 'error') return
    const timer = setTimeout(() => setVisible(false), 3000)
    return () => clearTimeout(timer)
  }, [message, tone, autoDismiss])

  if (!visible) return null

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-sm transition-opacity ${noticeToneClassName(tone)} ${className}`.trim()}>
      {message}
    </span>
  )
}
