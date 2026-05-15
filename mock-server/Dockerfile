FROM node:18-alpine
WORKDIR /app
COPY mock-server/package*.json ./
RUN npm ci
COPY mock-server/ ./
EXPOSE 3000
CMD ["node", "server.js"]