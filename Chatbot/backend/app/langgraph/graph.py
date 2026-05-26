"""LangGraph 工作流 — StateGraph 定义 + 条件边路由"""

import asyncio
import time
import logging

from app.langgraph.state import AgentState, initial_state
from app.langgraph.nodes.intent import run_intent_node
from app.langgraph.nodes.rag import run_rag_node
from app.langgraph.nodes.agent import run_agent_node
from app.langgraph.nodes.generate import run_generate_node
from app.langgraph.mcp.server import register_all_tools

logger = logging.getLogger(__name__)

# Initialize MCP tools once at module load
register_all_tools()


def create_llm_call_fn():
    """Create an LLM call function using existing config."""
    from app.agent.llm import create_llm
    llm = create_llm()

    def _call(messages):
        response = llm.invoke(messages)
        return response.content

    return _call


def route_intent(state: AgentState) -> str:
    """Conditional edge: route based on intent classification."""
    intent = state.get("intent", "chat")
    logger.info(f"[LangGraph] Intent: {intent} (confidence: {state.get('intent_confidence', 0):.2f})")

    if state.get("human_approval_needed") and state.get("human_approved") is False:
        return "end"

    return intent  # "rag" | "agent" | "chat" | "mixed"


async def run_workflow(query: str, session_id: str = "") -> dict:
    """
    Execute the LangGraph workflow for a single query.
    RAG and Agent nodes run in parallel for "mixed" intent.
    """
    state = initial_state(query)
    llm_call_fn = create_llm_call_fn()

    start_total = time.time()

    try:
        # ── Node 1: Intent ──
        t0 = time.time()
        intent, confidence = await asyncio.to_thread(run_intent_node, query, llm_call_fn)
        logger.info(f"[LangGraph] Raw intent result: '{intent}', confidence: {confidence}")
        state["intent"] = intent
        state["intent_confidence"] = confidence
        state["node_times"]["intent"] = int((time.time() - t0) * 1000)
        state["intermediate_results"].append({
            "node": "intent", "output": f"意图: {intent} ({confidence:.0%})"
        })

        state["mcp_calls"].append({
            "from": "workflow",
            "to": "intent_node",
            "tool": "intent_classify",
            "duration_ms": state["node_times"]["intent"],
        })

        # ── Routing ──
        next_node = route_intent(state)
        if next_node == "end":
            state["final_answer"] = "操作已取消。"
            return _build_result(state, start_total)

        # ── Node 2: Execute based on intent ──
        if next_node in ("rag", "mixed"):
            t0 = time.time()
            answer, sources = await asyncio.to_thread(run_rag_node, query, llm_call_fn)
            state["rag_context"] = answer
            state["rag_sources"] = sources
            state["node_times"]["rag"] = int((time.time() - t0) * 1000)
            state["intermediate_results"].append({
                "node": "rag", "output": answer[:100] + "..." if len(answer) > 100 else answer
            })
            state["mcp_calls"].append({
                "from": "rag_node", "to": "chroma_knowledge_base",
                "tool": "knowledge_retrieval",
                "duration_ms": state["node_times"]["rag"],
            })

        if next_node in ("agent", "mixed"):
            t0 = time.time()
            context = state.get("rag_context", "") if next_node == "mixed" else ""
            result, tool_calls = await asyncio.to_thread(run_agent_node, query, context)
            state["agent_result"] = result
            state["agent_tool_calls"] = tool_calls
            state["node_times"]["agent"] = int((time.time() - t0) * 1000)
            state["intermediate_results"].append({
                "node": "agent", "output": result[:100] + "..." if len(result) > 100 else result
            })

        # ── Node 3: Generate (only when needed) ──
        # For "rag" intent: RAG node already produced the final answer
        # For "chat" intent: use direct LLM response, no RAG/agent context
        if next_node == "rag":
            state["final_answer"] = state.get("rag_context", "")
        elif next_node == "chat":
            t0 = time.time()
            state["final_answer"] = await asyncio.to_thread(
                run_generate_node,
                query=query,
                intent=intent,
                rag_context="",
                rag_sources=[],
                agent_result="",
                llm_call_fn=llm_call_fn,
            )
            state["node_times"]["generate"] = int((time.time() - t0) * 1000)
        elif next_node in ("agent", "mixed"):
            t0 = time.time()
            final = await asyncio.to_thread(
                run_generate_node,
                query=query,
                intent=intent,
                rag_context=state.get("rag_context", ""),
                rag_sources=state.get("rag_sources", []),
                agent_result=state.get("agent_result", ""),
                llm_call_fn=llm_call_fn,
            )
            state["final_answer"] = final
            state["node_times"]["generate"] = int((time.time() - t0) * 1000)
        state["intermediate_results"].append({
            "node": "generate", "output": "回答已生成"
        })

    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        logger.error(f"[LangGraph] Workflow error: {e}\n{tb}")
        state["error"] = str(e)
        state["final_answer"] = f"处理出错：{e}"

    return _build_result(state, start_total)


def _build_result(state: AgentState, start_time: float) -> dict:
    """Build the final response from workflow state."""
    total_ms = int((time.time() - start_time) * 1000)
    state["node_times"]["total"] = total_ms

    return {
        "answer": state.get("final_answer", ""),
        "route": state.get("intent", "unknown"),
        "nodes_executed": [r["node"] for r in state.get("intermediate_results", [])],
        "node_times_ms": state.get("node_times", {}),
        "mcp_calls": state.get("mcp_calls", []),
        "error": state.get("error"),
        "total_time_ms": total_ms,
    }
