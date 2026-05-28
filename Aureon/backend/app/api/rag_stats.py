"""RAG 系统统计 API — Dashboard 数据源"""
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

    return StatsResponse(
        cache_hit_rate=round(hit_rate, 4),
        query_count_24h=count,
        avg_retrieval_latency_ms=round(avg_latency, 1),
        total_indexed_docs=0,
        total_chunks=0,
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
