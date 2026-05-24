---
title: "Markdown 笔记应用：从编辑器到实时预览"
date: 2026-05-07
slug: markdown-notes-app
tags: [React, Markdown, TypeScript, 工具]
category: 技术
excerpt: 开发 Markdown 笔记应用的架构设计分享，包括三栏布局、防抖保存和实时预览的实现。
lang: zh
---

## 项目背景

MarkdownNotes 是一个简洁的 Markdown 笔记应用，采用经典的三栏布局：左侧笔记列表、中间编辑器、右侧实时预览。

## 三栏布局架构

```
┌──────────┬──────────────────────────┬──────────────────┐
│  Sidebar │       Editor             │     Preview      │
│          │                          │                  │
│ 笔记列表  │   Markdown 编辑区        │  HTML 实时渲染    │
│ 搜索框   │                          │  导出/删除按钮    │
│ 新建按钮  │                          │                  │
└──────────┴──────────────────────────┴──────────────────┘
```

三个区域共用一个状态，通过 props 传递数据。

## 防抖保存机制

为了防止每次按键都写入 localStorage，我使用了防抖（debounce）机制：

```typescript
const handleContentChange = (content: string) => {
  const updatedNotes = notes.map((note) => {
    if (note.id === selectedNoteId) {
      const title = content.split("\n")[0].replace(/^#+\s*/, "").trim();
      return { ...note, content, title, updatedAt: Date.now() };
    }
    return note;
  });
  setNotes(updatedNotes);
  setSavedStatus("未保存");

  // 防抖：500ms 内没有新输入才保存
  clearTimeout(window.__saveTimer);
  window.__saveTimer = setTimeout(() => {
    saveNotes(updatedNotes);
    setSavedStatus("已保存");
  }, 500);
};
```

### 为什么需要防抖？

localStorage 是同步操作，频繁写入会影响 UI 响应。通过防抖，只有在用户停止输入 500ms 后才写入，大大降低了 IO 频率。

## 标题自动提取

从笔记内容第一行自动提取标题：

```
"# 我的笔记" → 标题: "我的笔记"
"## 学习笔记" → 标题: "学习笔记"
"普通文本" → 标题: "普通文本"
```

## 导出功能

支持两种导出方式：

- **导出 Markdown** — 生成 `.md` 文件下载
- **导出 PDF** — 调用浏览器打印功能，用户可选择另存为 PDF

## 搜索过滤

在侧边栏中按关键词搜索笔记，过滤逻辑：

```typescript
const filteredNotes = notes.filter(
  (note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
);
```

## 总结

这个项目虽然功能简单，但涵盖了前端开发中常见的技术点：组件拆分、数据流设计、防抖优化、Markdown 渲染等，是一个很好的参考案例。
