---
title: "Markdown Notes App: From Editor to Live Preview"
date: 2026-05-07
slug: markdown-notes-app
tags: [React, Markdown, TypeScript, Tools]
category: Technology
excerpt: Architecture design insights from building a Markdown notes application, including three-column layout, debounced saving, and live preview implementation.
lang: en
---

## Project Background

MarkdownNotes is a clean Markdown note-taking app with a classic three-column layout: note list on the left, editor in the middle, and live preview on the right.

## Three-Column Layout Architecture

```
┌──────────┬──────────────────────────┬──────────────────┐
│  Sidebar │       Editor             │     Preview      │
│          │                          │                  │
│ Note List │   Markdown Editing       │  HTML Live Render│
│ Search   │                          │  Export/Delete   │
│ New Note │                          │                  │
└──────────┴──────────────────────────┴──────────────────┘
```

All three areas share one state, passing data through props.

## Debounced Save Mechanism

To avoid writing to localStorage on every keystroke, I used a debounce mechanism:

```typescript
const handleContentChange = (content: string) => {
  // ...update state...
  
  // Debounce: save only after 500ms of no input
  clearTimeout(window.__saveTimer);
  window.__saveTimer = setTimeout(() => {
    saveNotes(updatedNotes);
    setSavedStatus("Saved");
  }, 500);
};
```

### Why Debounce?

localStorage operations are synchronous — frequent writes affect UI responsiveness. Debouncing ensures data is only persisted after the user stops typing for 500ms, significantly reducing I/O frequency.

## Auto Title Extraction

Titles are automatically extracted from the first line of content:

```
"# My Notes" → Title: "My Notes"
"## Study Notes" → Title: "Study Notes"
"Plain text" → Title: "Plain text"
```

## Export Features

Two export methods supported:

- **Export Markdown** — Download as `.md` file
- **Export PDF** — Uses browser print function, user can save as PDF

## Search Filter

Keyword search in the sidebar:

```typescript
const filteredNotes = notes.filter(
  (note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
);
```

## Summary

Although simple in functionality, this project covers common frontend development techniques: component splitting, data flow design, debounce optimization, Markdown rendering, and more — making it a solid reference case.
