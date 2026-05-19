# Proposal: LangGraph 多 Agent 编排 + MCP 协议

**Change ID:** `langgraph-mcp`
**Created:** 2026-05-18
**Status:** Implementation Complete ✓
**Created:** 2026-05-18
**Completed:** 2026-05-18

---

## Problem Statement

当前 P0 Agent 是单 Agent 架构（一个 LangChain agent 处理所有请求），P1 RAG 是独立模块。P2 的目标是把它们串起来：

- 单 Agent 遇到复杂任务时缺乏任务分解能力
- P1 RAG 只能通过 Tool 被动调用，没有编排逻辑
- 面试中 LangGraph + MCP 是高频考点，但项目里没有实战

## Proposed Solution

用 **LangGraph** 搭建多节点工作流，节点间通过 **MCP 协议**通信，串联 P0 Agent + P1 RAG。

### 工作流设计

```
用户输入
  ↓
[意图理解节点] ──判断任务类型──→ [路由逻辑]
  ↓                                  ↓
[RAG 检索节点]               [Agent 执行节点]
  (调用 Chroma)                (调用 P0 tools)
  ↓                                  ↓
[生成节点] ←──────── 汇总 ──────────┘
  ↓
最终回答 + 调用链追踪
```

### MCP 集成

每个工作流节点通过 MCP 协议暴露/调用工具：
- RAG 节点注册 `knowledge_retrieval` MCP tool
- Agent 节点注册 `calculator` / `web_search` MCP tools
- 意图节点注册 `intent_classify` MCP tool
- MCP Client 在节点间传递状态和调用结果

## Scope

### In Scope
- LangGraph StateGraph 定义（状态管理 + 条件边）
- 意图理解节点（任务分类路由）
- RAG 检索节点（封装 P1）
- Agent 执行节点（封装 P0 tools）
- 生成节点（汇总输出 + 来源标注）
- MCP Server 注册（每个节点一个 tool）
- MCP Client 调用（节点间协议通信）
- checkpointing（节点级状态持久化）
- human-in-the-loop（关键节点审批）

### Out of Scope
- 前端改动（复用现有 UI）
- 大规模性能测试
- 生产 K8s 部署（P3 再做）

## Impact Analysis

| Component | Change Required | Details |
|-----------|-----------------|---------|
| Chatbot Backend | Yes | 新增 `langgraph/` 模块、MCP 节点定义 |
| P0 Agent | Minimal | 封装为 LangGraph 中的一个节点 |
| P1 RAG | Minimal | 封装为 LangGraph 中的一个节点 |
| Dependencies | Yes | 新增 `langgraph` Python 包 |

## Architecture

```
Chatbot/backend/app/
├── langgraph/
│   ├── __init__.py
│   ├── graph.py           # StateGraph 定义 + 条件边
│   ├── state.py           # 状态类型定义
│   ├── nodes/
│   │   ├── __init__.py
│   │   ├── intent.py      # 意图理解节点
│   │   ├── rag.py         # RAG 检索节点
│   │   ├── agent.py       # Agent 执行节点
│   │   └── generate.py    # 生成节点
│   └── mcp/
│       ├── __init__.py
│       ├── server.py      # MCP Server 注册
│       └── client.py      # MCP Client 调用
├── api/
│   └── routes.py          # 新增 /api/langgraph/ 路由
```

## Success Criteria

- [ ] LangGraph 工作流正确路由到对应节点
- [ ] 知识类问题→走 RAG 节点，计算类问题→走 Agent 节点
- [ ] MCP 节点间通信正常运行
- [ ] checkpointing 支持节点级断点恢复
- [ ] 端到端任务完成率 ≥ 85%

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| LangGraph API 与现有 LangChain 版本不兼容 | Medium | High | 锁定版本，先跑通最小 demo |
| MCP Python SDK 还没稳定 | Medium | Medium | 用 LangChain 作为 MCP 的 abstraction layer |
| 工作流太复杂超出预期 | Low | Medium | MVP 先跑通 2 个节点路径，再扩展 |
