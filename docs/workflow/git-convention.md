# FileShift Git 规范

## 1. 分支策略

### 1.1 分支命名

| 分支类型 | 命名格式          | 说明                     | 示例                      |
| -------- | ----------------- | ------------------------ | ------------------------- |
| 主分支   | `main`            | 生产环境代码，始终可部署 | `main`                    |
| 开发分支 | `dev`             | 日常开发集成分支         | `dev`                     |
| 功能分支 | `feat/<描述>`     | 新功能开发               | `feat/user-auth`          |
| 修复分支 | `fix/<描述>`      | Bug修复                  | `fix/upload-timeout`      |
| 热修复   | `hotfix/<描述>`   | 生产紧急修复             | `hotfix/payment-callback` |
| 发布分支 | `release/v<版本>` | 发布准备                 | `release/v1.0.0`          |

### 1.2 分支流程

```
main ──────────────────────────────────────────── (生产)
  │                              ↑ merge
  └── dev ────────────────────── (开发集成)
        │         ↑ merge        ↑ merge
        ├── feat/user-auth ────── 完成合入dev
        ├── feat/file-upload ──── 完成合入dev
        └── fix/login-bug ─────── 完成合入dev
```

### 1.3 工作流程

1. 从 `dev` 分支创建功能分支
2. 在功能分支上开发
3. 完成后提交 PR 到 `dev`
4. `dev` 稳定后合并到 `main` 发布

---

## 2. Commit Message 规范

### 2.1 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 2.2 Type 类型

| Type       | 说明                 | 示例                                 |
| ---------- | -------------------- | ------------------------------------ |
| `feat`     | 新功能               | `feat(auth): 添加邮箱注册功能`       |
| `fix`      | Bug修复              | `fix(upload): 修复大文件上传超时`    |
| `docs`     | 文档变更             | `docs: 更新API文档`                  |
| `style`    | 格式调整(不影响逻辑) | `style: 统一缩进为2空格`             |
| `refactor` | 重构(非新增/非修复)  | `refactor(credit): 重构积分计算逻辑` |
| `perf`     | 性能优化             | `perf(image): 优化图片压缩速度`      |
| `test`     | 添加/修改测试        | `test(auth): 添加登录单元测试`       |
| `chore`    | 构建/工具变更        | `chore: 更新依赖版本`                |
| `ci`       | CI/CD配置            | `ci: 添加GitHub Actions部署流程`     |

### 2.3 Scope 范围

| Scope        | 说明     |
| ------------ | -------- |
| `auth`       | 认证模块 |
| `user`       | 用户模块 |
| `file`       | 文件模块 |
| `conversion` | 转换模块 |
| `credit`     | 积分模块 |
| `payment`    | 支付模块 |
| `admin`      | 管理后台 |
| `web`        | 前端     |
| `server`     | 后端     |
| `worker`     | Worker   |
| `infra`      | 基础设施 |

### 2.4 示例

```
feat(auth): 实现邮箱注册功能

- 添加注册接口 POST /api/v1/auth/register
- 添加邮箱验证码发送
- 注册成功后自动赠送50积分
- 支持邀请码参数

Closes #12
```

---

## 3. 版本号规范

### 3.1 Semantic Versioning

格式：`v主版本.次版本.补丁版本` (如 `v1.2.3`)

| 变更             | 版本号变化 | 示例            |
| ---------------- | ---------- | --------------- |
| 不兼容的API变更  | 主版本+1   | v1.0.0 → v2.0.0 |
| 新功能(向后兼容) | 次版本+1   | v1.0.0 → v1.1.0 |
| Bug修复          | 补丁+1     | v1.0.0 → v1.0.1 |

### 3.2 Tag 规范

```bash
# 创建发布tag
git tag -a v1.0.0 -m "release: v1.0.0 首次公开发布"
git push origin v1.0.0
```

---

## 4. Git Hooks (Husky)

### 4.1 pre-commit

```bash
# 运行lint-staged（仅检查暂存文件）
pnpm lint-staged
```

### 4.2 commit-msg

```bash
# 使用commitlint校验commit message格式
pnpm commitlint --edit $1
```

### 4.3 lint-staged 配置

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml}": ["prettier --write"]
  }
}
```

---

## 5. .gitignore 规则

```gitignore
# 依赖
node_modules/

# 构建产物
.next/
dist/
build/

# 环境变量
.env
.env.local
.env.production

# 上传文件
uploads/

# IDE
.vscode/settings.json
.idea/

# 系统文件
.DS_Store
Thumbs.db

# 日志
*.log
logs/

# 测试覆盖率
coverage/

# Turbo
.turbo/
```

---

## 6. PR (Pull Request) 模板

```markdown
## 变更说明

<!-- 简要描述做了什么 -->

## 变更类型

- [ ] 新功能
- [ ] Bug修复
- [ ] 重构
- [ ] 文档
- [ ] 其他

## 测试情况

- [ ] 已通过本地测试
- [ ] 已添加相关单元测试
- [ ] 已验证页面渲染正常

## 截图（如涉及UI变更）

## 相关Issue

Closes #xxx
```
