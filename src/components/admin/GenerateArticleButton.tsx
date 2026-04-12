'use client'

import { useState, useEffect, useRef } from 'react'

type Step = {
  label: string
  status: 'pending' | 'active' | 'done' | 'error'
}

const STEPS_ZH: string[] = [
  '检查 AI 配置',
  '获取待用关键词',
  '收集网站信息',
  '调用 AI 生成文章',
  '解析并保存文章',
]

const STEPS_EN: string[] = [
  'Checking AI config',
  'Fetching pending keyword',
  'Collecting site info',
  'Calling AI to generate',
  'Parsing & saving article',
]

export function GenerateArticleButton({ lang }: { lang: 'zh' | 'en' }) {
  const zh = lang === 'zh'
  const labels = zh ? STEPS_ZH : STEPS_EN
  const [loading, setLoading] = useState(false)
  const [steps, setSteps] = useState<Step[]>([])
  const [result, setResult] = useState<{ success: boolean; text: string } | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 模拟进度推进（因为实际是单次请求，用定时器模拟步骤推进）
  function startProgress() {
    const initial: Step[] = labels.map((label, i) => ({
      label,
      status: i === 0 ? 'active' : 'pending',
    }))
    setSteps(initial)

    let current = 0
    // 步骤推进间隔：前几步快，AI 生成步骤慢
    const intervals = [1500, 2000, 2000, 15000, 5000]

    timerRef.current = setInterval(() => {
      current++
      if (current >= labels.length) {
        if (timerRef.current) clearInterval(timerRef.current)
        return
      }
      setSteps((prev) =>
        prev.map((s, i) => ({
          ...s,
          status: i < current ? 'done' : i === current ? 'active' : 'pending',
        }))
      )
    }, intervals[current - 1] || 3000)
  }

  function stopProgress(success: boolean) {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setSteps((prev) =>
      prev.map((s) => ({
        ...s,
        status: success
          ? 'done'
          : s.status === 'active' ? 'error' : s.status === 'done' ? 'done' : 'pending',
      }))
    )
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  async function handleGenerate() {
    if (!confirm(zh ? '确认立即生成一篇 AI 文章？' : 'Generate an AI article now?')) return
    setLoading(true)
    setResult(null)
    startProgress()

    try {
      const res = await fetch('/api/admin/articles/generate', { method: 'POST' })

      // 处理非 JSON 响应（如登录重定向返回 HTML）
      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        stopProgress(false)
        if (res.status === 401 || res.redirected) {
          setResult({ success: false, text: zh ? '登录已过期，请刷新页面重新登录' : 'Session expired, please refresh and login again' })
        } else {
          setResult({ success: false, text: zh ? `服务器返回异常 (${res.status})` : `Server error (${res.status})` })
        }
        return
      }

      const json = await res.json()

      if (!res.ok) {
        stopProgress(false)
        setResult({ success: false, text: json.error || (zh ? '生成失败' : 'Generation failed') })
      } else {
        stopProgress(true)
        const data = json.data
        setResult({ success: true, text: data?.message || (zh ? '生成完成' : 'Done') })
        setTimeout(() => window.location.reload(), 2000)
      }
    } catch (e) {
      stopProgress(false)
      const msg = e instanceof Error ? e.message : 'Error'
      setResult({ success: false, text: zh ? `请求失败: ${msg}` : `Request failed: ${msg}` })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="inline-flex flex-col gap-2">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="rounded-full border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
      >
        {loading ? (zh ? 'AI 生成中...' : 'Generating...') : (zh ? 'AI 生成文章' : 'AI Generate')}
      </button>

      {/* 步骤进度 */}
      {steps.length > 0 && (
        <div className="mt-1 space-y-1 rounded-xl border border-stone-200 bg-white p-3 text-xs shadow-sm">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              {step.status === 'done' && <span className="text-emerald-500">✓</span>}
              {step.status === 'active' && <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />}
              {step.status === 'pending' && <span className="text-stone-300">○</span>}
              {step.status === 'error' && <span className="text-red-500">✗</span>}
              <span className={
                step.status === 'done' ? 'text-emerald-600' :
                step.status === 'active' ? 'font-medium text-blue-700' :
                step.status === 'error' ? 'text-red-600' :
                'text-stone-400'
              }>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 最终结果 */}
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
