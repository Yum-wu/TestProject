# 增量： RAG Pipeline

**变更 ID:** `rag-demo`
**影响范围:** Chatbot backend retrieval pipeline, API, agent tool integration

---

## 新增

### 需求： Document ingestion and vector indexing

System SHALL load MyBlog markdown articles, split into chunks, embed via Zhipu API, and store in ChromaDB.

#### 场景： Happy path

- 给定 MyBlog markdown articles exist in `data/articles/`
- 当 index API `POST /api/rag/index` is called
- 则 documents are loaded, chunked (`chunk_size=500`, overlap=50), embedded via Zhipu API, stored in ChromaDB
- AND API returns document count and chunk count

#### 场景： Invalid or empty source directory

- 给定 source directory is missing or empty
- 当 index pipeline runs
- 则 pipeline reports clear error or warning
- AND does not crash the backend

#### 场景： Embedding API unavailable

- 给定 Zhipu embedding API is unreachable or returns error
- 当 index pipeline tries to embed
- 则 pipeline fails with descriptive error
- AND does not leave Chroma in partial state

---

### 需求： Retrieval-augmented QA

System SHALL retrieve relevant chunks and generate answers via LLM with cited sources.

#### 场景： Happy path with citations

- 给定 ChromaDB has indexed articles
- 当 POST /api/rag/query with relevant question
- 则 ChromaDB returns top-k chunks with MMR rerank (`lambda_mult=0.5`)
- AND LLM generates answer with cited sources
- AND response includes answer text + sources array (title, slug, chunk excerpt, score)

#### 场景： Empty query

- 给定 user submits empty query
- 当 API endpoint receives request
- 则 API returns 400 validation error
- AND no retrieval or LLM call occurs

#### 场景： No relevant content found

- 给定 user query has no semantic match
- 当 retrieval returns zero chunks above threshold
- 则 system returns graceful message indicating no matching content
- AND does not hallucinate from LLM knowledge alone

#### 场景： LLM generation failure

- 给定 retrieval succeeds but LLM call fails
- 当 QA pipeline runs
- 则 error response returned with retrieval context preserved for debugging

---

### 需求： Logging for retrieval observability

System SHALL log query text, hit count, and retrieval latency per request.

#### 场景： Retrieval log on each query

- 给定 query is processed
- 当 QA pipeline completes
- 则 log entry includes query (truncated), chunk count, retrieval duration

---

### 需求： Agent Tool integration

System SHALL expose RAG query as a `@tool` decorated function registered in `tools/__init__.py`.

#### 场景： Agent calls knowledge retrieval tool

- 给定 Agent is processing user request
- 当 user asks knowledge-based question
- 则 Agent triggers `knowledge_retrieval` Tool
- AND Tool internally calls RAG pipeline and returns answer with sources

---

## 修改

### File: `Chatbot/backend/requirements.txt`

Added: `chromadb>=0.5,<0.6`, `numpy`, `langchain-text-splitters`  
Note: embedding via Zhipu HTTP API, not sentence-transformers. No `langchain-chroma` to avoid version compatibility issues.

### File: `Chatbot/backend/app/tools/__init__.py`

Registered `knowledge_retrieval` Tool.

### File: `Chatbot/backend/app/rag/vector_store.py`

Migrated from numpy + pickle to ChromaDB PersistentClient with `ZhipuEmbeddingFn`.

---

## 删除

(None)
