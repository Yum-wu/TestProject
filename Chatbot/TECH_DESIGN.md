# AI 聊天助手 — 技术设计

## 技术栈

### 后端（新增）
| 组件 | 技术 | 说明 |
|------|------|------|
| 运行时 | Python 3.14+ | 系统 Python |
| 框架 | FastAPI + uvicorn | REST + SSE 流式端点 |
| Agent 框架 | LangChain >=0.3 | Tool Calling Agent |
| LLM 接口 | langchain-openai (ChatOpenAI) | OpenAI 兼容接口，适配智谱 |
| 默认模型 | GLM-4-Flash-250414 | 智谱，改 .env 可切换 |
| 数据库 | SQLite | offloads/memory.db |
| Web Search | Tavily API | 可选，无 Key 则跳过 |

### 前端（保留）
| 组件 | 技术 | 说明 |
|------|------|------|
| 框架 | React 19 + Vite 8 | TypeScript |
| 样式 | Tailwind CSS 4 | @tailwindcss/typography |
| Markdown | react-markdown + react-syntax-highlighter | 含代码高亮 |
| 存储 | LocalStorage | UI 状态恢复 |

## 架构

```
React 前端 (src/)            Python FastAPI 后端 (backend/)
┌──────────────┐            ┌──────────────────────────────────┐
│ ChatWindow   │◄──SSE──────┤ POST /api/chat/stream           │
│ MessageList  │            │                                  │
│ InputArea    │──POST─────►│ LangChain Agent                  │
│              │            │  ├─ ChatModel (智谱/DeepSeek/混元)│
│ useChat.ts   │            │  ├─ Tools (calculator/搜索/read_ref)│
│   ↓          │            │  └─ MemoryManager                │
│ api.ts ←─────┤            │       ├─ L3 Persona (画像)       │
└──────────────┘            │       ├─ L2 Scenario (场景)      │
                            │       ├─ L1 Atom (事实)          │
                            │       ├─ L0 Conversation (原始)  │
                            │       └─ Context Offload (卸载)  │
                            │                                  │
                            │ offloads/                        │
                            │  ├─ refs/*.md    (工具日志外存)  │
                            │  ├─ scenarios/*.md (场景总结)   │
                            │  ├─ persona.md   (用户画像)     │
                            │  └─ canvas_*.mmd (Mermaid画布)  │
                            └──────────────────────────────────┘
```

## 数据结构

### Message（前端）
```typescript
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;       // Markdown 格式
  timestamp: number;
}
```

### SSE 事件协议
```
data: {"type": "session",   "content": {"session_id": "uuid"}}
data: {"type": "text",      "content": "逐字文本块"}
data: {"type": "tool_start","content": {"tool": "calculator", "args": {"expression":"1+1"}}}
data: {"type": "tool_end",  "content": {"tool": "calculator", "result": "2"}}
data: {"type": "done",      "content": null}
data: {"type": "error",     "content": {"message": "错误描述"}}
```

### 记忆分层（后端 SQLite + 文件系统）

| 层级 | 存储 | 格式 | 加载时机 |
|------|------|------|---------|
| L0 | SQLite conversations 表 | JSON rows | 按需调试回溯 |
| L1 | SQLite atoms 表 | 三元组 (subject, predicate, object) | Agent 判断需要精确事实时 |
| L2 | offloads/scenarios/*.md | Markdown | 新会话加载最近 3 个 |
| L3 | offloads/persona.md | Markdown (≤2KB) | 始终加载 |

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/chat/stream | SSE 流式聊天 |
| GET | /api/sessions | 活跃会话列表 |
| DELETE | /api/sessions/{session_id} | 清除会话（触发 L2 + L3） |
| GET | /api/health | 健康检查 |

## 安全

- API Key 仅存后端 `backend/.env`，前端不携带
- Calculator 工具白名单安全沙箱，禁止 `__import__`/`eval` 原生
- read_ref 路径校验防 path traversal
- CORS 仅允许 `localhost:5173`

## 启动方式

```bash
# 终端 1：后端
cd Chatbot/backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 终端 2：前端
cd Chatbot
npm install
npm run dev    # 默认 http://localhost:5173
```
