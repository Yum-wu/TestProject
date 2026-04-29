# 智能写作助手 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个基于 React + Vite 的 AI 智能写作助手，提供三栏布局界面，支持 6 种写作模式、流式输出、提示词优化、历史记录功能。

**Architecture:** 采用 React 组件化架构，左侧 Sidebar 展示历史记录，中间 InputPanel 处理用户输入和参数控制，右侧 OutputPanel 流式显示 AI 生成结果。使用自定义 Hook 封装流式请求和本地存储逻辑。

**Tech Stack:** React 18, Vite, fetch API (ReadableStream), localStorage, CSS Modules

---

### Task 1: 项目初始化

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/App.jsx`
- Create: `src/App.css`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "ai-writing-assistant",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-markdown": "^9.0.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8"
  }
}
```

- [ ] **Step 2: 创建 vite.config.js**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  }
})
```

- [ ] **Step 3: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI 智能写作助手</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 4: 创建 src/main.jsx**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 5: 创建 src/index.css**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  background: #ffffff;
  color: #333;
  -webkit-font-smoothing: antialiased;
}

#root {
  width: 100vw;
  height: 100vh;
}
```

- [ ] **Step 6: 创建 src/App.jsx（初始版本）**

```jsx
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>AI 智能写作助手</h1>
      </header>
      <div className="app-body">
        <aside className="app-sidebar">
          <p>历史记录</p>
        </aside>
        <main className="app-main">
          <p>输入区</p>
        </main>
        <section className="app-output">
          <p>结果区</p>
        </section>
      </div>
    </div>
  )
}

export default App
```

- [ ] **Step 7: 创建 src/App.css**

```css
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.app-header {
  padding: 16px 24px;
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  text-align: center;
}

.app-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
}

.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.app-sidebar {
  width: 220px;
  background: #f5f5f5;
  border-right: 1px solid #e8e8e8;
  padding: 12px;
  overflow-y: auto;
}

.app-main {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e8e8e8;
}

.app-output {
  width: 45%;
  padding: 16px;
  overflow-y: auto;
}
```

- [ ] **Step 8: 安装依赖并验证项目启动**

```bash
npm install
```

Expected: Dependencies installed successfully.

```bash
npm run dev
```

Expected: Dev server starts on http://localhost:3000, page renders with basic layout.

- [ ] **Step 9: 提交**

```bash
git add .
git commit -m "feat: 初始化 React + Vite 项目，搭建三栏布局框架"
```

---

### Task 2: 提示词模板模块

**Files:**
- Create: `src/prompts.js`

- [ ] **Step 1: 创建 src/prompts.js**

```js
/**
 * 写作助手提示词模板模块
 * 从 prompts.md 提取的 6 种写作模式提示词
 */

const WRITING_MODES = {
  continuation: {
    label: '续写',
    systemPrompt: `你是一位专业作家。请基于用户提供的文本继续创作，要求：
1. 保持原有文体风格和语调一致
2. 确保逻辑连贯、情节自然过渡
3. 在适当位置添加细节描写、人物对话或场景渲染
4. 按照用户指定的输出长度生成内容
5. 如果遇到技术或专业内容，请确保准确性

请继续创作：`,
    defaultTemperature: 0.7,
    defaultLength: 'medium',
  },
  rewrite: {
    label: '改写',
    systemPrompt: `你是一位资深编辑。请对用户提供的内容进行润色和改写，要求：
1. 提升语言表达的流畅度和专业度
2. 修正语法错误和用词不当之处
3. 优化句子结构，避免冗长和重复
4. 根据用户指定的风格（正式/轻松/学术/商业等）调整语调
5. 保持核心意思不变，但提升可读性

改写后的文本：`,
    defaultTemperature: 0.3,
    defaultLength: 'medium',
  },
  expand: {
    label: '扩展',
    systemPrompt: `你是一位研究专家。请对用户提供的核心内容进行深度扩展，要求：
1. 围绕主题添加具体的数据、案例或引用
2. 提供多角度分析和深入见解
3. 使用举例说明、对比论证等方法丰富内容
4. 确保扩展内容与原文逻辑关联紧密
5. 根据用户指定的创意度调整内容的创新性

扩展后的内容：`,
    defaultTemperature: 0.8,
    defaultLength: 'long',
  },
  summarize: {
    label: '总结',
    systemPrompt: `你是一位高效的分析师。请提取用户提供内容的核心要点，要求：
1. 准确提炼关键信息和结论
2. 采用结构化的呈现方式（如要点列表、层级结构）
3. 去除冗余细节，保留实质内容
4. 保持客观中立，不添加个人解读
5. 确保总结长度符合用户指定要求

核心要点总结：`,
    defaultTemperature: 0.2,
    defaultLength: 'short',
  },
  email: {
    label: '邮件',
    systemPrompt: `你是一位专业的商务沟通顾问。请根据用户需求撰写邮件，要求：
1. 根据邮件类型（正式/友好/商务/个人）选择合适的称呼和结尾
2. 主题行要简洁明确，一目了然
3. 正文结构清晰：开场白 → 核心内容 → 行动呼吁 → 结束语
4. 语气礼貌得体，符合商务礼仪
5. 根据用户提供的主题和要点生成完整内容

邮件正文：`,
    defaultTemperature: 0.5,
    defaultLength: 'medium',
  },
  copywriting: {
    label: '文案',
    systemPrompt: `你是一位创意文案总监。请为用户指定的产品或服务撰写营销文案，要求：
1. 准确把握目标受众特征和心理需求
2. 突出产品核心卖点和独特价值主张
3. 使用有感染力的语言和情感共鸣
4. 根据指定风格（故事型/数据型/对比型/情感型等）构建文案框架
5. 包含明确的行动呼吁（CTA）

营销文案：`,
    defaultTemperature: 0.9,
    defaultLength: 'medium',
  },
}

// 优化提示词的系统提示词
const OPTIMIZE_PROMPT = `你是一位专业的AI提示词工程师。请根据用户提供的原始写作需求，优化其描述，使其更加清晰、具体、有针对性。

优化原则：
1. 补充具体细节和上下文
2. 明确写作目标和受众
3. 提供风格指导
4. 添加限制条件或特殊要求

优化后的提示词：`

// 输出长度映射
const LENGTH_MAP = {
  short: 500,
  medium: 1000,
  long: 2000,
  extended: 4000,
}

export { WRITING_MODES, OPTIMIZE_PROMPT, LENGTH_MAP }
```

- [ ] **Step 2: 提交**

```bash
git add src/prompts.js
git commit -m "feat: 添加 6 种写作模式提示词模板和优化提示词"
```

---

### Task 3: 流式请求 Hook

**Files:**
- Create: `src/hooks/useStreaming.js`

- [ ] **Step 1: 创建 src/hooks/useStreaming.js**

```js
import { useState, useCallback, useRef } from 'react'

/**
 * 流式请求 Hook
 * 处理 SSE/流式 API 请求，逐块读取响应数据
 */
export function useStreaming() {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortControllerRef = useRef(null)

  /**
   * 发送流式请求
   * @param {Object} params - 请求参数
   * @param {string} params.messages - 消息数组
   * @param {number} params.temperature - 创意度
   * @param {number} params.maxTokens - 最大 token 数
   * @param {function} [params.onChunk] - 每收到一个 chunk 的回调
   */
  const sendRequest = useCallback(async ({ messages, temperature, maxTokens, onChunk }) => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    setIsLoading(true)
    setError(null)
    setContent('')

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: true,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              const delta = parsed.choices?.[0]?.delta?.content || ''
              if (delta) {
                setContent(prev => prev + delta)
                if (onChunk) onChunk(delta)
              }
            } catch (e) {
              // 忽略无效的 JSON 片段
            }
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || '请求失败，请稍后重试')
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }, [])

  /**
   * 停止生成
   */
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsLoading(false)
    }
  }, [])

  return { content, isLoading, error, sendRequest, stopGeneration }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/hooks/useStreaming.js
git commit -m "feat: 实现流式请求 Hook，支持 SSE 逐块读取和中断"
```

---

### Task 4: 历史记录 Hook

**Files:**
- Create: `src/hooks/useHistory.js`

- [ ] **Step 1: 创建 src/hooks/useHistory.js**

```js
import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'ai-writing-history'

/**
 * 历史记录 Hook
 * 管理 localStorage 中的写作历史记录
 */
export function useHistory() {
  const [records, setRecords] = useState([])

  // 初始化时从 localStorage 加载
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setRecords(JSON.parse(stored))
      }
    } catch (e) {
      console.error('加载历史记录失败:', e)
    }
  }, [])

  /**
   * 保存记录到 localStorage
   */
  const persistRecords = useCallback((newRecords) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords))
    } catch (e) {
      console.error('保存历史记录失败:', e)
    }
  }, [])

  /**
   * 添加新记录
   */
  const addRecord = useCallback((record) => {
    const newRecord = {
      id: Date.now().toString(),
      mode: record.mode,
      input: record.input,
      output: record.output,
      temperature: record.temperature,
      length: record.length,
      timestamp: new Date().toISOString(),
    }
    setRecords(prev => {
      const updated = [newRecord, ...prev]
      persistRecords(updated)
      return updated
    })
    return newRecord
  }, [persistRecords])

  /**
   * 删除记录
   */
  const deleteRecord = useCallback((id) => {
    setRecords(prev => {
      const updated = prev.filter(r => r.id !== id)
      persistRecords(updated)
      return updated
    })
  }, [persistRecords])

  /**
   * 清空所有记录
   */
  const clearAll = useCallback(() => {
    setRecords([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { records, addRecord, deleteRecord, clearAll }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/hooks/useHistory.js
git commit -m "feat: 实现历史记录 Hook，支持 localStorage 持久化"
```

---

### Task 5: 输入区组件

**Files:**
- Create: `src/components/InputPanel.jsx`
- Create: `src/components/InputPanel.css`

- [ ] **Step 1: 创建 src/components/InputPanel.jsx**

```jsx
import { useState } from 'react'
import { WRITING_MODES, LENGTH_MAP } from '../prompts'
import styles from './InputPanel.css'

export default function InputPanel({
  onGenerate,
  onOptimize,
  isLoading,
  inputValue,
  onInputChange,
}) {
  const [mode, setMode] = useState('continuation')
  const [temperature, setTemperature] = useState(WRITING_MODES.continuation.defaultTemperature)
  const [outputLength, setOutputLength] = useState(WRITING_MODES.continuation.defaultLength)

  // 切换模式时重置默认参数
  const handleModeChange = (newMode) => {
    setMode(newMode)
    setTemperature(WRITING_MODES[newMode].defaultTemperature)
    setOutputLength(WRITING_MODES[newMode].defaultLength)
  }

  const handleGenerate = () => {
    if (!inputValue.trim()) {
      alert('请输入内容')
      return
    }
    onGenerate({
      mode,
      input: inputValue,
      temperature,
      maxTokens: LENGTH_MAP[outputLength],
    })
  }

  const handleOptimize = () => {
    if (!inputValue.trim()) {
      alert('请输入需要优化的内容')
      return
    }
    onOptimize(inputValue)
  }

  return (
    <div className={styles.container}>
      {/* 模式选择 */}
      <div className={styles.modeBar}>
        {Object.entries(WRITING_MODES).map(([key, { label }]) => (
          <button
            key={key}
            className={`${styles.modeBtn} ${mode === key ? styles.active : ''}`}
            onClick={() => handleModeChange(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 输入框 */}
      <textarea
        className={styles.textarea}
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder="请输入您的文本内容..."
        rows={10}
      />

      {/* 参数控制 */}
      <div className={styles.params}>
        <div className={styles.paramItem}>
          <label>创意度: {temperature.toFixed(1)}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
          />
        </div>
        <div className={styles.paramItem}>
          <label>长度:</label>
          <select
            value={outputLength}
            onChange={(e) => setOutputLength(e.target.value)}
            className={styles.select}
          >
            <option value="short">短 (~200字)</option>
            <option value="medium">中 (~500字)</option>
            <option value="long">长 (~1000字)</option>
            <option value="extended">超长 (~2000字)</option>
          </select>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className={styles.actions}>
        <button
          className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={handleOptimize}
          disabled={isLoading}
        >
          ✨ 优化提示词
        </button>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={handleGenerate}
          disabled={isLoading}
        >
          {isLoading ? '⏹ 停止生成' : '🚀 生成内容'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 创建 src/components/InputPanel.css**

```css
.container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.modeBar {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.modeBtn {
  padding: 6px 14px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fafafa;
  color: #666;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.modeBtn:hover {
  border-color: #4a90d9;
  color: #4a90d9;
}

.modeBtn.active {
  background: #4a90d9;
  color: #fff;
  border-color: #4a90d9;
}

.textarea {
  width: 100%;
  flex: 1;
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  outline: none;
  transition: border-color 0.2s;
}

.textarea:focus {
  border-color: #4a90d9;
  box-shadow: 0 0 0 2px rgba(74, 144, 217, 0.1);
}

.params {
  display: flex;
  gap: 16px;
  align-items: center;
}

.paramItem {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
}

.paramItem input[type="range"] {
  width: 100px;
}

.select {
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
  background: #fff;
  cursor: pointer;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btnPrimary {
  background: #5cb85c;
  color: #fff;
  flex: 1;
}

.btnPrimary:hover:not(:disabled) {
  background: #4cae4c;
}

.btnSecondary {
  background: #f0ad4e;
  color: #fff;
}

.btnSecondary:hover:not(:disabled) {
  background: #ec971f;
}
```

- [ ] **Step 3: 提交**

```bash
git add src/components/InputPanel.jsx src/components/InputPanel.css
git commit -m "feat: 实现输入区组件，支持模式切换、参数控制、操作按钮"
```

---

### Task 6: 输出区组件

**Files:**
- Create: `src/components/OutputPanel.jsx`
- Create: `src/components/OutputPanel.css`

- [ ] **Step 1: 创建 src/components/OutputPanel.jsx**

```jsx
import { useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import styles from './OutputPanel.css'

export default function OutputPanel({ content, isLoading, error }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    if (!content) return
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('复制失败:', e)
    }
  }, [content])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>📄 生成结果</h3>
        {content && (
          <button
            className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
            onClick={handleCopy}
          >
            {copied ? '✓ 已复制' : '📋 复制'}
          </button>
        )}
      </div>

      <div className={styles.content}>
        {isLoading && !content && (
          <div className={styles.loading}>
            <span className={styles.cursor}></span>
            <span>AI 正在思考...</span>
          </div>
        )}

        {content && (
          <div className={styles.markdown}>
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <p>⚠️ {error}</p>
            {content && <p className={styles.partial}>(已保留生成的内容)</p>}
          </div>
        )}

        {!content && !isLoading && !error && (
          <p className={styles.placeholder}>生成的内容将在这里显示...</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 创建 src/components/OutputPanel.css**

```css
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.header h3 {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.copyBtn {
  padding: 4px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.copyBtn:hover {
  border-color: #4a90d9;
  color: #4a90d9;
}

.copyBtn.copied {
  background: #5cb85c;
  color: #fff;
  border-color: #5cb85c;
}

.content {
  flex: 1;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  overflow-y: auto;
}

.loading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #999;
  font-size: 14px;
}

.cursor {
  display: inline-block;
  width: 2px;
  height: 16px;
  background: #4a90d9;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.markdown {
  font-size: 14px;
  line-height: 1.8;
  color: #333;
}

.markdown p {
  margin-bottom: 12px;
}

.markdown ul, .markdown ol {
  padding-left: 20px;
  margin-bottom: 12px;
}

.error {
  color: #d9534f;
  font-size: 14px;
}

.partial {
  color: #999;
  font-size: 12px;
  margin-top: 8px;
}

.placeholder {
  color: #ccc;
  font-size: 14px;
  text-align: center;
  margin-top: 40px;
}
```

- [ ] **Step 3: 提交**

```bash
git add src/components/OutputPanel.jsx src/components/OutputPanel.css
git commit -m "feat: 实现输出区组件，支持 Markdown 渲染、复制功能、加载动画"
```

---

### Task 7: 侧边栏组件

**Files:**
- Create: `src/components/Sidebar.jsx`
- Create: `src/components/Sidebar.css`

- [ ] **Step 1: 创建 src/components/Sidebar.jsx**

```jsx
import styles from './Sidebar.css'

export default function Sidebar({ records, onSelect, onDelete }) {
  const formatTime = (isoString) => {
    const date = new Date(isoString)
    const now = new Date()
    const diff = now - date

    if (diff < 60 * 1000) return '刚刚'
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)}小时前`
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  const getModeLabel = (mode) => {
    const labels = {
      continuation: '续写',
      rewrite: '改写',
      expand: '扩展',
      summarize: '总结',
      email: '邮件',
      copywriting: '文案',
    }
    return labels[mode] || mode
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>📚 历史记录</h3>
        {records.length > 0 && (
          <span className={styles.count}>({records.length})</span>
        )}
      </div>

      <div className={styles.list}>
        {records.length === 0 && (
          <p className={styles.empty}>暂无历史记录</p>
        )}

        {records.map((record) => (
          <div key={record.id} className={styles.item}>
            <div
              className={styles.itemContent}
              onClick={() => onSelect(record)}
            >
              <div className={styles.itemHeader}>
                <span className={`${styles.badge} ${styles[`badge-${record.mode}`]}`}>
                  {getModeLabel(record.mode)}
                </span>
                <span className={styles.time}>{formatTime(record.timestamp)}</span>
              </div>
              <p className={styles.itemText}>
                {record.input.substring(0, 30)}{record.input.length > 30 ? '...' : ''}
              </p>
            </div>
            <button
              className={styles.deleteBtn}
              onClick={(e) => {
                e.stopPropagation()
                onDelete(record.id)
              }}
              title="删除"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 创建 src/components/Sidebar.css**

```css
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e8e8e8;
}

.header h3 {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.count {
  font-size: 12px;
  color: #999;
}

.list {
  flex: 1;
  overflow-y: auto;
}

.empty {
  text-align: center;
  color: #ccc;
  font-size: 13px;
  margin-top: 40px;
}

.item {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  padding: 8px;
  margin-bottom: 4px;
  border-radius: 6px;
  transition: background 0.2s;
  cursor: pointer;
}

.item:hover {
  background: #e8e8e8;
}

.itemContent {
  flex: 1;
  min-width: 0;
}

.itemHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  color: #fff;
}

.badge-continuation { background: #4a90d9; }
.badge-rewrite { background: #5cb85c; }
.badge-expand { background: #f0ad4e; }
.badge-summarize { background: #d9534f; }
.badge-email { background: #6f42c1; }
.badge-copywriting { background: #e83e8c; }

.time {
  font-size: 11px;
  color: #999;
}

.itemText {
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.deleteBtn {
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: #ccc;
  font-size: 16px;
  cursor: pointer;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.deleteBtn:hover {
  background: #d9534f;
  color: #fff;
}
```

- [ ] **Step 3: 提交**

```bash
git add src/components/Sidebar.jsx src/components/Sidebar.css
git commit -m "feat: 实现侧边栏组件，支持历史记录列表展示、时间格式化、单条删除"
```

---

### Task 8: 整合 App 组件

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/App.css`
- Create: `.env.example`

- [ ] **Step 1: 更新 src/App.jsx**

```jsx
import { useState, useCallback } from 'react'
import { WRITING_MODES, OPTIMIZE_PROMPT, LENGTH_MAP } from './prompts'
import { useStreaming } from './hooks/useStreaming'
import { useHistory } from './hooks/useHistory'
import Sidebar from './components/Sidebar'
import InputPanel from './components/InputPanel'
import OutputPanel from './components/OutputPanel'
import './App.css'

function App() {
  const [inputValue, setInputValue] = useState('')
  const { content, isLoading, error, sendRequest, stopGeneration } = useStreaming()
  const { records, addRecord, deleteRecord } = useHistory()

  /**
   * 处理生成内容
   */
  const handleGenerate = useCallback(async ({ mode, input, temperature, maxTokens }) => {
    const systemPrompt = WRITING_MODES[mode].systemPrompt

    // 如果正在生成中，停止并保存当前结果
    if (isLoading) {
      stopGeneration()
      // 保存当前已生成的内容
      if (content) {
        addRecord({ mode, input, output: content, temperature, length: maxTokens })
      }
      return
    }

    await sendRequest({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input },
      ],
      temperature,
      maxTokens,
    })

    // 生成完成后保存到历史记录（注意：需要在 content 更新后再保存）
    // 使用 setTimeout 确保 content 已更新
    setTimeout(() => {
      // 此处需要从 useStreaming 获取最终 content
      // 由于是异步操作，我们在组件中通过 content state 获取
    }, 100)
  }, [isLoading, content, stopGeneration, sendRequest, addRecord])

  /**
   * 处理优化提示词
   */
  const handleOptimize = useCallback(async (input) => {
    if (isLoading) return

    await sendRequest({
      messages: [
        { role: 'system', content: OPTIMIZE_PROMPT },
        { role: 'user', content: input },
      ],
      temperature: 0.5,
      maxTokens: LENGTH_MAP.medium,
      onChunk: (delta) => {
        // 优化结果实时替换输入框内容
        // 由于 useStreaming 内部维护 content，这里需要特殊处理
      },
    })
  }, [isLoading, sendRequest])

  /**
   * 处理历史记录选择
   */
  const handleSelectRecord = useCallback((record) => {
    setInputValue(record.input)
    // 可以将历史输出也显示在输出区
  }, [])

  /**
   * 处理历史记录删除
   */
  const handleDeleteRecord = useCallback((id) => {
    deleteRecord(id)
  }, [deleteRecord])

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI 智能写作助手</h1>
      </header>
      <div className="app-body">
        <aside className="app-sidebar">
          <Sidebar
            records={records}
            onSelect={handleSelectRecord}
            onDelete={handleDeleteRecord}
          />
        </aside>
        <main className="app-main">
          <InputPanel
            inputValue={inputValue}
            onInputChange={setInputValue}
            onGenerate={handleGenerate}
            onOptimize={handleOptimize}
            isLoading={isLoading}
          />
        </main>
        <section className="app-output">
          <OutputPanel
            content={content}
            isLoading={isLoading}
            error={error}
          />
        </section>
      </div>
    </div>
  )
}

export default App
```

- [ ] **Step 2: 创建 .env.example**

```
VITE_API_BASE_URL=https://api.openai.com
VITE_API_KEY=your-api-key-here
```

- [ ] **Step 3: 提交**

```bash
git add src/App.jsx src/App.css .env.example
git commit -m "feat: 整合所有组件，实现完整的三栏布局和状态管理"
```

---

### Task 9: 修复生成后保存逻辑

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: 优化生成完成后的历史记录保存逻辑**

修改 `src/App.jsx`，使用 useEffect 监听 content 和 isLoading 变化：

```jsx
import { useState, useCallback, useEffect, useRef } from 'react'
// ... 其他 imports 保持不变

function App() {
  const [inputValue, setInputValue] = useState('')
  const [lastGenerateParams, setLastGenerateParams] = useState(null)
  const { content, isLoading, error, sendRequest, stopGeneration } = useStreaming()
  const { records, addRecord, deleteRecord } = useHistory()

  // 保存当前操作的输入内容
  const currentInputRef = useRef('')

  /**
   * 当生成完成时，保存到历史记录
   */
  useEffect(() => {
    if (!isLoading && content && lastGenerateParams) {
      addRecord({
        ...lastGenerateParams,
        output: content,
      })
      setLastGenerateParams(null)
    }
  }, [isLoading, content, lastGenerateParams, addRecord])

  const handleGenerate = useCallback(async ({ mode, input, temperature, maxTokens }) => {
    if (isLoading) {
      stopGeneration()
      return
    }

    currentInputRef.current = input
    const systemPrompt = WRITING_MODES[mode].systemPrompt

    setLastGenerateParams({ mode, input, temperature, length: maxTokens })

    await sendRequest({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input },
      ],
      temperature,
      maxTokens,
    })
  }, [isLoading, stopGeneration, sendRequest])

  // ... handleOptimize 保持不变

  return (
    // ... JSX 保持不变
  )
}

export default App
```

- [ ] **Step 2: 提交**

```bash
git add src/App.jsx
git commit -m "fix: 修复生成完成后自动保存历史记录的逻辑"
```

---

### Task 10: 添加环境变量和优化提示词回填功能

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/hooks/useStreaming.js`
- Create: `.env`

- [ ] **Step 1: 创建 .env（本地开发用）**

```
VITE_API_BASE_URL=https://api.openai.com
VITE_API_KEY=sk-placeholder
```

- [ ] **Step 2: 修改 useStreaming.js，添加优化模式支持**

在 `src/hooks/useStreaming.js` 中添加一个选项参数 `onReplace`：

```js
// 修改 sendRequest 函数签名
const sendRequest = useCallback(async ({
  messages,
  temperature,
  maxTokens,
  onChunk,
  onReplace,  // 新增：用于替换内容的回调
}) => {
  // ... 前面的代码不变

  // 在 while 循环中，处理 chunk 时：
  if (delta) {
    if (onReplace) {
      // 替换模式（用于优化提示词）
      setContent(prev => {
        const newContent = prev + delta
        onReplace(newContent)
        return newContent
      })
    } else {
      // 追加模式（用于正常生成）
      setContent(prev => prev + delta)
      if (onChunk) onChunk(delta)
    }
  }
  // ... 后面的代码不变
})
```

- [ ] **Step 3: 修改 App.jsx 中的 handleOptimize**

```jsx
const handleOptimize = useCallback(async (input) => {
  if (isLoading) return

  await sendRequest({
    messages: [
      { role: 'system', content: OPTIMIZE_PROMPT },
      { role: 'user', content: input },
    ],
    temperature: 0.5,
    maxTokens: LENGTH_MAP.medium,
    onReplace: (newContent) => {
      setInputValue(newContent)
    },
  })
}, [isLoading, sendRequest])
```

- [ ] **Step 4: 提交**

```bash
git add .env src/App.jsx src/hooks/useStreaming.js
git commit -m "feat: 添加环境变量和优化提示词回填功能"
```