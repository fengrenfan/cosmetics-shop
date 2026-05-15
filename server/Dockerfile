FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN printf 'DB_HOST=127.0.0.1\nDB_PORT=3306\nDB_USER=cosmetics\nDB_PASSWORD=Cosmetics_123\nDB_NAME=cosmetics_shop\nJWT_SECRET=CosmeticsShop2024Secret\nPORT=3001\nPAY_MODE=mock\n' > .env
EXPOSE 3001
CMD ["node", "dist/main.js"]