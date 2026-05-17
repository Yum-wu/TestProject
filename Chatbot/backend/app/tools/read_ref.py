from pathlib import Path
from langchain.tools import tool

REFS_DIR = Path("offloads/refs").resolve()


@tool
def read_ref(ref_path: str) -> str:
    """读取已保存到外存文件的完整内容。当需要查看之前卸载的搜索结果或工具输出时使用。
    输入: 文件名，如 "abc123_websearch_20260517T1200.md"
    """
    target = (REFS_DIR / ref_path).resolve()
    if not str(target).startswith(str(REFS_DIR)):
        return "Error: invalid file reference (path traversal blocked)"
    if not target.exists():
        return f"Error: file not found: {ref_path}"
    try:
        return target.read_text(encoding="utf-8")
    except Exception as e:
        return f"Error reading file: {e}"
