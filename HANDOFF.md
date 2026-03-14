# HANDOFF.md

# massage-next 接手开发说明

## 项目一句话
这是一个基于 **Next.js 14 + Prisma + MySQL** 的按摩店双语官网与中文后台系统，当前重点是把它从“可用雏形”推进到“可部署上线版本”。

---

## 接手时先看什么

推荐阅读顺序：
1. `README_CN.md` —— 当前功能面与本地运行方式
2. `ARCHITECTURE.md` —— 为什么这样设计
3. `ROADMAP.md` —— 原始路线规划
4. `DEVELOPMENT_LOG.md` —— 当前实际推进历史与阶段状态
5. `PROJECT_STATUS.md` —— 当前已完成 / 进行中 / 未完成阶段总览
6. `DEPLOYMENT_CHECKLIST.md` —— 本地 / 测试 / 生产部署联调清单

如果只想快速进入代码，请先看：
- `src/app/admin/content/page.tsx`
- `src/app/api/admin/content/route.ts`
- `src/app/api/admin/upload/route.ts`
- `src/app/admin/appointments/page.tsx`
- `src/app/admin/appointments/[id]/page.tsx`
- `src/app/admin/services/page.tsx`

另外请注意：
- 根目录里可能保留少量 smoke test 临时文件
- 它们的用途与范围已写在 `TEST_ARTIFACTS.md`
- 这些文件不是正式业务资产，不应提交到远端仓库

---

## 当前系统能力

### 前台
- 双语：德语 / 英语
- 首页、服务页、预约页、关于页、联系页、图库页
- 预约提交 API 已打通
- robots / sitemap 已有基础实现

### 后台
- 登录页与 session 保护已接入
- 已支持后台中英切换（cookie 持久化）
- 已新增系统设置页（基础系统参数）
- 已新增管理员修改密码入口
- 预约管理已可用
- 服务管理已可用
- 内容管理已可用
- Hero 图片可上传
- Gallery 图片可上传
- 删除 gallery 条目时会尝试删除本地上传文件

---

## 当前开发重点不是哪里

### 暂时不要优先投入过多精力在：
- 复杂会员体系
- 多门店排班
- 支付集成
- 重型 CRM / ERP 能力
- 过度设计的权限模型

这个项目当前更适合先把：
- 官网质量
- 上传链可靠性
- 后台运营体验
- 部署可用性

做扎实。

---

## 下一阶段最值得做的事

### 1. 上传链收尾
优先级很高。

建议继续补：
- Hero 旧文件替换后的回收策略
- 图片 MIME / 大小 / 尺寸校验
- 更明确的上传错误提示
- 统一图片删除逻辑
- 批量上传 / 替换策略（如需要）

### 2. 后台双语与设置链收尾
建议继续补：
- `ContentEditor` 全量接入后台双语层
- 后台默认语言读取系统设置默认值
- 系统设置真正驱动前台默认语言 / 预约说明 / 通知模板
- 状态枚举值的人类可读本地化

### 3. 部署联调
上线前必须收口：
- 环境变量检查
- 数据库迁移与 seed 策略
- Docker / Nginx 联调
- 上传目录持久化策略
- 生产环境图片访问与权限验证

---

## 关键接口速览

### 预约
- `POST /api/booking`

### 后台内容
- `PATCH /api/admin/content`

### 后台上传
- `POST /api/admin/upload`
  - `usage=gallery`
  - `usage=hero`

### 后台认证
- `/admin/login`
- 对应登录/退出 API + middleware 保护
- 后台页面本身也已增加 server-side auth gate（未登录直接重定向到 `/admin/login`）

---

## 开发规则（从现在开始执行）

### 阶段记录规则
以后每推进一个明确阶段，都必须：
1. 更新 `DEVELOPMENT_LOG.md`
2. 如有必要同步更新 `README_CN.md` / `ROADMAP.md` / `ARCHITECTURE.md`
3. 再进行 build 验证
4. commit
5. push 到 GitHub 远端
6. 给人类发送一条简洁进度汇报

### 提交风格建议
推荐提交格式：
- `feat: ...`
- `fix: ...`
- `docs: ...`
- `refactor: ...`

示例：
- `feat: add hero image upload and gallery file cleanup`
- `docs: add development log and handoff guide`

### 交接原则
不要只在聊天里汇报开发阶段；要把“阶段目标、已完成项、遗留问题、下一步建议”落到 `.md` 文件里。

---

## 当前已知风险

1. Hero 替换后的旧文件未完全回收
2. 上传文件校验仍可继续加强
3. 权限模型仍偏基础
4. 部署链还没做最终收口
5. 目前更偏 MVP / beta 级，不建议未经联调直接上线

---

## 本地常用命令

```bash
npm install
npm run dev
npm run build
npm run db:seed
```

如涉及 Prisma：

```bash
npx prisma generate
npx prisma migrate dev
```

---

## 当前结论

如果你现在接手，这不是一个从零开始的项目了。
它已经有：
- 明确架构
- 基本成形的前台
- 可用后台
- 初步完整的图片上传链

你最应该做的，不是推翻重写，而是：

> 顺着现有方向，把上传链、后台体验和部署质量收口到可上线级别。
