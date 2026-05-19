# AI Agent Engineer 技能路线 — 学习笔记

> 通过 Chatbot 项目的实战，系统掌握了 AI Agent 的核心技能栈。
> 覆盖：Agent 基础 → RAG 知识库 → LangGraph 编排 → MCP 协议 → 四层记忆系统

---

## 项目全景

```
P0: Agent 基础 ──────────┐
   ├─ LangChain Agent     │
   ├─ Tool Calling        │
   ├─ SSE 流式输出        │
   └─ React 聊天前端      │
                          │
P1: RAG 知识库 ───────────┤
   ├─ ChromaDB 向量库     │
   ├─ Zhipu Embedding     │
   ├─ MMR 多样性重排序    │
   └─ 文档索引流水线      │
                          ├── 已全部完成 ✅
P2: LangGraph + MCP ──────┤
   ├─ 意图分类路由        │
   ├─ RAG/Agent/Mixed 节点 │
   ├─ 轻量级 MCP 注册中心  │
   └─ 时序函数编排         │
                          │
P3~P6: 集成与完善 ────────┘
   ├─ Memory 后台任务     │
   ├─ 端到端流式集成      │
   ├─ pytest 测试套件     │
   └─ 文档与学习笔记      │
```

---

## P0: Agent 基础核心

### 关键概念

| 概念 | 实现 | 要点 |
|------|------|------|
| LLM 工厂 | `agent/llm.py` | `ChatOpenAI` 对接 OpenAI 兼容 API，.env 可切换模型 |
| Agent 工厂 | `agent/agent.py` | `create_agent()` (LangChain v1.x API) |
| 流式执行 | `agent/executor.py` | `astream_events` → SSE 事件流 |
| 工具定义 | `tools/*.py` | `@tool` 装饰器 + 类型注解 + docstring |
| 前端 SSE | `api.ts` | `fetch` + `ReadableStream` 逐行解析 |

### 工具链

| 工具 | 安全机制 |
|------|---------|
| `calculator` | AST 白名单沙箱 — 只允许 `math` 模块白名单函数 |
| `web_search` | 条件注册 — 无 TAVILY_API_KEY 时不暴露 |
| `read_ref` | 路径前缀检查 — 防 `../../etc/passwd` |
| `knowledge_retrieval` | 通过 RAG 流水线读取知识库 |

### SSE 事件协议

```
data: {"type": "session",   "content": {"session_id": "uuid"}}
data: {"type": "text",      "content": "逐字块"}
data: {"type": "tool_start","content": {"tool": "calculator", "args": {...}}}
data: {"type": "tool_end",  "content": {"tool": "calculator", "result": "2"}}
data: {"type": "done",      "content": null}
data: {"type": "error",     "content": {"message": "..."}}
```

### 学习要点

- LangChain v1.x API 与 v0.3 差异巨大：`create_agent` vs `create_tool_calling_agent`
- 流式必须用 `astream_events(version="v2")` — `stream()` 不支持工具调用事件
- `@tool` 装饰器自动从函数签名 + docstring 生成 LLM 可读的工具描述
- FastAPI `StreamingResponse` 接收 async generator → SSE 流

---

## P1: RAG 知识库系统

### 架构

```
data/articles/ → loader → text_splitter → Zhipu embed → ChromaDB
用户查询 → ChromaDB(query) → MMR rerank → LLM(generate) → 回答+来源
```

### 关键实现

| 组件 | 文件 | 说明 |
|------|------|------|
| ChromaDB 持久化 | `vector_store.py` | `PersistentClient`，本地可持久化的向量数据库 |
| Zhipu Embedding | `vector_store.py` `ZhipuEmbeddingFn` | Chroma `EmbeddingFunction` 适配器 |
| MMR 重排序 | `vector_store.py` `_mmr_rerank` | 多样性 + 相关性平衡 (`lambda_mult=0.5`) |
| QA 生成 | `qa_chain.py` | 检索 → 格式化上下文 → LLM 回答 |
| 文档加载 | `loader.py` | Markdown + YAML frontmatter 解析 |

### ChromaDB 要点

- `collection.query()` 返回 L2 **距离**（越小越相似），需转换为相似度：`1/(1+distance)`
- 自定义 `EmbeddingFunction` 只需实现 `__call__(self, input)` → `List[List[float]]`
- `chromadb>=0.5` 与 `chromadb<0.5` API 不同（新版 `PersistentClient`）
- 不使用 `langchain-chroma` — 直连 Chroma Python SDK 更可控

### Embedding 要点

- 智谱 `embedding-2` 模型，HTTP API：`POST {base_url}/embeddings`
- 返回值按 `index` 排序对齐输入顺序
- 无本地模型依赖，但需要 API 调用延迟（60s timeout）
- 批量 embed 比分次调用更高效（20 chunks/batch）

### 学习要点

- RAG 不是简单的"问→搜→答"：**检索质量决定回答质量**
  - Chunk 大小：500 chars + 50 overlap
  - 多样性重排序（MMR）比纯相似度检索更适合知识问答
  - Score 转换一致性：所有下游统一使用 `[0, 1]` 相似度
- ChromaDB 的 `add()` 批量插入避免 payload 过大
- 索引和检索是两个独立流水线，分别对应 `/api/rag/index` 和 `/api/rag/query`

---

## P2: LangGraph + MCP 编排

### 架构

```
用户输入
  ↓
意图节点 (LLM 分类) ──路由──→ rag / agent / chat / mixed
  ↓                            ↓
RAG 节点 (ChromaDB)      Agent 节点 (tools)
  ↓                            ↓
生成节点 ←──────── 汇总 ────────┘
  ↓
回答 + nodes_executed + node_times_ms + mcp_calls
```

### 关键实现

| 组件 | 文件 | 说明 |
|------|------|------|
| 意图分类 | `nodes/intent.py` | LLM 输出 JSON `{"intent":"rag","confidence":0.95}` |
| RAG 节点 | `nodes/rag.py` | 封装 ChromaDB 检索 |
| Agent 节点 | `nodes/agent.py` | 封装 P0 LangChain Agent |
| 生成节点 | `nodes/generate.py` | 汇总输出 |
| 工作流编排 | `graph.py` | 时序函数调用 + 路由逻辑 |

### MCP 轻量级注册中心

不依赖标准 `mcp` SDK，自研 in-process 注册中心：

```python
@register_tool("intent_classify", "分类用户意图")
def classify_intent(query: str) -> dict:
    ...
```

| 组件 | 说明 |
|------|------|
| `register_tool(name, desc)` | 装饰器工厂，自动注册到 `MCP_TOOLS` |
| `MCPRegistry` | OOP 封装，支持 `register/get/list/call` |
| `call_tool(name, args)` | 本地调用已注册工具 |
| `register_all_tools()` | 批量注册工作流工具 |

### 路由策略

| 意图 | 行为 | 场景 |
|------|------|------|
| `rag` | 仅 RAG 节点 | 知识问答如"Hermes Agent 有几层记忆" |
| `agent` | 仅 Agent 节点 | 计算/搜索如"25*37=" |
| `mixed` | 并行 RAG + Agent | 复杂问题如"对比 Hermes 和 LangGraph" |
| `chat` | 直接 LLM | 闲聊如"你好" |

### 学习要点

- 时序函数编排比 StateGraph API 更简单直观（适用中小规模）
- 意图分类是编排的核心 — 分类质量决定路由效果
- MCP 协议核心思想：工具注册 → 发现 → 调用，in-process 实现极轻量
- 并行执行（`mixed` 场景）需注意共享状态和竞态

---

## P3: 记忆系统（L0-L3 + 上下文卸载）

### 四层架构

| 层级 | 名称 | 存储 | 加载时机 |
|------|------|------|---------|
| L0 | 原始对话 | SQLite `conversations` 表 | 按需调试 |
| L1 | 原子事实 | SQLite `atoms` 表 | Agent 判断需要精确事实时 |
| L2 | 场景总结 | `offloads/scenarios/*.md` | 新会话加载最近 3 个 |
| L3 | 用户画像 | `offloads/persona.md` (≤2KB) | 始终加载 |

### 上下文卸载

工具输出 > 1000 chars 自动转存文件系统：
```
原内容 → 摘要 + result_ref → Agent 按需 read_ref 恢复
```

安全要点：`target.resolve()` 后做前缀检查，防止 `../../etc/passwd`

---

## 技术决策记录

### 为什么不用标准 `mcp` SDK？

| 因素 | 结论 |
|------|------|
| Python 3.14 兼容 | `mcp` SDK 部分依赖未发布 wheels |
| 复杂度 | 仅需 in-process 通信，SDK 太重 |
| 控制力 | 自研注册中心更灵活 |

### 为什么用 ChromaDB 替代 numpy+pickle？

| 对比 | numpy+pickle | ChromaDB |
|------|-------------|----------|
| 持久化 | 手动序列化 | 自动 WAL |
| 查询 | 全量扫描 | HNSW 索引 |
| 批量操作 | 不支持 | 原生支持 |
| 元数据过滤 | 不支持 | 支持 |

### 为什么用 `create_agent` (v1.x) 而非 `create_tool_calling_agent` (v0.3)？

- LangChain v1.x 重写了 Agent API
- v0.3 的 `AgentExecutor` + `create_tool_calling_agent` 已废弃
- v1.x 使用 CompiliedStateGraph，通过 `astream_events` 流式输出

### 为什么嵌入用 HTTP API 而非本地模型？

- 智谱 embedding-2 模型 API 调用成本低
- 省去 sentence-transformers 本地部署（~500MB 模型文件）
- API 延迟 ~1-3s，对于索引来说可接受

---

## 对比学习：LangGraph vs Temporal

| 维度 | LangGraph | Temporal |
|------|-----------|----------|
| **定位** | LLM 工作流编排 | 分布式任务编排 |
| **抽象层级** | Agent 节点 + 状态图 | 工作流 + 活动 |
| **持久化** | 内存状态 | 持久化事件历史 |
| **重试** | 手动实现 | 内置策略 |
| **适用场景** | AI 应用内的多步骤编排 | 跨服务的长时间业务流程 |
| **学习曲线** | 低（Python 原生） | 中（需要理解 Workflow/Activity） |

**选择建议：**
- 纯 AI 应用（Agent 链、RAG、意图路由）→ **LangGraph**
- 跨服务、需要强一致性的业务流程 → **Temporal**
- 复杂系统可以同时使用：LangGraph 编排 AI 逻辑，Temporal 编排后端流程

---

## 项目文件结构

```
Chatbot/
├── backend/
│   ├── app/
│   │   ├── agent/          # P0: Agent 核心
│   │   │   ├── llm.py      #   LLM 工厂
│   │   │   ├── agent.py    #   Agent 工厂
│   │   │   └── executor.py #   流式执行器
│   │   ├── tools/          # P0: 工具定义
│   │   │   ├── calculator.py
│   │   │   ├── web_search.py
│   │   │   ├── read_ref.py
│   │   │   └── knowledge.py
│   │   ├── memory/         # P3: 记忆系统
│   │   │   ├── manager.py  #   MemoryManager
│   │   │   ├── l0_conversation.py
│   │   │   ├── l1_atom.py
│   │   │   ├── l2_scenario.py
│   │   │   ├── l3_persona.py
│   │   │   └── offload.py
│   │   ├── rag/            # P1: RAG 知识库
│   │   │   ├── vector_store.py
│   │   │   ├── qa_chain.py
│   │   │   ├── loader.py
│   │   │   └── models.py
│   │   ├── langgraph/      # P2: LangGraph+MCP
│   │   │   ├── graph.py
│   │   │   ├── nodes/
│   │   │   └── mcp/
│   │   ├── api/models.py
│   │   ├── config.py
│   │   └── main.py
│   └── tests/              # P4: 测试
│       ├── test_agent.py
│       ├── test_tools.py
│       ├── test_memory.py
│       ├── test_manager.py
│       ├── test_rag.py
│       ├── test_langgraph.py
│       └── test_api.py
├── src/                    # P0: React 前端
│   ├── components/
│   ├── hooks/
│   └── services/
├── rag-ui/                 # P1: RAG 搜索前端
└── openspec/               # 规格文档
```
