'use client'

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
}: {
  message: string
  tone?: NoticeTone
  className?: string
}) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-sm ${noticeToneClassName(tone)} ${className}`.trim()}>
      {message}
    </span>
  )
}
