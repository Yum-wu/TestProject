from pathlib import Path
from langchain.tools import tool

REFS_DIR = Path("offloads/refs").resolve()


@tool
def read_ref(ref_path: str) -> str:
    """读取已保存到外存文件的完整内容，或列出可用文件列表。当需要查看引用的文档内容、技术文档、项目说明、之前卸载的搜索结果或工具输出时使用。
    输入: 文件名。传 "list" 查看所有可用文件列表。
    典型场景: 用户问"查看项目架构文档"、"看看技术设计"、"读一下README"、"之前保存了什么"等。
    """
    if ref_path.strip().lower() == "list":
        files = sorted(REFS_DIR.iterdir()) if REFS_DIR.exists() else []
        if not files:
            return "尚无已保存的引用文件。"
        lines = [f"可用文件 ({len(files)}):"] + [f.name for f in files]
        return "\n".join(lines)
    target = (REFS_DIR / ref_path).resolve()
    if not str(target).startswith(str(REFS_DIR)):
        return "Error: invalid file reference (path traversal blocked)"
    if not target.exists():
        return f"Error: file not found: {ref_path}"
    try:
        return target.read_text(encoding="utf-8")
    except Exception as e:
        return f"Error reading file: {e}"
