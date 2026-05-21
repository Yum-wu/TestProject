# 实施任务： {Feature Title}

**变更 ID:** `{change-id}`

---

## 阶段 1: Foundation

- [ ] 1.1 Define data/state/config contract
- [ ] 1.2 Set up required dependencies or runtime components
- [ ] 1.3 Document local prerequisites

**质量门禁:**

- [ ] Contract is explicit
- [ ] Config/env requirements are documented

---

## 阶段 2: Core Logic

- [ ] 2.1 Implement main workflow
- [ ] 2.2 Handle invalid input
- [ ] 2.3 Handle empty/partial/failure result
- [ ] 2.4 Add useful logging for main execution path

**质量门禁:**

- [ ] Happy path implemented
- [ ] Failure path implemented
- [ ] Logs expose key execution state

---

## 阶段 3: Interface/API

- [ ] 3.1 Expose callable interface/API/CLI
- [ ] 3.2 Validate request/input shape
- [ ] 3.3 Return structured success and error results

**质量门禁:**

- [ ] Interface contract is stable
- [ ] Invalid input returns predictable error

---

## 阶段 4: Verification

- [ ] 4.1 Run build/lint/type checks if applicable
- [ ] 4.2 Verify one happy-path scenario
- [ ] 4.3 Verify one invalid-input scenario
- [ ] 4.4 Verify one failure/fallback scenario
- [ ] 4.5 Update docs
- [ ] 4.6 Fill Verification Log

**质量门禁:**

- [ ] Build/lint/type checks pass
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
