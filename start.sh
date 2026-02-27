#!/bin/bash

echo "🚀 启动聊天应用..."

# 检查Docker是否在运行
if ! docker ps > /dev/null 2>&1; then
    echo "⚠️  Docker未运行，跳过数据库启动"
    echo "   请确保PostgreSQL和Redis已手动启动"
else
    echo "📦 启动数据库服务..."
    docker-compose up -d
fi

# 启动后端
echo "🔧 启动后端服务..."
cd backend
npm run start:dev &
BACKEND_PID=$!
cd ..

# 等待后端启动
echo "⏳ 等待后端服务启动..."
sleep 5

# 启动前端
echo "🎨 启动前端服务..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ 服务启动完成！"
echo ""
echo "📱 前端地址: http://localhost:5173"
echo "🔌 后端地址: http://localhost:3001"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待进程
wait $BACKEND_PID $FRONTEND_PID
