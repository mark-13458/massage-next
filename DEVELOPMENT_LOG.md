# DEVELOPMENT_LOG.md

# massage-next 开发阶段日志

> 目的：持续记录每一阶段做了什么、为什么这么做、当前状态、下一步建议。
> 
> 交接原则：以后每推进一个明确阶段，都要先更新这个文件，再做提交或阶段汇报。

---

## 文档使用规则

### 每个阶段至少记录
- 阶段编号 / 名称
- 本阶段目标
- 关键改动
- 影响范围
- 验证结果
- 已知遗留问题
- 下一阶段建议

### 推荐配套动作
1. 代码完成
2. 本文件追加阶段记录
3. 如涉及架构/流程变化，同步更新 `README_CN.md` / `ROADMAP.md` / `ARCHITECTURE.md`
4. 运行 build / 关键测试
5. git commit

---

## Phase 1 - 架构落地与基础骨架

### 目标
让项目从初始骨架进入可持续开发状态。

### 已完成
- 明确项目方向：Next.js 单体架构，前台双语（de/en），后台中文。
- 新增 `ARCHITECTURE.md` 与 `ROADMAP.md` 作为架构与路线基线。
- 重构基础目录，补齐 `src/lib`、`src/server/services` 等基础层。
- 建立基础国际化消息文件：`src/messages/de.json`、`src/messages/en.json`。
- 前台首页骨架、通用布局、Header/Footer、基础 section 组件落地。
- 后台中文骨架落地。

### 验证
- 本地 `npm run build` 通过。

### 阶段结论
项目脱离“空仓库/原型试验”状态，进入可连续迭代阶段。

---

## Phase 2 - 数据模型升级

### 目标
让数据库真正支撑官网、预约、内容、图库、后台运营。

### 已完成
- Prisma schema 扩展并升级。
- 新增/增强枚举：`UserRole`、`AppointmentStatus`、`AppointmentSource`、`FileKind`。
- 扩展模型：
  - `Service`
  - `Appointment`
  - `File`
  - `SiteSetting`
  - `BusinessHour`
  - `FaqItem`
  - `Testimonial`
  - `GalleryImage`
  - `EmailLog`
- 新增 `prisma/seed.js` 与 `db:seed` 初始化能力。

### 验证
- schema 已能支撑前台内容与后台管理主流程。
- seed 可初始化管理员、服务、FAQ、Hero、营业时间、联系方式等基础数据。

### 阶段结论
数据层从“演示级”提升到“运营级雏形”。

---

## Phase 3 - 前台官网核心页面

### 目标
先把品牌门面、信任感和预约转化链搭起来。

### 已完成
- 前台核心页面成形：
  - `/[locale]`
  - `/services`
  - `/booking`
  - `/about`
  - `/contact`
  - `/gallery`
- 页面内容开始数据化，不再完全依赖硬编码文案。
- 已补基础 SEO 文件：`robots.txt`、`sitemap.xml`。

### 验证
- 多轮 `npm run build` 稳定通过。

### 阶段结论
前台已具备可展示、可访问、可继续打磨的完整门面。

---

## Phase 4 - 预约 API 闭环

### 目标
打通“用户提交预约 → 后台可处理”的真实业务链。

### 已完成
- 落地 `POST /api/booking`。
- 完成预约基础入库链路。
- 前台预约入口已与后端流程衔接。
- 为后台预约管理打下数据基础。

### 阶段结论
预约功能从页面展示升级为真实业务入口。

---

## Phase 5 - 后台登录保护

### 目标
建立真实可用的后台入口，而不是裸露管理页面。

### 已完成
- 落地 `/admin/login`。
- 接入登录/退出 API。
- 使用签名 cookie session。
- 接入 `middleware` 对后台页面进行保护。

### 阶段结论
后台从“原型界面”升级为“受保护管理系统”。

---

## Phase 6 - 后台预约管理

### 目标
让店主/管理员可以实际处理预约。

### 已完成
- 后台预约列表页。
- 状态筛选。
- 状态修改。
- 内部备注。
- 预约详情页。
- 后续又补上快捷操作能力。

### 当前能力
管理员已可完成基础预约工作流：查看、确认、完成、取消、标记爽约。

### 阶段结论
后台预约模块已具备最小可运营价值。

---

## Phase 7 - 服务管理

### 目标
让后台可维护服务项目，而不是手改数据库或代码。

### 已完成
- 服务列表。
- 上下架控制。
- 精选状态。
- 排序字段。
- 新建服务。
- 编辑服务。
- 删除服务。
- 对“存在关联预约的服务”加删除保护。

### 阶段结论
服务管理已形成完整 CRUD 闭环，并具备基本业务保护。

---

## Phase 8 - 网站内容管理

### 目标
把网站基础运营内容也纳入后台维护。

### 已完成
- `contact` 内容管理。
- `hours` 营业时间管理。
- `FAQ` 增删改。
- `Hero` 文案管理。
- `gallery` 条目管理。

### 阶段结论
后台开始具备“运营后台”特征，不再只是预约工具。

---

## Phase 9 - 图库上传 MVP

### 目标
让管理员可以上传真实图片，而不只是填外链 URL。

### 已完成
- 后台 gallery 图片上传到 `public/uploads`。
- 上传后自动创建 `File + GalleryImage`。
- 内容管理页已可直接维护图库内容。

### 阶段结论
图片资源链首次打通，网站开始具备真实内容资产管理能力。

---

## Phase 10 - 仓库整理与版本化准备

### 目标
把项目推进到适合正式提交与协作的状态。

### 已完成
- 本地仓库已连接远端：`https://github.com/mark-13458/massage-next.git`
- 补全 `.gitignore`，忽略：
  - `.next/`
  - `node_modules/`
  - `.env*`
  - `public/uploads/`
- README_CN 已更新为反映真实项目进度，而不是早期骨架说明。

### 阶段结论
项目具备了多人协作、阶段提交与交接基础。

---

## Phase 11 - 预约详情工作台增强

### 目标
让后台预约详情页更接近真实工作台，而不是只看信息。

### 已完成
- 预约详情页增强。
- 可直接执行：确认、完成、取消、爽约等快捷动作。
- 后台处理路径更短，减少来回跳转。

### 阶段结论
预约管理体验明显增强，更符合运营使用习惯。

---

## Phase 12 - 上传链从单点能力走向资源流

### 目标
把图片上传从“单次上传”推进到“可维护内容资产”的方向。

### 已完成
- 持续打磨内容页与图库上传体验。
- 为 Hero / Gallery 共用上传能力做铺垫。

### 阶段结论
上传链具备继续抽象和统一的基础。

---

## Phase 13 - 内容后台可运营化增强

### 目标
让 `/admin/content` 从编辑表单升级为更完整的运营界面。

### 已完成
- Hero、FAQ、联系方式、营业时间、gallery 管理继续增强。
- 内容管理开始兼顾文本与图片资源。

### 阶段结论
内容后台已具备持续可用雏形。

---

## Phase 14 - Hero 图片上传 + 上传资源清理

### 目标
把上传链再做实一层：
1. Hero 不再只填 URL，支持直接上传图片。
2. 删除图库条目时，连同落盘文件一起清理。
3. 上传 API 具备通用化能力。

### 已完成
#### 1) 通用图片上传 API
- 已升级：`POST /api/admin/upload`
- 通过 `usage` 区分上传用途：
  - `usage=gallery`
  - `usage=hero`

#### 2) Hero 图片上传
- `/admin/content` 已新增 Hero 图片上传入口。
- 上传成功后会自动更新：`hero.imageUrl`。
- Hero 不再依赖手填 URL。

#### 3) Gallery 删除时清理本地文件
- 已增强：`PATCH /api/admin/content`
- 删除 Gallery 条目时，后端会：
  1. 找到对应 `GalleryImage`
  2. 找到关联 `File`
  3. 若 `filePath` 为本地 `/uploads/...`
  4. 尝试删除 `public/uploads` 中的实体文件
  5. 再删除数据库中的 `File` 记录

#### 4) 内容页当前能力
- Hero：文案编辑、URL 手填、图片上传
- Gallery：图片上传、URL 条目、条目编辑、条目删除、删除时清理本地文件

### 验证
- `npm run build` 已成功通过。

### 阶段结论
项目从“可改文本”继续升级到“可维护图片资源资产”。

### 当前遗留缺口
1. 上传文件更多元数据处理（宽高、压缩、尺寸校验）
2. 更正式的图片管理（替换、批量上传、封面约束）
3. 权限体系仍为基础 admin session
4. 部署联调仍未收口

---

## Phase 15 - 上传链收尾（第一轮）+ 文档化交接体系

### 目标
1. 继续补齐上传链里最容易遗留垃圾文件的环节。
2. 让项目文档不依赖聊天记录，也能支撑别人快速接手开发。

### 已完成
#### 1) Hero 替换旧图清理
- 已增强：`PATCH /api/admin/content`
- 当 Hero 图片 URL 被替换时：
  - 若旧值是本地 `/uploads/...` 文件
  - 后端会尝试删除 `public/uploads` 下对应旧文件
- 这样 Hero 上传不再只“新增文件”，而开始具备基本回收能力。

#### 2) 上传接口输入约束增强
- 已增强：`POST /api/admin/upload`
- 新增 `usage` 白名单校验：
  - `hero`
  - `gallery`
- 新增图片 MIME 白名单校验：
  - `image/jpeg`
  - `image/png`
  - `image/webp`
  - `image/gif`
- 避免错误用途参数或非预期图片类型直接进入上传流程。

#### 3) 项目交接文档体系建立
- 已新增：
  - `DEVELOPMENT_LOG.md`
  - `HANDOFF.md`
  - `PROJECT_STATUS.md`
- 并同步更新：
  - `README_CN.md`
  - `README.md`

### 文档职责划分
- `DEVELOPMENT_LOG.md`：阶段性开发日志（做了什么、为什么、验证、遗留问题、下一步）
- `PROJECT_STATUS.md`：项目总览（已完成 / 进行中 / 未完成）
- `HANDOFF.md`：新开发者快速接手指南

### 验证
- 本阶段完成后需要重新跑 `npm run build` 验证。

### 阶段结论
项目不只是在补功能，也开始具备更清晰的维护与交接结构。

### 当前仍未完成
1. 图片尺寸校验
2. 更完整的图片元数据处理（width / height）
3. 更统一的替换 / 删除策略
4. 部署联调与上线前验证

### 本阶段追加推进（继续中）
#### 4) 前端上传前校验
- 已在 `ContentEditor` 中增加前端上传前校验。
- 当前会在上传前检查：
  - 文件类型是否为 JPG / PNG / WEBP / GIF
  - 文件大小是否超过 10MB
- 这样可以在请求发出前就给管理员明确反馈，减少无效上传。

#### 5) Docker 上传目录持久化修正
- 已更新 `docker-compose.yml`
- 为 `web` 服务补上：
  - `uploads_data:/app/public/uploads`
- 并在 `volumes` 中声明 `uploads_data`
- 同时更新 `.env.example` 中的 `UPLOAD_DIR` 注释与默认值，使其与容器内持久化路径保持一致。

#### 6) 部署文档纳入正式交接体系
- 已确认并纳入 `DEPLOYMENT_CHECKLIST.md`
- 该文件现在可作为：
  - 本地联调清单
  - 测试环境 smoke test 清单
  - 生产上线前检查清单

#### 7) 服务端图片尺寸读取与最低尺寸校验
- 已增强：`POST /api/admin/upload`
- 服务端现在会读取上传图片宽高，并写入 `File.width` / `File.height`。
- 已新增最低尺寸要求：
  - Hero：至少 `1200x600`
  - Gallery：至少 `600x400`
- 如果尺寸不满足，上传会直接被拒绝并返回明确错误。
- 当前实现支持读取：JPEG / PNG / GIF / WEBP 的基础尺寸信息。

#### 8) 前端上传提示同步增强
- 后台内容页现在会在上传前提示：
  - Hero 将由服务端继续校验最低尺寸 `1200x600`
  - Gallery 将由服务端继续校验最低尺寸 `600x400`
- 这样管理员更容易理解为什么图片会在服务端被拒绝。

#### 9) Gallery 封面唯一性约束
- 已增强 gallery 逻辑：同一时间只允许一张图片处于 `isCover=true`。
- 后端：
  - 上传新 gallery 图片且标记为封面时，会先取消已有封面。
  - 内容管理保存时，会将最终封面收敛为单条记录。
- 前端：
  - 内容页将封面勾选显示为“封面（仅一张）”。
  - 当管理员勾选一张图为封面时，前端会自动取消其他条目的封面状态。

#### 10) 后台反馈体验增强
- 内容保存现在会区分：处理中 / 成功 / 失败 三种反馈状态。
- Hero / Gallery 上传反馈现在会区分信息级、成功级、错误级提示。
- 上传成功后，提示文案会带出图片尺寸（如 `1200×800`），让运营人员更容易确认上传结果。
- 这样后台内容页不再只是“点了按钮等结果”，而是开始具备更明确的状态反馈。

### 阶段判断更新
本阶段已经不只是“补上传功能”，而是开始同时推进：
- 上传链可靠性
- 上传资源质量门槛
- 内容运营约束完整性
- 后台可用性体验
- 部署可用性
- 交接可维护性

#### 11) 预约后台反馈体验对齐
- 已增强：`AppointmentQuickActions`
  - 快捷操作现在会显示：处理中 / 成功 / 失败 三态反馈。
  - 操作成功后会提示页面已刷新。
- 已增强：`AppointmentStatusControls`
  - 状态修改与内部备注保存也采用统一反馈模式。
  - 成功后会自动刷新页面，保持列表与详情状态一致。
- 这样内容后台与预约后台的交互体验开始对齐，减少运营人员理解成本。

#### 12) 预约状态可视化增强
- 已在预约列表页补充状态徽标（badge），不同状态使用不同视觉颜色。
- 已在预约详情页顶部与“状态处理”卡片中显示当前状态徽标。
- 列表页的“状态操作”列已升级为“当前状态 / 操作”，信息层级更清晰。
- 这样后台预约模块从“能改状态”进一步升级到“能快速识别状态”。

#### 13) 本地生产模式部署测试（非 Docker）
- 已使用本地生产模式启动测试：`next start`。
- 测试结果：
  - `/de` 可访问（HTTP 200）
  - `/admin/login` 可访问（HTTP 200）
  - `/robots.txt` 可访问（HTTP 200）
- 同时发现两个部署侧关键信号：
  1. 当前项目存在 `output: standalone` 配置，`next start` 会提示：应改用 `node .next/standalone/server.js`。
  2. 本地生产模式下数据库不可达：`127.0.0.1:3307` 无法连接，导致 Prisma 查询报错。
- 这说明：
  - 前端产物本身可以启动
  - 关键页面路由可以响应
  - 但数据库依赖仍需本地 MySQL / Docker MySQL / 远端库接通后，才能完成完整业务联调

#### 14) Docker 启动方式与构建上下文优化
- 已新增 `.dockerignore`，把构建上下文中的高体积无关内容排除。
- 实测 Docker build context 已从接近 `500MB` 降到约 `5KB` 级别，构建效率明显改善。
- 已重写 `Dockerfile`：
  - 由 `npm start` 切换为 `node server.js`
  - 直接使用 `.next/standalone` 产物启动
  - 运行镜像改为 `node:20-bookworm-slim`
- 已重新执行 `docker compose up -d --build`。
- 回归验证结果：
  - `massage-mysql` healthy
  - `massage-web` up
  - `massage-nginx` up
  - `http://127.0.0.1` 返回 `200`
  - `http://127.0.0.1/admin/login` 返回 `200`
  - `http://127.0.0.1/api/healthz` 返回 `{"status":"ok"}`
- 当前 `massage-web` 日志中已不再出现 `next start` 与 standalone 不匹配的警告。
- 在继续做 Docker 业务 smoke test 时又发现：Prisma 5.9 在 `node:20-bookworm-slim` 运行镜像里会因 `libssl.so.1.1` 缺失而报错，导致页面可访问但所有依赖 Prisma 的业务 API 会 500。
- 因此已继续调整 Docker 基座，改为更兼容 Prisma 5.9 的 Debian 变体以修复运行时依赖问题。
- 经过切换到 `node:20-bullseye-slim` 后，Prisma 运行时错误已消失，Docker 业务 API 恢复可用。

#### 15) Docker 业务 smoke test（登录 / seed / 预约）
- 已在 Docker 运行环境外，通过本机连接 `127.0.0.1:3307` 执行：
  - `prisma db push`
  - `npm run db:seed`
- 已验证后台登录：
  - `POST /api/admin/login` 返回 `{"status":"ok"}`
  - 登录后访问 `/admin` 返回 `200`
- 已验证预约提交：
  - 先从数据库读取真实 `Service.id`
  - 再调用 `POST /api/booking`
  - 返回 `{"status":"ok", ...}`
- 已验证数据库写入：
  - `Appointment` 表中出现新预约记录，状态为 `PENDING`

### 当前结论更新
Docker 部署当前已经不只是“页面能打开”，而是：
- 容器能正常启动
- 健康检查正常
- 后台登录正常
- 数据库初始化正常
- 预约业务写入正常

#### 16) 内容链清理闭环修正（进行中）
- 在继续做内容后台 / 上传清理 smoke test 时，发现两个真实边界问题：
  1. 发送空对象 `hero: {}` / `contact: {}` 时，接口会被当成有效更新处理。
  2. Gallery 删除与 Hero 替换清理链需要更稳地避开“空 payload 干扰”。
- 因此已调整 `PATCH /api/admin/content`：
  - 只有当 `contact` / `hero` 真正带字段时才执行更新。
  - Gallery 删除时先校验记录存在，再做删除与文件清理。
- 同时又定位到前端真实问题：
  - `ContentEditor` 在删除 FAQ / Gallery 条目时，会直接把带 `_delete` 标记的项从 state 过滤掉。
  - 这会导致保存时后端根本收不到删除意图。
- 因此已继续修正前端：
  - 删除项保留在 state 中，但从界面渲染中过滤隐藏。
  - 保存时仍会把 `_delete` 条目提交给后端。
- 这一轮修正的目标是把“上传成功”进一步推进到“替换/删除也真正形成闭环”。
- 已完成回归验证：
  - Gallery 删除后，数据库中的 `GalleryImage` / `File` 记录已清除。
  - 对应 `public/uploads/...` 文件已删除。
  - Hero 替换后，旧 Hero 图片文件已被清理，仅保留最新图片。
- 同时已建立 `TEST_ARTIFACTS.md`，用于标注当前根目录中的 smoke test 临时文件，并通过 `.gitignore` 将其排除出版本库。
- 在继续执行方案 A（上线前质量收口）时，又收口了一项明确问题：
  - `robots.txt` 与 `sitemap.xml` 中原本写死了 `https://example.com`
  - 现已改为从 `APP_URL` 动态生成，避免上线后忘记替换占位域名
- 同时也修正了一个构建边界问题：
  - SEO 路由不能依赖会强制要求 `DATABASE_URL` 的 `env.ts`
  - 现已改为直接读取 `process.env.APP_URL`，避免在构建 `sitemap.xml` 时误触发数据库环境变量校验
- 已完成方案 A 的继续验证：
  - FAQ / 营业时间内容更新成功
  - `robots.txt` / `sitemap.xml` 返回正常
  - 浏览器实际打开前台首页、图库页、后台页面，未见明显渲染异常
  - SEO 占位域名已从 `example.com` 收口到 `APP_URL`

#### 17) 后台访问控制 P0 修复
- 已重新严谨验证后台访问控制：
  - 使用无 cookie 的 `curl` 请求确认，之前 `/admin`、`/admin/content`、`/admin/appointments` 确实会直接返回 `200`。
- 根因不是 middleware 文件缺失，而是：
  - 后台页面被静态优化 / 缓存后，页面本身没有服务端二次鉴权兜底。
- 已修复策略：
  - 在所有后台页面中接入 `getCurrentAdmin()` 服务端检查。
  - 未登录时直接 `redirect('/admin/login')`。
  - 后台页面显式设置：
    - `export const dynamic = 'force-dynamic'`
    - `export const revalidate = 0`
- 已完成回归验证：
  - 无 cookie 请求 `/admin` → `307 /admin/login`
  - 无 cookie 请求 `/admin/content` → `307 /admin/login`
  - 无 cookie 请求 `/admin/appointments` → `307 /admin/login`
- 说明后台页面级访问控制现在已经真正生效。

#### 18) 后台模板化改造（B1 第一版）
- 已开始按“换壳不换核”的方向改造后台。
- 本轮先不动业务 API，不改 Prisma 和核心工作流，只升级后台外壳：
  - `AdminShell` 已从顶部按钮导航升级为侧边栏 + 顶部工作区头部。
  - `AdminTopSummary` 已升级为更成熟的 dashboard 概览卡片风格。
  - Dashboard 页面已同步适配新的视觉结构。
  - 服务管理页已接入新的 section card / empty state / 反馈样式。
  - 内容管理页已升级为“内容工作台 + 右侧状态/预览面板”的布局。
  - `ContentEditor` 内部各区块（Hero / Contact / Hours / FAQ / Gallery）已开始统一为更成熟的卡片式后台结构。
- 已完成回归：
  - `npm run build` 通过
  - Docker 重建通过
  - 浏览器与 HTML 检查确认 services/content 新结构已经实际生效
- 当前方向是：
  - 先把后台做成更像成熟运营系统的工作区
  - 再逐页替换预约、服务、内容页面的视觉壳子与交互结构

#### 19) 后台双语切换 + 系统设置 + 密码修改
- 已为后台新增独立语言层：`src/lib/admin-i18n.ts`
- 已接入后台语言切换按钮：`中文 / English`
- 语言偏好通过 cookie 持久化：`/api/admin/preferences/language`
- 已新增后台系统设置页：`/admin/settings`
- 已新增系统设置 API：`GET/PATCH /api/admin/settings`
- 当前已支持保存：
  - 网站名称
  - 后台通知邮箱
  - 默认前台语言
  - 后台默认语言
  - 时区
  - 货币
  - 预约说明（中 / 英）
- 已新增管理员修改密码功能：
  - 页面组件：`AdminPasswordForm`
  - 接口：`POST /api/admin/password`
- 已将双语能力接入到以下后台模块：
  - `AdminShell`
  - `AdminTopSummary`
  - 登录页 / 登录表单
  - Dashboard
  - 预约列表 / 预约详情
  - 服务列表 / 新建服务 / 编辑服务
  - 删除服务按钮
  - 系统设置页
- 当前判断：后台已经从“中文单页后台”升级为“可切换中英的运营后台雏形”，同时具备基础系统设置与账号安全入口。

### 本阶段验证
- `npm run build` 已再次通过。

### 当前遗留
1. `ContentEditor` 内部仍有部分占位文案是技术字段名（如 DE / EN 占位），后续可继续细化成人类可读文案。
2. `AppointmentStatusControls` 中状态选项仍显示枚举值，后续可继续做更友好的本地化标签。
3. 系统设置中的预约说明目前只真正驱动英文预约页，德语页仍使用默认文案，需要下一轮把字段收口为 de/en。
4. 通知模板、站点名称、货币、时区还未全面贯穿前台和邮件/通知输出。

#### 20) 系统设置开始驱动前台 / 后台行为
- 已增强 `getSystemSettings()`，统一读取后台系统设置。
- 已增强后台语言读取逻辑：
  - 先读 `massage_admin_lang` cookie
  - 若不存在，则回退到系统设置中的 `adminDefaultLanguage`
- 已增强根路由 `/`：
  - 不再固定跳转 `/de`
  - 改为根据系统设置中的 `defaultFrontendLocale` 自动跳转到 `/de` 或 `/en`
- 已增强预约页：
  - 已开始读取系统设置中的预约说明字段
  - 当前英文页可直接被后台设置覆盖
- 已对 `ContentEditor` 做一轮关键双语化：
  - 保存提示
  - 上传提示
  - Hero / Contact / Hours / FAQ / Gallery 主要标题与操作按钮
  - 删除 / 上传 / 启用 / 封面 / 排序 / 保存等高频交互文案
- 已修正一个构建侧边界问题：
  - `getSystemSettings()` 在无 `DATABASE_URL` 场景下会直接返回 `null`
  - 避免静态构建阶段打印 Prisma 环境变量错误噪音

### 本阶段验证
- `npm run build` 已通过，且已消除本轮新增的 Prisma 构建噪音。

#### 21) 系统设置字段收口为前台一致的 de/en
- 已将预约说明字段从不一致命名逐步收口为：
  - `bookingNoticeDe`
  - `bookingNoticeEn`
- 为兼容旧数据，读取与保存时仍兼容历史字段：
  - `bookingNoticeZh`
- 当前效果：
  - 老数据不会立刻失效
  - 新数据会按 `de/en` 方向持续收口
- 已增强前台预约页：
  - 德语页读取 `bookingNoticeDe`
  - 英语页读取 `bookingNoticeEn`
- 已增强前台站点品牌展示：
  - `SiteHeader` 读取系统设置中的 `siteName`
  - `SiteFooter` 读取系统设置中的 `siteName`
- 这使得系统设置不再只是后台保存数据，而是开始真正影响前台品牌呈现与预约页说明。

### 本阶段验证追加
- `npm run build` 再次通过。

### 当前遗留更新
1. 前台联系信息 / 营业时间 / 货币已经开始接入关键页面，但仍未做到全站完全统一（如 contact 页、更多 CTA 区块、结构化数据）。
2. 预约说明字段已开始按 `de/en` 收口，但数据库中的历史值仍可能保留旧键，需要后续考虑一次性迁移脚本或后台保存后自动清洗。
3. `ContentEditor` 已完成一轮关键双语化，但仍可继续把占位文案和细节提示做得更自然。
4. 时区配置目前仍主要停留在设置层，尚未贯穿前台展示与预约相关时间逻辑。

#### 22) 系统设置继续驱动前台展示层
- 已增强 `BookingForm`：
  - 右侧联系卡现在支持读取 `contact` 设置
  - 右侧营业时间卡现在支持读取 `BusinessHour`
  - 服务下拉中的价格符号支持读取系统设置中的 `currency`
- 已增强首页 `ServiceCard` 使用：
  - 首页服务卡会接收系统设置中的 `currency`
  - 推荐标签已支持 locale 感知（`Empfohlen` / `Featured`）
- 已增强服务页 `ServiceCard` 使用：
  - 服务页价格显示会跟随系统设置中的 `currency`
- 已增强首页 contact / hours 模块：
  - 联系信息继续读取 `contact` 设置
  - 额外展示当前 `currency`
- 已增强 `SiteFooter`：
  - 联系方式读取 `contact` 设置
  - 营业时间读取 `BusinessHour`
  - 站点名称继续读取系统设置中的 `siteName`
- 当前结果：
  - 系统设置已经从“后台参数存储”进一步推进为“开始驱动前台品牌、联系信息、营业时间和价格展示”的控制中心。

### 本阶段验证追加
- `npm run build` 已通过。

#### 23) 后台安全配置增强：退出登录跳首页 + Turnstile 配置入口
- 已增强后台退出登录逻辑：
  - 点击“退出登录”后不再停留在后台接口返回状态
  - 现在会清空后台 session，并根据系统设置中的默认前台语言跳转到网站首页（`/de` 或 `/en`）
- 已在后台系统设置中新增 Cloudflare Turnstile 配置：
  - `cfTurnstileEnabled`
  - `cfTurnstileSiteKey`
  - `cfTurnstileSecretKey`
- 默认行为：
  - Turnstile 默认关闭
  - 未开启时，预约流程不受影响
- 已新增服务端 Turnstile 校验能力：
  - 新增 `src/lib/turnstile.ts`
  - 预约 API `POST /api/booking` 在开启 Turnstile 时会校验 token
- 已增强预约表单：
  - 当前先预留 `turnstileToken` 字段
  - 当后台开启 Turnstile 时才显示
  - 这样可以先把后台配置链和服务端校验链打通，后续再接真正的 Turnstile 前端小组件

### 当前遗留更新
1. Turnstile 已完成后台配置 + 服务端校验 + 前端 widget 接入，但仍建议后续补充更细的错误提示、过期提示和暗色主题适配。
2. contact 页面仍可进一步统一到系统设置驱动的完整展示范式。
3. `ContentEditor` 已完成关键双语化，但仍有部分 placeholder / 编辑提示可以继续润色得更自然。
4. 后台还可以继续扩展多管理员、角色权限、操作日志等更高级能力。

#### 25) 后台收口式完善：状态本地化 + 设置页模块化
- 已新增 `src/lib/admin-status.ts`
- 已将预约状态在后台中的显示从原始枚举值收口为可读文案：
  - `PENDING` → 待处理 / Pending
  - `CONFIRMED` → 已确认 / Confirmed
  - `COMPLETED` → 已完成 / Completed
  - `CANCELLED` → 已取消 / Cancelled
  - `NO_SHOW` → 爽约 / No-show
- 当前本地化已作用于：
  - 预约列表筛选标签
  - 预约列表状态 badge
  - 预约详情状态 badge
  - 状态下拉选择器
- 已增强系统设置页结构：
  - 拆分为 `站点基础信息` / `预约与文案设置` / `Cloudflare Turnstile / 验证码`
  - 右侧新增 `当前配置快照` 面板
- 当前效果：
  - 后台从“能配置”更进一步走向“信息结构清晰、可交接、接近正式运营后台”的状态。

### 本阶段验证追加
- `npm run build` 已通过。

#### 24) Turnstile 前端 widget 完整接入
- 已将预约表单中的临时 token 输入位替换为真实的 Cloudflare Turnstile widget。
- 技术实现：
  - `BookingForm` 使用 `next/script` 动态加载 `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit`
  - 前端在 widget 回调中接收 token
  - 提交预约时自动将 token 发给 `/api/booking`
- 当前链路已完整：
  - 后台系统设置中可配置启用开关、site key、secret key
  - 前台 booking 页可显示 Turnstile widget
  - 服务端预约 API 会校验 Turnstile token
- 默认行为仍保持安全且平滑：
  - 未开启 Turnstile → 完全不影响预约提交
  - 开启 Turnstile 但未正确配置 → 服务端会明确拒绝并返回错误

### 本阶段验证追加
- `npm run build` 已通过。

---

## 当前整体状态（截至 2026-03-13）

### 已具备
- 双语官网核心页面
- 基础 SEO 文件
- 预约 API 与后台处理链
- 中文后台登录保护
- 预约管理
- 服务管理
- 网站内容管理
- Gallery 上传
- Hero 上传
- Gallery 删除联动本地文件清理

### 当前判断
项目已经不是“官网原型”，而是：

> 一个可继续推进到上线版本的按摩店官网 + 后台运营系统雏形。

---

## 建议下一阶段

## Phase 15 - 上传链收尾 + 预约体验增强

### 建议目标 A：上传资源清理完善
- Hero 旧文件回收
- 统一图片删除策略
- 图片类型/大小/尺寸校验
- 上传反馈与报错信息增强

### 建议目标 B：预约交互增强
- 预约详情页补充更多快捷操作
- 预约列表与详情联动更顺滑
- 可视化状态反馈进一步提升

### 建议执行策略
优先做：
- **上传链收尾**（因为已经连续推进到这一步，继续做性价比最高）
- **预约详情增强**（因为这是最直接影响后台日常使用体验的模块）

---

## 交接备注

如果下一位开发者接手，请先读：
1. `README_CN.md`
2. `ARCHITECTURE.md`
3. `ROADMAP.md`
4. `DEVELOPMENT_LOG.md`（本文件）

然后重点检查：
- `src/app/admin/content/page.tsx`
- `src/app/api/admin/content/route.ts`
- `src/app/api/admin/upload/route.ts`
- `src/app/admin/appointments/[id]/page.tsx`
- `src/components/admin/*`

这样能最快理解当前项目推进到哪一步、哪些链路已经成形、哪些问题还没收尾。

#### 26) 后台上传/内容接口安全收口（服务端鉴权 + 文件类型稳定化）
- 已增强：`POST /api/admin/upload`
  - 接入 `getCurrentAdmin()` 服务端鉴权。
  - 未登录访问现在会返回 `401 Unauthorized`，避免绕过后台页面直接调用上传接口。
- 已增强：`PATCH /api/admin/content`
  - 同样接入 `getCurrentAdmin()` 服务端鉴权。
  - 未登录时不能直接修改 Hero / FAQ / Gallery / 联系方式等内容。
- 已增强上传文件落盘策略：
  - 不再依赖用户原始文件名的扩展名。
  - 改为根据 MIME 类型统一映射生成 `.jpg / .png / .webp / .gif`。
  - 这样可以减少“文件名伪装类型”与扩展名不一致带来的运维混乱。
- 已增强上传文件审计信息：
  - 新上传的 `File` 记录会写入 `uploadedById`。
  - 为后续做操作日志、资源追踪和多管理员体系留下基础。

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮没有推翻现有上传链，而是对上线前最关键的薄弱点做了低风险收口：
- 后台接口不再裸露
- 上传文件命名更稳定
- 文件记录开始具备上传人归属

### 下一步建议
1. 继续补上传链生产化：图片压缩 / 规范化导出 / 更完整 metadata。
2. 为后台关键写接口补统一限流或更明确的安全策略。
3. 把 `ContentEditor` 里剩余技术化 placeholder 继续润色成人类可读文案。

#### 27) 后台功能面补齐：独立图库管理页 `/admin/gallery`
- 已新增后台页面：`/admin/gallery`
- 当前定位不是替换内容工作台，而是补一个更适合运营巡检的图库总览页。
- 本轮已实现：
  - 独立展示全部图库图片
  - 显示封面状态 / 启用状态 / 排序 / 尺寸 / 资源来源
  - 区分本地上传资源与外部/历史资源
  - 提供统计面板：全部图片、启用图片、封面数量、本地上传数量
  - 提供跳转入口回到 `/admin/content` 继续做上传、替换和编辑
- 已同步增强后台侧边导航：
  - 新增“图库管理 / Gallery”入口
- 当前效果：
  - 后台功能面从“内容管理里顺带有图库”提升为“图库作为独立运营模块可查看、可巡检”。

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这轮属于后台能力完善，而不是大改架构：
- 没有推翻现有内容链
- 但明显补全了后台模块完整度
- 让图库从长表单的一部分，提升为独立可管理视图

### 下一步建议
1. 继续为 `/admin/gallery` 补筛选、快速状态切换、封面快捷设置。
2. 再回到上传链，补图片压缩与更正式的 metadata 处理。
3. 继续优化后台文案与操作反馈，让非技术运营人员更容易理解。

#### 28) 后台写接口进一步收口 + 图库页筛选
- 已增强以下 admin 写接口的服务端鉴权：
  - `POST /api/admin/services`
  - `PATCH /api/admin/services/[id]`
  - `DELETE /api/admin/services/[id]`
  - `PATCH /api/admin/appointments/[id]`
- 当前效果：
  - 这些接口现在与前面已收口的 upload / content / settings 等接口更一致
  - 未登录直接访问会返回 `401 Unauthorized`
  - 后台页面保护之外，接口层也开始形成真正的二次兜底
- 已增强 `/admin/gallery`：
  - 新增筛选视图：全部 / 启用中 / 已停用 / 封面 / 本地上传
  - 当前不急着做复杂前端状态，而是先用 URL 查询参数实现稳定筛选
  - 这样管理员在巡检图库时，不用手动翻完整列表

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这轮继续沿着“后台可运营”推进：
- 一方面补接口安全兜底
- 一方面提升图库模块的日常巡检效率
- 仍保持小步迭代，没有引入大规模重构

### 下一步建议
1. 继续给图库页补快速状态切换与封面快捷设置。
2. 继续补 admin 其余接口的一致化安全策略（如需要可统一抽象）。
3. 回到上传链生产化，做图片压缩 / 规范化导出 / 更完整 metadata。

#### 29) 图库管理页进入“可直接操作”阶段
- 已新增接口：`PATCH /api/admin/gallery/[id]`
  - 支持图库条目的快速状态修改
  - 支持把某一张图快速设为封面
  - 当设置新封面时，会自动取消其他条目的 `isCover`
  - 已接入服务端鉴权，未登录会返回 `401 Unauthorized`
- 已新增组件：`GalleryQuickActions`
  - 在图库列表卡片内直接提供：
    - 启用 / 停用
    - 设为封面
  - 操作后会显示成功/失败反馈，并刷新当前列表
- 已增强 `/admin/gallery`
  - 现在不只是“查看 + 筛选”
  - 已经可以在图库总览页直接完成高频运营动作

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮让图库模块从“巡检页面”升级为“可直接处理的运营页面”：
- 可以筛选
- 可以看状态
- 现在也可以直接改状态和设封面
- 后台功能面进一步接近真实可交付版本

### 下一步建议
1. 继续补图库删除快捷入口，减少来回跳转到内容工作台。
2. 补图片压缩 / 导出规范化，让上传链更接近生产质量。
3. 继续统一 admin API 的鉴权/错误返回风格，减少后续维护成本。

#### 30) 后台架构清晰化（不改前台、不推翻实现）
- 已新增后台架构文档：`ADMIN_ARCHITECTURE.md`
- 文档明确了后台继续沿用的单体模式边界：
  - 仪表盘（Dashboard）
  - 预约中心（Bookings）
  - 服务管理（Services）
  - 内容中心（Content）
  - 媒体资源（Media / Gallery）
  - 系统设置（Settings）
- 已明确内容中心与媒体资源分离：
  - 内容中心负责 Hero / FAQ / 联系方式 / 营业时间等站点内容
  - 媒体资源负责图片资产巡检与运营管理
- 已新增后台 repository 层：
  - `src/server/repositories/admin/dashboard.repository.ts`
  - `src/server/repositories/admin/content.repository.ts`
  - `src/server/repositories/admin/media.repository.ts`
- 已新增后台 service 层：
  - `src/server/services/admin-dashboard.service.ts`
  - `src/server/services/admin-content.service.ts`
  - `src/server/services/admin-media.service.ts`
- 已把现有后台页面逐步切换到 service 层：
  - `/admin`
  - `/admin/content`
  - `/admin/gallery`
- 当前策略不是重写，而是“小步替换页面中的 Prisma 直查”，让后台逐步从页面直连数据库，过渡到更稳定的 service / repository 分层。

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮的重点不在于新增更多功能，而在于把后台往“更好维护、更适合持续开发”的方向收口：
- 模块边界更清楚
- 内容与媒体责任更清晰
- 页面层、service 层、repository 层开始分开
- 没有改前台，没有推翻现有实现，也没有引入额外复杂度

### 下一步建议
1. 继续把 Bookings / Services / Settings 页面逐步迁移到同样的 service / repository 分层。
2. 为后台模块补统一的 view model 组织方式，减少页面层重复数据整形。
3. 再继续整理后台路由与组件体系，让每个模块更像稳定工作台而不是独立页面集合。

#### 31) 后台分层继续推进到 Bookings / Services
- 已新增后台 repository：
  - `src/server/repositories/admin/booking.repository.ts`
  - `src/server/repositories/admin/service.repository.ts`
- 已新增后台 service：
  - `src/server/services/admin-booking.service.ts`
  - `src/server/services/admin-service.service.ts`
- 已把以下页面切换到新的 service 层：
  - `/admin/appointments`
  - `/admin/appointments/[id]`
  - `/admin/services`
  - `/admin/services/[id]`
- 当前效果：
  - Dashboard / Content / Media / Bookings / Services 这些后台主线页面，已经开始统一采用“页面层 → service 层 → repository 层”的组织方式。
  - 页面层里的 Prisma 直查明显减少，模块边界更清晰。

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮没有继续扩展前台，也没有做大规模重写，而是继续按既定目标推进后台架构：
- 后台六大模块中，核心页面层的分层已经基本建立骨架
- 后续继续推进 Settings 与 view model 统一时，成本会更低
- 单体模式仍然保留，但可维护性已经开始明显提升

### 下一步建议
1. 继续把 Settings 模块也迁到 repository / service 分层。
2. 抽一层统一的 admin view model / mapper，减少页面内字段转换重复。
3. 继续整理后台组件体系，让各模块卡片、列表、工作台结构更统一。

#### 32) Settings 分层 + admin view model 开始落地
- 已新增后台 repository：
  - `src/server/repositories/admin/settings.repository.ts`
- 已新增后台 service：
  - `src/server/services/admin-settings.service.ts`
- 已新增后台 view model：
  - `src/server/view-models/admin/settings.vm.ts`
- 已把 `/admin/settings` 页面切到新的 service 层：
  - 页面不再自己直接读取 Prisma `siteSetting`
  - 改为通过 service + view model 获取稳定的 settings 结构
- 当前效果：
  - Settings 也进入与 Dashboard / Bookings / Services / Content / Media 一致的分层体系
  - 后台开始从“repository + service”进一步过渡到“repository + service + view model”的更清晰架构
  - 默认值、旧字段兼容、设置结构收口，不再散落在页面层
- 已同步更新 `ADMIN_ARCHITECTURE.md`：
  - 增加 `server/view-models` 层说明

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮继续沿着“更好维护、更适合持续开发”的目标推进，而不是增加额外复杂度：
- 后台六大模块的页面层分层已基本成型
- Settings 成为第一个明确引入 view model 的后台模块
- 这为后续继续统一 Bookings / Services / Content / Media 的 view model 打下了结构基础

### 下一步建议
1. 为 Bookings / Services / Media 补 view model 层，进一步减少页面层格式化逻辑。
2. 整理后台共享类型与 mapper，减少跨模块重复定义。
3. 继续统一后台工作台页面的 section / summary / list 结构，让运营体验更一致。

#### 33) Bookings / Services / Media 开始接入 view model 层
- 已新增后台 view model：
  - `src/server/view-models/admin/booking.vm.ts`
  - `src/server/view-models/admin/service.vm.ts`
  - `src/server/view-models/admin/media.vm.ts`
- 已把以下 service 层接上 view model：
  - `admin-booking.service.ts`
  - `admin-service.service.ts`
  - `admin-media.service.ts`
- 已把以下页面改为消费 view model 输出，而不是在页面层自行格式化原始 Prisma 数据：
  - `/admin/appointments`
  - `/admin/services`
  - `/admin/gallery`
- 当前效果：
  - 日期/时间/价格/尺寸/来源等显示字段开始从页面层迁出
  - 页面层更聚焦于“布局与交互”，而不是数据整形
  - 后台架构进一步从“service 层分层”推进到“service + view model 层分层”

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮继续严格围绕后台可维护性推进：
- 不碰前台
- 不推翻现有实现
- 不改数据库
- 只是把后台模块的展示数据组织方式进一步正规化

### 下一步建议
1. 继续抽共享的 admin formatter / mapper，减少不同 view model 间的重复逻辑。
2. 开始统一后台列表页和详情页的工作台结构，让模块间体验更一致。
3. 再回头收口 admin API 层的返回结构，使页面 / service / API 更统一。

#### 34) 抽共享 formatter，减少 view model 重复逻辑
- 已新增共享格式化层：
  - `src/server/view-models/admin/shared/formatters.ts`
- 当前已统一收口的格式化逻辑包括：
  - 德国日期格式
  - 德国日期时间格式
  - 时长展示
  - 欧元价格展示
  - 图片尺寸展示
  - 双语文本回退
  - 媒体来源识别（local / external）
- 已把以下 view model 切到共享 formatter：
  - `booking.vm.ts`
  - `service.vm.ts`
  - `media.vm.ts`
- 已同步更新 `ADMIN_ARCHITECTURE.md`：
  - 明确 `view-models/admin/shared/formatters.ts`
  - 预留未来的 `shared/mappers.ts`

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮没有扩展新业务，而是继续减少后台架构内部的重复劳动：
- view model 层更统一
- 后续扩展新后台模块时，不需要再重复写格式化逻辑
- 架构正在从“有分层”进一步推进到“分层内部也有复用秩序”

### 下一步建议
1. 开始统一后台列表页 / 详情页的工作台布局模式。
2. 继续抽共享的 admin mapper，减少不同 view model 之间字段映射重复。
3. 再整理 admin API 返回结构，让客户端交互层也更稳定。

#### 35) 开始统一后台工作台布局模式
- 已新增共享后台布局组件：
  - `src/components/admin/AdminPageToolbar.tsx`
  - `src/components/admin/AdminWorkspaceLayout.tsx`
- 组件职责：
  - `AdminPageToolbar`：统一列表页 / 详情页顶部操作条
  - `AdminWorkspaceLayout`：统一主内容区 + 侧边工作区的双栏工作台骨架
- 已开始接入这些页面：
  - `/admin/appointments/[id]`
  - `/admin/services`
  - `/admin/services/[id]`
  - `/admin/content`
- 当前效果：
  - 后台页面不再各自手写一套顶部操作区与双栏布局
  - 列表页 / 详情页 / 内容工作台的结构开始趋于一致
  - 这为后续继续统一 Dashboard / Settings / Media 页面提供了稳定骨架

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮继续围绕“后台更像运营系统”推进，而不是只修单页：
- 布局结构开始可复用
- 页面间的工作台感更一致
- 后续继续做组件统一、模块收口和 API 风格统一时，会更顺手

### 下一步建议
1. 继续把 Dashboard / Settings / Gallery 也收进统一工作台布局习惯。
2. 抽共享 admin mapper，减少 view model 层字段映射重复。
3. 统一 admin API 返回 envelope（status / data / error），让前后端交互更稳定。

#### 36) 开始统一 admin API 返回 envelope
- 已新增共享响应工具：
  - `src/lib/api-response.ts`
- 当前提供：
  - `apiOk(data)`
  - `apiError(error, status)`
- 已开始接入的高频 admin 写接口：
  - `POST /api/admin/services`
  - `PATCH /api/admin/services/[id]`
  - `DELETE /api/admin/services/[id]`
  - `PATCH /api/admin/appointments/[id]`
  - `PATCH /api/admin/gallery/[id]`
- 当前统一目标：
  - 成功：`{ status: 'ok', data: ... }`
  - 失败：`{ status: 'error', error: ... }`
- 已同步处理受影响客户端：
  - `GalleryQuickActions`
  - `ServiceForm`
  - `DeleteServiceButton`
- 当前效果：
  - admin API 不再每个接口各自定义成功返回结构
  - 客户端后续可以逐步减少接口特判
  - 页面 / service / API 三层开始向更稳定的契约靠拢

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮不是新增功能，而是继续压缩后台维护成本：
- API 层开始统一协议
- 客户端与服务端交互开始更可预测
- 后续再扩展更多后台接口时，可以沿用同一套 envelope 规范

### 下一步建议
1. 继续把 `settings / content / upload / login` 等 admin API 也逐步迁到统一 envelope。
2. 抽共享 admin mapper，进一步减少 view model 层重复。
3. 把 Dashboard / Settings / Gallery 继续收进统一工作台布局模式。

#### 37) 继续统一剩余高频 admin API envelope
- 已继续接入统一响应协议的后台接口：
  - `GET /api/admin/settings`
  - `PATCH /api/admin/settings`
  - `PATCH /api/admin/content`
  - `POST /api/admin/upload`
  - `POST /api/admin/login`
  - `POST /api/admin/password`
- 当前统一目标继续保持：
  - 成功：`{ status: 'ok', data: ... }`
  - 失败：`{ status: 'error', error: ... }`
- 已同步处理受影响的后台组件：
  - `AdminLoginForm`
  - `ContentEditor`
  - 其余设置/密码组件因本就只依赖 `json.error`，无需额外改动
- 当前效果：
  - admin 核心入口接口的协议开始明显一致
  - 上传 / 内容保存 / 登录 / 设置 / 密码修改这些高频后台操作，更适合后续继续抽客户端工具层

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮继续减少后台长期维护成本：
- 高价值 admin API 基本都在向统一 envelope 靠拢
- 页面与组件层后续更容易抽通用请求工具
- 后台架构开始同时在页面层、服务层、接口层三条线上收口

### 下一步建议
1. 抽共享 admin request helper，让客户端组件减少重复 fetch + error 处理。
2. 继续统一 Dashboard / Settings / Gallery 的工作台布局模式。
3. 抽共享 admin mapper，继续压缩 view model 层重复逻辑。

#### 38) 修复后台退出登录跳转 + 开始统一客户端请求层
- 已修复后台退出登录行为：
  - 之前通过 `<form action="/api/admin/logout">` 提交，浏览器可能停在 `/api/admin/logout`
  - 现在改为 `AdminLogoutButton` 客户端按钮：
    - 先 `POST /api/admin/logout`
    - 再 `router.push('/')`
  - 当前效果：退出后台后会回到网站首页，而不是停在 API 地址
- 已同步调整：
  - `POST /api/admin/logout` 改为统一返回 JSON envelope，而不是服务端 redirect
- 已新增共享客户端请求工具：
  - `src/lib/admin-request.ts`
- 当前已开始接入：
  - `AdminLogoutButton`
  - `AdminLoginForm`
- 当前目标：
  - 逐步减少后台客户端组件里重复的 `fetch + response.json + error` 模板代码

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮同时解决了一个实际体验 bug 和一个架构问题：
- 退出登录现在回网站首页，符合后台使用预期
- 客户端请求层开始具备统一入口，后续更容易继续收口后台交互逻辑

### 下一步建议
1. 继续把 `GalleryQuickActions / ServiceForm / Appointment* / Settings` 等组件迁到 `adminRequest`。
2. 继续统一 Dashboard / Settings / Gallery 的工作台布局模式。
3. 抽共享 admin mapper，继续压缩 view model 层重复逻辑。

#### 39) 扩大 `adminRequest` 覆盖范围，继续统一客户端交互层
- 已继续把后台高频交互组件迁到 `src/lib/admin-request.ts`：
  - `GalleryQuickActions`
  - `ServiceForm`
  - `AppointmentQuickActions`
  - `AppointmentStatusControls`
  - `AdminSettingsForm`
- 当前效果：
  - 这些组件不再重复写 `fetch + response.json + error` 模板逻辑
  - admin API envelope 统一后的收益开始真正落到客户端层
  - 后台客户端交互开始具备更明确的统一入口

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮继续围绕“后台更好维护、更适合持续开发”推进：
- 不是新增业务功能
- 而是继续消除后台交互层的重复模板代码
- 客户端与 API 契约变得更稳定、更容易持续扩展

### 下一步建议
1. 继续把 `ContentEditor / DeleteServiceButton / ServiceControls / AdminPasswordForm` 也迁到 `adminRequest`。
2. 统一 Dashboard / Settings / Gallery 的工作台布局模式。
3. 抽共享 admin mapper，继续压缩 view model 层重复逻辑。

#### 40) 基本收口后台客户端请求层
- 已继续把剩余高频后台组件迁到 `adminRequest`：
  - `DeleteServiceButton`
  - `ServiceControls`
  - `AdminPasswordForm`
  - `ContentEditor`
- 当前效果：
  - 后台主要交互组件大多已不再手写 `fetch + json + error` 模板
  - 上传、保存、删除、状态更新、设置修改、密码修改等核心后台操作，开始共享统一请求入口
  - 客户端交互层的维护成本进一步下降

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮不是扩业务，而是把后台客户端请求层基本整理成可复用结构：
- API envelope 有统一规范
- 客户端请求有统一入口
- 后续再扩后台功能时，交互层不需要重复搭脚手架

### 下一步建议
1. 继续统一 Dashboard / Settings / Gallery 的工作台布局模式。
2. 抽共享 admin mapper，继续压缩 view model 层重复逻辑。
3. 开始整理后台共享 section / summary / stat card 组件，让六大模块视觉和结构更一致。

#### 41) 继续统一 Dashboard / Settings / Gallery 的工作台骨架
- 已新增共享运营卡片组件：
  - `src/components/admin/AdminStatGrid.tsx`
  - `src/components/admin/AdminInfoList.tsx`
- 当前作用：
  - `AdminStatGrid` 统一后台统计卡片网格
  - `AdminInfoList` 统一后台信息列表展示
- 已进一步收口的后台页面：
  - `/admin`（Dashboard）
  - `/admin/settings`
  - `/admin/gallery`
- 当前效果：
  - Dashboard 开始复用统一工作台骨架，不再单独手写一套双栏结构
  - Settings 的“当前登录信息 / 配置快照”开始复用共享信息列表组件
  - Gallery 的统计卡开始复用共享统计卡网格
  - 后台六大模块的页面结构和视觉骨架更加趋于一致

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮继续围绕“后台像一个完整运营系统”推进：
- 不再只是逻辑层统一
- 页面结构与视觉骨架也开始系统化
- 后续继续做共享 mapper / 共享 section / summary 组件时，基础已经更稳

### 下一步建议
1. 抽共享 admin mapper，继续减少 view model 层重复字段映射。
2. 继续统一 section / summary / stat card 组合模式，让六大模块页面更像同一套后台系统。
3. 开始检查后台文案、组件命名与模块目录是否还能进一步整理。

#### 42) 开始建立 shared admin mapper 层
- 已新增共享 mapper：
  - `src/server/view-models/admin/shared/mappers.ts`
- 当前已收口的重复逻辑包括：
  - `asRecord()`
  - `readString()`
  - `readNullableString()`
  - `readBoolean()`
  - `readEnum()`
- 已先接入 `settings.vm.ts`：
  - 设置 view model 不再自己手写一整套 record 解析与默认值逻辑
  - 默认值、布尔值和枚举解析开始复用共享 mapper
- 已同步更新 `ADMIN_ARCHITECTURE.md`：
  - 明确 shared mappers 不仅负责字段映射，还负责 record 读值、默认值、枚举解析等公共逻辑

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮继续在 view model 层内部做减法：
- 架构不只是“有 view model”
- 而是开始让 view model 本身也更可维护、更少重复
- 后续可以继续把 booking / service / media 的映射规则也逐步往 shared mapper 迁移

### 下一步建议
1. 继续把 booking / service / media 的字段读取和对象映射也逐步迁到 shared mapper。
2. 继续统一 section / summary / stat card 组合模式，让后台页面更像同一套系统。
3. 开始检查后台命名、目录结构和文案是否还能进一步收口。
