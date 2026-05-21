"""
RAG Evaluation: Recall@k, Faithfulness (LLM-as-judge), Latency stats.
"""

import json
import time
import statistics
from typing import Callable, List, Dict, Any

from app.rag.test_data import TEST_QA_PAIRS, RETRIEVAL_EXPECTED
from app.rag.models import RAGQueryResponse


# ── Recall@k ──

def evaluate_recall(
    retrieve_fn: Callable,
    qa_pairs: List[Dict] = None,
    expected_map: Dict[str, str] = None,
    k: int = 3,
) -> Dict[str, Any]:
    """Evaluate Recall@k: does correct source appear in top-k results?"""
    pairs = qa_pairs or TEST_QA_PAIRS
    exp = expected_map or RETRIEVAL_EXPECTED

    hits = 0
    total = 0
    details = []

    for qa in pairs:
        q = qa["question"]
        if q not in exp:
            continue
        total += 1
        expected_article = exp[q]
        chunks = retrieve_fn(q, top_k=k)
        retrieved_sources = {c["metadata"].get("slug", "") for c in chunks}
        hit = expected_article in retrieved_sources
        if hit:
            hits += 1
        details.append({
            "question": q[:60],
            "expected": expected_article,
            "retrieved": list(retrieved_sources),
            "hit": hit,
        })

    recall = hits / total if total > 0 else 0.0
    return {
        "metric": "Recall@k",
        "k": k,
        "hits": hits,
        "total": total,
        "score": round(recall, 4),
        "details": details,
    }


FAITHFULNESS_JUDGE_PROMPT = """你是一个评估助手。判断以下回答是否忠实于提供的参考文档。

判断标准（0-10）：
- 10：完全基于参考文档，无任何编造
- 7-9：大部分基于参考文档，少量合理推断
- 4-6：部分内容不在参考文档中
- 1-3：大量内容不在参考文档中或与文档矛盾
- 0：完全无关或编造

只输出 JSON 格式：{{"score": <int>, "reason": "<一句话理由>"}}

参考文档：
{context}

回答：{answer}
"""


def evaluate_faithfulness(
    rag_query_fn: Callable,
    llm,
    qa_pairs: List[Dict] = None,
) -> Dict[str, Any]:
    """Evaluate answer faithfulness using LLM-as-judge."""
    pairs = qa_pairs or TEST_QA_PAIRS

    scores = []
    details = []

    for qa in pairs:
        q = qa["question"]
        expected = qa["answer"]

        result: RAGQueryResponse = rag_query_fn(q)
        if not result.sources:
            continue

        context_parts = []
        for s in result.sources:
            context_parts.append(f"[{s.title}]\n{s.chunk}")
        context = "\n\n".join(context_parts)

        judge_prompt = FAITHFULNESS_JUDGE_PROMPT.format(
            context=context, answer=result.answer
        )
        try:
            judge_resp = llm.invoke([{"role": "user", "content": judge_prompt}])
            judge_data = json.loads(judge_resp.content.strip().removeprefix("```json").removesuffix("```").strip())
            score = judge_data["score"]
        except Exception:
            score = 0

        scores.append(score)
        details.append({
            "question": q[:60],
            "answer": result.answer[:200],
            "faithfulness_score": score,
        })

    avg = statistics.mean(scores) if scores else 0.0
    return {
        "metric": "Faithfulness",
        "average_score": round(avg, 2),
        "min": min(scores) if scores else 0,
        "max": max(scores) if scores else 0,
        "num_samples": len(scores),
        "details": details,
    }


# ── Latency ──

def evaluate_latency(
    rag_query_fn: Callable,
    qa_pairs: List[Dict] = None,
    num_runs: int = 3,
) -> Dict[str, Any]:
    """Measure RAG query latency (p50, p99, mean)."""
    pairs = qa_pairs or TEST_QA_PAIRS

    all_latencies = []

    for qa in pairs:
        q = qa["question"]
        for _ in range(num_runs):
            start = time.time()
            rag_query_fn(q)
            elapsed = (time.time() - start) * 1000
            all_latencies.append(elapsed)

    if not all_latencies:
        return {"metric": "Latency", "error": "no data"}

    sorted_lats = sorted(all_latencies)
    n = len(sorted_lats)

    return {
        "metric": "Latency (ms)",
        "mean_ms": round(statistics.mean(sorted_lats), 1),
        "p50_ms": round(sorted_lats[n // 2], 1),
        "p99_ms": round(sorted_lats[int(n * 0.99) - 1], 1),
        "min_ms": round(sorted_lats[0], 1),
        "max_ms": round(sorted_lats[-1], 1),
        "num_samples": n,
    }


# ── Full suite ──

def run_full_evaluation(
    retrieve_fn: Callable,
    rag_query_fn: Callable,
    llm,
    recall_k: int = 3,
    latency_runs: int = 3,
) -> Dict[str, Any]:
    """Run all evaluations and return combined report."""
    return {
        "recall": evaluate_recall(retrieve_fn, k=recall_k),
        "faithfulness": evaluate_faithfulness(rag_query_fn, llm),
        "latency": evaluate_latency(rag_query_fn, num_runs=latency_runs),
    }
