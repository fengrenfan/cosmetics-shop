#!/bin/bash
# 启动本地 NestJS 后端服务（连接远程 MySQL）
# 用法: ./start-local.sh

SERVER_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SERVER_DIR"

echo "🔨 Building..."
/Users/fengrenfan/.nvm/versions/node/v18.20.8/bin/node node_modules/.bin/nest build

if [ ! -f .env ]; then
  echo "❌ Missing .env file. Please copy .env.example to .env first."
  exit 1
fi

echo "🚀 Starting NestJS with .env configuration..."
/Users/fengrenfan/.nvm/versions/node/v18.20.8/bin/node dist/main.js
