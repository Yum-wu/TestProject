"""
Redis semantic cache for LLM responses.

Stores and retrieves LLM responses by exact query match.
Degrades gracefully when Redis is unavailable.
Falls back to in-memory dict cache when Redis is down.
"""

import hashlib
import logging
import time
from typing import Optional

logger = logging.getLogger(__name__)

# Sentinel: None = uninitialized, False = unavailable, valid client = ready
_redis = None

# ── In-memory fallback cache (when Redis is unavailable) ──
_mem_cache: dict = {}
_MEM_TTL = 3600  # 1 hour, same as Redis TTL


def _mem_cache_key(key: str) -> str:
    return f"llm_cache:{hashlib.md5(key.strip().lower().encode()).hexdigest()}"


def _mem_get(query: str) -> Optional[str]:
    """In-memory cache lookup. Checks expiry."""
    full_key = _mem_cache_key(query)
    entry = _mem_cache.get(full_key)
    if entry is None:
        return None
    value, expires_at = entry
    if time.monotonic() > expires_at:
        del _mem_cache[full_key]
        return None
    return value


def _mem_set(query: str, response: str, ttl: int = _MEM_TTL):
    """Store in in-memory cache with expiry."""
    full_key = _mem_cache_key(query)
    _mem_cache[full_key] = (response, time.monotonic() + ttl)
    # Evict old entries if cache is too large (keep max 500)
    if len(_mem_cache) > 500:
        now = time.monotonic()
        expired = [k for k, (_, exp) in _mem_cache.items() if now > exp]
        for k in expired:
            del _mem_cache[k]
        # If still over limit, remove oldest
        if len(_mem_cache) > 500:
            oldest = sorted(_mem_cache.keys(), key=lambda k: _mem_cache[k][1])[:50]
            for k in oldest:
                del _mem_cache[k]


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
    """Exact-match cache lookup. Falls back to in-memory if Redis down."""
    # 1. Try in-memory first (fastest)
    mem_result = _mem_get(query)
    if mem_result is not None:
        logger.debug("In-memory cache HIT for query hash")
        return mem_result

    # 2. Try Redis
    r = _get_redis()
    if r:
        try:
            key = await semantic_cache_key(query)
            cached = await r.get(key)
            if cached is not None:
                # Also populate in-memory for faster next access
                _mem_set(query, cached)
                logger.debug("Redis cache HIT for query hash")
                return cached
        except Exception as e:
            logger.debug("Cache read error: %s", e)

    return None


async def set_cached(query: str, response: str, ttl: int = 3600):
    """Store a response in both in-memory and Redis."""
    # Always store in-memory
    _mem_set(query, response, ttl)

    # Try Redis
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
