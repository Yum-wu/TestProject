"""
Tests for Agent core: LLM factory, Agent factory, executor.
Mock-based tests that don't require API keys.
"""
import pytest
from unittest.mock import patch, MagicMock, AsyncMock
import json

from app.agent.llm import create_llm
from app.agent.agent import create_chat_agent


class TestLLMFactoryMocked:
    def test_create_llm_defaults(self):
        with patch("app.agent.llm.ChatOpenAI") as mock:
            mock_instance = MagicMock()
            mock.return_value = mock_instance
            llm = create_llm()
            mock.assert_called_once()
            _, kwargs = mock.call_args
            assert kwargs["model"] == "GLM-4-Flash-250414"
            assert kwargs["streaming"] is True
            assert kwargs["temperature"] == 0.7

    def test_create_llm_custom_temp(self):
        with patch("app.agent.llm.ChatOpenAI") as mock:
            llm = create_llm(temperature=0.3)
            _, kwargs = mock.call_args
            assert kwargs["temperature"] == 0.3


class TestAgentFactoryMocked:
    def test_create_agent_returns_graph(self):
        mock_llm = MagicMock()
        with patch("app.agent.agent.ALL_TOOLS", []), \
             patch("app.agent.agent.create_agent") as mock_create:
            mock_graph = MagicMock()
            mock_create.return_value = mock_graph
            graph = create_chat_agent(mock_llm)
            mock_create.assert_called_once_with(
                model=mock_llm,
                tools=[],
                system_prompt=mock_create.call_args[1]["system_prompt"],
            )
            assert graph == mock_graph

    def test_default_system_prompt_contains_tool_rules(self):
        mock_llm = MagicMock()
        with patch("app.agent.agent.create_agent") as mock_create:
            mock_graph = MagicMock()
            mock_create.return_value = mock_graph
            graph = create_chat_agent(mock_llm)
            prompt = mock_create.call_args[1]["system_prompt"]
            assert "calculator" in prompt
            assert "web_search" in prompt
            assert "read_ref" in prompt
            assert "中文" in prompt


class TestStreamExecutorMocked:
    @pytest.mark.asyncio
    async def test_stream_agent_emits_session_event(self):
        from app.agent.executor import stream_agent

        mock_graph = MagicMock()
        mock_graph.astream_events = AsyncMock(return_value=[])

        events = []
        async for event_str in stream_agent(mock_graph, "hello", session_id=None):
            events.append(event_str)

        # Should emit at least session event and done event
        assert any("session" in e for e in events)
        assert any("done" in e for e in events)

    @pytest.mark.asyncio
    async def test_stream_agent_includes_session_id(self):
        from app.agent.executor import stream_agent

        mock_graph = MagicMock()
        mock_graph.astream_events = AsyncMock(return_value=[])

        session_id = None
        async for event_str in stream_agent(mock_graph, "hello", session_id=None):
            if "session" in event_str:
                import json
                prefix = "data: "
                if event_str.startswith(prefix):
                    event = json.loads(event_str[len(prefix):].strip())
                    session_id = event["content"]["session_id"]

        assert session_id is not None
        assert len(session_id) > 0

    @pytest.mark.asyncio
    async def test_stream_agent_emits_text_on_chat_model_stream(self):
        from app.agent.executor import stream_agent

        async def mock_astream_events(*args, **kwargs):
            yield {
                "event": "on_chat_model_stream",
                "data": {"chunk": MagicMock(content="Hello ")},
            }
            yield {
                "event": "on_chat_model_stream",
                "data": {"chunk": MagicMock(content="World")},
            }

        mock_graph = MagicMock()
        mock_graph.astream_events = mock_astream_events

        text_parts = []
        async for event_str in stream_agent(mock_graph, "hi", session_id="test_sid"):
            if '"text"' in event_str:
                import json
                prefix = "data: "
                if event_str.startswith(prefix):
                    event = json.loads(event_str[len(prefix):].strip())
                    text_parts.append(event["content"])

        assert "Hello " in text_parts
        assert "World" in text_parts

    @pytest.mark.asyncio
    async def test_stream_agent_emits_tool_start(self):
        from app.agent.executor import stream_agent

        async def mock_astream_events(*args, **kwargs):
            yield {
                "event": "on_tool_start",
                "name": "calculator",
                "data": {"input": {"expression": "1+1"}},
            }

        mock_graph = MagicMock()
        mock_graph.astream_events = mock_astream_events

        tool_events = []
        async for event_str in stream_agent(mock_graph, "calc", session_id="test_sid"):
            if '"tool_start"' in event_str:
                import json
                prefix = "data: "
                if event_str.startswith(prefix):
                    event = json.loads(event_str[len(prefix):].strip())
                    tool_events.append(event["content"])

        assert len(tool_events) == 1
        assert tool_events[0]["tool"] == "calculator"

    @pytest.mark.asyncio
    async def test_stream_agent_emits_done_on_success(self):
        from app.agent.executor import stream_agent

        mock_graph = MagicMock()
        mock_graph.astream_events = AsyncMock(return_value=[])

        events = []
        async for event_str in stream_agent(mock_graph, "hi", session_id="test_sid"):
            events.append(event_str)

        last_event = events[-1]
        assert "done" in last_event

    @pytest.mark.asyncio
    async def test_stream_agent_emits_error_on_exception(self):
        from app.agent.executor import stream_agent
        from langchain_core.messages import HumanMessage

        mock_graph = MagicMock()
        mock_graph.astream_events = AsyncMock(side_effect=Exception("Test error"))

        events = []
        async for event_str in stream_agent(mock_graph, "hi", session_id="test_sid"):
            events.append(event_str)

        error_events = [e for e in events if "error" in e]
        assert len(error_events) >= 1
