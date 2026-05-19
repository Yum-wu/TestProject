# RAG 知识库系统设计文档

## 架构

```
用户 → [RAG UI] → POST /api/rag/query → [FastAPI Backend]
                                              ↓
                                    [rag.qa_chain.rag_query()]
                                              ↓
                              ┌─────────────────┴─────────────────┐
                              ↓                                   ↓
                      [chroma: retrieve]                    [LLM: generate]
                              ↓                                   ↓
                        相似切片段 ← ─ ← ─ ← ─ ─ 拼接上下文 + 提问
                              ↓                                   ↓
                        [rag.retriever]                      [rag.qa_chain]
                              ↓                                   ↓
                        返回 sources                          返回 answer
                              └─────────────────┬─────────────────┘
                                                ↓
                                    POST /api/rag/query 响应
                                                ↓
                                     [RAG UI] 展示问答+来源
```

## 模块说明

### `app/rag/loader.py`
加载 MyBlog Markdown 博文，解析 YAML frontmatter，按章节切片。

### `app/rag/vector_store.py`
ChromaDB 初始化、文档索引、持久化管理。

### `app/rag/retriever.py`
相似度检索 + MMR 重排序，支持 top_k 配置。

### `app/rag/qa_chain.py`
RAG pipeline 主流程：检索 → 拼接上下文 → 调用 LLM 生成 → 返回带来源的答案。

### `app/rag/models.py`
Pydantic 请求/响应模型。

## API

| 方法 | 路径 | 说明 |
| POST | /api/rag/query | 查询知识库，返回回答+来源 |
| POST | /api/rag/index | 重新索引博文，用于数据更新后 |

## 关键决策

- **ChromaDB**：本地轻量，无需单独部署，适合入门学习
- **RecursiveCharacterTextSplitter**：chunk_size=500, overlap=50，适合中文 Markdown
- **MMR**：默认开启，提高来源多样性
- **sentence-transformers**：本地 Embedding fallback，避免 API 依赖
- **Agent Tool 集成**：`knowledge_retrieval` Tool 注册到 ALL_TOOLS，Agent 自动可调用

## 评估方法

- Recall@3：对 10 个标注问题，检查 top-3 检索结果是否包含正确答案片段
- Faithfulness：检查 LLM 回答是否忠实于检索到的上下文
- 延迟：记录检索 + 生成的端到端耗时
