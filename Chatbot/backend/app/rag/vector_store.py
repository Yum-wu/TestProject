"""
Vector store management for RAG system.
Uses ChromaDB as persistent vector store with local BGE embeddings.
Falls back to Zhipu AI embedding API if local model unavailable.
"""

import os
import hashlib
import numpy as np
from typing import List, Dict, Any, Optional

import chromadb
from chromadb.api.types import EmbeddingFunction

VECTOR_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "vectors")

# ── Embedding cache (FIFO eviction, keyed by text hash) ──
_embed_cache: Dict[str, np.ndarray] = {}
_EMBED_CACHE_MAX = 500

# ── Local embedding model (lazy-loaded singleton) ──
_local_embed_model = None
_LOCAL_MODEL_NAME = "BAAI/bge-small-zh-v1.5"
_LOCAL_MODEL_DIM = 512


def _cache_key(text: str) -> str:
    return hashlib.md5(text.encode()).hexdigest()


def _get_local_model():
    """Lazy-load local sentence-transformers model. Returns None if unavailable."""
    global _local_embed_model
    if _local_embed_model is None:
        try:
            # Use HF mirror for China accessibility
            os.environ.setdefault("HF_ENDPOINT", "https://hf-mirror.com")
            from sentence_transformers import SentenceTransformer
            _local_embed_model = SentenceTransformer(_LOCAL_MODEL_NAME)
            print(f"[VectorStore] Local embedding model loaded: {_LOCAL_MODEL_NAME} ({_LOCAL_MODEL_DIM}d)")
        except Exception as e:
            print(f"[VectorStore] Local model unavailable: {e}, will use API fallback")
            _local_embed_model = False
    return _local_embed_model if _local_embed_model is not False else None


def _embed_local(texts: List[str]) -> Optional[np.ndarray]:
    """Embed texts using local sentence-transformers model. Returns None if unavailable."""
    model = _get_local_model()
    if model is None:
        return None
    try:
        embeddings = model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
        return np.array(embeddings, dtype=np.float32)
    except Exception as e:
        print(f"[VectorStore] Local embedding error: {e}")
        return None


# ── ChromaDB singleton ──
_chroma_client: Optional[chromadb.PersistentClient] = None
_chroma_collection = None

# ── Keyword search index (no embeddings, <10ms queries) ──
_kw_docs: List[Dict] = []
_kw_idf: Dict[str, float] = {}
_kw_avgdl: float = 0.0


def _get_chroma(path: str = None) -> chromadb.PersistentClient:
    """Get or create ChromaDB client (singleton per path)."""
    global _chroma_client
    save_path = path or VECTOR_DIR
    if _chroma_client is None:
        os.makedirs(save_path, exist_ok=True)
        _chroma_client = chromadb.PersistentClient(path=save_path)
    return _chroma_client


def _get_collection(client=None, name: str = "articles"):
    """Get or create Chroma collection with embedding function."""
    global _chroma_collection
    if _chroma_collection is None or client is not None:
        c = client or _get_chroma()
        _chroma_collection = c.get_or_create_collection(
            name=name,
            embedding_function=ZhipuEmbeddingFn(),
        )
    return _chroma_collection


def _reset_chroma():
    """Reset ChromaDB singleton (for testing / reindex)."""
    global _chroma_client, _chroma_collection
    _chroma_client = None
    _chroma_collection = None


# ── Keyword / BM25 retrieval (no embeddings, <10ms) ──

def _tokenize(text: str) -> List[str]:
    """Chinese-aware tokenizer: chars, bigrams, words, numbers."""
    import re
    tokens: List[str] = []
    # English words + numbers
    for m in re.finditer(r'[a-zA-Z]+|\d+', text.lower()):
        tokens.append(m.group())
    # Chinese single chars + bigrams
    chars = re.findall(r'[一-鿿]', text)
    for c in chars:
        tokens.append(c)
    for i in range(len(chars) - 1):
        tokens.append(chars[i] + chars[i + 1])
    return tokens


def _build_kw_index(force: bool = False):
    """Build in-memory BM25 index from Chroma documents."""
    global _kw_docs, _kw_idf, _kw_avgdl
    import math
    from collections import Counter

    if _kw_docs and not force:
        return

    try:
        client = _get_chroma()
        collection = _get_collection(client)
        if collection.count() == 0:
            return

        results = collection.get(include=["documents", "metadatas"])
        ids_list = results["ids"]
        n = len(ids_list)
        df: Counter = Counter()
        docs: List[Dict] = []

        for i in range(n):
            text = results["documents"][i] or ""
            meta = results["metadatas"][i] or {}
            docs.append({"text": text, "metadata": meta})
            for t in set(_tokenize(text)):
                df[t] += 1

        # BM25 IDF
        idf: Dict[str, float] = {}
        for term, freq in df.items():
            idf[term] = math.log(1.0 + (n - freq + 0.5) / (freq + 0.5))

        avgdl = sum(len(_tokenize(d["text"])) for d in docs) / max(n, 1)

        _kw_docs = docs
        _kw_idf = idf
        _kw_avgdl = avgdl
        print(f"[VectorStore] BM25 index ready: {n} docs, {len(idf)} terms, avgdl={avgdl:.0f}")
    except Exception as e:
        print(f"[VectorStore] BM25 index build failed: {e}")


def _bm25_score(query_terms: List[str], doc_terms: List[str]) -> float:
    """BM25 scoring with k1=1.2, b=0.75."""
    from collections import Counter
    doc_tf = Counter(doc_terms)
    doc_len = len(doc_terms)
    k1, b = 1.2, 0.75
    score = 0.0

    for term in set(query_terms):
        if term not in _kw_idf:
            continue
        tf = doc_tf.get(term, 0)
        if tf == 0:
            continue
        idf = _kw_idf[term]
        num = tf * (k1 + 1.0)
        denom = tf + k1 * (1.0 - b + b * doc_len / max(_kw_avgdl, 1.0))
        qf = query_terms.count(term)
        score += idf * (num / denom) * qf
    return score


def retrieve_keyword(query: str, top_k: int = 3) -> List[Dict[str, Any]]:
    """Fast BM25 keyword retrieval — no embedding API needed. <10ms."""
    _build_kw_index()
    if not _kw_docs:
        return []

    q_terms = _tokenize(query)
    if not q_terms:
        return []

    scored = []
    for doc in _kw_docs:
        doc_terms = _tokenize(doc["text"])
        s = _bm25_score(q_terms, doc_terms)
        if s > 0:
            scored.append((s, doc))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [
        {
            "text": d["text"],
            "metadata": d["metadata"],
            "score": s,
        }
        for s, d in scored[:top_k]
    ]


def embed_texts_llm(texts: List[str], batch_size: int = 20) -> Optional[np.ndarray]:
    """Generate embeddings: local BGE model first, Zhipu API fallback.

    Uses caching to avoid re-embedding identical texts.
    """
    from app.config import settings

    # 1. Check cache for each text
    uncached: List[tuple[int, str]] = []
    result = [None] * len(texts)

    for i, t in enumerate(texts):
        key = _cache_key(t)
        if key in _embed_cache:
            result[i] = _embed_cache[key]
        else:
            uncached.append((i, t))

    if not uncached:
        return np.array(result, dtype=np.float32)

    # 2. Try local model first
    uncached_texts = [t for _, t in uncached]
    local_embs = _embed_local(uncached_texts)
    if local_embs is not None:
        # Fill results + cache
        for (idx, text), emb in zip(uncached, local_embs):
            result[idx] = emb
            _embed_cache[_cache_key(text)] = emb
        return np.array(result, dtype=np.float32)

    # 3. Fall back to Zhipu embedding API
    api_key = settings.embedding_api_key or settings.llm_api_key
    base_url = settings.embedding_base_url or settings.llm_base_url

    if not api_key:
        print("[VectorStore] No embedding API key configured, using zero vectors")
        dim = _LOCAL_MODEL_DIM
        return np.zeros((len(texts), dim), dtype=np.float32)

    import requests

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    all_embeddings = []

    for start in range(0, len(uncached_texts), batch_size):
        batch = uncached_texts[start:start + batch_size]
        payload = {
            "model": "embedding-2",
            "input": batch,
        }
        try:
            resp = requests.post(
                f"{base_url}/embeddings",
                headers=headers,
                json=payload,
                timeout=60,
            )
            resp.raise_for_status()
            data = resp.json()
            batch_embs = [d["embedding"] for d in sorted(data["data"], key=lambda x: x["index"])]
            all_embeddings.extend(batch_embs)
        except Exception as e:
            print(f"[VectorStore] Embedding API error (batch {start}): {e}")
            # Fill failed batch with zeros
            dim = _LOCAL_MODEL_DIM if _get_local_model() else 768
            for _ in batch:
                all_embeddings.append([0.0] * dim)

    # Fill results + update cache
    for (idx, text), emb in zip(uncached, all_embeddings):
        arr = np.array(emb, dtype=np.float32)
        result[idx] = arr
        key = _cache_key(text)
        _embed_cache[key] = arr

    # Evict if over limit
    if len(_embed_cache) > _EMBED_CACHE_MAX:
        for k in list(_embed_cache.keys())[:len(_embed_cache) - _EMBED_CACHE_MAX]:
            del _embed_cache[k]

    return np.array(result, dtype=np.float32)


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


# ── Public API ──

def add_to_index(chunks: List[Dict[str, Any]], path: str = None):
    """Add chunks to an EXISTING Chroma collection (incremental)."""
    save_path = path or VECTOR_DIR
    os.makedirs(save_path, exist_ok=True)

    client = _get_chroma(save_path)
    collection = _get_collection(client)

    existing_count = collection.count()
    ids = [f"chunk_{existing_count + i}" for i in range(len(chunks))]
    documents = [c["text"] for c in chunks]
    metadatas = [
        {
            "source": c["metadata"].get("source", ""),
            "title": c["metadata"].get("title", ""),
            "slug": c["metadata"].get("slug", ""),
        }
        for c in chunks
    ]

    batch_size = 20
    for start in range(0, len(chunks), batch_size):
        end = min(start + batch_size, len(chunks))
        collection.add(
            ids=ids[start:end],
            documents=documents[start:end],
            metadatas=metadatas[start:end],
        )

    print(f"[VectorStore] Added {len(chunks)} chunks to existing Chroma ({save_path})")
    _build_kw_index(force=True)


def delete_from_index(source_filename: str, path: str = None):
    """Delete all chunks whose metadata.source == source_filename from Chroma."""
    save_path = path or VECTOR_DIR
    try:
        client = _get_chroma(save_path)
        collection = _get_collection(client)
    except Exception as e:
        print(f"[VectorStore] Cannot open Chroma for delete: {e}")
        return

    count_before = collection.count()
    collection.delete(where={"source": source_filename})
    count_after = collection.count()
    deleted = count_before - count_after
    safe_name = source_filename.encode("ascii", errors="replace").decode("ascii")
    print(f"[VectorStore] Deleted {deleted} chunks for '{safe_name}' from Chroma ({save_path})")
    _build_kw_index(force=True)


def save_index(chunks: List[Dict[str, Any]], embeddings: np.ndarray = None, path: str = None):
    """Save chunks to Chroma persistent storage (embeddings computed automatically)."""
    save_path = path or VECTOR_DIR
    os.makedirs(save_path, exist_ok=True)

    global _chroma_client, _chroma_collection
    _chroma_client = None
    _chroma_collection = None

    client = _get_chroma(save_path)

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

    batch_size = 20
    for start in range(0, len(chunks), batch_size):
        end = min(start + batch_size, len(chunks))
        collection.add(
            ids=ids[start:end],
            documents=documents[start:end],
            metadatas=metadatas[start:end],
        )

    print(f"[VectorStore] Saved {len(chunks)} chunks to Chroma ({save_path})")
    _build_kw_index(force=True)


def load_index(path: str = None):
    """Check if Chroma collection exists and has data."""
    try:
        client = _get_chroma(path)
        collection = _get_collection(client)
        count = collection.count()
        if count > 0:
            return [], np.array([])
        return None, None
    except Exception:
        return None, None


def retrieve(query: str, top_k: int = 3, use_mmr: bool = True) -> List[Dict[str, Any]]:
    """Retrieve top_k chunks using Chroma similarity search."""
    try:
        client = _get_chroma()
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
        return _simple_diversity(items, top_k)

    return items[:top_k]


def _simple_diversity(items: list, top_k: int) -> list:
    """Lightweight diversity: prefer unique sources, fill with best scores.

    No embedding API calls.
    """
    seen_sources = set()
    diverse = []
    # Pass 1: best item per unique source
    for item in sorted(items, key=lambda x: x["score"], reverse=True):
        src = item["metadata"].get("source", item["metadata"].get("title", ""))
        if src not in seen_sources:
            diverse.append(item)
            seen_sources.add(src)
            if len(diverse) >= top_k:
                return diverse
    # Pass 2: fill remaining from unused items by score
    remaining = [it for it in items if it not in diverse]
    diverse.extend(remaining[:top_k - len(diverse)])
    return diverse


def format_context(chunks: List[Dict[str, Any]]) -> str:
    """Format retrieved chunks into context string."""
    parts = []
    for i, chunk in enumerate(chunks):
        source = chunk["metadata"].get("title", chunk["metadata"].get("source", "Unknown"))
        parts.append(f"[Source {i+1}: {source}]\n{chunk['text']}")
    return "\n\n".join(parts)


def get_bm25_stats() -> dict:
    """Return BM25 index statistics for health endpoint."""
    return {
        "docs": len(_kw_docs),
        "terms": len(_kw_idf),
        "avgdl": round(_kw_avgdl, 1) if _kw_avgdl else 0,
    }
