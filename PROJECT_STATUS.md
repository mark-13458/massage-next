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
- 基础安全与隐私治理
- 简单可靠的部署

---

## 2. 当前开发结论（截至 2026-03-16）

项目已经从"官网原型"推进到：

> **可运营网站系统 + 完整预约生命周期管理 + 隐私合规体系**

也就是说：
- ✓ 已经不是静态展示站
- ✓ 已经有后台登录与运营模块
- ✓ 已经有预约管理与完整保护机制
- ✓ 已经有服务管理
- ✓ 已经有内容管理
- ✓ 已经有基础图片上传链
- ✓ 已经有审计日志与安全记录
- ✓ 已经有改约/取消安全链接
- ✓ 已经有邮件通知系统
- ✓ 已经有 GDPR 隐私合规机制

项目现在距离"可上线版本"只差：
1. 前台改约/取消 UI 页面
2. Docker 邮件配置与联调
3. 隐私页面法律文本

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

### ✅ 已完成：Phase 15 - 上传链收尾 + 交接文档完善
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
- Docker 部署验证已通过
- 内容链清理闭环已完成
- 前台 SEO metadata 已补齐
- 后台模板化改造已完成

### ✅ 已完成：Phase 16 - 预约安全与审计体系
- ✓ 审计日志表创建（AuditLog）
- ✓ 预约频率限制表创建（BookingFrequencyLimit）
- ✓ 登录尝试记录表创建（LoginAttempt）
- ✓ 审计日志服务实现（`audit.service.ts`）
- ✓ 预约防护服务实现（`booking-protection.service.ts`）
  - 手机号/邮箱/IP 三维度频率限制
  - 60 分钟时间窗口，每维度最多 3 次预约
- ✓ 管理员认证增强（`admin-auth.service.ts`）
  - 15 分钟内失败 5 次则锁定
- ✓ 审计日志查看器后台界面
- ✓ 系统设置页面增强
- ✓ 数据库迁移与部署指南

---

## 4. 当前正在推进的阶段

## 🚧 Phase 17 - 改约/取消流程与隐私合规（完成编码）

### 已完成项
- ✓ 改约/取消安全 token 链接生成与验证
- ✓ 改约/取消 API 路由实现
  - `GET /api/appointment/reschedule/[token]` - 验证改约
  - `POST /api/appointment/reschedule/[token]` - 执行改约
  - `GET /api/appointment/cancel/[token]` - 验证取消
  - `POST /api/appointment/cancel/[token]` - 执行取消
- ✓ 邮件通知系统
  - 预约确认邮件（含改约/取消链接）
  - 改约通知邮件
  - 取消通知邮件
  - 隐私通知邮件
  - 双语支持（德语/英语）
- ✓ 隐私与数据管理服务
  - 隐私同意记录
  - 数据删除请求与执行
  - 个人数据导出（GDPR）
  - 定期数据清理任务
  - 30 天 grace period（GDPR）
  - 6 个月数据保留期（可配置）
- ✓ 数据库扩展
  - Appointment 表新增 8 个字段
  - AppointmentAudit 表（改约/取消历史）
  - 完整迁移文件
- ✓ 改约历史追踪
  - 所有改约操作记录在 AppointmentAudit
  - 包含原始时间、新时间、原因等
- ✓ 完整文档与指南
  - `DEVELOPMENT_LOG.md` - Phase 17 详细记录
  - `PHASE_17_INTEGRATION_GUIDE.md` - 集成指南
  - `PHASE_17_CHECKLIST.md` - 验证清单
- ✓ 编译验证
  - TypeScript 编译无错误
  - 所有 API 路由正确注册
  - Path aliases 正确配置

### 优先级说明
| 优先级 | 项目 | 状态 |
|------|------|------|
| P0 | 改约/取消安全链接 | ✓ 已实现 |
| P0 | 邮件通知系统 | ✓ 已实现 |
| P0 | 隐私数据管理 | ✓ 已实现 |
| P1 | 前台 UI 页面 | ⧮ 下阶段 |
| P1 | Docker 邮件联调 | ⧮ 下阶段 |

### 当前还没做完
- [ ] 前台改约/取消 UI 页面（改为 Phase 18）
- [ ] Docker 邮件配置测试（改为 Phase 18）
- [ ] 隐私页面法律文本（改为 Phase 18）

---

## 5. 未完成但优先级高的阶段

### Phase 18 - 前台 UI 与邮件联调
优先级：**超高 (P0)**

#### 必做项
1. 前台改约/取消 UI 页面
   - 显示当前预约信息
   - 改约日期/时间选择器
   - 取消原因输入
   - 成功/失败提示

2. 邮件系统测试与监控
   - 后台邮件配置验证接口
   - 邮件发送日志查看
   - SMTP 连接测试

3. 隐私页面补全
   - Datenschutz (德语隐私政策)
   - Privacy Policy (英文隐私政策)
   - 数据导出说明
   - 删除请求流程说明

4. Docker 邮件联调
   - SMTP 配置加入 docker-compose.yml
   - 本地 Mailhog 测试
   - 生产 SMTP 配置文档

### Phase 19 - 上线前最终检查
优先级：**高**

#### 建议完成项
- 完整端到端测试（创建预约→确认→改约→取消）
- 邮件模板样式验证
- 隐私合规审核
- 性能基准测试
- 备份与恢复流程测试

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
2. 读 `ARCHITECTURE.md`（如有）
3. 读 `ROADMAP.md`（如有）
4. 读 `DEVELOPMENT_LOG.md` （了解每个阶段做了什么）
5. 读 `HANDOFF.md` （了解交接要点）
6. 读 `PROJECT_STATUS.md` （本文件，快速概览）
7. 读 `PHASE_17_INTEGRATION_GUIDE.md` （如要做 Phase 17 工作）
8. 再进入代码

---

## 8. 推荐先看的代码文件

### 改约/取消与隐私链（新增）
- `src/server/services/appointment-reschedule.service.ts`
- `src/server/services/email.service.ts`
- `src/server/services/privacy.service.ts`
- `src/app/api/appointment/reschedule/[token]/route.ts`
- `src/app/api/appointment/cancel/[token]/route.ts`
- `src/app/api/appointment/[appointmentId]/privacy/route.ts`

### 安全与审计链
- `src/server/services/audit.service.ts`
- `src/server/services/booking-protection.service.ts`
- `src/server/services/admin-auth.service.ts`
- `src/app/admin/settings/audit-logs/page.tsx`

### 上传链 / 内容链
- `src/app/api/admin/upload/route.ts`
- `src/app/api/admin/content/route.ts`
- `src/app/admin/content/page.tsx`

### 预约链
- `src/app/api/booking/route.ts`
- `src/app/admin/appointments/page.tsx`

---

## 9. 当前主要风险与下一步

| 风险 | 优先级 | 建议 |
|-----|------|------|
| 前台改约/取消 UI 缺失 | 🔴 高 | Phase 18 立即做 |
| 邮件配置未在 Docker 中测试 | 🔴 高 | Phase 18 联调 |
| 隐私页面法律文本缺失 | 🟠 中 | Phase 18 补齐 |
| 定期清理任务未配置 cron | 🟠 中 | Phase 18 配置 |
| 没有邮件失败告警 | 🟡 低 | Phase 19 优化 |

---

## 10. 部署与上线清单

```
✓ Phase 1-15：基础功能
✓ Phase 16：安全防护体系
✓ Phase 17：改约/取消与隐私
⏳ Phase 18：UI 与部署联调
⏳ Phase 19：上线前检查

距离上线还差：
- 前台 UI（1-2 天）
- Docker 联调（1 天）
- 隐私文本（1 天）
- 最终测试（1-2 天）

总计：3-5 天可上线
```

---

## 11. 文档维护规则

以后每个阶段都要做到：
- 开发前：更新阶段目标（可选）
- 开发后：更新 `DEVELOPMENT_LOG.md`
- 里程碑变化：更新 `PROJECT_STATUS.md`
- 接手方式变化：更新 `HANDOFF.md`
- 功能面变化：更新 `README_CN.md`

不要只在聊天里汇报阶段进展。
**仓库内文档必须能独立表达项目状态。**
