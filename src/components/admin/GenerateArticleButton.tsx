'use client'

import { useState } from 'react'

export function GenerateArticleButton({ lang }: { lang: 'zh' | 'en' }) {
  const zh = lang === 'zh'
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; text: string } | null>(null)

  async function handleGenerate() {
    if (!confirm(zh ? '确认立即生成一篇 AI 文章？' : 'Generate an AI article now?')) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/cron/generate-article', {
        headers: { 'Authorization': `Bearer ${prompt(zh ? '请输入 CRON_SECRET' : 'Enter CRON_SECRET')}` },
      })
      const data = await res.json()
      if (data.success) {
        setResult({ success: true, text: data.message })
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setResult({ success: false, text: data.error || 'Failed' })
      }
    } catch (e) {
      setResult({ success: false, text: e instanceof Error ? e.message : 'Error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="rounded-full border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
      >
        {loading ? (zh ? 'AI 生成中...' : 'Generating...') : (zh ? 'AI 生成文章' : 'AI Generate')}
      </button>
      {result && (
        <span className={`text-xs ${result.success ? 'text-emerald-600' : 'text-red-600'}`}>
          {result.text}
        </span>
      )}
    </div>
  )
}
