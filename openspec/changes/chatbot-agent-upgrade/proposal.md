# 方案： Chatbot Agent Upgrade — Tool Calling + Memory

**变更 ID:** `chatbot-agent-upgrade`
**创建日期:** 2026-05-16
**状态:** Implemented

---

## 问题分析

Chatbot 原为纯前端项目，直接调用 LLM API，存在以下问题：
- 无 Agent 能力：LLM 只能对话，不能调用工具
- 无内存管理：全量历史直接塞入 context，token 线性增长
- API Key 裸奔：前端直接暴露
- 流式解析手写，脆弱不可复用
- 模型切换、工具扩展、记忆策略变更都需改前端代码

## 解决方案

重构为 Python FastAPI 后端 + React 前端的 Agent 架构：
- LangChain Agent 框架管理 LLM 调用、Tool Calling、Memory
- 四层分层记忆系统（L0→L3）+ 上下文卸载
- SSE 流式端点
- 模型可配置（环境变量切换）

## 范围

### 包含

- FastAPI 后端项目初始化
- LangChain Agent 核心循环（Tool Calling Agent）
- Tools：calculator + web_search + read_ref
- 四层记忆系统（L0 Conversation → L1 Atom → L2 Scenario → L3 Persona）
- 上下文卸载（超长工具输出外存）
- SSE 流式 API 端点
- 前端适配新后端
- 模型/工具配置外化（.env）

### 不包含

- 用户认证 / 多用户
- Docker 容器化（后续独立提案）
- 生产部署
- 前端 UI 重设计

## 影响分析

| 组件 | 变更 | 说明 |
|------|-----------------|---------|
| Agent workflow | Yes | LangChain agent with tool calling + streaming |
| Backend API | Yes | FastAPI with SSE streaming endpoint |
| Frontend integration | Yes | api.ts rewritten, useChat adapted |
| Memory/state | Yes | 4-layer memory + context offloading |
| Tool calling | Yes | Calculator, web_search, read_ref |
| Secret management | Yes | API keys moved from frontend to backend .env |
| Observability | Yes | Logging per tool call, memory operation |

## 依赖与复用

### 依赖

- Existing Chatbot React frontend
- Existing Zhipu API key and model access

### 复用

- Existing frontend UI components (ChatWindow, MessageList, InputArea)
- Existing frontend project structure

### 后续能力

- Foundation for LangGraph orchestration
- Foundation for RAG pipeline
- Runtime for future multi-agent workflows

## 非功能约束

- Logging: each tool call and memory operation must be logged with duration
- Error handling: tool failure returns structured error, does not crash Agent
- Timeout/retry: web_search timeout 10s; no auto-retry on tool failure
- Config/env: all provider config from .env; tools conditionally registered based on key presence
- Security/secrets: API keys only in backend .env, never in frontend code or images
- Local vs production: local dev only in this proposal
- Path safety: read_ref must validate path against offloads directory prefix
- Async: memory operations (atom extraction) must not block Agent response flow

## 架构设计

- Model interchangeable via ChatOpenAI (OpenAI-compatible interface); switch by changing LLM_MODEL + LLM_BASE_URL
- Tool extensible: each tool is @tool decorator function; register in ALL_TOOLS list
- Memory layered: L0 (SQLite) → L1 (atom extraction) → L2 (scenario summary) → L3 (persona aggregation)
- Context offloading: tool output >1000 chars → written to offloads/refs/
- SSE protocol: text events, tool_start/tool_end, done, error

## 成功标准

- [ ] Agent auto-selects and calls tools based on user questions
- [ ] Multi-turn conversation retains context (memory works)
- [ ] Streaming output works, user sees per-token output
- [ ] API Key never appears in frontend code or network requests
- [ ] Model switching requires only .env changes (LLM_MODEL + LLM_BASE_URL)
- [ ] Long tool output is offloaded and retrievable via read_ref tool

## 风险与应对

| 风险 | 概率 | 影响 | 应对 |
|------|-------------|--------|------------|
| Zhipu tool calling unstable | Med | High | OpenAI-compatible API fallback; switchable via env |
| LangChain version API changes | Med | Medium | Pin langchain>=0.3,<0.4 in requirements |
| Memory extraction LLM calls consume extra tokens | Med | Low | Async execution, limit to ≤5 facts per extraction |
| SSE event format mismatch | Low | Medium | Documented event schema shared between frontend and backend |
| Tavily search slow in China network | Med | Low | 10s timeout + fallback placeholder |
