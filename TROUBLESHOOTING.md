# 故障排除指南

## 常见问题和解决方案

### 问题1：应用无法启动，显示Next.js相关错误

**原因：** 系统的自动dev服务器还在尝试运行旧的Next.js项目。

**解决方案：**
1. 不要使用系统的自动dev服务器
2. 使用手动启动方式：
   ```bash
   # 方式一：使用启动脚本
   cd /home/z/my-project
   bash start.sh

   # 方式二：分别启动
   # 终端1
   cd /home/z/my-project/backend
   npm run start:dev

   # 终端2
   cd /home/z/my-project/frontend
   npm run dev
   ```

### 问题2：前端显示"网络错误"或"无法连接"

**原因：** 后端服务未启动或端口配置错误。

**解决方案：**
1. 确认后端服务正在运行：
   ```bash
   curl http://localhost:3001/auth/register
   # 应该返回404或400，而不是连接失败
   ```

2. 检查后端端口是否正确：
   ```bash
   netstat -tlnp | grep 3001
   ```

3. 检查`backend/.env`中的PORT配置：
   ```bash
   cat backend/.env | grep PORT
   ```

4. 重启后端服务：
   ```bash
   cd backend
   npm run start:dev
   ```

### 问题3：WebSocket连接失败

**原因：** WebSocket配置或端口问题。

**解决方案：**
1. 检查浏览器控制台的WebSocket连接错误
2. 确认后端WebSocket网关已启动
3. 检查`frontend/vite.config.ts`中的代理配置
4. 确认`frontend/src/services/websocket.ts`中的端口配置

### 问题4：数据库连接失败

**原因：** PostgreSQL未启动或配置错误。

**解决方案：**
1. 检查Docker容器状态：
   ```bash
   docker-compose ps
   ```

2. 启动数据库服务：
   ```bash
   docker-compose up -d
   ```

3. 检查数据库连接：
   ```bash
   docker exec -it chatapp-postgres psql -U postgres -d chatapp -c "SELECT 1;"
   ```

4. 检查`backend/.env`中的数据库配置：
   ```bash
   cat backend/.env | grep DATABASE
   ```

### 问题5：依赖安装失败

**原因：** npm缓存问题或网络问题。

**解决方案：**
```bash
# 清除npm缓存
npm cache clean --force

# 删除node_modules和lock文件
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### 问题6：端口已被占用

**原因：** 5173或3001端口已被其他服务占用。

**解决方案：**
1. 查找占用端口的进程：
   ```bash
   # 前端端口
   lsof -i :5173

   # 后端端口
   lsof -i :3001
   ```

2. 停止占用端口的进程或修改端口配置

### 问题7：登录后页面空白或404

**原因：** 路由配置问题或认证token问题。

**解决方案：**
1. 打开浏览器开发者工具，检查：
   - Console中的错误信息
   - Network中的请求状态
   - Application/Local Storage中是否有token

2. 清除浏览器缓存和Local Storage：
   ```javascript
   localStorage.clear()
   ```

3. 刷新页面重新登录

### 问题8：消息无法发送或接收

**原因：** WebSocket连接问题或后端服务异常。

**解决方案：**
1. 检查浏览器控制台的WebSocket状态
2. 检查后端日志中的WebSocket连接信息
3. 确认用户已成功登录
4. 尝试刷新页面重新建立连接

### 问题9：界面样式异常

**原因：** Tailwind CSS未正确加载。

**解决方案：**
1. 检查`frontend/index.css`中是否包含Tailwind指令：
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

2. 检查`frontend/tailwind.config.js`配置

3. 重启前端开发服务器

### 问题10：深色/浅色主题切换不工作

**原因：** LocalStorage中的主题设置问题。

**解决方案：**
1. 清除LocalStorage中的theme设置
2. 检查`ChatSidebar.tsx`中的主题切换逻辑
3. 确认CSS变量正确配置

## 诊断命令

### 检查所有服务状态
```bash
# 检查进程
ps aux | grep -E "(node|nest|vite)"

# 检查端口
netstat -tlnp | grep -E "(3001|5173|5432|6379)"

# 检查Docker容器
docker-compose ps
```

### 查看日志
```bash
# 后端日志
cd backend && npm run start:dev

# 前端日志
cd frontend && npm run dev

# 检查dev.log
tail -f /home/z/my-project/dev.log
```

### 测试API
```bash
# 测试后端健康
curl http://localhost:3001

# 测试注册API
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"123456"}'

# 测试登录API
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'
```

## 获取帮助

如果以上解决方案都无法解决您的问题，请：

1. 查看浏览器控制台的错误信息
2. 查看后端和前端的终端输出
3. 检查`STATUS.md`了解已知问题
4. 查看项目文档：`README.md`、`QUICKSTART.md`

## 重置项目

如果所有方法都失败了，可以尝试重置项目：

```bash
# 停止所有服务
bash stop.sh

# 清理
rm -rf backend/node_modules backend/dist
rm -rf frontend/node_modules frontend/dist

# 重新安装依赖
cd backend && npm install
cd ../frontend && npm install

# 重新启动
cd /home/z/my-project
bash start.sh
```
