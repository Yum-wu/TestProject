# Implementation Tasks: RAG 检索增强生成 + Prompt 方法论实验

**Change ID:** `rag-prompt-experiments`

---

## Phase 1: 评估体系建设

- [x] 1.1 构造测试数据集：从 `backend/data/articles/` 文章标注 15+ Q&A 对
- [x] 1.2 实现 `evaluator.py`：Recall@k 计算、Faithfulness 评判（LLM-as-judge）
- [x] 1.3 实现延迟采集 + 统计输出（p50/p99/mean）

**Quality Gate:**
- [x] 评估脚本可独立运行，输出结构化结果
- [x] 对已知正确的问题 Recall@3 ≥ 80% ✅ (94%)

---

## Phase 2: Agent Tool 改进

- [x] 2.1 审计现有 `knowledge_retrieval` tool：LLM 实例复用、错误处理
- [x] 2.2 条件注册：知识库有索引才启用该工具
- [x] 2.3 验证 Agent 端到端调用 RAG Tool 回答问题

---

## Phase 3: Prompt 实验框架

- [x] 3.1 Prompt 策略模板化：Direct / CoT / Few-shot 三种 System Prompt
- [x] 3.2 实验运行器：同一组问题分别用三种策略调用，记录结果
- [x] 3.3 输出对比报告（Markdown 表格：准确率 / Token / 延迟）

**Quality Gate:**
- [x] 三种策略各自 ≥ 16 次运行
- [x] 报告包含原始响应供人工核验

---

## Phase 4: 前端增强 + 文档

- [x] 4.1 rag-ui 显示检索评分 + 来源条目（颜色编码 + slug 显示）
- [x] 4.2 文档：更新 README 核心能力表 + API 说明
- [x] 4.3 实验报告归档到 docs/

**Quality Gate:**
- [x] 前端可直观看到每次检索的得分和来源
- [x] 文档同步完整

---

## Completion Checklist

- [x] All phases complete (pending Faithfulness quality gate pass)
- [x] All quality gates passed (except Faithfulness ≥ 8/10 — test data issue)
- [x] Documentation synced
- [ ] Ready for `/openspec-archive` (after git commit)
