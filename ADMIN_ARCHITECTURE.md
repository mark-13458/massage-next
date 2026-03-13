# ADMIN_ARCHITECTURE.md

# massage-next 后台运营系统架构

> 目标：在现有 Next.js + Prisma + MySQL 单体架构基础上，把后台整理成边界清晰、易维护、易持续开发的运营系统。

---

## 1. 架构原则

### 保持不变
- 继续使用 **Next.js 单体模式**
- 继续使用 **Prisma + MySQL**
- 不引入复杂权限系统
- 不推翻现有页面与数据库
- 不拆成独立后端服务

### 持续优化方向
- 后台模块边界清晰化
- 组件体系统一化
- service / repository 分层
- 内容中心与媒体资源分离
- 后台路由结构更稳定
- 让每个后台模块都更像“运营工作台”，而不是零散页面集合

---

## 2. 后台模块边界

当前后台按以下运营模块划分：

### 2.1 仪表盘（Dashboard）
路由：`/admin`

职责：
- 运营概览
- 关键计数
- 当前后台工作台入口
- 模块路线与状态总览

### 2.2 预约中心（Bookings）
路由：
- `/admin/appointments`
- `/admin/appointments/[id]`

职责：
- 预约列表
- 状态筛选
- 快捷状态流转
- 内部备注
- 单条预约工作台

### 2.3 服务管理（Services）
路由：
- `/admin/services`
- `/admin/services/new`
- `/admin/services/[id]`

职责：
- 服务 CRUD
- 上下架 / 精选 / 排序
- 服务信息编辑

### 2.4 内容中心（Content）
路由：`/admin/content`

职责：
- Hero 文案
- 联系信息
- 营业时间
- FAQ
- 与前台内容直接相关的结构化内容编辑

说明：
内容中心负责“页面内容与站点文案”，不负责做媒体资源总览。

### 2.5 媒体资源（Media / Gallery）
路由：`/admin/gallery`

职责：
- 图库资源总览
- 图片状态筛选
- 封面巡检
- 本地上传资源查看
- 快捷启用/停用/设为封面

说明：
媒体资源模块负责“图片资产运营”，与内容中心分离。
内容中心可继续作为上传入口，但媒体资源页负责资源巡检与日常运营。

### 2.6 系统设置（Settings）
路由：`/admin/settings`

职责：
- 站点基础设置
- 后台偏好
- 管理员密码
- Turnstile / 验证码配置
- 运行时配置快照

---

## 3. 推荐目录分层

```txt
src/
├─ app/
│  ├─ admin/
│  │  ├─ page.tsx                    # 仪表盘
│  │  ├─ appointments/
│  │  ├─ services/
│  │  ├─ content/
│  │  ├─ gallery/
│  │  └─ settings/
│  └─ api/
│     └─ admin/
├─ components/
│  └─ admin/                         # 后台 UI 组件
├─ server/
│  ├─ repositories/
│  │  └─ admin/                      # 后台 repository 层
│  └─ services/
│     ├─ admin-dashboard.service.ts
│     ├─ admin-content.service.ts
│     ├─ admin-media.service.ts
│     └─ ...
└─ lib/
   ├─ auth.ts
   ├─ admin-i18n.ts
   └─ prisma.ts
```

---

## 4. 分层规则

### 4.1 app/admin 页面层
只负责：
- 路由入口
- 登录检查
- 调用 service
- 组装页面与组件

不要在页面层堆大量 Prisma 查询。

### 4.2 components/admin 组件层
只负责：
- 展示
- 交互
- 调用 admin API
- 用户反馈

不要把复杂数据库逻辑塞进客户端组件。

### 4.3 server/repositories/admin 数据访问层
只负责：
- Prisma 查询
- 数据读取/聚合的底层实现
- 为 service 提供可复用的数据获取能力

命名建议：
- `dashboard.repository.ts`
- `booking.repository.ts`
- `service.repository.ts`
- `content.repository.ts`
- `media.repository.ts`
- `settings.repository.ts`

### 4.4 server/services 后台业务层
只负责：
- 模块级数据组合
- 页面工作台所需 view model 组装
- 跨 repository 的组合逻辑
- 对页面暴露稳定接口

命名建议：
- `admin-dashboard.service.ts`
- `admin-booking.service.ts`
- `admin-service.service.ts`
- `admin-content.service.ts`
- `admin-media.service.ts`
- `admin-settings.service.ts`

---

## 5. 当前推荐演进顺序

### 第一优先级：模块边界清晰化
- Dashboard / Bookings / Services / Content / Media / Settings 明确分开
- Content 与 Media 分离职责
- 后台导航与文档统一按该边界组织

### 第二优先级：service / repository 分层
- 把后台页面里的 Prisma 查询逐步迁移到 repository
- 页面改为调用 service
- 保持小步替换，不做一次性重写

### 第三优先级：组件体系统一
- 统一 `AdminShell`
- 统一 `AdminSectionCard`
- 统一状态反馈、按钮风格、空状态组件、工作台布局

### 第四优先级：后台 API 风格统一
- 鉴权逻辑一致
- 错误返回风格一致
- 写接口与读接口边界清晰

---

## 6. 当前明确不做的事

- 不做复杂 RBAC / 多角色权限系统
- 不做后台微服务拆分
- 不改数据库主模型
- 不重写现有页面
- 不把前台一起重构

---

## 7. 最终目标

后台应该逐步从：

> 一组已经能工作的管理页面

演进为：

> 一个模块边界清晰、组件统一、数据访问可维护、适合持续开发的后台运营系统

关键标准：
- 好维护
- 好交接
- 好扩展
- 好运营
- 不引入无必要复杂度
