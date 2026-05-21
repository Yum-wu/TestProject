# 方案： LangGraph Multi-Agent Orchestration + MCP Protocol

**变更 ID:** `langgraph-mcp`
**创建日期:** 2026-05-18
**状态:** Implemented

---

## 问题分析

当前 P0 Agent 是单 Agent 架构，P1 RAG 是独立模块。P2 需要将它们串联为多节点工作流：
- 单 Agent 遇到复杂任务时缺乏任务分解能力
- P1 RAG 只能通过 Tool 被动调用，没有编排逻辑
- LangGraph + MCP 是面试高频考点，但项目中无实战

## 解决方案

使用 LangGraph 风格的多节点工作流编排，通过轻量级 MCP 注册中心串联 P0 Agent + P1 RAG：
- 意图节点（LLM 分类）
- RAG 检索节点（封装 P1 Chroma）
- Agent 执行节点（封装 P0 tools）
- 生成节点（汇总输出）

## 范围

### 包含

- LangGraph StateGraph 定义（状态管理 + 条件边）
- 意图理解节点（任务分类路由：rag/agent/chat/mixed）
- RAG 检索节点（封装 P1）
- Agent 执行节点（封装 P0 tools）
- 生成节点（汇总输出 + 来源标注）
- 轻量级 MCP 注册中心（in-process，非标准 MCP SDK）
- checkpointing（节点级状态持久化）

### 不包含

- 标准 MCP SDK 集成（使用轻量级 in-process 注册中心）
- 前端改动（复用现有 UI）
- 大规模性能测试
- 生产 K8s 部署
- human-in-the-loop（待 UI 支持）

## 影响分析

| 组件 | 变更 | 说明 |
|------|-----------------|---------|
| Graph orchestration | Yes | StateGraph + conditional edges for routing |
| Tool calling | Yes | MCP registration + local invocation |
| Error handling | Yes | Tool failure and timeout handling |
| Checkpointing | Yes | Node-level state persistence |
| API surface | Yes | POST /api/langgraph/run |
| UI | No | Reuses existing frontend |

## 依赖与复用

### 依赖

- P0 Agent (app/agent/)
- P1 RAG (app/rag/)

### 复用

- Existing LLM config
- Existing tool registration pattern (ALL_TOOLS list)
- Existing logging infrastructure

### 后续能力

- Conditional routing for different query types
- Foundation for future multi-agent orchestration

## 非功能约束

- Logging: each node execution logged with node name and duration_ms
- Error handling: tool failure returns structured error without crashing graph
- Timeout/retry: per-node timeout should be configurable; tool failure does not auto-retry
- Config/env: nodes, tools, and routes config-driven where feasible
- Security/secrets: no secrets in graph state
- Local vs production: same code path; checkpointing behavior differs by config

## 架构设计

- 轻量级 in-process MCP 注册中心替代标准 MCP SDK（避免 Python 3.14 兼容问题和额外依赖）
- 意图分类：LLM 输出 JSON `{"intent": "rag" | "agent" | "chat" | "mixed", "confidence": 0-1}`
- 路由规则：rag → 仅 RAG | agent → 仅 Agent | mixed → 并行触发 | chat → 直接 LLM
- 状态类型：AgentState TypedDict

## 成功标准

- [ ] 知识类问题 → 走 RAG 节点
- [ ] 计算类问题 → 走 Agent 节点
- [ ] MCP 节点间通信正常运行
- [ ] checkpointing 支持节点级断点恢复
- [ ] 端到端任务完成率 ≥ 85%

## 风险与应对

| 风险 | 概率 | 影响 | 应对 |
|------|-------------|--------|------------|
| LangGraph API 与现有 LangChain 版本不兼容 | Med | High | Lock langgraph version in requirements |
| 轻量级 MCP 替代标准 SDK 维护成本 | Low | Med | In-process 注册中心已够用；后续可迁移 |
| 工作流复杂度超出预期 | Low | Med | MVP 先跑通 2 个节点路径，再扩展 |
