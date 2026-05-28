"""
Tests for LangGraph workflow: intent classification, node routing, MCP registry.
Mock-based tests that don't require API keys.
"""
import pytest
from unittest.mock import patch, MagicMock


class TestMCPRegistry:
    def test_register_tool_decorator(self):
        from app.langgraph.mcp import register_tool, MCP_TOOLS, list_tools

        # Clean slate
        MCP_TOOLS.clear()

        @register_tool("test_tool", "A test tool")
        def my_tool(args: str) -> str:
            return f"processed: {args}"

        assert "test_tool" in MCP_TOOLS
        assert MCP_TOOLS["test_tool"]["description"] == "A test tool"
        assert list_tools() == [{"name": "test_tool", "description": "A test tool"}]

    def test_call_tool(self):
        from app.langgraph.mcp import register_tool, MCP_TOOLS, call_tool

        MCP_TOOLS.clear()

        @register_tool("echo")
        def echo_tool(text: str) -> str:
            return f"echo: {text}"

        result = call_tool("echo", {"text": "hello"})
        assert result == {"result": "echo: hello"}

    def test_call_unknown_tool_returns_error(self):
        from app.langgraph.mcp import call_tool, MCP_TOOLS

        MCP_TOOLS.clear()
        result = call_tool("nonexistent", {})
        assert "not found" in result.get("error", "")


class TestMCPRegistryClass:
    def test_registry_oop(self):
        from app.langgraph.mcp import MCPRegistry

        registry = MCPRegistry()

        def greet(name: str) -> str:
            return f"Hello, {name}!"
        registry.register("greet", "Say hello", greet)

        assert registry.get("greet") is not None
        assert any(t["name"] == "greet" for t in registry.list())
        result = registry.call("greet", {"name": "World"})
        assert result == {"result": "Hello, World!"}


class TestIntentNode:
    def test_intent_classify_with_mock(self):
        from app.langgraph.nodes.intent import run_intent_node

        mock_llm = MagicMock(return_value='{"intent": "rag", "confidence": 0.95}')
        intent, confidence = run_intent_node("Hermes Agent 有几层记忆？", mock_llm)
        assert intent == "rag"
        assert confidence == 0.95

    def test_intent_classify_agent(self):
        from app.langgraph.nodes.intent import run_intent_node

        mock_llm = MagicMock(return_value='{"intent": "agent", "confidence": 0.88}')
        intent, confidence = run_intent_node("25 * 37 等于多少？", mock_llm)
        assert intent == "agent"


class TestRAGNode:
    def test_rag_node_returns_chunks(self):
        from app.langgraph.nodes.rag import run_rag_node
        from unittest.mock import MagicMock

        mock_llm = MagicMock(return_value="Answer from LLM")
        with patch("app.rag.qa_chain.rag_query") as mock_rag_query:
            mock_response = MagicMock()
            mock_response.answer = "Hermes Agent 采用四层记忆架构。"
            mock_response.sources = [MagicMock(title="Doc1", slug="doc-1", score=0.9)]
            mock_rag_query.return_value = mock_response

            answer, sources = run_rag_node("What is Hermes?", mock_llm, top_k=3)
            assert answer == "Hermes Agent 采用四层记忆架构。"
            assert len(sources) == 1
            assert sources[0]["title"] == "Doc1"

    def test_rag_node_empty_result(self):
        from app.langgraph.nodes.rag import run_rag_node
        from unittest.mock import MagicMock

        mock_llm = MagicMock(return_value="Fallback answer")
        with patch("app.rag.qa_chain.rag_query") as mock_rag_query:
            mock_response = MagicMock()
            mock_response.answer = "知识库中暂无相关内容，请尝试其他问题。"
            mock_response.sources = []
            mock_rag_query.return_value = mock_response

            answer, sources = run_rag_node("unknown", mock_llm, top_k=3)
            assert answer == "知识库中暂无相关内容，请尝试其他问题。"
            assert sources == []
