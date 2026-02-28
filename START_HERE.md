# 🚀 快速开始 - 请先阅读

## ⚠️ 重要提示

**不要使用系统的自动开发服务器（bun run dev）！**

系统的自动开发服务器还在尝试运行旧的Next.js项目，会导致错误。请使用以下手动方式启动项目。

## 📋 快速启动步骤

### 1️⃣ 启动数据库（可选）

```bash
cd /home/z/my-project
docker-compose up -d
```

如果数据库已经在运行，可以跳过这一步。

### 2️⃣ 安装依赖（首次运行）

```bash
# 后端
cd /home/z/my-project/backend
npm install

# 前端
cd /home/z/my-project/frontend
npm install
```

如果已经安装过，可以跳过这一步。

### 3️⃣ 启动服务

#### 推荐方式：使用启动脚本

```bash
cd /home/z/my-project
bash start.sh
```

这个脚本会自动启动后端和前端服务。

#### 或手动启动（需要两个终端）

**终端1 - 启动后端：**
```bash
cd /home/z/my-project/backend
npm run start:dev
```

等待看到 "Backend server is running on port 3001"

**终端2 - 启动前端：**
```bash
cd /home/z/my-project/frontend
npm run dev
```

等待看到 "Local: http://localhost:5173/"

### 4️⃣ 访问应用

**如果系统有预览面板：**
- 点击右上角的"Open in New Tab"按钮
- 或在预览面板中查看应用

**如果没有预览面板：**
- 在浏览器中打开：http://localhost:5173

### 5️⃣ 开始使用

1. 点击"立即注册"创建账户
2. 填写用户名、邮箱、密码
3. 注册后会自动登录
4. 点击"+"按钮创建对话
5. 开始聊天！

## 🛑 停止服务

```bash
cd /home/z/my-project
bash stop.sh
```

或按 Ctrl+C 停止各个终端。

## ❓ 遇到问题？

查看故障排除指南：[TROUBLESHOOTING.md](TROUBLESHOOTING.md)

## 📚 更多文档

- [README.md](README.md) - 完整项目文档
- [QUICKSTART.md](QUICKSTART.md) - 详细启动指南
- [STATUS.md](STATUS.md) - 项目状态
- [CHANGELOG.md](CHANGELOG.md) - 更新日志

## 🎯 项目信息

- **前端：** React 19 + Vite + TypeScript
- **后端：** NestJS + PostgreSQL + Socket.IO
- **前端端口：** 5173
- **后端端口：** 3001

---

祝您使用愉快！🎉
