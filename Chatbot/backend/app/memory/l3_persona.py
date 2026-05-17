import logging
from pathlib import Path
from app.memory import l2_scenario

logger = logging.getLogger(__name__)

PERSONA_PATH = Path("offloads/persona.md").resolve()
PERSONA_MAX_SIZE = 2048  # 2KB


def update_persona(session_id: str):
    """Update L3 persona from recent scenarios and atoms."""
    scenarios = l2_scenario.get_recent_scenarios(session_id, n=10)
    if not scenarios:
        return

    lines = ["# Persona\n"]
    lines.append("## Recent Activity\n")
    for s in scenarios[:5]:
        for line in s.split("\n"):
            if line.startswith("## Summary") or line.startswith("- "):
                stripped = line.lstrip("#- ")
                if stripped and len(stripped) > 3:
                    lines.append(f"- {stripped}")
                    break

    content = "\n".join(lines)
    if len(content.encode("utf-8")) > PERSONA_MAX_SIZE:
        content = content.encode("utf-8")[:PERSONA_MAX_SIZE].decode("utf-8", errors="ignore")

    try:
        PERSONA_PATH.parent.mkdir(parents=True, exist_ok=True)
        PERSONA_PATH.write_text(content, encoding="utf-8")
        logger.info(f"L3 persona updated ({len(content)} chars)")
    except Exception as e:
        logger.error(f"L3 persona update failed: {e}")


def get_persona() -> str:
    """Return current persona content."""
    if PERSONA_PATH.exists():
        return PERSONA_PATH.read_text(encoding="utf-8")
    return ""
