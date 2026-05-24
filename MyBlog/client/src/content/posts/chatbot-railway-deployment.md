---
title: "AI Chatbot 部署 Railway 全记录 — Docker + FastAPI + Chroma 持久化"
date: 2026-05-24
slug: chatbot-railway-deployment
tags: [技术, Railway, Docker, FastAPI, AI, 部署]
category: 技术
excerpt: 把一个 React 19 + FastAPI + LangChain + Chroma RAG 的 AI Agent 项目部署到 Railway 云平台，涉及 Docker 多阶段构建、SSE 流式传输、持久化向量存储、白屏 Bug 排查。本文记录完整过程与关键决策。
lang: zh
---

# AI Chatbot 部署 Railway 全记录

最近把一个 AI Agent 聊天项目（Chatbot）部署到了 [Railway](https://railway.app) 云平台。项目本身是个 monorepo 里的子项目，技术栈是 React 19 + FastAPI + LangChain + Chroma RAG。部署过程中踩了不少坑，记录一下完整的方案和决策过程。

## 项目架构

先看整体架构：

```
用户浏览器
    │
    ▼
Railway 负载均衡 (端口 $PORT)
    │
    ▼
FastAPI (uvicorn)
    ├── /api/chat/stream  → SSE 流式聊天
    ├── /api/rag/*        → RAG 知识检索
    ├── /api/health       → 健康检查
    └── /*                → SPA 静态资源 (StaticFiles)
            │
            ▼
        ChromaDB (持久化卷 /app/data/vectors)
        └── 文章 embeddings
```

关键决策：**去掉 nginx**，直接用 uvicorn 同时托管 API 和静态资源。Railway 的 V2 运行时自带负载均衡，再加 nginx 只是徒增复杂度。

## Docker 多阶段构建

项目在 monorepo 根目录，Dockerfile 需要处理好路径映射：

```dockerfile
# Stage 1: 构建前端
FROM node:22-alpine AS frontend-builder
WORKDIR /app
COPY Chatbot/package*.json ./
RUN npm ci
COPY Chatbot/ ./
RUN npm run build

# Stage 2: 运行后端
FROM python:3.12-slim
COPY --from=frontend-builder /app/dist /app/static
WORKDIR /app
COPY Chatbot/backend/ ./
RUN pip install -r requirements.txt
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-80}"]
```

**关键点：**
- `COPY Chatbot/` 而非 `COPY .` — monorepo 里只拷贝需要的内容，减小构建上下文
- 前端构建产物映射到后端的 `/app/static` 目录
- FastAPI 用 `StaticFiles(directory="static", html=True)` 挂载 SPA

## 白屏 Bug 排查 — removeChild 错误

部署后最诡异的问题是：AI 回复时页面突然白屏，控制台报 `Failed to execute 'removeChild' on 'Node'`。

根因排查了三轮才定位到：

1. **react-syntax-highlighter** 的懒加载（`React.lazy` + `Suspense`）在 SSE 流式更新 DOM 时造成协调冲突
2. **浏览器扩展**（Google Translate 等）在后台修改 DOM，破坏了 React 的虚拟 DOM 一致性

修复方案：移除 `react-syntax-highlighter`，改用纯 `<pre><code>` 渲染代码块，同时在 Markdown 容器上加 `translate="no"` 阻止翻译插件干扰。

```tsx
// 替换前 — 懒加载 SyntaxHighlighter
const CodeBlock = React.lazy(() => import("./CodeBlock"));
<Suspense><CodeBlock ... /></Suspense>

// 替换后 — 简易代码块
function SimpleCode({ language, code }) {
  return (
    <div>
      <div className="...">{language}</div>
      <pre><code>{code}</code></pre>
    </div>
  );
}
```

同时加了一层 ErrorBoundary 兜底，并引入 60ms 文本缓冲减少渲染频率：

```typescript
const FLUSH_INTERVAL = 60; // ms
// textBufferRef 累积 SSE 文本块
// scheduleFlush() 每 60ms 一次性刷新到 React state
// flushNow() 在 tool_start/error 等事件时立即刷新
```

## 持久化向量存储

RAG 系统要用 ChromaDB，数据必须持久化不能每次部署都重建：

```bash
# Railway CLI 操作
railway volume add rag-vectors \
  --mountPath /app/data/vectors \
  --size 1GB
```

Dockerfile 里预创建目录：

```dockerfile
RUN mkdir -p /app/data/vectors
```

后端启动时自动初始化 Chroma 客户端指向 `/app/data/vectors`，确保容器重建后向量数据不丢失。

## 环境变量配置

| 变量 | 用途 | 来源 |
|------|------|------|
| `OPENAI_API_KEY` | LLM 调用 | 用户提供 |
| `TAVILY_API_KEY` | 网络搜索工具 | Tavily 注册 |
| `ZHIPUAI_API_KEY` | Embedding 模型 | 智谱开放平台 |

Railway 的 Dashboard → Variables 面板直接添加，无需 `.env` 文件。

## railway.json 部署配置

```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 60,
    "restartPolicyType": "ON_FAILURE",
    "retryLimit": 10
  }
}
```

健康检查端点 `GET /api/health` 返回 `{"status": "ok"}`，Railway 用它判断服务是否就绪。

## 上线效果

部署完成后访问 `https://testproject-production-17b9.up.railway.app`：

- **AI 聊天**：SSE 流式输出，打字机效果实时展示
- **RAG 知识检索**：6 篇文章 12 个 chunk 索引，基于 Chroma + MMR 重排序
- **网络搜索**：通过 Tavily API 获取实时信息
- **持久化记忆**：聊天 session 跨请求保持

## 踩坑总结

| 问题 | 原因 | 解决 |
|------|------|------|
| 前端 API 请求 404 | URL 硬编码 `localhost:8000` | 改用相对路径 `/api/chat/stream` |
| 白屏 removeChild | react-syntax-highlighter + 翻译插件 | 换 SimpleCode + translate="no" |
| 构建上下文过大 | `COPY .` 包含 monorepo 全部 | 使用 `COPY Chatbot/` 精确拷贝 |
| 向量数据丢失 | 容器重建不挂载卷 | Railway volume 持久化 |

## 一点体会

Railway 的体验整体不错，尤其对 monorepo + Docker 的支持。几个值得注意的点：

1. **Dockerfile 放根目录**，子项目的路径在 `COPY` 指令里处理 — 这是 monorepo 部署的标准模式
2. **不用 nginx**，FastAPI 自己托管静态文件就够了，少一层就少一个问题
3. **SSE 流式输出**在 React 里要小心 DOM 协调问题，特别是用了懒加载组件的时候
4. **持久化卷**一定要在部署前配好，不然后面重建就白干了
