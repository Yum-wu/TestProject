"""RAG 系统统计 + 文档管理 API — Dashboard / Documents 数据源"""
from collections import defaultdict
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Query
from pydantic import BaseModel

from ..cache.redis_client import _get_redis

router = APIRouter()

class RecentQuery(BaseModel):
    query: str
    sources_count: int
    latency_ms: int
    timestamp: str

class StatsResponse(BaseModel):
    cache_hit_rate: float
    query_count_24h: int
    avg_retrieval_latency_ms: float
    total_indexed_docs: int
    total_chunks: int

def _get_collection_stats() -> tuple[int, int]:
    """Return (total_docs, total_chunks) from Chroma collection."""
    try:
        from ..rag.vector_store import _get_collection, _get_chroma
        client = _get_chroma()
        # Count unique source files from collection metadata
        collection = _get_collection()
        total_chunks = collection.count()
        # Get unique source documents
        if total_chunks > 0:
            all_meta = collection.get(include=["metadatas"])
            unique_docs = set()
            for meta in all_meta.get("metadatas", []):
                if meta and isinstance(meta, dict):
                    src = meta.get("source") or meta.get("title", "unknown")
                    unique_docs.add(src)
            return len(unique_docs), total_chunks
        return 0, 0
    except Exception:
        return 0, 0


STATS_PREFIX = "aureon:stats"


async def record_query(query: str, sources_count: int, latency_ms: int) -> None:
    """记录一次查询（由 RAG API 调用）"""
    redis = _get_redis()
    if not redis:
        return
    now = datetime.now(timezone.utc).isoformat()

    # 查询计数（24h 过期）
    await redis.incr(f"{STATS_PREFIX}:count_24h")
    await redis.expire(f"{STATS_PREFIX}:count_24h", 86400)

    # 最近查询列表（保留最近 50 条）
    entry = f"{now}|{query}|{sources_count}|{latency_ms}"
    await redis.lpush(f"{STATS_PREFIX}:recent", entry)
    await redis.ltrim(f"{STATS_PREFIX}:recent", 0, 49)

    # 延迟聚合
    await redis.lpush(f"{STATS_PREFIX}:latencies", latency_ms)
    await redis.ltrim(f"{STATS_PREFIX}:latencies", 0, 999)


@router.get("/api/rag/stats", response_model=StatsResponse)
async def get_stats():
    redis = _get_redis()
    count = 0
    avg_latency = 0.0
    hit_rate = 0.0

    if redis:
        count = int(await redis.get(f"{STATS_PREFIX}:count_24h") or 0)

        latencies = await redis.lrange(f"{STATS_PREFIX}:latencies", 0, -1)
        latencies = [int(l) for l in latencies]
        avg_latency = sum(latencies) / len(latencies) if latencies else 0.0

        cache_hits = int(await redis.get(f"{STATS_PREFIX}:cache_hits") or 0)
        cache_misses = int(await redis.get(f"{STATS_PREFIX}:cache_misses") or 1)
        total = cache_hits + cache_misses
        hit_rate = cache_hits / total if total > 0 else 0.0

    # Real collection stats from Chroma
    doc_count, chunk_count = _get_collection_stats()

    return StatsResponse(
        cache_hit_rate=round(hit_rate, 4),
        query_count_24h=count,
        avg_retrieval_latency_ms=round(avg_latency, 1),
        total_indexed_docs=doc_count,
        total_chunks=chunk_count,
    )


@router.get("/api/rag/queries/recent")
async def get_recent_queries(limit: int = Query(5, ge=1, le=50)):
    redis = _get_redis()
    queries = []

    if redis:
        entries = await redis.lrange(f"{STATS_PREFIX}:recent", 0, limit - 1)
        for entry in entries:
            parts = entry.split("|", 3)
            if len(parts) == 4:
                queries.append(RecentQuery(
                    query=parts[1],
                    sources_count=int(parts[2]),
                    latency_ms=int(parts[3]),
                    timestamp=parts[0],
                ))

    return {"queries": queries}


# ── Documents API ──


class DocumentItem(BaseModel):
    title: str
    source: str
    file_type: str
    chunk_count: int
    status: str


@router.get("/api/rag/documents")
async def get_documents():
    """List all indexed documents grouped by source from Chroma collection."""
    try:
        from ..rag.vector_store import _get_collection
        collection = _get_collection()
        total = collection.count()
        if total == 0:
            return {"documents": [], "total_docs": 0, "total_chunks": 0}

        all_data = collection.get(include=["metadatas"])
        # Group chunks by source file
        doc_map: dict[str, dict] = defaultdict(lambda: {
            "title": "", "source": "", "file_type": "md", "chunk_count": 0
        })
        for meta in all_data.get("metadatas", []):
            if not meta or not isinstance(meta, dict):
                continue
            src = meta.get("source") or meta.get("title", "unknown")
            doc = doc_map[src]
            doc["source"] = src
            doc["title"] = meta.get("title", src.replace(".md", "").replace("_", " "))
            doc["chunk_count"] += 1
            if src.endswith(".pdf"):
                doc["file_type"] = "pdf"
            elif src.endswith(".txt"):
                doc["file_type"] = "txt"

        documents = [
            DocumentItem(title=d["title"], source=d["source"], file_type=d["file_type"],
                         chunk_count=d["chunk_count"], status="ready")
            for d in sorted(doc_map.values(), key=lambda x: x["title"])
        ]
        return {"documents": [d.model_dump() for d in documents],
                "total_docs": len(documents), "total_chunks": total}
    except Exception:
        return {"documents": [], "total_docs": 0, "total_chunks": 0}
