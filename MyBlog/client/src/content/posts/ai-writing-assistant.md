---
title: "从零构建 AI 写作助手：流式输出与历史记录"
date: 2026-05-09
slug: ai-writing-assistant
tags: [AI, React, 流式输出, 前端]
category: 技术
excerpt: 分享 AI 写作助手和 AI Chatbot 两个项目的开发经验，重点介绍流式输出 SSE 和 Prompt 工程。
---

## 项目简介

我做了两个 AI 相关的小项目：

1. **AI Writing Assistant** — 智能写作助手，支持多种写作模式、文本优化、历史记录
2. **AI Chatbot** — 简洁的 AI 对话聊天界面

## 流式输出的实现

为了让 AI 回复更流畅，我使用了 Server-Sent Events (SSE) 实现流式输出：

```typescript
function useStreaming() {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendRequest = async ({ messages, temperature, maxTokens }) => {
    setIsLoading(true);
    setContent("");

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, temperature, maxTokens }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      setContent((prev) => prev + chunk);
    }

    setIsLoading(false);
  };

  return { content, isLoading, sendRequest };
}
```

## 写作模式设计

写作助手支持多种模式切换：

```typescript
const WRITING_MODES = {
  general: {
    label: "通用写作",
    systemPrompt: "你是一个专业的写作助手...",
  },
  academic: {
    label: "学术论文",
    systemPrompt: "你是一个学术写作专家...",
  },
  creative: {
    label: "创意写作",
    systemPrompt: "你是一个创意写作导师...",
  },
  business: {
    label: "商务写作",
    systemPrompt: "你是一个商务写作专家...",
  },
};
```

## 历史记录管理

写作助手还有完整的对话历史记录功能，用户可以在侧边栏查看、加载和删除历史记录。

```typescript
function useHistory() {
  const [records, setRecords] = useState<Record[]>([]);

  const addRecord = (record: Record) => {
    setRecords((prev) => [record, ...prev]);
    localStorage.setItem("history", JSON.stringify([record, ...prev]));
  };
  // ...
}
```

## Chatbot 的 Markdown 渲染

Chatbot 用 `react-markdown` 配合代码高亮，让 AI 回复更有可读性：

```tsx
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{
    code({ className, children }) {
      const match = /language-(\w+)/.exec(className || "");
      if (match) {
        return <SyntaxHighlighter language={match[1]}>{children}</SyntaxHighlighter>;
      }
      return <code>{children}</code>;
    },
  }}
>
  {response}
</ReactMarkdown>
```

## 总结

这两个项目让我深入理解了 SSE 流式通信、Prompt 工程和前端状态管理。AI 应用的前端开发不仅仅是 UI，更是用户体验的关键环节。
