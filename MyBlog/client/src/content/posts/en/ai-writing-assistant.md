---
title: "Building an AI Writing Assistant from Scratch: Streaming Output & History"
date: 2026-05-09
slug: ai-writing-assistant
tags: [AI, React, Streaming, Frontend]
category: Technology
excerpt: Sharing development experience from two AI projects — AI Writing Assistant and AI Chatbot — focusing on SSE streaming output and Prompt Engineering.
lang: en
---

## Project Overview

I built two small AI-related projects:

1. **AI Writing Assistant** — Smart writing assistant with multiple writing modes, text optimization, and history
2. **AI Chatbot** — Clean AI chat interface

## Implementing Streaming Output

For smooth AI responses, I used Server-Sent Events (SSE) for streaming:

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

## Writing Modes

The assistant supports multiple writing modes:

```typescript
const WRITING_MODES = {
  general: {
    label: "General Writing",
    systemPrompt: "You are a professional writing assistant...",
  },
  academic: {
    label: "Academic Paper",
    systemPrompt: "You are an academic writing expert...",
  },
  creative: {
    label: "Creative Writing",
    systemPrompt: "You are a creative writing mentor...",
  },
  business: {
    label: "Business Writing",
    systemPrompt: "You are a business writing expert...",
  },
};
```

## History Management

The writing assistant includes a complete conversation history feature, allowing users to view, load, and delete records from the sidebar.

## Chatbot Markdown Rendering

The Chatbot uses `react-markdown` with code highlighting for readable AI responses.

## Summary

These two projects gave me deep insights into SSE streaming communication, prompt engineering, and frontend state management. Frontend development for AI applications isn't just about UI — it's a critical part of the user experience.
