"""Multi-Agent Article Generator — Crew Orchestration with SSE support (crewai 0.80+)"""

import logging
import time
from typing import Callable
from crewai import Crew, Process
from app.crew.agents import create_researcher, create_writer, create_editor
from app.crew.tasks import create_research_task, create_write_task, create_review_task

logger = logging.getLogger(__name__)


def generate_article(topic: str, event_callback: Callable | None = None) -> dict:
    """Run the full crew pipeline for a given topic.

    crewai 0.80+ supports kickoff(inputs=...) and context parameter
    for passing task outputs between dependent tasks.
    """
    researcher = create_researcher()
    writer = create_writer()
    editor = create_editor()

    research_task = create_research_task(researcher)
    write_task = create_write_task(writer, research_task)
    review_task = create_review_task(editor, write_task)

    def on_step(output):
        """Crew-level step_callback receives TaskOutput objects."""
        if not event_callback:
            return
        try:
            agent_role = "unknown"
            agent = getattr(output, "agent", None)
            if agent is not None:
                agent_role = getattr(agent, "role", None) or str(agent)
            text = output.raw[:200] if hasattr(output, "raw") else str(output)[:200]
            event_callback("agent_action", {"agent": agent_role, "detail": text})
        except Exception:
            logger.debug("Step callback failed", exc_info=True)

    crew = Crew(
        agents=[researcher, writer, editor],
        tasks=[research_task, write_task, review_task],
        process=Process.sequential,
        verbose=True,
        step_callback=on_step if event_callback else None,
    )

    start = time.time()

    try:
        result = crew.kickoff(inputs={"topic": topic})
    except Exception as e:
        raise RuntimeError(f"Crew execution failed: {e}")

    duration_ms = int((time.time() - start) * 1000)

    # crewai 0.80+: crew.kickoff() returns CrewOutput with .raw property
    final_output = result.raw if hasattr(result, "raw") else str(result)

    return {
        "topic": topic,
        "final_output": final_output,
        "duration_ms": duration_ms,
        "agents": [researcher.role, writer.role, editor.role],
    }
