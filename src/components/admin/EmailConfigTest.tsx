'use client'

import { useState } from 'react'

interface EmailConfigTestProps {
  lang: 'zh' | 'en'
}

export function EmailConfigTest({ lang }: EmailConfigTestProps) {
  const isZh = lang === 'zh'
  const [testEmail, setTestEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [showConfig, setShowConfig] = useState(false)
  const [config, setConfig] = useState<any>(null)

  const checkConfig = async () => {
    try {
      const response = await fetch('/api/admin/system/email-config')
      const data = await response.json()
      setConfig(data)
      setShowConfig(true)
    } catch (error) {
      setStatus('error')
      setMessage(isZh ? '获取配置失败' : 'Failed to fetch configuration')
    }
  }

  const sendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!testEmail) {
      setStatus('error')
      setMessage(isZh ? '请输入邮箱地址' : 'Please enter email address')
      return
    }

    setLoading(true)
    setStatus('idle')

    try {
      const response = await fetch('/api/admin/system/email-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testEmail }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus('success')
        setMessage(isZh ? '测试邮件已发送，请检查收件箱' : 'Test email sent. Please check your inbox.')
        setTestEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || (isZh ? '发送失败' : 'Failed to send'))
      }
    } catch (error) {
      setStatus('error')
      setMessage(isZh ? '网络错误' : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={checkConfig}
        className="w-full px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-lg text-sm font-medium transition"
      >
        {isZh ? '检查邮件配置' : 'Check Email Configuration'}
      </button>

      {showConfig && config && (
        <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
          <h4 className="font-semibold text-stone-900 mb-3">
            {isZh ? '邮件配置状态' : 'Email Configuration Status'}
          </h4>
          {config.configured ? (
            <div className="space-y-2 text-sm text-stone-700">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                <span>{isZh ? '✓ 邮件服务已配置' : '✓ Email service configured'}</span>
              </div>
              <div>SMTP Host: <span className="font-mono">{config.config?.host || 'hidden'}</span></div>
              <div>SMTP Port: <span className="font-mono">{config.config?.port}</span></div>
              <div>From: <span className="font-mono">{config.config?.from}</span></div>
              <div>Business: <span className="font-mono">{config.config?.business}</span></div>
            </div>
          ) : (
            <div className="text-sm text-red-600">
              {isZh ? '⚠️ 邮件服务未配置。请检查环境变量。' : '⚠️ Email service not configured. Please check environment variables.'}
            </div>
          )}
        </div>
      )}

      {config?.configured && (
        <form onSubmit={sendTestEmail} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              {isZh ? '测试邮箱地址' : 'Test Email Address'}
            </label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
              className="w-full px-4 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-stone-900 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white rounded-lg text-sm font-medium transition"
          >
            {loading
              ? isZh ? '发送中...' : 'Sending...'
              : isZh ? '发送测试邮件' : 'Send Test Email'}
          </button>
        </form>
      )}

      {status === 'success' && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm p-3 rounded-lg">
          {message}
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-3 rounded-lg">
          {message}
        </div>
      )}
    </div>
  )
}
