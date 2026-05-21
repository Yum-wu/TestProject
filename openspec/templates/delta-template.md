# 增量： {Component Name}

**变更 ID:** `{change-id}`
**影响范围:** {affected areas}

---

## 新增

### 需求： {Requirement Title}

{Description of required behavior. Use SHALL for hard requirements.}

#### 场景： Happy path

- 给定 {valid precondition}
- 当 {valid action}
- 则 {expected success result}
- AND {observable side effect/result}

#### 场景： Invalid input

- 给定 {invalid or missing input}
- 当 {action is submitted}
- 则 {structured validation error}
- AND {no unsafe side effect occurs}

#### 场景： Partial failure

- 给定 {one dependency/component fails}
- 当 {workflow runs}
- 则 {failure is reported predictably}
- AND {recoverable state is preserved where applicable}

#### 场景： Timeout or fallback

- 给定 {dependency/component exceeds timeout}
- 当 {timeout threshold is reached}
- 则 {fallback/degraded behavior occurs}
- AND {timeout is logged or surfaced}

---

## 修改

### 需求： {Existing Requirement Title}

{Updated behavior, or "(None)" if no modified requirements.}

#### 场景： {Scenario Name}

- 给定 {precondition}
- 当 {action}
- 则 {expected result}

---

## 删除

{Deprecated requirements, or "(None)" if nothing removed.}
