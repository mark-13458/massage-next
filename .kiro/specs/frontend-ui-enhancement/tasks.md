# 实施计划：前端 UI 增强

## 概述

按依赖顺序实施 8 个需求：先扩展数据模型和后端 API，再实现共享组件，最后修改前台/后台页面组件。所有代码使用 TypeScript，遵循项目现有分层架构。

## 任务

- [x] 1. 扩展数据模型与服务层
  - [x] 1.1 在 `prisma/schema.prisma` 中为 `Service` 添加 `coverImage` 显式关联
    - 在 `Service` 模型添加 `coverImage File? @relation("ServiceCoverImage", fields: [coverImageId], references: [id])`
    - 在 `File` 模型添加 `serviceCoverImages Service[] @relation("ServiceCoverImage")`
    - 运行 `npx prisma generate` 更新客户端类型
    - _需求: 1.6, 3.5_

  - [ ]* 1.2 为 `getActiveServices` 扩展编写属性测试
    - **Property 4：getActiveServices 包含封面图路径**
    - **Validates: Requirements 1.6**
    - 测试文件：`src/__tests__/site-service.test.ts`

  - [x] 1.3 扩展 `getActiveServices`，在 `include` 中加入 `coverImage`，返回值新增 `coverImageFilePath`
    - 修改 `src/server/services/site.service.ts`（或对应 repository）
    - `include: { coverImage: { select: { filePath: true } } }`
    - 返回映射：`coverImageFilePath: service.coverImage?.filePath ?? null`
    - _需求: 1.6_

  - [x] 1.4 扩展 `getSystemSettings`，从 `adminSystemSettings` JSON 中解析 `logoFileId` 和 `faviconFileId`
    - 修改 `src/server/services/site.service.ts`（或对应 settings service）
    - 返回类型新增 `logoFileId: number | null` 和 `faviconFileId: number | null`
    - _需求: 7.3, 8.4_

- [x] 2. 扩展后端 API
  - [x] 2.1 扩展 `PATCH /api/admin/services/[id]`，支持 `coverImageId` 字段
    - 修改 `src/app/api/admin/services/[id]/route.ts`
    - 接受 `coverImageId?: number | null`，写入数据库并触发 `CACHE_TAGS.services` 失效
    - _需求: 3.2, 3.5_

  - [x] 2.2 扩展 `PATCH /api/admin/settings`，支持 `logoFileId` 和 `faviconFileId` 字段
    - 修改 `src/app/api/admin/settings/route.ts`
    - 将两个字段合并写入 `adminSystemSettings` JSON value
    - 触发 `CACHE_TAGS.settings` 缓存失效
    - _需求: 7.2, 7.7, 8.3_

  - [x] 2.3 新建动态 favicon 路由 `src/app/favicon.ico/route.ts`
    - 优先级：`faviconFileId` → `logoFileId` → 重定向静态 `/favicon.ico`
    - 所有数据库查询包裹 `try/catch`，任何错误返回 HTTP 200 + 静态 favicon
    - _需求: 8.2, 8.4, 8.5, 8.6, 8.7_

  - [ ]* 2.4 为 favicon 路由编写属性测试
    - **Property 14：Favicon 优先级顺序**
    - **Property 15：Favicon 路由容错性**
    - **Validates: Requirements 8.4, 8.5, 8.6, 8.7**
    - 测试文件：`src/__tests__/favicon-route.test.ts`

  - [x] 2.5 扩展上传接口 `ALLOWED_USAGES`，支持 `service-cover`、`logo`、`favicon` 三种用途
    - 修改 `src/app/api/admin/upload/route.ts`（或对应上传处理文件）
    - `logo` 和 `favicon` 用途不设最小尺寸限制
    - _需求: 3.2, 7.2, 8.3_

- [x] 3. 检查点 — 确保数据层和 API 层测试通过，如有问题请告知

- [x] 4. 新建共享组件
  - [x] 4.1 新建 `MapEmbed` 组件（`src/components/site/MapEmbed.tsx`）
    - Props：`address: string`、`locale: 'de' | 'en'`、`height?: number`（默认 320）
    - 提取纯函数 `buildMapEmbedUrl(address: string): string`，地址为空时使用默认地址 `Arnulfstraße 104, 80636 München`
    - iframe 设置 `loading="lazy"`、`title`（de: `Standort auf der Karte`，en: `Location on map`）
    - 移动端高度 220px，桌面端使用传入 `height`
    - _需求: 4.2, 4.3, 4.4, 4.5, 5.1_

  - [ ]* 4.2 为 `MapEmbed` 编写属性测试
    - **Property 8：地图 iframe title 双语正确性**
    - **Property 10：地图 URL 动态反映地址**
    - **Validates: Requirements 4.4, 5.2, 5.3**
    - 测试文件：`src/__tests__/map-embed.test.ts`

  - [x] 4.3 新建 `AdminLogoForm` 组件（`src/components/admin/AdminLogoForm.tsx`）
    - Client Component，Props：`initialLogoUrl`、`initialFaviconUrl`
    - Logo 上传区：有图时展示缩略图 + "更换"/"移除"按钮；无图时展示上传入口
    - Favicon 上传区：独立入口，支持 `.ico`、`.png`
    - 上传调用 `/api/admin/upload`，成功后调用 `PATCH /api/admin/settings`
    - 上传失败时显示错误提示，不改变当前状态
    - _需求: 7.1, 7.2, 7.5, 7.6, 8.1, 8.3_

  - [ ]* 4.4 为 `AdminLogoForm` 编写属性测试
    - **Property 13：Logo 上传失败不改变 logoFileId**
    - **Validates: Requirements 7.6**
    - 测试文件：`src/__tests__/logo-form.test.tsx`

- [x] 5. 修改 `ServiceCard` 组件
  - [x] 5.1 在 `ServiceCard` 中添加图片/占位区域渲染逻辑
    - 新增 prop：`coverImageUrl?: string | null`
    - 有图：渲染 `aspect-[16/9]` 的 `Image` 组件，`loading="lazy"`
    - 无图：渲染暖色渐变占位区域（`bg-gradient-to-br from-amber-50 to-stone-100`）+ 装饰图标
    - `isFeatured` 徽章叠加在图片区域右上角
    - 保持现有悬停动效（`hover:-translate-y-1.5`、顶部高亮线）
    - _需求: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 5.2 为 `ServiceCard` 编写属性测试
    - **Property 1：服务卡片图片/占位区域互斥渲染**
    - **Property 2：图片懒加载属性**
    - **Property 3：推荐徽章叠加**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.5**
    - 测试文件：`src/__tests__/service-card.test.tsx`

- [x] 6. 修改服务详情页
  - [x] 6.1 在 `src/app/[locale]/services/[slug]/page.tsx` 中添加封面图渲染
    - 从数据库查询中包含 `coverImage` 关联
    - 有图：在标题上方渲染 `Image` 组件，宽度占满内容区，最大高度 480px，使用 `priority` 属性
    - 无图：不渲染图片区域，布局保持正常
    - `alt` 文本设为服务名称
    - _需求: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 6.2 为服务详情页编写属性测试
    - **Property 5：服务详情页封面图条件渲染**
    - **Property 6：详情页封面图 alt 文本**
    - **Validates: Requirements 2.1, 2.2, 2.4**
    - 测试文件：`src/__tests__/service-detail.test.tsx`

- [x] 7. 修改后台服务表单
  - [x] 7.1 在 `AdminServiceForm`（`src/components/admin/ServiceForm.tsx`）中添加封面图管理 UI
    - 有图时展示缩略图 + "更换图片"/"移除图片"按钮
    - 无图时展示上传入口，调用 `/api/admin/upload`（usage: `service-cover`）
    - 上传成功后更新本地 `coverImageId` 状态
    - 上传失败时显示 `NoticePill` 错误提示，不改变 `coverImageId`
    - 保存时将 `coverImageId` 包含在 PATCH 请求体中
    - _需求: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 7.2 为封面图上传失败场景编写属性测试
    - **Property 7：封面图上传失败不改变 coverImageId**
    - **Validates: Requirements 3.4**
    - 测试文件：`src/__tests__/service-card.test.tsx`（或新建 `service-form.test.tsx`）

- [x] 8. 检查点 — 确保组件层测试通过，如有问题请告知

- [x] 9. 修改前台 Header 组件（动态 Logo）
  - [x] 9.1 修改 `SiteHeader`（`src/components/site/SiteHeader.tsx`）支持动态 Logo
    - 从 `getSystemSettings()` 读取 `logoFileId` 对应的 `filePath`
    - 有图：用 `Image` 组件渲染动态 Logo
    - 无图：回退到 `/logo.svg` 静态文件
    - _需求: 7.3, 7.4, 7.8_

  - [x] 9.2 修改 `ZenHeader`（`src/components/site/zen/ZenHeader.tsx`）支持动态 Logo
    - 同上，有图时替换字母 Logo 为动态图片，无图时保留字母 Logo
    - _需求: 7.3, 7.4, 7.8_

  - [ ]* 9.3 为 Logo 动态渲染编写属性测试
    - **Property 12：Logo 动态渲染一致性**
    - **Validates: Requirements 7.3, 7.8**
    - 测试文件：`src/__tests__/logo-form.test.tsx`

- [x] 10. 嵌入谷歌地图
  - [x] 10.1 在首页 ContactSection（`src/app/[locale]/page.tsx`）中嵌入 `MapEmbed`
    - 从 `getSystemSettings()` 读取 `contact.address`，传入 `MapEmbed`
    - 放置在联系信息卡片下方
    - _需求: 4.1, 4.2, 4.7_

  - [x] 10.2 在 `ZenHomePage`（`src/components/site/zen/ZenHomePage.tsx`）联系区块中嵌入 `MapEmbed`
    - 同上，保持 zen 主题风格
    - _需求: 4.8_

  - [x] 10.3 修正联系页（`src/app/[locale]/contact/page.tsx`）地图 URL 为动态读取
    - 替换现有硬编码地图 URL，改用 `MapEmbed` 组件
    - 传入 `height={360}`，从 `contact.address` 动态读取地址
    - _需求: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 10.4 为两套主题首页地图嵌入编写属性测试
    - **Property 9：两套主题首页均包含 MapEmbed**
    - **Validates: Requirements 4.7, 4.8**
    - 测试文件：`src/__tests__/map-embed.test.ts`

- [x] 11. 服务列表页视觉优化
  - [x] 11.1 在服务列表页（`src/app/[locale]/services/page.tsx`）顶部添加 Hero 区块
    - 包含 eyebrow、title、description 三层标题结构，与首页风格一致
    - 空状态时展示带视觉占位图的提示，而非纯文字
    - _需求: 6.1, 6.3, 6.4_

  - [ ]* 11.2 为 SectionShell 三层标题结构编写属性测试
    - **Property 11：SectionShell 三层标题结构完整性**
    - **Validates: Requirements 6.3**
    - 测试文件：`src/__tests__/map-embed.test.ts`（或新建 `section-shell.test.tsx`）

- [x] 12. 嵌入 AdminLogoForm 到后台设置页
  - [x] 12.1 在 `src/app/admin/settings/page.tsx` 中引入并渲染 `AdminLogoForm`
    - 从数据库读取当前 `logoFileId` 和 `faviconFileId`，查询对应 `filePath` 作为初始值传入
    - _需求: 7.1, 8.1_

- [x] 13. 更新 `app/layout.tsx` 的 favicon 引用
  - [x] 13.1 在 `generateMetadata` 的 `icons` 字段中引用动态 favicon 路由
    - `icons: { icon: '/favicon.ico' }`（指向动态路由）
    - _需求: 8.8_

- [x] 14. 最终检查点 — 确保所有测试通过，运行 `npm run build` 验证构建无误，如有问题请告知

## 备注

- 标有 `*` 的子任务为可选测试任务，可跳过以加快 MVP 进度
- 每个任务均引用具体需求条款，确保可追溯性
- 属性测试使用 fast-check，每个属性最少运行 100 次迭代
- 测试注释格式：`// Feature: frontend-ui-enhancement, Property {N}: {属性描述}`
- 任务 1 完成后需运行 `npx prisma generate` 更新类型
