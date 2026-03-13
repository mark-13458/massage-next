# massage-next

China TCM Massage / massage-next 是一个基于 **Next.js 14（App Router）+ Prisma + MySQL + Nodemailer + Nginx** 的按摩店双语官网与中文后台系统。

当前项目已经不只是官网骨架，而是已具备：
- 多语言官网（de/en）
- 在线预约链路
- 中文后台管理
- 内容管理与图库管理
- 基础图片上传
- 后台登录保护

建议优先阅读：
1. `README_CN.md`
2. `ARCHITECTURE.md`
3. `ROADMAP.md`
4. `DEVELOPMENT_LOG.md`
5. `PROJECT_STATUS.md`
6. `HANDOFF.md`

## Current status
- Frontend core pages are in place
- Admin login and core management flows are implemented
- Booking API is connected
- Gallery / Hero upload MVP is available
- Project has entered the “operable website system prototype” stage

## Quick start
```bash
npm install
npx prisma generate
npm run dev
```

## Important routes
- Frontend (de): `http://localhost:3000/de`
- Frontend (en): `http://localhost:3000/en`
- Admin login: `http://localhost:3000/admin/login`
- Health check: `http://localhost:3000/api/healthz`

## Notes
For the most accurate project progress, follow the project docs inside the repo instead of relying on chat history.