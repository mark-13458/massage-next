# PROJECT_STATUS.md

# massage-next 项目状态总览

> 用途：给任何新接手的人一个 3~5 分钟内能看懂的项目状态视图。
> 
> 建议：每次进入一个新阶段、完成一个里程碑、或改变优先级时，都同步更新本文件。

---

## 1. 项目定位

`massage-next` 是一个面向中小型按摩店的 **双语官网 + 中文后台管理系统**，技术栈为：

- Next.js 14 (App Router)
- Prisma
- MySQL
- Nodemailer
- Nginx
- Docker Compose

项目目标不是做复杂平台，而是优先完成：
- 好看的前台官网
- 清晰的预约转化
- 中文后台运营
- 基础 SEO
- 简单可靠的部署

---

## 2. 当前开发结论（截至 2026-03-13）

项目已经从“官网原型”推进到：

> **可运营网站系统雏形**

也就是说：
- 已经不是静态展示站
- 已经有后台登录与运营模块
- 已经有预约管理
- 已经有服务管理
- 已经有内容管理
- 已经有基础图片上传链

但它还没有完全收口到“生产上线版”。

---

## 3. 已完成阶段

### ✅ 已完成：Phase 1 - 架构落地与骨架建立
- 项目方向明确
- 架构文档已建立
- 路由与目录重构完成
- 前后台基础骨架完成

### ✅ 已完成：Phase 2 - 数据模型升级
- Prisma schema 已扩展
- 已支持服务、预约、FAQ、营业时间、图库、站点设置等模型
- seed 初始化已接入

### ✅ 已完成：Phase 3 - 前台核心页面
- 首页
- 服务页
- 预约页
- 关于页
- 联系页
- 图库页
- robots / sitemap 已补

### ✅ 已完成：Phase 4 - 预约 API 闭环
- `POST /api/booking`
- 前台预约已能入库
- 为后台预约管理提供数据链路

### ✅ 已完成：Phase 5 - 后台认证保护
- `/admin/login`
- 登录/退出 API
- session + middleware 保护

### ✅ 已完成：Phase 6 - 后台预约管理
- 列表
- 筛选
- 状态修改
- 内部备注
- 详情页
- 快捷操作

### ✅ 已完成：Phase 7 - 服务管理
- 服务列表
- 新建 / 编辑 / 删除
- 上下架 / 精选 / 排序
- 已有关联预约的删除保护

### ✅ 已完成：Phase 8 - 内容管理
- contact
- hours
- FAQ
- Hero
- gallery

### ✅ 已完成：Phase 9 - 图库上传 MVP
- Gallery 图片上传到 `public/uploads`
- 自动创建 `File + GalleryImage`

### ✅ 已完成：Phase 10 - 仓库交接准备
- Git 远端已接好
- `.gitignore` 已补
- README_CN 已更新

### ✅ 已完成：Phase 11 - 预约详情工作台增强
- 详情页操作能力增强
- 可直接进行确认 / 完成 / 取消 / 爽约

### ✅ 已完成：Phase 12~14 - 上传链增强
- 上传 API 已支持 `hero` / `gallery`
- Hero 支持直接上传
- 删除 gallery 条目时同步尝试删除本地文件
- Hero 替换图片时，已补本地旧文件清理逻辑
- 上传接口已补基础 MIME 白名单校验（jpg/png/webp/gif）

---

## 4. 当前正在推进的阶段

## 🚧 Phase 15 - 上传链收尾 + 交接文档完善

### 当前已做
- Hero 旧文件清理逻辑已补上
- 上传接口用途校验已补上
- 上传图片类型白名单已补上
- 前端上传前校验已补上（类型 / 10MB 大小限制）
- 服务端图片宽高读取已补上
- Hero / Gallery 最低尺寸校验已补上
- Gallery 封面唯一性约束已补上
- 后台保存 / 上传反馈增强已补上
- 预约后台反馈体验对齐已补上
- 预约状态可视化增强已补上
- Docker 上传目录持久化卷已补上
- `DEVELOPMENT_LOG.md` 已建立
- `HANDOFF.md` 已建立
- `PROJECT_STATUS.md`（本文件）已建立
- `DEPLOYMENT_CHECKLIST.md` 已纳入正式交接体系

### 当前还没做完
- 图片尺寸校验
- 图片大小限制提示更细化
- Hero / Gallery 更统一的资源替换策略
- 更正式的图片元数据处理（width / height / compression）

---

## 5. 未完成但优先级高的阶段

### Phase 16 - 上传链生产化
优先级：**高**

#### 建议完成项
- 图片尺寸校验
- 图片大小 / 类型错误提示优化
- 统一图片替换与删除策略
- 更清晰的本地文件生命周期管理
- 视情况补“封面唯一”规则

### Phase 17 - 后台体验继续增强
优先级：**中高**

#### 建议完成项
- 预约列表与详情联动体验优化
- 操作反馈更清晰
- 内容页交互状态更明确
- 表单保存成功/失败提示增强

### Phase 18 - 部署联调
优先级：**高**

#### 必做项
- 环境变量校验
- Prisma migration / seed 流程确认
- Docker / Nginx / MySQL 联调
- 上传目录持久化策略
- 生产环境访问路径检查

### Phase 19 - 上线前质量检查
优先级：**高**

#### 建议完成项
- SEO 检查
- 上传资源访问检查
- 后台关键流程回归测试
- 预约闭环回归测试
- 默认账号与默认密码检查

---

## 6. 明确不建议现在优先做的内容

当前不建议优先投入：
- 多门店体系
- 复杂会员体系
- 在线支付
- 复杂权限矩阵
- CRM / ERP 大扩展
- 高复杂度自动排班

原因：这些都不是当前上线 MVP 的关键路径。

---

## 7. 推荐接手顺序

如果你今天第一次接手这个项目，建议按这个顺序：

1. 读 `README_CN.md`
2. 读 `ARCHITECTURE.md`
3. 读 `ROADMAP.md`
4. 读 `DEVELOPMENT_LOG.md`
5. 读 `HANDOFF.md`
6. 读 `PROJECT_STATUS.md`
7. 再进入代码

---

## 8. 推荐先看的代码文件

### 上传链 / 内容链
- `src/app/api/admin/upload/route.ts`
- `src/app/api/admin/content/route.ts`
- `src/app/admin/content/page.tsx`
- `src/components/admin/ContentEditor.tsx`

### 预约链
- `src/app/api/admin/appointments/route.ts`
- `src/app/api/admin/appointments/[id]/route.ts`
- `src/app/admin/appointments/page.tsx`
- `src/app/admin/appointments/[id]/page.tsx`

### 服务管理
- `src/app/admin/services/page.tsx`
- `src/app/admin/services/[id]/page.tsx`

---

## 9. 当前主要风险

1. 上传链还不是最终生产形态
2. 图片元数据处理还不完整
3. 后台交互体验还可继续抛光
4. 部署链还没最终联调收口
5. 仍需一次更系统的上线前检查

---

## 10. 文档维护规则

以后每个阶段都要做到：
- 开发前：更新阶段目标（可选）
- 开发后：更新 `DEVELOPMENT_LOG.md`
- 里程碑变化：更新 `PROJECT_STATUS.md`
- 接手方式变化：更新 `HANDOFF.md`
- 功能面变化：更新 `README_CN.md`

不要只在聊天里汇报阶段进展。
**仓库内文档必须能独立表达项目状态。**
