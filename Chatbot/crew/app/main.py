"""Multi-Agent Article Generator — FastAPI App with SSE"""

import asyncio
import json
import os
import time
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.crew_setup import generate_article

load_dotenv()

# Map project env vars to OpenAI-compatible ones (CrewAI needs OPENAI_API_KEY)
if os.getenv("LLM_API_KEY") and not os.getenv("OPENAI_API_KEY"):
    os.environ["OPENAI_API_KEY"] = os.getenv("LLM_API_KEY", "")
if os.getenv("LLM_BASE_URL") and not os.getenv("OPENAI_BASE_URL"):
    os.environ["OPENAI_BASE_URL"] = os.getenv("LLM_BASE_URL", "")
if os.getenv("LLM_MODEL") and not os.getenv("OPENAI_MODEL_NAME"):
    os.environ["OPENAI_MODEL_NAME"] = os.getenv("LLM_MODEL", "GLM-4-Flash-250414")

# ── Event collector for SSE ──


class EventCollector:
    """Collects crew events and makes them available via async generator."""

    def __init__(self):
        self.events: asyncio.Queue[dict | None] = asyncio.Queue()

    def emit(self, event_type: str, data: dict):
        self.events.put_nowait({"type": event_type, **data})

    def close(self):
        self.events.put_nowait(None)

    async def stream(self) -> AsyncGenerator[str, None]:
        while True:
            event = await self.events.get()
            if event is None:
                break
            yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
        yield "data: {\"type\": \"done\"}\n\n"


# ── Models ──


class GenerateRequest(BaseModel):
    topic: str = Field(..., min_length=2, max_length=500, description="Article topic")
    # CrewAI 0.11.x runs synchronously; streaming is managed via step_callback


class AgentResult(BaseModel):
    agent: str
    duration_ms: int


class GenerateResponse(BaseModel):
    topic: str
    final_output: str
    duration_ms: int
    agents: list[AgentResult]


# ── App ──


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: verify LLM config
    missing = []
    if not os.getenv("LLM_API_KEY"):
        missing.append("LLM_API_KEY")
    if missing:
        print(f"[crew] WARNING: Missing env vars: {', '.join(missing)}")
    yield


app = FastAPI(
    title="CrewAI Multi-Agent Article Generator",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Sync endpoint ──


@app.post("/api/crew/generate", response_model=GenerateResponse)
async def generate_sync(req: GenerateRequest):
    """Generate article via 3-agent crew. Returns full result on completion."""
    try:
        start = time.time()
        result = generate_article(topic=req.topic)
        duration_ms = int((time.time() - start) * 1000)
        return GenerateResponse(
            topic=result["topic"],
            final_output=result["final_output"],
            duration_ms=duration_ms,
            agents=[AgentResult(agent=a, duration_ms=0) for a in result["agents"]],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


# ── SSE streaming endpoint ──


@app.post("/api/crew/generate/stream")
async def generate_stream(req: GenerateRequest, request: Request):
    """Generate article with real-time agent progress via SSE."""
    collector = EventCollector()

    async def run_crew():
        try:
            result = await asyncio.to_thread(
                generate_article, req.topic, collector.emit
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

    return StreamingResponse(
        content=collector.stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ── Health ──


@app.get("/api/crew/health")
async def health():
    return {
        "status": "ok",
        "service": "crew-generator",
        "llm_configured": bool(os.getenv("LLM_API_KEY")),
    }


# ── Needed for StreamingResponse ──

from fastapi.responses import StreamingResponse
