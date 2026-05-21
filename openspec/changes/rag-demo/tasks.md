# 实施任务： RAG Knowledge Base QA System

**变更 ID:** `rag-demo`

---

## 阶段 1: Foundation

- [ ] 1.1 Define retrieval pipeline contract: chunk strategy, embedding model, top_k, retrieval fields
- [ ] 1.2 Add chromadb, langchain-chroma, sentence-transformers to requirements
- [ ] 1.3 Document Chroma storage path, embedding model config, and local prerequisites

**质量门禁:**

- [ ] Contract is explicit
- [ ] Config/env requirements are documented

---

## 阶段 2: Core Logic

- [ ] 2.1 Implement document loader: read MyBlog markdown, parse frontmatter
- [ ] 2.2 Implement text chunking with source metadata preservation
- [ ] 2.3 Implement Chroma index pipeline: embed + store
- [ ] 2.4 Implement retrieval: similarity search + MMR rerank
- [ ] 2.5 Implement QA chain: retrieve → context → LLM → answer + citations
- [ ] 2.6 Handle empty retrieval result (graceful no-answer message)
- [ ] 2.7 Log query text, hit count, and retrieval latency per request

**质量门禁:**

- [ ] Happy path implemented
- [ ] Failure path implemented
- [ ] Logs expose key execution state

---

## 阶段 3: Interface/API

- [ ] 3.1 Add API endpoint `POST /api/rag/query`
- [ ] 3.2 Validate empty/malformed query input (return 400)
- [ ] 3.3 Return structured response: answer + citations + metadata

**质量门禁:**

- [ ] API contract is stable
- [ ] Invalid input returns predictable error

---

## 阶段 4: Verification

- [ ] 4.1 Run Python lint/type checks (ruff/pyright)
- [ ] 4.2 Verify happy path: query with known topic returns relevant answer with citations
- [ ] 4.3 Verify empty query returns validation error
- [ ] 4.4 Verify no-hit query returns graceful no-answer message
- [ ] 4.5 Verify retrieval pipeline handles embedding unavailability (or document limitation)
- [ ] 4.6 Update docs with RAG run instructions and env config
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
