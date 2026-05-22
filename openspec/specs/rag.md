# RAG 知识库系统规格说明

**创建日期:** 2026-05-21

---

## 需求

### 需求： RAG 知识库查询

系统应支持基于 ChromaDB + Zhipu Embedding 的知识库检索和 LLM 生成回答。

#### 场景： Query with results

- GIVEN 知识库已索引，包含 Markdown 文章
- WHEN POST /api/rag/query with query string
- THEN 返回 LLM 生成的回答 + 检索到的来源切片列表
- AND 每个来源含 title、slug、chunk、score

#### 场景： No relevant results

- GIVEN 知识库中无相关内容
- WHEN POST /api/rag/query
- THEN 返回告知用户"知识库中暂无相关内容"
- AND sources 为空列表

---

### 需求： 知识库索引

系统应支持从 Markdown 文件加载、切片、嵌入并存储到 ChromaDB。

#### 场景： Index articles

- GIVEN backend/data/articles/ 目录下有 .md 文件
- WHEN POST /api/rag/index
- THEN 加载所有 Markdown 文件的 frontmatter 和正文
- AND 按 RecursiveCharacterTextSplitter (chunk_size=500, overlap=50) 切片
- AND Zhipu Embedding 嵌入后存入 ChromaDB
- AND 返回索引的文档数、切片数、耗时

#### 场景： No articles found

- GIVEN articles 目录为空或无 Markdown 文件
- WHEN 运行索引
- THEN 返回错误信息，说明未找到文件

---

### 需求： RAG 评估

系统应提供 RAG 质量评估能力。

#### 场景： Evaluate Recall@k

- GIVEN 测试数据集含已知来源的 Q&A 对
- WHEN running recall evaluation with k=3
- THEN 输出 Recall@3 分数
- AND 列出每个查询的命中/未命中状态

#### 场景： Evaluate Faithfulness

- GIVEN RAG 生成的答案及其来源文档
- WHEN faithfulness 评估运行
- THEN LLM-as-judge 评分答案是否基于来源 (0-10)
- AND 输出平均 faithfulness 分数

#### 场景： Evaluate latency

- GIVEN RAG query 端点运行中
- WHEN 评估运行 N 个查询
- THEN 输出 p50/p99/mean 延迟（毫秒）

---

### 需求： Agent Tool knowledge_retrieval

RAG 应作为 Agent Tool 注册，使 Agent 可在对话中调用知识库。

#### 场景： Tool answers from knowledge base

- GIVEN 用户提问可从知识库回答的问题
- WHEN Agent 路由到 knowledge_retrieval tool
- THEN tool 返回相关切片 + LLM 生成回答
- AND Agent 将回答整合到对话响应中

#### 场景： No index available

- GIVEN 知识库未索引
- WHEN Agent 启动检查可用 tools
- THEN knowledge_retrieval tool 不注册（Agent 不可见）
- AND Agent 不报错

#### 场景： LLM instance reuse

- GIVEN knowledge_retrieval tool 被调用
- WHEN tool 执行 rag_query
- THEN LLM 实例复用（非每次调用新建）

---

### 需求： Prompt 策略实验

系统应支持对比不同 Prompt 策略的 RAG 问答效果。

#### 场景： Run prompt experiment

- GIVEN 固定测试问题集
- WHEN 实验运行 Direct / CoT / Few-shot 策略
- THEN 输出对比表格（准确率 / Token / 延迟）
- AND 包含原始响应供人工核验

---

## 评估结果（2026-05-21）

| 指标 | 值 | 目标 | 状态 |
|------|------|------|------|
| Recall@3 | 94% (15/16) | ≥ 80% | ✅ |
| Faithfulness (avg) | 6.5/10 | ≥ 8/10 | ❌ |
| 延迟 p50 | 3.6s | — | 基准 |
| 延迟 p99 | 5.4s | — | 基准 |

## 关键决策

- **ChromaDB**：本地轻量，无需单独部署，适合入门学习
- **RecursiveCharacterTextSplitter**：chunk_size=500, overlap=50，适合中文 Markdown
- **MMR**：默认开启，提高来源多样性
- **Zhipu Embedding**：智谱 API 嵌入，无本地模型依赖
- **模块级 _get_llm() 懒加载**：避免每次 tool 调用新建 LLM 实例
- **条件注册**：Chroma 索引存在才注册 knowledge_retrieval tool
- **策略选型**：Direct / CoT / Few-shot（非 ReAct / ToT），因纯 QA 链无 action space
