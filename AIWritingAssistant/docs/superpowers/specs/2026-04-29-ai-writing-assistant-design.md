# 智能写作助手 - 设计文档

> 日期：2026-04-29

## 1. 概述

### 目标
构建一个基于 Web 的 AI 智能写作助手，提供左右分栏的文本输入与生成结果展示界面，支持 6 种写作模式，具备流式输出、提示词优化、历史记录等核心功能。

### 技术栈
- **前端框架**：React + Vite
- **样式方案**：CSS Modules / Tailwind CSS
- **HTTP 客户端**：fetch API + ReadableStream（流式输出）
- **本地存储**：localStorage（历史记录）
- **Markdown 渲染**：marked.js 或 react-markdown

## 2. 架构设计

### 2.1 布局结构（经典三栏 - 方案A）

```
┌─────────────────────────────────────────────────────────────────┐
│                        顶栏：大标题                              │
├──────────┬──────────────────────────┬───────────────────────────┤
│          │                          │                           │
│  历史    │     输入区                │    结果区                  │
│  记录    │   - 文本输入框            │   - 生成结果展示           │
│  侧边栏  │   - 参数控制区            │   - 复制按钮               │
│          │   - 模式选择区            │   - 流式显示动画           │
│          │   - 操作按钮区            │                           │
│          │                          │                           │
└──────────┴──────────────────────────┴───────────────────────────┘
```

### 2.2 组件拆分

| 组件 | 文件 | 职责 |
|------|------|------|
| App | `src/App.jsx` | 根组件，布局框架，状态管理 |
| Sidebar | `src/components/Sidebar.jsx` | 历史记录列表，点击切换 |
| InputPanel | `src/components/InputPanel.jsx` | 文本输入、模式选择、参数控制、按钮操作 |
| OutputPanel | `src/components/OutputPanel.jsx` | 结果展示、流式渲染、复制功能 |
| useStreaming | `src/hooks/useStreaming.js` | 自定义 Hook，处理 SSE/流式请求 |
| useHistory | `src/hooks/useHistory.js` | 自定义 Hook，管理本地存储 |

### 2.3 数据流

```
用户输入文本 → 选择模式/参数 → 点击生成
    ↓
构建请求体（prompt + temperature + max_tokens + mode）
    ↓
调用 AI API（stream: true）
    ↓
ReadableStream 逐块读取 → 实时更新 OutputPanel
    ↓
生成完成后保存至 localStorage 历史记录
```

## 3. 核心功能设计

### 3.1 写作模式映射

| 模式 | 提示词模板 key | 默认 temperature | 默认长度 |
|------|---------------|-----------------|---------|
| 续写 | continuation | 0.7 | medium |
| 改写 | rewrite | 0.3 | medium |
| 扩展 | expand | 0.8 | long |
| 总结 | summarize | 0.2 | short |
| 邮件 | email | 0.5 | medium |
| 文案 | copywriting | 0.9 | medium |

### 3.2 参数控制

- **创意度（temperature）**：滑块控件，范围 0.0-1.0，步长 0.1
- **输出长度**：下拉选择（short/medium/long/extended）
- 各模式切换时自动设置默认值，用户仍可手动调整

### 3.3 流式输出

- 使用 `fetch()` + `response.body.getReader()` 实现
- 每收到一个 chunk 就更新 React state
- 显示打字光标动画表示正在生成
- 支持中途停止生成

### 3.4 优化提示词

- 点击按钮后，将用户输入发送到 AI，附加"优化提示词"指令
- AI 返回优化后的提示词，替换输入框内容
- 用户可选择使用优化后的提示词生成

### 3.5 历史记录

- 使用 localStorage 持久化
- 每条记录：{ id, mode, input, output, temperature, length, timestamp }
- 侧边栏按时间倒序展示，点击可加载历史内容
- 支持删除单条记录

## 4. API 接口设计

### 4.1 流式请求体

```json
{
  "model": "gpt-3.5-turbo",
  "messages": [
    {
      "role": "system",
      "content": "[从 prompts.md 加载的系统提示词]"
    },
    {
      "role": "user",
      "content": "[用户输入内容]"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 1000,
  "stream": true
}
```

### 4.2 API 配置

API 基础 URL 和密钥通过环境变量配置：
- `VITE_API_BASE_URL`
- `VITE_API_KEY`

## 5. 错误处理

- **网络错误**：显示友好提示，允许重试
- **API 限流**：提示用户稍后重试
- **空输入**：生成前校验，提示用户输入内容
- **流中断**：捕获异常，保留已生成内容，显示错误标记

## 6. 样式设计

- 整体风格：简洁现代，白色背景 + 浅色边框
- 侧边栏：浅灰色背景 #f5f5f5
- 主按钮：蓝色主题
- 辅助按钮：灰色背景
- 输入框：圆角、浅灰色边框、聚焦时蓝色高亮
- 结果区：等宽字体或系统字体，支持 Markdown 渲染
- 响应式：适配桌面端为主，移动端可折叠侧边栏
