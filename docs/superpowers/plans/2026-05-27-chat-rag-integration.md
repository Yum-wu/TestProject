# Chat + RAG Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chat 页面自动增强 RAG — 用户在 `/chat` 聊天时，Agent 自动判断意图，知识相关问题触发 RAG 检索，用户无感。

**Architecture:** 新增流式 LangGraph 端点 `/api/chat/enhanced/stream`，复用现有意图分类（关键词匹配）+ BM25 快速检索 + LLM 流式生成。前端 `useChat.ts` 扩展 SSE 事件处理，支持 sources/intent 事件展示。

**Tech Stack:** FastAPI SSE, LangGraph (existing), BM25 keyword retrieval (existing), React 19, TypeScript

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `Chatbot/backend/app/langgraph/streaming.py` | **Create** | 流式 LangGraph 工作流：intent → RAG → stream generate |
| `Chatbot/backend/app/main.py` | **Modify** | 新增 `/api/chat/enhanced/stream` 端点 |
| `Chatbot/src/types/message.ts` | **Modify** | Message 接口增加 `sources` 和 `intent` 字段 |
| `Chatbot/src/services/api.ts` | **Modify** | SSE 事件类型增加 `sources`、`intent` |
| `Chatbot/src/hooks/useChat.ts` | **Modify** | 处理新 SSE 事件，存储 sources/intent |
| `Chatbot/src/components/MessageBubble.tsx` | **Modify** | 展示 RAG 来源和意图标签 |
| `Chatbot/src/components/ChatWindow.tsx` | **Modify** | 切换到增强端点 |

---

### Task 1: 流式 LangGraph 工作流

**Files:**
- Create: `Chatbot/backend/app/langgraph/streaming.py`

- [ ] **Step 1: 创建流式工作流模块**

```python
"""LangGraph 流式工作流 — intent → RAG → stream generate"""

import asyncio
import logging
import time
from typing import AsyncGenerator

from app.langgraph.nodes.intent import classify_intent
from app.rag.vector_store import retrieve_keyword, format_context
from app.rag.qa_chain import QA_SYSTEM_PROMPT, QA_SYSTEM_PROMPT_EN
from app.utils.lang_detect import detect_language, lang_instruction

logger = logging.getLogger(__name__)


async def stream_workflow(
    query: str,
    llm,
    session_id: str = "",
    top_k: int = 3,
) -> AsyncGenerator[dict, None]:
    """Execute intent classification → optional RAG → streaming LLM generation.

    Yields SSE dicts:
    - {"type": "intent", "content": {"intent": str, "confidence": float}}
    - {"type": "sources", "sources": [...]}  (only for RAG intent)
    - {"type": "text", "content": str}       (LLM token chunks)
    - {"type": "route", "content": str}      (which path was taken)
    - {"type": "done"}
    """
    lang = detect_language(query)

    # ── Node 1: Intent classification (fast, <1ms) ──
    t0 = time.time()
    intent, confidence = classify_intent(query)
    intent_ms = int((time.time() - t0) * 1000)
    logger.info(f"[StreamWorkflow] Intent: {intent} ({confidence:.0%}) in {intent_ms}ms")

    yield {"type": "intent", "content": {"intent": intent, "confidence": confidence}}

    # ── Node 2: Route based on intent ──
    if intent == "rag":
        # RAG path: retrieve + stream generate
        yield {"type": "route", "content": "rag"}
        async for event in _stream_rag(query, llm, top_k, lang):
            yield event

    elif intent == "mixed":
        # Mixed: RAG first, then generate with context
        yield {"type": "route", "content": "mixed"}
        async for event in _stream_rag(query, llm, top_k, lang):
            yield event

    else:
        # Chat path: direct LLM stream (no RAG)
        yield {"type": "route", "content": "chat"}
        async for event in _stream_chat(query, llm, lang):
            yield event

    yield {"type": "done"}


async def _stream_rag(
    query: str,
    llm,
    top_k: int,
    lang: str,
) -> AsyncGenerator[dict, None]:
    """RAG path: BM25 retrieve → format context → stream LLM."""
    t0 = time.time()

    # 1. Fast keyword retrieval (<10ms)
    chunks = retrieve_keyword(query, top_k=top_k)
    retrieve_ms = int((time.time() - t0) * 1000)

    if not chunks:
        no_result = (
            "No relevant content found in the knowledge base."
            if lang == "en"
            else "知识库中暂无相关内容，请尝试其他问题。"
        )
        yield {"type": "sources", "sources": []}
        yield {"type": "text", "content": no_result}
        return

    # 2. Yield sources
    sources = [
        {
            "title": c["metadata"].get("title", c["metadata"].get("source", "Unknown")),
            "slug": c["metadata"].get("slug", ""),
            "score": c.get("score"),
        }
        for c in chunks
    ]
    yield {"type": "sources", "sources": sources}

    # 3. Format context + build prompt
    context = format_context(chunks)
    system_prompt = QA_SYSTEM_PROMPT_EN if lang == "en" else QA_SYSTEM_PROMPT
    lang_instr = lang_instruction(lang).strip()
    prompt = system_prompt.format(context=context, lang_instruction=lang_instr)

    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": query},
    ]

    # 4. Stream LLM tokens
    full_text = ""
    async for chunk in llm.astream(messages):
        if chunk.content:
            full_text += chunk.content
            yield {"type": "text", "content": chunk.content}


async def _stream_chat(
    query: str,
    llm,
    lang: str,
) -> AsyncGenerator[dict, None]:
    """Chat path: direct LLM stream, no RAG context."""
    lang_instr = lang_instruction(lang).strip()
    sys_prompt = (
        f"You are a friendly AI assistant. {lang_instr}"
        if lang == "en"
        else f"你是一个友好的 AI 助手。{lang_instr}"
    )

    messages = [
        {"role": "system", "content": sys_prompt},
        {"role": "user", "content": query},
    ]

    async for chunk in llm.astream(messages):
        if chunk.content:
            yield {"type": "text", "content": chunk.content}
```

- [ ] **Step 2: 验证模块可导入**

Run: `cd Chatbot/backend && python -c "from app.langgraph.streaming import stream_workflow; print('OK')"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add Chatbot/backend/app/langgraph/streaming.py
git commit -m "feat: add streaming LangGraph workflow with intent + RAG"
```

---

### Task 2: 后端增强端点

**Files:**
- Modify: `Chatbot/backend/app/main.py`

- [ ] **Step 1: 添加增强聊天端点**

在 `main.py` 的 `chat_stream` 端点之后添加：

```python
@app.post("/api/chat/enhanced/stream")
@limiter.limit("5/second")
async def chat_enhanced_stream(req: ChatRequest, request: Request):
    """Enhanced chat with automatic RAG integration via LangGraph intent routing."""
    from app.langgraph.streaming import stream_workflow
    from app.agent.llm import create_llm

    llm = create_llm()

    async def event_stream():
        try:
            async for event in stream_workflow(
                query=req.message,
                llm=llm,
                session_id=req.session_id or "",
            ):
                yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
```

- [ ] **Step 2: 验证端点注册**

Run: `cd Chatbot/backend && python -c "from app.main import app; routes = [r.path for r in app.routes]; print('/api/chat/enhanced/stream' in routes)"`
Expected: `True`

- [ ] **Step 3: Commit**

```bash
git add Chatbot/backend/app/main.py
git commit -m "feat: add /api/chat/enhanced/stream endpoint"
```

---

### Task 3: 前端类型和 API 扩展

**Files:**
- Modify: `Chatbot/src/types/message.ts`
- Modify: `Chatbot/src/services/api.ts`

- [ ] **Step 1: 扩展 Message 类型**

```typescript
/** 聊天消息类型定义 */
export interface Message {
  /** 消息唯一标识 */
  id: string;
  /** 消息角色：用户或助手 */
  role: "user" | "assistant";
  /** 消息文本内容 */
  content: string;
  /** 消息时间戳（毫秒） */
  timestamp: number;
  /** RAG 检索来源（仅增强模式） */
  sources?: Array<{ title: string; slug: string; score?: number }>;
  /** 意图分类结果（仅增强模式） */
  intent?: string;
}
```

- [ ] **Step 2: 扩展 SSE 事件类型**

```typescript
/** 后端 API 地址（通过环境变量配置，默认本地开发） */
const API_URL = (import.meta.env.VITE_API_URL as string) || "/api/chat/stream";
const ENHANCED_API_URL = (import.meta.env.VITE_ENHANCED_API_URL as string) || "/api/chat/enhanced/stream";

/** SSE 事件数据结构 */
export interface SSEEvent {
  type: "session" | "text" | "tool_start" | "tool_end" | "sources" | "intent" | "route" | "done" | "error";
  content: unknown;
  sources?: Array<{ title: string; slug: string; score?: number }>;
}
```

- [ ] **Step 3: Commit**

```bash
git add Chatbot/src/types/message.ts Chatbot/src/services/api.ts
git commit -m "feat: extend Message type and SSE events for RAG integration"
```

---

### Task 4: useChat Hook 扩展

**Files:**
- Modify: `Chatbot/src/hooks/useChat.ts`

- [ ] **Step 1: 修改 useChat 支持增强模式**

在 `useChat.ts` 中：

1. 修改 `handleEvent` 增加 `sources` 和 `intent` 事件处理
2. 修改 `sendMessage` 使用增强端点

```typescript
// 在 handleEvent 的 switch 中添加：
case "sources": {
  const srcList = (event as SSEEvent).sources ?? (event.content as Array<{ title: string; slug: string; score?: number }>);
  if (srcList) {
    flushNow();
    setMessages((prev) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      if (last && last.role === "assistant" && last.id === assistantId) {
        updated[updated.length - 1] = { ...last, sources: srcList };
      }
      return updated;
    });
  }
  break;
}
case "intent": {
  const intentData = event.content as { intent: string; confidence: number };
  flushNow();
  setMessages((prev) => {
    const updated = [...prev];
    const last = updated[updated.length - 1];
    if (last && last.role === "assistant" && last.id === assistantId) {
      updated[updated.length - 1] = { ...last, intent: intentData.intent };
    }
    return updated;
  });
  break;
}
```

修改 `streamChat` 调用，使用增强端点：

```typescript
// 在 sendMessage 中，将 streamChat 改为 streamEnhancedChat
await streamEnhancedChat({
  message: userMessage.content,
  sessionId: sessionIdRef.current,
  onEvent: (event) => handleEvent(event, assistantMessage.id),
  onError: (errMsg) => { /* same as before */ },
  signal: abortController.signal,
});
```

- [ ] **Step 2: 添加 streamEnhancedChat 函数**

在 `api.ts` 中添加：

```typescript
/**
 * 以 SSE 流式方式调用增强 Chat API（含 RAG 意图路由）
 */
export async function streamEnhancedChat(params: StreamChatParams): Promise<void> {
  const { message, sessionId, onEvent, onError, signal } = params;

  try {
    const response = await fetch(ENHANCED_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, session_id: sessionId }),
      signal,
    });

    if (!response.ok) {
      onError(`请求失败 (${response.status})`);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError("无法读取响应流");
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        try {
          const event: SSEEvent = JSON.parse(data);
          onEvent(event);
        } catch {
          continue;
        }
      }
    }
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "AbortError") return;
    onError(err instanceof Error ? err.message : "网络请求异常");
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add Chatbot/src/hooks/useChat.ts Chatbot/src/services/api.ts
git commit -m "feat: useChat hooks for RAG sources and intent display"
```

---

### Task 5: 消息气泡展示 RAG 来源

**Files:**
- Modify: `Chatbot/src/components/MessageBubble.tsx`

- [ ] **Step 1: 添加来源展示**

在 `MessageBubble.tsx` 的 assistant 消息末尾添加来源展示（仅当 `message.sources` 存在且非空时）：

```tsx
{/* RAG Sources */}
{message.role === "assistant" && message.sources && message.sources.length > 0 && (
  <div className="mt-3 pt-2 border-t border-gray-100">
    <p className="text-xs text-gray-400 mb-1.5">📚 参考来源</p>
    <div className="space-y-1">
      {message.sources.map((src, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="text-blue-600 truncate">{src.title}</span>
          {src.score !== undefined && (
            <span className="text-gray-300 shrink-0">
              {(src.score * 100).toFixed(0)}%
            </span>
          )}
        </div>
      ))}
    </div>
  </div>
)}

{/* Intent badge */}
{message.role === "assistant" && message.intent && message.intent !== "chat" && (
  <div className="mt-2">
    <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
      {message.intent === "rag" ? "📚 知识问答" : message.intent === "mixed" ? "🔗 混合" : "🤖 工具"}
    </span>
  </div>
)}
```

- [ ] **Step 2: Commit**

```bash
git add Chatbot/src/components/MessageBubble.tsx
git commit -m "feat: display RAG sources and intent badge in chat messages"
```

---

### Task 6: 端到端测试

**Files:**
- Test: `Chatbot/backend/tests/test_streaming_workflow.py`

- [ ] **Step 1: 编写流式工作流测试**

```python
"""Test streaming LangGraph workflow."""
import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock


@pytest.mark.asyncio
async def test_stream_workflow_chat_intent():
    """Chat intent should skip RAG and stream directly."""
    from app.langgraph.streaming import stream_workflow

    mock_llm = MagicMock()
    mock_chunk = MagicMock()
    mock_chunk.content = "你好！"

    async def mock_astream(messages):
        yield mock_chunk

    mock_llm.astream = mock_astream

    events = []
    async for event in stream_workflow("你好", mock_llm):
        events.append(event)

    types = [e["type"] for e in events]
    assert "intent" in types
    assert "route" in types
    assert "text" in types
    assert "done" in types

    # Chat intent should NOT have sources
    assert not any(e["type"] == "sources" for e in events)

    route_event = next(e for e in events if e["type"] == "route")
    assert route_event["content"] == "chat"


@pytest.mark.asyncio
async def test_stream_workflow_rag_intent():
    """RAG intent should retrieve and include sources."""
    from app.langgraph.streaming import stream_workflow

    mock_llm = MagicMock()
    mock_chunk = MagicMock()
    mock_chunk.content = "RAG answer"

    async def mock_astream(messages):
        yield mock_chunk

    mock_llm.astream = mock_astream

    events = []
    async for event in stream_workflow("什么是 RAG", mock_llm):
        events.append(event)

    types = [e["type"] for e in events]
    assert "sources" in types
    assert "text" in types

    route_event = next(e for e in events if e["type"] == "route")
    assert route_event["content"] == "rag"
```

- [ ] **Step 2: 运行测试**

Run: `cd Chatbot/backend && python -m pytest tests/test_streaming_workflow.py -v`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add Chatbot/backend/tests/test_streaming_workflow.py
git commit -m "test: add streaming workflow unit tests"
```

---

### Task 7: 前端端到端验证

- [ ] **Step 1: 启动后端**

Run: `cd Chatbot/backend && uvicorn app.main:app --reload --port 8000`

- [ ] **Step 2: 启动前端**

Run: `cd Chatbot && npm run dev`

- [ ] **Step 3: 手动验证**

1. 打开 `/chat` 页面
2. 输入 "你好" → 应走 chat 路径，无来源
3. 输入 "什么是 RAG" → 应走 rag 路径，显示来源
4. 输入 "搜索一下 AI 新闻" → 应走 agent 路径
5. 验证意图标签和来源展示正确

- [ ] **Step 4: Commit 最终状态**

```bash
git add -A
git commit -m "feat: complete chat + RAG integration via LangGraph streaming"
```
