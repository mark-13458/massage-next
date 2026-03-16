# DEVELOPMENT_LOG.md

> 按阶段记录关键改动、验证结果、遗留问题。每次推进后更新本文件。
> 最后更新：2026-03-16

---

## Phase 1 — 架构落地与基础骨架
- 明确项目方向：Next.js 14 单体，前台双语（de/en），后台中文
- 新增 `ARCHITECTURE.md` / `ROADMAP.md` 作为架构基线
- 重构目录，补齐 `src/lib`、`src/server/services` 等基础层
- 建立国际化消息文件：`src/messages/de.json`、`src/messages/en.json`

---

## Phase 2 — 数据模型升级
- Prisma schema 扩展：`Service`、`Appointment`、`File`、`SiteSetting`、`BusinessHour`、`FaqItem`、`Testimonial`、`GalleryImage`、`EmailLog`
- 新增枚举：`UserRole`、`AppointmentStatus`、`AppointmentSource`、`FileKind`
- 新增 `prisma/seed.js`，可初始化管理员、服务、FAQ、Hero、营业时间、联系方式

---

## Phase 3 — 前台核心页面
- 落地：`/[locale]`、`/services`、`/booking`、`/about`、`/contact`、`/gallery`
- 补基础 SEO 文件：`robots.ts`、`sitemap.ts`（从 `APP_URL` 动态生成）

---

## Phase 4 — 预约 API 闭环
- 落地 `POST /api/booking`，完成预约入库链路
- 前台预约入口与后端流程衔接

---

## Phase 5 — 后台登录保护
- 落地 `/admin/login`，接入登录/退出 API
- 使用签名 cookie session（HMAC-SHA256），middleware 保护后台路由

---

## Phase 6 — 后台预约管理
- 预约列表、状态筛选、状态修改、内部备注、详情页、快捷操作（确认/完成/取消/爽约）
- 状态流转时同步写入 `confirmedById`、`confirmedAt`、`completedAt`、`cancelledAt`

---

## Phase 7 — 服务管理
- 服务列表、新建/编辑/删除、上下架/精选/排序
- 有关联预约的服务删除保护

---

## Phase 8 — 网站内容管理
- contact、hours、FAQ、Hero、gallery 条目管理
- FAQ / BusinessHour 更新改为 upsert，修复空 payload 干扰问题

---

## Phase 9 — 图库上传 MVP
- Gallery 图片上传到 `public/uploads`，自动创建 `File + GalleryImage`

---

## Phase 10 — 仓库整理
- 连接远端 GitHub，补全 `.gitignore`，更新 README_CN

---

## Phase 11 — 预约详情工作台增强
- 详情页可直接执行：确认、完成、取消、爽约

---

## Phase 12~14 — 上传链增强
- 上传 API 支持 `usage=gallery` / `usage=hero`
- Hero 支持直接上传，上传后自动更新 `hero.imageUrl`
- 删除 Gallery 条目时同步清理本地文件；Hero 替换时清理旧文件
- 上传接口补 MIME 白名单（jpg/png/webp/gif）
- 服务端读取图片宽高，写入 `File.width` / `File.height`
- Hero 最低尺寸：1200×600；Gallery 最低尺寸：600×400
- Gallery 封面唯一性约束（设新封面时自动取消旧封面）
- 前端上传前校验：类型 + 10MB 大小限制
- 后台保存/上传反馈增强（处理中/成功/失败三态）

---

## Phase 15 — 部署基线收口 + 交接文档体系
- `UPLOAD_DIR` 默认值统一为 `/app/public/uploads`
- `docker-compose.yml` 改为从 `.env` 读取变量，补 `web` healthcheck
- `.dockerignore` 优化，build context 从 ~500MB 降至 ~5KB
- `Dockerfile` 改为 `node:20-bullseye-slim` + standalone 启动，修复 Prisma libssl 兼容问题
- `nginx.conf` 改为 Docker DNS resolver + 变量式 upstream，修复 502 问题
- `nginx` 补 `/uploads/` 静态文件服务
- Docker smoke test 通过：mysql healthy / web healthy / nginx running
- 后台所有页面补 `getCurrentAdmin()` 服务端鉴权 + `force-dynamic` + `revalidate=0`
- `POST /api/admin/upload`、`PATCH /api/admin/content` 接入服务端鉴权
- 上传文件落盘改为按 MIME 类型映射扩展名，新增 `uploadedById` 审计字段
- 前台所有页面补齐 metadata（title/description/canonical/hreflang/OG/Twitter card）
- 首页 / contact 页补 `LocalBusiness` / `HealthAndBeautyBusiness` 结构化数据
- 新增 `HANDOFF.md`、`PROJECT_STATUS.md`、`TEST_ARTIFACTS.md`

---

## Phase 16 — 后台模板化 + 双语 + 系统设置
- `AdminShell` 升级为侧边栏 + 顶部工作区头部
- 新增 `src/lib/admin-i18n.ts`，语言偏好通过 cookie 持久化
- 新增 `/admin/settings` 页面与 `GET/PATCH /api/admin/settings`
- 支持保存：站点名称、通知邮箱、默认前台语言、后台默认语言、时区、货币、预约说明（de/en）
- 新增管理员修改密码：`AdminPasswordForm` + `POST /api/admin/password`
- 根路由 `/` 根据 `defaultFrontendLocale` 自动跳转 `/de` 或 `/en`
- `SiteHeader` / `SiteFooter` 读取 `siteName`；`BookingForm` 读取 contact/BusinessHour/currency
- 退出登录后跳转前台首页
- Turnstile 防刷：后台可配置开关，`src/lib/turnstile.ts` 服务端校验，前台 widget 接入

---

## Phase 17 — 后台收口式完善
- 新增 `src/lib/admin-status.ts`，预约状态枚举收口为可读文案（中/英）
- 系统设置页拆分为三区块 + 右侧配置快照面板
- `POST/PATCH/DELETE /api/admin/services/[id]`、`PATCH /api/admin/appointments/[id]` 接入鉴权
- 新增 `/admin/gallery` 独立图库管理页：总览、统计、筛选
- 新增 `PATCH /api/admin/gallery/[id]`：快速启用/停用/设封面
- 新增 `GalleryQuickActions` 组件

---

## Phase 18 — 后台架构分层
- 新增 `ADMIN_ARCHITECTURE.md`，明确六大模块边界
- Repository 层：`src/server/repositories/admin/`（dashboard/booking/service/content/media/settings）
- Service 层：`src/server/services/admin-*`（六个模块）
- View Model 层：`src/server/view-models/admin/`（settings/booking/service/media + shared/formatters）
- 所有后台主线页面切换到 service 层，页面层 Prisma 直查已清除

---

## Phase 19 — 安全体系 + 邮件通知 + 合规页面
- **登录防暴力**：`admin/login/route.ts` 内存计数，5 次失败封锁 5 分钟（IP + 邮箱双维度）
- **预约频率限制**：`booking-protection.service.ts`，手机号/邮箱维度，60 分钟窗口最多 3 次，写入 `BookingFrequencyLimit` 表
- **审计日志**：`audit.service.ts` + `AuditLog` 模型，覆盖预约创建/状态变更/数据删除等关键事件
- **操作日志后台页面**：`/admin/settings/audit-logs`，支持按操作类型筛选
- **邮件通知**：`mail.service.ts`，商家收到新预约通知 + 客户收到预约请求确认 + 客户预约确认/取消通知
- **邮件配置测试**：`EmailConfigTest` 组件 + `/api/admin/system/email-config` 接口
- **改约/取消 token 链**：`appointment-reschedule.service.ts`，token 有效期 7 天，含 `AppointmentAudit` 历史记录
- **客户侧改约/取消前台页面**：`/appointment/reschedule/[token]`、`/appointment/cancel/[token]`
- **客户侧预约管理页**：`/[locale]/booking/manage/[token]`，通过 `confirmationToken` 访问
- **GDPR 数据删除**：`privacy.service.ts`，支持请求删除、30 天 grace period、自动清理任务
- **合规页面**：`/[locale]/impressum`（Impressum）、`/[locale]/privacy`（Datenschutzerklärung）双语
- **系统清理 API**：`/api/admin/system/cleanup`，按保留天数清理过期预约数据
- **Prisma schema 扩展**：新增 `AuditLog`、`BookingFrequencyLimit`、`LoginAttempt`、`AppointmentAudit` 模型；`Appointment` 新增 rescheduleToken/cancelToken/privacyConsent/dataDelete 等字段

---

## Phase 20 — Bug 修复（2026-03-16）
- 修复 `env.ts`：`SMTP_USERNAME` → `SMTP_USER`（与 `.env.example` 保持一致）
- 修复 `env.ts`：新增 `siteName`（读 `BUSINESS_NAME`）和 `adminEmail`（读 `ADMIN_NOTIFY_EMAIL`），修复 `mail.service.ts` 引用缺失字段导致的运行时错误
- 修复 `system/cleanup/route.ts`：`getSession()` 未定义，改为 `getCurrentAdmin()`
- 新增 `GET/PATCH /api/booking/manage/[token]`：修复客户侧预约管理页调用不存在 API 的问题
- 修复 `/de/datenschutz`：原页面为占位内容，改为重定向到 `/de/privacy`
- `npm run build` 验证通过 ✅

---

## Phase 24 — SEO 收口 + 前台文案清理（2026-03-16）
- sitemap 补充服务详情页（动态读取 slug）+ impressum/privacy 静态页，服务页优先级提升至 0.85
- robots.ts 补充 `disallow: ['/admin', '/api/']`，屏蔽后台和接口路由被索引
- 修复 contact 页面"Besuchshinweise"区块：移除开发阶段说明，替换为真实访客提示（准时到达/着装/停车）
- 删除 `src/app/admin/README.md`（放错位置，内容已在 `ADMIN_ARCHITECTURE.md`）
- 确认 P2 SEO 设置后台化已完整实现（`AdminSettingsForm` + API + view model 全链路已就绪）
- `npm run build` 验证通过 ✅

---

## Phase 23 — 图片压缩（sharp）+ 会话超时（2026-03-16）
- 上传路由接入 sharp：所有非 GIF 图片上传时自动转 WebP（quality=85），删除手写的 dimension 解析代码
- `File` 记录写入压缩后的真实 `fileSize` / `mimeType` / `width` / `height`
- GIF 保持原格式不转换
- 会话超时：`setAdminSession` maxAge 改为 8 小时；middleware 每次后台请求刷新 cookie（滑动窗口）
- `npm run build` 验证通过 ✅

---

## Phase 22 — 文档整合与规范化（2026-03-16）
- 删除过时文件：`PHASE_16/17/18/19_CHECKLIST.md`、`PHASE_16/17_INTEGRATION_GUIDE.md`、`PROJECT_STATUS.md`（共 7 个文件）
- 重写 `HANDOFF.md`：替换伪造的"100% 完成"版本，改为真实状态的 AI 接手指南
- 重写 `AI_CONTEXT.md`：精简为开发规范与基线，包含工作流、代码规范、Git 规范、文档规范
- 更新 `README.md`：精简为快速启动 + 正确的文档阅读顺序
- 更新 `README_CN.md`：修正接手顺序，去掉已删除文件引用
- 文档体系收口为：`HANDOFF.md`（状态）→ `DEVELOPMENT_LOG.md`（历史）→ `AI_CONTEXT.md`（规范）→ 架构文档

---

## Phase 21 — 服务详情页 + Bug 修复（2026-03-16）
- 修复 `mail.service.ts`：商家通知邮件引用了不存在的 `service.nameZh`，改为 `service.nameDe`
- 新建 `/[locale]/services/[slug]/page.tsx`：服务详情页，含服务名、摘要、描述、时长、价格、预约 CTA
- 补 `generateStaticParams`（带 try/catch 容错）+ `dynamicParams = true` + 独立 SEO metadata
- 更新 `ServiceCard` 组件：新增 `slug` prop，有 slug 时整卡片包裹 `<Link>` 跳转详情页
- 修复服务列表页描述文案：移除开发阶段说明，改为正式文案
- `npm run build` 验证通过 ✅

---

## Phase 25 — 后台全链路审查 + Bug 修复（2026-03-16）

审查范围：登录 → Dashboard → 预约 → 服务 → 内容 → 图库 → 退出

**修复 1：`logout/route.ts` import 路径错误**
- 原路径 `../../../../../src/lib/...` 多了一层 `src/`，导致退出登录接口 500
- 修正为 `../../../../lib/...`

**修复 2：取消预约时未发送客户取消邮件**
- `appointments/[id]/route.ts` 状态变为 `CANCELLED` 时未调用 `sendCustomerCancelledEmail`
- 合并 CONFIRMED / CANCELLED 两个分支，统一在状态变更后按 feature flag 发送对应邮件

**审查结论（无问题）**：
- `utils.ts`：`getIpAddress` 存在且逻辑正确
- `booking/route.ts`：商家通知 + 客户收到邮件均在创建时触发，逻辑正确
- `services/[id]/route.ts`：PATCH + DELETE 完整，有关联预约保护
- `gallery/[id]/route.ts`：封面唯一性约束正确
- `content/route.ts`：contact/hero/hours/faq/gallery 全链路 upsert 逻辑正确
- 所有后台页面均有 `getCurrentAdmin()` 鉴权 + `force-dynamic`

---

## Phase 26 — 前台完善（2026-03-16）
- 首页 ServiceCard 补传 `slug`，服务卡片现在可点击跳转详情页
- `about/page.tsx` 移除开发内部说明文案，替换为真实品牌文案
- `SiteFooter` 重构：4 列布局，补导航链接栏，底部补 Impressum / Datenschutz 合规链接 + 版权年份
- `SiteHeader` 新增移动端汉堡菜单（`MobileMenu` client 组件），手机上导航可用
- `npm run build` 验证通过 ✅

---

## Phase 27 — 前台细节完善（2026-03-16）
- `HeroSection` 品牌名改为读 `siteName`，不再硬编码
- 联系页电话/邮箱改为可点击 `tel:` / `mailto:` 链接
- 联系页底部加 Google Maps 嵌入
- 服务详情页预约 CTA 带上 `?service=slug`，跳转预约页自动预选对应服务
- `BookingForm` 接入 `useSearchParams`，读取 `?service=slug` 预选服务下拉
- `BookingManagePanel` 状态显示从英文枚举改为双语可读文案

---

## Phase 28 — 合规页面 + 后台文案清理（2026-03-16）
- `impressum/page.tsx` / `privacy/page.tsx`：删除无用 `getTranslations` import，联系信息（电话/邮箱/地址）改为读 DB（`getContactSettings`），fallback 保留默认值
- `admin/page.tsx`：清理 subtitle 开发阶段说明文案，替换为正式文案
- `npm run build` 验证通过 ✅

---

## Phase 29 — 后台审查修复 + 预约分页与日期筛选（2026-03-16）

**Bug 修复**
- `AdminShell` 导航 `key={item.label}` → `key={item.href}`（label 字段不存在）
- `appointments/[id]/page.tsx` params 类型改为 `Promise<{ id: string }>`（Next.js 14 规范）
- `GET /api/admin/appointments/route.ts` 直接写 Prisma 查询违反架构规范，改为调用 `getAdminAppointments` service
- `appointments/page.tsx` / `content/page.tsx` subtitle 清理开发阶段文案
- `settings/page.tsx` 安全执行清单已实现项 `⧮` 改为 `✓`

**新功能**
- 预约列表支持日期范围筛选（dateFrom / dateTo），URL 参数驱动，原生 form 提交
- 预约列表支持分页（每页 20 条），URL 参数驱动，保留状态 + 日期筛选上下文
- `booking.repository.ts` 升级：支持 status / dateFrom / dateTo / page / pageSize，同时返回 total
- `admin-booking.service.ts` 升级：兼容旧调用方式，新增 options 对象入参
- `AdminShell` 新增 `pendingCount` prop，侧边栏预约导航项显示待处理数量角标
- Dashboard 传入 `pendingCount={stats.pendingAppointments}`
- `npm run build` 验证通过 ✅

---

## Phase 30 — 服务页文案清理 + Testimonial 管理模块（2026-03-16）

**Bug 修复**
- `services/[id]/page.tsx` params 类型改为 `Promise<{ id: string }>`
- `services/[id]/page.tsx` / `services/new/page.tsx` subtitle 清理开发阶段文案

**新功能：Testimonial 管理**
- 新增 `testimonial.repository.ts`：CRUD 完整封装
- 新增 `admin-testimonial.service.ts`：service 层
- 新增 `GET/POST /api/admin/testimonials`、`PATCH/DELETE /api/admin/testimonials/[id]`：完整 API，鉴权一致
- 新增 `TestimonialControls.tsx`：行内编辑、一键发布/取消发布、删除（client 组件）
- 新增 `TestimonialList.tsx`：client wrapper，管理列表状态（新增/删除实时更新）
- 新增 `/admin/testimonials` 页面：完整管理工作台
- `AdminShell` 侧边栏新增"客户评价"导航项
- Dashboard 快速入口新增评价模块入口
- `npm run build` 验证通过 ✅

---

## Phase 31 — 后台体验优化（2026-03-16）

- `NoticePill`：成功消息 3 秒后自动消失，错误消息保持显示
- `AdminShell` 侧边栏导航拆出 `AdminNav` client 组件，当前页高亮（active 状态 amber 色）
- `AppointmentQuickActions`：加 `currentStatus` prop，当前状态按钮显示 ✓ 并禁用，其余按钮按状态着色（sky/emerald/rose/stone）
- `AppointmentStatusControls`：保存按钮保存后显示 ✓ 已保存状态
- `TestimonialControls`：修复 `adminRequest` 返回值处理错误（`res.json()` → 直接用返回值）
- `AdminShell` 侧边栏文案精简，移除"当前重点"区块，改为会话信息
- `npm run build` 验证通过 ✅

---

## 当前状态（截至 2026-03-16）

### 已具备
- 双语官网核心页面（首页/服务/服务详情/预约/关于/联系/图库）
- 服务详情页：`/[locale]/services/[slug]`，含独立 SEO metadata + 预约 CTA
- 前台 SEO：metadata / canonical / hreflang / OG / LocalBusiness schema
- 预约 API + 后台处理链（状态流转/备注/快捷操作）
- 客户侧 token 管理页（改约/取消，通过 confirmationToken）
- 邮件通知：商家通知 + 客户确认/取消邮件（SMTP 可选）
- 中文后台登录保护（页面层 + 接口层双重鉴权）
- 后台六大模块：Dashboard / Bookings / Services / Content / Media / Settings
- 后台三层架构：repository → service → view model
- 图片上传链：Gallery + Hero，含尺寸校验、MIME 白名单、文件清理、封面唯一性
- 系统设置驱动前台行为（语言/货币/站点名/预约说明/功能开关）
- Turnstile 防刷（后台可配置开关）
- 登录防暴力（内存计数，5 次封锁 5 分钟）
- 预约频率限制（手机号/邮箱维度，数据库持久化）
- 审计日志（关键事件全覆盖，后台可查看）
- GDPR 数据删除流程（请求 → grace period → 执行）
- 合规页面：Impressum + Datenschutzerklärung（双语）
- Docker + Nginx 联调通过，上传目录持久化已配置

---

## Phase 32 — Dashboard 优化 + 前台评价星级（2026-03-16）

- Dashboard 统计新增"今日新增"和"本周新增"预约数（repository + service + 页面全链路）
- Dashboard 运营流程区块新增第 5 步"管理客户评价"，补全评价管理入口
- 修复 Dashboard 右侧快速入口重复的两个 `/admin/settings` 链接，第二个改为 `/admin/testimonials`
- 前台 about 页评价卡片新增星级显示（amber 色实心星，灰色空心星），`rating` 为 null 或 0 时不显示
- `npm run build` 验证通过 ✅

---

## 当前状态（截至 2026-03-16）

### 已具备
- 双语官网核心页面（首页/服务/服务详情/预约/关于/联系/图库）
- 服务详情页：`/[locale]/services/[slug]`，含独立 SEO metadata + 预约 CTA
- 前台 SEO：metadata / canonical / hreflang / OG / LocalBusiness schema
- 预约 API + 后台处理链（状态流转/备注/快捷操作）
- 客户侧 token 管理页（改约/取消，通过 confirmationToken）
- 邮件通知：商家通知 + 客户确认/取消邮件（SMTP 可选）
- 中文后台登录保护（页面层 + 接口层双重鉴权）
- 后台六大模块：Dashboard / Bookings / Services / Content / Media / Settings
- 后台三层架构：repository → service → view model
- 图片上传链：Gallery + Hero，含尺寸校验、MIME 白名单、文件清理、封面唯一性
- 系统设置驱动前台行为（语言/货币/站点名/预约说明/功能开关）
- Turnstile 防刷（后台可配置开关）
- 登录防暴力（内存计数，5 次封锁 5 分钟）
- 预约频率限制（手机号/邮箱维度，数据库持久化）
- 审计日志（关键事件全覆盖，后台可查看）
- GDPR 数据删除流程（请求 → grace period → 执行）
- 合规页面：Impressum + Datenschutzerklärung（双语）
- Docker + Nginx 联调通过，上传目录持久化已配置

### 未完成（优先级排序）
1. **P3** 测试环境 smoke test → 生产上线联调

## Phase 41 — 性能优化 + 移动端布局改善（2026-03-16）

**性能优化**
- `next.config.js`：开启 `images.formats: ['image/avif', 'image/webp']`，配置 `remotePatterns`（pexels.com），添加安全 headers（X-Content-Type-Options / X-Frame-Options / Referrer-Policy），`/uploads/` 静态资源加 `Cache-Control: immutable`
- `HeroSection`：`<img>` → `<Image>`，加 `priority`（LCP 优化），`sizes` 属性精确描述响应式尺寸
- `gallery/page.tsx`：`<img>` → `<Image>`，加 `loading="lazy"` + `sizes`
- `page.tsx`（首页）：图库预览区块 `<img>` → `<Image>`，加 `loading="lazy"` + `sizes`
- `SiteHeader`：logo `<img>` → `<Image>`，加 `priority`
- `layout.tsx`：新增 `viewport` export（`device-width / initialScale / themeColor`），符合 Next.js 14 规范
- `globals.css`：加 `scrollbar-gutter: stable`（防止滚动条出现导致 CLS），`-webkit-tap-highlight-color: transparent`，`touch-action: manipulation`，`text-rendering: optimizeLegibility`

**移动端布局改善**
- `HeroSection`：移动端图片 `aspect-[4/3]`（更适合手机屏），stats 卡片改为横向滚动（`overflow-x-auto`），CTA 按钮 padding 收紧
- `MobileMenu`：加半透明遮罩（`backdrop-blur-sm`），菜单开关动画（`translate-y + opacity transition`），body scroll lock，路由变化自动关闭，预约按钮加分隔线
- `SectionShell`：移动端 `py-12`（原 `py-16`），标题字号 `text-2xl` → `sm:text-3xl` → `lg:text-4xl` 响应式
- `ServiceCard`：`flex flex-col h-full`（等高卡片），移动端 padding 收紧 `p-5`，标题 `text-lg` → `sm:text-xl`
- `SiteFooter`：移动端 2 列布局（`grid-cols-2`），品牌列 `col-span-2`，营业时间 fallback 改为 `Mo–So`

- `npm run build` 验证通过 ✅

## Phase 40 — 前台页面完善 + UI 美化 + Fallback 内容（2026-03-16）

- `gallery/page.tsx`：补缺失的 `Link` import（修复潜在构建错误）
- `page.tsx`（首页）：联系区块移除"Währung"字段，改为"Sprachen"（语言支持），更有实用价值
- `page.tsx`（首页）：服务区块补 fallback（数据库空时显示提示 + 联系链接）；补"查看全部"按钮
- `page.tsx`（首页）：评价区块补 fallback（数据库空时显示占位星级 + 提示文案）
- `page.tsx`（首页）：FAQ 区块补 fallback（数据库空时显示默认 Q&A）
- `page.tsx`（首页）：营业时间区块补 fallback（数据库空时显示默认时间文案）
- `page.tsx`（首页）：图库区块 alt 文案改为双语语义化描述
- `contact/page.tsx`：补 `Link` import；地图区块后新增预约 CTA 区块（深色背景，与其他页面风格对齐）
- `services/[slug]/page.tsx`：新增 `getRelatedServices()` 函数；详情页底部新增"相关服务"推荐区块（最多 3 条，优先精选服务）；引入 `ServiceCard` 组件

- `npm run build` 验证通过 ✅

- `contact/page.tsx`：修正 Google Maps embed URL，使用正确的慕尼黑 Arnulfstraße 104 坐标参数
- `gallery/page.tsx`：图库页底部新增预约 CTA 区块（深色背景，与服务页风格对齐）
- `about/page.tsx`：评价区块底部新增预约 CTA 区块，补 `Link` import
- `services/[slug]/page.tsx`：补 BreadcrumbList JSON-LD 结构化数据（首页 → 服务列表 → 当前服务）
- `AdminInfoList.tsx`：扩展类型支持 `LinkValue[]` 数组，多个链接值可分行显示

- `npm run build` 验证通过 ✅

## Phase 34 — 后台页面优化（2026-03-16）

**预约列表**
- 消除双次全量查询：新增 `getAppointmentStatusCounts()` repository 方法 + service 暴露，统计卡片和角标直接用精确计数，不再拉全量列表
- 表格从 8 列精简为 6 列：合并"服务+时间"为一列，提交时间移入客户列副文本，移除独立"提交时间"列
- 客户备注改为单行截断 + `title` tooltip，减少行高

**评价页**
- 补 `AdminWorkspaceLayout` 双栏结构，与其他后台页面对齐
- 新增右侧 aside：评价统计看板（总数/已发布/未发布/平均评分）、语言分布（DE/EN）、运营建议
- 统计数据在服务端计算，无额外数据库查询

**图库页**
- 图片卡片裸 URL 改为只显示文件名（截断 + `title` 完整路径），减少视觉噪音

- `npm run build` 验证通过 ✅

## Phase 33 — 后台功能增强 + Bug 修复（2026-03-16）

**Bug 修复**
- 预约列表页 `getAdminAppointments('ALL')` 返回 `{ items, total, page, pageSize }` 对象，但页面代码仍在直接调用 `.filter()` / `.length`，导致 TS 类型错误。完整重写页面，正确解构 `result.items`。

**新功能**
- 预约列表加客户名/电话搜索框（URL 参数 `?q=`，与状态筛选联动，支持清除）
- 统计卡片改为可点击链接，直接跳转对应状态筛选
- 服务列表加名称/slug 搜索框（URL 参数 `?q=`，与状态筛选联动）
- 评价列表加语言筛选（全部/DE/EN）+ 发布状态筛选（全部/已发布/未发布），客户端实时过滤
- 预约详情页 aside 新增"关联服务"区块，含"编辑服务"和"全部预约"快捷链接
- `npm run build` 验证通过 ✅

## Phase 38 — 后台预约分页 + 可点击联系链接（2026-03-16）

- 预约列表：`pageSize` 从硬编码 100 改为每页 20 条，新增分页导航（上一页/页码/下一页），URL 参数 `?page=` 驱动，与状态/搜索/日期筛选联动
- 预约列表：联系方式列电话改为 `tel:` 可点击链接，邮箱改为 `mailto:` 可点击链接
- 预约详情：`AdminInfoList` 扩展支持 `{ href, text }` 类型 value，电话/邮箱改为可点击链接
- `BookingForm` aside 联系信息电话/邮箱改为可点击 `tel:` / `mailto:` 链接（深色背景版本）

- `npm run build` 验证通过 ✅



- `about/page.tsx`：修复所有德语文案缺失的 umlauts（`Atmosphäre`、`Gäste`、`Qualität`、`regelmäßige`、`häufige`、`Wünsche`、`Rückmeldungen` 等），metadata title 同步修正
- `SiteFooter`：联系信息电话/邮箱改为可点击 `tel:` / `mailto:` 链接，hover 变白色
- `SiteFooter`：营业时间移除 `slice(0, 4)`，改为显示全部
- `services/[slug]/page.tsx`：预约 CTA 按钮颜色从 `amber-500` 改为与全站一致的 `brown-900`

- `npm run build` 验证通过 ✅



- 首页评价区块补星级显示（amber 色实心星 / 灰色空心星），`rating` 为 null 或 0 时不显示，与 about 页对齐
- 首页联系区块电话/邮箱改为可点击 `tel:` / `mailto:` 链接，hover 变白色
- `BookingForm` aside 营业时间移除 `slice(0, 3)`，改为显示全部营业时间
- 服务列表页底部新增预约 CTA 区块（深色背景，含跳转预约页按钮）

- `npm run build` 验证通过 ✅



**预约管理**
- 搜索从客户端 filter 改为服务端查询：repository 新增 `search` 字段（Prisma `OR` 条件，匹配 customerName / customerPhone），service 层透传，页面层直接传 `search` 参数
- 预约列表新增日期范围筛选 UI（dateFrom / dateTo），与搜索框同一 form 提交，URL 参数驱动，与状态筛选联动
- 清除按钮扩展为同时清除搜索词和日期范围

**服务管理**
- 移除 `AdminSectionCard` 内嵌套的冗余 `AdminListFrame`，统计标签和表格直接在 card 内渲染
- 移除已无用的 `AdminListFrame` import

**系统设置**
- 修复"预约防护"卡片中"下一步：改约/取消 token 安全链接"为已完成状态（✓），该功能已在 Phase 19 实现

- `npm run build` 验证通过 ✅

## Phase 42 — 悬浮窗预约按钮 + WhatsApp 链接按钮（2026-03-16）
- 新建 `src/components/site/FloatingActions.tsx`：server component，读取 `getContactSettings()` 获取电话号码，自动转换 WhatsApp 格式（+49 前缀），包含 WhatsApp 绿色圆形按钮 + 预约 CTA 按钮，`fixed bottom-5 right-4 z-50`
- 所有前台页面插入 `<FloatingActions locale={typedLocale} />`：`page.tsx`（首页）、`about`、`booking`、`contact`、`gallery`、`services`、`services/[slug]`、`impressum`、`privacy`、`booking/manage/[token]`
- `npm run build` 验证通过 ✓

## Phase 44 — Bug 修复 + 安全优化（2026-03-16）

**Bug 修复**
- `api/booking/route.ts`：移除内存速率限制 Map（多实例/重启后失效），统一使用 `booking.service.ts` 中数据库持久化的频率限制；`createBooking` 调用补传 `context: { ipAddress }`，修复审计日志和频率限制 IP 字段为空的问题
- `api/admin/appointments/[id]/route.ts`：params 类型改为 `Promise<{ id: string }>` 并 `await params`，符合 Next.js 14 规范
- `LangSwitcher.tsx`：路径替换改用精确正则 `/^\/(de|en)(\/|$)/`，避免路径中含 `de`/`en` 片段（如服务 slug）时误替换

**优化**
- `BookingForm.tsx`：日期 input 加 `min={today}` 属性，防止用户选择过去日期提交预约
- `site.service.ts`：`getSystemSettings` 用 React `cache()` 包装，同一请求内多次调用自动去重，减少重复数据库查询
- `BookingManagePanel.tsx`：取消预约按钮加 `window.confirm` 二次确认，防止误操作

- `npm run build` 验证通过 ✅

## Phase 46 — unstable_cache 缓存优化 + revalidateTag（2026-03-16）

**缓存策略**：不引入 Redis（本地按摩店日访问量几十到几百次，无高并发场景，Redis 性价比极低）。改用 Next.js 内置 `unstable_cache`，零依赖，直接解决每次 SSR 打多个并行 DB 查询的问题。

**site.service.ts 重写**
- `getActiveServices`、`getPublishedTestimonials`、`getActiveFaqs`、`getBusinessHours`、`getContactSettings`、`getHeroSettings`、`getActiveGallery` 全部改为 `unstable_cache` 包装，TTL 5 分钟 + tag-based revalidation
- 新增 `CACHE_TAGS` 常量导出，供管理员写操作时 revalidate 使用
- `getSystemSettings` 保留 React `cache()`（同一请求内去重，不需要跨请求缓存）

**管理员写操作补 revalidateTag**
- `PATCH /api/admin/content` → revalidate contact / hero / hours / faqs / gallery（按实际 payload 选择性 revalidate）
- `PATCH /api/admin/settings` → revalidate settings
- `POST /api/admin/services` → revalidate services
- `PATCH/DELETE /api/admin/services/[id]` → revalidate services
- `POST /api/admin/testimonials` → revalidate testimonials
- `PATCH/DELETE /api/admin/testimonials/[id]` → revalidate testimonials
- `PATCH /api/admin/gallery/[id]` → revalidate gallery

- `npm run build` 验证通过 ✅



**审查范围**：预约管理 token 链路、改约/取消 API、邮件通知、客户侧页面、repository 层

**Bug 修复**
- `booking.repository.ts`：`findAppointmentByToken` 用 `findUnique({ where: { confirmationToken } })` 但 `confirmationToken` 非 `@unique` 字段，导致 Prisma 类型错误；改为 `findFirst`
- `booking/manage/[token]/page.tsx`：`serviceName` 硬编码 `nameDe`，英文用户看到德语服务名；改为按 `locale` 选择 `nameEn` / `nameDe`
- `api/appointment/reschedule/[token]/route.ts`：params 类型改为 `Promise<{ token: string }>`；发送改约邮件时 `oldDate` 传的是已更新后的新日期（逻辑错误），改为在执行改约前先读取旧日期/时间
- `api/appointment/cancel/[token]/route.ts`：params 类型改为 `Promise<{ token: string }>`
- `appointment/cancel/[token]/page.tsx`：textarea 和 radio 共用同一个 `reason` state，导致选了 radio 后 textarea 也显示 radio value；拆分为 `selectedReason` + `additionalNotes` 两个独立 state；移除无用的 `isGermanLang` 函数；提交前校验 radio 必选
- `api/booking/manage/[token]/route.ts`：取消和改约操作后缺少邮件通知；取消后异步发送 `sendCustomerCancelledEmail`，改约后异步通知商家 `sendMerchantBookingNotification`；`prisma.appointment.update` 补 `include: { service: true }` 以支持邮件模板

- `npm run build` 验证通过 ✅

- 新建 `LangSwitcher.tsx`（client 组件）：读取当前路径，将 `/de/` ↔ `/en/` 互换，桌面端显示在导航栏右侧
- `SiteHeader`：引入 `LangSwitcher`，插入在预约按钮左侧
- `MobileMenu`：底部新增语言切换链接（显示完整语言名 Deutsch / English）
- `about/page.tsx`：FAQ 区块补 fallback（数据库空时显示默认 Q&A）
- `contact/page.tsx`：营业时间区块补 fallback（数据库空时显示默认时间文案）
- `BookingForm`：成功提交后调用 `formRef.current?.reset()` 重置所有表单字段，同时重置 `privacyConsent` 状态
- `npm run build` 验证通过 ✅
