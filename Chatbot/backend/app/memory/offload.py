import logging
from pathlib import Path
from datetime import datetime
from app.config import settings

logger = logging.getLogger(__name__)

REFS_DIR = Path(__file__).resolve().parent.parent.parent / "offloads" / "refs"


def offload_if_needed(tool_name: str, content: str, session_id: str) -> str:
    """Check if content exceeds threshold, offload if so.

    Returns summary line with result_ref if offloaded, or original content.
    """
    if len(content) <= settings.offload_max_chars:
        return content

    REFS_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%dT%H%M%S")
    filename = f"{session_id}_{tool_name}_{ts}.md"
    filepath = REFS_DIR / filename

    try:
        filepath.write_text(content, encoding="utf-8")
        logger.info(f"Offloaded {tool_name} output ({len(content)} chars) -> {filename}")
    except Exception as e:
        logger.error(f"Offload write failed for {filename}: {e}")
        return content

    # Build summary line
    preview = content[:200].replace("\n", " ")
    return (
        f"[Tool:{tool_name} 完整输出已保存] "
        f"{preview}... "
        f"result_ref: {filename}"
    )


def read_ref(ref_path: str) -> str:
    """Read an offloaded file with path traversal protection."""
    target = (REFS_DIR / ref_path).resolve()
    if not str(target).startswith(str(REFS_DIR)):
        logger.warning(f"Path traversal blocked: {ref_path}")
        return "Error: invalid file reference"
    if not target.exists():
        return f"Error: file not found: {ref_path}"
    try:
        return target.read_text(encoding="utf-8")
    except Exception as e:
        logger.error(f"Read ref failed: {e}")
        return f"Error: {e}"
