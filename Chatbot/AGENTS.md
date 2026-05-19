# AI 聊天助手 — Agent 升级版开发指令

## 项目概述

AI 聊天助手，**Python FastAPI 后端 + React 前端的 Agent 架构**：
- 后端：Python FastAPI + LangChain Agent（Tool Calling + 四层记忆系统）
- 前端：React 19 + TypeScript + Vite + Tailwind CSS 4

## 项目结构约定

```
Chatbot/
├── backend/
│   ├── app/
│   │   ├── agent/       # LLM 工厂、Agent 工厂、流式执行器
│   │   ├── tools/       # @tool 装饰器定义，统一在 __init__.py 注册
│   │   ├── memory/      # L0-L3 四层记忆 + 上下文卸载
│   │   ├── rag/         # RAG 知识库（ChromaDB + Zhipu Embedding + MMR）
│   │   ├── langgraph/   # LangGraph 工作流引擎 + MCP 注册中心
│   │   ├── api/         # Pydantic 模型
│   │   ├── config.py    # pydantic_settings 加载 .env
│   │   └── main.py      # FastAPI 应用入口
│   ├── offloads/        # 记忆外存文件（自动生成）
│   ├── tests/           # pytest 测试（test_agent, test_tools, test_memory, test_rag, test_langgraph, test_manager, test_api）
│   ├── requirements.txt
│   └── .env             # LLM_API_KEY, LLM_MODEL, LLM_BASE_URL, TAVILY_API_KEY
├── src/                 # React 前端
│   ├── components/      # UI 组件
│   ├── hooks/           # useChat（状态管理）
│   ├── services/        # api.ts（后端通信）、storage.ts（LocalStorage）
│   └── types/           # Message 类型
├── rag-ui/              # RAG 搜索独立前端（React + Vite + Tailwind）
└── openspec/            # OpenSpec 规格文档
```

## 后端开发规范

- 所有 Python 代码遵循 `AGENTS.md` 的「脚本语言代码最佳实践」
- 工具定义用 `@tool` 装饰器 + 类型注解 + docstring（作为 LLM 的 tool description）
- 工具在 `app/tools/__init__.py` 统一注册到 `ALL_TOOLS`，有新 Key 条件注册
- Agent 工厂：`from langchain.agents import create_agent`（LangChain v1.x API，非 v0.3）
- 记忆模块请遵循 delta-memory.md 的四层架构
- SSE 事件格式见 delta-api.md，前后端严格对齐
- 测试放在 `tests/`，用 pytest + pytest-asyncio
- API Key 仅存后端 `.env`，前端不携带

## 前端开发规范

- 使用 TypeScript，确保类型安全
- 使用 Tailwind CSS 编写样式
- API Key 从后端读取（已迁移），前端代码不含 Key
- 流式输出通过 SSE 接收，事件类型：session/text/tool_start/tool_end/done/error

## 构建与运行

```bash
# 后端
cd Chatbot/backend && pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 前端
cd Chatbot && npm install && npm run dev

# 测试（需要先启动 venv）
cd Chatbot/backend && source .venv/bin/activate 2>/dev/null && python -m pytest tests/ -v
```

## 记忆系统概要

| 层级 | 存储 | 职责 |
|------|------|------|
| L0 | SQLite conversations 表 | 原始对话记录 |
| L1 | SQLite atoms 表 | 原子事实三元组 |
| L2 | offloads/scenarios/*.md | 场景总结 Markdown |
| L3 | offloads/persona.md | 用户画像 (≤2KB) |
| 上下文卸载 | offloads/refs/*.md | 长工具输出外存 |


## 脚本语言代码最佳实践（2026.05 更新）

### Python 通用
- **类型注解**：所有公开函数必须完整标注参数类型和返回类型 (`def foo(x: int) -> str:`)
- **Pydantic v2**：用 `pydantic_settings.BaseSettings` 加载配置，字段必须有默认值避免启动崩溃
- **异步优先**：FastAPI 端点用 `async def`，I/O 操作用 `asyncio`，避免同步阻塞 event loop
- **资源管理**：数据库连接用 context manager (`with get_db() as conn:`)，文件操作用 `aiofiles`
- **异常处理**：不写裸 `except:`，不写空 `except` 块。至少 `logger.exception()` + 返回错误信息
- **路径安全**：文件引用必须 `.resolve()` 后做前缀检查，防 path traversal (`../../etc/passwd`)
- **日志**：用 `logging.getLogger(__name__)` 而非 `print`，关键节点（工具调用、记忆写入）必须写日志


### LangChain 1.x (当前使用)
- **Agent 工厂**：`create_agent(model, tools, system_prompt)` 返回 `CompiledStateGraph`
- **输入格式**：`{"messages": [HumanMessage(content=...)]}`，不再用 `{"input": ..., "chat_history": ...}`
- **流式事件**：`graph.astream_events({"messages": messages}, version="v2")` 获取事件
- **已废弃**：`create_tool_calling_agent`、`AgentExecutor`、`ChatPromptTemplate` + `agent_scratchpad`
- **工具定义**：`@tool` 装饰器 + docstring + 类型注解，与 0.3 相同
### 安全
- **eval 沙箱**：计算器工具用 `ast.parse` + 白名单运算符，禁止 `__import__`/`exec`/`compile`
- **SSE 输出**：所有用户可见文本必须 `json.dumps(..., ensure_ascii=False)` 防编码问题
- **条件注册**：依赖 API Key 的工具（web_search），Key 缺失时不注册，不暴露配置状态
