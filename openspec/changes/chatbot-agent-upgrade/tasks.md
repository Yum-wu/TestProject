# 实施任务： Chatbot Agent Upgrade

**变更 ID:** `chatbot-agent-upgrade`

Memory module references TencentDB-Agent-Memory layered architecture (L0→L3) + context offloading.

---

## 阶段 1: Foundation

- [ ] 1.1 Define agent/tool/memory component boundaries
- [ ] 1.2 Define SSE event protocol contract (session/text/tool_start/tool_end/done/error)
- [ ] 1.3 Create requirements.txt with pinned versions (langchain>=0.3, langchain-openai, fastapi, etc.)
- [ ] 1.4 Create .env.example with all required env vars
- [ ] 1.5 Define logging categories: tool_call, memory_write, memory_read, error

**质量门禁:**

- [ ] Boundaries are explicit
- [ ] Contracts are documented
- [ ] Config/env strategy is documented

---

## 阶段 2: Agent Orchestration / Core Logic

- [ ] 2.1 Implement LLM factory (create_llm from env config)
- [ ] 2.2 Implement calculator tool (@tool, safe eval)
- [ ] 2.3 Implement web_search tool (Tavily, conditionally registered)
- [ ] 2.4 Implement read_ref tool (path-safe offload reader)
- [ ] 2.5 Register all tools in ALL_TOOLS list
- [ ] 2.6 Implement Agent factory (create_agent with LLM + tools)
- [ ] 2.7 Implement Agent executor (stream_agent using astream_events)
- [ ] 2.8 Log each tool call with tool name and duration

**质量门禁:**

- [ ] Core happy path works
- [ ] Intermediate state is observable/debuggable

---

## 阶段 3: API / Transport

- [ ] 3.1 Add SSE streaming endpoint `POST /api/chat/stream`
- [ ] 3.2 Add session management endpoints (GET/DELETE /api/sessions)
- [ ] 3.3 Add health check endpoint (model + tools info)
- [ ] 3.4 Validate malformed/empty message input
- [ ] 3.5 Return structured errors on failures
- [ ] 3.6 Set up CORS for dev environment (localhost:5173)

**质量门禁:**

- [ ] API contract is stable
- [ ] Invalid input behavior verified
- [ ] Error response shape is predictable

---

## 阶段 4: Memory System

- [ ] 4.1 Initialize SQLite database (conversations + atoms tables)
- [ ] 4.2 Implement L0 Conversation: SQLite storage, 500-msg limit with cleanup
- [ ] 4.3 Implement context offloading: tool output >1000 chars → offloads/refs/*.md
- [ ] 4.4 Implement L1 Atom extraction via LLM (subject-predicate-object triples)
- [ ] 4.5 Implement L2 Scenario: session summary to offloads/scenarios/*.md
- [ ] 4.6 Implement L3 Persona: aggregated user profile to offloads/persona.md
- [ ] 4.7 Implement MemoryManager unified entry point
- [ ] 4.8 Log each memory operation (read/write/offload)

**质量门禁:**

- [ ] Core happy path works
- [ ] Memory state is observable through logs and offload files

---

## 阶段 5: Frontend Integration

- [ ] 5.1 Rewrite api.ts: connect to local backend SSE endpoint
- [ ] 5.2 Adapt useChat.ts for new SSE event format
- [ ] 5.3 Remove frontend API Key and direct LLM API calls
- [ ] 5.4 Verify streaming output, error display, and UI consistency

**质量门禁:**

- [ ] Frontend handles success (streaming output displayed)
- [ ] Frontend handles tool_start/tool_end events correctly
- [ ] Frontend handles error events gracefully

---

## 阶段 6: Verification

- [ ] 6.1 Run Python lint/type checks (ruff/pyright)
- [ ] 6.2 Run unit tests: agent, tools, memory, API
- [ ] 6.3 Verify happy path: user message → streaming response
- [ ] 6.4 Verify tool-calling path: calculation query → calculator tool → result
- [ ] 6.5 Verify memory path: multi-turn context retained
- [ ] 6.6 Verify tool failure returns structured error, Agent does not crash
- [ ] 6.7 Verify API Key not exposed in frontend network requests
- [ ] 6.8 Measure first-token latency for 3 sample queries
- [ ] 6.9 Update docs with run instructions and env vars
- [ ] 6.10 Fill Verification Log

**质量门禁:**

- [ ] Lint/type checks pass
- [ ] Required tests pass
- [ ] Key scenarios manually verified
- [ ] Performance measured or marked not applicable
- [ ] Docs synced
- [ ] Verification Log updated

---

## 阶段 7: Documentation & Handoff

- [ ] 7.1 Update README with local run instructions
- [ ] 7.2 Document env vars and config options
- [ ] 7.3 Document SSE event schema
- [ ] 7.4 Document known limitations and gaps
- [ ] 7.5 Fill Verification Log

**质量门禁:**

- [ ] Docs synced
- [ ] Verification Log updated
- [ ] Ready for `Verified` status or `/openspec-archive`

---

## 完成清单

- [ ] All phases complete
- [ ] All quality gates passed or explicitly marked not applicable
- [ ] Documentation synced
- [ ] Verification Log updated
- [ ] Ready for `/openspec-archive`

## 验证日志

| 日期 | 检查项 | 命令/方法 | 结果 | 备注 |
|------|-------|------------------|--------|-------|
