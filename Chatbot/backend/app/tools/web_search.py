from langchain.tools import tool
from tavily import TavilyClient
from app.config import settings


@tool
def web_search(query: str) -> str:
    """在互联网上搜索最新信息。当需要实时数据或用户问到当前事件时使用。
    输入: 搜索关键词
    """
    if not settings.tavily_api_key:
        return "搜索服务未配置 (TAVILY_API_KEY 缺失)"

    try:
        client = TavilyClient(api_key=settings.tavily_api_key)
        result = client.search(query, max_results=3, search_depth="basic")
        lines = []
        for i, r in enumerate(result.get("results", [])[:3], 1):
            lines.append(f"{i}. {r.get('title', 'N/A')}")
            lines.append(f"   {r.get('content', 'N/A')[:200]}")
            lines.append(f"   URL: {r.get('url', 'N/A')}")
        return "\n".join(lines) if lines else "未找到相关搜索结果"
    except Exception as e:
        return f"搜索失败: {e}"
