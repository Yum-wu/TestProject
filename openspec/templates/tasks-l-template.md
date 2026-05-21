# 实施任务： {Feature Title}

**变更 ID:** `{change-id}`

---

## 阶段 1: Foundation

- [ ] 1.1 Define component boundaries
- [ ] 1.2 Define shared state/input/output contract
- [ ] 1.3 Define config/env strategy
- [ ] 1.4 Define logging and error categories

**质量门禁:**

- [ ] Boundaries are explicit
- [ ] Contracts are documented
- [ ] Config/env strategy is documented

---

## 阶段 2: Orchestration / Core Logic

- [ ] 2.1 Implement first core step/component
- [ ] 2.2 Implement second core step/component
- [ ] 2.3 Implement final core step/component
- [ ] 2.4 Persist or expose intermediate execution state where needed

**质量门禁:**

- [ ] Core happy path works
- [ ] Intermediate state is observable/debuggable

---

## 阶段 3: API / Transport

- [ ] 3.1 Add API/transport entrypoint
- [ ] 3.2 Validate malformed/empty input
- [ ] 3.3 Return/stream structured progress and result events
- [ ] 3.4 Return structured errors

**质量门禁:**

- [ ] API contract is stable
- [ ] Invalid input behavior verified
- [ ] Error response shape is predictable

---

## 阶段 4: UI / Consumption

- [ ] 4.1 Render progress/state updates
- [ ] 4.2 Render final result
- [ ] 4.3 Render failure/degraded states
- [ ] 4.4 Keep UI independent from backend internals

**质量门禁:**

- [ ] UI handles success
- [ ] UI handles failure/degraded state
- [ ] UI contract matches API/transport contract

---

## 阶段 5: Failure Handling

- [ ] 5.1 Handle first-step failure
- [ ] 5.2 Handle middle-step failure
- [ ] 5.3 Handle final-step timeout/fallback
- [ ] 5.4 Define retry/cancel/degraded-output behavior

**质量门禁:**

- [ ] Failure path verified
- [ ] Timeout/fallback behavior verified
- [ ] Retry/cancel/degraded behavior documented

---

## 阶段 6: Verification

- [ ] 6.1 Run build/lint/type checks
- [ ] 6.2 Run required tests
- [ ] 6.3 Verify one happy-path scenario
- [ ] 6.4 Verify one invalid-input scenario
- [ ] 6.5 Verify one partial-failure scenario
- [ ] 6.6 Verify one timeout/fallback scenario
- [ ] 6.7 Measure latency/performance if applicable

**质量门禁:**

- [ ] Build/lint/type checks pass
- [ ] Required tests pass
- [ ] Key scenarios manually verified
- [ ] Performance measured or marked not applicable

---

## 阶段 7: Documentation & Handoff

- [ ] 7.1 Update README / local run docs
- [ ] 7.2 Document env vars and provider config
- [ ] 7.3 Document API/event/result schema
- [ ] 7.4 Document known limitations
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
