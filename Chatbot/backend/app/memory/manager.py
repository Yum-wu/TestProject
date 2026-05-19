import asyncio
import logging
import time
from pathlib import Path

from app.memory import l0_conversation
from app.memory import l1_atom
from app.memory import l2_scenario
from app.memory import l3_persona
from app.memory import offload
from app.config import settings

logger = logging.getLogger(__name__)

# ── Constants ──
_INACTIVE_TIMEOUT = 30 * 60        # 30 minutes → auto-finalize
_CLEANUP_INTERVAL = 5 * 60         # check every 5 minutes


class MemoryManager:
    def __init__(self):
        self._sessions: dict[str, dict] = {}
        self._scenario_task: asyncio.Task | None = None

    # ── Session lifecycle ──

    def touch_session(self, session_id: str):
        """Mark a session as recently active (called on each message)."""
        if session_id not in self._sessions:
            self._sessions[session_id] = {"created_at": time.time()}
        self._sessions[session_id]["last_active"] = time.time()

    def get_active_sessions(self) -> list[str]:
        return list(self._sessions.keys())

    def clear_session(self, session_id: str):
        self._sessions.pop(session_id, None)
        logger.info(f"Session cleared: {session_id}")

    # ── Context ──

    def get_context(self, session_id: str) -> str:
        parts = []
        persona = l3_persona.get_persona()
        if persona:
            parts.append(persona)
        scenarios = l2_scenario.get_recent_scenarios(session_id, n=3)
        if scenarios:
            parts.extend(scenarios)
        return "\n".join(parts)

    # ── Message recording ──

    def record_message(self, session_id: str, role: str, content: str, tokens: int = 0,
                       tool_name: str | None = None, tool_args: str | None = None):
        l0_conversation.record_message(session_id, role, content, tokens, tool_name, tool_args)
        l0_conversation.cleanup_oldest(session_id)
        self.touch_session(session_id)

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

    # ── Scenario / Persona ──

    def finalize_scenario(self, session_id: str, summary: str = ""):
        l2_scenario.finalize_scenario(session_id, summary=summary)
        l3_persona.update_persona(session_id)

    # ── Offload ──

    def offload_if_needed(self, tool_name: str, content: str, session_id: str) -> str:
        return offload.offload_if_needed(tool_name, content, session_id)

    def read_ref(self, ref_path: str) -> str:
        return offload.read_ref(ref_path)

    # ── Background tasks ──

    def init_background_tasks(self):
        """Start the periodic inactivity-checker task."""
        if self._scenario_task is not None:
            return
        self._scenario_task = asyncio.create_task(self._periodic_cleanup())
        logger.info("Background scenario cleanup task started")

    def flush_all_scenarios(self):
        """Finalize scenarios for all active sessions (called on shutdown)."""
        for sid in list(self._sessions.keys()):
            try:
                self.finalize_scenario(sid, summary="会话因服务关闭而结束")
                logger.info(f"Flushed scenario for session {sid}")
            except Exception as e:
                logger.error(f"Failed to flush scenario for session {sid}: {e}")

    async def _periodic_cleanup(self):
        """Periodically check for inactive sessions and auto-finalize."""
        while True:
            try:
                await asyncio.sleep(_CLEANUP_INTERVAL)
                now = time.time()
                for sid in list(self._sessions.keys()):
                    last_active = self._sessions[sid].get("last_active", 0)
                    idle_seconds = now - last_active
                    if idle_seconds > _INACTIVE_TIMEOUT:
                        logger.info(f"Auto-finalizing inactive session {sid} (idle={idle_seconds:.0f}s)")
                        try:
                            self.finalize_scenario(sid, summary="会话因超时而结束")
                        except Exception as e:
                            logger.error(f"Auto-finalize failed for {sid}: {e}")
                        self._sessions.pop(sid, None)
            except asyncio.CancelledError:
                logger.info("Background cleanup task cancelled")
                break
            except Exception as e:
                logger.error(f"Periodic cleanup error: {e}")


manager = MemoryManager()
