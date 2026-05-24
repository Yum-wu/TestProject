"""
QA chain for RAG system.
Retrieves relevant context and generates answers using LLM.
"""

import time
import os
from typing import List, Dict, Any, Optional

from app.rag.vector_store import retrieve, format_context, save_index, embed_texts_llm, load_index
from app.rag.models import RAGQueryResponse, SourceItem
from app.utils.lang_detect import detect_language, lang_instruction


QA_SYSTEM_PROMPT = """你是知识库问答助手。基于提供的参考文档回答用户问题。

规则：
1. 只基于参考文档内容回答。参考文档中没有的信息，说"文档中未提及"。
2. 在回答末尾标注引用来源，格式：引用文章标题。
3. 如果问题与文档无关，礼貌说明无法回答。
4. 回答简洁准确。
{lang_instruction}

参考文档中每段以 [Source N: 文章标题] 开头。引用时用自然方式标注来源，例如：[来源: Hermes Agent 实战]。

参考文档：
{context}
"""

QA_SYSTEM_PROMPT_EN = """You are a knowledge base QA assistant. Answer user questions based on the provided reference documents.

Rules:
1. Only answer based on the reference documents. If information is not in the documents, say "not mentioned in the documents".
2. Cite sources at the end of your answer, format: article title.
3. If the question is unrelated to the documents, politely explain that you cannot answer.
4. Keep answers concise and accurate.
{lang_instruction}

Each paragraph in the reference documents starts with [Source N: Article Title]. When citing, naturally mention the source, e.g., [Source: Hermes Agent in Practice].

Reference documents:
{context}
"""


def generate_answer(
    query: str,
    context: str,
    llm_call_fn,
    system_prompt: str = None,
    lang: str = "zh",
) -> str:
    """Call LLM with context and query. Return generated answer."""
    if system_prompt is None:
        system_prompt = QA_SYSTEM_PROMPT_EN if lang == "en" else QA_SYSTEM_PROMPT
    lang_instr = lang_instruction(lang).strip()
    prompt = system_prompt.format(context=context, lang_instruction=lang_instr)
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
    lang: str | None = None,
) -> RAGQueryResponse:
    """Full RAG pipeline: retrieve → format → generate.

    If *lang* is ``None``, auto-detect from *query*.
    """
    if lang is None:
        lang = detect_language(query)

    # 1. Retrieve
    chunks = retrieve(query, top_k=top_k, use_mmr=use_mmr)

    if not chunks:
        no_result_msg = (
            "No relevant content found in the knowledge base. Please try a different question."
            if lang == "en"
            else "知识库中暂无相关内容，请尝试其他问题。"
        )
        return RAGQueryResponse(
            answer=no_result_msg,
            sources=[],
        )

    # 2. Format context
    context = format_context(chunks)

    # 3. Generate
    answer = generate_answer(query, context, llm_call_fn, lang=lang)

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
