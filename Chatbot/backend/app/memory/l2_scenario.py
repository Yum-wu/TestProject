import logging
from pathlib import Path
from datetime import datetime
from app.memory import l1_atom

logger = logging.getLogger(__name__)

SCENARIOS_DIR = Path("offloads/scenarios").resolve()
MAX_SCENARIOS = 50


def finalize_scenario(session_id: str, summary: str = ""):
    """Generate and save a L2 scenario markdown file."""
    SCENARIOS_DIR.mkdir(parents=True, exist_ok=True)
    date_str = datetime.now().strftime("%Y%m%d")
    filename = f"{session_id}_{date_str}.md"
    filepath = SCENARIOS_DIR / filename

    atoms = l1_atom.get_atoms_by_session(session_id)
    atom_lines = "\n".join(
        f"- {a['subject']} {a['predicate']} {a['object']} (confidence: {a['confidence']})"
        for a in atoms[:20]
    )

    content = f"""# Scenario

**Session:** {session_id} | **Date:** {date_str}

## Summary
{summary or "会话已结束"}

## Key Facts (L1)
{atom_lines or "无"}
"""

    try:
        filepath.write_text(content, encoding="utf-8")
        logger.info(f"L2 scenario saved: {filename}")
    except Exception as e:
        logger.error(f"L2 save failed: {e}")

    _cleanup_old_scenarios()


def get_recent_scenarios(session_id: str = "", n: int = 3):
    """Return content of recent N scenario files."""
    if not SCENARIOS_DIR.exists():
        return []
    files = sorted(SCENARIOS_DIR.glob("*.md"), key=lambda p: p.stat().st_mtime, reverse=True)
    results = []
    for fp in files[:n]:
        try:
            results.append(fp.read_text(encoding="utf-8"))
        except Exception:
            pass
    return results


def _cleanup_old_scenarios():
    """Keep only the most recent MAX_SCENARIOS files."""
    if not SCENARIOS_DIR.exists():
        return
    files = sorted(SCENARIOS_DIR.glob("*.md"), key=lambda p: p.stat().st_mtime)
    excess = len(files) - MAX_SCENARIOS
    for fp in files[:excess]:
        try:
            fp.unlink()
            logger.debug(f"Removed old scenario: {fp.name}")
        except Exception:
            pass
