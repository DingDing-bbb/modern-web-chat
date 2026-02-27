# 快速启动指南

## 前置要求

- Node.js 18+
- PostgreSQL 16+ (或使用Docker)
- Redis 7+ (或使用Docker)
- npm 或 bun

## 快速开始

### 1. 克隆或进入项目目录

```bash
cd /home/z/my-project
```

### 2. 启动数据库服务（可选，如果已有数据库可跳过）

```bash
docker-compose up -d
```

### 3. 安装依赖

```bash
# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install
```

### 4. 配置环境变量

后端环境变量已经配置好，默认使用：
- 数据库：localhost:5432
- Redis：localhost:6379
- 后端端口：3001

如果需要修改，可以编辑 `backend/.env` 文件。

### 5. 启动服务

#### 方式一：使用启动脚本（推荐）

```bash
# 在项目根目录
bash start.sh
```

#### 方式二：分别启动

需要打开两个终端窗口：

```bash
# 终端1 - 启动后端
cd backend
npm run start:dev

# 终端2 - 启动前端
cd frontend
npm run dev
```

#### 方式三：使用npm脚本（需安装concurrently）

```bash
cd /home/z/my-project
npm install
npm run dev
```

### 6. 访问应用

打开浏览器访问：http://localhost:5173

如果系统有预览面板，请使用预览面板查看应用。

## 停止服务

```bash
# 使用停止脚本
bash stop.sh

# 或者手动按 Ctrl+C 停止对应的终端
```

## 首次使用

1. 点击"立即注册"创建账户
2. 填写用户名、邮箱和密码
3. 注册后会自动登录并跳转到聊天界面
4. 点击左上角的"+"按钮创建新对话
5. 选择要聊天的用户或创建群组
6. 开始聊天！

## 常见问题

### 数据库连接失败

- 检查PostgreSQL是否正在运行
- 检查`backend/.env`中的数据库配置是否正确
- 如果使用Docker，确保容器正在运行：`docker-compose ps`

### WebSocket连接失败

- 确保后端服务正在运行
- 检查防火墙设置
- 查看浏览器控制台是否有错误信息

### 前端无法连接后端

- 检查后端是否运行在正确的端口（默认3001）
- 检查`vite.config.ts`中的代理配置
- 查看网络请求是否正确

## 开发模式

- 前端：http://localhost:5173
- 后端API：http://localhost:3001
- WebSocket：ws://localhost:3001

## 生产构建

```bash
# 构建前端
cd frontend
npm run build

# 构建后端
cd ../backend
npm run build

# 启动生产服务
cd backend
npm run start:prod
```

## 项目结构

```
.
├── backend/          # NestJS后端
├── frontend/         # Vite + React前端
├── CHANGELOG.md      # 更新日志
├── README.md         # 项目说明
└── QUICKSTART.md     # 本文件
```

## 更多信息

查看 [README.md](README.md) 了解更多详细信息。
