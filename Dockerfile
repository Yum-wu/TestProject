# ── Chatbot Backend + Frontend (Railway monorepo entry) ──
# 所有路径加 Chatbot/ 前缀，因为 Railway build context = repo 根

# Stage: 构建前端
FROM node:22-alpine AS frontend-builder
WORKDIR /app
COPY Chatbot/package.json Chatbot/package-lock.json ./
RUN npm ci
COPY Chatbot/ .
RUN npm run build

# Stage: 后端 + nginx
FROM python:3.12-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/* \
    && ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log

COPY Chatbot/backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY Chatbot/backend/ .
RUN mkdir -p /app/data/vectors

COPY --from=frontend-builder /app/dist /usr/share/nginx/html
COPY Chatbot/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD nginx && uvicorn app.main:app --host 127.0.0.1 --port 8000
