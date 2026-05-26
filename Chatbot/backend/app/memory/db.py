import sqlite3
import threading
from pathlib import Path

DB_DIR = Path("offloads")
DB_PATH = DB_DIR / "memory.db"

# ── Global connection pool (singleton, WAL mode, thread-safe) ──
_conn: sqlite3.Connection | None = None
_conn_lock = threading.Lock()


def get_db():
    """Get shared SQLite connection (created once, reused)."""
    global _conn
    if _conn is None:
        with _conn_lock:
            if _conn is None:  # double-check
                DB_DIR.mkdir(parents=True, exist_ok=True)
                _conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
                _conn.row_factory = sqlite3.Row
                _conn.execute("PRAGMA journal_mode=WAL")
                _conn.execute("PRAGMA busy_timeout=5000")
    return _conn


def init_db():
    """Create tables if they don't exist."""
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            tokens INTEGER DEFAULT 0,
            tool_name TEXT,
            tool_args TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS atoms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            subject TEXT NOT NULL,
            predicate TEXT NOT NULL,
            object TEXT NOT NULL,
            source_ref INTEGER,
            confidence REAL DEFAULT 0.5,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_conv_session ON conversations(session_id);
        CREATE INDEX IF NOT EXISTS idx_atom_session ON atoms(session_id);
    """)
    conn.commit()
