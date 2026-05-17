import uuid
import json
from typing import AsyncGenerator
from langchain_core.messages import HumanMessage, SystemMessage


async def stream_agent(
    agent_graph,
    user_message: str,
    session_id: str | None = None,
    chat_history: list | None = None,
    memory_context: str | None = None,
) -> AsyncGenerator[str, None]:
    """Stream agent response as SSE events.

    Yields SSE-formatted strings: 'data: {...}\n\n'
    """
    if session_id is None:
        session_id = str(uuid.uuid4())
        yield _sse({"type": "session", "content": {"session_id": session_id}})
    else:
        yield _sse({"type": "session", "content": {"session_id": session_id}})

    chat_history = chat_history or []
    messages = list(chat_history)

    if memory_context:
        messages.append(SystemMessage(content=f"以下是之前的对话记忆：\n{memory_context}"))

    messages.append(HumanMessage(content=user_message))

    try:
        async for event in agent_graph.astream_events(
            {"messages": messages},
            version="v2",
        ):
            kind = event["event"]

            if kind == "on_chat_model_stream":
                chunk = event["data"]["chunk"]
                if chunk.content:
                    yield _sse({"type": "text", "content": chunk.content})

            elif kind == "on_tool_start":
                name = event.get("name", "")
                tool_input = event["data"].get("input", {})
                yield _sse({"type": "tool_start", "content": {"tool": name, "args": tool_input}})

            elif kind == "on_tool_end":
                name = event.get("name", "")
                output = event["data"].get("output", "")
                yield _sse({"type": "tool_end", "content": {"tool": name, "result": str(output)}})

    except Exception as e:
        yield _sse({"type": "error", "content": {"message": str(e)}})

    yield _sse({"type": "done", "content": None})


def _sse(data: dict) -> str:
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"
