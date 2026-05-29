# Aureon — Enterprise AI Knowledge Base Platform

> Low-latency enterprise AI search and knowledge intelligence platform.
> Built as a production-grade system, not a demo.

[//]: # (一旦有 CI badge 后加上: ![CI](...))

## Performance

| Metric | Value |
|--------|-------|
| Recall@3 (Hybrid) | **96.08%** |
| TTFT (Streaming) | **~310ms** |
| Full RAG Latency | **~400ms** |
| Retrieval Latency | **~10ms** |
| Cost per Query | **~$0.001** |

## Features

- **Enterprise AI Search** — Streaming answers with progressive citations
- **Hybrid Retrieval** — BM25 keyword + Dense semantic dual-channel fusion
- **Document Management** — Upload, auto-index, preview, source management
- **System Dashboard** — Real-time metrics, health monitoring, usage analytics
- **Analytics** — Latency, token usage, cache performance, query distribution
- **Architecture & Performance** — Interactive architecture diagram, optimization metrics
- **Enterprise Admin** — Workspace management, user roles, audit logs
- **Login** — Enterprise SSO-ready login page
- **Multilingual RAG** — Chinese + English bilingual knowledge base
- **SSE Streaming** — Real-time token-level streaming
- **Responsive Design** — Mobile, tablet, desktop optimized
- **Docker + CI/CD** — Production-grade deployment pipeline

## Architecture

```
User → Web UI (React + Vite) → FastAPI → LangGraph Orchestrator
                                           ├── Intent Classifier
                                           ├── Hybrid Search (BM25 + BGE/Chroma)
                                           ├── LLM (GLM-4-Flash / GPT-4o-mini)
                                           ├── Cache (Redis + In-Memory)
                                           └── SSE Streaming Response
```

## Quick Start

```bash
# Frontend
cd Aureon && npm install && npm run dev

# Backend
cd Aureon/backend && pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Deployment

| Tier | Scope | Timeline | Price |
|------|-------|----------|-------|
| Standard | Template + data import + basic UI | 24h | $500 |
| Custom | + RBAC + multi-format + private deploy | 1-2 weeks | $1,500+ |
| Enterprise | + IM integration + system integration | 2-4 weeks | $5,000+ |
| Maintenance | Content updates + monitoring | Monthly | $200-500/mo |

## Benchmark

51 QA pairs, 96.08% Recall@3 hybrid, ~$0.001/query. Full benchmark: see `/benchmark`.

---

Built by [Enterprise AI Systems Studio](https://github.com/Yum-wu)
