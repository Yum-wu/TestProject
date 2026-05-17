# Proposal: Chatbot Agent 升级 — Tool Calling + Memory

**Change ID:** `chatbot-agent-upgrade`
**Created:** 2026-05-16
**Status:** Draft

---

## Problem Statement

当前 Chatbot 是一个**纯前端项目**，存在以下问题：

1. **无 Agent 能力**：LLM 只能对话，不能调用工具（搜索、计算、数据库等），本质是"聊天框套壳"
2. **无 Memory 管理**：全量聊天历史直接塞进 API context，无摘要、无检索、无长期记忆。token 随对话线性增长，最终必超上下文窗口
3. **API Key 裸奔**：智谱 API Key 直接写在前端请求中，任何人打开浏览器 DevTools 即可窃取
4. **流式解析手写**：手写 SSE 解析器，脆弱且不可复用
5. **无后端抽象**：模型切换、工具扩展、记忆策略变更都需要改前端代码

## Proposed Solution

将 Chatbot 重构为 **Python FastAPI 后端 + React 前端的 Agent 架构**，使用 LangChain 框架统一管理 LLM 调用、Tool Calling、Memory。

### 核心变更

| 维度 | 当前 | 目标 |
|------|------|------|
| 运行时 | 浏览器直连 LLM API | FastAPI 后端代理 + Agent 循环 |
| 框架 | 无，手写 fetch | LangChain (langchain + langchain-openai) |
| Tool Calling | 无 | Agent 自动选择调用，预留扩展接口 |
| Memory | 全量历史 | 摘要记忆 + 滑动窗口，可切换策略 |
| 流式输出 | 手写 SSE 解析 | LangChain stream_events + SSE |
| 安全性 | API Key 暴露前端 | Key 存后端 .env |

### 架构图

```
React 前端 (保留)          Python FastAPI 后端 (新建)
┌──────────────┐         ┌─────────────────────────┐
│ ChatWindow   │◄─SSE────┤ /api/chat/stream        │
│ MessageList  │         │                          │
│ InputArea    │──POST──►│ LangChain Agent          │
│              │         │  ├─ ChatModel (智谱)     │
│              │         │  ├─ Tools (计算器/搜索)   │
│              │         │  ├─ Memory (摘要+窗口)    │
│              │         │  └─ Agent Executor       │
│              │         │                          │
│              │         │ .env (API keys)          │
└──────────────┘         └─────────────────────────┘
```

## Scope

### In Scope

- FastAPI 后端项目初始化（Python 项目结构、依赖管理）
- LangChain Agent 核心循环（ReAct / Tool Calling Agent）
- 2 个 demo 工具：计算器 + Web 搜索（Tavily）
- Memory 模块：ConversationSummaryBufferMemory
- SSE 流式 API 端点
- React 前端适配新后端（API 层替换）
- 模型配置外化（.env + OpenAI 兼容接口，支持切换）

### Out of Scope

- 用户认证 / 多用户
- 数据库持久化（会话历史仅内存 + 前端 LocalStorage）
- Docker 容器化
- 生产部署
- 前端 UI 重新设计（保留现有 Tailwind 样式）

## Impact Analysis

| Component | Change Required | Details |
|-----------|:---:|---------|
| 前端 API 层 | **重写** | `src/services/api.ts` 指向本地后端 |
| 前端状态管理 | **轻改** | `useChat.ts` 适配新 SSE 格式 |
| 后端 | **新建** | 全新 Python 项目 |
| 智谱 API Key | **迁移** | 从前端移到后端 .env |
| 现有组件 | 无变化 | ChatWindow/MessageList/InputArea 不动 |
| 测试 | **重写** | Python 测试覆盖 Agent/Memory/Tools |

## Architecture Considerations

- **模型可替换**：使用 `ChatOpenAI` 兼容接口，改环境变量即可切换智谱/DeepSeek/混元/通义千问
- **Tool 可扩展**：每个工具是一个 Python 函数 + `@tool` 装饰器，Agent 自动发现
- **Memory 可切换**：LangChain 的 Memory 模块化设计，后续可换向量检索
- **前端解耦**：React 只关心 SSE 事件流，不感知后端是 LangChain 还是别的东西

## Success Criteria

- [ ] Agent 能根据用户问题**自动选择**并调用工具（如问到计算题时调用 calculator）
- [ ] 对话跨轮次保留上下文（Memory 起作用）
- [ ] 流式输出正常工作，用户看到逐字输出
- [ ] API Key 不出现在前端代码或网络请求中
- [ ] 模型切换只需改 `.env` 两个变量（`LLM_MODEL` + `LLM_BASE_URL`）

## Architecture Diagrams

### 系统架构

```
React 前端 (保留)             Python FastAPI 后端 (新建)
┌──────────────┐            ┌──────────────────────────────────┐
│ ChatWindow   │◄──SSE──────┤ POST /api/chat/stream           │
│ MessageList  │            │                                  │
│ InputArea    │──POST─────►│ LangChain Agent                  │
│              │            │  ├─ ChatModel (智谱/DeepSeek/混元)│
│              │            │  ├─ Tools (calculator/搜索/read_ref)│
│              │            │  └─ MemoryManager                │
│              │            │       ├─ L3 Persona (画像)       │
│              │            │       ├─ L2 Scenario (场景)      │
│              │            │       ├─ L1 Atom (事实)          │
│              │            │       ├─ L0 Conversation (原始)  │
│              │            │       └─ Context Offload (卸载)  │
│              │            │                                  │
│              │            │ offloads/                        │
│              │            │  ├─ refs/*.md    (工具日志外存)  │
│              │            │  ├─ scenarios/*.md (场景总结)   │
│              │            │  ├─ persona.md   (用户画像)     │
│              │            │  └─ canvas_*.mmd (Mermaid画布)  │
└──────────────┘            └──────────────────────────────────┘
```

### 记忆分层结构（参考 TencentDB-Agent-Memory）

```
L3 Persona ─── offloads/persona.md  ─── 用户画像，始终加载 (≈1KB)
    ↑ 聚合
L2 Scenario ── offloads/scenarios/*.md ── 场景总结，新会话加载最近 3 个
    ↑ 聚合
L1 Atom ───── SQLite atoms 表 ──────── 原子事实，按需检索
    ↑ 提取
L0 Conversation ── SQLite conversations 表 ── 原始对话，仅调试回溯时查询
```

```
Context Offload ── 工具长输出 >1000 字符
    → 写入 offloads/refs/{id}.md
    → 上下文只保留 result_ref 摘要
    → Agent 通过 read_ref 工具按需读取
```

## Design Reference

本方案的 Memory 分层架构和上下文卸载模式受 [TencentDB-Agent-Memory](https://github.com/Tencent/TencentDB-Agent-Memory) 启发：
- 4 层渐进式记忆（L0 Conversation → L1 Atom → L2 Scenario → L3 Persona）
- 异质存储 + 渐进披露（上层 Markdown 高密度，下层 SQLite 保完整）
- 符号记忆 + 上下文卸载（Mermaid 画布 + 日志外存）

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|:---:|:---:|------|
| 智谱 Tool Calling 不稳定 | Medium | High | OpenAI 兼容接口兜底，可切 DeepSeek/混元 |
| LangChain 版本 API 变化 | Medium | Medium | 锁定 `langchain>=0.3,<0.4`，requirements.txt 精确版本 |
| SSE 流式解析前后端不一致 | Low | Medium | 统一事件格式，后端发 `data: {"type":"..."}` JSON |
| 国内网络访问 Tavily 慢 | Medium | Low | Tavily 搜索超时 10s，超时返回占位结果 |
