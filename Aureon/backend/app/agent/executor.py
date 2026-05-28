import json
import logging
import uuid
from typing import AsyncGenerator

from langchain_core.messages import HumanMessage, SystemMessage

logger = logging.getLogger(__name__)


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


async def stream_agent_with_memory(
    agent_graph,
    user_message: str,
    session_id: str = "",
    memory_manager = None,
) -> AsyncGenerator[str, None]:
    """Stream agent response with automatic post-stream memory recording.

    Wraps stream_agent() and intercepts SSE events to:
    1. Track session_id (may change if new)
    2. Collect full assistant response text
    3. On 'done' event: record user + assistant messages to L0,
       then trigger L1 atom extraction asynchronously.

    All parse errors are logged at WARNING level (not silently dropped).
    If full_response is empty after 'done', a warning is emitted.
    """
    sid = session_id
    full_response = ""

    async for event_str in stream_agent(
        agent_graph, user_message, sid,
        memory_context=memory_manager.get_context(sid) if memory_manager else None,
    ):
        yield event_str
        try:
            prefix = "data: "
            if not event_str.startswith(prefix):
                continue
            event = json.loads(event_str[len(prefix):].strip())
            evt_type = event.get("type", "")

            if evt_type == "session":
                sid = event["content"]["session_id"]

            elif evt_type == "text":
                full_response += event.get("content", "")

            elif evt_type == "done" and sid and memory_manager:
                if not full_response.strip():
                    logger.warning(f"Memory: empty assistant response for session {sid}")

                memory_manager.record_message(sid, "user", user_message)
                memory_manager.record_message(sid, "assistant", full_response)
                try:
                    await memory_manager.extract_atoms(sid)
                except Exception as e:
                    logger.warning(f"Atom extraction failed for session {sid}: {e}")

        except json.JSONDecodeError as e:
            logger.warning(f"Memory: SSE JSON parse failed: {e} | raw={event_str[:120]}")
        except KeyError as e:
            logger.warning(f"Memory: missing field in SSE event: {e} | raw={event_str[:120]}")
        except Exception as e:
            logger.warning(f"Memory: unexpected error during recording: {e}")


def _sse(data: dict) -> str:
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"
