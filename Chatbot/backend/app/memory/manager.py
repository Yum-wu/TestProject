import asyncio
import logging
from pathlib import Path

from app.memory import l0_conversation
from app.memory import l1_atom
from app.memory import l2_scenario
from app.memory import l3_persona
from app.memory import offload
from app.config import settings

logger = logging.getLogger(__name__)


class MemoryManager:
    def __init__(self):
        self._sessions: dict[str, dict] = {}
        self._scenario_task: asyncio.Task | None = None

    def get_active_sessions(self) -> list[str]:
        return list(self._sessions.keys())

    def get_context(self, session_id: str) -> str:
        parts = []
        persona = l3_persona.get_persona()
        if persona:
            parts.append(persona)
        scenarios = l2_scenario.get_recent_scenarios(session_id, n=3)
        if scenarios:
            parts.extend(scenarios)
        return "\n".join(parts)

    def record_message(self, session_id: str, role: str, content: str, tokens: int = 0,
                       tool_name: str | None = None, tool_args: str | None = None):
        l0_conversation.record_message(session_id, role, content, tokens, tool_name, tool_args)
        l0_conversation.cleanup_oldest(session_id)

    async def extract_atoms(self, session_id: str):
        messages = l0_conversation.get_conversation(session_id, limit=10)
        if not messages:
            return
        user_msgs = [m for m in messages if m["role"] == "user"]
        if user_msgs:
            last = user_msgs[-1]
            l1_atom.save_atom(
                session_id, subject="user", predicate="said",
                obj=last["content"][:100], source_ref=last["id"], confidence=0.3,
            )

    def finalize_scenario(self, session_id: str):
        l2_scenario.finalize_scenario(session_id)
        l3_persona.update_persona(session_id)

    def offload_if_needed(self, tool_name: str, content: str, session_id: str) -> str:
        return offload.offload_if_needed(tool_name, content, session_id)

    def read_ref(self, ref_path: str) -> str:
        return offload.read_ref(ref_path)

    def clear_session(self, session_id: str):
        self._sessions.pop(session_id, None)
        logger.info(f"Session cleared: {session_id}")

    def init_background_tasks(self):
        pass

    def flush_all_scenarios(self):
        pass


manager = MemoryManager()
