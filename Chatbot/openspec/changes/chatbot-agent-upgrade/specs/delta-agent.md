# Delta: Agent Core

**Change ID:** `chatbot-agent-upgrade`
**Affects:** `backend/app/agent/`

---

## ADDED

### Requirement: LLM 工厂 — 模型可替换

`app/agent/llm.py` 提供 `create_llm()` 工厂函数，从环境变量读取模型配置，返回 LangChain `BaseChatModel` 实例。

- 默认使用 OpenAI 兼容接口（`langchain_openai.ChatOpenAI`）
- 必须支持 `streaming=True`
- 模型名和 base_url 由 `LLM_MODEL` / `LLM_BASE_URL` 环境变量控制

#### Scenario: 默认使用智谱 GLM-4-Flash
- GIVEN `.env` 中设置 `LLM_MODEL=GLM-4-Flash-250414` 和 `LLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4/`
- WHEN `create_llm()` 被调用
- THEN 返回一个指向智谱 API 的 `ChatOpenAI` 实例，`streaming=True`

#### Scenario: 切换到 DeepSeek
- GIVEN `.env` 中 `LLM_MODEL=deepseek-chat` 和 `LLM_BASE_URL=https://api.deepseek.com/v1`
- WHEN `create_llm()` 被调用
- THEN 返回指向 DeepSeek API 的实例，无需修改任何代码

---

### Requirement: Agent 工厂 — Tool Calling Agent

`app/agent/agent.py` 提供 `create_agent(llm, tools, memory)` 函数，返回一个可执行的 LangChain Agent。

- Agent 类型：`create_tool_calling_agent`（LangChain 内置 Tool Calling Agent）
- 绑定 LLM + Tools 列表 + Memory
- System Prompt 包含工具使用指引

#### Scenario: Agent 判断需要调用工具
- GIVEN Agent 绑定了 calculator 工具
- WHEN 用户消息为 "123 * 456 等于多少"
- THEN Agent 输出包含 tool_call，目标为 calculator，参数包含表达式 "123*456"

#### Scenario: Agent 判断无需工具
- GIVEN Agent 绑定了 calculator 工具
- WHEN 用户消息为 "你好，请介绍一下你自己"
- THEN Agent 直接输出文本回复，不产生 tool_call

---

### Requirement: Agent 执行器 — 流式输出

`app/agent/executor.py` 提供 `stream_agent(agent, messages, session_id)` 异步生成器。

- 使用 `agent.astream_events()` 实现逐 token 流式输出
- 输出格式：`{"type": "text" | "tool_start" | "tool_end" | "error", "content": ...}`
- tool_start/tool_end 事件告知前端当前正在调用哪个工具

#### Scenario: 流式输出文本
- GIVEN 用户消息为 "讲个笑话"
- WHEN 前端连接 SSE 端点
- THEN 逐个收到 `{"type": "text", "content": "为"}` → `{"type": "text", "content": "什么"}` ...

#### Scenario: 流式输出包含工具调用
- GIVEN 用户消息为 "计算 2 的 10 次方"
- WHEN Agent 执行过程中
- THEN 事件流依次为：`text` → `tool_start` → `tool_end` → `text`（工具结果融入后续回复）

---

## MODIFIED

(None — 本次为新建模块，无已有规格变更)

## REMOVED

- `src/services/api.ts` 中直接调用智谱 API 的逻辑（替换为调用本地后端）
- 前端硬编码的 API Key 和 API URL
