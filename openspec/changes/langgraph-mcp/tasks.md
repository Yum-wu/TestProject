# 实施任务： LangGraph Multi-Agent Orchestration + MCP Protocol

**变更 ID:** `langgraph-mcp`

---

## 阶段 1: Foundation

- [ ] 1.1 Define graph state schema (AgentState TypedDict)
- [ ] 1.2 Define node boundaries: intent / rag / agent / generate
- [ ] 1.3 Define routing rules: intent → rag | agent | mixed | chat
- [ ] 1.4 Add langgraph to requirements.txt
- [ ] 1.5 Document graph config and MCP tool registration approach

**质量门禁:**

- [ ] Contract is explicit
- [ ] Config/env requirements are documented

---

## 阶段 2: Core Logic

- [ ] 2.1 Implement intent classification node (LLM-based routing)
- [ ] 2.2 Implement RAG retrieval node (encapsulate P1)
- [ ] 2.3 Implement Agent execution node (encapsulate P0 tools)
- [ ] 2.4 Implement generate node (aggregate output + sources)
- [ ] 2.5 Implement StateGraph with conditional edges
- [ ] 2.6 Implement MCP tool registration (intent_classify, knowledge_retrieval, agent_execute)
- [ ] 2.7 Implement checkpointing for node-level state persistence
- [ ] 2.8 Log each node execution with node name and duration_ms

**质量门禁:**

- [ ] Happy path implemented
- [ ] Failure path implemented
- [ ] Logs expose key execution state

---

## 阶段 3: Interface/API

- [ ] 3.1 Add API endpoint `POST /api/langgraph/run`
- [ ] 3.2 Validate malformed/empty query input
- [ ] 3.3 Return structured response: answer + route + nodes_executed + node_times + mcp_calls

**质量门禁:**

- [ ] API contract is stable
- [ ] Invalid input returns predictable error

---

## 阶段 4: Verification

- [ ] 4.1 Run Python lint/type checks
- [ ] 4.2 Verify knowledge-query routing (intent → rag → generate)
- [ ] 4.3 Verify tool-query routing (intent → agent → generate)
- [ ] 4.4 Verify invalid input returns error
- [ ] 4.5 Verify tool failure does not crash graph
- [ ] 4.6 Update docs with run instructions and API contract
- [ ] 4.7 Fill Verification Log

**质量门禁:**

- [ ] Lint/type checks pass
- [ ] Required scenarios verified
- [ ] Docs synced
- [ ] Verification Log updated

---

## 完成清单

- [ ] All phases complete
- [ ] All quality gates passed or explicitly marked not applicable
- [ ] Documentation synced
- [ ] Ready for `Verified` status or `/openspec-archive`

## 验证日志

| 日期 | 检查项 | 命令/方法 | 结果 | 备注 |
|------|-------|------------------|--------|-------|
