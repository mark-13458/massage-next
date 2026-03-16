# HANDOFF.md — AI 接手指南

> 本文件是给下一个 AI（或开发者）的快速接手文档。
> 最后更新：2026-03-16

---

## 一、项目是什么

`massage-next` 是一个面向**德国本地单店按摩店**的全栈系统：

- 双语官网（德语 / 英语）
- 中文后台管理系统
- 技术栈：Next.js 14 App Router + Prisma + MySQL + Nodemailer + Nginx + Docker

**不是** SaaS 平台，不是多门店系统，不是复杂 ERP。
目标是：**轻量、可部署、可运营、可持续维护**。

---

## 二、接手前必读文件（按顺序）

1. `HANDOFF.md`（本文件）— 快速定位当前状态
2. `DEVELOPMENT_LOG.md` — 每个阶段做了什么，当前遗留什么
3. `AI_CONTEXT.md` — 开发规范与基线，**每次开发前必须遵守**
4. `ARCHITECTURE.md` — 系统架构与技术决策
5. `ADMIN_ARCHITECTURE.md` — 后台六大模块边界
6. `SEO_SECURITY_MVP_PLAN.md` — SEO 与安全设计基线

其他文件按需查阅：
- `DEPLOYMENT_CHECKLIST.md` — 部署联调清单
- `DEPLOYMENT_GUIDE.md` — 运维操作参考
- `ROADMAP.md` — 功能路线图

---

## 三、当前真实状态（截至 2026-03-16）

### 已完成

**前台**
- 双语官网核心页面：首页 / 服务列表 / 服务详情 / 预约 / 关于 / 联系 / 图库
- 客户侧 token 管理页：改约 / 取消 / 预约管理（`/[locale]/booking/manage/[token]`）
- 合规页面：Impressum + Datenschutzerklärung（双语）
- SEO：metadata / canonical / hreflang / OG / LocalBusiness schema / sitemap / robots

**后台**
- 中文后台六大模块：Dashboard / Bookings / Services / Content / Media / Settings
- 三层架构：repository → service → view model
- 登录保护：页面层 + 接口层双重鉴权，防暴力（5次/5分钟）
- 审计日志：关键事件全覆盖，后台可查看（`/admin/settings/audit-logs`）
- 系统设置：语言 / 货币 / 站点名 / 预约说明 / 功能开关 / Turnstile

**预约链路**
- 预约创建 → 商家邮件通知 → 后台确认 → 客户确认邮件 → 客户取消邮件
- 改约 / 取消 token 链（7天有效期）
- 预约频率限制（手机号 / 邮箱维度，数据库持久化）
- GDPR 数据删除（请求 → 30天 grace period → 执行）

**部署**
- Docker + Nginx 联调通过
- 上传目录持久化已配置
- `npm run build` 通过

### 未完成（优先级排序）

| 优先级 | 项目 | 说明 |
|--------|------|------|
| P0 | 图片压缩 | 上传时用 sharp 压缩并转 WebP |
| P1 | 会话超时 | 当前 maxAge 7天，无活跃检测 |
| P2 | SEO 设置后台化 | title template / meta description 可在后台编辑 |
| P3 | 生产 smoke test | 测试环境完整联调 |

---

## 四、关键路由速查

### 前台
- `/de` / `/en` — 首页
- `/[locale]/services` — 服务列表
- `/[locale]/services/[slug]` — 服务详情
- `/[locale]/booking` — 预约
- `/[locale]/booking/manage/[token]` — 客户预约管理
- `/appointment/reschedule/[token]` — 改约
- `/appointment/cancel/[token]` — 取消
- `/[locale]/impressum` — Impressum
- `/[locale]/privacy` — 隐私政策

### 后台
- `/admin/login` — 登录
- `/admin` — Dashboard
- `/admin/appointments` — 预约管理
- `/admin/services` — 服务管理
- `/admin/content` — 内容管理
- `/admin/gallery` — 图库管理
- `/admin/settings` — 系统设置
- `/admin/settings/audit-logs` — 审计日志

### API（关键）
- `POST /api/booking` — 前台提交预约
- `GET/PATCH /api/booking/manage/[token]` — 客户预约管理
- `PATCH /api/admin/appointments/[id]` — 后台更新预约状态
- `POST /api/admin/upload` — 图片上传
- `GET/PATCH /api/admin/settings` — 系统设置
- `GET /api/healthz` — 健康检查

---

## 五、本地开发快速启动

```bash
npm install
npx prisma generate
npm run dev
```

数据库初始化：
```bash
npm run db:seed
```

Docker 启动：
```bash
cp .env.example .env
docker compose up -d --build
```

---

## 六、必需环境变量

```env
APP_URL=http://localhost:3000
DATABASE_URL=mysql://user:password@localhost:3307/massage_app
SESSION_SECRET=至少32位随机字符串
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=强密码
BUSINESS_NAME=China TCM Massage
ADMIN_NOTIFY_EMAIL=notify@example.com

# SMTP（可选，不配置则跳过邮件发送）
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
```

完整变量见 `.env.example`。

---

## 七、数据库模型速查

核心表：`User` / `Service` / `Appointment` / `File` / `GalleryImage` / `SiteSetting`

安全表：`AuditLog` / `BookingFrequencyLimit` / `LoginAttempt` / `AppointmentAudit`

内容表：`BusinessHour` / `FaqItem` / `Testimonial` / `EmailLog`

---

## 八、注意事项

- `HANDOFF.md` 里之前有一版声称"100% 完成可上线"的假状态，已被本文件替换
- `PHASE_16/17/18/19_CHECKLIST.md` 等历史阶段文件已删除，内容已归入 `DEVELOPMENT_LOG.md`
- 测试临时文件（`login.json`、`hero1.json` 等）见 `TEST_ARTIFACTS.md` 说明
- 每次开发完成后必须：更新 `DEVELOPMENT_LOG.md` → `npm run build` → commit → push
