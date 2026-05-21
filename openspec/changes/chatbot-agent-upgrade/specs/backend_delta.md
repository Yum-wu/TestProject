# 增量： Backend & Frontend

**变更 ID:** `chatbot-agent-upgrade`
**影响范围:** `backend/app/agent/`, `backend/app/tools/`, `backend/app/memory/`, `backend/app/api/`, `src/services/api.ts`, `src/hooks/useChat.ts`

---

## 新增

### 需求： LLM Factory & Agent Core

System SHALL provide configurable LLM creation and Tool-Calling Agent orchestration.

`app/agent/llm.py` — `create_llm()` factory reads env config, returns `ChatOpenAI` (OpenAI-compatible interface).
`app/agent/agent.py` — `create_agent(llm, tools)` returns LangChain `AgentExecutor` with tool-calling agent.
`app/agent/executor.py` — `stream_agent()` async generator emits SSE events via `astream_events()`.

#### 场景： Happy path — tool-calling flow
- 给定 LLM configured with `LLM_MODEL=GLM-4-Flash-250414` and `LLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4/`
- 当 user sends "123 * 456 等于多少"
- 则 Agent emits `tool_start` (calculator) → `tool_end` (result "56088") → `text` tokens → `done`

#### 场景： No tool needed — direct reply
- 给定 Agent bound with calculator and web_search tools
- 当 user sends "你好"
- 则 Agent emits `text` tokens directly without tool_start/tool_end events

#### 场景： LLM API failure
- 给定 `LLM_API_KEY` is invalid or expired
- 当 any user message is sent
- 则 Agent emits `error` event with structured error message, no crash

#### 场景： Model switch via env
- 给定 `.env` has `LLM_MODEL=deepseek-chat` and `LLM_BASE_URL=https://api.deepseek.com/v1`
- 当 `create_llm()` is called
- 则 returns ChatOpenAI instance pointing to DeepSeek API, no code changes needed

---

### 需求： Tool System — Registration, Calculator, Web Search, Read Ref

System SHALL provide a tool registry with typed, documented tools using LangChain `@tool` decorator.

`app/tools/__init__.py` — `ALL_TOOLS` list for Agent injection.
`app/tools/calculator.py` — safe-eval math expression (Python `math` whitelist).
`app/tools/web_search.py` — Tavily search API, conditional on `TAVILY_API_KEY`.
`app/tools/read_ref.py` — path-safe reader for offloaded files under `offloads/refs/`.

#### 场景： Happy path — calculator computation
- 给定 calculator tool is registered
- 当 Agent calls `calculator(expression="2**10")`
- 则 returns "1024"

#### 场景： Malicious expression rejected
- 给定 calculator tool is registered
- 当 Agent calls `calculator(expression="__import__('os').system('ls')")`
- 则 returns error message, sandbox prevents execution

#### 场景： Web search unavailable (no API key)
- 给定 `TAVILY_API_KEY` is empty in `.env`
- 当 Agent initializes tool list
- 则 `web_search` is excluded from `ALL_TOOLS`, Agent responds "我没有搜索能力"

#### 场景： Web search timeout
- 给定 Tavily API is slow or unreachable
- 当 Agent calls `web_search(query="...)`
- 则 returns fallback message after 10s timeout, Agent continues without crash

---

### 需求： SSE Streaming Chat Endpoint

System SHALL provide `POST /api/chat/stream` returning SSE events.

Event types: `session` (session_id), `text` (tokens), `tool_start` (tool+args), `tool_end` (tool+result), `done`, `error`.

#### 场景： Happy path — normal conversation
- 给定 user sends `{"message": "你好"}`
- 当 endpoint processes request
- 则 SSE stream returns: `session` → `text`(多次) → `done`

#### 场景： Tool-calling conversation
- 给定 user sends `{"message": "1+1等于几", "session_id": "abc"}`
- 当 Agent decides to call calculator
- 则 SSE stream returns: `session` → `tool_start` → `tool_end` → `text` → `done`

#### 场景： Empty message rejected
- 给定 user sends `{"message": ""}` or `{"message": "  "}`
- 当 endpoint validates input
- 则 returns 422 validation error with structured error body, no graph execution

#### 场景： Backend LLM not configured
- 给定 `.env` missing `LLM_API_KEY`
- 当 user sends any message
- 则 SSE stream returns: `session` → `error`({"message": "LLM 配置错误，请联系管理员"})

---

### 需求： Session Management & Health Endpoints

System SHALL provide session lifecycle management and health check.

`GET /api/sessions` — list active sessions.
`DELETE /api/sessions/{session_id}` — clear session memory + offload files.
`GET /api/health` — model info + available tools.

#### 场景： Happy path — health check
- 给定 backend is running
- 当 GET /api/health
- 则 returns `{"status": "ok", "model": "GLM-4-Flash-250414", "tools": ["calculator", "web_search", "read_ref"]}`

#### 场景： Delete non-existent session
- 给定 session "nonexistent-id"
- 当 DELETE /api/sessions/nonexistent-id
- 则 returns `{"status": "deleted", "session_id": "nonexistent-id"}` without error

---

### 需求： 4-Tier Memory System (L0–L3) with Context Offloading

System SHALL implement layered memory: L0 Conversation (SQLite), L1 Atoms (fact triples), L2 Scenario (session summary), L3 Persona (aggregated profile).

Context offloading: tool output >1000 chars → written to `offloads/refs/*.md`, context retains summary + `result_ref`.

#### 场景： Happy path — full memory lifecycle
- 给定 new session "abc123"
- 当 user message → Agent execution → tool call → reply
- 则 L0 records user+assistant messages; offload writes file if output >1000 chars; L1 extracts facts async; session end generates L2 scenario; L3 persona updated

#### 场景： Load existing persona at session start
- 给定 L3 persona.md and L2 scenarios exist
- 当 new session begins
- 则 Agent loads persona + recent 3 L2 scenarios into context

#### 场景： L1 atom extraction from tool result
- 给定 Agent calls web_search for "北京天气"
- 当 L1 extraction runs
- 则 generates fact `("Beijing_weather", "temperature", "25°C", 1.0)` with source_ref to L0 conversation row

#### 场景： Context offloading triggers for long output
- 给定 web_search returns 3000-char result
- 当 offload check runs
- 则 result written to `offloads/refs/abc123_websearch_*.md`; context retains summary line with `result_ref`; Agent can call `read_ref` to retrieve full content

---

## 修改

### 需求： Frontend API Layer

`src/services/api.ts` rewritten from direct Zhipu API calls to local FastAPI SSE endpoint.

`src/hooks/useChat.ts` adapted for new event format (session/text/tool_start/tool_end/done/error).

#### 场景： Happy path — streaming reply displayed
- 给定 frontend connects to `http://localhost:8000/api/chat/stream`
- 当 user sends a message
- 则 `text` events are appended to chat window progressively; `tool_start` shows tool indicator; `done` finalizes the message

#### 场景： Error displayed gracefully
- 给定 backend returns SSE `error` event
- 当 frontend receives error
- 则 error message displayed in chat UI; Agent does not crash; user can continue

#### 场景： API key not exposed
- 给定 frontend sends request
- 当 inspecting browser Network panel
- 则 no `LLM_API_KEY` or `ZL_API_KEY` appears in any request header or payload

---

## 删除

- `src/services/api.ts` direct Zhipu API call logic and `ZL_API_KEY` variable
- Frontend hardcoded API Key and API URL
- Frontend manual `ReadableStream` SSE parser (replaced by new event format)
- Original sliding-window context strategy (replaced by layered memory + offloading)
