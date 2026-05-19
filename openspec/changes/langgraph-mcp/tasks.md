# Implementation Tasks: LangGraph 多 Agent 编排 + MCP 协议

**Change ID:** `langgraph-mcp`

---

## Phase 1: 依赖与基础结构

- [x] 1.1 更新 requirements.txt 添加 langgraph ✓ 2026-05-18
- [x] 1.2 创建 `langgraph/` 模块目录 ✓ 2026-05-18
- [x] 1.3 定义 `state.py` ✓ 2026-05-18
- [x] 1.4 创建 `/api/langgraph/run` 路由 ✓ 2026-05-18

**Quality Gate:**
- [ ] pip install 无冲突
- [ ] 状态类型定义正确

---

## Phase 2: 节点实现

- [x] 2.1 意图理解节点 `nodes/intent.py` ✓ 2026-05-18
- [x] 2.2 RAG 检索节点 `nodes/rag.py` ✓ 2026-05-18
- [x] 2.3 Agent 执行节点 `nodes/agent.py` ✓ 2026-05-18
- [x] 2.4 生成节点 `nodes/generate.py` ✓ 2026-05-18

**Quality Gate:**
- [ ] 每个节点可独立运行
- [ ] 节点间状态传递正确

---

## Phase 3: 图编排

- [x] 3.1 定义 `graph.py`：StateGraph + 条件边路由 ✓ 2026-05-18
- [x] 3.2 配置路由逻辑 ✓ 2026-05-18
- [x] 3.3 checkpointing（状态持久化）✓ 2026-05-18
- [ ] 3.4 human-in-the-loop（待 UI 支持确认）

**Quality Gate:**
- [ ] 三种路由路径全部通过测试
- [ ] checkpointing 支持节点级恢复

---

## Phase 4: MCP 协议集成

- [x] 4.1 实现 `mcp/server.py`：注册所有 tool ✓ 2026-05-18
- [x] 4.2 实现 `mcp/client.py`：远程调用支持 ✓ 2026-05-18
- [ ] 4.3 MCP 调用测试

**Quality Gate:**
- [ ] MCP server 正确注册所有 tool
- [ ] MCP client 正确调用远端 tool

---

## Phase 5: 集成测试

- [ ] 5.1 知识问答路径测试（意图→RAG→生成）
- [ ] 5.2 工具调用路径测试（意图→Agent→生成）
- [ ] 5.3 混合场景路径测试（意图→RAG+Agent→生成）
- [ ] 5.4 错误路径测试

**Quality Gate:**
- [ ] 端到端完成率 ≥ 85%
- [ ] 所有路径测试通过

---

## Completion Checklist

- [ ] 所有 Phase 完成
- [ ] LangGraph 工作流可独立运行
- [ ] MCP 节点间通信正常
- [ ] 可演示三种路由路径
- [ ] Ready for `/openspec-archive`
