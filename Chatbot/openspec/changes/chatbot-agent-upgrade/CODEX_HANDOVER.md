# Chatbot Agent 升级 — Codex 实施提示词

## 项目背景

这是 `TestProject/Chatbot/` 项目，当前是一个**纯前端** React + TypeScript + Vite 项目，直接调智谱 API。

**目标**：升级为 Python FastAPI 后端 + React 前端的 Agent 架构，使用 LangChain 框架实现 Tool Calling 和分层 Memory。

**设计参考**：Memory 分层架构受 TencentDB-Agent-Memory 启发（L0→L3 + 上下文卸载）。

---

## 关键决策

| 决策 | 结论 |
|------|------|
| 架构 | **FastAPI 后端 + React 前端**（保留现有前端 UI） |
| 模型 | 智谱 GLM-4-Flash，OpenAI 兼容接口（LangChain `ChatOpenAI`），改 .env 可切 DeepSeek/混元 |
| Tool Calling | Calculator + Tavily Web Search + read_ref |
| Memory | 4 层分层架构（L0→L3）+ 上下文卸载 |
| 部署 | 本地开发，FastAPI dev server + React dev server 分别启动 |

---

## 项目结构（目标）

```
Chatbot/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI 入口
│   │   ├── config.py            # .env 配置加载
│   │   ├── agent/
│   │   │   ├── __init__.py
│   │   │   ├── llm.py           # LLM 工厂 (ChatOpenAI)
│   │   │   ├── agent.py         # Agent 工厂
│   │   │   └── executor.py      # Agent 执行器 (streaming)
│   │   ├── tools/
│   │   │   ├── __init__.py      # ALL_TOOLS 注册
│   │   │   ├── calculator.py    # 数学计算工具
│   │   │   ├── web_search.py    # Tavily 搜索工具
│   │   │   └── read_ref.py      # 读取卸载文件工具
│   │   ├── memory/
│   │   │   ├── __init__.py
│   │   │   ├── db.py            # SQLite 初始化
│   │   │   ├── manager.py       # MemoryManager 统一入口
│   │   │   ├── l0_conversation.py  # 原始对话存储
│   │   │   ├── l1_atom.py       # 原子事实提取
│   │   │   ├── l2_scenario.py   # 场景总结
│   │   │   ├── l3_persona.py    # 用户画像
│   │   │   └── offload.py       # 上下文卸载引擎
│   │   └── api/
│   │       ├── __init__.py
│   │       └── models.py        # Pydantic 请求/响应模型
│   ├── offloads/
│   │   ├── refs/                # 卸载的工具日志
│   │   ├── scenarios/           # L2 场景文件
│   │   ├── canvases/            # Mermaid 画布
│   │   └── persona.md           # L3 用户画像
│   ├── tests/
│   │   ├── test_agent.py
│   │   ├── test_tools.py
│   │   ├── test_memory.py
│   │   └── test_api.py
│   ├── requirements.txt
│   └── .env.example
├── src/                         # 现有 React 前端（需小幅修改）
│   ├── services/
│   │   └── api.ts               # ← 重写为指向后端
│   └── hooks/
│       └── useChat.ts           # ← 适配新 SSE 格式
└── openspec/changes/chatbot-agent-upgrade/   # 规格文档
    ├── proposal.md
    ├── tasks.md
    └── specs/
        ├── delta-agent.md
        ├── delta-tools.md
        ├── delta-memory.md
        └── delta-api.md
```

---

## 实施顺序（6 个阶段）

### Phase 1: Python 项目骨架

创建 `backend/` 目录，初始化 Python 项目。

**文件清单：**
- `backend/requirements.txt`
- `backend/.env.example`
- `backend/app/__init__.py`
- `backend/app/config.py`

**requirements.txt 内容：**
```
langchain>=0.3,<0.4
langchain-openai>=0.2,<0.3
langchain-community>=0.3,<0.4
fastapi>=0.115,<0.116
uvicorn[standard]>=0.34,<0.35
python-dotenv>=1.0,<1.1
tavily-python>=0.5,<0.6
aiofiles>=24.1,<25.0
pytest>=8.0,<9.0
pytest-asyncio>=0.24,<0.25
httpx>=0.28,<0.29
```

**.env.example 内容：**
```env
LLM_API_KEY=your_zhipu_api_key_here
LLM_MODEL=GLM-4-Flash-250414
LLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4/
TAVILY_API_KEY=your_tavily_api_key_here
```

**config.py 逻辑：**
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    llm_api_key: str
    llm_model: str = "GLM-4-Flash-250414"
    llm_base_url: str = "https://open.bigmodel.cn/api/paas/v4/"
    tavily_api_key: str = ""
    offload_max_chars: int = 1000
    session_max_messages: int = 500
    # 从 .env 文件加载

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

settings = Settings()
```

**Quality Gate：** `pip install -r requirements.txt` 成功，`uvicorn app.main:app --reload` 可以启动

---

### Phase 2: Agent 核心

**2.1 LLM 工厂 `backend/app/agent/llm.py`**

```python
from langchain_openai import ChatOpenAI
from app.config import settings

def create_llm(**kwargs) -> ChatOpenAI:
    return ChatOpenAI(
        model=settings.llm_model,
        api_key=settings.llm_api_key,
        base_url=settings.llm_base_url,
        temperature=kwargs.get("temperature", 0.7),
        streaming=kwargs.get("streaming", True),
    )
```

注意：智谱 API 是 OpenAI 兼容的，所以 `ChatOpenAI` 可以直接用。base_url 不能加 `/chat/completions` 后缀，LangChain 会自动拼接。

**2.2 Calculator 工具 `backend/app/tools/calculator.py`**

用 `@tool` 装饰器。执行环境要做安全限制——只允许 `math` 模块的白名单函数，禁止 `__import__`、`eval` 原生等危险操作。可用 `ast.literal_eval` 或有限 eval 实现。

**2.3 Web Search 工具 `backend/app/tools/web_search.py`**

Tavily API 搜索。如果 `TAVILY_API_KEY` 未设置，工具注册时跳过（不在 `ALL_TOOLS` 中）。

**2.4 read_ref 工具 `backend/app/tools/read_ref.py`**

读取已卸载到 `offloads/refs/` 的文件内容。工具的定义需要接收 `ref_path` 参数，返回文件内容。注意路径安全性：验证 `ref_path` 在 `offloads/` 目录内，防止 path traversal。

**2.5 工具注册 `backend/app/tools/__init__.py`**

```python
from app.tools.calculator import calculator
from app.tools.web_search import web_search
from app.tools.read_ref import read_ref

ALL_TOOLS = [calculator, web_search, read_ref]
```

对于 web_search：如果环境变量中 `tavily_api_key` 为空，则条件性地不加入 `ALL_TOOLS`。

**2.6 Agent 工厂 `backend/app/agent/agent.py`**

```python
from langchain.agents import create_tool_calling_agent, AgentExecutor
from app.tools import ALL_TOOLS

def create_agent(llm, tools=None, system_prompt=None):
    tools = tools or ALL_TOOLS
    prompt = system_prompt or default_system_prompt()
    agent = create_tool_calling_agent(llm, tools, prompt)
    return AgentExecutor(agent=agent, tools=tools, verbose=True)
```

**2.7 Agent 执行器 `backend/app/agent/executor.py`**

最主要实现：`async def stream_agent(agent, messages, session_id, memory_manager)`。

使用 `agent.astream_events()` 方法遍历事件。需要输出的事件类型：
- `on_chat_model_stream` → `{"type": "text", "content": chunk}`
- `on_tool_start` → `{"type": "tool_start", "content": {"tool": name, "args": input}}`
- `on_tool_end` → `{"type": "tool_end", "content": {"tool": name, "result": output}}`

**重要逻辑：** 每次 Agent 回复完成后，调用 `memory_manager.record_message()` 和 `memory_manager.extract_atoms()`。

**Quality Gate：** Agent 能完成 "123 * 456 等于多少"（自动调 calculator）和 "今天北京天气"（自动调 web_search）。

---

### Phase 3: 记忆系统（L0→L3 + 上下文卸载）

这是最复杂的部分。参考 `openspec/changes/chatbot-agent-upgrade/specs/delta-memory.md`。

**3a. SQLite 初始化 `backend/app/memory/db.py`**

```python
import sqlite3
from pathlib import Path

DB_PATH = Path("offloads") / "memory.db"

def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            tokens INTEGER DEFAULT 0,
            tool_name TEXT,
            tool_args TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS atoms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            subject TEXT NOT NULL,
            predicate TEXT NOT NULL,
            object TEXT NOT NULL,
            source_ref INTEGER,
            confidence REAL DEFAULT 0.5,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_conv_session ON conversations(session_id);
        CREATE INDEX IF NOT EXISTS idx_atom_session ON atoms(session_id);
    """)
    conn.commit()
```

**3b. L0 Conversation `backend/app/memory/l0_conversation.py`**

- `record_message(session_id, role, content, tokens, tool_name=None, tool_args=None)` → 写入 conversations 表
- `get_conversation(session_id, limit=50)` → 返回最近 N 条
- `get_message_by_id(conv_id)` → 返回单条原始内容（供 L1/L3 回溯证据）
- `cleanup_oldest(session_id, max_messages=500)` → 超限清理最旧 50 条

**3c. 上下文卸载引擎 `backend/app/memory/offload.py`**

- `offload_if_needed(tool_name, content, session_id)` → 如果 content 长度 > `OFFLOAD_MAX_CHARS`(1000)：
  1. 生成文件名：`offloads/refs/{session_id}_{tool_name}_{timestamp}.md`
  2. 写入完整内容
  3. 返回摘要行：`📎 [{tool_name} 完整输出]({filename}) | result_ref: {filename}`
- `read_ref(ref_path)` → 读取文件内容。**必须做路径安全检查**，防止 `../../etc/passwd` 攻击。
- `generate_canvas(session_id)` → 可选。将当前会话的步骤追加到 `offloads/canvases/{session_id}.mmd`

卸载后的 content 替换逻辑在 `executor.py` 中：在 tool_end 事件后，检查 tool output 长度，如果超限则用摘要替换上下文中的 content。

**3d. L1 Atom 事实提取 `backend/app/memory/l1_atom.py`**

- `extract_atoms(session_id, recent_messages)` → 调用 LLM 从最近一轮对话中提取事实三元组。
  - prompt 设计：让 LLM 输出 `subject|predicate|object|confidence` 每行一个
  - 提取来源：工具返回的关键信息 + 用户陈述的明确偏好
  - 提取后写入 atoms 表
- `search_atoms(session_id, query, limit=10)` → 按 subject/predicate/object 检索
- 注意：这个提取是**异步**的，不要阻塞 Agent 回复流程。

**3e. L2 Scenario 场景总结 `backend/app/memory/l2_scenario.py`**

- `finalize_scenario(session_id, summary)` → 将会话总结写入 `offloads/scenarios/{session_id}_{date}.md`
  - 触发时机：`DELETE /api/sessions/{id}` 或 30 分钟无活动
  - 文件格式见 delta-memory.md
  - 保留最近 50 个，超出删除最旧
- `get_recent_scenarios(session_id, n=3)` → 返回最近 n 个场景的 Markdown 内容

**3f. L3 Persona 用户画像 `backend/app/memory/l3_persona.py`**

- `update_persona(session_id)` → 从当前 session 的所有 Scenarios + Atoms 聚合用户偏好
  - 写入 `offloads/persona.md`
  - 内容需 ≤2KB，超出则按 confidence 排序保留最强信号
- `get_persona()` → 返回当前 persona.md 内容
- 更新时机：每次 L2 Scenario 生成后触发

**3g. Mermaid 画布（可选） `backend/app/memory/canvas.py`**

创建一个简单的 Mermaid 流程图，记录关键步骤。文件格式示例见 delta-memory.md。

**Quality Gate：**
- 长工具输出被正确卸载（文件存在，摘要替换原内容）
- Agent 通过 `read_ref` 能恢复
- 对话结束后有 L2 文件生成

---

### Phase 4: API 层

**4.1 请求/响应模型 `backend/app/api/models.py`**

```python
from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None  # 首次为空

class SessionListResponse(BaseModel):
    sessions: list[str]
    count: int
```

**4.2 SSE 端点 `app/main.py`**

核心端点：`POST /api/chat/stream`

关键实现要点：
- 使用 `StreamingResponse` 返回 `text/event-stream`
- 使用 `async generator` 发送事件
- 每个事件格式：`data: {"type": "xxx", "content": ...}\n\n`
- 首先发送 `session` 事件（新创建的 session_id 或已有的）
- 然后调用 `executor.stream_agent()` 发送流式输出
- 完成后调用 MemoryManager 的记录和提取方法
- 最后发 `done` 事件

```python
# SSE 事件格式
data: {"type": "session", "content": {"session_id": "uuid"}}

data: {"type": "text", "content": "你好"}

data: {"type": "tool_start", "content": {"tool": "calculator", "args": {"expression": "1+1"}}}

data: {"type": "tool_end", "content": {"tool": "calculator", "result": "2"}}

data: {"type": "done", "content": null}
```

CORS 配置（开发用）：
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**4.3 会话管理端点**
- `GET /api/sessions` → 所有活跃 session_id 列表
- `DELETE /api/sessions/{session_id}` → 清除会话记忆 + 卸载文件。内部调用 `memory_manager.clear_session()`
- `GET /api/health` → 返回健康检查信息（模型名、可用工具数）

**4.4 MemoryManager 集成到 FastAPI 生命周期**

```python
@app.on_event("startup")
async def startup():
    init_db()
    manager.init_background_tasks()

@app.on_event("shutdown")
async def shutdown():
    manager.flush_all_scenarios()
```

**Quality Gate：** `curl -X POST "http://localhost:8000/api/chat/stream" -H "Content-Type: application/json" -d '{"message":"你好"}'` 返回 SSE 流

---

### Phase 5: 前端适配

**5.1 重写 `src/services/api.ts`**

删除所有智谱 API 直连代码（API Key、请求 URL、手写 fetch）。改为：

- 连接 `http://localhost:8000/api/chat/stream`
- 使用 `EventSource` 或 `fetch` 读取 SSE 流
- 管理 `session_id`：首次从 SSE `session` 事件获取，后续请求携带

事件处理映射：
| SSE 事件 | 前端行为 |
|----------|---------|
| `session` | 保存 session_id |
| `text` | 追加到当前正在生成的 message |
| `tool_start` | 显示"正在调用工具..."提示 |
| `tool_end` | 显示"工具完成"提示 |
| `done` | 结束本轮，保存 message |
| `error` | 显示错误提示 |

**5.2 适配 `src/hooks/useChat.ts`**

修改流式消息拼接逻辑，适配新的事件格式。当前 useChat.ts 中使用了 fetch + ReadableStream 解码，可以改为基于 fetch 的 SSE 解析，或者使用 EventSource（但 EventSource 只支持 GET）。

推荐方案：继续用 fetch，但解析逻辑适配新事件格式。

**5.3 清理**

- 删除 `src/services/storage.ts` 中的 LocalStorage 全量历史保存逻辑（可选保留用于 UI 恢复）
- 从 `src/services/api.ts` 中移除 `ZL_API_KEY` 和智谱 URL

**Quality Gate：** 打开 `http://localhost:5173/`，输入消息，看到 Agent 流式回复，浏览器 Network 面板没有 API Key 泄露

---

### Phase 6: 测试

**6.1 `tests/test_agent.py`**
- test_llm_creation: LLM 工厂能正常创建
- test_agent_creation: Agent 工厂能正常创建
- test_agent_calculator_tool: Agent 能正确触发 calculator
- test_agent_no_tool: 非工具问题时 Agent 直接回复
- test_agent_streaming: 流式输出生成器正常

**6.2 `tests/test_tools.py`**
- test_calculator_basic: 1+1=2, 2^10=1024
- test_calculator_security: 注入攻击被拒绝
- test_web_search: （需要 TAVILY_API_KEY，建议用 mock 或 skipif）
- test_read_ref: 能读取已卸载文件

**6.3 `tests/test_memory.py`**
- test_l0_record_and_retrieve: L0 写入后能查询
- test_l0_cleanup: 超 500 条后自动清理
- test_offload_trigger: 长内容触发卸载
- test_offload_read_ref: 卸载后 read_ref 能恢复
- test_atom_extract: （需要 LLM，建议 mock LLM 返回或 skipif）
- test_scenario_generation: 场景文件能生成
- test_persona_update: 画像文件能更新

**6.4 `tests/test_api.py`**
- test_health: /api/health 返回正常
- test_chat_stream: SSE 流式端点返回正确事件
- test_session_management: 创建/列取/删除会话

测试注意事项：
- 工具测试如果需要外部 API（Tavily），用 `@pytest.mark.skipif` + 环境变量判断
- 涉及 LLM 调用的测试，建议 mock `ChatOpenAI` 返回固定内容
- 数据库测试用临时文件，测试完成后清理

**Quality Gate：** `cd backend && python -m pytest tests/ -v` 全部通过

---

## 关键注意事项

### API 端点 URL
前端 `api.ts` 中的后端地址（`http://localhost:8000`）应抽成变量，方便后续配置。但不要过度设计——当前硬编码就可，后续需要再改。

### SQLite 文件位置
- 数据库文件：`backend/offloads/memory.db`
- 卸载文件：`backend/offloads/refs/`
- 场景文件：`backend/offloads/scenarios/`
- 画布文件：`backend/offloads/canvases/`
- 画像文件：`backend/offloads/persona.md`

这些目录需要在 FastAPI 启动时自动创建。

### 路径安全
`read_ref` 工具必须做路径安全检查，防止 path traversal：
```python
import os
REFS_DIR = Path("offloads/refs").resolve()

def read_ref(ref_path: str) -> str:
    target = (REFS_DIR / ref_path).resolve()
    if not str(target).startswith(str(REFS_DIR)):
        return "Error: 无效的文件引用"
    # 读取文件...
```

### L1 Atom 提取性能
Atom 提取调用 LLM 会额外消耗 token 和时间。建议：
1. 使用和主 Agent 相同的模型（已加载，省显存/预热）
2. 提取 prompt 控制在 200 tokens 以内
3. 异步执行，不要阻塞主回复流
4. 每次提取限制 5 个事实

### Mermaid 画布（可选）
如果时间紧张，可以跳过 Phase 3g。它是锦上添花的功能。

### 无需处理（明确不做的）
- 用户认证 / 多用户
- 数据库持久化到磁盘（SQLite 算本地持久化，但不做云同步）
- Docker 容器化
- 前端 UI 重设计
- 生产级错误处理（404、限流等）

---

## 启动方式

```bash
# 终端 1: 启动后端
cd Chatbot/backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 终端 2: 启动前端
cd Chatbot
npm install   # 已安装过可跳过
npm run dev   # 默认 http://localhost:5173
```

---

## 参考文件

所有详细规格在 OpenSpec 文件中：

- `openspec/changes/chatbot-agent-upgrade/proposal.md` — 方案总览
- `openspec/changes/chatbot-agent-upgrade/tasks.md` — 任务拆解
- `openspec/changes/chatbot-agent-upgrade/specs/delta-agent.md` — Agent 契约
- `openspec/changes/chatbot-agent-upgrade/specs/delta-tools.md` — 工具接口
- `openspec/changes/chatbot-agent-upgrade/specs/delta-memory.md` — 记忆分层详细设计
- `openspec/changes/chatbot-agent-upgrade/specs/delta-api.md` — 前后端通信协议

---

## 完成标准

- [ ] `cd backend && uvicorn app.main:app --reload` 正常启动
- [ ] `curl POST /api/chat/stream "你好"` 返回 SSE 流
- [ ] 浏览器打开前端，能正常对话
- [ ] 长工具输出被卸载到文件
- [ ] 多轮对话后 L1 事实入库
- [ ] 会话结束生成 L2 场景文件
- [ ] `persona.md` 存在且有内容
- [ ] `pytest tests/ -v` 全部通过
