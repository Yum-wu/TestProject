from app.tools.calculator import calculator
from app.tools.web_search import web_search
from app.tools.read_ref import read_ref
from app.tools.knowledge import knowledge_retrieval
from app.config import settings

ALL_TOOLS = [
    calculator,
    read_ref,
    knowledge_retrieval,
]

if settings.tavily_api_key:
    ALL_TOOLS.append(web_search)
