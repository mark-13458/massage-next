import { hash, compare } from 'bcryptjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '../../lib/prisma'
import { recordLoginAttempt, checkLoginAttempts } from './booking-protection.service'

export interface LoginCredentials {
  email: string
  password: string
  ipAddress?: string
  userAgent?: string
}

/**
 * 验证登录凭证并创建会话
 */
export async function authenticateAdmin(credentials: LoginCredentials) {
  // 首先检查是否被限流
  const attemptCheck = await checkLoginAttempts(credentials.email)
  if (!attemptCheck.allowed) {
    await recordLoginAttempt(credentials.email, false, {
      ipAddress: credentials.ipAddress,
      userAgent: credentials.userAgent,
      failureReason: 'Too many failed attempts',
    })
    throw new Error(attemptCheck.reason || 'Too many failed login attempts')
  }

  // 查询用户
  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
  })

  if (!user || !user.isActive) {
    await recordLoginAttempt(credentials.email, false, {
      ipAddress: credentials.ipAddress,
      userAgent: credentials.userAgent,
      failureReason: 'Invalid credentials or user inactive',
    })
    throw new Error('Invalid email or password')
  }

  // 验证密码
  const isValidPassword = await compare(credentials.password, user.passwordHash)

  if (!isValidPassword) {
    await recordLoginAttempt(credentials.email, false, {
      ipAddress: credentials.ipAddress,
      userAgent: credentials.userAgent,
      failureReason: 'Invalid password',
    })
    throw new Error('Invalid email or password')
  }

  // 记录成功登录
  await recordLoginAttempt(credentials.email, true, {
    ipAddress: credentials.ipAddress,
    userAgent: credentials.userAgent,
  })

  // 更新最后登录时间
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

  // 创建会话（使用 cookie）
  const cookieStore = await cookies()
  const sessionToken = `admin_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // 设置 HTTP-only cookie（更安全）
  cookieStore.set('admin_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24 小时
    path: '/',
  })

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    sessionToken,
  }
}

/**
 * 注册或初始化管理员账户
 */
export async function initializeAdmin(email: string, password: string, name: string) {
  // 检查是否已存在
  const existing = await prisma.user.findUnique({
    where: { email },
  })

  if (existing) {
    throw new Error('Admin user already exists')
  }

  const passwordHash = await hash(password, 10)

  return prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: 'ADMIN',
      isActive: true,
    },
  })
}

/**
 * 注销登录
 */
export async function logoutAdmin() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  redirect('/admin/login')
}
