"""
LLM wrapper with retry logic and fallback support.

Primary LLM uses `settings.llm_*` (DeepSeek).
Fallback LLM uses `settings.fallback_*` (Zhipu AI).
"""

import logging

from langchain_openai import ChatOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from openai import APIError, APITimeoutError, RateLimitError

from app.config import settings

logger = logging.getLogger(__name__)


def create_llm(**kwargs):
    """Factory: create primary ChatOpenAI instance (DeepSeek)."""
    return ChatOpenAI(
        model=settings.llm_model,
        api_key=settings.llm_api_key,
        base_url=settings.llm_base_url,
        temperature=kwargs.get("temperature", 0.7),
        streaming=kwargs.get("streaming", True),
    )


def create_fallback_llm(**kwargs):
    """Factory: create fallback ChatOpenAI instance (Zhipu). Returns None if not configured."""
    if not settings.fallback_api_key:
        return None
    return ChatOpenAI(
        model=settings.fallback_model,
        api_key=settings.fallback_api_key,
        base_url=settings.fallback_base_url,
        temperature=kwargs.get("temperature", 0.7),
        streaming=kwargs.get("streaming", True),
    )


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((APIError, APITimeoutError, RateLimitError)),
    before_sleep=lambda retry_state: logger.warning(
        "LLM API call failed, retrying (%d/%d) after %.1fs ...",
        retry_state.attempt_number,
        retry_state.retry_object.stop.max_attempt_number,
        retry_state.next_action.sleep if retry_state.next_action else 0,
    ),
)
def llm_invoke_with_retry(llm, messages):
    """Invoke LLM with automatic retry on transient errors."""
    response = llm.invoke(messages)
    return response


def llm_invoke_with_fallback(messages, primary=None, fallback=None, **kwargs):
    """Invoke LLM with automatic fallback on failure.

    Tries primary (DeepSeek) first. On error, falls back to Zhipu.
    Creates LLMs automatically if not provided.
    """
    if primary is None:
        primary = create_llm(streaming=False, **kwargs)
    if fallback is None:
        fallback = create_fallback_llm(streaming=False)

    try:
        return llm_invoke_with_retry(primary, messages)
    except Exception as e:
        logger.warning("Primary LLM (%s) failed: %s", settings.llm_model, e)
        if fallback is not None:
            logger.info("Falling back to %s", settings.fallback_model)
            return llm_invoke_with_retry(fallback, messages)
        raise
