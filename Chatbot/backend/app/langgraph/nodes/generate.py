"""
生成节点。
汇总所有中间结果，生成最终回答。
"""

from app.utils.lang_detect import detect_language, lang_instruction


GENERATE_PROMPT = """你是 AI 助手。根据以下信息生成最终回答。

意图：{intent}

{rag_section}
{agent_section}

{lang_instruction}

请给出完整、准确的回答。如有引用来源，在末尾标注。
"""


def run_generate_node(
    query: str,
    intent: str,
    rag_context: str = "",
    rag_sources: list = None,
    agent_result: str = "",
    llm_call_fn = None,
) -> str:
    """Generate final answer from all intermediate results."""
    lang = detect_language(query)
    lang_instr = lang_instruction(lang).strip()

    rag_section = ""
    if rag_context:
        rag_sources_text = ""
        if rag_sources:
            src_list = ", ".join([s.get("title", "") for s in rag_sources])
            rag_sources_text = f"\n来源：{src_list}"
        rag_section = f"知识库检索结果：\n{rag_context}{rag_sources_text}"

    agent_section = ""
    if agent_result:
        agent_section = f"工具调用结果：\n{agent_result}"

    if not rag_section and not agent_section:
        # Direct LLM response for chat intent
        sys_prompt = f"你是一个友好的 AI 助手。{lang_instr}"
        if llm_call_fn:
            return llm_call_fn([
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": query},
            ])
        return query

    prompt = GENERATE_PROMPT.format(
        intent=intent,
        rag_section=rag_section,
        agent_section=agent_section,
        lang_instruction=lang_instr,
    )

    if llm_call_fn:
        return llm_call_fn([
            {"role": "system", "content": prompt},
            {"role": "user", "content": query},
        ])

    # Fallback
    parts = [query, f"\n\n[{lang_instr}]"]
    if rag_context:
        parts.append(f"\n\n[知识库]\n{rag_context}")
    if agent_result:
        parts.append(f"\n\n[工具结果]\n{agent_result}")
    return "\n".join(parts)
