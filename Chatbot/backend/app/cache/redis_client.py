"""
Redis semantic cache for LLM responses.

Stores and retrieves LLM responses by exact query match.
Degrades gracefully when Redis is unavailable.
"""

import hashlib
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Sentinel: None = uninitialized, False = unavailable, valid client = ready
_redis = None


def _get_redis():
    """Return Redis client singleton, or False if unavailable."""
    global _redis
    if _redis is not None:
        return _redis
    try:
        import redis.asyncio as aioredis
        from app.config import settings
        _redis = aioredis.from_url(
            settings.redis_url or "redis://localhost:6379/0",
            decode_responses=True,
            socket_connect_timeout=2,
            socket_timeout=2,
        )
        logger.info("Redis connected")
    except Exception as e:
        logger.warning("Redis unavailable (non-fatal): %s", e)
        _redis = False  # sentinel
    return _redis


async def semantic_cache_key(query: str) -> str:
    """Return a deterministic cache key for a query."""
    raw = query.strip().lower()
    return f"llm_cache:{hashlib.md5(raw.encode()).hexdigest()}"


async def get_cached(query: str, threshold: float = 0.92) -> Optional[str]:
    """Exact-match cache lookup. Returns cached response or None."""
    r = _get_redis()
    if not r:
        return None
    try:
        key = await semantic_cache_key(query)
        cached = await r.get(key)
        if cached is not None:
            logger.debug("Semantic cache HIT (exact) for query hash")
            return cached
        return None
    except Exception as e:
        logger.debug("Cache read error: %s", e)
        return None


async def set_cached(query: str, response: str, ttl: int = 3600):
    """Store a response in cache with the given TTL (seconds)."""
    r = _get_redis()
    if not r:
        return
    try:
        key = await semantic_cache_key(query)
        await r.setex(key, ttl, response)
    except Exception as e:
        logger.debug("Cache write error: %s", e)


async def close_redis():
    """Close Redis connection on application shutdown."""
    global _redis
    if _redis and _redis is not True and _redis is not False:
        try:
            await _redis.close()
        except Exception:
            pass
        _redis = None
