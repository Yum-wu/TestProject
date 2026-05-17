# AI 聊天助手实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 基于 React + TypeScript + Vite 构建一个调用智谱 AI API 的聊天助手，支持流式输出、多轮对话、Markdown 渲染和本地存储。

**Architecture:** 单页应用架构，使用自定义 Hook 管理聊天状态和 API 调用，LocalStorage 持久化对话历史，SSE 流式接收 AI 回答。组件按职责拆分为消息列表、消息项、输入区域和代码块。

**Tech Stack:** React 18 + TypeScript + Vite + Tailwind CSS v4 + @tailwindcss/typography + 智谱 AI API + react-markdown + react-syntax-highlighter

***

## 文件结构

```
Chatbot/
├── .env                          # API Key 环境变量（不提交到 Git）
├── index.html                    # Vite 入口 HTML
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.tsx                  # 应用入口
│   ├── App.tsx                   # 主应用组件
│   ├── index.css                 # Tailwind 入口样式
│   ├── types/
│   │   └── message.ts            # Message 类型定义
│   ├── services/
│   │   ├── api.ts                # 智谱 AI API 调用封装
│   │   └── storage.ts            # LocalStorage 操作封装
│   ├── hooks/
│   │   └── useChat.ts            # 聊天逻辑 Hook
│   └── components/
│       ├── ChatWindow.tsx         # 主聊天窗口
│       ├── MessageList.tsx        # 消息列表（含自动滚动）
│       ├── MessageItem.tsx        # 单条消息（含 Markdown 渲染）
│       ├── InputArea.tsx          # 输入区域
│       └── CodeBlock.tsx          # 代码块（语法高亮 + 复制）
```

***

### Task 1: 项目初始化

**Files:**

* Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`

* [ ] **Step 1: 使用 Vite 创建 React + TypeScript 项目**

Run:

```bash
cd c:\Users\Yum\Desktop\TestProject\Chatbot
npm create vite@latest . -- --template react-ts
```

如果提示目录非空，选择覆盖已有文件（保留 AGENTS.md、PRD.md、TECH\_DESIGN.md）。

* [ ] **Step 2: 确保 .gitignore 包含 .env**

检查 Vite 生成的 `.gitignore` 中是否已包含 `.env`，如果没有则手动添加。这是在首次提交前的安全措施，防止 API Key 误提交。

* [ ] **Step 3: 安装核心依赖**

Run:

```bash
npm install
```

* [ ] **Step 4: 安装 Tailwind CSS v4**

Run:

```bash
npm install -D tailwindcss @tailwindcss/vite @tailwindcss/typography@next
```

* [ ] **Step 5: 安装功能依赖**

Run:

```bash
npm install react-markdown remark-gfm react-syntax-highlighter
npm install -D @types/react-syntax-highlighter
```

* [ ] **Step 6: 配置 Vite（vite.config.ts）**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

* [ ] **Step 7: 配置 Tailwind 入口样式（src/index.css）**

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

* [ ] **Step 8: 配置环境变量类型声明（src/vite-env.d.ts）**

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ZHIPU_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

* [ ] **Step 9: 清理默认模板文件**

删除 `src/App.css`，清空 `src/App.tsx` 内容为：

```tsx
function App() {
  return (
    <div className="h-screen bg-gray-50">
      <h1 className="text-2xl font-bold text-center pt-8">AI 聊天助手</h1>
    </div>
  )
}

export default App
```

* [ ] **Step 10: 验证项目启动**

Run:

```bash
npm run dev
```

Expected: 浏览器打开后显示 "AI 聊天助手" 标题

* [ ] **Step 11: 提交**

```bash
git add .
git commit -m "feat: 初始化项目，配置 Vite + React + TypeScript + Tailwind v4"
```

***

### Task 2: 环境变量配置

**Files:**

* Create: `.env`

* [ ] **Step 1: 创建 .env 文件**

```
VITE_ZHIPU_API_KEY=你的智谱API_KEY
```

> ⚠️ 请将 `你的智谱API_KEY` 替换为你从智谱 AI 开放平台申请的真实 API Key。此文件已在 `.gitignore` 中排除，不会被提交到 Git。

* [ ] **Step 2: 提交**

```bash
git add src/vite-env.d.ts
git commit -m "feat: 配置环境变量类型声明"
```

注意：.env 文件不提交到 git。

***

### Task 3: 类型定义

**Files:**

* Create: `src/types/message.ts`

* [ ] **Step 1: 创建 Message 类型**

```typescript
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}
```

* [ ] **Step 2: 提交**

```bash
git add src/types/message.ts
git commit -m "feat: 添加 Message 类型定义"
```

***

### Task 4: LocalStorage 服务

**Files:**

* Create: `src/services/storage.ts`

* [ ] **Step 1: 实现 LocalStorage 封装**

```typescript
import { Message } from '../types/message'

const STORAGE_KEY = 'chat-messages'

export function loadMessages(): Message[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveMessages(messages: Message[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  } catch {
    console.error('保存对话历史失败')
  }
}

export function clearMessages(): void {
  localStorage.removeItem(STORAGE_KEY)
}
```

* [ ] **Step 2: 提交**

```bash
git add src/services/storage.ts
git commit -m "feat: 实现 LocalStorage 存储服务"
```

***

### Task 5: 智谱 AI API 服务

**Files:**

* Create: `src/services/api.ts`

* [ ] **Step 1: 实现流式 API 调用**

```typescript
import { Message } from '../types/message'

const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
const MODEL = 'glm-4-flash'

function buildHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_ZHIPU_API_KEY}`,
  }
}

function buildBody(messages: Pick<Message, 'role' | 'content'>[]) {
  return JSON.stringify({
    model: MODEL,
    messages: messages.map(({ role, content }) => ({ role, content })),
    stream: true,
  })
}

export async function streamChat(
  messages: Pick<Message, 'role' | 'content'>[],
  onChunk: (text: string) => void,
  onError: (error: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: buildHeaders(),
      body: buildBody(messages),
      signal,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      onError(errorData.error?.message || `请求失败 (${response.status})`)
      return
    }

    const reader = response.body?.getReader()
    if (!reader) {
      onError('无法读取响应流')
      return
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data:')) continue

        const data = trimmed.slice(5).trim()
        if (data === '[DONE]') return

        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) {
            onChunk(content)
          }
        } catch {
          continue
        }
      }
    }
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') return
    onError(err instanceof Error ? err.message : '网络请求异常，请检查网络连接')
  }
}
```

* [ ] **Step 2: 提交**

```bash
git add src/services/api.ts
git commit -m "feat: 实现智谱 AI 流式 API 调用服务"
```

***

### Task 6: 聊天逻辑 Hook

**Files:**

* Create: `src/hooks/useChat.ts`

* [ ] **Step 1: 实现 useChat Hook**

```typescript
import { useState, useCallback, useRef, useEffect } from 'react'
import { Message } from '../types/message'
import { streamChat } from '../services/api'
import { loadMessages, saveMessages, clearMessages as clearStorage } from '../services/storage'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>(loadMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const sendingRef = useRef(false)

  useEffect(() => {
    const timer = setTimeout(() => saveMessages(messages), 300)
    return () => clearTimeout(timer)
  }, [messages])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || sendingRef.current) return

    sendingRef.current = true
    setError(null)

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    }

    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    }

    const conversationMessages = [...messages, userMessage]
    const apiMessages = conversationMessages.map(({ role, content: c }) => ({ role, content: c }))

    setMessages([...conversationMessages, assistantMessage])
    setIsLoading(true)

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    await streamChat(
      apiMessages,
      (chunk) => {
        setMessages((prev) => {
          const updated = [...prev]
          const lastMsg = updated[updated.length - 1]
          if (lastMsg && lastMsg.role === 'assistant') {
            updated[updated.length - 1] = { ...lastMsg, content: lastMsg.content + chunk }
          }
          return updated
        })
      },
      (errorMsg) => {
        setError(errorMsg)
        setMessages((prev) => {
          const updated = [...prev]
          const lastMsg = updated[updated.length - 1]
          if (lastMsg && lastMsg.role === 'assistant' && !lastMsg.content) {
            updated[updated.length - 1] = { ...lastMsg, content: `❌ ${errorMsg}` }
          }
          return updated
        })
      },
      abortController.signal,
    )

    setIsLoading(false)
    abortControllerRef.current = null
    sendingRef.current = false
  }, [messages])

  const clearChat = useCallback(() => {
    abortControllerRef.current?.abort()
    setMessages([])
    clearStorage()
    setIsLoading(false)
    setError(null)
    sendingRef.current = false
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort()
    setIsLoading(false)
    sendingRef.current = false

    setMessages((prev) => {
      const updated = [...prev]
      const lastMsg = updated[updated.length - 1]
      if (lastMsg && lastMsg.role === 'assistant') {
        if (!lastMsg.content) {
          updated.pop()
        } else {
          updated[updated.length - 1] = { ...lastMsg, content: lastMsg.content + '\n\n*[已停止生成]*' }
        }
      }
      return updated
    })
  }, [])

  return { messages, isLoading, error, sendMessage, clearChat, stopGeneration, clearError }
}
```

* [ ] **Step 2: 提交**

```bash
git add src/hooks/useChat.ts
git commit -m "feat: 实现聊天逻辑 Hook"
```

***

### Task 7: CodeBlock 组件

**Files:**

* Create: `src/components/CodeBlock.tsx`

* [ ] **Step 1: 实现代码块组件（语法高亮 + 复制按钮）**

```tsx
import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodeBlockProps {
  language: string
  code: string
}

export function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group rounded-lg overflow-hidden my-2">
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2 text-xs text-gray-400">
        <span>{language || '代码'}</span>
        <button
          onClick={handleCopy}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {copied ? '✓ 已复制' : '复制'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.875rem' }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}
```

* [ ] **Step 2: 提交**

```bash
git add src/components/CodeBlock.tsx
git commit -m "feat: 实现代码块组件（语法高亮 + 复制）"
```

***

### Task 8: MessageItem 组件

**Files:**

* Create: `src/components/MessageItem.tsx`

* [ ] **Step 1: 实现消息项组件（Markdown 渲染 + 复制按钮）**

```tsx
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Message } from '../types/message'
import { CodeBlock } from './CodeBlock'

interface MessageItemProps {
  message: Message
}

export function MessageItem({ message }: MessageItemProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`relative max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-800 shadow-sm border border-gray-100'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none break-words">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  const codeString = String(children).replace(/\n$/, '')

                  if (match) {
                    return <CodeBlock language={match[1]} code={codeString} />
                  }

                  return (
                    <code
                      className={`px-1.5 py-0.5 rounded text-sm font-mono ${
                        isUser ? 'bg-blue-600 text-blue-100' : 'bg-gray-100 text-gray-800'
                      }`}
                      {...props}
                    >
                      {children}
                    </code>
                  )
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {!isUser && message.content && (
          <button
            onClick={handleCopy}
            className="absolute -bottom-6 right-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            {copied ? '✓ 已复制' : '复制'}
          </button>
        )}
      </div>
    </div>
  )
}
```

* [ ] **Step 2: 提交**

```bash
git add src/components/MessageItem.tsx
git commit -m "feat: 实现消息项组件（Markdown 渲染 + 复制）"
```

***

### Task 9: MessageList 组件

**Files:**

* Create: `src/components/MessageList.tsx`

* [ ] **Step 1: 实现消息列表组件（含自动滚动）**

```tsx
import { useEffect, useRef } from 'react'
import { Message } from '../types/message'
import { MessageItem } from './MessageItem'

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const isAtBottom = () => {
    const el = containerRef.current
    if (!el) return true
    return el.scrollHeight - el.scrollTop - el.clientHeight < 150
  }

  useEffect(() => {
    if (isAtBottom()) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="text-5xl mb-4">💬</div>
          <p className="text-lg">开始和 AI 对话吧</p>
          <p className="text-sm mt-2">输入你的问题，AI 将为你解答</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-6">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
      {isLoading && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1]?.content && (
        <div className="flex justify-start mb-4">
          <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
            <div className="flex space-x-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
```

* [ ] **Step 2: 提交**

```bash
git add src/components/MessageList.tsx
git commit -m "feat: 实现消息列表组件（含自动滚动和加载动画）"
```

***

### Task 10: InputArea 组件

**Files:**

* Create: `src/components/InputArea.tsx`

* [ ] **Step 1: 实现输入区域组件**

```tsx
import { useState, KeyboardEvent } from 'react'

interface InputAreaProps {
  onSend: (content: string) => void
  isLoading: boolean
  onStop: () => void
}

export function InputArea({ onSend, isLoading, onStop }: InputAreaProps) {
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim() || isLoading) return
    onSend(input)
    setInput('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      <div className="flex items-end gap-3 max-w-3xl mx-auto">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息... (Enter 发送，Shift+Enter 换行)"
          rows={1}
          className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32"
          style={{ minHeight: '44px' }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement
            target.style.height = 'auto'
            target.style.height = Math.min(target.scrollHeight, 128) + 'px'
          }}
        />
        {isLoading ? (
          <button
            onClick={onStop}
            className="rounded-xl bg-red-500 px-4 py-2.5 text-sm text-white hover:bg-red-600 transition-colors shrink-0"
          >
            停止
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="rounded-xl bg-blue-500 px-4 py-2.5 text-sm text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            发送
          </button>
        )}
      </div>
    </div>
  )
}
```

* [ ] **Step 2: 提交**

```bash
git add src/components/InputArea.tsx
git commit -m "feat: 实现输入区域组件"
```

***

### Task 11: ChatWindow 主组件

**Files:**

* Create: `src/components/ChatWindow.tsx`

* [ ] **Step 1: 实现主聊天窗口组件**

```tsx
import { useChat } from '../hooks/useChat'
import { MessageList } from './MessageList'
import { InputArea } from './InputArea'

export function ChatWindow() {
  const { messages, isLoading, error, sendMessage, clearChat, stopGeneration, clearError } = useChat()

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="flex items-center justify-between bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
        <h1 className="text-lg font-semibold text-gray-800">🤖 AI 聊天助手</h1>
        <button
          onClick={clearChat}
          className="text-sm text-gray-500 hover:text-red-500 transition-colors px-3 py-1 rounded-lg hover:bg-red-50"
        >
          清空对话
        </button>
      </header>

      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-2 text-sm text-red-600 flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={clearError} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      <MessageList messages={messages} isLoading={isLoading} />
      <InputArea onSend={sendMessage} isLoading={isLoading} onStop={stopGeneration} />
    </div>
  )
}
```

* [ ] **Step 2: 提交**

```bash
git add src/components/ChatWindow.tsx
git commit -m "feat: 实现主聊天窗口组件"
```

***

### Task 12: App 入口集成

**Files:**

* Modify: `src/App.tsx`

* [ ] **Step 1: 更新 App.tsx**

```tsx
import { ChatWindow } from './components/ChatWindow'

function App() {
  return <ChatWindow />
}

export default App
```

* [ ] **Step 2: 提交**

```bash
git add src/App.tsx
git commit -m "feat: 集成聊天窗口到 App 入口"
```

***

### Task 13: 验证与修复

**Files:**

* 可能修改: 上述所有文件

* [ ] **Step 1: 启动开发服务器**

Run:

```bash
npm run dev
```

* [ ] **Step 2: 功能验证清单**

逐项验证：

1. ✅ 页面正常加载，显示空状态提示
2. ✅ 输入消息并发送，AI 流式回答逐字显示
3. ✅ 多轮对话，AI 能记住上下文
4. ✅ 刷新页面后对话历史保留
5. ✅ 清空对话功能正常
6. ✅ Markdown 渲染正常（标题、列表、加粗等）
7. ✅ 代码块语法高亮正常
8. ✅ 复制按钮功能正常
9. ✅ 新消息自动滚动到底部
10. ✅ 加载中有动画提示
11. ✅ API 错误有友好提示
12. ✅ 停止生成功能正常

* [ ] **Step 3: 运行 TypeScript 类型检查**

Run:

```bash
npx tsc --noEmit
```

Expected: 无类型错误

* [ ] **Step 4: 运行构建**

Run:

```bash
npm run build
```

Expected: 构建成功

* [ ] **Step 5: 修复发现的问题**

根据验证结果修复任何问题。

* [ ] **Step 6: 最终提交**

```bash
git add .
git commit -m "feat: AI 聊天助手开发完成"
```

