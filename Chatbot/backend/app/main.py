import asyncio
import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from app.api.models import ChatRequest, SessionListResponse, StatusResponse
from app.agent.llm import create_llm
from app.agent.agent import create_chat_agent
from app.agent.executor import stream_agent_with_memory
from app.tools import ALL_TOOLS
from app.memory.db import init_db
from app.memory.manager import manager as memory_manager
from app.config import settings
from app.rag.models import RAGQueryRequest, RAGQueryResponse, RAGIndexResponse
from app.rag.qa_chain import rag_query, run_index_pipeline

logger = logging.getLogger(__name__)

app = FastAPI(title="Chatbot Agent API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_agent = None
_agent_lock = asyncio.Lock()


async def _get_agent():
    global _agent
    if _agent is None:
        async with _agent_lock:
            if _agent is None:
                llm = create_llm()
                _agent = create_chat_agent(llm)
    return _agent


@app.on_event("startup")
async def startup():
    if not settings.llm_api_key:
        logger.warning("LLM_API_KEY 未配置，Agent 调用将失败")
    init_db()
    memory_manager.init_background_tasks()


@app.on_event("shutdown")
async def shutdown():
    memory_manager.flush_all_scenarios()


@app.post("/api/chat/stream")
async def chat_stream(req: ChatRequest):
    agent = await _get_agent()
    return StreamingResponse(
        stream_agent_with_memory(
            agent, req.message, req.session_id or "",
            memory_manager=memory_manager,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.get("/api/sessions", response_model=SessionListResponse)
async def list_sessions():
    sessions = memory_manager.get_active_sessions()
    return SessionListResponse(sessions=sessions, count=len(sessions))


@app.delete("/api/sessions/{session_id}", response_model=StatusResponse)
async def delete_session(session_id: str):
    memory_manager.finalize_scenario(session_id, summary="用户手动清除会话")
    memory_manager.clear_session(session_id)
    return StatusResponse(status="deleted", session_id=session_id)


@app.post("/api/rag/query", response_model=RAGQueryResponse)
async def rag_query_endpoint(req: RAGQueryRequest):
    """RAG query: retrieve context + generate answer."""
    from app.agent.llm import create_llm
    llm = create_llm()

    def _llm_call(messages):
        response = llm.invoke(messages)
        return response.content

    result = rag_query(req.query, _llm_call, top_k=req.top_k, use_mmr=req.use_mmr)
    return result


@app.post("/api/rag/index", response_model=RAGIndexResponse)
async def rag_index_endpoint():
    """Re-index all articles into Chroma."""
    articles_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "articles")
    result = run_index_pipeline(articles_dir)
    return result


@app.post("/api/langgraph/run")
async def langgraph_run(req: dict):
    """Run LangGraph workflow for complex tasks."""
    from app.langgraph.graph import run_workflow
    query = req.get("query", "")
    session_id = req.get("session_id", "")
    if not query:
        return {"error": "query required"}
    result = run_workflow(query, session_id=session_id)
    return result


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "model": settings.llm_model,
        "tools": [t.name for t in ALL_TOOLS],
    }
