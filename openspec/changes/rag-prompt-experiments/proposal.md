# Proposal: RAG 检索增强生成 + Prompt 方法论实验

**Change ID:** `rag-prompt-experiments`
**Created:** 2026-05-21
**Status:** Implementation Complete (pending verification)
**Completed:** 2026-05-21

---

## Problem Statement

当前 Chatbot 已有 RAG 基础设施（Chroma 向量库 + 检索 pipeline + QA chain），但：

- RAG Tool 已注册但未审计质量，每次调用新建 LLM 实例效率低
- 缺乏系统化的 RAG 评估（Recall、Faithfulness、延迟），无法量化质量
- Prompt 策略单一（固定 System Prompt），未对比 Direct / CoT / Few-shot 效果差异
- 面试高频考点"RAG 质量评估"和"Prompt 策略对比"缺少项目实战支撑

## Proposed Solution

在现有 RAG 能力基础上做三层增强：

1. **Agent Tool 改进**：审计现有 `knowledge_retrieval` tool，修复每次调用新建 LLM 实例的问题
2. **评估体系**：实现 Recall@k、Faithfulness、延迟采集脚本，量化 RAG 质量
3. **Prompt 实验框架**：对同一组测试问题，分别用 Direct / CoT / Few-shot Prompt 策略运行，记录准确率和 Token 消耗

## Scope

### In Scope
- 审计改进现有 RAG Agent Tool（`knowledge_retrieval`），修复 LLM 重复创建
- 评估脚本：Recall@k 计算、Faithfulness 评判、延迟分布统计
- Prompt 实验：Direct / CoT / Few-shot 三种策略对比
- 实验报告输出（结构化 Markdown）
- 增强 rag-ui 前端显示检索来源 + 评分

### Out of Scope
- RAG 知识源扩展到非现有 articles 内容
- 多轮对话中的 RAG 上下文融合
- 向量库切换（Milvus/Pinecone）
- 生产级 RAG 部署（缓存、批量更新）

## Impact Analysis

| Component | Change Required | Details |
|-----------|-----------------|---------|
| Agent Tools | Yes | 改进现有 `knowledge_retrieval` @tool（LLM 实例复用） |
| RAG Pipeline | Yes | 新增评估模块 + Prompt 策略参数化 |
| API | Yes | 新增 `/api/rag/evaluate` + 实验端点 |
| Frontend (rag-ui) | Yes | 展示检索评分 + 来源置信度 |
| Chatbot Frontend | No | Agent 自动调用 RAG Tool，无需 UI 变更 |
| Tests | Yes | RAG 评估测试 + Prompt 策略正确性 |

## Architecture Considerations

- 评估模块沿用 `app/rag/` 目录结构，新增 `evaluator.py` + `prompt_experiment.py`
- Tool 复用现有注册，改进方向：LLM 实例复用 + 条件可见性优化
- Prompt 策略统一接收 `(query, context)` 参数，仅 System Prompt 模板不同
- 评估数据集从现有 `backend/data/articles/` 文章构造 10-15 组 Q&A 对

## Success Criteria

- [ ] Recall@3 ≥ 80%（在测试数据集上）
- [ ] Answer Faithfulness ≥ 80%
- [ ] Agent 可通过 `knowledge_retrieval` 工具回答知识库问题
- [ ] Prompt 实验输出三种策略的对比表格（准确率 / Token 消耗 / 延迟）
- [ ] 实验报告可读且可直接用于面试展示

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Embedding API 不稳定 | Med | Medium | 失败降级返回空结果，不影响 Agent main flow |
| 测试数据集少，评估不置信 | High | Low | 用现有 2 篇文章构造 15+ 组 Q&A |
| Prompt 策略差异不明显 | Medium | Low | 选择需要推理的问题，放大 Direct vs CoT 差异 |
