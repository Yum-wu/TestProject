"""
意图理解节点。
用 LLM 判断用户输入属于：知识问答（rag）、工具调用（agent）、闲聊（chat）、混合（mixed）。
"""

import time
from typing import Tuple

INTENT_PROMPT = """分析用户输入，判断意图类型。只返回 JSON。

意图类型：
- "rag": 知识问答类（询问概念、技术细节、比较、原理）
- "agent": 工具调用类（计算、搜索、数据处理）
- "chat": 通用对话（问候、闲聊、观点询问）
- "mixed": 混合型（既需要知识又需要工具）

示例：
Q: "Hermes Agent 有几层记忆？" → {{"intent": "rag", "confidence": 0.95}}
Q: "25 * 37 等于多少？" → {{"intent": "agent", "confidence": 0.98}}
Q: "你好" → {{"intent": "chat", "confidence": 1.0}}
Q: "查一下最近 AI 新闻，然后分析它们的影响" → {{"intent": "mixed", "confidence": 0.85}}

用户输入: {query}
"""


def run_intent_node(query: str, llm_call_fn) -> Tuple[str, float]:
    """Classify intent using LLM. Return (intent, confidence)."""
    import json

    prompt = INTENT_PROMPT.format(query=query)
    response = llm_call_fn([
        {"role": "system", "content": "你是一个意图分类器。只输出 JSON，不要解释。"},
        {"role": "user", "content": prompt},
    ])

    try:
        result = json.loads(response.strip())
        intent = result.get("intent", "chat")
        confidence = result.get("confidence", 0.5)
    except (json.JSONDecodeError, AttributeError):
        intent = "chat"
        confidence = 0.0

    return intent, confidence
