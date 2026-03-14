'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { adminRequest } from '../../lib/admin-request'
import { NoticePill } from './NoticePill'

type AdminLang = 'zh' | 'en'
type NoticeTone = 'success' | 'error' | 'info'

function t(lang: AdminLang, zh: string, en: string) {
  return lang === 'en' ? en : zh
}

export function GalleryQuickActions({
  id,
  lang = 'zh',
  initialActive,
  initialCover,
}: {
  id: number
  lang?: AdminLang
  initialActive: boolean
  initialCover: boolean
}) {
  const router = useRouter()
  const [isActive, setIsActive] = useState(initialActive)
  const [isCover, setIsCover] = useState(initialCover)
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<NoticeTone>('info')
  const [isPending, startTransition] = useTransition()

  function update(payload: { isActive?: boolean; isCover?: boolean }, successMessage: string) {
    setMessage(t(lang, '正在处理…', 'Working...'))
    setMessageTone('info')

    startTransition(async () => {
      try {
        const data = await adminRequest<{ item?: { isActive?: boolean; isCover?: boolean } }>(`/api/admin/gallery/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (typeof data?.item?.isActive === 'boolean') setIsActive(data.item.isActive)
        if (typeof data?.item?.isCover === 'boolean') setIsCover(data.item.isCover)

        setMessage(successMessage)
        setMessageTone('success')
        router.refresh()
      } catch (error) {
        setMessage(error instanceof Error ? error.message : t(lang, '操作失败', 'Action failed'))
        setMessageTone('error')
      }
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            update(
              { isActive: !isActive },
              !isActive
                ? t(lang, '图片已启用，列表已刷新', 'Image activated and list refreshed')
                : t(lang, '图片已停用，列表已刷新', 'Image deactivated and list refreshed'),
            )
          }
          className="rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-700 transition hover:border-stone-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isActive ? t(lang, '停用', 'Deactivate') : t(lang, '启用', 'Activate')}
        </button>

        <button
          type="button"
          disabled={isPending || isCover}
          onClick={() => update({ isCover: true }, t(lang, '已设为封面，列表已刷新', 'Set as cover and list refreshed'))}
          className="rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-800 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCover ? t(lang, '当前封面', 'Current cover') : t(lang, '设为封面', 'Set as cover')}
        </button>
      </div>

      {message ? <NoticePill message={message} tone={messageTone} className="text-xs" /> : null}
    </div>
  )
}
