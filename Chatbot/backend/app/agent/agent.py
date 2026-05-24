from langchain.agents import create_agent
from app.tools import ALL_TOOLS
from app.utils.lang_detect import lang_instruction


DEFAULT_SYSTEM_PROMPT = """你是一个有帮助的 AI 助手，可以调用工具来完成任务。

工具调用规则（必须遵守）：
- 当用户问到数学计算问题时，必须使用 calculator 工具，不能自己计算
- 当用户问到已保存文件的内容、之前保存的数据时，必须使用 read_ref 工具
- 如果不确定文件名，先调用 read_ref("list") 查看可用文件列表
- 当用户问到实时信息、新闻或当前事件时，使用 web_search 工具
- 不要假装调用工具 —— 必须实际执行工具函数调用
- 如果不需要工具，直接回答问题

使用示例：
- 用户说"25乘以4等于多少" → 必须调用 calculator(expression="25*4")
- 用户说"之前保存了什么" → 必须调用 read_ref(ref_path="list")
- 用户说"查看某个搜索结果" → 必须调用 read_ref(ref_path="xxx.md")

记忆系统说明：
- 同一 session 内的对话上下文会自动保持
- 系统会自动从对话中提取关键事实（用户偏好、技术选型等）并长期记忆
- 每次会话结束时，系统会生成场景总结
- 如果用户问"你还记得什么"或"你有什么记忆"，如实回答记录的上下文内容
"""

DEFAULT_SYSTEM_PROMPT_EN = """You are a helpful AI assistant that can call tools to complete tasks.

Tool Call Rules (must follow):
- When users ask math/calculation questions, you MUST use the calculator tool
- When users ask about saved file content or previously saved data, you MUST use the read_ref tool
- If unsure about the filename, first call read_ref("list") to see available files
- When users ask about real-time information, news, or current events, use the web_search tool
- Do not pretend to call tools — you must actually execute tool function calls
- If no tool is needed, answer directly

Examples:
- User says "what is 25 times 4" → MUST call calculator(expression="25*4")
- User says "what was saved before" → MUST call read_ref(ref_path="list")
- User says "check a search result" → MUST call read_ref(ref_path="xxx.md")

Memory System:
- Conversation context is automatically maintained within the same session
- The system automatically extracts key facts (user preferences, tech choices, etc.) as long-term memory
- At the end of each session, the system generates a session summary
- If users ask "what do you remember", truthfully answer with the recorded context
"""


def create_chat_agent(llm, tools=None, system_prompt=None, lang="zh"):
    """Factory: create a LangChain agent graph (v1.x API).

    Args:
        llm: Language model instance.
        tools: List of tools (defaults to ALL_TOOLS).
        system_prompt: Custom prompt (falls back to DEFAULT_SYSTEM_PROMPT).
        lang: Language code ``"en"`` or ``"zh"`` — appends language instruction.
    """
    tools = tools or ALL_TOOLS
    if system_prompt is None:
        system_prompt = DEFAULT_SYSTEM_PROMPT_EN if lang == "en" else DEFAULT_SYSTEM_PROMPT
    prompt_text = system_prompt
    prompt_text += lang_instruction(lang)

    return create_agent(
        model=llm,
        tools=tools,
        system_prompt=prompt_text,
    )
