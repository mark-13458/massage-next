# 上线前最终检查清单 & 部署指南

## 1. 环境准备

### 开发环境
```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local

# 启动 Docker 服务
docker-compose up -d

# 运行数据库迁移
npx prisma migrate deploy

# 启动开发服务器
npm run dev
```

### 生产环境
```bash
# 安装依赖
npm ci --production

# 配置生产环境变量
cp .env.example .env.production

# 生成 Prisma Client
npx prisma generate

# 构建应用
npm run build

# 启动生产服务器
npm start
```

---

## 2. 数据库检查清单

- [ ] MySQL 服务运行正常
- [ ] 数据库连接字符串正确
- [ ] 所有迁移已执行（Phase 1-17）
- [ ] 管理员账户已创建
- [ ] 初始数据已 seed

**验证命令**:
```bash
# 检查迁移状态
npx prisma migrate status

# 打开 Prisma Studio 查看数据
npx prisma studio
```

---

## 3. SMTP / 邮件配置

### 开发环境（使用 Mailhog）
```bash
# 访问 Mailhog Web UI
http://localhost:8025

# 检查收件箱中的测试邮件
```

### 生产环境（配置真实 SMTP）

**步骤 1**: 获取 SMTP 凭证
- Gmail: 使用 App Password
- SendGrid: 使用 API Key
- AWS SES: 使用 IAM 凭证
- 其他服务: 参考官方文档

**步骤 2**: 更新环境变量
```env
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@your-domain.com
```

**步骤 3**: 验证配置
```bash
# 访问后台邮件配置验证页面
http://your-domain.com/admin/settings

# 点击"检查邮件配置"
# 输入测试邮箱并发送测试邮件
```

**步骤 4**: 监控邮件发送
```bash
# 检查邮件日志
SELECT * FROM EmailLog ORDER BY createdAt DESC;

# 监控邮件发送故障
SELECT * FROM EmailLog WHERE status = 'failed';
```

---

## 4. 功能验证清单

### 前台功能
- [ ] 首页加载正常
- [ ] 服务列表显示
- [ ] 预约表单可提交
- [ ] 改约链接可访问
- [ ] 取消链接可访问
- [ ] 隐私政策页面可访问
- [ ] 双语切换正常
- [ ] 响应式设计（手机/平板/桌面）

### 后台功能
- [ ] 后台登录正常
- [ ] 预约列表显示
- [ ] 预约详情可编辑
- [ ] 预约可确认/完成/取消
- [ ] 服务管理正常
- [ ] 内容编辑正常
- [ ] 图库上传正常
- [ ] 审计日志可查看
- [ ] 邮件配置可验证

### 安全功能
- [ ] 频率限制有效
- [ ] 登录防暴力有效
- [ ] 审计日志记录完整
- [ ] 改约/取消 token 有效

### 邮件功能
- [ ] 预约确认邮件发送
- [ ] 改约通知邮件发送
- [ ] 取消通知邮件发送
- [ ] 邮件包含正确链接
- [ ] 邮件格式正确（HTML）
- [ ] 双语邮件测试

---

## 5. 性能验证

### 运行性能基准测试
```bash
# 执行性能测试
npm run benchmark

# 预期结果
# - 平均响应时间 < 500ms
# - 数据库查询 < 100ms
# - 邮件发送 < 2000ms
# - 页面加载 < 1000ms
```

### 监控指标
- 平均响应时间
- P95 响应时间
- 错误率
- 吞吐量（请求/秒）

---

## 6. 安全检查

### 环境变量
- [ ] SESSION_SECRET 已更改（长度 > 32）
- [ ] ADMIN_PASSWORD 已更改（强密码）
- [ ] DATABASE_URL 指向正确的数据库
- [ ] SMTP 凭证正确且安全
- [ ] 敏感信息不在代码中

### 数据库
- [ ] 已创建数据库备份
- [ ] 定期备份流程已建立
- [ ] 数据库访问受限

### API 安全
- [ ] CORS 配置正确
- [ ] HTTPS 启用
- [ ] 安全头部设置（CSP, HSTS 等）
- [ ] 速率限制启用

### 代码安全
- [ ] 没有 console.log 暴露敏感信息
- [ ] 密钥不在版本控制中
- [ ] 依赖项已更新到最新安全版本

---

## 7. 隐私与合规

### GDPR 合规
- [ ] 隐私政策页面已完成
- [ ] 数据删除流程已实现
- [ ] 数据导出功能已实现
- [ ] 隐私同意已记录
- [ ] 30 天 grace period 已配置

### 数据保护
- [ ] 数据保留期已设置（180 天）
- [ ] 定期删除任务已配置
- [ ] 客户可请求数据删除
- [ ] 客户可导出个人数据

---

## 8. Docker 部署验证

### 本地 Docker 测试
```bash
# 构建镜像
docker build -t massage-next:latest .

# 启动容器
docker-compose up -d

# 验证服务状态
docker-compose ps

# 查看日志
docker-compose logs -f web

# 运行迁移
docker-compose exec web npx prisma migrate deploy

# 访问应用
http://localhost:3000
```

### 容器健康检查
- [ ] Web 容器健康
- [ ] MySQL 容器健康
- [ ] Mailhog 容器健康（如果使用）
- [ ] Nginx 容器正常（如果使用）

### 体积优化
- [ ] `.dockerignore` 已优化
- [ ] 镜像大小合理（< 500MB）
- [ ] 分层构建正确

---

## 9. 监控与日志

### 日志配置
- [ ] 应用日志输出到文件
- [ ] 数据库慢查询日志启用
- [ ] 邮件发送日志记录
- [ ] 错误追踪（可选 Sentry）

### 监控告警
- [ ] 高错误率告警
- [ ] 邮件发送失败告警
- [ ] 数据库连接告警
- [ ] 磁盘空间不足告警

---

## 10. 备份与恢复

### 数据库备份
```bash
# 每日自动备份
mysqldump -u appuser -p massage_app > backup_$(date +%Y%m%d).sql

# 恢复备份
mysql -u appuser -p massage_app < backup_20240316.sql
```

### 文件备份
```bash
# 备份上传文件
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz public/uploads/

# 恢复文件
tar -xzf uploads_backup_20240316.tar.gz
```

### 备份计划
- [ ] 每日午夜执行备份
- [ ] 备份存储在安全位置
- [ ] 定期测试恢复流程
- [ ] 备份保留策略已设置

---

## 11. 上线前最终检查

### 功能测试
- [ ] 完整端到端流程测试（创建→改约→取消）
- [ ] 所有邮件场景测试
- [ ] 隐私与数据删除流程测试
- [ ] 错误处理与异常测试

### 性能测试
- [ ] 负载测试（100+ 并发用户）
- [ ] 邮件发送压力测试
- [ ] 数据库查询性能测试

### 安全测试
- [ ] 渗透测试基础检查
- [ ] XSS 防护验证
- [ ] SQL 注入防护验证
- [ ] CSRF 防护验证

### 可用性测试
- [ ] 浏览器兼容性（Chrome、Firefox、Safari、Edge）
- [ ] 移动端兼容性（iOS、Android）
- [ ] 辅助功能测试（键盘导航、屏幕阅读器）

---

## 12. 部署流程

### 第一次部署

```bash
# 1. 准备服务器
ssh user@your-server.com
cd /var/www/massage-next

# 2. 克隆代码
git clone https://github.com/your-repo/massage-next.git .
cd massage-next

# 3. 配置环境
cp .env.example .env.production
# 编辑 .env.production，填入生产环境值

# 4. 构建并启动
docker-compose -f docker-compose.prod.yml up -d

# 5. 运行迁移
docker-compose exec web npx prisma migrate deploy

# 6. 验证服务
curl http://localhost/api/healthz
```

### 后续更新

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 重新构建镜像
docker-compose build

# 3. 重启容器
docker-compose up -d

# 4. 验证迁移
docker-compose exec web npx prisma migrate status

# 5. 检查日志
docker-compose logs -f web
```

---

## 13. 上线后监控

### 每日检查
- [ ] 应用正常运行
- [ ] 没有错误日志激增
- [ ] 邮件正常发送
- [ ] 数据库连接正常

### 每周检查
- [ ] 性能指标正常
- [ ] 备份成功执行
- [ ] 安全更新需求
- [ ] 用户反馈处理

### 每月检查
- [ ] 审计日志审查
- [ ] 数据库优化
- [ ] 备份恢复演练
- [ ] 容量规划

---

## 14. 故障排查

### 常见问题

**问题**: 邮件不发送
```bash
# 检查 SMTP 配置
docker-compose exec web curl smtp://user:pass@host:port

# 查看邮件日志
docker-compose exec mysql mysql -u root -p -e "SELECT * FROM EmailLog WHERE status='failed';"
```

**问题**: 数据库连接失败
```bash
# 检查 MySQL 状态
docker-compose ps

# 查看数据库日志
docker-compose logs mysql
```

**问题**: 高内存使用
```bash
# 检查容器内存使用
docker stats

# 优化 Node.js 内存
NODE_OPTIONS="--max-old-space-size=512" npm start
```

---

## 15. 上线后回滚计划

### 快速回滚步骤
```bash
# 1. 停止当前服务
docker-compose stop web

# 2. 回滚到上一个版本
git checkout HEAD~1

# 3. 重新构建并启动
docker-compose up -d web

# 4. 验证服务
curl http://localhost/api/healthz
```

### 数据库回滚
```bash
# 查看迁移历史
npx prisma migrate status

# 重置到上一个迁移
npx prisma migrate resolve --rolled-back 20240316000000_previous_migration
```

---

## 上线检查清单总结

```
✅ 环境配置
✅ 数据库就绪
✅ SMTP 配置
✅ 功能验证
✅ 性能测试
✅ 安全检查
✅ 隐私合规
✅ Docker 就绪
✅ 备份流程
✅ 监控告警
✅ 部署流程
✅ 回滚计划

🎉 所有检查完成，可以上线！
```
