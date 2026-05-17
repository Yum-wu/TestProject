# Delta: API Protocol

**Change ID:** `chatbot-agent-upgrade`
**Affects:** `backend/app/api/`, `src/services/api.ts`

---

## ADDED

### Requirement: SSE 流式聊天端点

`POST /api/chat/stream`

**Request Body (JSON):**
```json
{
  "message": "用户消息文本",
  "session_id": "uuid-string (可选，首次为空)"
}
```

**Response:** SSE 事件流 (`text/event-stream`)

**事件类型:**

| type | direction | content | 触发时机 |
|------|-----------|---------|---------|
| `session` | server→client | `{"session_id": "uuid"}` | 连接建立时首发 |
| `text` | server→client | `"逐字文本块"` | LLM 输出 tokens |
| `tool_start` | server→client | `{"tool": "calculator", "args": {...}}` | Agent 开始调用工具 |
| `tool_end` | server→client | `{"tool": "calculator", "result": "56088"}` | 工具调用完成 |
| `done` | server→client | `null` | 本轮回复结束 |
| `error` | server→client | `{"message": "错误描述"}` | 发生错误 |

#### Scenario: 正常对话流式输出
- GIVEN 用户发送 "你好"
- WHEN 前端连接 SSE
- THEN 依次收到: `session` → `text`("你好") → `text`("！") → `text`("有什么")... → `done`

#### Scenario: 带工具调用的回复
- GIVEN 用户发送 "1+1等于几"
- WHEN Agent 决定调用 calculator
- THEN 依次收到: `session` → `tool_start`({"tool":"calculator","args":{"expression":"1+1"}}) → `tool_end`({"tool":"calculator","result":"2"}) → `text`("1+1")... → `done`

#### Scenario: API Key 未配置
- GIVEN 后端 .env 未设置 `LLM_API_KEY`
- WHEN 前端发送请求
- THEN 收到 `error` 事件: `{"message": "LLM 配置错误，请联系管理员"}`

---

### Requirement: 会话管理端点

**`GET /api/sessions`** — 列出活跃会话（调试用）

Response: `{"sessions": ["uuid1", "uuid2"], "count": 2}`

**`DELETE /api/sessions/{session_id}`** — 清除指定会话

Response: `{"status": "deleted", "session_id": "uuid"}`

**`GET /api/health`** — 健康检查

Response: `{"status": "ok", "model": "GLM-4-Flash-250414", "tools": ["calculator", "web_search"]}`

---

## MODIFIED

### Requirement: 前端 API 层 — 指向后端

`src/services/api.ts` 从直连智谱 API 改为连接本地 FastAPI。

| 项目 | 旧 | 新 |
|------|----|----|
| 请求目标 | `https://open.bigmodel.cn/api/paas/v4/chat/completions` | `http://localhost:8000/api/chat/stream` |
| 请求格式 | OpenAI Chat Completions | 自定义 JSON `{message, session_id}` |
| API Key | 包含在请求头 | 不再发送 |
| 流式解析 | 手写 SSE | 适配新事件类型 |
| session_id | 无 | 首次从 `session` 事件获取，后续请求携带 |

#### Scenario: 首次对话
- GIVEN 前端无 session_id
- WHEN 发送第一条消息
- THEN 从首个 SSE `session` 事件中提取 session_id 并保存

#### Scenario: 连续对话
- GIVEN 已有 session_id
- WHEN 发送后续消息
- THEN 请求携带 session_id，后端使用该会话的 Memory

---

## REMOVED

- 前端 `ZL_API_KEY` 变量及相关代码
- 前端手动构建 OpenAI 格式消息体的逻辑
- 前端手写 `ReadableStream` SSE 解析器
