FROM node:18-alpine AS builder
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --legacy-peer-deps
COPY server/ ./
RUN rm -rf dist && npx tsc

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
RUN printf 'DB_HOST=127.0.0.1\nDB_PORT=3306\nDB_USER=cosmetics\nDB_PASSWORD=Cosmetics_123\nDB_NAME=cosmetics_shop\nJWT_SECRET=CosmeticsShop2024Secret\nPORT=3001\nPAY_MODE=mock\n' > .env
EXPOSE 3001
CMD ["node", "dist/main.js"]
