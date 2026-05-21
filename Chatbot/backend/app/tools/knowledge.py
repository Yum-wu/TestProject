"""Knowledge base Tool - lets Agent query the RAG system.

LLM instance is cached at module level (not created per call).
"""

from typing import Optional, Type
from pydantic import BaseModel, Field
from langchain.tools import tool

from app.rag.qa_chain import rag_query
from app.rag.models import RAGQueryResponse

# Lazy-init LLM for tool calls (non-streaming, reused across calls)
_llm = None


def _get_llm():
    global _llm
    if _llm is None:
        from app.agent.llm import create_llm
        _llm = create_llm(streaming=False)
    return _llm


class KnowledgeRetrievalInput(BaseModel):
    """Input schema for knowledge retrieval tool."""
    query: str = Field(description="搜索查询，如：Hermes Agent 有几层记忆？")
    top_k: int = Field(default=3, description="返回的相关文档数量")


@tool(args_schema=KnowledgeRetrievalInput)
def knowledge_retrieval(query: str, top_k: int = 3) -> str:
    """查询知识库（RAG）。当需要基于已有文档回答问题时使用，如产品文档、技术文章等。
    输入: query=搜索问题, top_k=返回结果数量"""
    llm = _get_llm()

    def _llm_call(messages):
        response = llm.invoke(messages)
        return response.content

    try:
        result: RAGQueryResponse = rag_query(query, _llm_call, top_k=top_k)
        answer = result.answer
        if result.sources:
            answer += "\n\n---\n来源："
            for s in result.sources:
                title = s.title if s.title and s.title != "Unknown" else s.slug
                answer += f"\n- [{title}]({s.slug})"
        return answer
    except Exception as e:
        return f"知识库查询失败：{str(e)}"
