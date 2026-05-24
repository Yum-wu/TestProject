"""Multi-Agent Article Generator — Crew Orchestration with SSE support (crewai 0.80+)"""

import logging
import time
import re
from typing import Callable
from crewai import Crew, Process
from app.crew.agents import create_researcher, create_writer, create_editor
from app.crew.tasks import create_research_task, create_write_task, create_review_task
from app.utils.lang_detect import detect_language

logger = logging.getLogger(__name__)


def _clean_detail(text: str, max_len: int = 200) -> str:
    """Clean raw agent output for display — strip AgentFinish / parse-fail noise."""
    if not text:
        return "Processing..."
    # Strip langchain AgentFinish wrapper
    text = re.sub(r"AgentFinish\([^)]*output='?", "", text)
    text = re.sub(r"AgentAction\([^)]*", "", text)
    # Strip trailing single-quote from AgentFinish regex artifacts
    text = text.rstrip("')")
    return text.strip()[:max_len] or "Processing..."


def _make_task_callback(event_callback: Callable | None, agent_role: str):
    """Create a task-level callback that knows the agent role."""
    if not event_callback:
        return None

    def callback(output):
        try:
            if isinstance(output, str):
                text = output
            elif hasattr(output, "raw"):
                text = output.raw or ""
            else:
                text = str(output)
            event_callback("agent_action", {
                "agent": agent_role,
                "detail": _clean_detail(text),
            })
        except Exception:
            logger.debug("Task callback failed", exc_info=True)

    return callback


def generate_article(topic: str, event_callback: Callable | None = None, lang: str | None = None) -> dict:
    """Run the full crew pipeline for a given topic.

    crewai 0.80+ supports kickoff(inputs=...) and context parameter
    for passing task outputs between dependent tasks.
    """
    if lang is None:
        lang = detect_language(topic)

    researcher = create_researcher(lang=lang)
    writer = create_writer(lang=lang)
    editor = create_editor(lang=lang)

    research_task = create_research_task(researcher, lang=lang)
    write_task = create_write_task(writer, research_task, lang=lang)
    review_task = create_review_task(editor, write_task, lang=lang)

    # Attach per-task callbacks so we know the agent role
    research_task.callback = _make_task_callback(event_callback, researcher.role)
    write_task.callback = _make_task_callback(event_callback, writer.role)
    review_task.callback = _make_task_callback(event_callback, editor.role)

    crew = Crew(
        agents=[researcher, writer, editor],
        tasks=[research_task, write_task, review_task],
        process=Process.sequential,
        verbose=True,
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
