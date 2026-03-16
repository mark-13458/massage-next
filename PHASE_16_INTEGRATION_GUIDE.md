# Phase 16 - 预约安全与审计体系集成指南

## 概述

Phase 16 引入了三个新的安全核心服务：
1. **审计日志** - 记录所有关键业务事件
2. **预约频率限制** - 防止恶意与刷屏预约
3. **登录防暴力** - 保护后台账户安全

本指南说明如何在现有接口与流程中正确集成这些防护机制。

---

## 1. 数据库迁移

### 执行迁移
```bash
# 开发环境
npx prisma migrate dev --name phase_16_security_audit

# 生产环境（Docker）
docker exec <container_id> npx prisma migrate deploy

# 或手动运行 SQL
mysql < prisma/migrations/phase_16_security_audit/migration.sql
```

### 验证迁移成功
```bash
# 检查新表是否创建
npx prisma db push --skip-generate

# 查看 schema
npx prisma studio  # 打开 Prisma Studio 查看数据
```

---

## 2. 在预约 API 中集成防护

### 当前实现

文件：`src/server/services/booking.service.ts`

```typescript
import { checkBookingFrequencyLimit } from './booking-protection.service'
import { createAuditLog } from './audit.service'

export async function createBooking(
  input: BookingInput, 
  context?: { ipAddress?: string; userAgent?: string }
) {
  // 1. 检查频率限制
  if (input.customerPhone) {
    const phoneCheck = await checkBookingFrequencyLimit({
      limitType: 'PHONE',
      limitValue: input.customerPhone,
    })
    if (!phoneCheck.allowed) {
      throw new Error(phoneCheck.reason)
    }
  }

  // 2. 创建预约
  const appointment = await prisma.appointment.create(...)

  // 3. 记录审计日志
  await createAuditLog({
    action: 'BOOKING_CREATED',
    entityType: 'APPOINTMENT',
    entityId: appointment.id,
    ipAddress: context?.ipAddress,
    additionalInfo: { customerPhone, serviceId }
  })

  return appointment
}
```

### 在 Route 中传递上下文

文件：`src/app/api/booking/route.ts` 或类似位置

```typescript
import { createBooking } from '@/server/services/booking.service'
import { headers } from 'next/headers'

export async function POST(req: Request) {
  const headersList = await headers()
  const ipAddress = headersList.get('x-forwarded-for') || 
                   headersList.get('x-real-ip') || 
                   'unknown'
  const userAgent = headersList.get('user-agent') || undefined

  const body = await req.json()
  
  try {
    const appointment = await createBooking(body, {
      ipAddress,
      userAgent,
    })
    return Response.json({ success: true, data: appointment })
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 400 }
    )
  }
}
```

---

## 3. 后台预约操作记录

### 在预约管理中记录操作

文件：`src/server/services/admin-booking.service.ts` 或预约更新路由

```typescript
import { logBookingAction } from './audit.service'

export async function confirmBooking(appointmentId: number, adminId: number) {
  const oldAppointment = await prisma.appointment.findUnique({
    where: { id: appointmentId }
  })

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { 
      status: 'CONFIRMED',
      confirmedById: adminId,
      confirmedAt: new Date()
    }
  })

  // 记录审计日志
  await logBookingAction('CONFIRMED', appointmentId, {
    changedBy: adminId,
    oldStatus: oldAppointment?.status,
    newStatus: 'CONFIRMED'
  })

  return updated
}
```

---

## 4. 在后台登录中集成防护

### 登录防暴力保护

文件：`src/server/services/admin-auth.service.ts`

```typescript
import { authenticateAdmin } from '@/server/services/admin-auth.service'
import { headers } from 'next/headers'

// 在登录 API 中使用
export async function POST(req: Request) {
  const headersList = await headers()
  const ipAddress = headersList.get('x-forwarded-for') || 'unknown'
  const userAgent = headersList.get('user-agent')

  const { email, password } = await req.json()

  try {
    const result = await authenticateAdmin({
      email,
      password,
      ipAddress,
      userAgent,
    })
    
    return Response.json({ 
      success: true, 
      data: { userId: result.userId, name: result.name }
    })
  } catch (error: any) {
    // 已自动记录失败尝试与限流检查
    return Response.json(
      { success: false, error: error.message },
      { status: 401 }
    )
  }
}
```

---

## 5. 后台查看审计日志

### 访问审计日志页面

```
http://localhost:3000/admin/settings/audit-logs
```

### 按操作类型筛选

```
http://localhost:3000/admin/settings/audit-logs?action=BOOKING_CREATED
http://localhost:3000/admin/settings/audit-logs?action=BOOKING_CONFIRMED
```

### 获取日志 API（可选）

如需后端 API 获取日志：

```typescript
import { getAuditLogs } from '@/server/services/audit.service'

const logs = await getAuditLogs({
  action: 'BOOKING_CREATED',
  limit: 100,
  offset: 0
})
```

---

## 6. 频率限制配置调整

### 修改保护规则

文件：`src/server/services/booking-protection.service.ts`

```typescript
export const BOOKING_PROTECTION_CONFIG = {
  // 时间窗口（分钟）
  WINDOW_MINUTES: 60,
  // 时间窗口内最大预约数
  MAX_BOOKINGS_PER_WINDOW: 3,
  // 黑名单阈值（同一时间段违规次数）
  ABUSE_THRESHOLD: 5,
}
```

修改这些值以调整防护强度：
- `WINDOW_MINUTES: 120` - 扩大检查周期到 2 小时
- `MAX_BOOKINGS_PER_WINDOW: 5` - 允许更多预约

---

## 7. 日志清理与维护

### 定期清理过期记录

```typescript
import { cleanupExpiredFrequencyLimits } from '@/server/services/booking-protection.service'

// 在 cron job 或后台任务中调用
async function maintenanceTask() {
  await cleanupExpiredFrequencyLimits()
}
```

### 推荐配置
- 每天运行一次清理
- 保留 24 小时以上的频率限制记录

---

## 8. 常见问题

### Q: 频率限制是否影响真实用户？

**A**: 防护规则设定相当宽松：
- 每小时最多 3 次预约/维度
- 一般用户不会超过

如果有客户反馈被限流，可通过后台关闭防护或扩大时间窗口。

### Q: 如何重置某个用户的限流？

**A**: 直接在数据库删除对应记录：

```sql
DELETE FROM BookingFrequencyLimit 
WHERE limitType = 'PHONE' AND limitValue = '123456789';
```

### Q: 审计日志会无限增长吗？

**A**: 暂未实现自动清理。建议定期归档或执行：

```sql
-- 删除 30 天前的日志
DELETE FROM AuditLog 
WHERE createdAt < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

### Q: 如何在生产环境禁用频率限制？

**A**: 临时修改配置或在 route 中跳过检查（不推荐）。建议保持启用以防滥用。

---

## 9. 测试清单

- [ ] 新建预约 → 检查 AuditLog 是否记录
- [ ] 修改预约状态 → 检查 logBookingAction 是否记录
- [ ] 快速创建多个预约 → 检查是否触发频率限制
- [ ] 后台登录失败 5 次 → 检查是否被限流
- [ ] 查看审计日志页面 → 确保数据正确展示
- [ ] 按操作类型筛选 → 确保过滤功能正常

---

## 10. 下阶段计划

Phase 17 将继续推进：
- [ ] 改约/取消安全 token 链接
- [ ] 邮件中直接操作改约/取消
- [ ] 隐私同意真实流程
- [ ] 数据保留与删除工作流
