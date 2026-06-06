# FileShift 发布检查清单

## 1. 发布前检查

### 1.1 代码质量

- [ ] 所有 lint 检查通过 (`pnpm lint`)
- [ ] 代码已经过 format (`pnpm format`)
- [ ] TypeScript 无编译错误 (`pnpm build`)
- [ ] 无 console.log 残留（生产代码中）
- [ ] 无 TODO/FIXME 标记遗留在关键路径
- [ ] 所有硬编码值已提取为配置/常量

### 1.2 测试验证

- [ ] 单元测试全部通过 (`pnpm test`)
- [ ] 覆盖率满足标准（Service≥80%）
- [ ] 集成测试通过（API接口）
- [ ] 核心流程人工回归测试通过：
  - [ ] 注册 → 登录 → 查看积分
  - [ ] 上传 → 转换 → 下载（图片类）
  - [ ] 上传 → 转换 → 下载（文档类）
  - [ ] 上传 → 转换 → 下载（音视频类）
  - [ ] 积分不足 → 提示（不扣积分）
  - [ ] 转换失败 → 退还积分

### 1.3 安全检查

- [ ] 环境变量已正确配置（非默认密码）
- [ ] JWT密钥为强随机字符串（≥32位）
- [ ] CORS仅允许生产域名
- [ ] Rate Limiting 已启用
- [ ] 文件上传限制已配置
- [ ] HTTPS 证书有效（未过期）
- [ ] 数据库禁止外网直连
- [ ] Redis 已设置密码
- [ ] 错误响应不暴露内部信息
- [ ] 敏感数据日志已脱敏

### 1.4 功能验证

- [ ] 前端页面响应式布局正常（PC/平板/手机）
- [ ] 所有外部链接正确
- [ ] 图片资源加载正常
- [ ] API接口响应时间 < 500ms
- [ ] 文件上传/下载功能正常
- [ ] 转换进度显示正常
- [ ] 邮件发送功能正常

---

## 2. 部署执行

### 2.1 部署步骤

```powershell
# 1. 确保代码已提交并推送到main分支
git status  # 确认无未提交变更

# 2. 创建发布Tag
git tag -a v1.x.x -m "release: vX.X.X - 功能描述"
git push origin v1.x.x

# 3. 如果CI/CD未配置，手动部署：
# 登录服务器
ssh user@server

# 拉取最新代码
cd /opt/fileshift
git pull origin main

# 构建并重启
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# 检查容器状态
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=50
```

### 2.2 数据库变更

- [ ] 迁移文件已生成并测试
- [ ] 数据库备份已完成（变更前）
- [ ] 迁移执行成功
- [ ] 验证表结构符合预期

```powershell
# 备份数据库
docker exec mysql mysqldump -u root -p fileshift > backup_$(date +%Y%m%d).sql

# 执行迁移
docker exec nest-api node dist/migration-runner.js
```

---

## 3. 发布后验证

### 3.1 健康检查

- [ ] 所有容器状态为 running
- [ ] Health API 返回正常: `curl https://api.fileshift.cn/api/health`
- [ ] 前端页面可正常访问: `https://fileshift.cn`
- [ ] HTTPS 证书正常（浏览器无警告）
- [ ] API 响应时间正常

### 3.2 功能验证（线上环境）

- [ ] 注册新账号成功
- [ ] 登录成功
- [ ] 上传文件成功
- [ ] 图片转换成功
- [ ] 下载转换结果成功
- [ ] 积分正确扣减
- [ ] 积分流水记录正确

### 3.3 性能检查

- [ ] 首页加载时间 < 3秒
- [ ] API平均响应时间 < 500ms
- [ ] 无明显内存泄漏（监控30分钟）
- [ ] 磁盘空间充足

### 3.4 监控确认

- [ ] 日志正常输出（无大量错误）
- [ ] 监控指标正常
- [ ] 告警通道畅通（测试发送）

---

## 4. 回滚方案

### 4.1 快速回滚

```powershell
# 回滚到上一个版本
cd /opt/fileshift
git checkout <previous_tag>
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

### 4.2 数据库回滚

```powershell
# 回滚最近一次迁移
docker exec nest-api node dist/migration-revert.js

# 如需完整回滚，恢复备份
docker exec -i mysql mysql -u root -p fileshift < backup_YYYYMMDD.sql
```

### 4.3 回滚触发条件

| 条件                    | 操作                     |
| ----------------------- | ------------------------ |
| 核心API不可用(>5分钟)   | 立即回滚                 |
| 5xx错误率 > 5%(>10分钟) | 立即回滚                 |
| 数据库迁移失败          | 立即回滚                 |
| 非核心功能异常          | 评估影响，决定是否hotfix |

---

## 5. 发布通知

### 5.1 内部通知

发布完成后记录：

- 发布时间
- 发布版本号
- 主要变更内容
- 已知问题

### 5.2 版本变更记录

```markdown
## v1.x.x (YYYY-MM-DD)

### 新功能

- 新增XXX功能

### 优化

- 优化XXX性能

### 修复

- 修复XXX问题

### 已知问题

- XXX (计划下个版本修复)
```
