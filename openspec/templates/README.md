# OpenSpec 模板

本目录定义本仓库 OpenSpec 提案、任务、delta spec 的统一模板。

## Status Lifecycle

只使用以下状态：

- `Draft`：提案已创建，尚未确认
- `Approved`：方案已确认，尚未实施
- `In Progress`：正在实施
- `Implemented`：主功能完成，但未完成验证
- `Verified`：质量门和验收通过
- `Archived`：已归档

## Task Template Levels

### S: Small / Config / Docs / Containerization

适用：

- Dockerfile
- docker-compose
- README
- CI 小改
- 配置类变更

阶段：1. Implementation → 2. Validation → 3. Documentation

### M: Single Feature / Demo

适用：

- RAG demo
- LangGraph demo
- 单 API 功能
- 单模块能力

阶段：1. Foundation → 2. Core Logic → 3. Interface/API → 4. Verification

### L: Multi-Module / Multi-Agent / Cross-Service

适用：

- 多 Agent workflow
- 跨前后端功能
- 多服务协作
- 状态复杂系统

阶段：1. Foundation → 2. Orchestration/Core Logic → 3. API/Transport → 4. UI/Consumption → 5. Failure Handling → 6. Verification → 7. Documentation & Handoff

## Quality Gate Rules

只勾选已验证项目。禁止因为"应该可以"而勾选。

通用 gate：

- Build/lint passes
- Required tests pass
- Key scenario manually verified
- Docs synced
- Verification log updated

按需 gate：

- Performance measured
- Failure path verified
- Config/env documented

## Verification Log

每个 `tasks.md` 必须包含：

## Verification Log

| 日期 | 检查项 | 命令/方法 | 结果 | 备注 |
|------|-------|------------------|--------|-------|

## Archive Rules

只有同时满足以下条件，才能从 `openspec/changes/` 移到 `openspec/archive/`：

- Status 为 `Verified`
- tasks gate 已核实
- Verification Log 有记录
- proposal/tasks/spec 三者一致
- 已补充结项复盘

归档 proposal 需追加：

## Final Outcome

## Deviations From Plan

## Lessons Learned
