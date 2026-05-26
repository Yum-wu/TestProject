"""
LLM wrapper with retry logic.
"""

import logging

from langchain_openai import ChatOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from openai import APIError, APITimeoutError, RateLimitError

from app.config import settings

logger = logging.getLogger(__name__)


def create_llm(**kwargs):
    """Factory: create ChatOpenAI instance from .env config."""
    return ChatOpenAI(
        model=settings.llm_model,
        api_key=settings.llm_api_key,
        base_url=settings.llm_base_url,
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
    """Invoke LLM with automatic retry on transient errors.

    Retries up to 3 times with exponential backoff (2s-10s window)
    on APIError, APITimeoutError, and RateLimitError.
    """
    response = llm.invoke(messages)
    return response
