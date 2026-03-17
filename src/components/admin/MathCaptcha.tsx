'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

interface Props {
  lang?: 'zh' | 'en'
  /** Called with { challenge, answer } when verified, or empty strings when reset */
  onVerified: (challenge: string, answer: string) => void
}

function t(lang: 'zh' | 'en', zh: string, en: string) {
  return lang === 'en' ? en : zh
}

export function MathCaptcha({ lang = 'zh', onVerified }: Props) {
  const [challenge, setChallenge] = useState('')
  const [question, setQuestion] = useState('')
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(false)

  // 用 ref 存 onVerified，避免父组件每次渲染传入新引用时触发 refresh
  const onVerifiedRef = useRef(onVerified)
  useEffect(() => { onVerifiedRef.current = onVerified }, [onVerified])

  const refresh = useCallback(async () => {
    setLoading(true)
    setInput('')
    setError(false)
    setVerified(false)
    onVerifiedRef.current('', '')
    try {
      const res = await fetch('/api/admin/captcha')
      const json = await res.json() as { data?: { challenge: string; question: string } }
      if (json.data) {
        setChallenge(json.data.challenge)
        setQuestion(json.data.question)
      }
    } catch {
      setQuestion('? + ?')
    } finally {
      setLoading(false)
    }
  }, []) // 依赖为空，只在 mount 时执行一次

  useEffect(() => { refresh() }, [refresh])

  function handleChange(val: string) {
    setInput(val)
    setError(false)
    const num = parseInt(val, 10)
    if (!isNaN(num) && val.trim() !== '') {
      // Optimistically mark verified — server will do final check on submit
      // We just need a non-empty answer to enable the submit button
      setVerified(true)
      onVerifiedRef.current(challenge, String(num))
    } else {
      setVerified(false)
      onVerifiedRef.current('', '')
    }
  }

  function handleBlur() {
    const num = parseInt(input, 10)
    if (input && isNaN(num)) {
      setError(true)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="select-none rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 font-mono text-base font-semibold text-stone-800 tracking-wider min-w-[90px] text-center">
        {loading ? '…' : `${question} = ?`}
      </span>
      <input
        type="number"
        inputMode="numeric"
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        placeholder={t(lang, '答案', 'Answer')}
        disabled={loading}
        className={`w-20 rounded-xl border px-3 py-2.5 text-center text-base outline-none transition
          ${verified ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : error ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-stone-200 bg-white text-stone-900 focus:border-amber-500'}`}
      />
      {verified && (
        <span className="text-sm font-medium text-emerald-600">
          {t(lang, '✓ 验证通过', '✓ Verified')}
        </span>
      )}
      {(error || (!loading && !verified && input)) && (
        <button type="button" onClick={refresh} className="text-xs text-stone-400 underline hover:text-stone-600">
          {t(lang, '换一题', 'Refresh')}
        </button>
      )}
    </div>
  )
}
