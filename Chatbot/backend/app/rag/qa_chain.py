"""
QA chain for RAG system.
Retrieves relevant context and generates answers using LLM.
"""

import time
import os
from typing import List, Dict, Any, Optional

from app.rag.vector_store import retrieve, format_context, save_index, embed_texts_llm, load_index
from app.rag.models import RAGQueryResponse, SourceItem


QA_SYSTEM_PROMPT = """你是知识库问答助手。基于提供的参考文档回答用户问题。

规则：
1. 只基于参考文档内容回答。参考文档中没有的信息，说"文档中未提及"。
2. 在回答末尾标注引用来源，格式：引用文章标题。
3. 如果问题与文档无关，礼貌说明无法回答。
4. 回答简洁准确，使用中文。

参考文档中每段以 [Source N: 文章标题] 开头。引用时用自然方式标注来源，例如：[来源: Hermes Agent 实战]。

参考文档：
{context}
"""


def generate_answer(
    query: str,
    context: str,
    llm_call_fn,
    system_prompt: str = QA_SYSTEM_PROMPT,
) -> str:
    """Call LLM with context and query. Return generated answer."""
    prompt = system_prompt.format(context=context)
    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": query},
    ]
    return llm_call_fn(messages)


def rag_query(
    query: str,
    llm_call_fn,
    top_k: int = 3,
    use_mmr: bool = True,
) -> RAGQueryResponse:
    """Full RAG pipeline: retrieve → format → generate."""
    # 1. Retrieve
    chunks = retrieve(query, top_k=top_k, use_mmr=use_mmr)

    if not chunks:
        return RAGQueryResponse(
            answer="知识库中暂无相关内容，请尝试其他问题。",
            sources=[],
        )

    # 2. Format context
    context = format_context(chunks)

    # 3. Generate
    answer = generate_answer(query, context, llm_call_fn)

    # 4. Build response with sources
    sources = [
        SourceItem(
            title=c["metadata"].get("title", c["metadata"].get("source", "Unknown")),
            slug=c["metadata"].get("slug", ""),
            chunk=c["text"][:200] + "..." if len(c["text"]) > 200 else c["text"],
            score=c.get("score"),
        )
        for c in chunks
    ]

    return RAGQueryResponse(answer=answer, sources=sources)


def run_index_pipeline(
    articles_dir: str,
    llm_call_fn = None,
) -> dict:
    """Full index pipeline: load → split → embed → store."""
    start = time.time()

    from app.rag.loader import load_markdown_files
    try:
        from langchain.text_splitter import RecursiveCharacterTextSplitter
    except ImportError:
        from langchain_text_splitters import RecursiveCharacterTextSplitter

    # 1. Load
    docs = load_markdown_files(articles_dir)
    if not docs:
        return {
            "status": "error",
            "documents_indexed": 0,
            "chunks_created": 0,
            "elapsed_seconds": 0,
            "message": "没有找到 Markdown 文件",
        }

    # 2. Split
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n## ", "\n### ", "\n\n", "\n", " ", ""],
    )

    chunks = []
    for doc in docs:
        texts = splitter.split_text(doc["content"])
        for text in texts:
            chunks.append({
                "text": text,
                "metadata": doc["metadata"],
            })

    # 3. Embed
    texts_to_embed = [c["text"] for c in chunks]
    embeddings = embed_texts_llm(texts_to_embed)

    # 4. Store
    save_index(chunks, embeddings)

    elapsed = time.time() - start
    print(f"[RAG] Index complete: {len(docs)} docs, {len(chunks)} chunks in {elapsed:.1f}s")

    return {
        "status": "ok",
        "documents_indexed": len(docs),
        "chunks_created": len(chunks),
        "elapsed_seconds": round(elapsed, 1),
    }
