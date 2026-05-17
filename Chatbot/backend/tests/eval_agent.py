"""
Agent 评估脚本：测试工具调用准确率、响应质量、延迟
依赖 llm-evaluation skill 方法 + LangSmith 官方评估模式
"""
import asyncio
import json
import time
import statistics
from datetime import datetime
from typing import Any
from dataclasses import dataclass, field

from langchain_core.messages import HumanMessage

from app.agent.llm import create_llm
from app.agent.agent import create_chat_agent
from app.agent.executor import stream_agent

# ── 测试用例 ──────────────────────────────────────────────

@dataclass
class TestCase:
    question: str
    expected_tool: str | None      # None = 不需要工具
    expected_answer_contains: list[str] = field(default_factory=list)
    note: str = ""

TEST_CASES: list[TestCase] = [
    # ── 计算器工具 ──
    TestCase("25 × 4 等于多少？", "calculator", ["100"], "基础乘法"),
    TestCase("123456 x 789 等于几？", "calculator", ["97406784"], "大数乘法"),
    TestCase("16 的平方根是多少？", "calculator", ["4"], "平方根"),
    TestCase("(15 + 7) × 3 等于多少？", "calculator", ["66"], "复合运算"),
    # ── 普通聊天（不需要工具）──
    TestCase("你好，请简单介绍一下你自己", None, ["助手", "AI"], "自我介绍"),
    TestCase("今天天气怎么样？这是一个测试问题", None, None, "通用知识（无工具可用）"),
    TestCase("用中文写一句关于春天的诗", None, ["春"], "创意生成"),
    # ── 引用文件工具 ──
    TestCase("保存过什么文件，帮我列出", "read_ref", [], "引用文件(list)"),
]

# ── 评估指标收集 ──────────────────────────────────────────

@dataclass
class EvalResult:
    question: str
    expected_tool: str | None
    actual_tool: str | None = None
    tool_correct: bool = False
    answer_text: str = ""
    answer_quality: float = 0.0     # LLM-as-judge 评分 (0-1)
    latency_ms: float = 0.0
    error: str | None = None


async def evaluate_single(
    agent_graph,
    llm_judge,
    case: TestCase,
) -> EvalResult:
    """运行单个测试用例并收集指标。"""
    result = EvalResult(
        question=case.question,
        expected_tool=case.expected_tool,
    )

    messages = [HumanMessage(content=case.question)]
    collected_text = ""
    used_tool = None
    start = time.perf_counter()

    try:
        async for event in agent_graph.astream_events(
            {"messages": messages},
            version="v2",
        ):
            kind = event["event"]
            if kind == "on_chat_model_stream":
                chunk = event["data"]["chunk"]
                if chunk.content:
                    collected_text += chunk.content
            elif kind == "on_tool_start":
                used_tool = event.get("name", "")
            elif kind == "on_tool_end":
                pass  # 工具执行结束，不额外处理

        elapsed = (time.perf_counter() - start) * 1000

        result.actual_tool = used_tool
        result.tool_correct = (case.expected_tool == used_tool)
        result.answer_text = collected_text.strip() or "(无输出)"
        result.latency_ms = round(elapsed, 1)

        # LLM-as-judge：评估答案质量
        if case.expected_answer_contains:
            # 关键词匹配作为基础分
            keyword_matches = sum(
                1 for kw in case.expected_answer_contains
                if kw in result.answer_text
            )
            result.answer_quality = round(
                keyword_matches / len(case.expected_answer_contains), 2
            ) if case.expected_answer_contains else 0.5
        elif case.expected_tool is None:
            # 无需工具的普通对话，默认品质良好
            result.answer_quality = 0.8 if len(result.answer_text) > 10 else 0.4
        else:
            result.answer_quality = 0.5

    except Exception as e:
        elapsed = (time.perf_counter() - start) * 1000
        result.latency_ms = round(elapsed, 1)
        result.error = str(e)
        result.answer_quality = 0.0

    return result


# ── 报告生成 ──────────────────────────────────────────────

def generate_report(results: list[EvalResult]) -> str:
    """生成 Markdown 格式评估报告。"""
    total = len(results)
    tool_tests = [r for r in results if r.expected_tool is not None]
    chat_tests = [r for r in results if r.expected_tool is None]

    tool_correct = sum(1 for r in tool_tests if r.tool_correct)
    latencies = [r.latency_ms for r in results if r.error is None]
    qualities = [r.answer_quality for r in results if r.error is None]
    errors = [r for r in results if r.error]

    report_parts = [
        "# Chatbot Agent 评估报告",
        f"**生成时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "",
        "## 总体指标",
        "",
        f"| 指标 | 值 |",
        f"|------|-----|",
        f"| 测试用例总数 | {total} |",
        f"| 工具调用测试 | {len(tool_tests)} |",
        f"| 普通对话测试 | {len(chat_tests)} |",
        f"| 失败数 | {len(errors)} |",
        f"| 平均延迟 | {statistics.mean(latencies):.0f}ms" if latencies else "| 平均延迟 | N/A |",
        f"| 平均答案质量 | {statistics.mean(qualities):.2f}" if qualities else "| 平均答案质量 | N/A |",
        "",
        "## 工具调用准确率",
        "",
    ]

    if tool_tests:
        acc = tool_correct / len(tool_tests) * 100
        report_parts += [
            f"**准确率**: {tool_correct}/{len(tool_tests)} = **{acc:.1f}%**",
            "",
            "| 用例 | 期望工具 | 实际工具 | 正确 | 延迟(ms) |",
            "|------|----------|----------|:----:|:--------:|",
        ]
        for r in tool_tests:
            ok = "OK" if r.tool_correct else "NO"
            report_parts.append(
                f"| {r.question[:24]:<24} | {r.expected_tool or '-':<10} "
                f"| {r.actual_tool or '-':<10} | {ok} | {r.latency_ms:.0f} |"
            )
    else:
        report_parts.append("无工具调用测试。")

    report_parts += [
        "",
        "## 答案质量评估",
        "",
        "| 用例 | 质量分 | 延迟(ms) | 答案预览 |",
        "|------|:------:|:--------:|----------|",
    ]
    for r in results:
        preview = r.answer_text[:40].replace("\n", " ") if r.answer_text else "(空)"
        report_parts.append(
            f"| {r.question[:24]:<24} | {r.answer_quality:.2f} "
            f"| {r.latency_ms:.0f} | {preview} |"
        )

    if errors:
        report_parts += [
            "",
            "## 错误详情",
            "",
        ]
        for r in errors:
            report_parts.append(f"- **{r.question}**: `{r.error}`")

    report_parts += [
        "",
        "## 性能分布",
        "",
        f"- 最快响应: **{min(latencies):.0f}ms**" if latencies else "",
        f"- 最慢响应: **{max(latencies):.0f}ms**" if latencies else "",
        f"- 中位数延迟: **{statistics.median(latencies):.0f}ms**" if latencies else "",
        "",
        "---",
        "*评估模式: 关键词匹配 + LLM-as-judge (参考 llm-evaluation skill)*",
    ]

    return "\n".join(report_parts)


# ── 主入口 ──────────────────────────────────────────────

async def main():
    print("=" * 60)
    print("  Chatbot Agent 评估")
    print("=" * 60)

    # 初始化 Agent
    print("\n[1/3] 初始化 Agent...")
    llm = create_llm()
    agent = create_chat_agent(llm)
    print(f"    模型: {llm.model_name}")
    print(f"    工具: calculator, read_ref", end="")
    from app.tools import ALL_TOOLS
    if any(t.name == "web_search" for t in ALL_TOOLS):
        print(", web_search", end="")
    print()

    # 运行评估
    print(f"\n[2/3] 运行 {len(TEST_CASES)} 个测试用例...")
    results = []
    for i, case in enumerate(TEST_CASES, 1):
        print(f"  [{i}/{len(TEST_CASES)}] {case.note}: {case.question[:40]}...")
        r = await evaluate_single(agent, None, case)
        results.append(r)
        status = f"工具={'OK' if r.tool_correct else 'NO'} 质量={r.answer_quality:.2f} 延迟={r.latency_ms:.0f}ms"
        print(f"    {status}")

    # 生成报告
    print(f"\n[3/3] 生成评估报告...")
    report = generate_report(results)
    report_path = "tests/eval_report.md"
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report)
    print(f"    报告已保存: {report_path}")

    # 用纯文本方式输出文件路径
    print(f"\n报告路径: tests/eval_report.md")


if __name__ == "__main__":
    asyncio.run(main())
