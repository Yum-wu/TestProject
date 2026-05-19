"""
Pydantic models for RAG API.
"""

from pydantic import BaseModel
from typing import List, Optional


class RAGQueryRequest(BaseModel):
    query: str
    top_k: int = 3
    use_mmr: bool = True


class SourceItem(BaseModel):
    title: str
    slug: str
    chunk: str
    score: Optional[float] = None


class RAGQueryResponse(BaseModel):
    answer: str
    sources: List[SourceItem]


class RAGIndexResponse(BaseModel):
    status: str
    documents_indexed: int
    chunks_created: int
    elapsed_seconds: float
