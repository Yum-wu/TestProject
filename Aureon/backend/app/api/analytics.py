"""Analytics API endpoints for usage, latency, and token tracking."""

from fastapi import APIRouter, Query
from datetime import datetime, timedelta
from typing import Optional
import structlog

logger = structlog.get_logger()
router = APIRouter(prefix="/api/rag/analytics", tags=["analytics"])

STATS_PREFIX = "aureon:stats"


@router.get("/usage")
async def get_usage_analytics(
    time_range: Optional[str] = Query("24h", description="Time range: 24h, 7d, 30d")
):
    """
    Get query usage analytics.

    Returns:
        - Total query count
        - Query distribution by intent
        - Queries per hour
    """
    from app.cache.redis_client import _get_redis

    redis = _get_redis()
    if not redis:
        return {
            "timeRange": time_range,
            "total": 0,
            "perHour": 0,
            "byIntent": {},
            "trend": {"change": 0, "period": "vs previous period"},
        }

    # 总查询数
    total = int(await redis.get(f"{STATS_PREFIX}:count_24h") or 0)

    # 按意图分类
    intents_raw = await redis.hgetall(f"{STATS_PREFIX}:intents")
    by_intent = {k: int(v) for k, v in intents_raw.items()} if intents_raw else {}

    # 计算每小时平均查询量
    now = datetime.utcnow()
    per_hour = round(total / 24, 1) if total > 0 else 0

    return {
        "timeRange": time_range,
        "total": total,
        "perHour": per_hour,
        "byIntent": by_intent,
        "trend": {
            "change": 0,  # TODO: 对比前一天
            "period": "vs previous period",
        },
    }


@router.get("/latency")
async def get_latency_analytics(
    time_range: Optional[str] = Query("24h", description="Time range: 24h, 7d, 30d")
):
    """
    Get latency analytics.

    Returns:
        - Average, P95, P99 latency
        - Retrieval vs LLM breakdown
        - Latency trend over time
    """
    from app.cache.redis_client import _get_redis
    from statistics import mean, quantiles

    redis = _get_redis()
    if not redis:
        return {
            "timeRange": time_range,
            "avg": 0,
            "p95": 0,
            "p99": 0,
            "breakdown": {"retrieval": 0, "llm_first_token": 0, "llm_generation": 0},
            "trend": {"avg_change": 0, "period": "vs previous period"},
        }

    # 从 sorted set 获取延迟数据
    now = datetime.utcnow()
    cutoff = now.timestamp() - 86400  # 24h

    latencies = await redis.zrangebyscore(f"{STATS_PREFIX}:latencies:z", cutoff, "+inf")
    latencies = [float(l) for l in latencies] if latencies else []

    if not latencies:
        return {
            "timeRange": time_range,
            "avg": 0,
            "p95": 0,
            "p99": 0,
            "breakdown": {"retrieval": 0, "llm_first_token": 0, "llm_generation": 0},
            "trend": {"avg_change": 0, "period": "vs previous period"},
        }

    avg_lat = round(mean(latencies), 1)
    p95 = round(quantiles(latencies, n=100)[94], 1) if len(latencies) >= 100 else round(max(latencies), 1)
    p99 = round(quantiles(latencies, n=100)[98], 1) if len(latencies) >= 100 else round(max(latencies), 1)

    return {
        "timeRange": time_range,
        "avg": avg_lat,
        "p95": p95,
        "p99": p99,
        "breakdown": {
            "retrieval": 10,  # TODO: 从实际 tracing 获取
            "llm_first_token": 300,
            "llm_generation": 700,
        },
        "trend": {
            "avg_change": -8.2,  # TODO: 对比前一时间段
            "period": "vs previous period",
        },
    }


@router.get("/tokens")
async def get_token_analytics(
    time_range: Optional[str] = Query("24h", description="Time range: 24h, 7d, 30d")
):
    """
    Get token usage analytics.

    Returns:
        - Input/output token counts
        - Estimated cost
        - Cost per query
    """
    from app.cache.redis_client import _get_redis

    redis = _get_redis()
    if not redis:
        return {
            "timeRange": time_range,
            "input": 0,
            "output": 0,
            "total": 0,
            "cost": 0,
            "costPerQuery": 0,
            "model": "gpt-4o-mini",
            "trend": {"input_change": 0, "output_change": 0, "period": "vs previous period"},
        }

    # 获取今天的 token 使用
    date_key = datetime.utcnow().strftime("%Y-%m-%d")
    token_data = await redis.hgetall(f"{STATS_PREFIX}:tokens:{date_key}")

    input_tokens = int(token_data.get("input", 0)) if token_data else 0
    output_tokens = int(token_data.get("output", 0)) if token_data else 0
    queries = int(token_data.get("queries", 0)) if token_data else 0

    # GPT-4o-mini 定价：$0.15/1M input, $0.60/1M output
    cost_per_1k_input = 0.00015
    cost_per_1k_output = 0.0006
    cost = round(
        (input_tokens / 1000 * cost_per_1k_input) + (output_tokens / 1000 * cost_per_1k_output),
        2
    )
    cost_per_query = round(cost / queries, 4) if queries > 0 else 0

    return {
        "timeRange": time_range,
        "input": input_tokens,
        "output": output_tokens,
        "total": input_tokens + output_tokens,
        "cost": cost,
        "costPerQuery": cost_per_query,
        "model": "gpt-4o-mini",
        "trend": {
            "input_change": 0,  # TODO: 对比前一时间段
            "output_change": 0,
            "period": "vs previous period",
        },
    }


@router.get("/cache")
async def get_cache_analytics():
    """
    Get cache performance analytics.

    Returns:
        - Hit rate
        - Queries saved
        - Latency reduction
    """
    from app.cache.redis_client import _get_redis

    redis = _get_redis()
    if not redis:
        return {
            "hitRate": 0,
            "saves": 0,
            "latencyReduction": 0,
            "memoryUsage": "0MB",
        }

    cache_hits = int(await redis.get(f"{STATS_PREFIX}:cache_hits") or 0)
    cache_misses = int(await redis.get(f"{STATS_PREFIX}:cache_misses") or 0)
    total = cache_hits + cache_misses
    hit_rate = round((cache_hits / total * 100), 1) if total > 0 else 0

    return {
        "hitRate": hit_rate,
        "saves": cache_hits,
        "latencyReduction": 45 if cache_hits > 0 else 0,  # TODO: 实际计算
        "memoryUsage": "128MB",  # TODO: 从 Redis INFO 获取
    }
