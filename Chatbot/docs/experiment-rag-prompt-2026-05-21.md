# RAG + Prompt 实验报告

**日期：** 2026-05-21
**测试数据集：** 16 组 Q&A 对（Hermes Agent 实战 + SPA 部署 GitHub Pages 踩坑实录）
**LLM：** GLM-4-Flash-250414
**向量库：** Chroma + Zhipu Embedding + MMR 重排序

## 评估结果

| 指标 | 值 | 目标 | 状态 |
|------|------|------|------|
| Recall@3 | 94% (15/16) | ≥ 80% | ✅ |
| Faithfulness (avg) | 6.5/10 | ≥ 8/10 | ❌ |
| 延迟 p50 | 3.6s | — | 基准 |
| 延迟 p99 | 5.4s | — | 基准 |

## Prompt 策略实验

| 策略 | 问题数 | 有效回答率 | 平均延迟(ms) | P50(ms) |
|------|--------|-----------|-------------|---------|
| direct | 16 | 0% | 3926.0 | 3671.5 |
| cot | 16 | 88% | 3790.8 | 3591.0 |
| few_shot | 16 | 81% | 3752.8 | 3466.5 |

### 分析

- **Direct** 策略 System Prompt 含"如果问题与文档无关，礼貌说明无法回答"规则，LLM 全部拒绝回答 → 0% 有效回答率
- **CoT** 策略要求分步推理，效果最优（88%），但回答冗长
- **Few-shot** 策略通过示例引导，效果良好（81%），回答更简洁
- 三种策略延迟接近（3.7-3.9s），差异主要在 LLM 推理时间而非检索

### Faithfulness 详情

| 问题 | Faithfulness |
|------|:----------:|
| Hermes Agent 的分层记忆系统有几层？每层叫什么？ | 10 |
| 集成四层记忆后，Hermes Agent 的 Token 消耗和任务成功率变化如何？ | 8 |
| Hermes Agent 的核心优势是什么？ | 7 |
| 文中提到的三个挑战是什么？解决方案分别是什么？ | 10 |
| 把 React SPA 部署到 GitHub Pages 经历了哪三阶段崩溃？ | 10 |
| SPA 路由回退的解决方案是什么？ | 9 |
| Vite 配置中需要设置什么参数？ | 10 |
| React Router 中需要设置什么参数？ | 9 |
| base 和 basename 各自控制什么？ | 8 |

低分问题（< 6）原因：测试数据中部分问题的预期答案不在实际文章内（如"上下文完整性提升的百分比"、"构建阶段出现的两个问题"），导致 RAG 检索不到正确答案，LLM 猜测回答被 judge 惩罚。

## Agent Tool 端到端验证

```
用户 → "Hermes Agent 有几层记忆？请查知识库回答"
  → tool_start: knowledge_retrieval(query="Hermes Agent 有几层记忆？")
  → tool_end: 返回 4 层记忆架构内容 + 来源
  → text: 流式回答"集成 TencentDB-Agent-Memory 的四层记忆架构..."
```

Agent 成功调用 knowledge_retrieval tool 并返回正确答案。

## 改进建议

1. **测试数据**：移除无确切答案的问题，提高 Faithfulness 评分的可靠性
2. **QA 链 System Prompt**：放宽"无法回答"规则，结合 CoT 推理提升回答率
3. **知识源扩展**：增加更多文章到知识库，覆盖更多问题域
