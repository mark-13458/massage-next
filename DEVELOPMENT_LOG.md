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

## Phase 57 — Docker 启动修复：数据库初始化链路（2026-03-17）

**根因**：standalone 模式下容器内无 `prisma` CLI，数据库表从未创建（`User` 表不存在），导致登录接口 500。

**修复**
- `Dockerfile`：新增 `prisma-cli` 构建阶段，单独安装 `prisma@5.9.1`，复制到 `run` 阶段；同时从 `deps` 阶段复制 `bcryptjs`（seed 依赖）
- 新增 `docker-entrypoint.sh`：容器启动时先执行 `prisma db push --skip-generate`（同步 schema），再检查 `User` 表是否为空，为空则运行 `seed.js`，最后启动 `node server.js`
- `prisma/migrations/phase_16_security_audit/migration.sql`：删除 PostgreSQL 专属的 `CREATE TYPE` 语句（MySQL 不支持），修复历史迁移文件语法错误

**验证**：`docker compose up -d` 后 `massage-web Healthy`，`POST /api/admin/login` 返回 200 ✅

---

## Phase 56 — 死代码清理 + 错误处理修复（2026-03-17）

**Bug 修复**
- `api/booking/route.ts`：频率限制错误现在正确返回 429（之前被 catch 块统一返回 500），前端可以正确显示限流提示；移除 validation 失败时的 `details` 字段（泄露内部 schema 结构）
- `server/services/booking.service.ts`：新增 `RateLimitError` 自定义错误类，让 route 层能区分频率限制错误和其他错误
- `api/appointment/cancel/[token]/route.ts`：邮件发送从 `email.service` 迁移到 `mail.service`（`sendCustomerCancelledEmail`），消除对死代码的依赖
- `api/appointment/reschedule/[token]/route.ts`：同上，迁移到 `mail.service`（新增 `sendCustomerRescheduledEmail`）

**死代码清理**
- 删除 `server/services/admin-auth.service.ts`：从未被调用，包含错误的 session 机制（`admin_session` cookie，无签名），与实际使用的 HMAC-SHA256 session 完全不同，存在安全隐患
- 删除 `server/services/email.service.ts`：从未被调用，实际邮件发送全部通过 `mail.service.ts` 完成；将其中 `sendCancellationNotificationEmail` / `sendRescheduleNotificationEmail` 的功能迁移到 `mail.service.ts`

**代码质量**
- `server/services/appointment-reschedule.service.ts`：`process.env.APP_URL` 改为 `env.appUrl`（统一使用 env 模块），移除未使用的 `logBookingAction` import
- `server/services/mail.service.ts`：新增 `sendCustomerRescheduledEmail`，统一改约邮件通知

- `npm run build` 验证通过 ✅

---

## Phase 55 — 安全修复 + 代码质量（2026-03-17）

**安全修复**
- `api/admin/system/cleanup/route.ts`：重写 — 修复 `settings` 可能为 null 的崩溃（`?? 180`），改为调用 `runDataMaintenanceTask()` 确保审计日志和 GDPR 合规，额外硬删除已匿名化且超过保留期的记录，catch 块统一返回 "Internal server error"
- `api/admin/system/email-config/route.ts`：POST catch 块改为统一返回 "Failed to send test email"，不透传内部错误
- `api/admin/settings/test-email/route.ts`：移除 `error: any` 类型断言，catch 块统一返回 "Failed to send test email"

**代码质量**
- `components/site/BookingForm.tsx`：隐私链接从硬编码 `/de/privacy` / `/en/privacy` 改为动态 `/${locale}/privacy`；`onSubmit` 错误处理改进，400/429 响应显示服务器返回的具体错误消息
- `server/services/booking-protection.service.ts`：移除 `(error as any)?.code` 类型断言，改为类型安全写法 `(error as { code?: string }).code`
- `server/services/audit.service.ts`：`AuditLogInput` 接口的 `any` 类型改为 `unknown`
- `next.config.js`：移除无效的顶层 `serverActions` 配置（消除 Next.js 15 build 警告）

- `npm run build` 验证通过 ✅

---

## Phase 54 — 代码质量优化（2026-03-17）

**Bug 修复**
- `appointment-reschedule.service.ts`：`generateRescheduleToken` / `generateCancelToken` 移除未使用的 `updated` 变量（TS 警告）
- `api/appointment/reschedule/[token]/route.ts`：修复双重 `validateRescheduleToken` 查询 — 先验证 token 获取旧日期/时间，再将已验证的 appointment 传入 `rescheduleAppointmentByToken`，避免重复 DB 查询；同时修复原来 token 无效时不返回错误的逻辑漏洞
- `mail.service.ts`：`sendMerchantBookingNotification` 收件人地址 `env.adminEmail || env.smtp.user` 可能为 `undefined`，改为先检查再发送，未配置时打印警告并跳过
- `api/booking/route.ts`：移除 `as any` 类型断言，`createBooking` 返回值已包含 `service` 关系，直接使用
- `api/booking/manage/[token]/route.ts`：移除两处 `as any` 类型断言

**代码质量**
- `email.service.ts`：transporter 改为懒加载（`getTransporter()`），避免模块加载时就初始化 nodemailer 连接，SMTP 未配置时不会产生无效连接
- `src/lib/admin-booking-copy.ts` → `src/lib/admin-booking-labels.ts`：重命名去掉历史遗留的 `-copy` 后缀，引用自动更新

- `npm run build` 验证通过 ✅

---

## Phase 53 — 升级 Next.js 15.5.10 修复剩余 CVE（2026-03-17）

- `next` 14.2.35 → **15.5.10**：修复 2 个剩余 CVE
  - `GHSA-9g9p-9gw9-jx7f`（moderate）：DoS via Image Optimizer remotePatterns，修复于 15.5.10
  - `GHSA-h25m-26qc-wcjf`（high）：HTTP request deserialization DoS with insecure RSC，修复于 15.0.8+
- `next-intl` 3.14.0 → **3.26.5**：支持 Next.js 15，peer dependency 兼容 React 18
- `next.config.js`：`experimental.serverActions` 移至顶层 `serverActions`（Next.js 15 中 serverActions 已稳定）
- `npm audit` 结果：**0 vulnerabilities** ✅
- 无 breaking changes：`params`/`searchParams`/`cookies()`/`headers()` 均已在 Phase 48-51 按 Next.js 15 规范处理
- `npm run build` 验证通过 ✅

---

## Phase 52 — 依赖安全升级（2026-03-17）

- `next` 14.1.0 → 14.2.35：修复 15 个 CVE（SSRF、Cache Poisoning、DoS、Authorization Bypass 等）
- `nodemailer` 6.x → 8.0.2：修复 2 个 CVE（DoS、邮件域名解析漏洞）；breaking change 仅为错误码 `NoAuth` → `ENOAUTH`，项目未使用该错误码，无影响
- 剩余 2 个 Next.js 漏洞（GHSA-9g9p-9gw9-jx7f / GHSA-h25m-26qc-wcjf）需升级到 Next.js 16 才能修复，属 major breaking change，暂不升级；两个漏洞均需特定条件触发，在当前项目使用场景下实际风险极低

- `npm run build` 验证通过 ✅

## Phase 51 — 安全加固续（2026-03-17）

**修复 1：`api/admin/settings/test-email/route.ts` 运行时 Bug（高危）**
- `session.email` 引用未定义变量，导致测试邮件接口 500；改为 `admin.email`（已通过 `getCurrentAdmin()` 获取）

**修复 2：`error: any` 类型断言清理**
- `api/appointment/reschedule/[token]/route.ts`：catch 块改为 `error instanceof Error` 类型守卫
- `api/appointment/cancel/[token]/route.ts`：同上

- `npm run build` 验证通过 ✅

## Phase 50 — 安全加固续（2026-03-17）

**审查范围**：privacy API 路由、params 类型规范、无效函数名

**修复：`api/appointment/[appointmentId]/privacy/route.ts`**
- params 类型改为 `Promise<{ appointmentId: string }>` 并 `await params`
- 移除 `POST_DELETE` 函数（Next.js 不会路由到非标准 HTTP 方法名，该函数从未被调用）
- 移除 `error: any` 类型断言，改为 `error: unknown`
- `POST_DELETE` 中的 `error.message` 泄露随函数删除一并消除
- GET handler 保留（数据导出功能）

- `npm run build` 验证通过 ✅

## Phase 49 — 安全加固续（2026-03-17）

**审查范围**：全部管理员 API 错误泄露、上传目录路径、params 类型规范

**修复 1：上传目录路径不一致**
- `api/admin/upload/route.ts`：`uploadDir` 从 `path.join(process.cwd(), 'public', 'uploads')` 改为读取 `env.uploadDir`（即 `UPLOAD_DIR` 环境变量），与 Docker 挂载卷配置保持一致

**修复 2：管理员 API 错误信息泄露（批量）**
- `api/admin/settings/route.ts`：catch 块改为统一返回 "Internal server error"
- `api/admin/services/route.ts`：同上
- `api/admin/services/[id]/route.ts`：PATCH + DELETE 两个 handler 均修复；同时 params 类型改为 `Promise<{ id: string }>` 并 `await params`
- `api/admin/content/route.ts`：同上；移除未使用的 `import path from 'path'`
- `api/admin/gallery/[id]/route.ts`：同上；params 类型改为 `Promise<{ id: string }>` 并 `await params`

- `npm run build` 验证通过 ✅

## Phase 48 — 安全加固（2026-03-17）

**审查范围**：管理员 API 错误泄露、安全响应头、数据库索引、并发竞态、客户端输入校验

**修复 1：管理员 API 错误信息泄露**
- `api/admin/appointments/[id]/route.ts`：catch 块改为统一返回 "Internal server error"，不透传 `error.message`
- `internalNote` 字段补 2000 字符长度限制，防止超大 payload 写入

**修复 2：安全响应头补全**
- `next.config.js`：补 `X-DNS-Prefetch-Control: on`、`Permissions-Policy`（禁用 camera/microphone/geolocation/payment）、`Strict-Transport-Security`（max-age=63072000 + includeSubDomains + preload）

**修复 3：数据库索引优化**
- `prisma/schema.prisma`：`Appointment` 表补 `confirmationToken`、`status`、`appointmentDate`、`customerPhone`、`customerEmail` 五个索引
- 新增 `prisma/migrations/phase_48_security_indexes/migration.sql`

**修复 4：并发竞态处理**
- `booking-protection.service.ts`：catch 块区分 Prisma P2002 unique constraint 冲突（并发竞态，允许通过）和其他错误（记录日志）

**修复 5：客户端改约页面输入校验**
- `appointment/reschedule/[token]/page.tsx`：提交前补日期格式（`YYYY-MM-DD` 正则）+ 未来日期校验，date input 加 `min={today}` 属性

- `npm run build` 验证通过 ✅

## Phase 47 — 安全审查 + Bug 修复（2026-03-17）

**审查范围**：邮件模板 XSS、错误信息泄露、输入验证、API 数据一致性

**修复 1：邮件模板 XSS（高危）**
- `src/lib/utils.ts`：新增 `escapeHtml()` 工具函数，转义 `& < > " '` 五个 HTML 特殊字符
- `mail.service.ts`：`customerName`、`customerPhone`、`customerEmail`、`notes`、`serviceName`、`appointmentTime`、`siteName` 全部经 `escapeHtml()` 转义后再插入 HTML 模板
- `email.service.ts`：同上，`customerName`、`serviceName`、`appointmentTime`、`reason`、`oldTime` 全部转义

**修复 2：错误信息泄露（中）**
- `api/appointment/cancel/[token]/route.ts`：POST 错误响应改为只在已知错误（"Invalid or expired cancel link"）时透传 message，其余统一返回 "Internal server error"
- `api/appointment/reschedule/[token]/route.ts`：同上

**修复 3：`booking/manage/[token]` serviceName 未按 locale 选择（Bug）**
- GET 返回的 `serviceName` 改为按 `appointment.locale` 选择 `nameEn` / `nameDe`

**修复 4：输入验证加强（中）**
- `src/lib/validations/booking.ts`：
  - `appointmentDate` 新增 `YYYY-MM-DD` 正则校验 + 未来日期校验（不允许提交过去日期）
  - `appointmentTime` 新增 `HH:MM` 格式正则校验
  - `bookingManageSchema` 同步加强日期/时间格式校验
- `api/booking/manage/[token]/route.ts`：PATCH 改约/取消操作改为用 `bookingManageSchema` 验证 body，拒绝非法 payload
- `api/appointment/reschedule/[token]/route.ts`：POST 补日期/时间格式正则校验 + `isNaN` 检查，使用已验证的 `parsedDate` 对象

- `npm run build` 验证通过 ✅



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

---

## Phase 58 — 前台页面体验、样式、布局全面优化（2026-03-17）

**基础层**
- `globals.css`：新增 `.form-input`、`.btn-primary`、`.btn-ghost`、`.card`、`.eyebrow` 组件类，补充 `:focus-visible` 全局 focus 样式
- `tailwind.config.js`：新增 `shadow-card`、`shadow-card-hover`、`shadow-inner-sm`；新增 `rounded-5xl`；新增 `transitionTimingFunction.spring`；新增 `fade-up` / `fade-in` keyframes + animation

**组件优化**
- `SectionShell`：eyebrow 标签新增小装饰点，间距调整（py-14/20/24），支持 `className` prop 传入背景色
- `ServiceCard`：顶部 hover 渐变线条动画，featured badge 加装饰点，底部新增"查看详情"箭头提示，时长图标化，整体 hover 效果升级（`shadow-card-hover`）
- `HeroSection`：eyebrow 使用 `.eyebrow` 组件类，CTA 按钮改用 `.btn-primary` / `.btn-ghost`，stats 卡片改用 `shadow-card`，装饰 blob 优化
- `SiteHeader`：导航链接改为 pill 形 hover 效果，logo hover 透明度过渡，预约按钮加 `-translate-y-0.5` hover 效果，分隔线优化
- `BookingForm`：所有输入框改用 `.form-input`（含 focus ring），提交按钮改用 `.btn-primary`，textarea 禁止 resize

**首页区块**
- 图库预览：图片 hover 时 scale-105 + 渐变遮罩，卡片 hover 阴影升级，背景加渐变
- 评价卡片：引号装饰（amber 色大引号），头像首字母 avatar，底部分隔线 + 作者信息，hover 效果
- 营业时间/联系区块：联系信息改为分组标签式布局，背景加渐变
- FAQ 区块：Q 标签 badge，hover 边框高亮，文字层级优化

- `npm run build` 验证通过 ✅

---

## Phase 59 — 后台 UI 优化 + 登录页数学验证码（2026-03-17）

**数学验证码（Math CAPTCHA）**
- 新增 `src/components/admin/MathCaptcha.tsx`：纯客户端数学题验证（`a + b = ?`，a/b 各 1-9），答案正确后生成 base64 token（含题目参数 + 时间戳 + nonce），10 分钟有效期，答错可换题
- `AdminLoginForm`：集成 Math CAPTCHA，当 Turnstile 未配置时自动显示数学验证；登录按钮在验证通过前禁用；登录失败后自动重置验证码
- `api/admin/login/route.ts`：新增 `verifyMathToken()` 服务端验证函数（base64 解码 → 验证答案 + 时间戳），有 Turnstile secret 时走 Turnstile，否则强制要求 math token

**登录页视觉升级**
- `AdminLoginPage`：深色背景（`#1f1a17`）+ 双层 radial gradient 装饰，品牌区域居中，登录卡片改为半透明深色玻璃风格（`bg-white/5 border-white/10 backdrop-blur-sm`）
- `AdminLoginForm`：输入框改为深色风格（`border-white/15 bg-white/8 text-white`），focus 改为 amber-400，提交按钮改为 amber-500（深色背景上更醒目），错误提示改为 `text-rose-400`

**后台共享组件优化**
- `AdminShell`：顶部工作区头部 eyebrow 前加 amber 装饰点，subtitle 颜色从 `stone-600` 改为 `stone-500`，backdrop-blur 升级为 `backdrop-blur-sm`
- `AdminStatGrid`：统计卡片 padding 从 `p-4` 升级为 `p-5`，加 hover 效果（light: `hover:border-stone-200 hover:shadow`，dark: `hover:bg-white/8`），数字加 `tabular-nums`
- `AdminPageToolbar`：阴影从 `shadow-[0_18px_60px_...]` 改为更轻量的 `shadow-[0_4px_24px_...]`，border 改为 `border-stone-200/80`

- `npm run build` 验证通过 ✅

---

## Phase 60 — SEO 全面优化（2026-03-17）

**structured-data.ts 升级**
- `buildLocalBusinessJsonLd`：补 `image`、`priceRange: '€€'`、`currenciesAccepted`、`paymentAccepted`、`geo`（慕尼黑 Arnulfstraße 104 坐标 48.1441/11.5389）、`postalCode`；address 改为始终输出（有 DB 值用 DB，否则用 fallback）
- 新增 `buildServiceJsonLd()`：`@type: Service`，含 name/description/offers（price+currency）/provider
- 新增 `buildWebSiteJsonLd()`：`@type: WebSite`，含 `potentialAction: SearchAction`（sitelinks searchbox）
- 新增 `buildFaqPageJsonLd()`：`@type: FAQPage`，faqs 为空时返回 null

**页面 JSON-LD 补全**
- 首页：新增 `WebSite` schema + `FAQPage` schema（faqs 有数据时输出）
- about 页：新增 `FAQPage` schema（faqs 有数据时输出）
- 服务详情页：新增 `Service` schema（含 offers/provider）

**法律页面 SEO 修正**
- `impressum/page.tsx`：metadata 改用 `createPageMetadata`（补 canonical/hreflang/OG），新增 `robots: { index: false, follow: false }`
- `privacy/page.tsx`：同上

**sitemap.ts 升级**
- 移除法律页面（impressum/privacy）收录（已设 noindex）
- 每条 URL 补 `alternates.languages`（de/en hreflang 对）

**robots.ts 升级**
- `disallow` 新增 `/*/booking/confirm`（token 确认页不应被索引）

**根 layout.tsx 动态 lang**
- `RootLayout` 改为 async，通过 `headers()` 解析请求路径中的 locale（`/de/` 或 `/en/`），动态设置 `<html lang>`，不再硬编码 `lang="de"`

- `npm run build` 验证通过 ✅

---

## Phase 61 — SEO + 安全加固（2026-03-17）

**SEO 修复**
- `seo.ts`：`createPageMetadata` 补 `openGraph.images`（`og-image.jpg` 1200×630）和 `twitter.images`，所有页面分享时有预览图；`defaultSiteMetadata` 同步补 OG 图片
- `public/og-image.jpg`：用 sharp 生成 1200×630 占位 OG 图片（深色品牌风格），部署时替换为真实图片
- `services/[slug]/page.tsx`：breadcrumb JSON-LD 统一改用 `getBaseUrl()`，消除与 `process.env.APP_URL` 的不一致
- `contact/page.tsx`：`buildLocalBusinessJsonLd` 改用 `baseUrl` 字符串拼接，与首页写法一致

**安全加固**
- `next.config.js`：新增 `Content-Security-Policy` 响应头，允许 self / Cloudflare Turnstile / Google Maps iframe / Pexels 图片，禁止 object-src，限制 form-action 为 self
- `middleware.ts`：所有请求注入 `x-pathname` header（供根 layout 读取 locale 动态设置 `<html lang>`）；matcher 扩展为覆盖所有路径（排除静态资源），确保前台页面也能注入 header；admin 鉴权逻辑不变

- `npm run build` 验证通过 ✅

---

## Phase 61 — SEO 深化 + 安全加固（2026-03-17）

**安全：Math CAPTCHA HMAC 签名**
- 新增 `GET /api/admin/captcha`：服务端生成数学题，用 `SESSION_SECRET` 做 HMAC-SHA256 签名，返回 `{ challenge, question }`；challenge 格式 `base64(a:b:ts:hmac_sig)`，防止客户端伪造
- `MathCaptcha.tsx`：重写为从服务端获取 challenge，提交时传 `captchaChallenge + captchaAnswer`（不再在客户端生成 token）
- `AdminLoginForm.tsx`：适配新 API，state 改为 `captchaChallenge / captchaAnswer`
- `api/admin/login/route.ts`：移除旧的 `verifyMathToken()`，改为调用 `verifyCaptchaToken(challenge, answer)`（HMAC 验证）；移除旧的 `mathToken` 字段

**安全：CSP nonce 替换 unsafe-inline**
- `middleware.ts`：每次请求生成随机 nonce（`randomBytes(16).toString('base64')`），注入 `x-nonce` header；CSP 改为 `script-src 'self' 'nonce-{nonce}' https://challenges.cloudflare.com`，消除 `unsafe-inline`；CSP header 直接在 middleware response 上设置（动态 per-request）
- `next.config.js`：移除静态 CSP header（改由 middleware 动态设置），保留其他安全 headers（HSTS/X-Frame-Options/Referrer-Policy 等）
- `src/app/layout.tsx`：读取 `x-nonce` header，通过 `<meta name="csp-nonce">` 暴露给 Next.js 内联脚本

**SEO：服务列表页 ItemList schema**
- `structured-data.ts`：新增 `buildItemListJsonLd()`，生成 `@type: ItemList`
- `services/page.tsx`：输出 `ItemList` JSON-LD（每个服务含 name + url）

**SEO：booking 页 noindex**
- `booking/page.tsx`：metadata 加 `robots: { index: false, follow: true }`（预约表单页不应被索引）
- `sitemap.ts`：移除 `/booking` 路径（noindex 页面不收录）

- `npm run build` 验证通过 ✅

## Phase 62 — SEO 收尾 + OG 图片 + 安全审计（2026-03-17）

**SEO 修复**
- `contact/page.tsx`：`buildLocalBusinessJsonLd` 的 `@id` 改为指向首页 `${baseUrl}/de`（规范的 LocalBusiness 实体 URL，不应指向联系页）
- `gallery/page.tsx`：新增 `ImageGallery` + `ImageObject` schema，每张图片标记 `contentUrl / name / author`
- `structured-data.ts`：新增 `buildImageGalleryJsonLd()` 函数
- `seo.ts`：删除已无用的 `getLocaleAlternates()` 函数（`createPageMetadata` 已内联处理 hreflang）

**OG 图片**
- `public/og-image.svg`：新建品牌风格 SVG（深色背景 + 琥珀色 accent，1200×630）
- `public/og-image.jpg`：用 sharp 从 SVG 生成 JPEG（quality 90，45KB）

**安全审计**
- `npm audit --audit-level=high`：0 漏洞

**构建验证**
- `npm run build` 通过 ✓，22 页全部生成，0 错误


## Phase 63 — 全站 UI/UX 升级（2026-03-17）

基于 UI UX Pro Max 技能设计系统分析（Soft UI Evolution 风格，wellness/spa 行业规则）：

**字体系统**
- 引入 Lora（serif，标题）+ Raleway（sans，正文），通过 `next/font/google` 零 CLS 加载
- `tailwind.config.js`：`font-serif` → Lora，`font-sans` → Raleway
- `layout.tsx`：body 加 `font-sans`，CSS 变量注入
- 所有 `h1-h6` 默认使用 `font-serif`（globals.css base layer）

**设计 Token 升级**
- 背景色从 `#f8f5f0` 升级为 `#fdfaf6`（更暖、更轻盈）
- 新增 `warm-50/100/200` 色阶（section 背景渐变用）
- `shadow-card` 优化为双层阴影（更自然的深度感）
- `eyebrow` 组件类：tracking 改为 `widest2`（0.24em），更精致
- focus 样式改为 amber-400 ring（品牌一致性）
- 新增 `prefers-reduced-motion` 全局规则

**组件升级**
- `SiteHeader`：logo/品牌名 serif 字体，nav 链接 font-sans，cursor-pointer 补全
- `HeroSection`：h1 serif，stats 卡片 serif 数字，圆角升级为 `rounded-[2.5rem]`，blob 优化
- `SectionShell`：h2 serif，eyebrow 装饰点升级，间距微调
- `ServiceCard`：h3 serif，价格 serif，hover 边框改为 amber-200，details 链接改为 amber-700
- `SiteFooter`：品牌名 serif，所有链接补 cursor-pointer + duration-150
- `FloatingActions`：hover 效果统一，cursor-pointer 补全

**UX 规范合规**
- 所有可点击元素补 `cursor-pointer`
- hover 状态统一 150-200ms transition
- focus-visible 全局 amber ring
- `prefers-reduced-motion` 支持

- `npm run build` 验证通过 ✓，22 页全部生成


## Phase 7 — 移动端体验修复（2026-03-17）

**问题修复**
- `MobileMenu`：drawer/backdrop `top-16` → `top-14`，与移动端 header `h-14` 对齐，消除 8px 间隙
- `FloatingActions`：无效类 `sm:h-13 sm:w-13` → `sm:h-14 sm:w-14`（Tailwind 无 13 单位）
- `HeroSection`：移动端图片 `aspect-[4/3]` → `aspect-[16/9]`，减少图片占屏高度，文字内容更易触达
- `BookingForm`：aside 联系信息加 `order-1 lg:order-2`，表单加 `order-2 lg:order-1`，移动端联系信息显示在表单上方
- `SiteFooter`：`grid-cols-2` → `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`，小屏单列避免拥挤；brand 列 `col-span-2 lg:col-span-1` → `col-span-1 sm:col-span-2 lg:col-span-1`
- `gallery/page.tsx`：图片 `aspect-[4/5]` → `aspect-[3/4]`，移动端单列时减少每张图片高度
- `globals.css`：全局 `main { pb-24 sm:pb-0 }`，防止 FloatingActions 遮挡所有页面底部内容

- `npm run build` 验证通过 ✓，Exit Code: 0


## Phase 8 — React Hydration 修复 + DYNAMIC_SERVER_USAGE 修复（2026-03-17）

**根因分析**
- React error #418（hydration mismatch）+ 所有页面 `DYNAMIC_SERVER_USAGE` 错误
- `layout.tsx` 使用 `await headers()`（动态 API），但未声明 `dynamic = 'force-dynamic'`
- Next.js 在 production build 时尝试静态预渲染，遇到动态 API 就崩溃
- `src/app/page.tsx` 根页面调用 `getSystemSettings()`（数据库），同样缺少 `force-dynamic`
- `services/[slug]/page.tsx` 有 `generateStaticParams` 但 build 时数据库不可用，运行时 500

**修复**
- `src/app/layout.tsx`：加 `export const dynamic = 'force-dynamic'`
- `src/app/page.tsx`：加 `export const dynamic = 'force-dynamic'`
- `src/app/[locale]/services/[slug]/page.tsx`：加 `export const dynamic = 'force-dynamic'`
- `npm run build` 验证通过 ✓，所有页面标记为 `ƒ (Dynamic)`
- Docker 镜像完全重建部署

## Phase 8b — 修复 React #418 hydration mismatch 根因（2026-03-17）

**根因**
- `layout.tsx` 的 `<head>` 里有 `{nonce && <meta name="csp-nonce" content={nonce} />}`
- `nonce` 是每次请求随机生成的值，服务端渲染时存在，客户端 hydration 时无法获取
- 导致服务端渲染了 `<meta>` 节点，客户端期望空，React #418 text node mismatch

**修复**
- 移除 `<head>` 里的 nonce meta 标签（CSP nonce 已通过 HTTP header 传递，不需要 meta 标签）
- 移除多余的 `<head>` 标签（Next.js 自动管理）
- 在 `<html>` 上加 `suppressHydrationWarning`（`lang` 属性服务端/客户端可能有微小差异）
- `npm run build` 验证通过 ✓

## Phase 9 — 修复后台登录输入框文字白色（2026-03-17）

**根因**
- `AdminLoginForm.tsx` 输入框用了 `bg-white/8`，Tailwind 默认 opacity 刻度没有 8（有 5、10、15...）
- CSS 未生成该类，输入框背景 fallback 为透明，在白色背景下变成白底白字

**修复**
- `bg-white/8` → `bg-white/[0.08]`（Tailwind 任意值语法，强制生成 8% 透明度）
- 两个输入框（邮箱、密码）均已修复
