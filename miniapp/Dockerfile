FROM node:18-alpine AS builder
WORKDIR /app
COPY miniapp/package*.json ./
RUN npm ci --legacy-peer-deps
COPY miniapp/ ./
RUN npm run build:h5

FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist/build/h5 /usr/share/nginx/html/miniapp
COPY miniapp/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8081
