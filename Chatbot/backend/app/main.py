import asyncio
import logging
import os
import sys
import time
import uuid
from typing import Any

from fastapi import FastAPI, Request, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from prometheus_fastapi_instrumentator import Instrumentator
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
import structlog

from app.api.models import ChatRequest, SessionListResponse, StatusResponse
from app.agent.llm import create_llm
from app.agent.agent import create_chat_agent
from app.agent.executor import stream_agent_with_memory
from app.tools import ALL_TOOLS
from app.memory.db import init_db
from app.memory.manager import manager as memory_manager
from app.config import settings
from app.rag.models import RAGQueryRequest, RAGQueryResponse, RAGIndexResponse, RAGUploadResponse
from app.rag.qa_chain import rag_query, rag_query_with_cache, rag_query_astream, run_index_pipeline, run_incremental_index
from app.rag.evaluator import run_full_evaluation
from app.rag.prompt_experiment import run_experiment, STRATEGIES
from app.rag.test_data import TEST_QA_PAIRS
from app.rag.vector_store import retrieve
from app.utils.lang_detect import detect_language
from app.cache.redis_client import close_redis

# ── CrewAI (merged, lazy-imported in route handlers) ──
from pydantic import BaseModel, Field

# ── Structured logging (replaces stdlib logging) ──
structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.StackInfoRenderer(),
        structlog.dev.ConsoleRenderer()
        if sys.stdout.isatty()
        else structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
    context_class=dict,
    logger_factory=structlog.PrintLoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# ── Rate limiter ──
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Chatbot Agent API", version="0.1.0")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CORS_ORIGINS", "*")],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Prometheus metrics ──
Instrumentator().instrument(app).expose(app, endpoint="/metrics")

_agents: dict[str, Any] = {}
_agent_lock = asyncio.Lock()


@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    """Inject request_id / session_id into structlog context per request."""
    request_id = str(uuid.uuid4())[:8]
    structlog.contextvars.clear_contextvars()
    structlog.contextvars.bind_contextvars(request_id=request_id)

    start = time.time()
    response = await call_next(request)
    elapsed = int((time.time() - start) * 1000)

    logger.info(
        "request_completed",
        method=request.method,
        path=request.url.path,
        status_code=response.status_code,
        elapsed_ms=elapsed,
    )
    return response


async def _get_agent(lang: str = "zh"):
    """Get or create a chat agent for the given language."""
    global _agents
    if lang not in _agents:
        async with _agent_lock:
            if lang not in _agents:
                llm = create_llm()
                _agents[lang] = create_chat_agent(llm, lang=lang)
    return _agents[lang]


@app.on_event("startup")
async def startup():
    if not settings.llm_api_key and not settings.fallback_api_key:
        logger.warning("LLM_API_KEY 未配置，Agent 调用将失败")
    if settings.langchain_api_key:
        os.environ.setdefault("LANGCHAIN_API_KEY", settings.langchain_api_key)
        os.environ.setdefault("LANGCHAIN_PROJECT", settings.langchain_project)
        os.environ.setdefault("LANGCHAIN_ENDPOINT", "https://api.smith.langchain.com")
    init_db()
    memory_manager.init_background_tasks()


@app.on_event("shutdown")
async def shutdown():
    memory_manager.flush_all_scenarios()
    await close_redis()


@app.post("/api/chat/stream")
@limiter.limit("5/second")
async def chat_stream(req: ChatRequest, request: Request):
    lang = detect_language(req.message)
    agent = await _get_agent(lang)
    return StreamingResponse(
        stream_agent_with_memory(
            agent,
            req.message,
            req.session_id or "",
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
@limiter.limit("2/second")
async def rag_query_endpoint(req: RAGQueryRequest, request: Request):
    """RAG query: retrieve context + generate answer (with Redis cache)."""
    from app.agent.llm import create_llm

    llm = create_llm()

    def _llm_call(messages):
        response = llm.invoke(messages)
        return response.content

    result = await rag_query_with_cache(
        req.query, _llm_call, top_k=req.top_k, use_mmr=req.use_mmr
    )
    return result


@app.post("/api/rag/query/stream")
@limiter.limit("2/second")
async def rag_query_stream_endpoint(req: RAGQueryRequest, request: Request):
    """Streaming RAG: buffered SSE + Redis cache layer."""
    from app.agent.llm import create_llm
    from app.cache.redis_client import get_cached, set_cached
    import json

    llm = create_llm()

    async def _buffer_events(generator, flush_interval=0.05, max_chars=200):
        """Buffer text events, flush at interval or max_chars.

        - First text event: flush immediately (zero TTFT impact)
        - Subsequent: buffer at 50ms / 200 chars for smooth streaming
        - Non-text events: flush pending text first, pass through
        """
        buf = ""
        last_flush = 0.0
        is_first = True
        async for event in generator:
            if event.get("type") == "text":
                buf += event["content"]
                now = time.monotonic()
                if not last_flush:
                    last_flush = now
                # Flush first event immediately to keep TTFT low
                if is_first:
                    is_first = False
                    yield {"type": "text", "content": buf}
                    buf = ""
                    last_flush = now
                elif (now - last_flush) >= flush_interval or len(buf) >= max_chars:
                    yield {"type": "text", "content": buf}
                    buf = ""
                    last_flush = now
            else:
                if buf:
                    yield {"type": "text", "content": buf}
                    buf = ""
                    last_flush = 0.0
                yield event
        if buf:
            yield {"type": "text", "content": buf}

    async def event_stream():
        # 1. Try Redis cache hit
        cached = await get_cached(req.query)
        if cached is not None:
            yield f"data: {json.dumps({'type': 'sources', 'sources': []}, ensure_ascii=False)}\n\n"
            yield f"data: {json.dumps({'type': 'text', 'content': cached}, ensure_ascii=False)}\n\n"
            yield "data: {\"type\": \"cache_hit\"}\n\n"
            return

        # 2. Stream with buffering, auto-cache full answer on completion
        full_text = ""
        try:
            raw_gen = rag_query_astream(
                req.query, llm, top_k=req.top_k, use_mmr=req.use_mmr
            )
            async for event in _buffer_events(raw_gen):
                if event.get("type") == "text":
                    full_text += event["content"]
                yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)}, ensure_ascii=False)}\n\n"
        finally:
            # 3. Cache full answer (fire-and-forget, non-blocking)
            if full_text:
                asyncio.create_task(set_cached(req.query, full_text))
            yield "data: {\"type\": \"done\"}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/api/rag/index", response_model=RAGIndexResponse)
@limiter.limit("1/second")
async def rag_index_endpoint(request: Request):
    """Re-index all articles into Chroma."""
    articles_dir = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "data", "articles"
    )
    result = run_index_pipeline(articles_dir)
    return result


@app.post("/api/rag/upload", response_model=RAGUploadResponse)
async def rag_upload_endpoint(file: UploadFile = File(...)):
    """Upload a .md or .txt file and incrementally index it."""
    import shutil

    # Validate extension
    allowed = {".md", ".txt"}
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"不支持的文件格式: {ext}，仅支持 {', '.join(allowed)}",
        )

    # Save to uploads directory
    upload_dir = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "data", "articles", "uploads"
    )
    os.makedirs(upload_dir, exist_ok=True)
    dest = os.path.join(upload_dir, file.filename)

    try:
        content = await file.read()
        with open(dest, "wb") as f:
            f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件保存失败: {str(e)}")

    # Incremental index
    result = run_incremental_index(dest)
    if result["status"] == "error":
        raise HTTPException(
            status_code=500, detail=result.get("message", "索引失败")
        )

    return result


@app.get("/api/rag/uploads")
async def rag_list_uploads():
    """List all uploaded files in the uploads directory."""
    upload_dir = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "data", "articles", "uploads"
    )
    if not os.path.isdir(upload_dir):
        return {"files": []}
    files = sorted(
        (
            {
                "filename": f,
                "size": os.path.getsize(os.path.join(upload_dir, f)),
            }
            for f in os.listdir(upload_dir)
            if os.path.isfile(os.path.join(upload_dir, f))
        ),
        key=lambda x: x["filename"],
    )
    return {"files": files}


@app.delete("/api/rag/upload/{filename}", response_model=StatusResponse)
async def rag_delete_upload(filename: str):
    """Delete an uploaded file and its chunks from the index."""
    # Security: prevent path traversal
    if ".." in filename or "/" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")

    upload_dir = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "data", "articles", "uploads"
    )
    filepath = os.path.join(upload_dir, filename)

    # 1. Remove from Chroma index
    from app.rag.vector_store import delete_from_index

    delete_from_index(filename)

    # 2. Delete physical file
    if os.path.isfile(filepath):
        os.remove(filepath)
        logger.info("Deleted uploaded file", path=filepath)
    else:
        logger.warning("File not found on disk (already deleted)", path=filepath)

    return StatusResponse(status="deleted", session_id=filename)


@app.post("/api/rag/evaluate")
async def rag_evaluate_endpoint():
    """Run full RAG evaluation: Recall@k, Faithfulness, Latency."""
    from app.agent.llm import create_llm

    llm = create_llm(streaming=False)

    def _retrieve(q: str, top_k: int = 3):
        return retrieve(q, top_k=top_k)

    def _rag_query(q: str):
        from app.rag.qa_chain import rag_query as rq

        def llm_call(messages):
            return llm.invoke(messages).content

        return rq(q, llm_call)

    result = run_full_evaluation(_retrieve, _rag_query, llm)
    return result


@app.post("/api/rag/experiment")
async def rag_experiment_endpoint():
    """Run prompt strategy experiment on test dataset."""
    from app.agent.llm import create_llm

    llm = create_llm(streaming=False)

    def _rag_query(q: str):
        from app.rag.qa_chain import rag_query as rq

        def llm_call(messages):
            return llm.invoke(messages).content

        return rq(q, llm_call)

    result = run_experiment(TEST_QA_PAIRS, _rag_query, llm)
    return result


@app.get("/api/rag/health")
async def rag_health():
    """RAG system health + live service status."""
    from app.rag.vector_store import get_bm25_stats
    bm25 = get_bm25_stats()
    return {
        "status": "ok",
        "llm_configured": bool(settings.llm_api_key),
        "model": settings.llm_model,
        "fallback_configured": bool(settings.fallback_api_key),
        "index_status": "ok" if os.path.isdir(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "vectors"))) else "not_initialized",
        "test_qa_pairs": len(TEST_QA_PAIRS),
        "streaming_retrieval": "BM25 keyword (in-memory)",
        "bm25_docs": bm25["docs"],
        "bm25_terms": bm25["terms"],
        "sync_retrieval": "Chroma dense (Zhipu embedding-2)",
        "guardrails_enabled": True,
        "langsmith_enabled": bool(settings.langchain_api_key or os.getenv("LANGCHAIN_API_KEY")),
    }


@app.get("/api/rag/benchmark")
async def rag_benchmark():
    """Latest RAG evaluation benchmark results."""
    import json

    benchmark_path = os.path.join(os.path.dirname(__file__), "..", "data", "benchmark_results.json")
    if not os.path.isfile(benchmark_path):
        return {"metrics": [], "services": {}, "timestamp": None}
    with open(benchmark_path, encoding="utf-8") as f:
        return json.load(f)


@app.post("/api/langgraph/run")
async def langgraph_run(req: dict):
    """Run LangGraph workflow for complex tasks."""
    from app.langgraph.graph import run_workflow

    query = req.get("query", "")
    session_id = req.get("session_id", "")
    if not query:
        return {"error": "query required"}
    result = await run_workflow(query, session_id=session_id)
    return result


# ── CrewAI Routes ──


class CrewGenerateRequest(BaseModel):
    topic: str = Field(..., min_length=2, max_length=500)


@app.post("/api/crew/generate")
async def crew_generate(req: CrewGenerateRequest):
    """Generate article via 3-agent crew (synchronous)."""
    import time
    from app.crew.crew_setup import generate_article

    try:
        # litellm (used by crewai 0.80+) needs standard OpenAI env vars
        os.environ.setdefault("OPENAI_API_KEY", settings.llm_api_key)
        os.environ.setdefault("OPENAI_BASE_URL", settings.llm_base_url)
        os.environ.setdefault("OPENAI_MODEL_NAME", f"openai/{settings.llm_model}")

        from app.utils.lang_detect import detect_language

        lang = detect_language(req.topic)

        start = time.time()
        result = generate_article(topic=req.topic, lang=lang)
        duration_ms = int((time.time() - start) * 1000)
        return {
            "topic": result["topic"],
            "final_output": result["final_output"],
            "duration_ms": duration_ms,
            "agents": result["agents"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


@app.post("/api/crew/generate/stream")
async def crew_generate_stream(req: CrewGenerateRequest, request: Request):
    """Generate article with real-time agent progress via SSE."""
    from app.crew.crew_setup import generate_article
    from app.crew.main_events import EventCollector

    # litellm (used by crewai 0.80+) needs standard OpenAI env vars
    os.environ.setdefault("OPENAI_API_KEY", settings.llm_api_key)
    os.environ.setdefault("OPENAI_BASE_URL", settings.llm_base_url)
    os.environ.setdefault("OPENAI_MODEL_NAME", f"openai/{settings.llm_model}")

    from app.utils.lang_detect import detect_language

    lang = detect_language(req.topic)

    collector = EventCollector()

    async def run_crew():
        try:
            result = await asyncio.to_thread(
                generate_article, req.topic, collector.emit, lang
            )
            collector.emit("result", {
                "final_output": result["final_output"],
                "duration_ms": result["duration_ms"],
            })
        except Exception as e:
            collector.emit("error", {"message": str(e)})
        finally:
            collector.close()

    task = asyncio.create_task(run_crew())

    async def event_stream():
        try:
            async for chunk in collector.stream():
                if await request.is_disconnected():
                    break
                yield chunk
        finally:
            if not task.done():
                task.cancel()

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.get("/api/crew/health")
async def crew_health():
    return {
        "status": "ok",
        "service": "crew-generator",
        "llm_configured": bool(settings.llm_api_key),
    }


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "model": settings.llm_model,
        "tools": [t.name for t in ALL_TOOLS],
    }


# ── SPA 静态文件（必须在 API 路由之后） ──
static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
if os.path.isdir(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
else:
    logger.warning("Static directory not found", path=os.path.abspath(static_dir))
