# 增量： LangGraph + MCP Backend

**变更 ID:** `langgraph-mcp`
**影响范围:** Chatbot backend graph orchestration, MCP tool registration, API

---

## 新增

### 需求： LangGraph workflow orchestration

System SHALL route user queries through a multi-node workflow via StateGraph.

#### 场景： Happy path — knowledge query

- 给定 user asks a knowledge-related question
- 当 workflow runs
- 则 intent node classifies as "rag"
- AND workflow routes to RAG retrieval node
- AND generate node produces answer with source citations
- AND response includes route, nodes_executed, node_times_ms

#### 场景： Happy path — tool query

- 给定 user asks a calculation/search question
- 当 workflow runs
- 则 intent node classifies as "agent"
- AND workflow routes to Agent execution node
- AND Agent calls calculator/web_search tool
- AND generate node produces answer with tool results

#### 场景： Mixed routing

- 给定 user asks a complex question needing both RAG and tools
- 当 workflow runs
- 则 intent node classifies as "mixed"
- AND RAG and Agent nodes execute in parallel
- AND generate node aggregates both results

#### 场景： Invalid input

- 给定 empty query
- 当 workflow runs
- 则 API returns validation error
- AND no graph nodes execute

#### 场景： Node failure

- 给定 a node (intent/rag/agent) throws an error
- 当 workflow runs
- 则 error is returned in structured response
- AND nodes_executed shows which nodes completed before failure

---

### 需求： MCP-style tool registration

System SHALL register tools via lightweight in-process registry (not standard MCP SDK).

#### 场景： Tool registration

- 给定 a tool is defined with `@register_tool("name", "desc")`
- 当 graph initializes
- 则 tool is discoverable via `list_tools()`
- AND callable via `call_tool(name, args)`

#### 场景： Tool call failure

- 给定 a registered tool throws an error at runtime
- 当 workflow calls `call_tool(name, args)`
- 则 error is captured and returned in `mcp_calls` response
- AND graph does not crash

#### 场景： Unknown tool call

- 给定 an unregistered tool name is requested
- 当 `call_tool(name, args)` is called
- 则 structured error is returned
- AND graph continues with error handling path

---

### 需求： Checkpointing

System SHALL persist node-level state for recovery.

#### 场景： Checkpoint save and restore

- 给定 graph executes multiple nodes
- 当 each node completes
- 则 state is persisted via checkpointing mechanism
- AND on restart, previous state is available

---

## 修改

(None)

---

## 删除

(None)
