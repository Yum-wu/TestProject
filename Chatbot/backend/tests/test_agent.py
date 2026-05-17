import pytest
from app.agent.llm import create_llm
from app.agent.agent import create_chat_agent


class TestLLMFactory:
    @pytest.mark.skip(reason="Requires valid LLM_API_KEY in .env")
    def test_create_llm_defaults(self):
        llm = create_llm()
        assert llm.model_name == "GLM-4-Flash-250414"
        assert llm.streaming is True

    @pytest.mark.skip(reason="Requires valid LLM_API_KEY in .env")
    def test_create_llm_custom_temp(self):
        llm = create_llm(temperature=0.3)
        assert llm.temperature == 0.3


class TestAgentFactory:
    @pytest.mark.skip(reason="Requires valid LLM_API_KEY in .env")
    def test_create_agent(self):
        llm = create_llm()
        graph = create_chat_agent(llm)
        assert graph is not None
