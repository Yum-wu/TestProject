# ── Chatbot Backend + Frontend (Railway monorepo entry) ──
# FastAPI serves both API and static frontend files

# Stage: 构建前端
FROM node:22-alpine AS frontend-builder
WORKDIR /app
COPY Chatbot/package.json Chatbot/package-lock.json ./
RUN npm ci
COPY Chatbot/ .
RUN npm run build

# Stage: Python 后端
FROM python:3.12-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

COPY Chatbot/backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY Chatbot/backend/ .
RUN mkdir -p /app/data/vectors

# 从前端构建阶段复制静态文件
COPY --from=frontend-builder /app/dist /app/static

# Railway 会自动设置 PORT 环境变量（默认 80）
EXPOSE 80

CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-80}
