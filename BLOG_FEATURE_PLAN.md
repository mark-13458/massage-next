# Blog 文章自动化发布系统 — 完整实施方案

> 目标：为 munichtcmmassage.com 增加博客功能，通过 AI 自动生成 SEO 优化的德英双语文章，每天定时发布，提升长尾关键词排名和自然流量。

---

## 整体架构

```
关键词池 (KeywordPool)
    ↓ 每天取 1 个 PENDING 关键词
AI 生成引擎 (ai-provider.service.ts)
    ↓ 调用 OpenRouter / Gemini / Claude API
    ↓ 生成双语 SEO 文章 HTML
文章存储 (Article + ArticleTag)
    ↓ 自动发布 + revalidate 缓存
前台展示 (/blog, /blog/[slug], /blog/tag/[slug])
    ↓ 带 JSON-LD、内链、CTA 到店引导
Sitemap 自动更新
```

---

## 第 1 步：数据库模型

### Article（文章）
```prisma
model Article {
  id                Int       @id @default(autoincrement())
  uuid              String    @unique @default(uuid())
  slug              String    @unique
  // 双语内容
  titleDe           String
  titleEn           String
  summaryDe         String?   @db.Text
  summaryEn         String?   @db.Text
  contentDe         String?   @db.LongText
  contentEn         String?   @db.LongText
  // SEO 字段
  seoTitleDe        String?
  seoTitleEn        String?
  seoDescriptionDe  String?   @db.Text
  seoDescriptionEn  String?   @db.Text
  seoKeywordsDe     String?   @db.Text      // 逗号分隔关键词
  seoKeywordsEn     String?   @db.Text
  // 封面图
  coverImageId      Int?
  coverImage        File?     @relation("ArticleCoverImage", fields: [coverImageId], references: [id])
  coverImageUrl     String?                  // 外部图片 URL（Pexels 等）
  // 发布控制
  isPublished       Boolean   @default(false)
  publishedAt       DateTime?
  sortOrder         Int       @default(0)
  source            ArticleSource @default(MANUAL)
  // 关联
  tags              ArticleTagRelation[]
  keywordId         Int?      @unique
  keyword           KeywordPool? @relation(fields: [keywordId], references: [id])
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@index([isPublished, publishedAt])
  @@index([slug])
}

enum ArticleSource {
  MANUAL
  AI_GENERATED
}
```

### ArticleTag（文章标签）
```prisma
model ArticleTag {
  id        Int       @id @default(autoincrement())
  slug      String    @unique
  nameDe    String
  nameEn    String
  articles  ArticleTagRelation[]
  createdAt DateTime  @default(now())
}

model ArticleTagRelation {
  articleId Int
  tagId     Int
  article   Article    @relation(fields: [articleId], references: [id], onDelete: Cascade)
  tag       ArticleTag @relation(fields: [tagId], references: [id], onDelete: Cascade)
  @@id([articleId, tagId])
}
```

### KeywordPool（关键词池）
```prisma
model KeywordPool {
  id        Int            @id @default(autoincrement())
  keyword   String
  locale    String         @default("de")   // de | en
  status    KeywordStatus  @default(PENDING)
  usedAt    DateTime?
  article   Article?
  createdAt DateTime       @default(now())

  @@index([status, locale])
}

enum KeywordStatus {
  PENDING
  USED
  SKIPPED
}
```

### File 模型补充
```prisma
// 在 File 模型中添加反向关联
articleCoverImages Article[] @relation("ArticleCoverImage")
```

---

## 第 2 步：后端层

### Repository
- `article.repository.ts`：findAdminArticles()、findAdminArticleById()
- `article-tag.repository.ts`：findAllTags()
- `keyword-pool.repository.ts`：findPendingKeyword()、findAllKeywords()

### ViewModel
- `article.vm.ts`：AdminArticleListItemViewModel（id、标题、slug、状态、来源、发布时间、标签）

### Admin Service
- `admin-article.service.ts`：getAdminArticles()、getAdminArticleDetail()
- `admin-keyword.service.ts`：getKeywords()、getKeywordDetail()

### API 路由
| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/admin/articles` | POST | 创建文章 |
| `/api/admin/articles/[id]` | PATCH | 更新文章 |
| `/api/admin/articles/[id]` | DELETE | 删除文章 |
| `/api/admin/article-tags` | GET/POST | 标签列表/创建 |
| `/api/admin/article-tags/[id]` | PATCH/DELETE | 标签更新/删除 |
| `/api/admin/keywords` | GET/POST | 关键词列表/批量导入 |
| `/api/admin/keywords/[id]` | PATCH/DELETE | 更新/删除关键词 |
| `/api/admin/upload` | POST | 增加 `article-cover` 用途 |

---

## 第 3 步：后台管理页面

### 文章管理 `/admin/articles`
- 列表页：筛选（全部/已发布/草稿/AI生成）、搜索、状态标签
- 新建页：`/admin/articles/new`
- 编辑页：`/admin/articles/[id]`

### ArticleForm 组件
- 双语标题/摘要/正文（HTML textarea）
- SEO 区域：SEO 标题、描述、关键词（独立覆盖字段）
- 标签选择（多选）
- 封面图上传（复用 service-cover 模式）
- 发布开关 + 发布时间
- 来源标识（手动/AI 生成，只读）
- 自动 slug（从英文标题生成）

### 关键词池管理 `/admin/keywords`
- 列表：关键词、语言、状态（待用/已用/跳过）、关联文章链接
- 批量导入：textarea 粘贴（每行一个关键词）
- 单个添加/编辑/删除
- 状态筛选

### 标签管理 `/admin/article-tags`
- 列表：标签名（de/en）、slug、文章数量
- 新建/编辑/删除

### 后台导航
在 AdminNav navItems 数组中添加：
```typescript
{ href: '/admin/articles', labelZh: '文章管理', labelEn: 'Articles', descZh: '博客文章', descEn: 'Blog', icon: '▤', exact: false }
```

---

## 第 4 步：AI 文章生成引擎

### 多提供商适配层

**统一接口 `ai-provider.service.ts`：**
```typescript
interface AIProvider {
  generateArticle(prompt: string): Promise<string>
}

// 三个适配器
class OpenRouterProvider implements AIProvider { ... }  // OpenAI 兼容格式
class GeminiProvider implements AIProvider { ... }      // Google AI SDK
class ClaudeProvider implements AIProvider { ... }      // Anthropic SDK
```

**后台设置（存 SiteSetting）：**
- AI 提供商选择：OpenRouter / Gemini / Claude
- API Key（加密存储）
- 模型名称
- [测试连接] 按钮

### 文章生成服务 `article-generator.service.ts`

**生成流程：**
1. 从 KeywordPool 取一个 `PENDING` 关键词
2. 查询现有服务列表（用于内链）
3. 查询联系信息和营业时间（用于 CTA）
4. 构建 SEO 优化 prompt，要求 AI 返回 JSON：
   ```json
   {
     "titleDe": "...",
     "titleEn": "...",
     "summaryDe": "...",
     "summaryEn": "...",
     "contentDe": "<h2>...</h2><p>...</p>...",
     "contentEn": "<h2>...</h2><p>...</p>...",
     "seoTitleDe": "...",
     "seoTitleEn": "...",
     "seoDescriptionDe": "...",
     "seoDescriptionEn": "...",
     "seoKeywordsDe": "关键词1, 关键词2, ...",
     "seoKeywordsEn": "keyword1, keyword2, ...",
     "suggestedTags": ["massage", "rueckenschmerzen", ...],
     "slug": "rueckenmassage-muenchen-vorteile"
   }
   ```
5. 保存文章 + 创建/关联标签
6. 更新关键词状态为 `USED`

### Prompt 模板要求
- 标题：含主关键词，60 字符内
- Meta Description：含关键词，155 字符内
- 正文结构：H2/H3 标题层次、800-1500 词
- 关键词密度：1-2%
- 内链：在正文中自然插入服务页链接（如 `<a href="/de/services/full-body-massage">Ganzkörpermassage</a>`）
- CTA 区块：文章末尾插入预约引导
  ```html
  <div class="article-cta">
    <h3>Jetzt Termin vereinbaren</h3>
    <p>Erleben Sie die Vorteile einer professionellen Massage...</p>
    <a href="/de/booking">Termin buchen</a>
    <p>📞 Tel: xxx | 📍 Adresse: xxx</p>
  </div>
  ```
- 语言：德语为主、英语为辅，语言地道自然

---

## 第 5 步：定时任务

### API 路由 `/api/cron/generate-article`
```typescript
// GET /api/cron/generate-article
// Header: Authorization: Bearer <CRON_SECRET>
export async function GET(request: NextRequest) {
  // 1. 验证 CRON_SECRET
  // 2. 从 KeywordPool 取 PENDING 关键词
  // 3. 调用 AI 生成引擎
  // 4. 保存文章 + 自动发布
  // 5. revalidateTag(CACHE_TAGS.articles)
  // 6. 返回结果日志
}
```

### 服务器 crontab
```bash
# 每天早上 8:00（德国时间）执行
0 8 * * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://www.munichtcmmassage.com/api/cron/generate-article >> /var/log/article-cron.log 2>&1
```

### 后台手动触发
- 后台设置页添加"立即生成一篇"按钮（调用同一 API）
- 显示最近生成日志

---

## 第 6 步：前台页面

### 博客列表 `/[locale]/blog`
- 文章卡片网格（封面图、标题、摘要、发布日期、标签）
- 标签筛选侧边栏
- SEO metadata（createPageMetadata）
- ItemList JSON-LD

### 文章详情 `/[locale]/blog/[slug]`
- 封面图（Next.js Image）
- 标题 + 发布日期 + 标签
- 正文 HTML 渲染
- CTA 到店引导区块（预约按钮、电话、地址）
- 相关文章推荐（同标签的其他文章，最多 3 篇）
- generateStaticParams + generateMetadata
- Article JSON-LD + BreadcrumbList JSON-LD
- OG image 使用封面图

### 标签页 `/[locale]/blog/tag/[slug]`
- 按标签筛选的文章列表
- 独立 SEO metadata

### 缓存
- `site.service.ts` 添加：
  - `CACHE_TAGS.articles`
  - `getPublishedArticles(locale)` — 缓存 300s
  - `getArticleBySlug(slug)` — 缓存 300s
  - `getArticleTags()` — 缓存 300s

---

## 第 7 步：SEO 集成

### Sitemap
```typescript
// sitemap.ts 添加
// 1. '/blog' 加入 staticRoutes
// 2. 动态查询已发布文章的 slug
// 3. 动态查询有文章的标签 slug
```

### 结构化数据
```typescript
// structured-data.ts 添加
export function buildArticleJsonLd({ title, description, url, imageUrl, datePublished, dateModified }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image: imageUrl,
    datePublished,
    dateModified,
    author: { '@type': 'Organization', name: siteName },
    publisher: { '@type': 'Organization', name: siteName, url: siteUrl },
  }
}
```

### 导航
- SiteHeader 添加 Blog/Ratgeber 链接
- 前台页脚添加博客链接

---

## 第 8 步：翻译 + 构建 + 部署

### 翻译文案
`de.json` / `en.json` 添加：
- blog.title / blog.description
- blog.readMore / blog.publishedAt / blog.tags
- blog.backToList / blog.relatedArticles
- blog.cta.title / blog.cta.button

### 环境变量
```env
AI_ENCRYPTION_KEY=随机32位字符串     # 加密 API Key
CRON_SECRET=随机长字符串              # 定时任务鉴权
```

### 部署步骤
1. `npm run build` 验证
2. git commit + push
3. 服务器 pull + docker build + up
4. `npx prisma migrate deploy`（新表）
5. 配置 crontab
6. 后台填写 AI API Key
7. 导入第一批关键词
8. 手动触发一次测试

---

## 文件清单（预估新增）

| 文件 | 说明 |
|------|------|
| `prisma/migrations/xxx_add_article/` | 数据库迁移 |
| `src/server/repositories/admin/article.repository.ts` | 文章查询 |
| `src/server/repositories/admin/keyword-pool.repository.ts` | 关键词查询 |
| `src/server/view-models/admin/article.vm.ts` | 文章 ViewModel |
| `src/server/services/admin-article.service.ts` | 文章管理服务 |
| `src/server/services/admin-keyword.service.ts` | 关键词管理服务 |
| `src/server/services/ai-provider.service.ts` | AI 提供商适配层 |
| `src/server/services/article-generator.service.ts` | AI 文章生成引擎 |
| `src/app/api/admin/articles/route.ts` | 文章 CRUD API |
| `src/app/api/admin/articles/[id]/route.ts` | 文章单条 API |
| `src/app/api/admin/article-tags/route.ts` | 标签 API |
| `src/app/api/admin/article-tags/[id]/route.ts` | 标签单条 API |
| `src/app/api/admin/keywords/route.ts` | 关键词 API |
| `src/app/api/admin/keywords/[id]/route.ts` | 关键词单条 API |
| `src/app/api/cron/generate-article/route.ts` | 定时生成 API |
| `src/app/admin/articles/page.tsx` | 文章列表页 |
| `src/app/admin/articles/new/page.tsx` | 新建文章页 |
| `src/app/admin/articles/[id]/page.tsx` | 编辑文章页 |
| `src/app/admin/keywords/page.tsx` | 关键词管理页 |
| `src/app/admin/article-tags/page.tsx` | 标签管理页 |
| `src/components/admin/ArticleForm.tsx` | 文章表单组件 |
| `src/components/admin/KeywordImport.tsx` | 关键词批量导入组件 |
| `src/app/[locale]/blog/page.tsx` | 博客列表页 |
| `src/app/[locale]/blog/[slug]/page.tsx` | 文章详情页 |
| `src/app/[locale]/blog/tag/[slug]/page.tsx` | 标签聚合页 |
| `src/components/site/ArticleCard.tsx` | 文章卡片组件 |
| `src/components/site/ArticleCTA.tsx` | CTA 到店引导组件 |
