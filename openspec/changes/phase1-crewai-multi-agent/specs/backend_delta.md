# 增量： CrewAI Multi-Agent Backend & Frontend

**变更 ID:** `phase1-crewai-multi-agent`
**影响范围:** `backend/app/crew/`, `backend/app/api/routes.py`, `frontend/src/pages/CrewGenerator.tsx`, `frontend/src/components/CrewLog.tsx`, `docker-compose.yml`

---

## 新增

### 需求： CrewAI Multi-Agent Article Generation

System SHALL provide three-agent sequential article generation via CrewAI.

Roles: Researcher (web search + brief), Writer (draft from brief), Editor (review + score + suggestions).

#### 场景： Happy path — three agents generate article
- 给定 user provides a topic string ("Python 异步编程入门")
- 当 POST /api/crew/generate is called
- 则 Researcher produces brief → Writer produces draft → Editor produces final article with quality score (1-10)
- AND response includes `article`, `agent_logs` (3 entries with agent name + duration_ms), `quality_score`

#### 场景： Empty topic rejected
- 给定 user sends empty topic "" or "  "
- 当 POST /api/crew/generate receives request
- 则 returns 422 validation error with `{"detail": [{"field": "topic", "message": "topic must not be empty"}]}`
- AND no Crew execution occurs

#### 场景： One Agent fails mid-chain
- 给定 Researcher succeeds but Writer encounters LLM error
- 当 Crew executes
- 则 Writer error is captured in `agent_logs` with `{"agent": "Writer", "status": "error", "message": "..."}`
- AND Editor may still execute if context available
- AND response includes partial output + error markers, no crash

#### 场景： Web search timeout / unavailable
- 给定 Tavily API is slow or unreachable
- 当 Researcher Agent calls web_search
- 则 search returns timeout/error
- AND Researcher uses own knowledge to produce brief (goal-level fallback)
- AND final article quality may be lower but flow completes

---

### 需求： SSE Streaming for Agent Progress

System SHALL provide SSE streaming to display real-time agent execution status.

Events: `agent_start` (agent name + role), `agent_complete` (agent name + output summary), `tool_call` (tool name), `error`, `done`.

#### 场景： Happy path — SSE stream shows all agents
- 给定 POST /api/crew/generate/stream with `{"topic": "AI 伦理"}`
- 当 Crew executes sequentially
- 则 SSE events: `agent_start`(Researcher) → `agent_complete`(Researcher) → `agent_start`(Writer) → `agent_complete`(Writer) → `agent_start`(Editor) → `agent_complete`(Editor) → `done`

#### 场景： Agent failure during streaming
- 给定 Writer Agent fails during generation
- 当 SSE stream is active
- 则 events: ... → `agent_start`(Writer) → `error`({"agent": "Writer", "message": "..."}) → `agent_complete`(Writer, partial) → ... → `done` with error flag

---

### 需求： CrewGenerator Frontend Page

System SHALL provide a `/crew-generator` page for multi-agent article generation.

Components: topic input + generate button, CrewLog (real-time agent timeline), article result (Markdown).

#### 场景： Happy path — frontend displays full flow
- 给定 user navigates to `/crew-generator`
- 当 user enters topic and clicks "生成文章"
- 则 CrewLog shows agent timeline (Researcher → Writer → Editor) with real-time status updates
- AND article renders as formatted Markdown
- AND quality score badge displayed

#### 场景： Error displayed without page crash
- 给定 an Agent fails mid-generation
- 当 frontend receives error event
- 则 CrewLog shows error marker for failed agent with message
- AND partial output displayed if available
- AND user can retry with same topic

---

## 修改

### 需求： Docker Compose

Docker Compose SHALL be verified/extended to support CrewAI dependencies alongside existing Chatbot services.

#### 场景： Multi-service startup with CrewAI
- 给定 docker-compose.yml updated
- 当 `docker compose up --build`
- 则 backend starts with crewai installed and routes registered
- AND frontend can reach /crew-generator route

---

## 删除

(None)
