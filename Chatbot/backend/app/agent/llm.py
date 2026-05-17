from langchain_openai import ChatOpenAI
from app.config import settings


def create_llm(**kwargs):
    """Factory: create ChatOpenAI instance from .env config."""
    return ChatOpenAI(
        model=settings.llm_model,
        api_key=settings.llm_api_key,
        base_url=settings.llm_base_url,
        temperature=kwargs.get("temperature", 0.7),
        streaming=kwargs.get("streaming", True),
    )
