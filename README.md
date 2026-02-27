# 现代Web聊天应用

一个专业、现代的Web聊天应用，采用最新的技术栈构建，遵循Apple Human Interface Guidelines设计规范。

## 技术栈

### 前端
- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- Zustand (状态管理)
- TanStack Query (数据获取)
- Socket.IO Client (实时通信)
- Framer Motion (动画)
- Dexie.js (IndexedDB封装)
- React Router DOM (路由)
- date-fns (日期处理)
- Lucide React (图标)

### 后端
- Node.js
- NestJS 11
- Socket.IO (服务端)
- TypeORM
- PostgreSQL
- JWT (身份验证)
- bcrypt (密码加密)

## 功能特性

### 用户功能
- 用户注册（用户名、邮箱、密码）
- 用户登录
- 邮箱状态管理（已验证/未验证）
- 用户在线状态
- 头像显示

### 聊天功能
- 实时消息发送和接收
- 私聊对话
- 群组聊天
- 对话列表
- 消息历史
- 输入状态指示
- 用户在线状态显示

### UI/UX
- 深色/浅色主题切换
- 响应式设计
- 流畅动画过渡
- 现代化界面设计
- Apple风格交互体验

## 项目结构

```
.
├── backend/                 # NestJS后端
│   ├── src/
│   │   ├── auth/           # 认证模块
│   │   ├── chat/           # 聊天模块
│   │   ├── users/          # 用户模块
│   │   ├── websocket/      # WebSocket服务
│   │   ├── database/       # 数据库配置
│   │   ├── guards/         # 认证守卫
│   │   └── main.ts         # 应用入口
│   ├── .env                # 环境变量
│   └── package.json
├── frontend/               # Vite + React前端
│   ├── src/
│   │   ├── components/     # React组件
│   │   │   ├── auth/       # 认证组件
│   │   │   ├── chat/       # 聊天组件
│   │   │   └── ui/         # UI组件
│   │   ├── store/          # Zustand状态管理
│   │   ├── services/       # API和WebSocket服务
│   │   ├── types/          # TypeScript类型
│   │   └── utils/          # 工具函数
│   ├── .env
│   └── package.json
├── CHANGELOG.md            # 更新日志
└── README.md
```

## 安装和运行

### 使用Docker Compose（推荐）

1. 启动PostgreSQL和Redis：
```bash
docker-compose up -d
```

### 后端

1. 进入后端目录并安装依赖：
```bash
cd backend
npm install
```

2. 配置环境变量（.env文件）：
```env
PORT=3001
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=chatapp
DATABASE_SYNCHRONIZE=true
```

3. 启动后端服务：
```bash
npm run start:dev
```

### 前端

1. 进入前端目录并安装依赖：
```bash
cd frontend
npm install
```

2. 启动前端开发服务器：
```bash
npm run dev
```

3. 在浏览器中打开 http://localhost:5173

### 一键启动

在项目根目录下：
```bash
npm run dev
```

这会同时启动后端和前端服务。

## API端点

### 认证
- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录
- `POST /auth/validate` - 验证令牌

### 用户
- `GET /users/me` - 获取当前用户信息
- `PUT /users/me` - 更新当前用户信息
- `GET /users` - 获取所有用户
- `GET /users/:id` - 获取指定用户信息

### 聊天
- `GET /chat/conversations` - 获取用户对话列表
- `POST /chat/conversations` - 创建新对话
- `GET /chat/conversations/:id` - 获取对话详情
- `GET /chat/conversations/:id/messages` - 获取对话消息
- `POST /chat/messages` - 发送消息
- `PUT /chat/conversations/:id/read` - 标记消息为已读
- `DELETE /chat/messages/:id` - 删除消息

## WebSocket事件

### 客户端发送
- `join:conversation` - 加入对话房间
- `leave:conversation` - 离开对话房间
- `send:message` - 发送消息
- `typing:start` - 开始输入
- `typing:stop` - 停止输入

### 服务端发送
- `new:message` - 新消息通知
- `user:typing` - 用户输入状态
- `user:online` - 用户上线
- `user:offline` - 用户下线

## 开发说明

- 前端运行在端口 5173
- 后端运行在端口 3001
- WebSocket连接通过Socket.IO实现
- 数据库使用PostgreSQL

## 许可证

MIT
