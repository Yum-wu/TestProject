"""LangGraph 流式工作流 — intent -> RAG -> stream generate"""

import logging
import time
from typing import Any, AsyncGenerator

from app.langgraph.nodes.intent import classify_intent
from app.rag.vector_store import retrieve_keyword, format_context
from app.rag.qa_chain import QA_SYSTEM_PROMPT, QA_SYSTEM_PROMPT_EN
from app.utils.lang_detect import detect_language, lang_instruction

logger = logging.getLogger(__name__)


async def stream_workflow(
    query: str,
    llm: Any,
    session_id: str = "",
    top_k: int = 3,
) -> AsyncGenerator[dict, None]:
    """Execute intent classification -> optional RAG -> streaming LLM generation.

    Args:
        llm: LLM instance supporting `.astream()` (e.g. ChatOpenAI).
    """
    try:
        lang = detect_language(query)

        t0 = time.time()
        intent, confidence = classify_intent(query)
        intent_ms = int((time.time() - t0) * 1000)
        logger.info(f"[StreamWorkflow] Intent: {intent} ({confidence:.0%}) in {intent_ms}ms")

        yield {"type": "intent", "content": {"intent": intent, "confidence": confidence}}

        if intent == "rag":
            yield {"type": "route", "content": "rag"}
            async for event in _stream_rag(query, llm, top_k, lang):
                yield event
        elif intent == "mixed":
            yield {"type": "route", "content": "mixed"}
            async for event in _stream_rag(query, llm, top_k, lang):
                yield event
        else:
            yield {"type": "route", "content": "chat"}
            async for event in _stream_chat(query, llm, lang):
                yield event

    except Exception as e:
        logger.error(f"[StreamWorkflow] Error: {e}", exc_info=True)
        yield {"type": "error", "content": str(e)}

    yield {"type": "done"}


async def _stream_rag(
    query: str,
    llm,
    top_k: int,
    lang: str,
) -> AsyncGenerator[dict, None]:
    t0 = time.time()
    chunks = retrieve_keyword(query, top_k=top_k)
    retrieve_ms = int((time.time() - t0) * 1000)

    if not chunks:
        no_result = (
            "No relevant content found in the knowledge base."
            if lang == "en"
            else "知识库中暂无相关内容，请尝试其他问题。"
        )
        yield {"type": "sources", "sources": []}
        yield {"type": "text", "content": no_result}
        return

    sources = [
        {
            "title": c.get("metadata", {}).get("title", c.get("metadata", {}).get("source", "Unknown")),
            "slug": c.get("metadata", {}).get("slug", ""),
            "score": c.get("score"),
        }
        for c in chunks
    ]
    yield {"type": "sources", "sources": sources}

    context = format_context(chunks)
    system_prompt = QA_SYSTEM_PROMPT_EN if lang == "en" else QA_SYSTEM_PROMPT
    lang_instr = lang_instruction(lang).strip()
    prompt = system_prompt.format(context=context, lang_instruction=lang_instr)

    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": query},
    ]

    async for chunk in llm.astream(messages):
        if chunk.content:
            yield {"type": "text", "content": chunk.content}


async def _stream_chat(
    query: str,
    llm,
    lang: str,
) -> AsyncGenerator[dict, None]:
    lang_instr = lang_instruction(lang).strip()
    sys_prompt = (
        f"You are a friendly AI assistant. {lang_instr}"
        if lang == "en"
        else f"你是一个友好的 AI 助手。{lang_instr}"
    )

    messages = [
        {"role": "system", "content": sys_prompt},
        {"role": "user", "content": query},
    ]

    async for chunk in llm.astream(messages):
        if chunk.content:
            yield {"type": "text", "content": chunk.content}
