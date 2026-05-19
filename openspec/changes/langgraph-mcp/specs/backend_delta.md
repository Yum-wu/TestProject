# Delta: Chatbot Backend (LangGraph + MCP 模块)

**Change ID:** `langgraph-mcp`
**Affects:** `Chatbot/backend/app/`

---

## ADDED

### Module: `app/langgraph/` — LangGraph 工作流引擎

多 Agent 编排引擎，通过 MCP 协议串联 RAG + Agent 节点。

#### 架构说明

```
用户输入
  ↓
意图节点 (LLM 分类) ──路由──→ rag / agent / chat / mixed
  ↓                            ↓
RAG 节点 (ChromaDB)      Agent 节点 (P0 tools)
  ↓                            ↓
生成节点 ←──────── 汇总 ────────┘
  ↓
回答 + nodes_executed + node_times_ms + mcp_calls
```

- 编排方式：**时序函数调用**（非 LangGraph StateGraph API，降低复杂度）
- 意图分类：LLM 输出 JSON `{"intent": "rag"|"agent"|"chat"|"mixed", "confidence": 0.95}`
- 路由规则：`rag` → 仅 RAG 节点 | `agent` → 仅 Agent 节点 | `mixed` → 并行触发两个节点 | `chat` → 直接 LLM 回答
- MCP 通信：轻量级 in-process 注册中心（非标准 MCP SDK，避免 Python 3.14 兼容问题）

#### Scenario: 知识问答路由
- GIVEN 用户输入知识类问题（如"Hermes Agent 有几层记忆？"）
- WHEN 工作流启动
- THEN 意图节点识别为"rag"
- AND 路由到 RAG 检索节点（调用 ChromaDB）
- AND 生成节点输出带来源的回答

#### Scenario: 工具调用路由
- GIVEN 用户输入计算/搜索类问题（如"25 * 37 等于多少？"）
- WHEN 工作流启动
- THEN 意图节点识别为"agent"
- AND 路由到 Agent 执行节点（P0 LangChain Agent）
- AND Agent 调用 calculator / web_search tool
- AND 生成节点输出工具调用结果

#### Scenario: 混合场景
- GIVEN 用户输入复杂问题，需要同时用到 RAG 和工具
- WHEN 工作流启动
- THEN 意图节点识别为"mixed"
- AND 同时触发 RAG 节点 + Agent 节点
- AND 生成节点汇总两部分结果

### API: `POST /api/langgraph/run`

**请求体：**
```json
{
  "query": "Hermes Agent 的分层记忆系统有几层？",
  "session_id": ""
}
```

**响应体：**
```json
{
  "answer": "Hermes Agent 采用四层记忆架构...",
  "route": "rag",
  "nodes_executed": ["intent", "rag", "generate"],
  "node_times_ms": {"intent": 941, "rag": 3444, "generate": 3225, "total": 7611},
  "mcp_calls": [
    {"from": "workflow", "to": "intent_node", "tool": "intent_classify", "duration_ms": 941},
    {"from": "rag_node", "to": "chroma_knowledge_base", "tool": "knowledge_retrieval", "duration_ms": 3444}
  ],
  "error": null,
  "total_time_ms": 7611
}
```

### MCP 协议实现

轻量级注册中心模式（`app/langgraph/mcp/`）：

| 组件 | 文件 | 说明 |
|------|------|------|
| `register_tool(name, desc)` | `__init__.py` | 装饰器工厂：`@register_tool("name", "desc")` |
| `MCPRegistry` | `__init__.py` | 面向对象封装（OOP 兼容） |
| `call_tool(name, args)` | `__init__.py` | 本地调用已注册工具 |
| `list_tools()` | `__init__.py` | 列出所有已注册工具 |
| `register_all_tools()` | `server.py` | 批量注册工作流工具（graph.py 加载时自动调用） |
| `MCPClient` | `client.py` | 支持本地（in-process）和远程（HTTP）两种模式 |

注册的 MCP 工具：
- `intent_classify` — 分类用户意图（rag/agent/chat/mixed）
- `knowledge_retrieval` — 从 ChromaDB 知识库检索信息
- `agent_execute` — 执行 P0 Agent（调用 calculator 等工具）

### 文件结构

```
app/langgraph/
├── __init__.py           # 模块标记
├── state.py              # AgentState TypedDict + initial_state()
├── graph.py              # 工作流编排 + run_workflow() 入口
├── nodes/
│   ├── __init__.py
│   ├── intent.py         # 意图理解节点（LLM JSON 分类）
│   ├── rag.py            # RAG 检索节点（封装 P1）
│   ├── agent.py          # Agent 执行节点（封装 P0）
│   └── generate.py       # 生成节点（汇总输出）
└── mcp/
    ├── __init__.py        # MCP 注册中心 + MCPRegistry 类
    ├── server.py          # register_all_tools()
    └── client.py          # MCPClient（本地/远程调用）
```

---

## MODIFIED

### File: `Chatbot/backend/requirements.txt`

新增：
- `langgraph`（由 langchain v1 自动解析版本，无固定约束）

> 注：标准 `mcp` SDK 未使用——采用轻量级 in-process 注册中心替代，避免
> Python 3.14 兼容问题和额外依赖。

### File: `Chatbot/backend/app/main.py`

**变更：** 新增 `/api/langgraph/run` 路由
```python
@app.post("/api/langgraph/run")
async def langgraph_run(req: dict):
    from app.langgraph.graph import run_workflow
    query = req.get("query", "")
    if not query:
        return {"error": "query required"}
    result = run_workflow(query, session_id=req.get("session_id", ""))
    return result
```

---

## REMOVED

(None)
