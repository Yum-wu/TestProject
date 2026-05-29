"""Basic API tests for Chatbot Agent backend."""

import pytest
from unittest.mock import patch, MagicMock
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_health():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert "model" in data
    assert "tools" in data


@pytest.mark.asyncio
async def test_crew_health():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/api/crew/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["service"] == "crew-generator"


@pytest.mark.asyncio
async def test_rag_query_basic():
    """RAG with a basic query should return answer + sources.

    NOTE: This test is disabled in CI as it requires Redis and LLM mocks
    that are complex to set up. Enable when testing locally.
    """
    pytest.skip("Requires Redis and LLM mocks - run locally")
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.post(
            "/api/rag/query",
            json={"query": "test", "top_k": 1},
        )
    assert resp.status_code == 200
    data = resp.json()
    assert "answer" in data
