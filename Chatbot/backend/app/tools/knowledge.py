"""Knowledge base Tool - lets Agent query the RAG system."""

from typing import Optional, Type
from pydantic import BaseModel, Field
from langchain.tools import tool

from app.rag.qa_chain import rag_query
from app.rag.models import RAGQueryResponse


class KnowledgeRetrievalInput(BaseModel):
    """Input schema for knowledge retrieval tool."""
    query: str = Field(description="搜索查询，如：Hermes Agent 有几层记忆？")
    top_k: int = Field(default=3, description="返回的相关文档数量")


@tool(args_schema=KnowledgeRetrievalInput)
def knowledge_retrieval(query: str, top_k: int = 3) -> str:
    """查询知识库（RAG）。当需要基于已有文档回答问题时使用，如产品文档、技术文章等。
    输入: query=搜索问题, top_k=返回结果数量"""
    from app.agent.llm import create_llm

    llm = create_llm()

    def _llm_call(messages):
        response = llm.invoke(messages)
        return response.content

    result: RAGQueryResponse = rag_query(query, _llm_call, top_k=top_k)

    answer = result.answer
    if result.sources:
        answer += "\n\n---\n来源："
        for s in result.sources:
            answer += f"\n- [{s.title}]({s.slug})"

    return answer
