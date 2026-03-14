# China TCM Massage（Next.js 单体版）

本项目是一个面向中式按摩门店的全栈单体系统，基于 **Next.js 14（App Router）+ Prisma + MySQL + Nodemailer + Nginx**。

当前它已经不只是官网骨架，而是已经发展为：
- 多语言官网（de/en）
- 在线预约链路
- 中文后台管理
- 内容管理与图库管理
- 基础图片上传
- 后台登录保护

目标是继续朝着 **可部署、可运营、可持续维护** 的小型业务系统推进。

---

## ✨ 当前已实现能力

### 前台官网
- 多语言页面：`/de`、`/en`
- 首页、服务页、预约页、关于页、联系页、图库页
- 首页 Hero / FAQ / 联系方式 / 营业时间 / testimonials 数据化
- 预约 API：`POST /api/booking`
- robots / sitemap 基础 SEO 文件

### 后台管理（`/admin`）
- 登录页：`/admin/login`
- 基础 session + middleware 保护
- 后台中英切换（中文 / English）
- Dashboard 概览
- 系统设置页
- 管理员修改密码
- 预约管理
  - 列表
  - 状态筛选
  - 状态修改
  - 内部备注
  - 详情页
  - 快捷操作
- 服务管理
  - 列表
  - 上下架 / 精选 / 排序
  - 新建
  - 编辑
  - 删除（有关联预约时受保护）
- 网站内容管理
  - 联系信息
  - 营业时间
  - FAQ（增删改）
  - Hero 文案
  - 图库内容
- 图库上传
  - 上传到 `public/uploads`
  - 自动创建 `File + GalleryImage`

---

## 🗂 项目结构（简要）

```bash
massage-next/
├─ docker-compose.yml
├─ Dockerfile
├─ nginx/
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.js
├─ public/
│  ├─ logo.svg
│  └─ uploads/
├─ src/
│  ├─ app/
│  │  ├─ [locale]/
│  │  ├─ admin/
│  │  └─ api/
│  ├─ components/
│  ├─ lib/
│  └─ server/
├─ middleware.ts
└─ README_CN.md
```

---

## 🔧 本地开发

```bash
# 安装依赖
npm install

# 生成 Prisma Client
npx prisma generate

# 本地启动
npm run dev
```

默认访问：
- 前台德语：`http://localhost:3000/de`
- 前台英语：`http://localhost:3000/en`
- 后台登录：`http://localhost:3000/admin/login`
- 健康检查：`http://localhost:3000/api/healthz`

---

## 🧪 数据初始化

```bash
npm run db:seed
```

Seed 当前会初始化：
- 管理员账号
- 示例服务
- FAQ
- 营业时间
- 联系方式
- Hero 基础内容
- testimonials

管理员默认来源：
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME`

如果未配置，则使用默认值（仅适合本地开发，正式环境必须修改）。

---

## 🐳 Docker

```bash
cp .env.example .env
docker compose up -d --build
```

当前 Compose 已改为优先从 `.env` 读取变量，避免把端口、数据库口令、管理员初始化信息硬编码在 `docker-compose.yml` 中。

当前目标架构：
- `web`：Next.js 应用
- `mysql`：MySQL 数据库
- `nginx`：反向代理

当前推荐至少确认这些变量：
- `APP_URL`
- `DATABASE_URL`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME`
- `SESSION_SECRET`
- `MYSQL_DATABASE` / `MYSQL_USER` / `MYSQL_PASSWORD` / `MYSQL_ROOT_PASSWORD`
- `UPLOAD_DIR`

健康检查：
- 应用：`/api/healthz`
- `web` 容器已在 Compose 中增加基于 `/api/healthz` 的 healthcheck
- `nginx` 已改为通过 Docker DNS 动态解析 `web` upstream，避免容器重建后继续指向旧 IP

---

## 📌 当前开发阶段

当前项目大致处于：

- 前台官网：**75%+**
- 后台运营：**65%+**
- 上线准备：**40%+**

### 已完成的关键里程碑
- 官网核心页面成形
- 预约链路打通
- 中文后台成形
- 服务/预约/内容三大后台模块可用
- 后台登录保护已接入
- 图库真实上传 MVP 已接入

### 接下来最重要的方向
- 上传链进一步打磨
- Hero / Gallery 资源管理收尾
- 更严格的认证 / 权限模型
- 部署联调与生产环境准备

---

## 🌍 当前业务信息（种子/默认内容参考）
- 地址：Arnulfstraße 104, 80636 München
- 电话：015563 188800
- 邮箱：chinesischemassage8@gmail.com
- 品牌：China TCM Massage

---

## 说明
本项目当前仍在快速迭代中，README 会随着后台、上传链、部署能力的增强继续更新。

---

## 🤝 交接与阶段记录

从当前版本开始，项目会把开发阶段过程持续写入仓库内文档，方便其他人接手：

- `DEVELOPMENT_LOG.md`：按阶段记录“做了什么 / 为什么 / 验证结果 / 遗留问题 / 下一步”
- `PROJECT_STATUS.md`：当前已完成 / 正在推进 / 未完成阶段的总览面板
- `HANDOFF.md`：给下一位开发者的快速接手说明
- `DEPLOYMENT_CHECKLIST.md`：部署联调、测试环境 smoke test、上线前检查清单

建议接手顺序：
1. `README_CN.md`
2. `ARCHITECTURE.md`
3. `ROADMAP.md`
4. `DEVELOPMENT_LOG.md`
5. `PROJECT_STATUS.md`
6. `HANDOFF.md`
7. `DEPLOYMENT_CHECKLIST.md`
6. `DEPLOYMENT_CHECKLIST.md`
