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

### `app/rag/evaluator.py`
RAG 评估模块：Recall@k、Faithfulness（LLM-as-judge 0-10 评分）、延迟统计（p50/p99/mean/min/max）。通过 `run_full_evaluation()` 统一运行。

### `app/rag/prompt_experiment.py`
Prompt 策略实验框架：三种 System Prompt 模板（Direct / CoT / Few-shot），`run_experiment()` 对同一组问题分别调用并输出对比表格。

### `app/rag/test_data.py`
评估数据集：从 `backend/data/articles/` 的 2 篇文章（Hermes Agent 实战 + SPA 部署踩坑实录）标注 16 组 Q&A 对，含 `RETRIEVAL_EXPECTED` 映射用于 Recall 评估。

### `app/rag/models.py`
Pydantic 请求/响应模型。

## API

| 方法 | 路径 | 说明 |
| POST | /api/rag/query | 查询知识库，返回回答+来源 |
| POST | /api/rag/index | 重新索引博文，用于数据更新后 |
| POST | /api/rag/evaluate | 运行全量评估（Recall + Faithfulness + 延迟）|
| POST | /api/rag/experiment | 运行 Prompt 策略对比实验 |

## 评估结果（2026-05-21）

| 指标 | 值 | 目标 | 状态 |
|------|------|------|------|
| Recall@3 | 94% (15/16) | ≥ 80% | ✅ 通过 |
| Faithfulness | 6.5/10 | ≥ 8/10 | ❌ 未达标（部分 test data 问题文章无答案）|
| 延迟 p50 | 3.6s | — | 基准值 |
| 延迟 p99 | 5.4s | — | 基准值 |

### Prompt 实验结论

| 策略 | 有效回答率 | 平均延迟 |
|------|-----------|---------|
| Direct | 0% | 3926ms |
| CoT | 88% | 3791ms |
| Few-shot | 81% | 3753ms |

Direct 策略因 System Prompt 规则"如果问题与文档无关，礼貌说明无法回答"过于严格，导致全部拒绝回答。CoT 效果最优，Few-shot 次之。

## 关键决策

- **ChromaDB**：本地轻量，无需单独部署，适合入门学习
- **RecursiveCharacterTextSplitter**：chunk_size=500, overlap=50，适合中文 Markdown
- **MMR**：默认开启，提高来源多样性
- **sentence-transformers**：本地 Embedding fallback，避免 API 依赖
- **Agent Tool 集成**：`knowledge_retrieval` Tool 注册到 ALL_TOOLS，Agent 自动可调用

## 评估方法

- Recall@3：对 16 个标注问题，检查 top-3 检索结果是否包含正确答案片段
- Faithfulness：LLM-as-judge 评分（0-10），检查 LLM 回答是否忠实于检索到的上下文
- 延迟：记录检索 + 生成的端到端耗时，统计 p50/p99/mean
- Prompt 实验：同一组 16 个问题分别用 Direct / CoT / Few-shot 策略运行，对比回答质量和延迟

## 实验报告

完整实验报告见 [experiment-rag-prompt-2026-05-21.md](./experiment-rag-prompt-2026-05-21.md)。
