"""
意图理解节点 — 轻量规则版。
用关键词匹配替代 LLM 调用，节省 ~1s。
"""

import re
from typing import Tuple

# ── RAG 关键词（知识问答） ──
_RAG_PATTERNS = [
    r"什么是", r"如何", r"怎么", r"怎样", r"介绍",
    r"解释", r"说明", r"比较", r"区别", r"原理",
    r"概念", r"定义", r"特点", r"好处", r"作用",
    r"why\s", r"what\s", r"how\s", r"explain", r"difference",
    r"compare", r"define", r"meaning", r"purpose", r"reason",
]

_RAG_KEYWORDS = [
    "是什么", "意思是", "指的是", "有什么用", "什么用",
    "是什么", "啥是", "哪", "种", "类",
]

# ── Agent 关键词（工具调用） ──
_AGENT_PATTERNS = [
    r"计算", r"搜索", r"查找", r"查询.*数据",
    r"create", r"generate", r"calculate", r"search",
    r"compute", r"find.*file", r"run.*code",
]


def _match_patterns(text: str, patterns: list) -> bool:
    """Return True if any pattern matches *text*."""
    for p in patterns:
        if re.search(p, text, re.IGNORECASE):
            return True
    return False


def _has_rag_keywords(text: str) -> bool:
    """Check for RAG-specific keywords."""
    for kw in _RAG_KEYWORDS:
        if kw in text:
            return True
    return False


def classify_intent(query: str) -> Tuple[str, float]:
    """Classify intent using keyword rules. No LLM call.

    Returns (intent, confidence).
    """
    q = query.strip()

    # 1. Short / greeting → chat
    if len(q) <= 4 or q.lower() in ("hi", "hello", "hey", "你好", "嗨", "哈喽"):
        return "chat", 0.95

    # 2. Check agent patterns first (specific tool requests)
    if _match_patterns(q, _AGENT_PATTERNS):
        # If also has RAG patterns → mixed
        if _match_patterns(q, _RAG_PATTERNS) or _has_rag_keywords(q):
            return "mixed", 0.7
        return "agent", 0.85

    # 3. Check RAG patterns
    if _match_patterns(q, _RAG_PATTERNS) or _has_rag_keywords(q):
        return "rag", 0.8

    # 4. Default → chat
    return "chat", 0.6


def run_intent_node(query: str, llm_call_fn=None) -> Tuple[str, float]:
    """Classify intent. *llm_call_fn* kept for API compat, but NOT used."""
    return classify_intent(query)
