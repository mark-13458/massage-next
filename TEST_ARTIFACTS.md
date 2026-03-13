# TEST_ARTIFACTS.md

# massage-next 测试临时文件说明

> 目的：明确标注哪些文件是 smoke test / 手工联调过程中产生的临时工件，避免后续开发者误认为它们是正式业务文件。

---

## 1. 说明

当前项目根目录下存在一批 **测试临时文件**。这些文件用于：
- Docker smoke test
- 登录接口测试
- 内容接口 PATCH 测试
- Hero / Gallery 上传测试
- 上传持久化与清理闭环测试

它们**不是正式业务文件**，也**不应提交到 GitHub**。

---

## 2. 当前已识别的测试临时文件

### JSON 请求体 / 调试数据
- `content-smoke.json`
- `delete-gallery.json`
- `hero-patch.json`
- `hero1.json`
- `hero2.json`
- `login.json`
- `replace-hero.json`

### 会话 / cookie 文件
- `smoke-cookies.txt`

### 测试图片
- `tmp-smoke.png`
- `tmp-hero-smoke.png`

---

## 3. 用途说明

### `login.json`
用于测试：
- `POST /api/admin/login`

### `content-smoke.json`
用于测试：
- `PATCH /api/admin/content`
- 联系方式 / Hero / FAQ / 营业时间等内容写入

### `delete-gallery.json`
用于测试：
- Gallery 条目删除
- 删除后数据库记录与本地文件清理

### `hero1.json` / `hero2.json` / `hero-patch.json` / `replace-hero.json`
用于测试：
- Hero 图片上传
- Hero 替换后旧图清理

### `smoke-cookies.txt`
用于测试：
- 登录后的 session cookie 复用

### `tmp-smoke.png`
用于测试：
- Gallery 上传成功路径
- 最低尺寸校验（1200x400）

### `tmp-hero-smoke.png`
用于测试：
- Hero 上传成功路径
- Hero 最低尺寸要求（1200x600）

---

## 4. 管理规则

### 当前策略
- 暂时保留这些文件，方便复现 smoke test
- 但通过 `.gitignore` 排除，不进入版本库
- 后续如不再需要，可统一清理

### 接手提醒
如果你是下一位开发者：
1. 先读 `DEVELOPMENT_LOG.md`
2. 再读 `PROJECT_STATUS.md`
3. 如果看到这些临时文件，不要当成业务配置或正式内容
4. 如需重新做 smoke test，可复用这些文件作为测试样例

---

## 5. 当前结论

这些文件是：
> **部署联调与 smoke test 的临时工件，不是正式项目资产。**

后续如果要清理，请在确认不再需要复现测试后再删除。
