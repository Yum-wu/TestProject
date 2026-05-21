# 实施任务： CrewAI 多 Agent 文章生成系统

**变更 ID:** `phase1-crewai-multi-agent`

---

## 阶段 1: Foundation

- [ ] 1.1 Define Agent roles and boundaries (Researcher/Writer/Editor)
- [ ] 1.2 Define Task contracts (input/output format per role)
- [ ] 1.3 Define SSE event protocol (agent_start/agent_complete/tool_call/error/done)
- [ ] 1.4 Add crewai to requirements.txt (`crewai>=0.30,<0.40`)
- [ ] 1.5 Create `app/crew/` module directory structure

**质量门禁:**

- [ ] Contracts are documented
- [ ] Deps install without conflict

---

## 阶段 2: Core Logic — Agent & Task Definitions

- [ ] 2.1 Implement Researcher Agent (role + goal + backstory + tools)
- [ ] 2.2 Implement Writer Agent (role + goal + backstory + output format)
- [ ] 2.3 Implement Editor Agent (role + goal + quality scoring criteria)
- [ ] 2.4 Implement shared tool: web_search (Tavily, conditional on API key)
- [ ] 2.5 Implement shared tool: quality_scorer (LLM-based 1-10 score + suggestions)
- [ ] 2.6 Implement Task: research_topic (output: structured brief + key points)
- [ ] 2.7 Implement Task: write_article (output: Markdown draft)
- [ ] 2.8 Implement Task: review_article (output: final draft + score + suggestions)

**质量门禁:**

- [ ] Each agent/task independently testable
- [ ] Tool registration works with CrewAI

---

## 阶段 3: Crew Orchestration & SSE

- [ ] 3.1 Implement Crew definition (sequential process, context passing)
- [ ] 3.2 Implement step_callback for Agent progress interception
- [ ] 3.3 Map step_callback events to SSE event format
- [ ] 3.4 Log each Agent execution with agent name and duration_ms

**质量门禁:**

- [ ] Three tasks execute sequentially, context passes correctly
- [ ] SSE events emitted for each Agent start/complete

---

## 阶段 4: API / Transport

- [ ] 4.1 Add POST /api/crew/generate (sync, returns full result)
- [ ] 4.2 Add POST /api/crew/generate/stream (SSE, real-time agent status)
- [ ] 4.3 Validate empty/malformed topic input
- [ ] 4.4 Return structured error on Agent failure
- [ ] 4.5 Register crew routes in main.py

**质量门禁:**

- [ ] API contract is stable
- [ ] Invalid input returns predictable 422
- [ ] Error response shape documented

---

## 阶段 5: Frontend Page

- [ ] 5.1 Create CrewGenerator.tsx page (topic input + generate button)
- [ ] 5.2 Implement SSE connection logic for /generate/stream
- [ ] 5.3 Implement CrewLog.tsx component (real-time agent status timeline)
- [ ] 5.4 Implement article result display (Markdown render)
- [ ] 5.5 Register `/crew-generator` route + nav entry

**质量门禁:**

- [ ] SSE agent progress displayed in real-time
- [ ] Article Markdown renders correctly
- [ ] Error states handled gracefully

---

## 阶段 6: Verification

- [ ] 6.1 Run Python lint/type checks (ruff/pyright)
- [ ] 6.2 Verify happy path: topic → 3 agents → final article
- [ ] 6.3 Verify SSE streaming: frontend shows each agent step
- [ ] 6.4 Verify Agent failure: one agent fails → structured error, chain continues
- [ ] 6.5 Verify invalid input: empty topic → 422
- [ ] 6.6 Verify web search unavailable → Agent uses own knowledge fallback
- [ ] 6.7 Update docs with run instructions and API contracts
- [ ] 6.8 Fill Verification Log

**质量门禁:**

- [ ] Lint/type checks pass
- [ ] Required scenarios verified
- [ ] Docs synced
- [ ] Verification Log updated

---

## 阶段 7: Docker Integration & Documentation

- [ ] 7.1 Update docker-compose.yml (verify CrewAI compatibility)
- [ ] 7.2 End-to-end test: docker compose up → request → output
- [ ] 7.3 Document Agent roles, task flow, and API contract in README
- [ ] 7.4 Document known limitations and gaps
- [ ] 7.5 Update 目标.md if applicable

**质量门禁:**

- [ ] Docker Compose starts all services
- [ ] Docs synced
- [ ] Verification Log updated

---

## 完成清单

- [ ] All phases complete
- [ ] All quality gates passed or explicitly marked not applicable
- [ ] Documentation synced
- [ ] Verification Log updated
- [ ] Ready for `Verified` status or `/openspec-archive`

## 验证日志

| 日期 | 检查项 | 命令/方法 | 结果 | 备注 |
|------|-------|------------------|--------|-------|
