from app.tools.calculator import calculator
from app.tools.web_search import web_search
from app.tools.read_ref import read_ref
from app.config import settings

ALL_TOOLS = [
    calculator,
    read_ref,
]

if settings.tavily_api_key:
    ALL_TOOLS.append(web_search)
