"""
Prompt Strategy Experiments for RAG QA.
Compares Direct / CoT / Few-shot strategies on same questions.
"""

import time
import statistics
import logging
from app.utils.lang_detect import lang_instruction

logger = logging.getLogger(__name__)

# ── System Prompt templates ──

DIRECT_PROMPT = """你是知识库问答助手。基于提供的参考文档回答用户问题。

规则：
1. 只基于参考文档内容回答。参考文档中没有的信息，说"文档中未提及"。
2. 在回答末尾标注引用来源，格式：[引用自:《文章标题》]
3. 如果问题与文档无关，礼貌说明无法回答。
4. 回答简洁准确。
{lang_instruction}

参考文档：
{context}
"""

COT_PROMPT = """你是知识库问答助手。基于提供的参考文档回答用户问题。

推理步骤（必须遵守）：
1. 仔细阅读参考文档，找出与问题相关的内容
2. 逐条列出你找到的相关证据
3. 基于证据推导出答案
4. 检查答案是否完整覆盖了问题

规则：
- 只基于参考文档内容回答。参考文档中没有的信息，说"文档中未提及"。
- 在回答末尾标注引用来源，格式：[引用自:《文章标题》]
- 如果问题与文档无关，礼貌说明无法回答。
{lang_instruction}

请先写出你的推理过程，再给出最终答案。

参考文档：
{context}
"""

FEW_SHOT_PROMPT = """你是知识库问答助手。基于提供的参考文档回答用户问题。

下面是一些问答示例：

示例 1：
参考文档：Hermes Agent 有 4 层记忆：L0 Conversation、L1 Atoms、L2 Scenarios、L3 Persona
问题：Hermes Agent 有几层记忆？
回答：4 层。L0 Conversation（原始对话记录）、L1 Atoms（原子事实提取）、L2 Scenarios（场景块聚合）、L3 Persona（用户画像）。[引用自:Hermes Agent 实战]

示例 2：
参考文档：GitHub Pages SPA 部署需要设置 base: "/TestProject/" 和 basename="/TestProject"
问题：SPA 部署到 GitHub Pages 需要配置哪些路径参数？
回答：需要配置 Vite 的 base 参数为 "/TestProject/"，以及 React Router 的 basename 参数为 "/TestProject"。base 控制静态资源路径，basename 控制前端路由路径，两个都要配。[引用自:SPA 部署 GitHub Pages 踩坑实录]

---

{lang_instruction}

现在回答以下问题：

参考文档：
{context}

问题：{question}
"""

STRATEGIES = {
    "direct": DIRECT_PROMPT,
    "cot": COT_PROMPT,
    "few_shot": FEW_SHOT_PROMPT,
}


# ── Experiment runner ──

def run_experiment(
    qa_pairs: List[Dict[str, Any]],
    rag_query_fn: Callable,
    llm,
    strategies: List[str] = None,
) -> Dict[str, Any]:
    """Run prompt experiment on Q&A pairs for each strategy."""
    if strategies is None:
        strategies = list(STRATEGIES.keys())

    results = {}
    for strategy in strategies:
        template = STRATEGIES.get(strategy)
        if template is None:
            continue
        logger.info("Running strategy: %s", strategy)
        results[strategy] = _run_single_strategy(qa_pairs, template, rag_query_fn, llm)

    return {
        "strategies": strategies,
        "results": results,
        "comparison": build_comparison_table(results),
    }


def _run_single_strategy(
    qa_pairs: List[Dict],
    system_template: str,
    rag_query_fn: Callable,
    llm,
) -> Dict[str, Any]:
    """Run one strategy on all Q&A pairs."""
    latencies = []
    responses = []

    for qa in qa_pairs:
        q = qa["question"]

        start = time.time()
        result = rag_query_fn(q)
        elapsed = (time.time() - start) * 1000

        # Format context
        from app.utils.lang_detect import detect_language
        lang = detect_language(q)
        lang_instr = lang_instruction(lang).strip()

        context_parts = []
        for s in result.sources:
            context_parts.append(f"[{s.title}]\n{s.chunk}")
        context = "\n\n".join(context_parts) if context_parts else "无参考文档"

        # Apply strategy template
        prompt = system_template.format(context=context, question=q, lang_instruction=lang_instr)
        try:
            llm_resp = llm.invoke([{"role": "user", "content": prompt}])
            answer = llm_resp.content
        except Exception as e:
            answer = f"[Error: {e}]"

        latencies.append(elapsed)
        responses.append({
            "question": q[:60],
            "answer": answer[:500],
            "latency_ms": round(elapsed, 1),
        })

    return {
        "num_questions": len(responses),
        "latency_mean_ms": round(statistics.mean(latencies), 1) if latencies else 0,
        "latency_p50_ms": round(sorted(latencies)[len(latencies) // 2], 1) if latencies else 0,
        "responses": responses,
    }


def build_comparison_table(results: Dict[str, Dict]) -> str:
    """Build markdown comparison table from experiment results."""
    header = "| 策略 | 问题数 | 平均延迟(ms) | P50(ms) |"
    sep = "|------|--------|-------------|---------|"
    rows = []
    for name, data in results.items():
        rows.append(
            f"| {name} | {data['num_questions']} | {data['latency_mean_ms']} | {data['latency_p50_ms']} |"
        )
    return "\n".join([header, sep] + rows)
