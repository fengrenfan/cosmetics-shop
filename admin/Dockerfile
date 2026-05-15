FROM node:18-alpine AS builder
WORKDIR /app
COPY admin/package*.json ./
RUN npm ci --legacy-peer-deps
COPY admin/ ./
RUN npm run build

FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html/admin
COPY admin/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80