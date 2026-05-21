# 方案： RAG Knowledge Base QA System

**变更 ID:** `rag-demo`
**创建日期:** 2026-05-18
**状态:** Implemented

---

## 问题分析

当前 Chatbot Agent 缺少基于自有知识库的问答能力。Agent 只能依赖 LLM 自身知识或外部搜索，无法基于本地文档（如 MyBlog 博文）回答问题。需要补齐 RAG（检索增强生成）能力。

## 解决方案

在 Chatbot 项目中新建 RAG pipeline：
- Chroma 向量数据库存储文档切片
- Embedding 模型将文本向量化
- 相似度检索 + MMR 重排序
- LLM 基于检索结果生成带引用的回答

## 范围

### 包含

- Chroma 向量数据库搭建与持久化
- MyBlog 博文加载、切片、向量化
- 检索 + 生成 QA 接口
- Agent 以 Tool 形式接入 RAG
- 对话 UI（输入问题 → 显示回答 + 引用来源）

### 不包含

- 多轮对话记忆管理（已有 L0-L3 记忆系统，不额外工作）
- 复杂文档格式支持（仅 Markdown）
- 生产级部署
- 多智能体协作

## 影响分析

| 组件 | 变更 | 说明 |
|------|-----------------|---------|
| Retrieval pipeline | Yes | Chroma + embedding + retrieval + rerank |
| LLM response generation | Yes | Context-augmented QA synthesis |
| API surface | Yes | Query endpoint for RAG |
| Agent integration | Yes | RAG exposed as Tool |
| Frontend | Yes | Simple query UI with citations |
| Dependencies | Yes | chromadb, langchain-chroma, sentence-transformers |

## 依赖与复用

### 依赖

- Chatbot backend (FastAPI + LLM config)
- MyBlog markdown articles as knowledge source

### 复用

- Existing LLM config (same provider/model)
- Existing FastAPI route patterns
- Existing logging infrastructure

### 后续能力

- Agent ability to answer knowledge-based questions
- Foundation for advanced RAG (hybrid search, reranking)

## 非功能约束

- Logging: log query text, hit count, retrieval latency per request
- Error handling: empty query returns 400; no hit returns graceful message
- Timeout/retry: embedding and retrieval should complete within reasonable time; LLM generation uses existing timeout
- Config/env: embedding model / Chroma path configurable
- Security/secrets: no secrets in retrieval pipeline
- Local vs production: Chroma file-based storage works for local dev; production would need remote vector store

## 架构设计

- RAG module is independent from Agent core logic
- Agent can optionally call RAG via Tool
- Chroma stores data locally at `data/vectors/`
- Supports both synchronous query and streaming response
- Existing LLM configuration reused, no extra provider needed

## 成功标准

- [ ] MyBlog articles loaded, chunked, and indexed into Chroma
- [ ] Retrieval returns semantically relevant chunks for test queries
- [ ] QA endpoint returns answer with cited sources
- [ ] Agent Tool integration returns RAG-augmented answers
- [ ] Basic UI shows query, answer, and source citations

## 风险与应对

| 风险 | 概率 | 影响 | 应对 |
|------|-------------|--------|------------|
| Embedding API unavailable or rate-limited | Low | High | Support local embedding (sentence-transformers) as fallback |
| Chroma version incompatible with LangChain | Med | Medium | Pin compatible versions, test integration |
| Only 2 blog articles limit retrieval quality | High | Low | Accept for MVP, extendable later |
| Existing frontend integration complexity | Med | Low | Build simple standalone query UI |
