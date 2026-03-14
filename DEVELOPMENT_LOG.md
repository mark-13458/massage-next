# DEVELOPMENT_LOG.md

## 2026-03-14 - 阶段继续推进：图库与上传链 smoke
- 完成上传链实测：
  - `usage=gallery` 上传成功
  - 数据库成功创建 `File + GalleryImage`
  - 图片宽高元数据正确写入
  - `PATCH /api/admin/gallery/[id]` 可正常切换 `isActive` / `isCover`
  - `/admin/gallery` 页面可访问
- 发现并修复一个真实部署问题：上传成功后数据库里已有 `/uploads/...` 路径，但通过 `http://localhost/uploads/...` 访问返回 `404`。
- 根因定位：上传文件实际已写入共享 volume，但 `nginx` 没有直接为 `/uploads/` 提供静态文件服务，仍把请求交给 Next standalone，导致上传资源访问失败。
- 修复内容：
  - `docker-compose.yml` 为 `nginx` 挂载 `uploads_data:/var/www/uploads:ro`
  - `nginx/nginx.conf` 增加 `location /uploads/`，使用 `alias /var/www/uploads/` 直接提供静态文件
- 修复后复测通过：上传图片 URL 可返回 `200 OK`。
- Hero 上传链也已实测：
  - 800x600 图片会被 hero 最小尺寸校验（1200x600）正确拒绝
  - 1400x700 图片上传成功并返回 `imageUrl`
- 本阶段结论：上传链已从“能写库”推进到“写库 + 文件可访问 + 运营开关可切换”的可用状态。

## 2026-03-14 - 阶段继续推进：服务管理 + 内容管理 smoke
- 服务管理链路实测通过：
  - `PATCH /api/admin/services/[id]` 可正常更新名称、价格、时长、排序、精选、上下架状态
  - 有关联预约的服务删除会被正确拦截（返回 400）
  - 无关联预约的服务可正常删除
- 内容管理链路继续实测：
  - `PATCH /api/admin/content` 可成功更新 contact / hero / hours / faq 等核心内容
  - `weekday=1` 的营业时间已成功更新
  - FAQ 更新已成功落库
- 过程中发现一个真实健壮性问题：内容接口在处理 FAQ 时，若 payload 带了不存在的 FAQ id，会直接 `update()` 失败并导致整次保存报错。
- 修复内容：
  - FAQ 删除前先查存在性，不存在则跳过
  - FAQ 更新前先查存在性，不存在则跳过
  - `BusinessHour` 更新改为 `upsert`，避免缺记录时整次保存失败
- 额外做的预防性收口：`/api/admin/settings` 补上 `dynamic = 'force-dynamic'` 与 `revalidate = 0`，避免后续再出现后台配置接口被缓存为旧结果的问题。
- 本阶段结论：后台的服务管理与内容管理已经从“看起来有功能”推进到“核心增改删逻辑已被接口级 smoke 验证”。

## 2026-03-14 - 阶段继续推进：预约详情 / 状态流转 / 处理人链路实测
- 完成后台预约详情相关主链 smoke：预约详情页可访问、状态修改 API 可用、内部备注可保存、快捷操作底层 PATCH 路径已实测通过。
- 实测状态流转：
  - `PENDING -> CONFIRMED` 成功，`confirmedAt` 正确写入
  - `CONFIRMED -> COMPLETED` 成功，`completedAt` 正确写入
  - `COMPLETED -> CANCELLED` 成功，`cancelledAt` 正确写入
  - 内部备注在状态变更过程中可同步更新
- 发现并修复一个真实细节问题：虽然预约详情页展示了“处理人（Handled by）”，但状态流转 API 并没有写 `confirmedById`，导致该字段长期为空。
- 修复内容：在 `src/app/api/admin/appointments/[id]/route.ts` 中，当状态切为 `CONFIRMED` 时同步写入 `confirmedById = admin.id`。
- 修复后复测通过：再次确认预约后，数据库中的 `confirmedById` 已正确写入。
- 当前剩余注意点：状态时间戳目前不会在后续反向流转时自动清理（例如先 completed 再 cancelled 时会同时保留多个历史时间），这是可接受的历史留痕策略，但如果后续要更严格语义，可以再定义状态机规则。

## 2026-03-14 - 阶段继续推进：后台功能 smoke test + 预约接口修正
- 完成后台主链 smoke：管理员登录、系统设置读取/保存、服务创建、前台预约提交、后台预约读取均已实际打通。
- Smoke 结果确认：
  - `POST /api/admin/login` 成功，能拿到 `massage_admin_session` cookie
  - `GET/PATCH /api/admin/settings` 成功
  - `POST /api/admin/services` 成功创建 smoke service
  - `POST /api/booking` 成功创建预约并写入数据库
  - 数据库内确认 `Appointment` 已新增记录
- 过程中发现一个真实后台缺陷：`GET /api/admin/appointments` 会返回空数组，即使数据库中已有预约。
- 根因定位：该接口未显式声明动态渲染，且未做管理员鉴权，导致被缓存为旧静态结果并存在后台 API 越权风险。
- 修复内容：
  - 为 `src/app/api/admin/appointments/route.ts` 增加 `dynamic = 'force-dynamic'`
  - 增加 `revalidate = 0`
  - 增加 `getCurrentAdmin()` 鉴权，未登录返回 `401 Unauthorized`
- 修复后复测通过：
  - 已登录请求能正确返回最新预约列表
  - 未登录请求返回 `401`
- 本阶段价值：后台最核心的“登录 → 设置 → 服务 → 预约 → 后台看到预约”链路已从文档描述变成实测可用。

## 2026-03-14 - 阶段继续推进：Docker smoke 联调打通（web / mysql / nginx）
- 首次执行 `docker compose up -d --build` 失败，定位为 Docker Desktop / registry 元数据拉取瞬时中断，而不是项目代码构建失败；单独 `docker pull node:20-bullseye-slim` 后重试恢复正常。
- 完成容器级 smoke：镜像构建成功，`mysql` / `web` / `nginx` 三个服务均可拉起。
- 排查并修复 `web` healthcheck 失败：原因不是应用不可用，而是容器内对 `127.0.0.1:3000` 探活被拒绝；为 `web` 服务显式加入 `HOSTNAME=0.0.0.0` 后恢复正常。
- 排查并修复 `nginx` 502：原因是 upstream 解析到了旧 `web` 容器地址；将 `nginx.conf` 改为走 Docker DNS `resolver 127.0.0.11` + 变量式 upstream，并强制重建 `nginx` 后恢复正常。
- 最终 smoke 结果：
  - `docker compose ps` 显示 `mysql` healthy、`web` healthy、`nginx` running
  - `http://localhost/api/healthz` → `200 OK`
  - `http://localhost/admin/login` → `200 OK`
  - `http://localhost/de` → `200 OK`
- 这一阶段的价值是：项目已经从“理论上能部署”推进到“本机 Docker + Nginx 联调可用”。

## 2026-03-14 - 阶段继续推进：部署基线收口（环境变量 + Compose 健康检查）
- 统一 `UPLOAD_DIR` 默认值：将 `src/lib/env.ts` 从 `/app/uploads` 收口为 `/app/public/uploads`，与 `.env.example`、Docker volume 挂载路径保持一致，避免部署后文件落盘路径不一致。
- 重构 `docker-compose.yml`：由硬编码默认密码/端口改为优先读取 `.env` 变量，并保留合理默认值，便于本地开发与测试环境部署复用同一份编排文件。
- 为 `web` 服务补上基于 `/api/healthz` 的容器级 healthcheck，并让 `nginx` 依赖 `web` healthy 后再启动，缩小“容器起来但应用还没准备好”的空窗期。
- 同步更新 `.env.example`、`README_CN.md`、`DEPLOYMENT_CHECKLIST.md`，让部署文档与实际代码行为一致。
- 本阶段目标：把项目从“能 docker 跑起来”继续推进到“更像真实可交付部署基线”。

## 2026-03-14 - 阶段继续推进：后台 view-model 格式化层收口
- 清理 `src/server/view-models/admin/shared/formatters.ts` 中混入但未被实际使用的 mapper / Prisma 类型导入，避免共享格式化层继续膨胀。
- 保留并整理日期、时长、金额、图片尺寸、本地/外部资源来源等真正仍在使用的共享格式化能力。
- 将 `formatPriceEuro` 从简单字符串拼接升级为 `Intl.NumberFormat('de-DE', { currency: 'EUR' })` 格式化，统一后台价格展示语义。
- 本阶段目标：先收掉当前未提交的脏改动，跑 `npm run build` 验证，再做 commit，确保项目继续保持可交接状态。


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

#### 43) 继续把 booking / service / media 映射收口到 shared mapper
- 已扩展 `src/server/view-models/admin/shared/mappers.ts`，新增：
  - `readNestedRecord()`
  - `pickLocalizedText()`
  - `mapFileAsset()`
- 已进一步改造以下 view model：
  - `booking.vm.ts`
  - `service.vm.ts`
  - `media.vm.ts`
- 当前效果：
  - booking / service / media 不再只共享 formatter，也开始共享更底层的字段读取和对象映射规则
  - 媒体对象里的 `file` 解析、双语文案选择、基础字段读取逻辑开始集中化
  - view model 层继续减少散落的 if/typeof/默认值处理

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮继续推进后台 view model 内部的系统化：
- shared mapper 不再只服务 Settings
- 已开始进入核心后台模块
- 后续继续扩展更多后台模块时，数据映射层会更稳定、更低重复

### 下一步建议
1. 继续统一 section / summary / stat card 组合模式，让后台页面更像同一套系统。
2. 开始检查后台命名、目录结构和文案是否还能进一步收口。
3. 如果继续深入架构，可开始抽后台共享 list row / detail block 组件。

#### 44) 开始抽共享 list frame / detail block 组件
- 已新增共享页面块组件：
  - `src/components/admin/AdminListFrame.tsx`
  - `src/components/admin/AdminDetailBlock.tsx`
- 当前作用：
  - `AdminListFrame`：统一列表页的“标题 + 描述 + 内容容器”结构
  - `AdminDetailBlock`：统一详情页侧栏信息块 / 操作块结构
- 已开始接入：
  - `/admin/appointments`
  - `/admin/services`
  - `/admin/appointments/[id]`
- 当前效果：
  - 预约列表、服务列表开始复用统一列表框架
  - 预约详情页的快捷操作 / 状态处理 / 内部记录块开始复用统一详情块结构
  - 后台页面骨架进一步从“共享布局”发展到“共享内容块”

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮继续把后台往“同一套运营系统”方向推进：
- 不只是整体布局统一
- 页面内部的主要内容块也开始复用共同结构
- 后续继续统一 detail 页和 list 页时，成本会更低

### 下一步建议
1. 继续检查后台命名、目录结构和文案是否还能进一步收口。
2. 继续统一 section / summary / stat card 组合模式。
3. 如果继续深入，可以开始整理后台模块级 README / 文档与命名规范。

#### 45) 开始补后台模块级说明文档与命名收口
- 已新增后台模块级说明文档：
  - `src/app/admin/README.md`
  - `src/components/admin/README.md`
  - `src/server/README.md`
- 当前作用：
  - 明确 admin 页面模块边界
  - 明确后台组件按职责分组
  - 明确 repository / service / view-model 三层职责
  - 帮助后续继续开发时减少“只看代码猜结构”的成本
- 已同步补充 `ADMIN_ARCHITECTURE.md`：
  - 把 `/admin/login` 也正式纳入后台模块边界说明
- 已顺手收口一部分后台文案命名：
  - Dashboard 路线图卡片的模块标题与英文说明更一致
  - Services 页面标题与说明更统一地支持双语表达

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮继续往“更适合持续开发和交接”的方向推进：
- 后台不只是结构更清楚
- 说明文档也开始同步到位
- 命名和文案开始减少随手写、局部不一致的问题

### 下一步建议
1. 继续统一后台 section / summary / stat card 的组合模式。
2. 继续检查命名、目录和文案是否还能进一步收口。
3. 如果继续深入，可以整理一份后台开发约定文档（命名、布局、请求、view model、API 规范）。

#### 46) 前台 SEO metadata 收口 + 首页文案去开发痕迹
- 已新增：`src/lib/seo.ts`
  - 统一封装前台页面 metadata 生成逻辑
  - 提供 `metadataBase`、canonical、`hreflang` alternates、Open Graph、Twitter card
- 已将根布局 `src/app/layout.tsx` 改为复用统一站点 metadata，而不是继续写死基础标题/描述。
- 已为以下前台页面补齐 `generateMetadata`：
  - `/[locale]`
  - `/[locale]/services`
  - `/[locale]/about`
  - `/[locale]/contact`
  - `/[locale]/gallery`
  - `/[locale]/booking`
- 当前效果：
  - 前台每个核心落地页都具备独立 title / description
  - 已补 canonical 与 `de/en` 多语言 alternates
  - 社交分享预览信息开始具备统一基础
- 同时顺手收口了一批前台首页/关于/联系/图库/预约页中的“开发阶段说明式文案”：
  - 移除了多处混入德语页面中的中文开发描述
  - 首页关键 section 的德语 eyebrow / 标题 / 描述已改为面向真实访客的表达
  - About / Contact / Gallery / Booking 页面文案更接近上线站点，而不是内部交接说明

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮属于典型的“上线质量收口”，不是扩功能：
- SEO 从基础 `robots/sitemap` 继续推进到页面级 metadata
- 多语言站点开始具备更完整的 canonical / hreflang 基础
- 前台首屏和关键页面的文案观感明显更适合真实用户访问

### 下一步建议
1. 继续补 `LocalBusiness` / `HealthAndBeautyBusiness` 结构化数据。
2. 继续检查前台是否还残留开发说明式文案，尤其是德语页面。
3. 如继续做 SEO，可把 metadata 与系统设置里的 `siteName` / 联系方式进一步联动。

#### 47) 本地 SEO 再收口：LocalBusiness 结构化数据 + 前台残留文案清理
- 已新增：`src/lib/structured-data.ts`
  - 统一生成 `HealthAndBeautyBusiness` / `LocalBusiness` JSON-LD
  - 当前已支持站点名称、电话、邮箱、地址、多语言、营业时间结构化输出
- 已在以下前台页面注入 JSON-LD：
  - `/[locale]`
  - `/[locale]/contact`
- 当前效果：
  - 除了 title / description / canonical / `hreflang` 之外，前台已开始具备本地商户结构化数据基础
  - 更接近按摩店本地获客站的真实 SEO 需求
- 同时顺手继续收口前台残留开发痕迹：
  - 首页“营业时间与联系”区块的德语描述已改成真实用户导向文案
  - Hero 多语言能力展示已从混乱大小写收口为 `DE / EN / 中文`
- 本轮还顺手做了一次前台字符扫描：
  - 发现前台站点侧基本可控，当前明显的编码/文案问题主要集中在后台中文文案文件，属于另一条独立收口线

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮继续属于上线质量收口，而不是扩功能：
- 本地 SEO 从页面级 metadata 继续推进到结构化数据
- 首页和联系页开始更像真实本地商户站，而不是开发中的半成品
- 当前前台剩余的主要价值点已经逐步从“基础可用”切换到“真实上线表达与本地搜索表现”

### 下一步建议
1. 继续把结构化数据扩到服务页 / about 页，并考虑补 `WebSite` / `BreadcrumbList`。
2. 开一条独立任务线，系统修复后台中文文案乱码问题。
3. 如继续做本地 SEO，可把联系页补地图嵌入、交通提示和更完整 NAP 展示。

#### 48) 后台 Bookings 模块文案收口（第一轮）
- 本轮先不大范围重写后台，而是先收口高频工作路径：
  - `/admin`
  - `/admin/appointments`
  - `/admin/appointments/[id]`
- 已确认这些页面当前源码本身已是正常中文文案，不属于编码损坏文件；因此本轮重点改为：
  - 保持 Dashboard / Bookings 主工作流的人类可读中文表达
  - 补齐预约来源与语言字段的人类可读标签，避免后台直接暴露枚举码
- 已新增：`src/lib/admin-booking-copy.ts`
  - 统一 `AppointmentSource` 的中英标签
  - 统一预约语言字段（de/en/zh）的中英标签
- 已接入：
  - 预约列表页来源列
  - 预约详情页来源字段
  - 预约详情页语言字段
- 当前效果：
  - Bookings 模块不再直接向后台运营人员暴露 `WEBSITE` / `PHONE` / `WHATSAPP` / `de` / `en` 这类技术值
  - 后台预约主路径更接近真实可交付工作台

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这轮属于“后台运营语义收口”的第一步：
- 先处理最常用的预约工作流
- 先解决最影响理解成本的技术枚举暴露问题
- 保持小步提交，避免一次性改坏整片后台

### 下一步建议
1. 继续沿同一路线收口 Services / Content / Gallery 的后台中文表达。
2. 针对真正存在乱码的后台文件做分批修复，不和运营语义优化混在一轮里。
3. 后续可统一把后台的日期/价格/来源/语言都纳入 shared formatter / copy 层。

#### 49) 后台 Services / Content 双语表达收口（第二轮）
- 按上一轮 DEVELOPMENT_LOG 的下一步继续推进，没有扩功能，而是继续收口后台运营界面的表达一致性。
- 本轮聚焦：
  - `/admin/services`
  - `/admin/content`
- Services 页已收口：
  - 空状态标题与说明改为走 `pick()`
  - 表头中的“服务 / 英文名 / 时长 / 价格 / 状态与排序 / 编辑”改为按语言切换
  - 行级“编辑”按钮不再写死中文
- Content 页已收口：
  - 返回按钮改为走 `pick()`
  - 内容工作台标题/说明改为中英双语切换
  - 内容统计卡片标题、说明、指标标签改为走 `pick()`
  - Hero 预览卡片标题/说明改为走 `pick()`
  - Hero 空状态改为走 `pick()`
- 本轮判断：
  - Gallery 页当前主要用户可见文案已经较规范地走 `pick()`，因此本轮没有为了“凑提交”而做无意义改动
  - 继续保持按模块小步收口，避免把“表达层收口”和“编码乱码修复”混成一锅

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这轮继续属于后台交付质量收口：
- 目标不是新增能力，而是把后台运营界面从“局部硬编码”继续推进到“统一双语表达”
- Services / Content 两块的表达一致性明显更好了
- DEVELOPMENT_LOG 与实际推进节奏已重新对齐：写了什么下一步，就继续做什么下一步

### 下一步建议
1. 继续收口 `services/new`、`services/[id]`、`gallery` 等后台页面剩余硬编码文案。
2. 单独开一轮修复真正存在乱码/编码污染的后台文件。
3. 后续可以把后台常用按钮、空状态、统计卡标题进一步抽成统一 copy 层。

#### 50) 后台 Gallery / Section Eyebrow 文案收口（第三轮）
- 本轮继续严格沿着 DEVELOPMENT_LOG 里的下一步推进，没有切线做新功能。
- 本轮聚焦的是后台页面里“还露在界面上的辅助文本层”：
  - Services 页 section eyebrow
  - Content 页 section eyebrow
  - Gallery 页 section eyebrow
  - Gallery 页残留乱码文案
  - `AdminEmptyState` 的固定辅助标签
- 已完成：
  - `services/page.tsx`
    - `Service Library` → 走 `pick()`
    - `Management Notes` → 走 `pick()`
  - `content/page.tsx`
    - `Content Workspace` → 走 `pick()`
    - `Content Stats` → 走 `pick()`
    - `Hero Preview` → 走 `pick()`
  - `gallery/page.tsx`
    - `Gallery Library` / `Gallery Stats` / `Gallery Notes` → 全部改为走 `pick()`
    - 修复一处真实存在的中文乱码：
      - 从 `减少每次���进长表单翻查资源状态`
      - 到 `减少每次都进长表单翻查资源状态`
  - `AdminEmptyState.tsx`
    - 把固定标签从 `Empty State` 收口为更中性的 `EMPTY`，减少后台中英混杂时的突兀感
- 这一轮的目标不是“把所有后台都翻译完”，而是继续把最明显、最容易破坏一致性的可见文本层收口掉。

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮继续属于后台交付观感打磨：
- 没有扩展功能
- 没有碰你已有未提交的 `formatters.ts`
- 重点是把后台页面表面的视觉语言再统一一层
- 同时顺手修掉一个真实乱码点，价值是明确的

### 下一步建议
1. 继续处理 `services/new`、`services/[id]`、`settings` 等页面的剩余固定文案。
2. 单独开一轮专门修后台真正存在的乱码/编码污染文件。
3. 如果继续做后台统一性，可把 `AdminSectionCard` / `AdminEmptyState` 的 eyebrow / label 进一步抽象成统一 copy 规范。

#### 51) 后台 Settings / Service Form Page 文案收口（第四轮）
- 本轮继续沿着上轮结论推进，重点不是加功能，而是继续清理后台页面“看起来已经国际化，其实中文位仍不干净”的表层 copy。
- 实际检查后判断：
  - `services/new` 与 `services/[id]` 两页的 page-level copy 已经相对干净；
  - 真正值得优先处理的是 `settings/page.tsx`，因为该页虽然普遍使用了 `pick()`，但部分中文位仍然是英文词或历史遗留风格，不够统一。
- 已完成：
  - `settings/page.tsx`
    - `System Preferences` → `pick(lang, '系统偏好', 'System preferences')`
    - `Security` → `pick(lang, '安全设置', 'Security')`
    - `Current Session` → `pick(lang, '当前会话', 'Current session')`
    - `Runtime Snapshot` → `pick(lang, '运行快照', 'Runtime snapshot')`
  - `services/new/page.tsx`
    - 为顶部“返回服务列表”区域补了一个更完整的工作台式容器（圆角、边框、轻阴影、轻 blur），让新建页入口区域与后台其他工作台页面更一致。
- 本轮没有继续动：
  - `src/server/view-models/admin/shared/formatters.ts`（保留用户现有未提交改动不碰）
  - `services/[id]` 的业务逻辑和表单结构

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮属于“后台设置页真双语化 + Service 表单页表层统一”小收口：
- 不改数据结构
- 不改 API
- 不扩功能
- 只把后台表面的一致性继续往前推一格

### 下一步建议
1. 继续检查 `AdminSettingsForm` / `AdminPasswordForm` / `AdminInfoList` 等组件内是否还有表层术语不统一。
2. 单独开一轮专修后台乱码/编码污染，尤其是历史中文文件。
3. 如果继续做后台观感统一，可把 `services/[id]` 页的工具条也升级为和 `services/new` 更接近的工作台头部结构。

#### 52) 后台设置组件层统一（第五轮）
- 本轮继续按“组件层统一优先”的路线推进，不改业务逻辑，只提升后台表单与信息展示组件的一致性与可读性。
- 重点处理的组件：
  - `AdminInfoList`
  - `AdminSettingsForm`
  - `AdminPasswordForm`
- 已完成：
  - `AdminInfoList.tsx`
    - 从原来的“单行 label + value”平铺文本，升级为卡片式信息块；
    - 每个信息项现在都有更清晰的层级：小号 eyebrow 风格 label + 主值展示；
    - 这样在 `settings` 页面查看当前会话与当前配置快照时，可读性明显更强。
  - `AdminPasswordForm.tsx`
    - 底部操作区从固定单行改为 `flex-wrap`，更适合窄宽度和后续扩展；
    - 操作结果 message 改为更像系统提示的圆角 pill 样式，而不是裸文本。
  - `AdminSettingsForm.tsx`
    - Cloudflare Turnstile 区域的两个 key 标签继续向中文后台语境收口：
      - `Site Key` → `站点 Key`
      - `Secret Key` → `密钥 Secret`
- 本轮没有动：
  - API
  - 数据结构
  - 设置保存逻辑
  - 密码修改逻辑
- 目标仍然明确：继续把后台从“能用”推进到“更像正式交付后台”。

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮属于后台组件层视觉语言与术语的一次轻收口：
- 价值主要体现在设置页的信息层级更清楚；
- 表单反馈更像正式系统；
- 整体后台工作台感继续增强。

### 下一步建议
1. 继续检查 `services/[id]`、`appointments/[id]` 等详情页的工具条与信息块，往统一工作台语言再收一轮。
2. 单独开一轮处理后台历史乱码/编码污染，避免日志和页面继续出现局部异常字符。
3. 后续可以考虑把表单区块标题、状态提示、信息列表进一步抽成统一模式组件。

#### 53) 预约详情页工作台统一（第六轮）
- 本轮把重点转向 `appointments/[id]`，因为相比 `services/[id]`，预约详情页仍然更像“信息堆叠页”，统一价值更高。
- 目标仍然克制：
  - 不改接口
  - 不改状态流转逻辑
  - 不改数据结构
  - 只提升详情页的信息组织方式与操作反馈样式
- 已完成：
  - `appointments/[id]/page.tsx`
    - 引入 `AdminInfoList`；
    - 把主信息区从散装的 `label + value` 网格，统一改成信息卡片列表；
    - 把“内部记录”也改为同一套 `AdminInfoList` 展示模式；
    - 结果是预约详情页的主区与侧边信息块开始共享同一种视觉语言。
  - `AppointmentQuickActions.tsx`
    - 操作结果提示从裸文本改为带背景的 pill 状态提示；
    - 成功 / 失败 / 普通提示三种状态的反馈样式更统一。
  - `AppointmentStatusControls.tsx`
    - 底部操作区改为 `flex-wrap`；
    - 保存结果提示也统一为 pill 样式，与 quick actions 对齐。
- 本轮意义：
  - 预约详情页开始更像正式运营后台的“工作台页面”，而不是简单详情展示；
  - 后台不同组件之间的反馈语言和信息块语言开始收敛到统一模式。

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮属于后台详情页统一的重要一步：
- 不是加新能力；
- 而是把已有预约处理能力包装成更一致、更可读、更接近交付质量的后台体验。

### 下一步建议
1. 继续检查 `services/[id]` 页是否需要引入补充信息块（如当前服务状态摘要），进一步向预约详情页靠拢。
2. 开一轮后台乱码/编码污染专项修复，避免继续在日志或中文文案里出现异常字符。
3. 后续可以把 pill 状态提示抽成统一的小组件，减少 quick action / form message 的重复样式。

#### 54) 后台操作反馈统一（乱码专项前置收口）
- 本轮原计划切入“后台乱码 / 编码污染专项修复”。
- 实际扫描后确认：
  - `AdminShell.tsx`、`AdminSettingsForm.tsx`、`AppointmentQuickActions.tsx`、`AppointmentStatusControls.tsx`、`ServiceForm.tsx` 等第一批高频组件当前源码已经是可读 UTF-8；
  - 更明显的污染集中在后续一些交互组件与内容编辑器的大文件中。
- 因为 `ContentEditor.tsx` 体量较大，本轮没有贸然把“大文件乱码修复”与“小组件反馈统一”混在一起，避免一次提交过重。
- 本轮先完成一组低风险、高收益的前置收口：
  - `ServiceControls.tsx`
    - 底部操作区改为 `flex-wrap`；
    - message 统一为 pill 提示样式。
  - `DeleteServiceButton.tsx`
    - 删除结果提示改为圆角 pill 提示。
  - `GalleryQuickActions.tsx`
    - 操作结果提示改为 pill 样式，并与其他后台 quick actions 的反馈语言保持一致。
- 这一步的意义：
  - 即使还没正式进入 `ContentEditor` 的大文件修复，后台多个关键操作点的反馈样式已经进一步统一；
  - 同时也为后续抽象统一 notice / status pill 组件提供了更清晰的样式基线。

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这轮属于“乱码专项前的安全收口”：
- 没有盲目大改重文件；
- 先把后台关键交互反馈统一到同一视觉语言；
- 并完成了一轮更准确的污染范围确认。

### 下一步建议
1. 正式进入 `ContentEditor.tsx` 的专项修复，按 section 分块处理，避免一次修改过重。
2. 顺手清理 `GalleryQuickActions` / `DeleteServiceButton` / `ServiceControls` 以外仍存在历史中文污染的零散组件。
3. 如果继续统一后台体验，可考虑把当前各处 pill 提示抽成一个可复用的小组件。

#### 55) ContentEditor 第一轮收口（内容工作台专项）
- 这轮根据 `ROADMAP.md`、`ARCHITECTURE.md`、`PROJECT_STATUS.md` 和近期开发日志重新校准后，确认 `ContentEditor.tsx` 仍是当前最值得继续收口的后台核心文件。
- 原因很直接：
  - 它处在上传链 / 内容链交叉点；
  - 直接影响 `/admin/content` 的可交付性；
  - 而且文件体量较大，适合按 section 小步改，避免一次改太重。
- 本轮没有贸然重写大文件结构，而是先做第一轮高收益收口：
  - 统一 section eyebrow / 辅助标签：
    - `Contact` → 走 `t(lang, '联系信息', 'Contact')`
    - `Hours` → 走 `t(lang, '营业时间', 'Hours')`
    - `Gallery` → 走 `t(lang, '图库', 'Gallery')`
  - 统一 Gallery 上传反馈：
    - 从裸文本 message 收口为 pill 提示样式；
    - success / error / info 与后台其他工作台页面保持一致。
  - 统一底部 sticky 保存条：
    - 操作区改为 `flex-wrap`；
    - 保存结果提示改为 pill 样式；
    - 让内容页在窄宽度和多状态下也更稳定。
- 本轮价值：
  - `ContentEditor` 虽然还没有“彻底抽象化”，但已经从大而杂的内容编辑页，继续往统一后台工作台语言收口；
  - 上传链和保存链的反馈方式与其他后台模块开始更加一致。

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮属于内容工作台专项的第一步：
- 不改 API；
- 不改数据结构；
- 不重做整个内容页；
- 先把最可见、最影响交付观感的部分统一掉。

### 下一步建议
1. 继续处理 `ContentEditor.tsx` 中 Hero / FAQ / Gallery 的 placeholder 与输入标签，让中英后台语境更统一。
2. 继续把上传提示 / 保存提示抽成统一 notice 组件，减少后台重复样式。
3. 再做一轮后台可见文案扫描，确认剩余真正的编码污染点，而不是重复处理已经正常的 UTF-8 文件。

#### 56) ContentEditor 输入提示继续收口 + 删除反馈对齐
- 本轮继续沿着上一轮的下一步推进，没有改 API、数据结构或上传逻辑，仍然只做后台交付层的小步收口。
- 重点处理：
  - `ContentEditor.tsx`
  - `DeleteServiceButton.tsx`
- 已完成：
  - `ContentEditor.tsx`
    - 新增 `localizedFieldPlaceholder()`，统一生成“字段名 + 语言位（DE/EN）”的输入提示；
    - 将 Hero 区块中的 `Eyebrow / Title / Subtitle / Image note` 占位文案，从技术化英文缩写改为更人类可读的双语提示；
    - 将 FAQ 区块中的 `Question / Answer` 占位文案改为同一套双语提示；
    - 将 Gallery 区块中的 `Title / Alt` 占位文案也统一为同一模式；
    - 结果是内容工作台内部的德语/英语字段输入体验更一致，不再像开发阶段表单。
  - `DeleteServiceButton.tsx`
    - 删除结果提示改为与其他后台 quick actions / form message 一致的 pill 状态样式；
    - 成功与失败现在会使用不同语义色，而不再是统一灰色反馈。
- 本轮价值：
  - `ContentEditor` 继续从“大而杂的技术表单”往“真实运营可理解的内容工作台”推进；
  - 服务删除反馈也进一步对齐了后台统一交互语言。

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮依然是低风险高收益的小收口：
- 不碰后端链路；
- 不影响已验证过的上传 / 内容保存能力；
- 但明显改善了内容编辑页的可读性和后台整体反馈一致性。

### 下一步建议
1. 继续补 `ContentEditor` 中联系信息 / 营业时间 / 图片 URL 等输入的辅助说明，让整个内容页的输入语言完全统一。
2. 抽一个真正复用的后台 `NoticePill` 小组件，收掉当前多处重复的提示样式拼接。
3. 再做一轮后台可见文案扫描，优先修真正影响运营理解的残留技术文案与编码污染点。

#### 57) 继续收口后台提示样式：预约模块接入 NoticePill
- 本轮原本计划“抽一个后台 NoticePill 小组件”，但实际检查代码后发现该组件已经存在并已在部分模块使用。
- 因此这轮没有重复造轮子，而是改为把尚未接入的高频预约模块切到已有 `NoticePill`，属于更干净的收口方式。
- 重点处理：
  - `AppointmentQuickActions.tsx`
  - `AppointmentStatusControls.tsx`
- 已完成：
  - 两个组件都改为直接复用 `NoticePill`；
  - 删除本地重复的 `noticeClassName()` 样式函数；
  - 保持原有 success / error / info 三态语义不变，只把表现层统一到共享组件。
- 本轮价值：
  - 后台预约详情页与其他后台工作台的反馈样式进一步一致；
  - 减少了重复样式逻辑，后续如果继续调整提示视觉，只需改共享组件而不是多处同步修改。

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮继续保持低风险收口策略：
- 没有扩功能；
- 没有改后端；
- 只是把已有共享组件真正用起来，让后台交互语言更统一、代码更少重复。

### 下一步建议
1. 继续补 `ContentEditor` 中联系信息 / 营业时间 / 图片 URL 等输入的辅助说明，让整个内容页的输入语言完全统一。
2. 再扫一轮后台组件，把剩余还没接共享反馈组件的点都收掉。
3. 再做一轮后台可见文案扫描，优先修真正影响运营理解的残留技术文案与编码污染点。

#### 58) 文档状态与当前代码进度重新对齐
- 本轮先没有继续改业务代码，而是先处理一个真实阻塞：`ROADMAP.md` / `PROJECT_STATUS.md` 中有几处完成状态已经落后于当前代码与近期开发日志。
- 如果继续沿着“旧状态”推进，后续开发很容易被错误勾选项误导，因此这轮先做文档收口。
- 已完成：
  - `ROADMAP.md`
    - 将前台 SEO 任务中的 `metadata 模板 / 页面 title-description / hreflang / LocalBusiness schema` 更新为已完成；
    - 将后台页面任务中的 `/admin/gallery`、`/admin/settings` 更新为已完成。
  - `PROJECT_STATUS.md`
    - 将“当前还没做完”的条目改为更符合现状的剩余问题，不再把已完成的图片尺寸校验和结构化数据继续列为未完成；
    - 同步把上传链生产化阶段的建议项改为更贴近当前真实缺口（大小提示、替换删除策略、生命周期、压缩/规范化导出等）。
- 本轮价值：
  - 文档与仓库真实状态重新对齐；
  - 后续继续推进时，不会再因为旧清单而重复做已经完成的工作；
  - 交接成本也更低，符合项目当前“文档必须能独立表达状态”的规则。

### 本阶段结论
这一轮属于文档基线修正：
- 不改业务能力；
- 但修掉了一个会持续误导开发判断的文档问题；
- 为下一轮继续做高价值收口提供了更准确的任务基线。

### 下一步建议
1. 回到 `ContentEditor`，继续补联系信息 / 营业时间 / 图片 URL 等输入的说明与提示一致性。
2. 继续扫后台组件，把剩余还没接共享反馈组件的点都收掉。
3. 再做一轮后台可见文案扫描，优先修真正影响运营理解的残留技术文案与编码污染点。

#### 59) ContentEditor 区块说明继续收口
- 本轮继续回到 `ContentEditor.tsx`，但仍然保持低风险策略：
  - 不改保存逻辑
  - 不改上传逻辑
  - 不碰 API
  - 只增强内容工作台区块层的可理解性
- 已完成：
  - 为 `Hero` 区块补上说明文案，明确其作用是首页首屏主文案与主视觉；
  - 为 `联系信息` 区块补上说明文案，明确其会影响联系页、页脚和结构化信息展示；
  - 为 `营业时间` 区块补上说明文案，明确建议使用 24 小时制，以及“关闭”对前台展示的影响；
  - 为 `FAQ` 区块补上说明文案，明确其同时服务前台 FAQ 与长尾 SEO；
  - 为 `图库管理` 区块补上说明文案，明确本地上传路径与外部图片地址都可保留。
- 本轮价值：
  - `ContentEditor` 不再只是一个字段堆叠表单；
  - 后台内容工作台更接近“运营界面”而不是“开发者知道怎么填”的内部工具；
  - 后续继续交接或给非技术维护者使用时，理解成本会更低。

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮继续属于后台内容工作台的可交付性收口：
- 没有新增功能；
- 但补强了内容区块的语义说明；
- 让现有能力更容易被正确使用。

### 下一步建议
1. 继续扫后台组件，把剩余还没接共享反馈组件的点都收掉。
2. 再做一轮后台可见文案扫描，优先修真正影响运营理解的残留技术文案与编码污染点。
3. 如果继续深挖 `ContentEditor`，可以考虑把区块头部抽成统一模式，减少后续说明文案与样式重复。

#### 60) AdminPasswordForm 接入共享反馈组件
- 本轮继续按“小步收口后台交互一致性”的路线推进。
- 扫描后发现：`AdminPasswordForm.tsx` 仍然使用旧的单色灰底提示，和其他已经接入 `NoticePill` 的后台组件不一致。
- 已完成：
  - `AdminPasswordForm.tsx` 接入共享 `NoticePill`；
  - 为密码修改反馈补上 `success / error` 两种语义状态；
  - 成功更新密码与失败报错现在会使用不同语义色，而不再全部显示为同一类灰色消息。
- 本轮价值：
  - 后台设置页中的密码修改体验与其他工作台模块保持一致；
  - 继续减少局部遗留的旧提示样式；
  - 共享反馈组件的覆盖范围进一步扩大。

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮依旧是低风险、可交付导向的收口：
- 不改业务逻辑；
- 不改接口；
- 但把后台密码修改的反馈语言拉回到统一体系里。

### 下一步建议
1. 继续扫后台组件，把剩余还没接共享反馈组件的点都收掉。
2. 再做一轮后台可见文案扫描，优先修真正影响运营理解的残留技术文案与编码污染点。
3. 如果继续深挖 `ContentEditor`，可以考虑把区块头部抽成统一模式，减少后续说明文案与样式重复。

#### 61) 交付纪律写入项目交接规则
- 本轮没有继续改功能，而是先把一个流程性问题收口：
  - 人类已明确要求“每完成一个阶段都要汇报、写日志并提交到 GitHub，不要每次再提醒”。
- 已完成：
  - 在工作区 `AGENTS.md` 中加入阶段完成纪律：更新文档 → commit → push → 汇报；
  - 在项目 `HANDOFF.md` 中把阶段记录规则升级为：写日志、build、commit、push 到 GitHub、再发送进度汇报。
- 本轮价值：
  - 这条要求不再只是聊天里的临时提醒；
  - 后续继续推进时，会以项目规则和工作区规则双重形式存在；
  - 可减少流程遗漏，特别适合当前这种持续推进型项目。

### 本阶段结论
这一轮属于流程固化：
- 不改业务；
- 但把“阶段完成后必须 push + 汇报”的要求变成了明确规则；
- 以后不需要人类重复提醒同一件事。

### 下一步建议
1. 继续扫后台组件，把剩余还没接共享反馈组件的点都收掉。
2. 再做一轮后台可见文案扫描，优先修真正影响运营理解的残留技术文案与编码污染点。
3. 如果继续深挖 `ContentEditor`，可以考虑把区块头部抽成统一模式，减少后续说明文案与样式重复。

#### 62) AdminSettingsForm 接入统一反馈组件
- 本轮继续完善后台设置页，不改数据结构、不改设置 API，只收口交互反馈层。
- 扫描后发现：`AdminSettingsForm.tsx` 保存设置后仍然只有一条普通灰字提示，和后台其余已经接入 `NoticePill` 的模块不一致。
- 已完成：
  - `AdminSettingsForm.tsx` 接入共享 `NoticePill`；
  - 为系统设置保存反馈补上 `success / error` 两种语义状态；
  - 底部操作区调整为 `flex-wrap`，与其他后台工作台页的按钮+反馈布局保持一致。
- 本轮价值：
  - 设置页的交互反馈现在和服务管理、预约详情、密码修改等模块处于同一语言体系；
  - 后台整体观感更统一，更像一套完整运营系统，而不是局部风格混杂的页面集合。

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮依旧是后台收口型推进：
- 没有扩功能；
- 没有碰后端；
- 但把系统设置页也拉回到了统一反馈体系中。

### 下一步建议
1. 继续扫后台组件，把剩余还没接共享反馈组件的点都收掉。
2. 再做一轮后台可见文案扫描，优先修真正影响运营理解的残留技术文案与编码污染点。
3. 如果继续深挖 `ContentEditor`，可以考虑把区块头部抽成统一模式，减少后续说明文案与样式重复。

#### 63) ContentEditor 开始复用统一区块卡片
- 本轮继续完善后台内容工作台，但没有去碰保存逻辑、上传逻辑或 API。
- 这次处理的重点是：`ContentEditor.tsx` 里多处仍然手写“eyebrow + 标题 + 说明 + 内容”的区块头结构，和后台已存在的共享区块卡片能力不一致。
- 已完成：
  - `ContentEditor.tsx` 接入现有共享组件 `AdminSectionCard`；
  - 已将以下区块切到统一卡片结构：
    - 联系信息（Contact）
    - 营业时间（Hours）
    - 常见问题（FAQ）
  - FAQ 的新增按钮也已接入 `AdminSectionCard.actions` 区域，而不是继续手写局部头部布局。
- 本轮价值：
  - 内容工作台的结构进一步向后台其他页面靠拢；
  - 减少了 `ContentEditor` 内部重复的区块头代码；
  - 为后续继续把 Gallery / Hero 等区块收口到统一模式打下基础。

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮依旧是后台结构收口：
- 不改功能；
- 不改接口；
- 但把内容工作台内部的结构组织继续从“局部手写”推进到“共享组件复用”。

### 下一步建议
1. 继续把 `ContentEditor` 中剩余的 Hero / Gallery 区块也逐步收进统一区块卡片模式。
2. 继续扫后台组件，把剩余还没接共享反馈组件的点都收掉。
3. 再做一轮后台可见文案扫描，优先修真正影响运营理解的残留技术文案与编码污染点。

#### 64) 固化中文后台文案规范，并先清理 Hero / Gallery 术语
- 本轮根据人类的明确要求，先把“中文后台里尽量不用 Hero / Gallery 这类英文词”从聊天提醒升级为项目规则。
- 已完成：
  - 在 `HANDOFF.md` 中新增“后台文案规范”条目：
    - 中文后台中，能用中文解释的地方尽量不用英文术语；
    - `Hero`、`Gallery`、`Settings`、`Content` 这类词优先改成中文可理解表达。
  - 在 `ContentEditor.tsx` 中先收口最显眼的对运营人员可见文案：
    - `首页 Hero` → `首页主视觉`
    - `上传 Hero 图片` → `上传主视觉图片`
    - `Hero 图片上传成功` → `主视觉图片上传成功`
    - `Hero 图片 URL` → `主视觉图片地址`
    - `Hero 最低尺寸` → `首页主视觉的最低尺寸`
    - `Gallery 最低尺寸` → `图库图片的最低尺寸`
    - `图库列表` → `图片列表`
    - `图片资料 / 图库管理` 的说明文案也同步继续中文化
    - `新增图片条目` → `新增图片资料`
- 本轮价值：
  - 后台中文界面对非技术维护者更自然；
  - 这条规范不再依赖口头提醒，而是变成了项目规则；
  - 为后续继续清理后台其它模块的英文术语建立了明确标准。

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮属于“后台文案规范 + 首批落地修正”：
- 不改功能；
- 不改接口；
- 但明确了中文后台的用词方向，并已经开始在核心内容工作台落地。

### 下一步建议
1. 继续把 `ContentEditor` 里剩余能中文化的 `Hero / Gallery` 表达继续收掉。
2. 再扫后台其它页面（尤其 settings / gallery / dashboard），把能中文解释的英文术语继续替换掉。
3. 继续把 `ContentEditor` 中剩余区块逐步收进统一区块卡片模式。

#### 65) 后台高频导航与总览文案继续中文化
- 本轮继续执行“中文后台尽量不用英文术语”的规则，但优先挑高频可见区域处理，让收口收益最大化。
- 已完成：
  - `AdminShell.tsx`
    - 左侧品牌小标题 `Wellness Admin` 在中文模式下改为 `养生后台`
    - 顶部 `Admin Workspace` 在中文模式下改为 `后台工作台`
    - 左侧导航描述继续中文化：
      - `仪表盘` → `工作台`
      - `网站内容` 描述 → `文案与资料`
      - `图库管理` 描述 → `图片资料`
      - `系统设置` 描述 → `配置`
  - `AdminTopSummary.tsx`
    - 中文模式下的 `Overview` 语义继续收口为 `总览`
  - `admin/gallery/page.tsx`
    - 中文副标题里的 `图库` 运营语义补充为更自然的 `图片资料`
- 本轮价值：
  - 导航、顶栏、总览这些后台最高频可见区域进一步贴近自然中文；
  - 非技术维护者进入后台时，整体理解成本会继续下降；
  - 这条中文化规则开始从单个页面扩展到后台全局骨架。

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮属于后台骨架层文案收口：
- 没有改功能；
- 没有改接口；
- 但把后台最常见的导航与总览文案继续往自然中文推进了一步。

### 下一步建议
1. 继续扫后台其它页面（尤其 settings / gallery / dashboard），把能中文解释的英文术语继续替换掉。
2. 继续把 `ContentEditor` 里剩余能中文化的 `Hero / Gallery` 表达继续收掉。
3. 继续把 `ContentEditor` 中剩余区块逐步收进统一区块卡片模式。

#### 66) 设置页与图库页文案继续中文化
- 本轮继续沿着“中文后台尽量不用英文术语”的规则推进，优先处理设置页与图库页里仍然偏英文语感的中文表述。
- 已完成：
  - `AdminSettingsForm.tsx`
    - `站点基础信息` → `站点基本信息`
    - `预约与文案设置` → `预约与文案配置`
    - 中文说明中的 `booking 页面` → `预约页面`
    - `Cloudflare Turnstile / 验证码` → `验证码防护`
    - `启用 Turnstile 验证` → `启用验证码校验`
    - `站点 Key` → `站点密钥`
    - `密钥 Secret` → `私密密钥`
  - `admin/gallery/page.tsx`
    - `图库资源库` → `图片资料库`
    - `图库资源总览` → `图片资料总览`
    - `前往内容工作台` → `前往内容管理页`
    - `图库统计` → `图片统计`
    - `图库状态面板` → `图片状态看板`
    - `图库建议` → `图片建议`
- 本轮价值：
  - 设置页和图库页的中文界面更像真实给店主/运营看的后台，而不是开发过程中的半翻译界面；
  - 后台中文化开始从单页、局部标签，继续推进到页面级标题、说明与操作入口。

### 本阶段验证追加
- `npm run build` 已通过。

### 本阶段结论
这一轮依然是后台中文化收口：
- 不改功能；
- 不改接口；
- 但把设置页和图库页里的高频可见术语继续往自然中文推进。

### 下一步建议
1. 继续扫 dashboard / content / services 页面，把还能中文解释的英文术语继续替换掉。
2. 继续把 `ContentEditor` 里剩余能中文化的 `Hero / Gallery` 表达继续收掉。
3. 继续把 `ContentEditor` 中剩余区块逐步收进统一区块卡片模式。

#### 57) NoticePill 抽象 + ContentEditor 输入提示继续收口
- 本轮继续严格沿着上一轮 DEVELOPMENT_LOG 的下一步推进，没有改 API、数据结构或上传链核心逻辑。
- 已新增共享组件：
  - `src/components/admin/NoticePill.tsx`
- 当前作用：
  - 统一后台 success / error / info 三种反馈的 pill 样式；
  - 避免各组件继续手写 `bg-emerald-50 text-emerald-700` 这类重复拼接。
- 已接入：
  - `DeleteServiceButton`
  - `ServiceControls`
  - `GalleryQuickActions`
  - `ContentEditor`
- 同时继续收口 `ContentEditor.tsx`：
  - Hero 图片 URL 输入框新增更人类可读的提示；
  - 联系信息中的地址 / 电话 / Email 输入新增明确用途说明；
  - 营业时间开始 / 结束时间新增示例式 placeholder；
  - Gallery 图片 URL 输入新增对本地 `/uploads/` 路径与外部 URL 的说明；
  - Hero 上传反馈 / Gallery 上传反馈 / 保存反馈统一切到 `NoticePill`。
- 本轮价值：
  - 后台反馈样式开始真正进入可复用阶段，而不是继续在各组件里复制黏贴；
  - 内容工作台的输入语言继续从“技术字段编辑页”往“运营人员可理解的后台”推进。

### 本阶段验证追加
- 本轮修改后应执行 `npm run build` 进行回归验证。

### 本阶段结论
这一轮仍然是低风险高收益的后台收口：
- 不改后端链路；
- 不引入新业务复杂度；
- 但把后台提示样式与内容工作台输入说明继续推向统一、可交付的状态。

### 下一步建议
1. 继续把 `AppointmentQuickActions`、`AppointmentStatusControls`、`AdminPasswordForm` 等组件的 pill 提示也完全收口到 `NoticePill`。
2. 再做一轮后台可见文案扫描，优先修真正影响运营理解的残留技术文案与编码污染点。
3. 如果继续统一后台体验，可把常用按钮 / 空状态 / 统计卡的 copy 也进一步抽到共享 copy 层。
