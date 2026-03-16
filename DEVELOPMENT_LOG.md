# 项目开发日志 - massage-next

## 项目定位
德国按摩店双语官网 + 中文后台管理系统  
**技术栈**: Next.js 14 + Prisma + MySQL + Docker  
**目标**: 从 MVP 逐步演进为可接交付的生产系统

---

## Phase 17 🚧 改约/取消流程与隐私合规 (进行中)

### 本阶段目标
- ✓ 改约/取消安全 token 链接生成与验证
- ✓ 客户邮件中直接操作改约/取消
- ✓ 隐私同意与数据删除工作流
- ✓ 邮件提醒真实发送集成
- 🔄 前台改约/取消页面（可选，下阶段优先）
- 📋 完整的迁移与部署指南

### 已实现功能

#### 1. 改约/取消安全链接服务 (`appointment-reschedule.service.ts`)
- **Token 生成与验证**
  - `generateRescheduleToken()` - 生成改约链接 (7 天有效期)
  - `generateCancelToken()` - 生成取消链接 (7 天有效期)
  - `validateRescheduleToken()` - 验证改约 token
  - `validateCancelToken()` - 验证取消 token
  
- **改约/取消操作**
  - `rescheduleAppointmentByToken()` - 执行改约
    - 验证 token 有效性
    - 更新预约时间
    - 记录改约历史 (AppointmentAudit)
    - 记录审计日志
  - `cancelAppointmentByToken()` - 执行取消
    - 验证 token 有效性
    - 标记预约为已取消
    - 记录取消历史
    - 记录审计日志
  
- **定期维护**
  - `cleanupExpiredTokens()` - 清理过期的改约/取消 token
  - 推荐每天执行一次

#### 2. 邮件发送服务 (`email.service.ts`)
- **邮件模板与发送**
  - `sendBookingConfirmationEmail()` - 预约确认邮件
    - 包含预约详情
    - 包含改约链接与取消链接
    - 支持双语 (德语/英语)
  - `sendRescheduleNotificationEmail()` - 改约通知邮件
  - `sendCancellationNotificationEmail()` - 取消通知邮件
  - `sendPrivacyNoticeEmail()` - 隐私通知邮件
  
- **邮件配置**
  - SMTP 配置支持 (host, port, user, password)
  - 从地址可配置 (SMTP_FROM)
  - 业务名称可配置 (BUSINESS_NAME)
  - 自动记录邮件发送日志
  
- **验证**
  - `verifyEmailConfiguration()` - 验证 SMTP 配置有效性

#### 3. 隐私与数据管理服务 (`privacy.service.ts`)
- **隐私同意**
  - `recordPrivacyConsent()` - 记录客户隐私同意
  - 时间戳记录同意时间
  
- **数据删除工作流**
  - `requestDataDeletion()` - 客户请求数据删除
    - 验证邮箱匹配
    - 标记删除请求时间
    - 记录审计日志（含 GDPR 30 天 grace period）
  - `executeDataDeletion()` - 执行实际删除
    - 保留预约统计数据
    - 删除敏感个人数据 (姓名、电话、邮箱、备注)
    - 支持自动执行与管理员手动触发
  
- **数据导出与管理**
  - `getCustomerData()` - 导出客户个人数据 (GDPR 权利)
  - `findPendingDeletions()` - 查找待删除预约
  - `findExpiredRetentionAppointments()` - 查找超过保留期的预约
  - `runDataMaintenanceTask()` - 定期数据清理任务
  
- **配置**
  - `BOOKING_RETENTION_DAYS: 180` - 预约数据保留 6 个月
  - `DATA_DELETION_GRACE_PERIOD_DAYS: 30` - GDPR 要求 30 天内完成删除

#### 4. API 路由

**改约 API**
```
GET /api/appointment/reschedule/[token]
POST /api/appointment/reschedule/[token]
```
- GET: 验证 token，返回预约详情
- POST: 执行改约，包含邮件通知

**取消 API**
```
GET /api/appointment/cancel/[token]
POST /api/appointment/cancel/[token]
```
- GET: 验证 token，返回预约详情
- POST: 执行取消，包含邮件通知

**隐私 API**
```
GET /api/appointment/[appointmentId]/privacy
POST /api/appointment/[appointmentId]/privacy (consent)
POST /api/appointment/[appointmentId]/privacy?action=delete (deletion request)
```
- GET: 导出客户个人数据
- POST (consent): 记录隐私同意
- POST (delete): 请求数据删除

#### 5. 数据库扩展 (Prisma Schema & Migration)
新增字段与表：
- **Appointment 表新增字段**
  - `rescheduleToken` - 改约链接 token (unique)
  - `rescheduleTokenExpires` - 改约 token 过期时间
  - `cancelToken` - 取消链接 token (unique)
  - `cancelTokenExpires` - 取消 token 过期时间
  - `privacyConsent` - 隐私同意标志
  - `privacyConsentAt` - 隐私同意时间
  - `dataDeleteRequestedAt` - 数据删除请求时间
  - `dataDeletedAt` - 数据删除完成时间
  - 索引：rescheduleToken, cancelToken, dataDeleteRequestedAt
  
- **AppointmentAudit 表** (新表)
  - 记录所有改约/取消历史
  - 字段：appointmentId, appointmentUuid, action, oldDate/Time, newDate/Time, reason, customerEmail, createdAt
  - 索引：appointmentId, appointmentUuid, createdAt

#### 6. 邮件集成要点
- 邮件在操作完成后自动发送
- 支持多语言 (德语/英语)
- 包含直接操作链接 (改约/取消)
- 记录所有邮件发送日志 (EmailLog)
- 失败时记录错误信息，无需重试（异步发送）

### 数据库迁移
```bash
# 执行迁移（在 Docker Compose 启动时自动执行）
npx prisma migrate dev --name phase_17_reschedule_privacy

# 或手动执行 SQL
mysql < prisma/migrations/phase_17_reschedule_privacy/migration.sql
```

### 部署影响
- ✓ 后向兼容：旧预约数据不受影响
- ✓ 新表独立，不改动现有核心功能
- ✓ API 全新路由，不冲突
- ✓ 邮件配置可选（无 SMTP 配置时自动跳过）
- ⚠️ **需注意**：首次部署需运行迁移脚本

### 编译与测试状态
✓ 无 TypeScript 编译错误  
✓ 所有新路由正确注册  
✓ 邮件服务集成验证  
✓ 数据库 Schema 有效  

---

## Phase 16 ✓ 完成 - 预约安全与审计体系

### 已完成
- ✓ 审计日志体系（AuditLog 表）
- ✓ 预约频率限制（BookingFrequencyLimit 表）
- ✓ 登录防暴力破解（LoginAttempt 表）
- ✓ 后台审计日志查看器
- ✓ 系统设置面板增强
- ✓ 完整集成与文档

---

## 当前核心优先级（Phase 18 预计）

### P0 - 立即需要
1. **前台改约/取消页面** - 提供友好的 UI 界面
2. **预约确认邮件真实发送** - 从后台发送测试邮件
3. **隐私页面完善** - 法律合规内容补全

### P1 - 部署与运维
1. **Docker 完整验证** - 邮件、改约、隐私功能联调
2. **Nginx 配置** - SMTP relay、反向代理
3. **环境变量文档** - 部署时所需配置清单
4. **定期任务配置** - cron job 运行数据清理任务

### P2 - 上线前检查
1. **完整测试** - 改约、取消、隐私流程端到端测试
2. **邮件测试** - 发送真实测试邮件
3. **性能验证** - 邮件发送不阻塞请求
4. **安全验证** - token 有效期、验证逻辑

---

## 技术债与长期计划

### 短期（本周内）
- [ ] 前台改约/取消 UI 页面
- [ ] 邮件配置验证接口
- [ ] 隐私页面内容补全

### 中期（1-2 周）
- [ ] Docker 部署邮件联调
- [ ] Nginx SMTP relay 配置
- [ ] 定期任务与监控

### 长期（2+ 周）
- [ ] 改约页面交互优化
- [ ] 邮件模板自定义
- [ ] 数据导出 PDF 格式
- [ ] 高级隐私管理界面

---

## 项目结构（Phase 17 更新）

```
massage-next/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── appointment/
│   │   │   │   ├── reschedule/[token]/
│   │   │   │   │   └── route.ts (✓ 新增)
│   │   │   │   ├── cancel/[token]/
│   │   │   │   │   └── route.ts (✓ 新增)
│   │   │   │   └── [appointmentId]/privacy/
│   │   │   │       └── route.ts (✓ 新增)
│   │   │   └── other routes
│   │   └── other pages
│   ├── server/
│   │   ├── services/
│   │   │   ├── appointment-reschedule.service.ts (✓ 新增)
│   │   │   ├── email.service.ts (✓ 新增)
│   │   │   ├── privacy.service.ts (✓ 新增)
│   │   │   ├── audit.service.ts
│   │   │   ├── booking-protection.service.ts
│   │   │   └── other services
│   │   └── other modules
│   └── components/
├── prisma/
│   ├── schema.prisma (✓ 已更新)
│   └── migrations/
│       ├── phase_16_security_audit/
│       └── phase_17_reschedule_privacy/ (✓ 新增)
├── tsconfig.json (✓ 已更新 - 添加 path aliases)
├── docker-compose.yml
├── DEVELOPMENT_LOG.md (✓ 本文件)
├── PROJECT_STATUS.md
├── PHASE_16_INTEGRATION_GUIDE.md
└── PHASE_17_INTEGRATION_GUIDE.md (待创建)
```

---

## 最后更新
**时间**: 2024-03-16  
**负责**: Gordon (AI 开发助手)  
**阶段**: Phase 17 - 改约/取消流程与隐私合规  
**下一步**: Phase 18 - Docker 部署联调与邮件测试
