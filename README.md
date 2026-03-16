# massage-next

China TCM Massage — 德国本地按摩店双语官网 + 中文后台管理系统。

技术栈：**Next.js 14 (App Router) + Prisma + MySQL + Nodemailer + Nginx + Docker**

---

## 快速开始

```bash
npm install
npx prisma generate
npm run dev
```

数据库初始化：
```bash
npm run db:seed
```

Docker：
```bash
cp .env.example .env
docker compose up -d --build
```

---

## 关键路由

| 路由 | 说明 |
|------|------|
| `http://localhost:3000/de` | 前台德语首页 |
| `http://localhost:3000/en` | 前台英语首页 |
| `http://localhost:3000/admin/login` | 后台登录 |
| `http://localhost:3000/api/healthz` | 健康检查 |

---

## 文档阅读顺序（AI 或新开发者接手时）

1. `HANDOFF.md` — 当前状态、已完成 / 未完成、关键路由速查
2. `DEVELOPMENT_LOG.md` — 按阶段的开发历史与遗留问题
3. `AI_CONTEXT.md` — 开发规范与基线（**每次开发前必读**）
4. `ARCHITECTURE.md` — 系统架构与技术决策
5. `ADMIN_ARCHITECTURE.md` — 后台六大模块边界
6. `SEO_SECURITY_MVP_PLAN.md` — SEO 与安全设计基线
7. `DEPLOYMENT_CHECKLIST.md` — 部署联调清单
