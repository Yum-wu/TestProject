import asyncio
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from app.api.models import ChatRequest, SessionListResponse, StatusResponse
from app.agent.llm import create_llm
from app.agent.agent import create_chat_agent
from app.agent.executor import stream_agent
from app.tools import ALL_TOOLS
from app.memory.db import init_db
from app.memory.manager import manager as memory_manager
from app.config import settings

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
        stream_agent(agent, req.message, req.session_id, memory_context=memory_manager.get_context(req.session_id or "")),
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
    memory_manager.finalize_scenario(session_id)
    memory_manager.clear_session(session_id)
    return StatusResponse(status="deleted", session_id=session_id)


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "model": settings.llm_model,
        "tools": [t.name for t in ALL_TOOLS],
    }
