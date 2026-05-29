# System Architecture Overview

## High-Level Architecture

```
User → React Frontend → FastAPI Backend → LangGraph Orchestrator
                                            ├── Intent Classifier
                                            ├── Hybrid Retrieval (BM25 + BGE)
                                            ├── MMR Re-ranking
                                            ├── LLM Generation
                                            └── SSE Streaming
```

## Components

### Frontend (React + Vite)
- Landing Page: Product showcase
- Search: Enterprise search experience
- Dashboard: System metrics & monitoring
- Architecture: Pipeline visualization
- Analytics: Usage analytics
- Documents: Knowledge base management

### Backend (FastAPI + LangGraph)
- API Layer: RESTful endpoints
- RAG Pipeline: Hybrid retrieval + generation
- Cache: Redis + in-memory
- Storage: ChromaDB vector store

## Data Flow

1. User submits query
2. Intent classifier routes request
3. Hybrid retrieval (BM25 keyword + BGE semantic)
4. MMR re-ranking for diversity
5. Prompt assembly with context
6. LLM generates streaming response
7. Citation injection from sources
8. SSE delivers tokens to frontend

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Backend | Python 3.11, FastAPI, LangGraph |
| Vector DB | ChromaDB |
| Cache | Redis |
| LLM | GLM-4-Flash / GPT-4o-mini |
| Deployment | Docker, Nginx |
