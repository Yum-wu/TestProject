"""Multi-Agent Article Generator — Crew Orchestration with SSE support"""

import logging
import time
from typing import Callable
from crewai import Crew, Process
from app.crew.agents import create_researcher, create_writer, create_editor
from app.crew.tasks import create_research_task, create_write_task, create_review_task

logger = logging.getLogger(__name__)


def generate_article(topic: str, event_callback: Callable | None = None) -> dict:
    """Run the full crew pipeline for a given topic.

    CrewAI 0.11.x doesn't support kickoff(inputs=...).
    Task descriptions are set dynamically before execution.
    """
    researcher = create_researcher()
    writer = create_writer()
    editor = create_editor()

    research_task = create_research_task(researcher)
    write_task = create_write_task(writer)
    review_task = create_review_task(editor)

    research_task.description = research_task.description.replace("{topic}", topic)
    write_task.description = write_task.description.replace("{research_output}", "[Will be filled after research step]")
    review_task.description = review_task.description.replace("{writer_output}", "[Will be filled after writing step]")

    def on_step(step):
        if not event_callback:
            return
        try:
            agent_role = getattr(step, "role", None) or "unknown"
            text = str(step)[:200] if not isinstance(step, str) else step[:200]
            event_callback("agent_action", {"agent": agent_role, "detail": text})
        except Exception:
            logger.debug("Step callback failed", exc_info=True)

    crew = Crew(
        agents=[researcher, writer, editor],
        tasks=[research_task, write_task, review_task],
        process=Process.sequential,
        verbose=True,
    )

    if event_callback:
        for agent in crew.agents:
            agent.step_callback = on_step

    start = time.time()

    try:
        result = crew.kickoff()
    except Exception as e:
        raise RuntimeError(f"Crew execution failed: {e}")

    duration_ms = int((time.time() - start) * 1000)

    return {
        "topic": topic,
        "final_output": str(result),
        "duration_ms": duration_ms,
        "agents": [researcher.role, writer.role, editor.role],
    }
