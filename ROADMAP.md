# ROADMAP.md

# massage-next 开发路线图

## 项目目标
打造一个面向中小型按摩店的双语官网系统：
- UI 美观现代
- 访问速度快
- SEO 友好
- 用户体验好
- 支持免费/AI 图片素材
- 提供中文后台

---

## 阶段总览

### Phase 1 - 架构落地与基础骨架
目标：让项目具备可持续开发能力

#### 任务
- [ ] 重构目录结构（site / admin / api / lib / server）
- [ ] 统一国际化目录与消息文件
- [ ] 建立设计 token（颜色、字体、阴影、圆角、间距）
- [ ] 建立 Prisma 客户端封装
- [ ] 建立 env 校验模块
- [ ] 建立基础 auth/session 方案
- [ ] 建立 Zod validation 基础层
- [ ] 建立邮件服务封装
- [ ] 更新 README_CN.md 与开发说明

#### 输出物
- 新目录结构
- `src/lib/*`
- `src/server/*`
- 基础设计系统

---

### Phase 2 - 数据模型升级
目标：让数据层真正支撑官网 + 后台

#### 任务
- [ ] 重构 `prisma/schema.prisma`
- [ ] ��充 `Service` 多语言字段与排序字段
- [ ] 增强 `Appointment` 业务字段
- [ ] 增加 `SiteSetting`
- [ ] 增加 `BusinessHour`
- [ ] 增加 `FaqItem`
- [ ] 增加 `Testimonial`
- [ ] 增加 `GalleryImage`
- [ ] 增加 `EmailLog`
- [ ] 编写 `seed.ts`

#### 输出物
- 增强版 Prisma schema
- 初始 seed 数据
- 本地迁移方案

---

### Phase 3 - 前台高质量官网
目标：先把品牌门面和转化路径做好

#### 页面任务
- [ ] 首页 `/[locale]`
- [ ] 服务页 `/[locale]/services`
- [ ] 关于页 `/[locale]/about`
- [ ] 图库页 `/[locale]/gallery`
- [ ] 联系页 `/[locale]/contact`
- [ ] 预约页 `/[locale]/booking`

#### 组件任务
- [ ] Header / Footer
- [ ] Hero
- [ ] 服务卡片
- [ ] CTA 区块
- [ ] FAQ 区块
- [ ] Testimonials 区块
- [ ] Gallery Grid
- [ ] 联系卡片
- [ ] 预约表单

#### SEO 任务
- [ ] metadata 模板
- [ ] 页面 title / description
- [ ] hreflang
- [ ] sitemap
- [ ] robots.txt
- [ ] LocalBusiness schema

#### 输出物
- 可展示、可访问、可 SEO 的前台站点

---

### Phase 4 - 预约闭环
目标：打通真实业务流程

#### 任务
- [ ] 预约表单校验
- [ ] `POST /api/booking`
- [ ] 数据入库
- [ ] 商家通知邮件
- [ ] 成功/失败反馈页
- [ ] 后台预约列表读取
- [ ] 预约状态更新
- [ ] 内部备注

#### 输出物
- 前台提交预约 → 后台看到预约 的完整链路

---

### Phase 5 - 中文后台
目标：店主可以自己维护网站与预约

#### 页面任务
- [ ] `/admin/login`
- [ ] `/admin`
- [ ] `/admin/appointments`
- [ ] `/admin/services`
- [ ] `/admin/content`
- [ ] `/admin/gallery`
- [ ] `/admin/settings`

#### 功能任务
- [ ] 登录/退出
- [ ] 预约筛选与详情
- [ ] 服务新增/编辑/上下架
- [ ] 首页/关于/联系内容编辑
- [ ] FAQ 管理
- [ ] 图库图片上传/替换
- [ ] 营业时间维护
- [ ] 基础 SEO 信息编辑

#### 输出物
- 中文后台 MVP

---

### Phase 6 - 性能与上线优化
目标：达到可上线质量

#### 任务
- [ ] 图片优化与懒加载
- [ ] 首屏性能优化
- [ ] 组件层级精简
- [ ] 字体与 CSS 优化
- [ ] Nginx 缓存优化
- [ ] Docker 健康检查
- [ ] `.env.production` 模板
- [ ] 数据备份方案
- [ ] 错误日志与邮件日志检查

#### 输出物
- 生产可部署版本

---

## 推荐开发顺序（执行顺序）

### Sprint 1
- 架构文档
- 路线图
- 目录重构
- schema 升级草案
- 设计系统与页面信息架构

### Sprint 2
- 前台首页 + 服务页 + 联系页
- SEO 基础
- 图片策略

### Sprint 3
- 预约 API
- 邮件通知
- 预约页
- 基础后台登录

### Sprint 4
- 后台预约管理
- 服务管理
- 内容管理
- FAQ / 营业时间

### Sprint 5
- 图库管理
- SEO 深化
- 性能优化
- 部署优化

---

## 当前优先级（立即执行）

### P0
- [ ] 重构 Prisma schema
- [ ] 设计新目录结构
- [ ] 建立前台 layout / header / footer / section 基础
- [ ] 规划后台中文骨架

### P1
- [ ] 完成首页、服务页、联系页
- [ ] 完成预约表单与 API
- [ ] 完成登录与后台基础壳

### P2
- [ ] 图库、FAQ、营业时间、SEO 细化
- [ ] 图片管理与内容管理
- [ ] 部署优化

---

## 验收标准

### 前台
- [ ] 页面视觉统一、现代、有品牌感
- [ ] 手机端体验良好
- [ ] 页面加载快
- [ ] 预约入口清晰
- [ ] 基本 SEO 元信息完整

### 后台
- [ ] 中文界面
- [ ] 非技术用户能理解
- [ ] 预约管理流程顺畅
- [ ] 服务和内容可维护

### 技术
- [ ] 代码结构清晰
- [ ] 数据模型合理
- [ ] 支持 Docker 部署
- [ ] 便于后续扩展
