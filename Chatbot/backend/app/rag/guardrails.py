"""
Production guardrails: hallucination detection, citation verification.
"""
import json
import logging
import re
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)


HALLUCINATION_CHECK_PROMPT = """你是一个事实核查助手。判断以下 AI 回答是否基于提供的参考文档。

判断标准（0-10）：
- 10：完全基于参考文档，无任何编造
- 7-9：大部分基于参考文档，少量合理推断
- 4-6：部分内容不在参考文档中
- 1-3：大量内容不在参考文档中或与文档矛盾
- 0：完全无关或编造

只输出 JSON 格式：{{"score": <int>, "flagged": <bool>, "reason": "<一句话>"}}

参考文档：
{context}

AI 回答：{answer}
"""


def check_hallucination(answer: str, context: str, llm, threshold: int = 5) -> Dict:
    """
    Runtime hallucination check using a fast LLM call.
    Returns dict with: score, flagged (bool), reason.
    """
    prompt = HALLUCINATION_CHECK_PROMPT.format(context=context[:3000], answer=answer[:2000])
    try:
        resp = llm.invoke([{"role": "user", "content": prompt}])
        text = resp.content.strip().removeprefix("```json").removesuffix("```").strip()
        data = json.loads(text)
        score = int(data.get("score", 0))
        flagged = score < threshold
        return {"score": score, "flagged": flagged, "reason": data.get("reason", "")}
    except Exception as e:
        logger.warning("Hallucination check failed: %s", e)
        return {"score": -1, "flagged": False, "reason": str(e)}


def extract_citations(answer: str) -> List[str]:
    """Extract citation text from answer, e.g. [来源: xxx] or [Source: xxx]."""
    pattern = r'\[(?:来源|Source|引用自|引用)\s*[:：]\s*([^\]]+)\]'
    matches = re.findall(pattern, answer, re.IGNORECASE)
    return [m.strip() for m in matches]


def verify_citations(citations: List[str], sources: List[Dict]) -> Dict:
    """
    Check if cited sources exist in the retrieved sources.
    Returns dict with: valid (list), missing (list), all_verified (bool).
    """
    source_titles = {s.get("title", "") for s in sources}
    valid = []
    missing = []
    for cite in citations:
        found = any(cite in title or title in cite for title in source_titles)
        if found:
            valid.append(cite)
        else:
            missing.append(cite)
    return {"valid": valid, "missing": missing, "all_verified": len(missing) == 0}
