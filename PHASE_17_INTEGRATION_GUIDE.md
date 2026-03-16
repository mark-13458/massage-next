# Phase 17 - 改约/取消流程与隐私合规集成指南

## 概述

Phase 17 实现了完整的改约/取消工作流和隐私合规体系：

1. **改约/取消安全链接** - 7 天有效的一次性 token
2. **邮件通知** - 预约、改约、取消、隐私的自动邮件
3. **隐私管理** - GDPR 合规的数据删除与导出
4. **审计追踪** - 所有改约/取消操作的完整记录

本指南说明如何在现有系统中集成这些功能。

---

## 1. 数据库迁移

### 执行迁移
```bash
# 开发环境
npx prisma migrate dev --name phase_17_reschedule_privacy

# 生产环境（Docker）
docker exec <container_id> npx prisma migrate deploy

# 或手动执行 SQL
mysql < prisma/migrations/phase_17_reschedule_privacy/migration.sql
```

### 验证迁移成功
```bash
# 检查新字段与表
npx prisma db push --skip-generate

# 查看 schema
npx prisma studio
```

---

## 2. 邮件配置

### 环境变量设置

在 `.env.local` 中配置 SMTP：

```env
# SMTP 配置
SMTP_HOST=smtp.your-email-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@massage-next.de
BUSINESS_NAME="Your Massage Studio"

# 应用 URL（用于生成链接）
APP_URL=https://www.your-domain.de
```

### 验证邮件配置

在后台管理页面添加测试按钮（可选）：

```typescript
import { verifyEmailConfiguration } from '@/server/services/email.service'

// 验证 SMTP 配置
const isValid = await verifyEmailConfiguration()
if (isValid) {
  console.log('邮件服务已配置正确')
}
```

---

## 3. 在预约创建中集成改约/取消链接

### 生成 Token 并发送邮件

文件：预约创建后的处理流程

```typescript
import { 
  generateRescheduleToken, 
  generateCancelToken 
} from '@/server/services/appointment-reschedule.service'
import { sendBookingConfirmationEmail } from '@/server/services/email.service'

export async function handleNewBooking(appointment: Appointment) {
  // 1. 生成改约与取消 token
  const rescheduleLink = await generateRescheduleToken(appointment.id)
  const cancelLink = await generateCancelToken(appointment.id)

  // 2. 发送确认邮件（包含链接）
  await sendBookingConfirmationEmail({
    uuid: appointment.uuid,
    customerName: appointment.customerName,
    customerEmail: appointment.customerEmail,
    appointmentDate: appointment.appointmentDate,
    appointmentTime: appointment.appointmentTime,
    service: appointment.service,
    locale: appointment.locale,
    rescheduleToken: rescheduleLink.token,
    cancelToken: cancelLink.token,
  })

  return {
    appointment,
    rescheduleUrl: rescheduleLink.url,
    cancelUrl: cancelLink.url,
  }
}
```

---

## 4. 改约/取消 API 使用

### 前台集成示例

```typescript
// 改约提交
async function handleReschedule(token: string, newDate: Date, newTime: string) {
  const response = await fetch(`/api/appointment/reschedule/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      newDate: newDate.toISOString(),
      newTime,
    }),
  })

  const result = await response.json()
  if (result.success) {
    alert('预约已改约，确认邮件已发送')
  } else {
    alert('改约失败：' + result.error)
  }
}

// 取消提交
async function handleCancel(token: string, reason?: string) {
  const response = await fetch(`/api/appointment/cancel/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  })

  const result = await response.json()
  if (result.success) {
    alert('预约已取消，通知邮件已发送')
  } else {
    alert('取消失败：' + result.error)
  }
}
```

---

## 5. 隐私同意与数据删除

### 记录隐私同意

```typescript
import { recordPrivacyConsent } from '@/server/services/privacy.service'

// 在预约后记录隐私同意
async function recordConsent(appointmentId: number) {
  const result = await recordPrivacyConsent(appointmentId)
  if (result) {
    console.log('隐私同意已记录')
  }
}
```

### 数据删除请求

```typescript
import { requestDataDeletion } from '@/server/services/privacy.service'

// 客户请求数据删除
async function handleDataDeletion(appointmentId: number, email: string) {
  const result = await requestDataDeletion(appointmentId, email)
  if (result) {
    console.log('数据删除请求已提交，30天内完成')
  }
}
```

### 数据导出

```typescript
import { getCustomerData } from '@/server/services/privacy.service'

// 导出客户个人数据
async function exportCustomerData(appointmentId: number, email: string) {
  const data = await getCustomerData(appointmentId, email)
  if (data) {
    // 返回 JSON 或转换为 PDF/CSV
    console.log('个人数据导出成功')
  }
}
```

---

## 6. 定期维护任务

### 清理过期 Token

```typescript
import { cleanupExpiredTokens } from '@/server/services/appointment-reschedule.service'

// 在 cron job 中每天执行
async function dailyCleanup() {
  await cleanupExpiredTokens()
}
```

### 执行数据删除与保留期清理

```typescript
import { runDataMaintenanceTask } from '@/server/services/privacy.service'

// 在 cron job 中每天执行（推荐凌晨）
async function nightly() {
  const results = await runDataMaintenanceTask()
  console.log('已处理删除请求:', results.requestedDeletionsProcessed)
  console.log('已处理保留期过期:', results.retentionExpiredProcessed)
}
```

---

## 7. 后台管理功能（可选）

### 显示改约/取消历史

```typescript
// 在预约详情页中显示历史
import { prisma } from '@/lib/prisma'

async function getAppointmentAuditHistory(appointmentId: number) {
  return await prisma.appointmentAudit.findMany({
    where: { appointmentId },
    orderBy: { createdAt: 'desc' },
  })
}
```

### 手动执行数据删除

```typescript
import { executeDataDeletion } from '@/server/services/privacy.service'

// 后台管理员手动删除客户数据
async function manualDataDeletion(appointmentId: number, adminId: number) {
  return await executeDataDeletion(appointmentId, adminId)
}
```

---

## 8. 邮件模板自定义

邮件模板位置：`src/server/services/email.service.ts`

支持自定义的部分：
- HTML 内容结构
- 颜色与样式
- 多语言文本
- 超链接与按钮

示例：修改邮件语言或添加公司信息

```typescript
// 在模板中使用动态变量
const htmlContent = `
  <p>亲爱的 ${appointment.customerName},</p>
  <p>感谢您的预约！</p>
  <a href="${rescheduleUrl}">改约</a>
  <a href="${cancelUrl}">取消</a>
`
```

---

## 9. 常见问题

### Q: Token 过期时间可以修改吗？

**A**: 可以。修改 `appointment-reschedule.service.ts` 中的常量：

```typescript
export const APPOINTMENT_LINK_CONFIG = {
  TOKEN_EXPIRY_HOURS: 168, // 改为其他值，如 72（3天）
}
```

### Q: 数据保留期如何调整？

**A**: 修改 `privacy.service.ts` 中的配置：

```typescript
export const PRIVACY_CONFIG = {
  BOOKING_RETENTION_DAYS: 180, // 改为其他值，如 90
  DATA_DELETION_GRACE_PERIOD_DAYS: 30, // GDPR 要求，不建议改
}
```

### Q: 如果邮件发送失败怎么办？

**A**: 邮件失败会自动记录到 EmailLog 表，可在后台查看。建议：
1. 检查 SMTP 配置是否正确
2. 查看错误日志 (logs/email.log)
3. 考虑实现邮件重试机制

### Q: 如何禁用某项功能？

**A**: 可以通过条件判断禁用：

```typescript
// 禁用邮件发送
if (!process.env.SMTP_HOST) {
  console.log('邮件服务未配置，跳过发送')
  return
}

// 禁用改约/取消
if (!process.env.ENABLE_CUSTOMER_RESCHEDULE) {
  throw new Error('此功能暂不可用')
}
```

---

## 10. 测试清单

- [ ] 邮件配置验证通过
- [ ] 新建预约后收到确认邮件
- [ ] 邮件中改约链接可点击且有效
- [ ] 邮件中取消链接可点击且有效
- [ ] 改约成功后收到通知邮件
- [ ] 取消成功后收到通知邮件
- [ ] 改约/取消页面显示正确的预约信息
- [ ] 数据导出 API 返回完整的个人数据
- [ ] 数据删除请求成功记录
- [ ] 定期清理任务正常运行
- [ ] 审计日志正确记录所有操作

---

## 11. 部署检查清单

```bash
# 1. 迁移数据库
npx prisma migrate deploy

# 2. 验证 SMTP 配置
SMTP_HOST=... npm run dev

# 3. 测试邮件发送
curl -X POST http://localhost:3000/api/admin/system/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 4. 检查日志
tail -f logs/email.log

# 5. 验证定期任务
node -e "require('./src/server/services/privacy.service').runDataMaintenanceTask()"
```

---

## 下阶段计划

Phase 18 将推进：
- [ ] 前台改约/取消页面 UI
- [ ] 邮件发送监控与告警
- [ ] 定期任务与 cron 配置
- [ ] 隐私页面法律文本补全
