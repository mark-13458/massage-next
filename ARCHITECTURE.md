# ARCHITECTURE.md

# China TCM Massage / massage-next

## 1. 项目定位

这是一个面向**中小型按摩店/理疗店**的官网系统，目标不是复杂平台，而是：

- 前台官网美观、现代、可信
- 访问速度快，移动端体验优秀
- SEO 友好，适合本地搜索获客
- 支持免费图片与 AI 生成图片混合使用
- 提供**中文后台**，方便店主/店员日常维护
- 支持基础预约管理、服务管理、内容管理、图库管理

一句话定义：

> 一个面向本地获客的双语按摩店官网，兼顾品牌展示、在线预约、SEO 优化和中文后台运营。

---

## 2. 设计目标

### 核心业务目标
1. 让用户快速建立信任
2. 让用户快速找到服务、地址、电话、预约入口
3. 让网站在 Google / 本地搜索结果中更容易被发现
4. 让店主可以不依赖开发者，自己维护基础内容

### 非目标
- 不做复杂 ERP / CRM
- 不做多门店复杂调度
- 不做复杂会员系统
- 不做重型微服务架构
- 不做一开始就过度自动化的排班/支付/营销系统

---

## 3. 总体架构

采用**单体优先、分层清晰、逐步增强**的架构：

- **Web 单体应用**：Next.js 14 App Router
- **数据库**：MySQL
- **ORM**：Prisma
- **邮件通知**：Nodemailer
- **反向代理**：Nginx
- **部署方式**：Docker Compose

### 架构原则
- 部署简单：一个 Web + 一个 MySQL + 一个 Nginx
- 页面分层：前台与后台共用一个应用，避免重复维护
- 服务端优先：减少首屏 JS，提高性能与 SEO
- 数据结构贴近业务：服务、预约、内容、图片、FAQ、营业时间
- 后台中文优先：低学习成本，高可操作性

---

## 4. 信息架构

## 4.1 前台页面

默认德语，支持英语。

### 路由规划
- `/de`
- `/de/services`
- `/de/about`
- `/de/gallery`
- `/de/contact`
- `/de/booking`

- `/en`
- `/en/services`
- `/en/about`
- `/en/gallery`
- `/en/contact`
- `/en/booking`

### 前台页面职责
- **首页**：品牌形象、卖点、热门服务、信任建立、预约转化
- **服务页**：服务说明、价格、时长、适合人群、预约 CTA
- **关于页**：理念、环境、专业形象
- **图库页**：店铺环境、氛围图、服务展示
- **联系页**：地址、电话、邮箱、营业时间、地图、交通说明
- **预约页**：最短路径提交预约请求

## 4.2 后台页面

后台语言默认中文。

### 路由规划
- `/admin/login`
- `/admin`
- `/admin/appointments`
- `/admin/services`
- `/admin/content`
- `/admin/gallery`
- `/admin/settings`

### 后台页面职责
- **仪表盘**：今日预约、待确认预约、本周预约、热门服务
- **预约管理**：查看、筛选、改状态、备注
- **服务管理**：新增、编辑、上下架、排序
- **网站内容**：首页文案、关于、联系、FAQ、SEO 信息
- **图片管理**：上传、替换、排序、alt 文本
- **系统设置**：管理员账号、邮件配置、站点配置

---

## 5. UI / UX 架构

## 5.1 前台视觉方向

推荐视觉风格：

> Modern Wellness / Minimal Warm Luxury

### 视觉关键词
- 现代
- 温暖
- 轻奢
- 干净
- 治愈
- 放松
- 高信任感

### 避免的方向
- 过强科技感
- 过于花哨的玻璃效果
- 大红大金式传统廉价感
- 过度动画
- 模板站廉价感

## 5.2 色彩系统

建议使用暖色疗愈系：
- 背景：奶油白 / 米白
- 主色：琥珀棕 / clay brown
- 辅助色：sand / warm beige
- 强调色：terracotta / deep amber
- 文本色：warm gray / dark brown

## 5.3 字体系统

建议：
- 标题：优雅但不过度装饰
- 正文：现代、清晰、适合德语长词

候选：
- 标题：Cormorant Garamond / Playfair Display（轻量使用）
- 正文：Inter / Manrope / Plus Jakarta Sans

## 5.4 交互原则
- 移动端优先
- 预约入口始终明确
- 首屏 5 秒内建立品牌感和信任感
- CTA 不超过一个主按钮层级
- 表单字段少、反馈快、错误信息明确
- 后台按钮大、标签清晰、操作路径短

---

## 6. SEO 架构

SEO 是核心能力，不是附加项。

## 6.1 技术 SEO
- 每页独立 metadata（title / description）
- canonical
- hreflang（de / en）
- robots.txt
- sitemap.xml
- Open Graph
- Twitter cards
- 图片 alt 文本
- 语义化标题层级
- 干净 URL

## 6.2 内容 SEO
- 首页覆盖品牌词 + 地域词
- 服务页覆盖服务词 + 地域词
- 联系页强化本地商户信息（NAP）
- FAQ 承载长尾搜索词

## 6.3 本地 SEO
- Schema.org 结构化数据
- LocalBusiness / HealthAndBeautyBusiness 相关 schema
- 营业时间、电话、地址一致性
- 页面中清晰展示地理信息

---

## 7. 性能架构

## 7.1 渲染策略
- 首页：SSG / ISR 优先
- 服务页：SSG / ISR 优先
- 联系 / 关于 / FAQ：SSG
- 预约 API：动态
- 后台：动态

## 7.2 性能原则
- 优先服务端组件
- 控制客户端组件数量
- 减少第三方脚本
- 图片必须优化
- 避免布局跳动（CLS）
- 减少非必要 hydration

## 7.3 图片策略
- 优先 WebP / AVIF
- Hero 图控制尺寸
- 首屏图保留固定比例
- 折叠以下懒加载
- 统一管理 alt 文本

---

## 8. 图片素材策略

采用**真实图片 + AI 图片**混合策略。

## 8.1 真实/免费图库适用场景
- 店铺环境
- 服务场景
- 联系页辅助图
- 图库页主体内容

来源可选：
- Pexels
- Unsplash
- Pixabay

## 8.2 AI 图片适用场景
- Hero 氛围图
- 抽象背景
- 品牌宣传图
- 局部视觉装饰

## 8.3 原则
- 不过度依赖假人脸
- 尽量风格统一
- 所有图片保留 alt 文本和用途标签
- 后台可替换图片资源

---

## 9. 技术分层

建议代码分为以下层：

### 9.1 App / Route 层
负责：
- 页面路由
- metadata
- 页面数据装配
- API route 入口

### 9.2 Component 层
负责：
- 前台组件（site）
- 后台组件（admin）
- 基础组件（ui）

### 9.3 Service 层
负责：
- 预约业务逻辑
- 服务项目管理
- 内容管理
- 文件上传逻辑
- 邮件通知逻辑

### 9.4 Data / Repository 层
负责：
- Prisma 查询封装
- 与数据库交互

### 9.5 Validation 层
负责：
- Zod 请求参数校验
- 表单校验
- 环境变量校验

---

## 10. 推荐目录结构

```txt
massage-next/
├─ prisma/
│  ├─ schema.prisma
│  ├─ migrations/
│  └─ seed.ts
├─ src/
│  ├─ app/
│  │  ├─ (site)/
│  │  │  └─ [locale]/...
│  │  ├─ admin/...
│  │  ├─ api/...
│  │  └─ layout.tsx
│  ├─ components/
│  │  ├─ site/
│  │  ├─ admin/
│  │  └─ ui/
│  ├─ lib/
│  │  ├─ prisma.ts
│  │  ├─ auth.ts
│  │  ├─ mail.ts
│  │  ├─ env.ts
│  │  └─ validations/
│  ├─ server/
│  │  ├─ services/
│  │  └─ repositories/
│  ├─ messages/
│  │  ├─ de.json
│  │  └─ en.json
│  └─ styles/
├─ public/
├─ nginx/
├─ docker-compose.yml
└─ README_CN.md
```

---

## 11. 数据模型规划

当前已有基础模型：
- User
- Service
- Appointment
- File

建议扩展为以下业务模型：

### 核心模型
- `User`：管理员/店员
- `Service`：服务项目
- `Appointment`：预约记录
- `File`：图片/文件

### 内容模型
- `SiteSetting`：站点通用配置
- `BusinessHour`：营业时间
- `FaqItem`：FAQ
- `Testimonial`：评价
- `GalleryImage`：图库
- `SeoPageMeta`：页面 SEO（可选）

### Appointment 建议字段
- customerName
- customerPhone
- customerEmail
- serviceId
- appointmentDate
- appointmentTime
- durationMin
- priceSnapshot
- status
- source
- locale
- notes
- internalNote
- confirmationToken
- confirmedAt
- cancelledAt

### Appointment 状态建议
- `PENDING`
- `CONFIRMED`
- `COMPLETED`
- `CANCELLED`
- `NO_SHOW`

---

## 12. 后台认证与安全

## 12.1 认证策略
后台使用**HttpOnly Cookie Session**，不优先采用复杂 JWT 前后端分离方案。

理由：
- 本项目是单体应用
- 后台只面向少量管理员
- Cookie Session 更简单、直观、适合 SSR

## 12.2 安全要求
- 管理员密码使用 bcryptjs
- 登录接口限流
- 预约接口限流
- 文件上传限制类型与大小
- 所有输入走 Zod 校验
- 敏感环境变量只在服务端使用

---

## 13. 预约流程设计

首期采用**人工确认式预约**，避免过早做复杂排班引擎。

### 预约闭环
1. 用户填写预约表单
2. 服务端校验
3. 写入 Appointment（PENDING）
4. 给商家发送通知邮件
5. 后台查看并确认
6. 发送确认邮件给用户（可选）
7. 服务完成后改状态

### 后续可扩展
- 时间段冲突检测
- 自动确认链接
- Google Calendar 同步
- 短信/WhatsApp 通知

---

## 14. 部署架构

### 组件
- `web`：Next.js 应用
- `mysql`：MySQL 数据库
- `nginx`：反向代理

### 部署方式
Docker Compose 统一编排。

### 生产增强方向
- `.env.production`
- 数据库卷持久化
- 健康检查
- gzip / cache
- 日志规范
- 定期备份
- SSL（域名阶段）

---

## 15. 开发优先级

### Phase 1：基础骨架
- 目录重构
- Prisma schema 扩展
- env 规范
- auth 基础
- service 层基础

### Phase 2：前台可上线
- 首页
- 服务页
- 联系页
- 关于页
- 预约页
- 双语与 SEO 基础

### Phase 3：后台可运营
- 登录
- 预约管理
- 服务管理
- 内容管理
- 图片管理

### Phase 4：生产增强
- 性能优化
- SEO 深化
- 图片策略完善
- 监控与备份

---

## 16. 当前开发判断

当前仓库适合作为新版本的起点，但仍处于非常早期阶段：
- 现有前台页面过少
- 现有组件结构较平
- 数据模型仍偏基础
- 后台尚未真正落地
- SEO 与性能策略尚未完整实现

因此下一步不是小修小补，而是：

> 在保留现有技术栈的前提下，完成一次“面向上线”的中等强度重构。

---

## 17. 决策总结

本项目后续开发遵循以下固定决策：

- 采用 Next.js 单体架构
- 前台默认德语，支持英语
- 后台默认中文
- UI 风格走现代疗愈轻奢路线
- 前台以 SEO 与转化为第一优先
- 后台以易用与低维护为第一优先
- 图片采用真实图库 + AI 视觉混合策略
- 预约先做人工确认闭环，再逐步增强

---

## 18. 下一步落地输出

下一轮开发将优先产出：
1. 路线图与任务拆分
2. 增强版 Prisma schema
3. 新目录结构骨架
4. 前台首页/服务页/联系页方案
5. 后台中文骨架
