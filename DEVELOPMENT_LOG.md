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
1. 前台 `siteName` 已接入头尾，但联系信息 / 营业时间 / 货币 / 时区还未全面由系统设置驱动。
2. 预约说明字段已开始按 `de/en` 收口，但数据库中的历史值仍可能保留旧键，需要后续考虑一次性迁移脚本或后台保存后自动清洗。
3. `ContentEditor` 已完成一轮关键双语化，但仍可继续把占位文案和细节提示做得更自然。

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
