"""
Tests for RAG pipeline: vector store, QA chain, indexing.
Uses mocked LLM + embeddings to run without API keys.
"""
import pytest
from unittest.mock import patch, MagicMock

from app.rag.vector_store import (
    embed_texts_llm,
    _simple_diversity,
    format_context,
)
from app.rag.qa_chain import rag_query, generate_answer


class TestEmbeddings:
    def test_embed_texts_no_key(self):
        """Without API key, embed_texts_llm returns None."""
        with patch("app.config.settings") as mock_settings:
            mock_settings.llm_api_key = ""
            result = embed_texts_llm(["hello"])
            assert result is None

    def test_embed_texts_api_error(self):
        """On API error, embed_texts_llm falls back to zero embeddings."""
        with patch("app.config.settings") as mock_settings:
            mock_settings.llm_api_key = "fake_key"
            mock_settings.llm_base_url = "http://invalid/"
            with patch("requests.post") as mock_post:
                mock_post.side_effect = Exception("API unreachable")
                result = embed_texts_llm(["hello"])
                assert result is not None
                assert result.shape == (1, 768)  # zero fallback


class TestDiversityRerank:
    def test_no_rerank_needed(self):
        """When len(items) <= top_k, no reranking happens."""
        items = [
            {"id": "0", "text": "a", "metadata": {}, "score": 0.9},
            {"id": "1", "text": "b", "metadata": {}, "score": 0.8},
        ]
        result = _simple_diversity(items, top_k=5)
        assert len(result) == 2
        assert result[0]["id"] == "0"

    def test_basic_rerank_shape(self):
        """Diversity returns exactly top_k items."""
        items = [
            {"id": str(i), "text": f"doc_{i}", "metadata": {}, "score": 0.9 - i * 0.05}
            for i in range(6)
        ]
        result = _simple_diversity(items, top_k=3)
        assert len(result) == 3


class TestFormatContext:
    def test_format_single_chunk(self):
        chunks = [{"text": "hello world", "metadata": {"title": "Doc1"}}]
        result = format_context(chunks)
        assert "[Source 1: Doc1]" in result
        assert "hello world" in result

    def test_format_multiple_chunks(self):
        chunks = [
            {"text": "first", "metadata": {"title": "A"}},
            {"text": "second", "metadata": {"title": "B"}},
        ]
        result = format_context(chunks)
        assert "[Source 1: A]" in result
        assert "[Source 2: B]" in result


class TestGenerateAnswer:
    def test_generate_uses_llm(self):
        mock_llm = MagicMock(return_value="This is an answer.")
        query = "What is X?"
        context = "[Source 1: Doc]\nX is Y."
        result = generate_answer(query, context, mock_llm)
        assert result == "This is an answer."
        # Verify LLM was called
        mock_llm.assert_called_once()
        args = mock_llm.call_args[0][0]
        assert any("X is Y" in str(m) for m in args)
        assert any("What is X" in str(m) for m in args)


class TestRAGQuery:
    def test_empty_results(self):
        """When retrieval returns nothing, return a fallback answer."""
        mock_llm = MagicMock()
        with patch("app.rag.qa_chain.retrieve", return_value=[]):
            result = rag_query("unknown topic", mock_llm)
            assert "No relevant content" in result.answer
            assert result.sources == []

    def test_full_pipeline(self):
        """With mocked retrieve + LLM, pipeline returns answer + sources."""
        mock_chunks = [
            {"text": "X is Y.", "metadata": {"title": "DocA", "slug": "doc-a"}, "score": 0.9},
        ]
        mock_llm = MagicMock(return_value="Answer based on context.")
        with patch("app.rag.qa_chain.retrieve", return_value=mock_chunks):
            result = rag_query("What is X?", mock_llm)
            assert "Answer" in result.answer
            assert len(result.sources) == 1
            assert result.sources[0].title == "DocA"
            assert result.sources[0].score == 0.9


class TestRunIndexPipeline:
    def test_no_articles_dir(self):
        """When articles dir doesn't exist, return error status."""
        from app.rag.qa_chain import run_index_pipeline
        result = run_index_pipeline("/nonexistent/path")
        assert result["status"] == "error"
        assert result["documents_indexed"] == 0
