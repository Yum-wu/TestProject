from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application configuration loaded from .env file."""

    # Primary LLM (DeepSeek)
    llm_api_key: str = ""
    llm_model: str = "deepseek-v4-flash"
    llm_base_url: str = "https://api.deepseek.com"

    # Fallback LLM (Zhipu AI, used when primary fails)
    fallback_api_key: str = ""
    fallback_model: str = "GLM-4-Flash-250414"
    fallback_base_url: str = "https://open.bigmodel.cn/api/paas/v4/"

    # Embedding API (Zhipu AI — DeepSeek does not provide embeddings)
    embedding_api_key: str = ""
    embedding_base_url: str = "https://open.bigmodel.cn/api/paas/v4/"

    tavily_api_key: str = ""

    redis_url: str = ""

    offload_max_chars: int = 1000
    session_max_messages: int = 500

    langchain_api_key: str = ""
    langchain_project: str = "chatbot-rag"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
