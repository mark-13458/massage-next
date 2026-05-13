'use client'

import { useState, useEffect } from 'react'
import { adminRequest } from '../../lib/admin-request'

type AISettingsData = {
  provider: string
  apiKey: string
  model: string
  pexelsApiKey: string
  imageGenProvider: string
  imageGenApiKey: string
}

const IMAGE_GEN_OPTIONS = [
  { value: 'pollinations', label: 'Pollinations.ai (免费，无需 Key / Free, no key)' },
  { value: 'openai', label: 'DALL-E 3 (OpenAI)' },
  { value: 'stability', label: 'Stability AI' },
]

const PROVIDER_OPTIONS = [
  { value: 'openrouter', label: 'OpenRouter', defaultModel: 'google/gemini-2.0-flash-001' },
  { value: 'gemini', label: 'Google Gemini', defaultModel: 'gemini-2.0-flash' },
  { value: 'claude', label: 'Claude (Anthropic)', defaultModel: 'claude-sonnet-4-20250514' },
]

export function AISettingsForm({ lang }: { lang: 'zh' | 'en' }) {
  const zh = lang === 'zh'
  const [provider, setProvider] = useState('openrouter')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('')
  const [pexelsApiKey, setPexelsApiKey] = useState('')
  const [imageGenProvider, setImageGenProvider] = useState('pollinations')
  const [imageGenApiKey, setImageGenApiKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [testResult, setTestResult] = useState<{ success: boolean; text: string } | null>(null)

  useEffect(() => {
    adminRequest<{ value: AISettingsData | null }>('/api/admin/settings/ai')
      .then((data) => {
        const v = data?.value
        if (v) {
          setProvider(v.provider || 'openrouter')
          setApiKey(v.apiKey || '')
          setModel(v.model || '')
          setPexelsApiKey(v.pexelsApiKey || '')
          setImageGenProvider(v.imageGenProvider || 'pollinations')
          setImageGenApiKey(v.imageGenApiKey || '')
        }
      })
      .catch(() => {})
  }, [])

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    try {
      await adminRequest('/api/admin/settings/ai', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey, model, pexelsApiKey, imageGenProvider, imageGenApiKey }),
      })
      setMessage({ type: 'success', text: zh ? '保存成功' : 'Settings saved' })
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Save failed' })
    } finally {
      setSaving(false)
    }
  }

  async function handleTest() {
    setTesting(true)
    setTestResult(null)
    try {
      const data = await adminRequest<{ success: boolean; response?: string; error?: string }>('/api/admin/settings/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey, model }),
      })
      if (data?.success) {
        setTestResult({ success: true, text: data.response || (zh ? '连接成功' : 'Connection OK') })
      } else {
        setTestResult({ success: false, text: data?.error || (zh ? '连接失败' : 'Connection failed') })
      }
    } catch (e) {
      setTestResult({ success: false, text: e instanceof Error ? e.message : 'Test failed' })
    } finally {
      setTesting(false)
    }
  }

  const currentDefault = PROVIDER_OPTIONS.find((p) => p.value === provider)?.defaultModel || ''

  return (
    <div className="space-y-4">
      {/* Provider */}
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">
          {zh ? 'AI 提供商' : 'AI Provider'}
        </label>
        <select
          value={provider}
          onChange={(e) => {
            setProvider(e.target.value)
            setModel('')
          }}
          className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
        >
          {PROVIDER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* API Key */}
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={zh ? '输入 API Key' : 'Enter API Key'}
          className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
        />
      </div>

      {/* Model */}
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">
          {zh ? '模型名称' : 'Model name'}
        </label>
        <input
          type="text"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder={currentDefault}
          className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-stone-400">
          {zh ? `留空使用默认: ${currentDefault}` : `Leave empty for default: ${currentDefault}`}
        </p>
      </div>

      {/* Image Generation */}
      <div className="border-t border-stone-200 pt-4">
        <p className="mb-3 text-sm font-semibold text-stone-700">
          {zh ? '文章图片生成' : 'Article Image Generation'}
        </p>

        {/* Image Gen Provider */}
        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium text-stone-700">
            {zh ? '图片生成方式' : 'Image provider'}
          </label>
          <select
            value={imageGenProvider}
            onChange={(e) => {
              setImageGenProvider(e.target.value)
              if (e.target.value === 'pollinations') setImageGenApiKey('')
            }}
            className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
          >
            {IMAGE_GEN_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-stone-400">
            {zh
              ? 'Pollinations.ai 免费无需配置，DALL-E 3 / Stability AI 需填入对应 API Key'
              : 'Pollinations.ai is free with no setup. DALL-E 3 / Stability AI require an API Key below.'}
          </p>
        </div>

        {/* Image Gen API Key (only for paid providers) */}
        {imageGenProvider !== 'pollinations' && (
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              {imageGenProvider === 'openai' ? 'OpenAI API Key' : 'Stability AI API Key'}
            </label>
            <input
              type="password"
              value={imageGenApiKey}
              onChange={(e) => setImageGenApiKey(e.target.value)}
              placeholder={zh ? '输入 API Key' : 'Enter API Key'}
              className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-stone-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700 disabled:opacity-50"
        >
          {saving ? (zh ? '保存中...' : 'Saving...') : (zh ? '保存设置' : 'Save settings')}
        </button>
        <button
          onClick={handleTest}
          disabled={testing || !apiKey}
          className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500 disabled:opacity-50"
        >
          {testing ? (zh ? '测试中...' : 'Testing...') : (zh ? '测试连接' : 'Test connection')}
        </button>
      </div>

      {/* Messages */}
      {message && (
        <p className={`text-sm ${message.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}
      {testResult && (
        <div className={`rounded-xl p-3 text-sm ${testResult.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          <span className="font-medium">{testResult.success ? (zh ? '✓ 成功：' : '✓ Success: ') : (zh ? '✗ 失败：' : '✗ Failed: ')}</span>
          {testResult.text}
        </div>
      )}
    </div>
  )
}
