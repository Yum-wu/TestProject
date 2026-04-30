FROM node:18-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ ./

FROM node:18-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM node:18-alpine
WORKDIR /app

RUN apk add --no-cache nginx

COPY --from=server-builder /app/server /app/server
COPY --from=client-builder /app/client/dist /app/client/dist

COPY nginx.conf /etc/nginx/http.d/default.conf

RUN mkdir -p /app/server/uploads/covers /app/server/logs

EXPOSE 80 3001

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

CMD ["/docker-entrypoint.sh"]
