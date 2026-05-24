"""Multi-Agent Article Generator — Task Definitions (crewai 0.80+)"""

from crewai import Agent, Task


LANG_INSTRUCTION = {
    "zh": "全部使用中文回答。",
    "en": "Answer entirely in English.",
}


def create_research_task(agent: Agent, lang: str = "zh") -> Task:
    lang_instr = LANG_INSTRUCTION.get(lang, LANG_INSTRUCTION["zh"])
    return Task(
        description=(
            "对用户指定的主题「{topic}」进行深入研究。\n"
            "1. 搜索并收集与该主题相关的信息\n"
            "2. 整理关键发现、核心论点和重要数据\n"
            "3. 识别不同观点和争议点（如有）\n"
            "4. 列出推荐参考资源\n"
            "5. 输出结构化研究简报\n"
            f"语言要求：{lang_instr}"
        ),
        expected_output=(
            "一份结构化的研究简报，包含：\n"
            "- 主题概述（1-2 句话）\n"
            "- 关键发现（3-5 个要点）\n"
            "- 核心数据/事实\n"
            "- 主要观点分析\n"
            "- 参考来源列表"
        ),
        agent=agent,
    )


def create_write_task(agent: Agent, research_task: Task, lang: str = "zh") -> Task:
    lang_instr = LANG_INSTRUCTION.get(lang, LANG_INSTRUCTION["zh"])
    return Task(
        description=(
            "基于研究简报撰写关于「{topic}」的完整文章。\n"
            "1. 确定文章结构和章节划分\n"
            "2. 撰写引人入胜的开头\n"
            "3. 按逻辑顺序展开论述\n"
            "4. 使用具体的例子和数据支撑观点\n"
            "5. 写出有力的总结\n"
            f"语言要求：{lang_instr}"
        ),
        expected_output=(
            "一篇完整的 Markdown 格式文章，包含：\n"
            "- 标题（吸引眼球）\n"
            "- 引言（背景 + 核心问题）\n"
            "- 主体（2-4 个小节，每节有清楚的小标题）\n"
            "- 结论（总结 + 展望）\n"
            "- 全文 1000-2000 字"
        ),
        agent=agent,
        context=[research_task],
    )


def create_review_task(agent: Agent, write_task: Task, lang: str = "zh") -> Task:
    lang_instr = LANG_INSTRUCTION.get(lang, LANG_INSTRUCTION["zh"])
    return Task(
        description=(
            "审阅关于「{topic}」的文章草稿并提供质量评分和改进建议。\n"
            "1. 检查事实准确性\n"
            "2. 评估逻辑连贯性\n"
            "3. 评价语言表达质量\n"
            "4. 检查格式规范性\n"
            "5. 给出 1-10 的总体评分\n"
            "6. 列出 3-5 条具体改进建议\n"
            "7. 输出修订后的最终版本\n"
            f"语言要求：{lang_instr}"
        ),
        expected_output=(
            "审阅报告包含：\n"
            "- 质量评分（1-10 分制）\n"
            "- 评分细则（内容/结构/语言/格式各维度）\n"
            "- 改进建议（3-5 条具体可操作的建议）\n"
            "- 最终修订版文章（Markdown 格式）"
        ),
        agent=agent,
        context=[write_task],
    )
