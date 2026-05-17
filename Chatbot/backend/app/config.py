from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application configuration loaded from .env file."""

    llm_api_key: str = ""
    llm_model: str = "GLM-4-Flash-250414"
    llm_base_url: str = "https://open.bigmodel.cn/api/paas/v4/"
    tavily_api_key: str = ""

    offload_max_chars: int = 1000
    session_max_messages: int = 500

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
