# Proposal: RAG 知识库问答系统

**Change ID:** `rag-demo`
**Created:** 2026-05-18
**Status:** Implementation Complete ✓
**Created:** 2026-05-18
**Completed:** 2026-05-18

---

## Problem Statement

根据 AI Agent 技能补齐路线的规划，当前已完成 P0 的 Chatbot Agent（LangChain + Tool Calling + Memory），下一步需要补齐 **RAG（检索增强生成）** 技能。RAG 是 AI Agent 工程师岗位的核心能力之一，面试中高频考察。

现状：
- Chatbot 已有 Agent 框架、Tool Calling、分层记忆系统（L0-L3）
- MyBlog 下有 2 篇高质量博文可作为知识源
- **缺少**向量检索能力，Agent 无法基于自有知识库回答

## Proposed Solution

在 `Chatbot/` 项目中新建 `rag/` 模块，使用 Chroma（本地轻量向量数据库）实现 RAG pipeline：

1. **文档加载与切片**：从 MyBlog 加载 Markdown 博文，按章节切片
2. **向量化与存储**：使用 Embedding 模型将切片向量化，存入 Chroma
3. **检索 + 生成**：收到用户提问后，检索相关切片，拼接上下文后调用 LLM 生成回答
4. **对话 UI**：提供简单的 Web 界面（可复用 Chatbot 前端或新建简洁 UI）

架构设计：
- 在 Chatbot 后端内新增 `rag/` 模块，利用已有的 FastAPI + LangChain 基础设施
- 与现有 Agent 松耦合：Agent 可将知识库查询作为一个 Tool 注册
- Chroma 使用本地持久化存储，无需额外数据库

### 关键组件

| 组件 | 技术选型 | 说明 |
|------|----------|------|
| 向量数据库 | Chroma | 本地轻量，适合学习入门 |
| Embedding | text-embedding-ada-002 / 智谱 Embedding | 与现有 LLM API 保持一致 |
| 文档加载 | LangChain Document Loaders | 加载 Markdown 文件 |
| 文本切片 | LangChain Text Splitters | RecursiveCharacterTextSplitter |
| 检索策略 | 相似度检索 + MMR | 兼顾相关性与多样性 |
| API | FastAPI | 复用现有后端 |
| 前端 | React (Vite) 简单 UI | 或集成到 Chatbot 前端 |

## Scope

### In Scope
- Chroma 向量数据库的搭建与持久化
- MyBlog 博文的加载、切片、向量化 pipeline
- 基于检索的 QA 接口（RAG query → retrieve → generate）
- 简单的对话 UI（输入问题 → 显示回答 + 引用来源）
- Chatbot Agent 以 Tool 形式接入 RAG
- 评估指标：检索准确率、回答质量

### Out of Scope
- 多轮对话中的记忆管理（已有 L0-L3 记忆系统，本次不做额外工作）
- 复杂的文档格式支持（仅 Markdown）
- 生产级部署（仅本地开发）
- 多智能体协作（P2 阶段再做）

## Impact Analysis

| Component | Change Required | Details |
|-----------|-----------------|---------|
| Chatbot Backend | Yes | 新增 `rag/` 模块，新增 API 路由 |
| Chatbot Frontend | Maybe | 可复用现有前端或新建独立 UI |
| Agent | Minimal | 为 Agent 注册一个 `knowledge_retrieval` Tool |
| MyBlog | No | 只读取博文文件，不做修改 |
| Dependencies | Yes | 新增 `chromadb`、`langchain-chroma` 等 Python 包 |

## Architecture Considerations

### 目录结构

```
Chatbot/
├── backend/
│   ├── app/
│   │   ├── rag/                      # 新增 RAG 模块
│   │   │   ├── __init__.py
│   │   │   ├── loader.py             # 文档加载与切片
│   │   │   ├── vector_store.py       # Chroma 向量库管理
│   │   │   ├── retriever.py          # 检索逻辑
│   │   │   ├── qa_chain.py           # RAG QA 链
│   │   │   └── models.py            # Pydantic 模型
│   │   ├── api/
│   │   │   └── routes.py             # 新增 RAG API 路由
│   │   └── tools/
│   │       └── knowledge.py          # Agent 用的知识库 Tool
│   │── data/
│   │   └── chroma/                   # Chroma 持久化存储（.gitignored）
│   │   └── articles/                 # 博文副本或符号链接
│   └── requirements.txt              # 更新依赖
├── rag-ui/                           # 新增：RAG 独立前端（可选）
└── docs/
    └── rag-design.md                 # 设计文档
```

### 数据流

```
用户提问
  ↓
检索相关切片 (Chroma, top_k=3)
  ↓
拼接上下文 + 问题 → LLM
  ↓
生成回答 + 返回引用来源
```

### 与现有系统的关系
- **松耦合**：RAG 模块独立，不修改现有 Agent 核心逻辑
- **可选集成**：Agent 通过 Tool 调用 RAG，默认不启用
- **复用基础设施**：使用已有的 LLM 配置、FastAPI 模式、日志体系

## Success Criteria

- [ ] 能成功加载 MyBlog 博文并向量化存入 Chroma
- [ ] 检索接口返回的相关切片在语义上正确匹配用户问题
- [ ] QA 接口能基于博文内容回答，并标注引用来源
- [ ] Agent 通过 Tool 调用 RAG 时，回答质量优于无检索的纯 LLM 回答
- [ ] 对话 UI 可正常交互（输入提问、显示回答、显示引用）

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Embedding API 不可用或限流 | Low | High | 支持本地 Embedding 模型（如 `sentence-transformers`）作为 fallback |
| Chroma 与现有 LangChain 版本兼容性问题 | Medium | Medium | pip 安装指定兼容版本，做集成测试 |
| 只 2 篇博文，检索效果有限 | High | Low | 先以少量文档验证 pipeline，后续可扩展知识源 |
| 现有 Chatbot 前端改造复杂 | Medium | Low | 新建独立简洁 UI，不做深度集成 |
