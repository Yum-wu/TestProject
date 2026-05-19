"""
Vector store management for RAG system.
Uses ChromaDB as persistent vector store with Zhipu AI embeddings.
"""

import os
import numpy as np
from typing import List, Dict, Any, Optional

import chromadb
from chromadb.api.types import EmbeddingFunction

VECTOR_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "vectors")


def embed_texts_llm(texts: List[str]) -> Optional[np.ndarray]:
    """Generate embeddings via Zhipu AI API."""
    from app.config import settings

    if not settings.llm_api_key:
        print("[VectorStore] LLM_API_KEY not configured, cannot embed")
        return None

    import requests

    headers = {
        "Authorization": f"Bearer {settings.llm_api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": "embedding-2",
        "input": texts,
    }

    try:
        resp = requests.post(
            f"{settings.llm_base_url}/embeddings",
            headers=headers,
            json=payload,
            timeout=60,
        )
        resp.raise_for_status()
        data = resp.json()

        embeddings = [d["embedding"] for d in sorted(data["data"], key=lambda x: x["index"])]
        return np.array(embeddings, dtype=np.float32)

    except Exception as e:
        print(f"[VectorStore] Embedding API error: {e}")
        return None


# ── Chroma embedding function wrapper ──

class ZhipuEmbeddingFn(EmbeddingFunction):
    """ChromaDB-compatible embedding function wrapping Zhipu AI API."""

    def __call__(self, input):
        texts = input if isinstance(input, list) else [input]
        embeddings = embed_texts_llm(texts)
        if embeddings is None:
            dim = 768
            return [[0.0] * dim] * len(texts)
        return embeddings.tolist()


# ── Chroma client helpers ──

def _get_client(path: str = None):
    return chromadb.PersistentClient(path=path or VECTOR_DIR)


def _get_collection(client, name: str = "articles"):
    return client.get_or_create_collection(
        name=name,
        embedding_function=ZhipuEmbeddingFn(),
    )


# ── Public API ──

def save_index(chunks: List[Dict[str, Any]], embeddings: np.ndarray = None, path: str = None):
    """Save chunks to Chroma persistent storage (embeddings computed automatically)."""
    save_path = path or VECTOR_DIR
    os.makedirs(save_path, exist_ok=True)

    client = _get_client(save_path)

    # Fresh start: delete existing collection
    try:
        client.delete_collection("articles")
    except Exception:
        pass

    collection = _get_collection(client)

    ids = [f"chunk_{i}" for i in range(len(chunks))]
    documents = [c["text"] for c in chunks]
    metadatas = [
        {
            "source": c["metadata"].get("source", ""),
            "title": c["metadata"].get("title", ""),
            "slug": c["metadata"].get("slug", ""),
        }
        for c in chunks
    ]

    # Add in batches to avoid large payloads
    batch_size = 20
    for start in range(0, len(chunks), batch_size):
        end = min(start + batch_size, len(chunks))
        collection.add(
            ids=ids[start:end],
            documents=documents[start:end],
            metadatas=metadatas[start:end],
        )

    print(f"[VectorStore] Saved {len(chunks)} chunks to Chroma ({save_path})")


def load_index(path: str = None):
    """Check if Chroma collection exists and has data."""
    try:
        client = _get_client(path)
        collection = _get_collection(client)
        count = collection.count()
        if count > 0:
            return [], np.array([])  # Signal: index exists
        return None, None
    except Exception:
        return None, None


def retrieve(query: str, top_k: int = 3, use_mmr: bool = True) -> List[Dict[str, Any]]:
    """Retrieve top_k chunks using Chroma similarity search."""
    try:
        client = _get_client()
        collection = _get_collection(client)
    except Exception as e:
        print(f"[VectorStore] Chroma init error: {e}")
        return []

    if collection.count() == 0:
        print("[VectorStore] Chroma collection is empty. Run /api/rag/index first.")
        return []

    fetch_k = max(top_k * 2, 10) if use_mmr else top_k

    try:
        results = collection.query(
            query_texts=[query],
            n_results=fetch_k,
            include=["documents", "metadatas", "distances"],
        )
    except Exception as e:
        print(f"[VectorStore] Query error: {e}")
        return []

    if not results["ids"] or not results["ids"][0]:
        return []

    # Chroma returns L2 distance (lower = more similar). Convert to [0,1] similarity.
    items = []
    for i in range(len(results["ids"][0])):
        distance = results["distances"][0][i]
        score = 1.0 / (1.0 + distance)
        items.append({
            "id": results["ids"][0][i],
            "text": results["documents"][0][i],
            "metadata": results["metadatas"][0][i] or {},
            "score": score,
        })

    if use_mmr and len(items) > top_k:
        return _mmr_rerank(query, items, top_k, lambda_mult=0.5)

    return items[:top_k]


def _mmr_rerank(query: str, items: List[Dict], top_k: int, lambda_mult: float = 0.5) -> List[Dict]:
    """MMR reranking for result diversity using query embedding."""
    query_emb = embed_texts_llm([query])
    if query_emb is None:
        return items[:top_k]

    query_emb = query_emb[0]
    texts = [it["text"] for it in items]
    item_embs = embed_texts_llm(texts)
    if item_embs is None:
        return items[:top_k]

    selected_indices = []
    remaining = list(range(len(items)))
    scores = np.array([it["score"] for it in items])

    while len(selected_indices) < top_k and remaining:
        best_score = -float("inf")
        best_idx = None

        for idx in remaining:
            sim_to_query = scores[idx]
            sim_to_selected = 0.0
            if selected_indices:
                sim_to_selected = max(
                    float(np.dot(item_embs[idx], item_embs[s]))
                    for s in selected_indices
                )
            mmr = lambda_mult * sim_to_query - (1 - lambda_mult) * sim_to_selected
            if mmr > best_score:
                best_score = mmr
                best_idx = idx

        if best_idx is not None:
            selected_indices.append(best_idx)
            remaining.remove(best_idx)

    return [items[idx] for idx in selected_indices]


def cosine_similarity(query_emb: np.ndarray, corpus_emb: np.ndarray) -> np.ndarray:
    """Compute cosine similarity (kept for backward compatibility)."""
    query_norm = query_emb / (np.linalg.norm(query_emb) + 1e-10)
    corpus_norm = corpus_emb / (np.linalg.norm(corpus_emb, axis=1, keepdims=True) + 1e-10)
    return np.dot(corpus_norm, query_norm)


def format_context(chunks: List[Dict[str, Any]]) -> str:
    """Format retrieved chunks into context string."""
    parts = []
    for i, chunk in enumerate(chunks):
        source = chunk["metadata"].get("title", chunk["metadata"].get("source", "Unknown"))
        parts.append(f"[Source {i+1}: {source}]\n{chunk['text']}")
    return "\n\n".join(parts)
