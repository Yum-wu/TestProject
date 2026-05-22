from app.tools.calculator import calculator
from app.tools.web_search import web_search
from app.tools.read_ref import read_ref
from app.tools.knowledge import knowledge_retrieval
from app.config import settings

ALL_TOOLS = [
    calculator,
    read_ref,
]

# Conditionally register RAG tool (only if Chroma index exists)
try:
    from app.rag.vector_store import load_index
    chunks, _ = load_index()
    if chunks is not None:
        ALL_TOOLS.append(knowledge_retrieval)
except Exception:
    pass  # No index — RAG tool not registered

if settings.tavily_api_key:
    ALL_TOOLS.append(web_search)
