'use client'

import { useEffect, useState, useCallback } from 'react'

interface Props {
  lang?: 'zh' | 'en'
  onToken: (token: string) => void
}

function t(lang: 'zh' | 'en', zh: string, en: string) {
  return lang === 'en' ? en : zh
}

// Simple HMAC-free token: base64(a:b:answer:timestamp:nonce)
// Server will decode and verify answer == a + b and timestamp is fresh
export function generateMathToken(a: number, b: number, answer: number): string {
  const nonce = Math.random().toString(36).slice(2, 8)
  const ts = Date.now()
  return btoa(`${a}:${b}:${answer}:${ts}:${nonce}`)
}

export function MathCaptcha({ lang = 'zh', onToken }: Props) {
  const [a, setA] = useState(0)
  const [b, setB] = useState(0)
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [verified, setVerified] = useState(false)

  const refresh = useCallback(() => {
    const na = Math.floor(Math.random() * 9) + 1
    const nb = Math.floor(Math.random() * 9) + 1
    setA(na)
    setB(nb)
    setInput('')
    setError(false)
    setVerified(false)
    onToken('')
  }, [onToken])

  useEffect(() => { refresh() }, [refresh])

  function handleChange(val: string) {
    setInput(val)
    setError(false)
    const num = parseInt(val, 10)
    if (!isNaN(num)) {
      if (num === a + b) {
        setVerified(true)
        onToken(generateMathToken(a, b, num))
      } else {
        setVerified(false)
        onToken('')
      }
    } else {
      setVerified(false)
      onToken('')
    }
  }

  function handleBlur() {
    const num = parseInt(input, 10)
    if (input && (isNaN(num) || num !== a + b)) {
      setError(true)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="select-none rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 font-mono text-base font-semibold text-stone-800 tracking-wider">
        {a} + {b} = ?
      </span>
      <input
        type="number"
        inputMode="numeric"
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        placeholder={t(lang, '答案', 'Answer')}
        className={`w-20 rounded-xl border px-3 py-2.5 text-center text-base outline-none transition
          ${verified ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : error ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-stone-200 bg-white text-stone-900 focus:border-amber-500'}`}
      />
      {verified && (
        <span className="text-sm font-medium text-emerald-600">
          {t(lang, '✓ 验证通过', '✓ Verified')}
        </span>
      )}
      {error && (
        <button type="button" onClick={refresh} className="text-xs text-stone-400 underline hover:text-stone-600">
          {t(lang, '换一题', 'Refresh')}
        </button>
      )}
    </div>
  )
}
