# ── Stage 1：构建前端 ──
FROM node:22-alpine AS frontend-builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

ARG VITE_API_URL
ARG VITE_CREW_API_URL
ENV VITE_API_URL=/api/chat/stream
ENV VITE_CREW_API_URL=/api/crew
RUN npm run build

# ── Stage 2：后端 + nginx ──
FROM python:3.12-slim

WORKDIR /app

# 系统依赖：nginx + sqlite（Chroma 需要）
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/* \
    && ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log

# Python 依赖
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 后端代码
COPY backend/ .

# Chroma 向量库持久化目录
RUN mkdir -p /app/data/vectors

# 从前端构建阶段复制静态文件
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# nginx 配置（含 /api/ 反向代理）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 启动脚本（JSON 数组 CMD 确保信号正确传递）
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

CMD ["/docker-entrypoint.sh"]