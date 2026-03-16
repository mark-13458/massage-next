#!/usr/bin/env node

/**
 * 性能基准测试脚本
 * 测试：邮件发送、数据库查询、文件上传性能
 */

import fetch from 'node-fetch'

const BASE_URL = process.env.APP_URL || 'http://localhost:3000'

interface BenchmarkResult {
  name: string
  avgTime: number
  minTime: number
  maxTime: number
  success: number
  failed: number
  total: number
}

const benchmarks: BenchmarkResult[] = []

async function benchmark(
  name: string,
  fn: () => Promise<void>,
  iterations: number = 10
): Promise<void> {
  const times: number[] = []
  let success = 0
  let failed = 0

  console.log(`\n⏱️  Benchmarking: ${name} (${iterations} iterations)...`)

  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    try {
      await fn()
      const duration = performance.now() - start
      times.push(duration)
      success++
      process.stdout.write('.')
    } catch (error) {
      failed++
      process.stdout.write('x')
    }
  }

  const avgTime = times.reduce((a, b) => a + b, 0) / times.length
  const minTime = Math.min(...times)
  const maxTime = Math.max(...times)

  benchmarks.push({
    name,
    avgTime,
    minTime,
    maxTime,
    success,
    failed,
    total: iterations,
  })

  console.log(
    `\n  Average: ${avgTime.toFixed(2)}ms | Min: ${minTime.toFixed(2)}ms | Max: ${maxTime.toFixed(2)}ms`
  )
}

async function runBenchmarks() {
  console.log('🚀 Starting Performance Benchmarks')
  console.log(`📍 Base URL: ${BASE_URL}`)
  console.log('─'.repeat(60))

  // Benchmark 1: 获取审计日志（数据库查询）
  await benchmark(
    'Fetch audit logs (DB query)',
    async () => {
      const response = await fetch(`${BASE_URL}/api/admin/settings/audit-logs`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      if (!data.success) throw new Error('API error')
    },
    5
  )

  // Benchmark 2: 邮件配置检查（SMTP 连接）
  await benchmark(
    'Check email config (SMTP verify)',
    async () => {
      const response = await fetch(`${BASE_URL}/api/admin/system/email-config`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      if (!data.success) throw new Error('API error')
    },
    5
  )

  // Benchmark 3: 创建预约（数据库写入）
  await benchmark(
    'Create appointment (DB write)',
    async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)

      const response = await fetch(`${BASE_URL}/api/booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: `Test ${Date.now()}`,
          customerEmail: `test${Date.now()}@example.com`,
          customerPhone: '01234567890',
          locale: 'de',
          appointmentDate: futureDate.toISOString().split('T')[0],
          appointmentTime: '10:00',
          serviceId: 1,
          notes: 'Benchmark test',
        }),
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      if (!data.success) throw new Error('API error')
    },
    3
  )

  // Benchmark 4: 页面加载（前台）
  await benchmark(
    'Load homepage (frontend)',
    async () => {
      const response = await fetch(`${BASE_URL}/de`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const html = await response.text()
      if (html.length < 1000) throw new Error('Response too small')
    },
    5
  )

  // Benchmark 5: 健康检查（最快的 API）
  await benchmark(
    'Health check endpoint',
    async () => {
      const response = await fetch(`${BASE_URL}/api/healthz`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
    },
    10
  )

  console.log('\n' + '─'.repeat(60))
  console.log('📊 Benchmark Summary')
  console.log('─'.repeat(60))

  let totalAvg = 0
  benchmarks.forEach((b) => {
    const status = b.failed === 0 ? '✅' : '⚠️'
    const avgStr = `${b.avgTime.toFixed(2)}ms`.padEnd(12)
    const rangeStr = `(${b.minTime.toFixed(1)}-${b.maxTime.toFixed(1)}ms)`.padEnd(20)
    const successStr = `${b.success}/${b.total}`.padEnd(8)

    console.log(
      `${status} ${b.name.padEnd(45)} ${avgStr} ${rangeStr} ${successStr}`
    )
    totalAvg += b.avgTime
  })

  const avgOfAvg = totalAvg / benchmarks.length
  console.log('─'.repeat(60))
  console.log(`\n📈 Overall average response time: ${avgOfAvg.toFixed(2)}ms`)

  // Performance recommendations
  console.log('\n💡 Performance Recommendations:')
  benchmarks.forEach((b) => {
    if (b.avgTime > 1000) {
      console.log(`  ⚠️  ${b.name}: ${b.avgTime.toFixed(0)}ms (consider optimization)`)
    }
    if (b.failed > 0) {
      console.log(`  ⚠️  ${b.name}: ${b.failed} failed requests`)
    }
  })

  console.log('\n✅ Benchmark complete!')
  process.exit(0)
}

runBenchmarks().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
