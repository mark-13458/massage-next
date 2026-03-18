# 需求文档

## 简介

本功能面向德国慕尼黑按摩店官网（massage-next），目标是提升前端视觉质量和用户体验，具体包括五个方向：

1. **服务项目图片展示**：在服务卡片和服务详情页中展示封面图片，提升视觉吸引力和信任感
2. **前端页面布局美化**：优化首页、服务页、联系页等核心页面的视觉层次、间距和组件样式
3. **首页引入谷歌地图**：在首页"联系"区块嵌入谷歌地图（免费 iframe 嵌入，无需 API Key），让访客无需跳转即可看到店铺位置
4. **Logo 后台管理**：支持在后台上传并动态读取网站 Logo，替代当前硬编码或静态文件方式
5. **Favicon 管理**：支持根据后台 Logo 自动生成 favicon.ico，或单独上传 favicon

所有改动必须兼容现有 classic 和 zen 两套主题，遵循项目"最小化代码"原则，不引入不必要的新依赖。服务图片通过后台上传管理，复用现有 `/api/admin/media/upload` 上传接口。视觉风格保持现有简约风格，做精细化调整，不做大改版。

---

## 词汇表

- **System**：massage-next 前端 Next.js 应用
- **ServiceCard**：服务列表页和首页中展示单个服务的卡片组件（`ServiceCard.tsx`）
- **ServiceDetailPage**：服务详情页（`/[locale]/services/[slug]`）
- **CoverImage**：服务封面图，存储在 `File` 表，通过 `Service.coverImageId` 关联
- **MapEmbed**：谷歌地图嵌入 iframe 组件
- **ContactSection**：首页中展示营业时间和联系信息的区块
- **ContactPage**：联系页（`/[locale]/contact`）
- **AdminServiceForm**：后台服务编辑表单（`ServiceForm.tsx`）
- **Classic 主题**：当前默认主题（`frontendTheme !== 'zen'`）
- **Zen 主题**：备选主题（`frontendTheme === 'zen'`）
- **Locale**：语言标识，取值为 `de`（德语）或 `en`（英语）
- **SiteLogo**：网站 Logo 图片，存储在 `File` 表，通过 `SiteSetting.logoFileId` 关联，前台动态读取
- **Favicon**：网站标签页图标（`favicon.ico`），可由 Logo 自动生成或单独上传
- **AdminLogoForm**：后台 Logo 管理入口（位于网站设置页）
- **LogoImage**：前台 Header 中渲染的 Logo 组件

---

## 需求

### 需求 1：服务卡片图片展示

**用户故事：** 作为网站访客，我希望在服务列表中看到每个服务的图片，以便快速建立对服务的直观印象并提升信任感。

#### 验收标准

1. WHEN 服务存在关联的 CoverImage，THE ServiceCard SHALL 在卡片顶部展示该图片，图片比例为 16:9，使用 `object-cover` 填充
2. WHEN 服务不存在关联的 CoverImage，THE ServiceCard SHALL 展示一个占位区域（暖色渐变背景 + 装饰图标），不显示破损图片
3. THE ServiceCard SHALL 对图片使用 `loading="lazy"` 懒加载，首屏以下的卡片不阻塞页面渲染
4. THE ServiceCard SHALL 保持现有的悬停动效（`hover:-translate-y-1.5`、顶部高亮线）在添加图片后仍正常工作
5. WHEN 服务被标记为 `isFeatured`，THE ServiceCard SHALL 在图片区域叠加"推荐"徽章，不遮挡图片主体内容
6. THE System SHALL 在 `getActiveServices` 查询中包含 CoverImage 的 `filePath`，供 ServiceCard 渲染使用

### 需求 2：服务详情页图片展示

**用户故事：** 作为网站访客，我希望在服务详情页看到该服务的大图，以便在预约前获得更直观的视觉参考。

#### 验收标准

1. WHEN 服务存在关联的 CoverImage，THE ServiceDetailPage SHALL 在页面顶部（标题上方或右侧）展示该图片，图片宽度占满内容区，最大高度为 480px
2. WHEN 服务不存在关联的 CoverImage，THE ServiceDetailPage SHALL 不渲染图片区域，页面布局保持正常
3. THE ServiceDetailPage SHALL 使用 `priority` 属性加载详情页封面图，确保 LCP 性能
4. THE ServiceDetailPage SHALL 为图片设置有意义的 `alt` 文本，格式为服务名称（如 `Traditionelle Chinesische Massage`）

### 需求 3：后台服务封面图管理

**用户故事：** 作为店主，我希望在后台为每个服务上传或更换封面图，以便控制前台展示的视觉内容。

#### 验收标准

1. THE AdminServiceForm SHALL 提供封面图上传入口，支持从本地选择图片文件
2. WHEN 管理员上传封面图，THE System SHALL 调用现有上传接口（`/api/admin/media/upload`），将图片存入 `File` 表并关联到对应服务的 `coverImageId`
3. WHEN 服务已有封面图，THE AdminServiceForm SHALL 展示当前封面图缩略图，并提供"更换图片"和"移除图片"操作
4. IF 上传失败，THEN THE AdminServiceForm SHALL 显示错误提示，不改变当前 `coverImageId`
5. THE System SHALL 在保存服务时，将 `coverImageId` 写入数据库，触发 `CACHE_TAGS.services` 缓存失效

### 需求 4：首页谷歌地图嵌入

**用户故事：** 作为网站访客，我希望在首页直接看到店铺在地图上的位置，以便快速判断交通便利性，无需跳转到联系页。

#### 验收标准

1. THE System SHALL 在首页"联系"区块（ContactSection）的联系信息卡片下方嵌入谷歌地图 iframe
2. THE MapEmbed SHALL 使用与联系页相同的地图嵌入地址（`contact.address` 对应的 Google Maps Embed URL）
3. THE MapEmbed SHALL 设置 `loading="lazy"`，不阻塞首页首屏渲染
4. THE MapEmbed SHALL 设置 `title` 属性（德语：`Standort auf der Karte`，英语：`Location on map`），满足无障碍要求
5. THE MapEmbed SHALL 在移动端（< 640px）高度为 220px，在桌面端（≥ 640px）高度为 320px
6. IF 地图加载失败（网络问题），THEN THE System SHALL 不显示错误提示，地图区域保持空白，不影响其他内容展示
7. WHERE Classic 主题，THE System SHALL 在首页 ContactSection 中渲染 MapEmbed
8. WHERE Zen 主题，THE System SHALL 在 ZenHomePage 的联系区块中同样渲染 MapEmbed

### 需求 5：联系页谷歌地图坐标修正

**用户故事：** 作为网站访客，我希望联系页的地图显示正确的店铺位置，以便准确导航。

#### 验收标准

1. THE ContactPage SHALL 使用正确的谷歌地图嵌入 URL，精确指向店铺地址（Arnulfstraße 104, 80636 München）
2. THE System SHALL 从 `contact.address`（SiteSetting）动态读取地址，当后台地址更新时，地图链接对应更新
3. WHEN `contact.address` 为空，THE ContactPage SHALL 使用默认地址（`Arnulfstraße 104, 80636 München`）生成地图 URL
4. THE MapEmbed 在联系页 SHALL 高度为 360px，与现有布局保持一致

### 需求 6：前端页面整体视觉优化

**用户故事：** 作为网站访客，我希望网站整体视觉更精致、层次更清晰，以便建立对品牌的信任感。

#### 验收标准

1. THE System SHALL 在服务列表页（`/[locale]/services`）的页面顶部添加视觉 Hero 区块，包含标题、副标题和背景装饰，与首页风格一致
2. THE ServiceCard SHALL 在有图片时，卡片高度自适应图片内容，保持 `grid gap-6 md:grid-cols-2 xl:grid-cols-3` 网格布局不变
3. THE SectionShell SHALL 在服务列表页中保持现有的 `eyebrow`、`title`、`description` 三层标题结构
4. WHEN 服务列表为空，THE System SHALL 展示带有视觉占位图的空状态提示，而非纯文字提示
5. THE System SHALL 确保所有新增图片组件使用 Next.js `Image` 组件，不使用原生 `<img>` 标签

### 需求 7：Logo 后台管理

**用户故事：** 作为店主，我希望在后台上传并更换网站 Logo，以便无需修改代码即可更新品牌视觉。

#### 验收标准

1. THE AdminLogoForm SHALL 在后台"网站设置"页面提供 Logo 上传入口，支持从本地选择图片文件（JPEG、PNG、WebP、SVG）
2. WHEN 管理员上传 Logo，THE System SHALL 调用现有上传接口（`/api/admin/media/upload`），将图片存入 `File` 表并将文件 ID 写入 `SiteSetting.logoFileId`
3. WHEN `SiteSetting.logoFileId` 存在，THE LogoImage SHALL 从数据库动态读取 Logo 图片路径并渲染，不使用硬编码或静态文件路径
4. WHEN `SiteSetting.logoFileId` 为空，THE LogoImage SHALL 回退显示默认静态 Logo（保持现有行为），不显示破损图片
5. WHEN 管理员已上传 Logo，THE AdminLogoForm SHALL 展示当前 Logo 缩略图，并提供"更换图片"和"移除图片"操作
6. IF 上传失败，THEN THE AdminLogoForm SHALL 显示错误提示，不改变当前 `logoFileId`
7. WHEN Logo 更新成功，THE System SHALL 触发 `CACHE_TAGS.settings` 缓存失效，确保前台在下次请求时读取最新 Logo
8. THE LogoImage SHALL 在 classic 主题 Header 和 zen 主题 Header 中均正确渲染动态 Logo

### 需求 8：Favicon 管理

**用户故事：** 作为店主，我希望网站标签页图标能与 Logo 保持一致，以便提升品牌统一性，无需手动处理图标文件。

#### 验收标准

1. THE System SHALL 支持两种 Favicon 管理方式：（A）根据后台 Logo 自动生成 favicon，（B）在后台单独上传 favicon 文件
2. WHERE 管理员选择自动生成方式，THE System SHALL 使用 Next.js `app/favicon.ico` 路由（`route.ts`）动态读取当前 Logo 并将其作为 favicon 响应，Content-Type 为 `image/x-icon` 或 `image/png`
3. WHERE 管理员选择单独上传方式，THE AdminLogoForm SHALL 提供独立的 Favicon 上传入口，支持 `.ico`、`.png` 格式，将文件 ID 写入 `SiteSetting.faviconFileId`
4. WHEN `SiteSetting.faviconFileId` 存在，THE System SHALL 优先使用单独上传的 favicon，忽略自动生成逻辑
5. WHEN `SiteSetting.faviconFileId` 为空且 `SiteSetting.logoFileId` 存在，THE System SHALL 使用 Logo 图片作为 favicon 响应
6. WHEN `SiteSetting.faviconFileId` 和 `SiteSetting.logoFileId` 均为空，THE System SHALL 回退使用项目默认静态 favicon，不显示空白图标
7. IF favicon 动态路由请求失败，THEN THE System SHALL 返回 HTTP 200 并响应默认静态 favicon，不返回 4xx/5xx 错误
8. THE System SHALL 在 `app/layout.tsx` 的 `generateMetadata` 中通过 `icons` 字段引用动态 favicon 路由，确保浏览器正确识别
