# Admin Module Guide

本目录承载 `massage-next` 的后台运营系统页面。

## 当前模块边界

- `page.tsx` → Dashboard（仪表盘）
- `appointments/` → 预约中心
- `services/` → 服务管理
- `content/` → 内容中心
- `gallery/` → 媒体资源 / 图库
- `settings/` → 系统设置
- `login/` → 后台登录

## 设计原则

1. **只整理后台，不改前台**
2. **继续沿用 Next.js 单体模式**
3. **页面层只负责路由、鉴权、布局、组装组件**
4. **数据读取尽量走 `src/server/services`**
5. **底层 Prisma 访问尽量走 `src/server/repositories/admin`**
6. **页面展示数据尽量走 `src/server/view-models/admin`**

## 页面层约定

### 列表页优先复用
- `AdminPageToolbar`
- `AdminListFrame`
- `AdminSectionCard`

### 详情页 / 工作台优先复用
- `AdminWorkspaceLayout`
- `AdminDetailBlock`
- `AdminInfoList`
- `AdminStatGrid`

## 不建议继续做的事

- 不要在页面里继续堆 Prisma 查询
- 不要让每个页面自己定义一套布局骨架
- 不要让 admin API 返回结构继续各自为政
- 不要在客户端组件里重复手写 fetch / json / error 模板

## 当前推荐继续推进方向

1. 继续统一后台文案与命名风格
2. 持续把新后台功能接入 shared layout / shared request / shared mapper
3. 优先让后台更易维护，而不是盲目加复杂功能
