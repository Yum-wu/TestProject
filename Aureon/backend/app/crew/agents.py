"""Multi-Agent Article Generator — Agent Definitions (crewai 0.80+)"""

import os
from crewai import Agent
from crewai.tools import tool


@tool("web_search")
def web_search(query: str) -> str:
    """Search the web for current information on a topic. Use for research.
    Falls back to explaining unavailability if TAVILY_API_KEY is not set."""
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        return (
            "[Web search unavailable: TAVILY_API_KEY not configured. "
            "Proceed using existing knowledge.]"
        )
    from tavily import TavilyClient
    client = TavilyClient(api_key=api_key)
    results = client.search(query=query, max_results=5)
    return "\n\n".join(
        f"- **{r.get('title', 'Untitled')}**\n{r.get('content', '')}"
        for r in results.get("results", [])
    )


AGENT_CONFIGS = {
    "researcher": {
        "zh": {
            "role": "资深研究员",
            "goal": "针对用户提供的主题进行深入研究和信息收集。输出结构化的研究简报，包含关键发现、核心论点和参考资料。",
            "backstory": "你是一名经验丰富的研究分析师，擅长快速理解新领域、提炼关键信息并形成结构化研究报告。你注重事实准确性和信息来源的可靠性。",
        },
        "en": {
            "role": "Senior Researcher",
            "goal": "Conduct in-depth research on the user-provided topic. Output a structured research brief with key findings, core arguments, and references.",
            "backstory": "You are an experienced research analyst skilled at quickly understanding new domains, distilling key information, and producing structured research reports. You prioritize factual accuracy and reliable information sources.",
        },
    },
    "writer": {
        "zh": {
            "role": "专业写手",
            "goal": "基于研究员提供的研究简报，撰写一篇高质量、结构清晰、富有洞察力的文章。文章必须使用 Markdown 格式，包含标题、小节、列表等元素，适合直接发布。",
            "backstory": "你是一名资深内容创作者，擅长将复杂的技术概念转化为通俗易懂的文章。你的写作风格专业但不晦涩，善于用生动的例子解释抽象概念。你注重文章的逻辑结构、可读性和实用价值。",
        },
        "en": {
            "role": "Professional Writer",
            "goal": "Based on the researcher's brief, write a high-quality, well-structured, insightful article. The article must use Markdown format with headings, sections, lists, suitable for direct publication.",
            "backstory": "You are a senior content creator who excels at translating complex technical concepts into accessible articles. Your writing is professional yet approachable, using vivid examples to explain abstract ideas. You prioritize logical structure, readability, and practical value.",
        },
    },
    "editor": {
        "zh": {
            "role": "高级编辑",
            "goal": "审查并优化写手完成的文章草稿。提供 1-10 分的质量评分和具体的改进建议，并输出最终修订版文章。",
            "backstory": "你是一名资深编辑，拥有多年的内容审核经验。你对文章质量有极高的要求，关注事实准确性、逻辑连贯性、语言表达和读者体验。你的评分客观公正，改进建议具体可行。",
        },
        "en": {
            "role": "Senior Editor",
            "goal": "Review and polish the writer's article draft. Provide a quality score (1-10) with specific improvement suggestions, and output the final revised article.",
            "backstory": "You are a seasoned editor with years of content review experience. You hold extremely high standards for article quality, focusing on factual accuracy, logical coherence, language expression, and reader experience. Your scores are objective and your suggestions are actionable.",
        },
    },
}


def _agent_config(agent_type: str, lang: str) -> dict:
    cfg = AGENT_CONFIGS.get(agent_type, {})
    return cfg.get(lang, cfg.get("zh", {}))


def create_researcher(lang: str = "zh") -> Agent:
    cfg = _agent_config("researcher", lang)
    return Agent(
        role=cfg["role"],
        goal=cfg["goal"],
        backstory=cfg["backstory"],
        tools=[web_search],
        verbose=True,
        allow_delegation=False,
    )


def create_writer(lang: str = "zh") -> Agent:
    cfg = _agent_config("writer", lang)
    return Agent(
        role=cfg["role"],
        goal=cfg["goal"],
        backstory=cfg["backstory"],
        verbose=True,
        allow_delegation=False,
    )


def create_editor(lang: str = "zh") -> Agent:
    cfg = _agent_config("editor", lang)
    return Agent(
        role=cfg["role"],
        goal=cfg["goal"],
        backstory=cfg["backstory"],
        verbose=True,
        allow_delegation=False,
    )
