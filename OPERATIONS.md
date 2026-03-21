# OPERATIONS.md

> 部署、升级、迁移操作手册。面向接手此项目的开发者或运维人员。
> 最后更新：2026-03-21

---

## 技术栈概览

| 层 | 技术 |
|---|---|
| 框架 | Next.js 16 (standalone 模式) |
| 运行时 | Node.js 20 (Docker 内) |
| 数据库 | MySQL 8.0 |
| ORM | Prisma 5.9 |
| 容器 | Docker + Docker Compose |
| 反向代理 | Nginx |
| 图片存储 | 本地磁盘（Docker volume） |

---

## 一、首次部署（全新服务器）

### 1.1 服务器要求

- OS：Ubuntu 22.04 / Debian 12（推荐）
- 内存：≥ 1GB（推荐 2GB）
- 磁盘：≥ 20GB（含图片上传空间）
- 已安装：Docker 24+、Docker Compose v2、Git

```bash
# 安装 Docker（Ubuntu）
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# 重新登录后生效
```

### 1.2 拉取代码

```bash
git clone https://github.com/mark-13458/massage-next.git
cd massage-next
```

### 1.3 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`，**必须修改**以下字段：

```env
# 应用
APP_URL=https://your-domain.com          # 你的真实域名
BUSINESS_NAME="China TCM Massage"

# 数据库密码（改掉默认值）
MYSQL_PASSWORD=强密码_至少16位
MYSQL_ROOT_PASSWORD=强密码_至少16位

# 数据库连接（Docker 内部，用 mysql 主机名）
DATABASE_URL="mysql://appuser:强密码@mysql:3306/massage_app"

# 管理员账号（首次 seed 时使用）
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=强密码_至少12位含大小写数字

# Session 密钥（随机生成，至少 32 位）
SESSION_SECRET=用以下命令生成: openssl rand -hex 32

# SMTP（邮件通知，可选但推荐配置）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@your-domain.com
```

生成 SESSION_SECRET：
```bash
openssl rand -hex 32
```

### 1.4 配置 Nginx SSL

将 SSL 证书放入 `nginx/ssl/`：
```
nginx/ssl/cert.pem
nginx/ssl/key.pem
```

使用 Let's Encrypt（推荐）：
```bash
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com
# 证书路径：/etc/letsencrypt/live/your-domain.com/
```

### 1.5 启动服务

```bash
# 构建并启动所有容器（首次需要几分钟）
docker compose -f docker-compose.prod.yml up -d --build

# 查看启动状态
docker compose -f docker-compose.prod.yml ps

# 查看 web 容器日志
docker compose -f docker-compose.prod.yml logs -f web
```

容器启动时 `docker-entrypoint.sh` 会自动执行：
1. `prisma db push`（同步数据库 schema）
2. 检查 User 表是否为空，为空则运行 `seed.js`（初始化管理员、服务、FAQ 等）
3. 启动 `node server.js`

### 1.6 验证部署

```bash
# 健康检查
curl https://your-domain.com/api/healthz
# 期望返回：{"status":"ok"}

# 检查容器状态
docker compose -f docker-compose.prod.yml ps
# 期望：mysql Healthy，web Healthy，nginx running
```

访问 `https://your-domain.com/admin` 用配置的管理员账号登录。

---

## 二、日常代码更新（已部署服务器）

### 2.1 标准更新流程

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 重新构建并重启（零停机滚动更新）
docker compose -f docker-compose.prod.yml up -d --build

# 3. 查看日志确认启动正常
docker compose -f docker-compose.prod.yml logs -f web --tail=50

# 4. 验证
curl https://your-domain.com/api/healthz
```

> `--build` 会重新构建镜像，`up -d` 会替换旧容器。MySQL 数据卷不受影响。

### 2.2 仅有 schema 变更时

如果 `prisma/schema.prisma` 有改动，容器启动时 `prisma db push` 会自动同步，无需手动操作。

如果需要手动执行：
```bash
docker compose -f docker-compose.prod.yml exec web node prisma-cli/node_modules/.bin/prisma db push --schema=./prisma/schema.prisma
```

### 2.3 回滚

```bash
# 回滚到上一个 commit
git log --oneline -5          # 找到目标 commit hash
git checkout <commit-hash>

# 重新构建
docker compose -f docker-compose.prod.yml up -d --build

# 恢复到 main
git checkout main
```

---

## 三、依赖升级

### 3.1 检查漏洞

```bash
npm audit
```

### 3.2 升级 Next.js / React

```bash
# 查看当前 latest 版本
npm show next dist-tags

# 升级（同时升级 React 和 next-intl）
npm install next@latest react@latest react-dom@latest next-intl@latest --legacy-peer-deps
npm install --save-dev @types/react@latest @types/react-dom@latest --legacy-peer-deps

# 验证构建
npm run build

# 提交
git add package.json package-lock.json
git commit -m "chore: upgrade next/react to latest"
git push origin main
```

### 3.3 升级 Prisma

```bash
npm install prisma@latest @prisma/client@latest --save-dev
npm install @prisma/client@latest

# 重新生成 client
npx prisma generate

# 验证构建
npm run build
```

> 注意：Prisma major 版本升级（如 5→6）需要检查 breaking changes。

### 3.4 升级 Node.js（Dockerfile）

修改 `Dockerfile` 中所有 `FROM node:20-bullseye-slim` 为目标版本：

```dockerfile
FROM node:22-bookworm-slim AS deps
# ...
FROM node:22-bookworm-slim AS build
# ...
FROM node:22-bookworm-slim AS prisma-cli
# ...
FROM node:22-bookworm-slim AS run
```

然后重新构建部署：
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 3.5 修复安全漏洞（快速路径）

```bash
# 自动修复非 breaking change 的漏洞
npm audit fix

# 验证
npm audit
npm run build

# 提交
git add package.json package-lock.json
git commit -m "chore: fix security vulnerabilities"
git push origin main
```

---

## 四、服务器迁移

### 4.1 迁移前准备（旧服务器）

**备份数据库：**
```bash
docker compose -f docker-compose.prod.yml exec mysql \
  mysqldump -u appuser -p${MYSQL_PASSWORD} massage_app \
  > backup_$(date +%Y%m%d_%H%M%S).sql
```

**备份上传文件：**
```bash
docker compose -f docker-compose.prod.yml exec web \
  tar -czf /tmp/uploads_backup.tar.gz /app/public/uploads

docker cp massage-web-prod:/tmp/uploads_backup.tar.gz ./uploads_backup.tar.gz
```

**记录当前 commit：**
```bash
git log --oneline -1
```

### 4.2 新服务器部署

按照「一、首次部署」完成基础部署后：

**恢复数据库：**
```bash
# 将备份文件传到新服务器
scp backup_*.sql user@new-server:/tmp/

# 导入数据（容器启动后执行）
docker compose -f docker-compose.prod.yml exec -T mysql \
  mysql -u appuser -p${MYSQL_PASSWORD} massage_app \
  < /tmp/backup_*.sql
```

**恢复上传文件：**
```bash
# 将备份传到新服务器
scp uploads_backup.tar.gz user@new-server:/tmp/

# 解压到 volume
docker compose -f docker-compose.prod.yml exec web \
  tar -xzf /tmp/uploads_backup.tar.gz -C /
```

### 4.3 验证迁移结果

```bash
# 健康检查
curl https://your-domain.com/api/healthz

# 检查数据库记录数（对比旧服务器）
docker compose -f docker-compose.prod.yml exec mysql \
  mysql -u appuser -p${MYSQL_PASSWORD} massage_app \
  -e "SELECT COUNT(*) FROM Appointment; SELECT COUNT(*) FROM Service;"

# 检查上传文件
docker compose -f docker-compose.prod.yml exec web ls /app/public/uploads/
```

### 4.4 DNS 切换

确认新服务器一切正常后，将域名 DNS A 记录指向新服务器 IP。DNS 生效后（通常 5-30 分钟），旧服务器可以停止。

---

## 五、常用运维命令

```bash
# 查看所有容器状态
docker compose -f docker-compose.prod.yml ps

# 查看实时日志
docker compose -f docker-compose.prod.yml logs -f web
docker compose -f docker-compose.prod.yml logs -f mysql

# 进入 web 容器
docker compose -f docker-compose.prod.yml exec web sh

# 进入 MySQL
docker compose -f docker-compose.prod.yml exec mysql mysql -u appuser -p

# 重启单个容器
docker compose -f docker-compose.prod.yml restart web

# 停止所有容器（数据保留）
docker compose -f docker-compose.prod.yml down

# 停止并删除数据（危险！）
docker compose -f docker-compose.prod.yml down -v

# 查看磁盘使用
docker system df
docker compose -f docker-compose.prod.yml exec web du -sh /app/public/uploads/
```

---

## 六、故障排查

### Web 容器无法启动

```bash
docker compose -f docker-compose.prod.yml logs web --tail=100
```

常见原因：
- `DATABASE_URL` 配置错误 → 检查 `.env` 中的密码和主机名
- MySQL 未就绪 → 等待 MySQL healthy 后 web 会自动重试
- 端口冲突 → 检查 `APP_PORT` 是否被占用

### 数据库连接失败

```bash
# 检查 MySQL 状态
docker compose -f docker-compose.prod.yml exec mysql mysqladmin ping -u root -p

# 检查连接字符串（注意 Docker 内用 mysql 主机名，不是 localhost）
echo $DATABASE_URL
```

### 上传图片无法访问

```bash
# 检查文件是否存在
docker compose -f docker-compose.prod.yml exec web ls /app/public/uploads/

# 检查 Nginx 配置中 /uploads/ 路径是否正确代理
docker compose -f docker-compose.prod.yml exec nginx nginx -t
```

### 邮件不发送

```bash
# 后台 → 系统设置 → 点击"发送测试邮件"
# 查看数据库邮件日志
docker compose -f docker-compose.prod.yml exec mysql \
  mysql -u appuser -p${MYSQL_PASSWORD} massage_app \
  -e "SELECT * FROM EmailLog ORDER BY createdAt DESC LIMIT 10;"
```

---

## 七、定期维护

### 每月

```bash
# 检查安全漏洞
npm audit

# 清理 Docker 无用镜像
docker image prune -f

# 备份数据库
docker compose -f docker-compose.prod.yml exec mysql \
  mysqldump -u appuser -p${MYSQL_PASSWORD} massage_app \
  > backup_$(date +%Y%m%d).sql
```

### 每季度

- 检查 Next.js 是否有新的稳定版本（`npm show next dist-tags`）
- 检查 Node.js LTS 版本更新（[nodejs.org/en/about/releases](https://nodejs.org/en/about/releases)）
- 更新 SSL 证书（Let's Encrypt 自动续期，确认 cron 正常运行）
- 审查后台审计日志（`/admin/settings/audit-logs`）
