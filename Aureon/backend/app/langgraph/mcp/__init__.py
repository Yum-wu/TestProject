"""MCP 协议实现 — 轻量版，遵循 MCP 设计模式"""

MCP_TOOLS = {}


def register_tool(name: str, description: str = ""):
    """Register a tool in the MCP registry. Used as @register_tool(name, desc)."""
    def decorator(fn):
        MCP_TOOLS[name] = {
            "name": name,
            "description": description or fn.__doc__ or "",
            "fn": fn,
        }
        return fn
    return decorator


def get_tool(name: str):
    """Get a registered tool by name."""
    return MCP_TOOLS.get(name)


def list_tools() -> list:
    """List all registered MCP tools."""
    return [
        {"name": t["name"], "description": t["description"]}
        for t in MCP_TOOLS.values()
    ]


def call_tool(name: str, args: dict = None) -> dict:
    """Call an MCP tool with arguments."""
    tool = get_tool(name)
    if not tool:
        return {"error": f"Tool '{name}' not found"}
    try:
        result = tool["fn"](**(args or {}))
        return {"result": result}
    except Exception as e:
        return {"error": str(e)}


class MCPRegistry:
    """MCP 工具注册中心 — 面向对象封装，兼容 graph.py 调用"""

    def __init__(self):
        self._tools = {}

    def register(self, name: str, description: str, fn):
        self._tools[name] = {"name": name, "description": description, "fn": fn}

    def get(self, name: str):
        return self._tools.get(name)

    def list(self) -> list:
        return [{"name": t["name"], "description": t["description"]} for t in self._tools.values()]

    def call(self, name: str, args: dict = None) -> dict:
        tool = self.get(name)
        if not tool:
            return {"error": f"Tool '{name}' not found"}
        try:
            result = tool["fn"](**(args or {}))
            return {"result": result}
        except Exception as e:
            return {"error": str(e)}
