"""
RAG 检索节点。
封装 P1 RAG 模块，通过 MCP 协议暴露为 tool。
"""

import time

from app.rag.models import RAGQueryResponse


def run_rag_node(query: str, llm_call_fn, top_k: int = 3) -> tuple:
    """Execute RAG retrieval + generation. Return (answer, sources)."""
    from app.rag.qa_chain import rag_query

    result: RAGQueryResponse = rag_query(query, llm_call_fn, top_k=top_k)

    sources_list = [
        {
            "title": s.title,
            "slug": s.slug,
            "score": s.score,
        }
        for s in result.sources
    ]

    return result.answer, sources_list
