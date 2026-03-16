/**
 * 改约/取消链接处理工具
 * 用于客户端验证和交互
 */

export interface AppointmentLink {
  id: number
  uuid: string
  customerName: string
  appointmentDate: Date
  appointmentTime: string
  locale: string
  durationMin: number
}

/**
 * 验证改约链接
 */
export async function validateRescheduleLink(token: string): Promise<AppointmentLink | null> {
  try {
    const response = await fetch(`/api/appointment/reschedule/${token}`)
    if (!response.ok) {
      return null
    }
    const data = await response.json()
    if (data.success && data.data) {
      return {
        ...data.data,
        appointmentDate: new Date(data.data.appointmentDate),
      }
    }
    return null
  } catch (error) {
    console.error('Error validating reschedule link:', error)
    return null
  }
}

/**
 * 验证取消链接
 */
export async function validateCancelLink(token: string): Promise<AppointmentLink | null> {
  try {
    const response = await fetch(`/api/appointment/cancel/${token}`)
    if (!response.ok) {
      return null
    }
    const data = await response.json()
    if (data.success && data.data) {
      return {
        ...data.data,
        appointmentDate: new Date(data.data.appointmentDate),
      }
    }
    return null
  } catch (error) {
    console.error('Error validating cancel link:', error)
    return null
  }
}

/**
 * 提交改约请求
 */
export async function submitReschedule(
  token: string,
  newDate: Date,
  newTime: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/appointment/reschedule/${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        newDate: newDate.toISOString(),
        newTime,
      }),
    })

    const data = await response.json()
    return {
      success: data.success,
      error: data.error,
    }
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
    }
  }
}

/**
 * 提交取消请求
 */
export async function submitCancel(
  token: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/appointment/cancel/${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    })

    const data = await response.json()
    return {
      success: data.success,
      error: data.error,
    }
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
    }
  }
}

/**
 * 格式化日期时间
 */
export function formatDateTime(date: Date, locale: string = 'de'): string {
  return date.toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * 获取可用的改约时间（示例：未来 30 天的工作日）
 */
export function getAvailableRescheduleSlots(baseDate: Date, locale: string = 'de'): Date[] {
  const slots: Date[] = []
  const current = new Date(baseDate)
  current.setDate(current.getDate() + 1) // 从明天开始

  for (let i = 0; i < 30; i++) {
    const dayOfWeek = current.getDay()
    // 跳过周日 (0)
    if (dayOfWeek !== 0) {
      slots.push(new Date(current))
    }
    current.setDate(current.getDate() + 1)
  }

  return slots
}
