"""LangGraph 工作流 — 状态类型定义"""

from typing import TypedDict, List, Optional, Any


class AgentState(TypedDict):
    """工作流全局状态"""
    query: str                           # 原始用户输入
    intent: str                          # 意图分类结果: "rag" | "agent" | "chat" | "mixed"
    intent_confidence: float             # 意图置信度

    rag_context: str                     # RAG 检索结果（知识问答路径）
    rag_sources: List[dict]              # RAG 来源列表

    agent_result: str                    # Agent 执行结果（工具调用路径）
    agent_tool_calls: List[dict]         # Agent 调用的工具列表

    intermediate_results: List[dict]     # 所有节点的中间结果汇总
    final_answer: str                    # 最终生成回答

    error: Optional[str]                 # 错误信息
    node_times: dict                     # 各节点耗时（ms）
    mcp_calls: List[dict]                # MCP 调用记录

    human_approval_needed: bool          # 是否需要人工审批
    human_approved: Optional[bool]       # 审批结果


def initial_state(query: str) -> AgentState:
    """创建初始状态"""
    return {
        "query": query,
        "intent": "",
        "intent_confidence": 0.0,
        "rag_context": "",
        "rag_sources": [],
        "agent_result": "",
        "agent_tool_calls": [],
        "intermediate_results": [],
        "final_answer": "",
        "error": None,
        "node_times": {},
        "mcp_calls": [],
        "human_approval_needed": False,
        "human_approved": None,
    }
