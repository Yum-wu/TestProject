"""Event collector for CrewAI SSE streaming."""

import asyncio
import json
from typing import AsyncGenerator


class EventCollector:
    """Collects crew events and makes them available via async generator."""

    def __init__(self):
        self.events: asyncio.Queue[dict | None] = asyncio.Queue()

    def emit(self, event_type: str, data: dict):
        self.events.put_nowait({"type": event_type, **data})

    def close(self):
        self.events.put_nowait(None)

    async def stream(self) -> AsyncGenerator[str, None]:
        while True:
            event = await self.events.get()
            if event is None:
                break
            yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
        yield 'data: {"type": "done"}\n\n'
