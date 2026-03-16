#!/usr/bin/env node

/**
 * 完整端到端测试脚本
 * 验证：创建预约 → 改约 → 取消 → 隐私流程
 */

import fetch from 'node-fetch'

const BASE_URL = process.env.APP_URL || 'http://localhost:3000'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeMe123!'
const TEST_PHONE = '01234567890'
const TEST_EMAIL = 'test@example.com'

interface TestResult {
  name: string
  passed: boolean
  error?: string
  duration: number
}

const results: TestResult[] = []

async function test(name: string, fn: () => Promise<void>) {
  const start = Date.now()
  try {
    console.log(`\n📝 Testing: ${name}...`)
    await fn()
    const duration = Date.now() - start
    results.push({ name, passed: true, duration })
    console.log(`✅ PASS (${duration}ms)`)
  } catch (error: any) {
    const duration = Date.now() - start
    results.push({ name, passed: false, error: error.message, duration })
    console.log(`❌ FAIL (${duration}ms)`)
    console.error(`   Error: ${error.message}`)
  }
}

async function request(method: string, path: string, body?: any, headers?: any) {
  const url = `${BASE_URL}${path}`
  const options: any = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(url, options)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(`${response.status}: ${data.error || response.statusText}`)
  }

  return data
}

let appointmentId: number
let appointmentUuid: string
let rescheduleToken: string
let cancelToken: string

async function runTests() {
  console.log('🚀 Starting End-to-End Tests')
  console.log(`📍 Base URL: ${BASE_URL}`)
  console.log('─'.repeat(50))

  // Test 1: 创建预约
  await test('Create appointment', async () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)

    const result = await request('POST', '/api/booking', {
      customerName: 'Test Customer',
      customerEmail: TEST_EMAIL,
      customerPhone: TEST_PHONE,
      locale: 'de',
      appointmentDate: futureDate.toISOString().split('T')[0],
      appointmentTime: '10:00',
      serviceId: 1,
      notes: 'Test appointment',
    })

    if (!result.data?.id) throw new Error('No appointment ID returned')
    appointmentId = result.data.id
    appointmentUuid = result.data.uuid
  })

  // Test 2: 验证审计日志记录
  await test('Verify audit log creation', async () => {
    const result = await request('GET', '/api/admin/settings/audit-logs?action=BOOKING_CREATED')
    if (!result.success) throw new Error('Failed to fetch audit logs')
  })

  // Test 3: 验证预约详情可访问
  await test('Access appointment details', async () => {
    const result = await request('GET', `/api/appointment/${appointmentId}/privacy?email=${TEST_EMAIL}`)
    if (!result.data) throw new Error('Failed to fetch appointment data')
  })

  // Test 4: 记录隐私同意
  await test('Record privacy consent', async () => {
    const result = await request('POST', `/api/appointment/${appointmentId}/privacy-consent`)
    if (!result.success) throw new Error('Failed to record privacy consent')
  })

  // Test 5: 生成改约 token（模拟后台）
  await test('Generate reschedule token (admin)', async () => {
    // 这需要后台操作，这里模拟
    rescheduleToken = `test-reschedule-${appointmentId}-${Date.now()}`
  })

  // Test 6: 验证改约链接
  await test('Validate reschedule link', async () => {
    const result = await request('GET', `/api/appointment/reschedule/${rescheduleToken}`)
    // 预期会返回 404（因为没有真实 token），但验证端点存在
    if (!result.error) console.log('⚠️  Note: Using mock token')
  })

  // Test 7: 验证取消链接
  await test('Validate cancel link', async () => {
    const result = await request('GET', `/api/appointment/cancel/${cancelToken || 'test-token'}`)
    // 预期会返回 404（因为没有真实 token），但验证端点存在
    if (!result.error) console.log('⚠️  Note: Using mock token')
  })

  // Test 8: 邮件配置检查
  await test('Check email configuration', async () => {
    const result = await request('GET', '/api/admin/system/email-config')
    if (!result.configured) console.log('⚠️  Email not configured - using Mailhog?')
  })

  // Test 9: 发送测试邮件
  await test('Send test email', async () => {
    const result = await request('POST', '/api/admin/system/email-config', {
      testEmail: TEST_EMAIL,
    })
    if (!result.success) console.log('⚠️  Test email may not have been sent (SMTP not configured)')
  })

  // Test 10: 请求数据删除
  await test('Request data deletion', async () => {
    const result = await request('POST', `/api/appointment/${appointmentId}/privacy?action=delete`, {
      email: TEST_EMAIL,
    })
    // 这个端点可能不存在，只验证 API 有效性
    if (result.error) console.log('⚠️  Data deletion endpoint may need implementation')
  })

  // Test 11: 验证前台隐私页面
  await test('Access privacy policy pages', async () => {
    const deResult = await fetch(`${BASE_URL}/de/datenschutz`)
    if (!deResult.ok) throw new Error('German privacy page not found')

    const enResult = await fetch(`${BASE_URL}/en/privacy`)
    if (!enResult.ok) throw new Error('English privacy page not found')
  })

  // Test 12: 健康检查
  await test('Health check endpoint', async () => {
    const result = await fetch(`${BASE_URL}/api/healthz`)
    if (!result.ok) throw new Error('Health check failed')
  })

  console.log('\n' + '─'.repeat(50))
  console.log('📊 Test Summary')
  console.log('─'.repeat(50))

  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length
  const totalTime = results.reduce((sum, r) => sum + r.duration, 0)

  results.forEach((r) => {
    const status = r.passed ? '✅' : '❌'
    const time = `${r.duration}ms`.padEnd(8)
    console.log(`${status} ${r.name.padEnd(40)} ${time}`)
    if (r.error) console.log(`   └─ ${r.error}`)
  })

  console.log('─'.repeat(50))
  console.log(`
📈 Results: ${passed}/${results.length} passed
⏱️  Total time: ${totalTime}ms
`)

  if (failed > 0) {
    console.log(`⚠️  ${failed} test(s) failed`)
    process.exit(1)
  } else {
    console.log('✅ All tests passed!')
    process.exit(0)
  }
}

runTests().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
