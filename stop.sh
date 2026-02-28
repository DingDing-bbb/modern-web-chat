#!/bin/bash

echo "🛑 停止聊天应用..."

# 停止所有node进程
pkill -f "nest start" || true
pkill -f "vite" || true

echo "✅ 所有服务已停止"
