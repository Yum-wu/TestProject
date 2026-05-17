from langchain.agents import create_agent
from app.tools import ALL_TOOLS


DEFAULT_SYSTEM_PROMPT = """你是一个有帮助的 AI 助手，可以调用工具来完成任务。

使用工具的规则：
- 当用户问到数学计算问题时，使用 calculator 工具
- 当用户问到实时信息、新闻或当前事件时，使用 web_search 工具
- 当需要查看之前卸载的搜索结果或工具输出的完整内容时，使用 read_ref 工具
- 如果不需要工具，直接回答问题

记忆系统说明：
- 同一 session 内的对话上下文会自动保持
- 系统会自动从对话中提取关键事实（用户偏好、技术选型等）并长期记忆
- 每次会话结束时，系统会生成场景总结
- 如果用户问"你还记得什么"或"你有什么记忆"，如实回答记录的上下文内容

始终以中文回复。"""


def create_chat_agent(llm, tools=None, system_prompt=None):
    """Factory: create a LangChain agent graph (v1.x API)."""
    tools = tools or ALL_TOOLS
    prompt_text = system_prompt or DEFAULT_SYSTEM_PROMPT

    return create_agent(
        model=llm,
        tools=tools,
        system_prompt=prompt_text,
    )
