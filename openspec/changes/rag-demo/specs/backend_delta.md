# Delta: Chatbot Backend (RAG 模块)

**Change ID:** `rag-demo`
**Affects:** `Chatbot/backend/app/`

---

## ADDED

### Module: `app/rag/` — RAG 知识库引擎

RAG 核心模块，包含文档加载、向量化、检索、QA 生成全流程。

#### 架构说明

```
data/articles/ → loader → text_splitter → embed(Zhipu API) → ChromaDB
用户查询 → ChromaDB(query) → MMR rerank → LLM(generate) → 回答+来源
```

- Embedding: 智谱 AI `embedding-2` 模型（requests 调用，无需额外依赖）
- 向量存储: ChromaDB PersistentClient（本地持久化）
- 检索策略: 余弦相似度 + MMR 多样性重排序（`lambda_mult=0.5`）
- 文本切片: `RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)`

#### Scenario: 文档索引
- GIVEN MyBlog 的博文 Markdown 文件存在于 `data/articles/`
- WHEN 调用索引接口 `POST /api/rag/index`
- THEN 文档被加载、切片、通过 Zhipu API 向量化后存入 ChromaDB
- AND 返回索引状态（文档数、切片数）

#### Scenario: 知识检索
- GIVEN ChromaDB 中已索引博文
- WHEN 调用检索接口 `POST /api/rag/query` 携带用户问题
- THEN ChromaDB 返回 top_k 个最相关切片（含 MMR 重排序）
- AND 返回基于检索结果的 LLM 生成回答及来源元数据
- AND 结果按相似度降序排列（score ∈ [0, 1]）

#### Scenario: Agent Tool 集成
- GIVEN Agent 正在处理用户请求
- WHEN 用户问题涉及知识库内容
- THEN Agent 调用 `knowledge_retrieval` Tool（`@tool` 装饰器注册）
- AND Tool 内部调用 RAG pipeline 获取答案
- AND Agent 最终回答包含知识库引用来源

### API: `POST /api/rag/query`

**请求体：**
```json
{
  "query": "Hermes Agent 的分层记忆系统有几层？",
  "top_k": 3,
  "use_mmr": true
}
```

**响应体：**
```json
{
  "answer": "Hermes Agent 采用四层记忆架构：L0 Conversation（原始对话记录）、L1 Atoms（原子事实）、L2 Scenarios（场景聚合）、L3 Persona（用户画像）。[引用自:《Hermes Agent 实战》]",
  "sources": [
    {
      "title": "Hermes Agent 实战 — 分层记忆系统与技能生态整合",
      "slug": "hermes-agent-practical-guide",
      "chunk": "四层记忆模型...",
      "score": 0.92
    }
  ]
}
```

### API: `POST /api/rag/index`

**请求体：** `{}`（空，触发重新索引）

**响应体：**
```json
{
  "status": "ok",
  "documents_indexed": 2,
  "chunks_created": 5,
  "elapsed_seconds": 1.6
}
```

---

## MODIFIED

### File: `Chatbot/backend/requirements.txt`

**变更：** 新增 RAG 相关依赖

新增依赖：
- `chromadb>=0.5,<0.6` — 向量数据库（替代 chromadb + langchain-chroma + sentence-transformers）
- `numpy` — MMR 重排序矩阵运算
- `langchain-text-splitters` — 文本切片（LangChain v1 独立包）

> 注：embedding 通过智谱 AI HTTP API 完成，无需 sentence-transformers 等本地模型依赖。
> 注：`langchain-chroma` 未使用——通过 chromadb Python SDK 直连，避免 LangChain 集成层带来的版本兼容问题。

### File: `Chatbot/backend/app/tools/__init__.py`

**变更：** 注册 `knowledge_retrieval` Tool（含 `@tool` 装饰器）
```python
from app.tools.knowledge import knowledge_retrieval
```

### File: `Chatbot/backend/app/rag/vector_store.py`

**变更：** 从 numpy + pickle 手写向量存储迁移到 ChromaDB PersistentClient
- `ZhipuEmbeddingFn` — 自定义 EmbeddingFunction 适配 Chroma
- `save_index()` — 写入 Chroma collection（自动计算 embedding）
- `retrieve()` — Chroma query + MMR 重排序
- 旧版 numpy + pickle 持久化已废弃

---

## REMOVED

(None)
