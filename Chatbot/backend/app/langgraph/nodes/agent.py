"""
Agent 执行节点。
封装 P0 LangChain Agent，同步调用。
"""

from langchain_core.messages import HumanMessage

from app.tools import ALL_TOOLS
from app.agent.llm import create_llm
from app.agent.agent import create_chat_agent


def run_agent_node(query: str, context: str = "") -> tuple:
    """
    Execute P0 agent with tools.
    Returns (agent_result, tool_calls).
    """
    llm = create_llm()
    agent = create_chat_agent(llm, tools=ALL_TOOLS)

    # Combine context + query
    full_query = query
    if context:
        full_query = f"参考上下文：{context}\n\n用户问题：{query}"

    try:
        result = agent.invoke({"messages": [HumanMessage(content=full_query)]})
        output = result.get("output", str(result)) if isinstance(result, dict) else str(result)
        return output, []
    except Exception as e:
        return f"Agent 执行出错：{e}", []
