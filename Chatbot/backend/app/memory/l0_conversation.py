import logging
from app.memory.db import get_db
from app.config import settings

logger = logging.getLogger(__name__)


def record_message(
    session_id: str,
    role: str,
    content: str,
    tokens: int = 0,
    tool_name: str | None = None,
    tool_args: str | None = None,
):
    """Write a message to L0 conversations table."""
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO conversations (session_id, role, content, tokens, tool_name, tool_args) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (session_id, role, content, tokens, tool_name, tool_args),
        )
        conn.commit()
        logger.debug(f"L0 record: {session_id} {role} [{tokens}t]")
    finally:
        conn.close()


def get_conversation(session_id: str, limit: int = 50):
    """Return recent N messages for a session."""
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT * FROM conversations WHERE session_id = ? "
            "ORDER BY created_at DESC LIMIT ?",
            (session_id, limit),
        ).fetchall()
        return list(reversed(rows))
    finally:
        conn.close()


def get_message_by_id(conv_id: int):
    """Return a single conversation record by id."""
    conn = get_db()
    try:
        row = conn.execute(
            "SELECT * FROM conversations WHERE id = ?", (conv_id,)
        ).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def cleanup_oldest(session_id: str, max_messages: int | None = None):
    """Remove oldest messages if session exceeds limit."""
    max_messages = max_messages or settings.session_max_messages
    conn = get_db()
    try:
        count = conn.execute(
            "SELECT COUNT(*) FROM conversations WHERE session_id = ?",
            (session_id,),
        ).fetchone()[0]
        if count > max_messages:
            excess = count - max_messages + 50
            conn.execute(
                "DELETE FROM conversations WHERE id IN "
                "(SELECT id FROM conversations WHERE session_id = ? "
                "ORDER BY created_at ASC LIMIT ?)",
                (session_id, excess),
            )
            conn.commit()
            logger.info(f"L0 cleanup: removed {excess} old messages from {session_id}")
    finally:
        conn.close()
