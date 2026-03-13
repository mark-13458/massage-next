# Admin Components Guide

后台组件按职责可分为 4 类。

## 1. Layout / Shell
负责后台页面骨架与工作台布局。

- `AdminShell`
- `AdminPageToolbar`
- `AdminWorkspaceLayout`
- `AdminSectionCard`
- `AdminListFrame`
- `AdminDetailBlock`

## 2. Summary / Info
负责指标卡片、信息展示、空状态。

- `AdminTopSummary`
- `AdminStatGrid`
- `AdminInfoList`
- `AdminEmptyState`

## 3. Preferences / Session
负责后台会话与偏好。

- `AdminLanguageSwitcher`
- `AdminLogoutButton`
- `AdminLoginForm`
- `AdminPasswordForm`
- `AdminSettingsForm`

## 4. Domain Actions
负责具体业务模块的交互。

- `AppointmentQuickActions`
- `AppointmentStatusControls`
- `ServiceControls`
- `ServiceForm`
- `DeleteServiceButton`
- `GalleryQuickActions`
- `ContentEditor`

## 使用原则

- 优先复用已有 layout / info 组件，不要每页新造一套骨架
- 新增后台交互优先接入 `adminRequest`
- 新增后台数据优先接入 admin service / repository / view model
- 如果组件同时负责布局 + 业务 + 请求，优先考虑拆分
