"""
Tests for API endpoints using mocked dependencies.
Covers: health, sessions, RAG, LangGraph.
"""
import pytest
from unittest.mock import patch, MagicMock
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_health():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "ok"
        assert "model" in data
        assert "tools" in data


@pytest.mark.asyncio
async def test_list_sessions():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/sessions")
        assert resp.status_code == 200
        data = resp.json()
        assert "sessions" in data
        assert "count" in data


@pytest.mark.asyncio
async def test_delete_session():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.delete("/api/sessions/test_session")
        assert resp.status_code == 200


class TestRAGEndpoints:
    """RAG endpoint tests with mocked internals."""

    @pytest.mark.asyncio
    async def test_rag_query_no_results(self):
        """When no results found, return fallback answer."""
        with patch("app.main.rag_query") as mock_rag:
            mock_rag.return_value = MagicMock(
                answer="知识库中暂无相关内容，请尝试其他问题。",
                sources=[],
            )
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                resp = await client.post(
                    "/api/rag/query",
                    json={"query": "unknown topic", "top_k": 3},
                )
                assert resp.status_code == 200
                data = resp.json()
                assert "暂无相关内容" in data["answer"]

    @pytest.mark.asyncio
    async def test_rag_query_with_sources(self):
        """RAG returns answer with source items."""
        mock_response = MagicMock()
        mock_response.answer = "Hermes Agent 有四层记忆。"
        mock_response.sources = [
            MagicMock(title="Hermes Agent 实战", slug="hermes-agent", chunk="内容摘要", score=0.92),
        ]

        with patch("app.main.rag_query", return_value=mock_response):
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                resp = await client.post(
                    "/api/rag/query",
                    json={"query": "Hermes Agent 记忆", "top_k": 3, "use_mmr": True},
                )
                assert resp.status_code == 200
                data = resp.json()
                assert "四层记忆" in data["answer"]
                assert len(data["sources"]) == 1

    @pytest.mark.asyncio
    async def test_rag_index(self):
        """RAG index returns status with counts."""
        with patch("app.main.run_index_pipeline") as mock_index:
            mock_index.return_value = {
                "status": "ok",
                "documents_indexed": 2,
                "chunks_created": 5,
                "elapsed_seconds": 1.2,
            }
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                resp = await client.post("/api/rag/index")
                assert resp.status_code == 200
                data = resp.json()
                assert data["status"] == "ok"
                assert data["documents_indexed"] == 2


class TestLangGraphEndpoint:
    """LangGraph workflow endpoint tests."""

    @pytest.mark.asyncio
    async def test_langgraph_run_empty_query(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post(
                "/api/langgraph/run",
                json={"query": ""},
            )
            assert resp.status_code == 200
            data = resp.json()
            assert "error" in data
            assert "query required" in data["error"]

    @pytest.mark.asyncio
    async def test_langgraph_run_rag_route(self):
        mock_result = {
            "answer": "Hermes Agent 采用四层记忆架构...",
            "route": "rag",
            "nodes_executed": ["intent", "rag", "generate"],
            "node_times_ms": {"intent": 100, "rag": 200, "generate": 150, "total": 450},
            "error": None,
        }
        with patch("app.langgraph.graph.run_workflow", return_value=mock_result):
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                resp = await client.post(
                    "/api/langgraph/run",
                    json={"query": "Hermes Agent 记忆", "session_id": "test"},
                )
                assert resp.status_code == 200
                data = resp.json()
                assert data["route"] == "rag"
                assert "nodes_executed" in data
