---
title: "LangGraph 状态图工作流设计实战"
date: 2026-05-20
slug: langgraph-workflow
tags: [AI, LangGraph, Workflow, StateGraph]
category: 技术
excerpt: LangGraph 是构建复杂 AI 工作流的利器。
---

# LangGraph 状态图工作流设计实战

## StateGraph 基础

StateGraph 的核心是状态类型、节点和边。

### 状态定义

```
class AgentState(TypedDict):
    query: str
    intent: str
    intent_confidence: float
    rag_context: str
    agent_result: str
    final_answer: str
    error: Optional[str]
```

### 条件边路由

```
def route_intent(state):
    intent = state.get("intent", "chat")
    if intent == "rag": return "rag_node"
    elif intent == "agent": return "agent_node"
    else: return "generate_node"
```

### 工作流编排

```
graph = StateGraph(AgentState)
graph.add_node("intent", run_intent_node)
graph.add_node("rag", run_rag_node)
graph.add_node("agent", run_agent_node)
graph.add_node("generate", run_generate_node)
graph.set_entry_point("intent")
graph.add_conditional_edges("intent", route_intent)
graph.add_edge("rag", "generate")
graph.add_edge("agent", "generate")
graph.add_edge("generate", END)
app = graph.compile()
```
