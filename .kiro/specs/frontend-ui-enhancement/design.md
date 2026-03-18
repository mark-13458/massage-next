# 技术设计文档：前端 UI 增强

## 概述

本设计文档覆盖 massage-next 前端 UI 增强的 8 个需求，包括服务图片展示、谷歌地图嵌入、Logo/Favicon 后台管理和页面视觉优化。所有改动遵循项目"最小化代码"原则，兼容 classic 和 zen 两套主题，不引入新的 npm 依赖。

### 核心约束

- 图片统一使用 Next.js `Image` 组件
- 上传复用现有 `/api/admin/upload` 接口（注意：实际路径为 `/api/admin/upload`，非 `/api/admin/media/upload`）
- 数据模型扩展最小化：`Service.coverImageId` 已存在于 schema，`SiteSetting` 通过 JSON value 字段扩展
- 谷歌地图使用免费 iframe 嵌入，无需 API Key
- 缓存失效通过现有 `CACHE_TAGS` 机制处理

---

## 架构

### 整体改动范围

```
需求 1/2/3 — 服务图片
  prisma/schema.prisma          Service.coverImageId 已存在，需添加 File 关联
  src/server/services/site.service.ts   getActiveServices 扩展 coverImageFilePath
  src/components/site/ServiceCard.tsx   添加图片区域
  src/app/[locale]/services/[slug]/page.tsx  添加详情页封面图
  src/components/admin/ServiceForm.tsx  添加封面图上传 UI
  src/app/api/admin/services/[id]/route.ts   支持 coverImageId PATCH

需求 4/5 — 谷歌地图
  src/components/site/MapEmbed.tsx      新建共享组件
  src/app/[locale]/page.tsx             首页 ContactSection 嵌入
  src/components/site/zen/ZenHomePage.tsx  Zen 首页联系区块嵌入
  src/app/[locale]/contact/page.tsx     修正地图 URL 为动态读取

需求 6 — 视觉优化
  src/app/[locale]/services/page.tsx    添加 Hero 区块
  src/components/site/ServiceCard.tsx   空状态优化（已在需求 1 中处理）

需求 7/8 — Logo/Favicon
  prisma/schema.prisma          无需改动（SiteSetting 使用 JSON value）
  src/server/services/site.service.ts   getSystemSettings 扩展 logoFileId/faviconFileId
  src/components/site/SiteHeader.tsx    动态 Logo
  src/components/site/zen/ZenHeader.tsx 动态 Logo
  src/components/admin/AdminLogoForm.tsx 新建 Logo/Favicon 管理组件
  src/app/admin/settings/page.tsx       嵌入 AdminLogoForm
  src/app/api/admin/settings/route.ts   支持 logoFileId/faviconFileId PATCH
  src/app/favicon.ico/route.ts          新建动态 favicon 路由
  src/app/layout.tsx                    generateMetadata 添加 icons 字段
```

---

## 组件与接口

### 新建组件

#### `MapEmbed` (`src/components/site/MapEmbed.tsx`)

共享地图嵌入组件，供首页和联系页复用。

```typescript
interface MapEmbedProps {
  address: string        // 用于生成 Google Maps Embed URL
  locale: 'de' | 'en'
  height?: number        // 默认 320，联系页传 360
}
```

地图 URL 生成逻辑：
```
https://www.google.com/maps/embed/v1/place?q={encodeURIComponent(address)}&key=
```
由于使用免费 iframe 嵌入（无 API Key），改用 search 模式：
```
https://maps.google.com/maps?q={encodeURIComponent(address)}&output=embed
```

#### `AdminLogoForm` (`src/components/admin/AdminLogoForm.tsx`)

后台 Logo 和 Favicon 管理表单，Client Component。

```typescript
interface AdminLogoFormProps {
  lang: 'zh' | 'en'
  initialLogoUrl?: string | null    // 当前 Logo 的 filePath
  initialFaviconUrl?: string | null // 当前 Favicon 的 filePath
}
```

### 修改组件

#### `ServiceCard` — 添加图片区域

新增 props：
```typescript
coverImageUrl?: string | null
```

渲染逻辑：
- 有 `coverImageUrl`：渲染 `aspect-[16/9]` 的 `Image` 组件，`loading="lazy"`
- 无 `coverImageUrl`：渲染暖色渐变占位区域（`bg-gradient-to-br from-amber-50 to-stone-100`）+ 装饰图标
- `isFeatured` 徽章叠加在图片区域右上角

#### `SiteHeader` — 动态 Logo

从 `getSystemSettings()` 读取 `logoFileId` 对应的 `filePath`，有则用 `Image` 渲染，无则回退 `/logo.svg`。

#### `ZenHeader` — 动态 Logo

同上，将当前硬编码的字母 Logo 替换为动态图片（有图时）或保留字母 Logo（无图时）。

### API 接口变更

#### `PATCH /api/admin/services/[id]`

新增支持字段：
```typescript
coverImageId?: number | null
```

#### `PATCH /api/admin/settings`

新增支持字段（写入 `adminSystemSettings` JSON value）：
```typescript
logoFileId?: number | null
faviconFileId?: number | null
```

#### `GET /api/favicon.ico` (新建 `src/app/favicon.ico/route.ts`)

优先级逻辑：
1. `faviconFileId` 存在 → 读取对应 File 记录，返回文件内容
2. `logoFileId` 存在 → 读取对应 File 记录，返回文件内容
3. 两者均为空 → 重定向到 `/favicon.ico`（静态文件）
4. 任何错误 → 返回 200 + 默认静态 favicon

---

## 数据模型

### `Service` 模型

`coverImageId` 字段已存在于 `prisma/schema.prisma`，但缺少与 `File` 的显式关联。需添加：

```prisma
model Service {
  // ... 现有字段 ...
  coverImageId     Int?
  coverImage       File?    @relation("ServiceCoverImage", fields: [coverImageId], references: [id])
}

model File {
  // ... 现有字段 ...
  serviceCoverImages Service[] @relation("ServiceCoverImage")
}
```

### `SiteSetting` — `adminSystemSettings` JSON 扩展

在现有 `adminSystemSettings` JSON value 中新增两个字段（无需 schema 迁移）：

```json
{
  "logoFileId": 42,
  "faviconFileId": null
}
```

`getSystemSettings()` 扩展返回：
```typescript
{
  // ... 现有字段 ...
  logoFileId: number | null
  faviconFileId: number | null
}
```

### `getActiveServices` 扩展

```typescript
// 新增 include
const services = await prisma.service.findMany({
  where: { isActive: true },
  include: { coverImage: { select: { filePath: true } } },
  orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
})

// 返回新增字段
return services.map((service) => ({
  // ... 现有字段 ...
  coverImageFilePath: service.coverImage?.filePath ?? null,
}))
```

### 上传接口扩展

现有 `/api/admin/upload` 的 `ALLOWED_USAGES` 需扩展支持 `service-cover`、`logo`、`favicon` 三种用途，并调整最小尺寸限制（logo/favicon 无最小尺寸要求）。

---

## 正确性属性

*属性（Property）是在系统所有有效执行中都应成立的特征或行为——本质上是对系统应做什么的形式化陈述。属性是人类可读规范与机器可验证正确性保证之间的桥梁。*

### Property 1：服务卡片图片/占位区域互斥渲染

*对任意* 服务数据，当 `coverImageFilePath` 非空时，ServiceCard 应渲染包含该路径的 `img` 元素；当 `coverImageFilePath` 为空时，ServiceCard 应渲染占位区域而非 `img` 元素，两者互斥。

**Validates: Requirements 1.1, 1.2**

### Property 2：图片懒加载属性

*对任意* 带有 `coverImageFilePath` 的 ServiceCard，渲染结果中的 `img` 元素应包含 `loading="lazy"` 属性。

**Validates: Requirements 1.3**

### Property 3：推荐徽章叠加

*对任意* `isFeatured=true` 的服务，ServiceCard 渲染结果应包含推荐徽章元素（包含"Empfohlen"或"Featured"文本）。

**Validates: Requirements 1.5**

### Property 4：getActiveServices 包含封面图路径

*对任意* 数据库中存在 `coverImageId` 的服务，`getActiveServices` 返回的对应条目应包含非空的 `coverImageFilePath` 字段。

**Validates: Requirements 1.6**

### Property 5：服务详情页封面图条件渲染

*对任意* 服务，当 `coverImageId` 非空时，ServiceDetailPage 应渲染图片区域；当 `coverImageId` 为空时，不渲染图片区域，页面布局正常。

**Validates: Requirements 2.1, 2.2**

### Property 6：详情页封面图 alt 文本

*对任意* 服务名称，ServiceDetailPage 渲染的封面图 `alt` 属性应等于该服务的名称字符串。

**Validates: Requirements 2.4**

### Property 7：封面图上传失败不改变 coverImageId

*对任意* 初始 `coverImageId` 状态，当上传接口返回错误时，ServiceForm 的 `coverImageId` 状态应保持不变，且错误提示应可见。

**Validates: Requirements 3.4**

### Property 8：地图 iframe title 双语正确性

*对任意* locale（`de` 或 `en`），MapEmbed 渲染的 `iframe` 元素的 `title` 属性应等于对应语言的预期文本（德语：`Standort auf der Karte`，英语：`Location on map`）。

**Validates: Requirements 4.4**

### Property 9：两套主题首页均包含 MapEmbed

*对任意* 主题设置（classic 或 zen），首页联系区块的渲染结果应包含 `iframe` 元素（地图嵌入）。

**Validates: Requirements 4.7, 4.8**

### Property 10：地图 URL 动态反映地址

*对任意* 非空地址字符串，`buildMapEmbedUrl(address)` 生成的 URL 应包含该地址的 URL 编码形式；当地址为空时，应使用默认地址 `Arnulfstraße 104, 80636 München`。

**Validates: Requirements 5.2, 5.3**

### Property 11：SectionShell 三层标题结构完整性

*对任意* 传入 `eyebrow`、`title`、`description` 的 SectionShell，渲染结果应同时包含三个对应的文本节点。

**Validates: Requirements 6.3**

### Property 12：Logo 动态渲染一致性

*对任意* 非空 `logoFileId`，classic 主题 SiteHeader 和 zen 主题 ZenHeader 渲染的 Logo `img` 元素的 `src` 属性应均指向该 `logoFileId` 对应的 `filePath`。

**Validates: Requirements 7.3, 7.8**

### Property 13：Logo 上传失败不改变 logoFileId

*对任意* 初始 `logoFileId` 状态，当上传接口返回错误时，AdminLogoForm 的 `logoFileId` 状态应保持不变，且错误提示应可见。

**Validates: Requirements 7.6**

### Property 14：Favicon 优先级顺序

*对任意* `faviconFileId` 和 `logoFileId` 的组合：
- 当 `faviconFileId` 非空时，`/favicon.ico` 路由应返回 `faviconFileId` 对应的文件内容
- 当 `faviconFileId` 为空且 `logoFileId` 非空时，应返回 `logoFileId` 对应的文件内容
- 当两者均为空时，应返回默认静态 favicon

**Validates: Requirements 8.4, 8.5, 8.6**

### Property 15：Favicon 路由容错性

*对任意* 数据库查询失败场景，`/favicon.ico` 路由应返回 HTTP 200 状态码，不返回 4xx/5xx 错误。

**Validates: Requirements 8.7**

---

## 错误处理

### 图片加载失败

- ServiceCard 和 ServiceDetailPage 中的 `Image` 组件依赖 Next.js 内置错误处理
- 若 `filePath` 指向不存在的文件，Next.js Image 会返回 404，前端显示破损图标
- 缓解方案：上传时验证文件存在性，删除图片前清除关联

### 上传失败

- ServiceForm 和 AdminLogoForm 捕获 `adminRequest` 抛出的错误
- 显示 `NoticePill` 错误提示，不修改当前 `coverImageId`/`logoFileId`
- 上传接口已有 MIME 白名单和大小限制（10MB）

### 地图加载失败

- iframe 加载失败为浏览器网络行为，不在应用层处理
- 地图区域保持空白，不影响页面其他内容

### Favicon 路由容错

- 所有数据库查询包裹在 `try/catch` 中
- 任何错误均返回 HTTP 200 + 重定向到静态 `/favicon.ico`
- 不暴露内部错误信息

### 数据库查询容错

- 所有前台 `getSystemSettings()` 调用已有 `.catch(() => null)` 容错
- Logo 渲染时若 `logoFileId` 对应的 File 记录不存在，回退到默认静态 Logo

---

## 测试策略

### 双轨测试方法

本功能采用单元测试 + 属性测试的双轨方法：

- **单元测试**：验证具体示例、边界情况和错误条件
- **属性测试**：验证跨所有输入的通用属性

两者互补，共同提供全面覆盖。

### 单元测试重点

- `buildMapEmbedUrl(address)` 函数：验证 URL 编码正确性和默认地址回退
- `ServiceCard` 渲染：有图/无图两种状态的快照测试
- `AdminLogoForm` 渲染：有/无 Logo 两种初始状态
- Favicon 路由：三种优先级分支的集成测试
- `getSystemSettings` 返回值：包含 `logoFileId`/`faviconFileId` 字段

### 属性测试重点

使用 **fast-check**（TypeScript 生态主流 PBT 库）实现以下属性测试，每个属性最少运行 100 次迭代：

```typescript
// 示例：Property 10 — 地图 URL 动态反映地址
// Feature: frontend-ui-enhancement, Property 10: 地图 URL 动态反映地址
fc.assert(
  fc.property(fc.string({ minLength: 1 }), (address) => {
    const url = buildMapEmbedUrl(address)
    return url.includes(encodeURIComponent(address))
  }),
  { numRuns: 100 }
)
```

每个属性测试必须通过注释引用设计文档中的属性编号，格式：
```
// Feature: frontend-ui-enhancement, Property {N}: {属性描述}
```

### 测试文件组织

```
src/
  __tests__/
    map-embed.test.ts          # Property 8, 10
    service-card.test.tsx      # Property 1, 2, 3
    service-detail.test.tsx    # Property 5, 6
    logo-form.test.tsx         # Property 12, 13
    favicon-route.test.ts      # Property 14, 15
    site-service.test.ts       # Property 4
```

### 不测试的内容

- CSS 动画和悬停效果（需要浏览器环境）
- 响应式高度（需要视口模拟）
- 地图 iframe 实际加载（网络行为）
- Next.js Image 组件内部行为（框架责任）
