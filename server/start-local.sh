#!/bin/bash
# 启动本地 NestJS 后端服务（连接远程 MySQL）
# 用法: ./start-local.sh

SERVER_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SERVER_DIR"

echo "🔨 Building..."
/Users/fengrenfan/.nvm/versions/node/v18.20.8/bin/node node_modules/.bin/nest build

echo "🚀 Starting NestJS (MySQL: 118.25.192.73)..."
DB_HOST=118.25.192.73 DB_USER=cosmetics DB_PASSWORD=cosmetics123 DB_NAME=cosmetics_shop DB_PORT=3306 \
/Users/fengrenfan/.nvm/versions/node/v18.20.8/bin/node dist/main.js
