---
title: "AI Chatbot Deployment on Railway — Docker + FastAPI + Chroma Persistence"
date: 2026-05-24
slug: chatbot-railway-deployment
tags: [Technology, Railway, Docker, FastAPI, AI, Deployment]
category: Technology
excerpt: Deploying a React 19 + FastAPI + LangChain + Chroma RAG AI Agent project on Railway, covering multi-stage Docker builds, SSE streaming, persistent vector storage, and white screen debugging.
lang: en
---

# AI Chatbot Deployment on Railway — Full Guide

I recently deployed an AI Agent chat project (Chatbot) to [Railway](https://railway.app). The project is a sub-project within a monorepo, with a tech stack of React 19 + FastAPI + LangChain + Chroma RAG. This article documents the complete process and key decisions.

## Project Architecture

```
User Browser
    │
    ▼
Railway Load Balancer (port $PORT)
    │
    ▼
FastAPI (uvicorn)
    ├── /api/chat/stream  → SSE streaming chat
    ├── /api/rag/*        → RAG knowledge retrieval
    ├── /api/health       → Health check
    └── /*                → SPA static files (StaticFiles)
            │
            ▼
        ChromaDB (persistent volume /app/data/vectors)
        └── Article embeddings
```

Key decision: **Removed nginx**, using uvicorn to serve both API and static files. Railway's V2 runtime has built-in load balancing — adding nginx just adds complexity.

## Multi-stage Docker Build

The project is in the monorepo root, so the Dockerfile needs proper path mapping:

```dockerfile
# Stage 1: Build frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app
COPY Chatbot/package*.json ./
RUN npm ci
COPY Chatbot/ ./
RUN npm run build

# Stage 2: Run backend
FROM python:3.12-slim
COPY --from=frontend-builder /app/dist /app/static
WORKDIR /app
COPY Chatbot/backend/ ./
RUN pip install -r requirements.txt
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-80}"]
```

**Key points:**
- `COPY Chatbot/` instead of `COPY .` — only copy what's needed from the monorepo
- Frontend build output maps to backend's `/app/static` directory
- FastAPI mounts SPA via `StaticFiles(directory="static", html=True)`

## White Screen Bug — removeChild Error

The weirdest post-deployment issue: the page suddenly went white when AI was responding, with `Failed to execute 'removeChild' on 'Node'` in the console.

Root cause took three rounds of debugging:

1. **react-syntax-highlighter** lazy loading (`React.lazy` + `Suspense`) caused reconciliation conflicts during SSE streaming DOM updates
2. **Browser extensions** (Google Translate, etc.) modified the DOM in the background, breaking React's virtual DOM consistency

Fix: Removed `react-syntax-highlighter`, switched to plain `<pre><code>` for code blocks, and added `translate="no"` to the Markdown container to prevent translation plugin interference.

Also added ErrorBoundary fallback and a 60ms text buffer to reduce render frequency.

## Persistent Vector Storage

ChromaDB data must persist across deployments:

```bash
railway volume add rag-vectors \
  --mountPath /app/data/vectors \
  --size 1GB
```

The backend automatically initializes the Chroma client pointing to `/app/data/vectors`, ensuring vector data survives container rebuilds.

## Environment Variables

| Variable | Purpose | Source |
|----------|---------|--------|
| `OPENAI_API_KEY` | LLM calls | User provided |
| `TAVILY_API_KEY` | Web search tool | Tavily registration |
| `ZHIPUAI_API_KEY` | Embedding model | Zhipu AI platform |

Configured via Railway Dashboard → Variables panel — no `.env` file needed.

## Deployment Effect

After deployment, visiting the Railway URL:

- **AI Chat**: SSE streaming output with typewriter effect
- **RAG Retrieval**: 6 articles, 12 chunk index, Chroma + MMR re-ranking
- **Web Search**: Real-time info via Tavily API
- **Persistent Memory**: Chat sessions persist across requests

## Lessons Learned

| Problem | Cause | Solution |
|---------|-------|----------|
| Frontend API 404 | Hardcoded `localhost:8000` URL | Use relative path `/api/chat/stream` |
| White screen removeChild | react-syntax-highlighter + translate plugin | SimpleCode + translate="no" |
| Build context too large | `COPY .` includes entire monorepo | Use `COPY Chatbot/` |
| Vector data lost | Container rebuild doesn't mount volume | Railway volume persistence |

## Key Takeaways

1. **Dockerfile at root**, handle sub-project paths in `COPY` — standard monorepo deployment pattern
2. **No nginx needed** — FastAPI serving static files is sufficient, one less layer = one less problem
3. **SSE streaming in React** — be careful with DOM reconciliation, especially with lazy-loaded components
4. **Persistent volumes** — must be configured before deployment
