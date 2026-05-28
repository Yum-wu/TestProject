"""MCP Registry — 注册所有工作流向 MCP Server"""

from app.langgraph.mcp import register_tool, list_tools


def register_all_tools():
    """Register all workflow tools in the MCP registry."""

    @register_tool("intent_classify", "分类用户意图：rag/agent/chat/mixed")
    def _intent_classify(query: str) -> dict:
        from app.langgraph.nodes.intent import run_intent_node

        def _llm_call(messages):
            from app.agent.llm import create_llm
            llm = create_llm()
            resp = llm.invoke(messages)
            return resp.content

        intent, confidence = run_intent_node(query, _llm_call)
        return {"intent": intent, "confidence": confidence}

    @register_tool("knowledge_retrieval", "从知识库检索信息")
    def _knowledge_retrieval(query: str, top_k: int = 3) -> dict:
        from app.langgraph.nodes.rag import run_rag_node

        def _llm_call(messages):
            from app.agent.llm import create_llm
            llm = create_llm()
            resp = llm.invoke(messages)
            return resp.content

        answer, sources = run_rag_node(query, _llm_call, top_k=top_k)
        return {"answer": answer, "sources": sources}

    @register_tool("agent_execute", "执行 AI Agent 完成工具调用")
    def _agent_execute(query: str, context: str = "") -> dict:
        from app.langgraph.nodes.agent import run_agent_node

        result, tool_calls = run_agent_node(query, context=context)
        return {"result": result, "tool_calls": tool_calls}

    return list_tools()
