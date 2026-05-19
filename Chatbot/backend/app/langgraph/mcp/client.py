"""MCP Client — 调用其他 MCP Server"""

import logging
import requests
from typing import Optional

logger = logging.getLogger(__name__)


class MCPClient:
    """MCP client for calling remote MCP servers.

    Supports both local (in-process) and remote (HTTP) MCP servers.
    """

    def __init__(self, remote_url: Optional[str] = None):
        self.remote_url = remote_url

    def call_tool(self, tool_name: str, args: dict = None) -> dict:
        """Call an MCP tool, either locally or remotely."""
        if self.remote_url:
            return self._call_remote(tool_name, args or {})
        return self._call_local(tool_name, args or {})

    def _call_local(self, tool_name: str, args: dict) -> dict:
        """Call a locally registered MCP tool."""
        from app.langgraph.mcp import call_tool as local_call
        return local_call(tool_name, args)

    def _call_remote(self, tool_name: str, args: dict) -> dict:
        """Call a remote MCP server via HTTP."""
        try:
            resp = requests.post(
                f"{self.remote_url}/mcp/{tool_name}",
                json=args,
                timeout=30,
            )
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            logger.error(f"MCP remote call failed: {e}")
            return {"error": str(e)}
