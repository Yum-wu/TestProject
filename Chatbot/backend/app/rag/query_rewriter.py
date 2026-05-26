"""
Query rewriting for RAG: expand queries, generate variants.
"""
import json
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)


REWRITE_PROMPT = """你是查询改写助手。将用户问题改写为更适合知识库检索的形式。

规则：
1. 把口语化表达改为书面语
2. 扩展缩写和指代不明的内容
3. 生成 2-3 个不同角度的查询变体
4. 保留原问题的核心意图

只输出 JSON 格式：{{"rewritten": "<主查询>", "variants": ["<变体1>", "<变体2>"]}}

用户问题：{query}
"""


def rewrite_query(query: str, llm) -> Dict:
    """
    Rewrite user query for better retrieval.
    Returns dict with: rewritten (str), variants (list[str]).
    Falls back to original query on failure.
    """
    prompt = REWRITE_PROMPT.format(query=query)
    try:
        resp = llm.invoke([{"role": "user", "content": prompt}])
        text = resp.content.strip().removeprefix("```json").removesuffix("```").strip()
        data = json.loads(text)
        return {
            "rewritten": data.get("rewritten", query),
            "variants": data.get("variants", [query]),
        }
    except Exception as e:
        logger.warning("Query rewriting failed: %s", e)
        return {"rewritten": query, "variants": [query]}


def expand_queries(query: str, llm) -> List[str]:
    """Return deduplicated list of expanded queries for multi-query retrieval."""
    result = rewrite_query(query, llm)
    queries = [result["rewritten"]] + result.get("variants", [])
    return list(dict.fromkeys(queries))
