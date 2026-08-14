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
# .env file should be mounted at runtime via docker-compose
# Example: docker run --env-file .env ...
EXPOSE 3001
CMD ["node", "dist/main.js"]
