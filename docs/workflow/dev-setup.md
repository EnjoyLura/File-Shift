# FileShift 开发环境搭建

## 1. 环境要求

### 1.1 系统要求

- **操作系统**：Windows 10/11, macOS 12+, Ubuntu 20.04+
- **内存**：≥ 8GB RAM（推荐16GB）
- **磁盘**：≥ 10GB 可用空间

### 1.2 必装软件

| 软件           | 版本要求   | 用途              | 安装方式(Windows)                  |
| -------------- | ---------- | ----------------- | ---------------------------------- |
| Node.js        | ≥ 20.x LTS | 运行时            | `winget install OpenJS.NodeJS.LTS` |
| pnpm           | ≥ 8.x      | 包管理            | `npm install -g pnpm`              |
| Docker Desktop | ≥ 4.x      | 容器(MySQL/Redis) | 官网下载                           |
| Git            | ≥ 2.x      | 版本控制          | `winget install Git.Git`           |
| FFmpeg         | ≥ 6.x      | 音视频处理        | `winget install FFmpeg`            |
| LibreOffice    | ≥ 7.x      | 文档转换          | 官网下载                           |
| VS Code        | latest     | IDE               | 官网下载                           |

### 1.3 可选软件

| 软件             | 用途             |
| ---------------- | ---------------- |
| DBeaver/Navicat  | 数据库可视化管理 |
| Redis Insight    | Redis可视化      |
| Postman/Insomnia | API调试          |

---

## 2. 安装步骤

### 2.1 安装 Node.js + pnpm

```powershell
# Windows (PowerShell)
winget install OpenJS.NodeJS.LTS
node --version  # 确认 v20.x+

# 启用 corepack (pnpm)
corepack enable
corepack prepare pnpm@latest --activate
pnpm --version  # 确认 8.x+
```

### 2.2 安装 Docker Desktop

1. 下载 Docker Desktop: https://www.docker.com/products/docker-desktop
2. 安装后启动，确保 WSL2 后端已启用
3. 验证：`docker --version` + `docker compose version`

### 2.3 安装 FFmpeg

```powershell
# Windows (winget)
winget install FFmpeg

# 或使用 Scoop
scoop install ffmpeg

# 验证
ffmpeg -version
```

### 2.4 安装 LibreOffice

1. 下载：https://www.libreoffice.org/download/download/
2. 安装时选择"标准安装"
3. 将安装路径添加到 PATH 环境变量
   - Windows 默认: `C:\Program Files\LibreOffice\program`
4. 验证：`soffice --version`

---

## 3. 项目初始化

### 3.1 克隆项目

```powershell
cd d:\AI
git clone <repository_url> FlieShift
cd FlieShift
```

### 3.2 安装依赖

```powershell
pnpm install
```

### 3.3 启动数据库服务

```powershell
docker compose up -d mysql redis
```

等待容器启动完成（约10-30秒）：

```powershell
docker compose ps  # 确认 mysql 和 redis 状态为 running
```

### 3.4 环境变量配置

```powershell
# 复制环境变量模板
Copy-Item .env.example .env.local
```

编辑 `.env.local` 填入本地配置（默认值即可用于本地开发）。

### 3.5 数据库初始化

```powershell
# 运行数据库迁移
pnpm --filter server migration:run
```

### 3.6 启动开发服务

```powershell
# 一键启动前后端（Turborepo并行）
pnpm dev
```

或分别启动：

```powershell
# 终端1：启动后端
pnpm --filter server dev

# 终端2：启动前端
pnpm --filter web dev
```

### 3.7 验证启动成功

| 服务        | 地址                             | 预期结果               |
| ----------- | -------------------------------- | ---------------------- |
| 前端        | http://localhost:3000            | 看到首页               |
| 后端API     | http://localhost:3001/api/health | 返回 `{"status":"ok"}` |
| Swagger文档 | http://localhost:3001/api/docs   | 看到API文档            |
| MySQL       | localhost:3306                   | 可用DBeaver连接        |
| Redis       | localhost:6379                   | 可用Redis Insight连接  |

---

## 4. VS Code 推荐配置

### 4.1 推荐扩展

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-azuretools.vscode-docker",
    "eamodio.gitlens",
    "usernamehw.errorlens",
    "christian-kohler.path-intellisense"
  ]
}
```

### 4.2 工作区设置

```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.experimental.classRegex": [["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]]
}
```

---

## 5. 常用开发命令

```powershell
# 启动全部服务
pnpm dev

# 仅启动前端
pnpm --filter web dev

# 仅启动后端
pnpm --filter server dev

# 代码检查
pnpm lint

# 代码格式化
pnpm format

# 运行测试
pnpm test

# 构建所有包
pnpm build

# 数据库迁移
pnpm --filter server migration:generate -- -n MigrationName
pnpm --filter server migration:run
pnpm --filter server migration:revert

# Docker 管理
docker compose up -d          # 启动数据库
docker compose down           # 停止数据库
docker compose logs -f mysql  # 查看MySQL日志

# 清理
pnpm clean                    # 清理构建产物
docker compose down -v        # 清理数据库数据（慎用）
```

---

## 6. 常见问题

### Q: pnpm install 报错网络超时

```powershell
# 设置国内镜像
pnpm config set registry https://registry.npmmirror.com
```

### Q: Docker MySQL 启动失败

```powershell
# 检查端口是否被占用
netstat -ano | findstr :3306
# 如被占用，修改 docker-compose.yml 端口映射
```

### Q: LibreOffice 命令找不到

```powershell
# Windows 添加到 PATH
$env:PATH += ";C:\Program Files\LibreOffice\program"
# 或在 .env.local 中指定路径
LIBREOFFICE_PATH="C:\Program Files\LibreOffice\program\soffice.exe"
```

### Q: FFmpeg 命令找不到

```powershell
# 验证安装
where ffmpeg
# 如果找不到，手动添加到 PATH 或重启终端
```

### Q: Sharp 安装失败 (Windows)

```powershell
# 需要 Visual C++ Build Tools
npm install --global windows-build-tools
# 或者重新安装
pnpm rebuild sharp
```
