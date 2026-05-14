'use client'

import { useState, useEffect, useRef } from 'react'

export function GenerateArticleButton({ lang }: { lang: 'zh' | 'en' }) {
  const zh = lang === 'zh'
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; text: string } | null>(null)
  const [backgroundJob, setBackgroundJob] = useState<{ keyword: string } | null>(null)
  const [countdown, setCountdown] = useState(90)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!backgroundJob) return
    setCountdown(90)
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!)
          window.location.reload()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [backgroundJob])

  async function handleGenerate() {
    if (!confirm(zh ? '确认立即生成一篇 AI 文章？' : 'Generate an AI article now?')) return
    setLoading(true)
    setResult(null)
    setBackgroundJob(null)

    try {
      const res = await fetch('/api/admin/articles/generate', { method: 'POST' })

      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        if (res.status === 401 || res.redirected) {
          setResult({ success: false, text: zh ? '登录已过期，请刷新页面重新登录' : 'Session expired, please refresh and login again' })
        } else {
          setResult({ success: false, text: zh ? `服务器返回异常 (${res.status})` : `Server error (${res.status})` })
        }
        return
      }

      const json = await res.json()

      if (!res.ok) {
        setResult({ success: false, text: json.error || (zh ? '生成失败' : 'Generation failed') })
      } else {
        const data = json.data
        if (data?.background) {
          setBackgroundJob({ keyword: data.keyword || '' })
        } else {
          setResult({ success: true, text: data?.message || (zh ? '完成' : 'Done') })
          setTimeout(() => window.location.reload(), 2000)
        }
      }
    } catch (e) {
      setResult({ success: false, text: e instanceof Error ? e.message : 'Error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="inline-flex flex-col gap-2">
      <button
        onClick={handleGenerate}
        disabled={loading || !!backgroundJob}
        className="rounded-full border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
      >
        {loading ? (zh ? '提交中...' : 'Submitting...') : (zh ? 'AI 生成文章' : 'AI Generate')}
      </button>

      {backgroundJob && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs">
          <div className="flex items-center gap-2 font-medium text-blue-700">
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
            {zh
              ? `正在后台生成文章：${backgroundJob.keyword}`
              : `Generating article in background: ${backgroundJob.keyword}`}
          </div>
          <p className="mt-1 text-stone-500">
            {zh
              ? `AI 生成约需 1-2 分钟，页面将在 ${countdown} 秒后自动刷新`
              : `AI generation takes ~1-2 min, page auto-refreshes in ${countdown}s`}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-blue-600 underline hover:text-blue-800"
          >
            {zh ? '立即刷新' : 'Refresh now'}
          </button>
        </div>
      )}

      {result && (
        <div className={`rounded-xl px-3 py-2 text-xs font-medium ${
          result.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
        }`}>
          {result.success ? '✓ ' : '✗ '}{result.text}
        </div>
      )}
    </div>
  )
}
