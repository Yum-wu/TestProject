import logging
from app.memory.db import get_db

logger = logging.getLogger(__name__)


def save_atom(
    session_id: str,
    subject: str,
    predicate: str,
    obj: str,
    source_ref: int | None = None,
    confidence: float = 0.5,
):
    """Save a single atomic fact to L1 table."""
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO atoms (session_id, subject, predicate, object, source_ref, confidence) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (session_id, subject, predicate, obj, source_ref, confidence),
        )
        conn.commit()
        logger.debug(f"L1 atom: {subject} {predicate} {obj}")
    finally:
        conn.close()


def search_atoms(session_id: str, query: str, limit: int = 10):
    """Search atoms by subject/predicate/object."""
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT * FROM atoms WHERE session_id = ? "
            "AND (subject LIKE ? OR predicate LIKE ? OR object LIKE ?) "
            "ORDER BY confidence DESC LIMIT ?",
            (session_id, f"%{query}%", f"%{query}%", f"%{query}%", limit),
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def get_atoms_by_session(session_id: str):
    """Return all atoms for a session."""
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT * FROM atoms WHERE session_id = ? ORDER BY created_at",
            (session_id,),
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()
