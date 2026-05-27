"""Tests for streaming LangGraph workflow."""
import pytest
from unittest.mock import MagicMock, patch

from app.langgraph.streaming import stream_workflow


def make_mock_llm(text_tokens: list[str]):
    """Create a mock LLM that yields text tokens."""
    mock_llm = MagicMock()

    async def _astream_impl(messages):
        for token in text_tokens:
            chunk = MagicMock()
            chunk.content = token
            yield chunk

    mock_llm.astream = MagicMock(side_effect=_astream_impl)
    return mock_llm


def make_mock_chunks(titles: list[str]):
    """Create mock retrieve_keyword return value."""
    return [
        {
            "metadata": {"title": title, "slug": f"slug-{i}"},
            "score": 0.9 - i * 0.1,
        }
        for i, title in enumerate(titles)
    ]


# ── Mock patch targets (module-level imports in streaming.py) ──
_DETECT_LANG = "app.langgraph.streaming.detect_language"
_CLASSIFY_INTENT = "app.langgraph.streaming.classify_intent"
_RETRIEVE_KEYWORD = "app.langgraph.streaming.retrieve_keyword"
_FORMAT_CONTEXT = "app.langgraph.streaming.format_context"


@pytest.mark.asyncio
async def test_chat_intent_no_rag():
    """Chat intent should skip RAG and stream directly."""
    mock_llm = make_mock_llm(["你好！", "有什么", "可以帮你的？"])

    with (
        patch(_DETECT_LANG, return_value="zh"),
        patch(_CLASSIFY_INTENT, return_value=("chat", 0.95)),
    ):
        events = []
        async for event in stream_workflow("你好", mock_llm):
            events.append(event)

    types = [e["type"] for e in events]
    assert "intent" in types
    assert "route" in types
    assert "text" in types
    assert "done" in types
    assert "sources" not in types

    intent = next(e for e in events if e["type"] == "intent")
    assert intent["content"]["intent"] == "chat"

    route = next(e for e in events if e["type"] == "route")
    assert route["content"] == "chat"


@pytest.mark.asyncio
async def test_rag_intent_with_sources():
    """RAG intent should retrieve and include sources."""
    mock_llm = make_mock_llm(["RAG 是", "检索增强", "生成。"])
    mock_chunks = make_mock_chunks(["RAG 入门", "向量检索"])

    with (
        patch(_DETECT_LANG, return_value="zh"),
        patch(_CLASSIFY_INTENT, return_value=("rag", 0.88)),
        patch(_RETRIEVE_KEYWORD, return_value=mock_chunks),
        patch(_FORMAT_CONTEXT, return_value="[Source 1: RAG 入门]\n..."),
    ):
        events = []
        async for event in stream_workflow("什么是 RAG", mock_llm):
            events.append(event)

    types = [e["type"] for e in events]
    assert "intent" in types
    assert "route" in types
    assert "sources" in types
    assert "text" in types
    assert "done" in types

    intent = next(e for e in events if e["type"] == "intent")
    assert intent["content"]["intent"] == "rag"

    route = next(e for e in events if e["type"] == "route")
    assert route["content"] == "rag"

    sources_event = next(e for e in events if e["type"] == "sources")
    assert len(sources_event["sources"]) == 2
    assert sources_event["sources"][0]["title"] == "RAG 入门"
    assert sources_event["sources"][1]["title"] == "向量检索"
    assert sources_event["sources"][0]["score"] == pytest.approx(0.9)


@pytest.mark.asyncio
async def test_rag_empty_results():
    """RAG with no matching chunks should yield friendly message."""
    mock_llm = make_mock_llm([])

    with (
        patch(_DETECT_LANG, return_value="zh"),
        patch(_CLASSIFY_INTENT, return_value=("rag", 0.70)),
        patch(_RETRIEVE_KEYWORD, return_value=[]),
    ):
        events = []
        async for event in stream_workflow("量子纠缠的数学证明", mock_llm):
            events.append(event)

    sources_event = next(e for e in events if e["type"] == "sources")
    assert sources_event["sources"] == []

    text_events = [e for e in events if e["type"] == "text"]
    assert len(text_events) == 1
    assert "暂无" in text_events[0]["content"] or "No relevant" in text_events[0]["content"]

    # llm should NOT be called when chunks are empty
    assert mock_llm.astream.call_count == 0
