---
title: "React + Zustand: Building a Todo App with Modern State Management"
date: 2026-05-10
slug: zustand-todo-app
tags: [React, Zustand, State Management, TypeScript]
category: Technology
excerpt: Using Zustand as a Redux alternative for React state management, sharing practical insights from my Todo Manager project.
lang: en
---

## Introduction

My [Todo Manager](https://github.com/Yum-wu/TestProject/tree/main/todo-app) project is a full-featured todo management app using **Zustand** for state management. This article shares some practical insights.

## Why Zustand?

For the Todo Manager project, I chose Zustand over Redux for several key reasons:

### Minimal API

```typescript
import { create } from "zustand";

interface TodoStore {
  todos: Todo[];
  addTodo: (todo: Todo) => void;
  toggleTodo: (id: string) => void;
}

export const useTodoStore = create<TodoStore>((set) => ({
  todos: [],
  addTodo: (todo) => set((state) => ({ todos: [...state.todos, todo] })),
  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    })),
}));
```

No Provider, Reducer, or Action Creator needed — one `create` call does it all.

### Type Safety

Zustand works naturally with TypeScript:

```typescript
interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  category: "work" | "study" | "life" | "project";
  dueDate?: string;
}
```

### Selective Subscriptions

Components can subscribe to only the state they need:

```typescript
function TaskItem({ id }: { id: string }) {
  const task = useTodoStore((state) =>
    state.todos.find((t) => t.id === id)
  );
  const toggleTodo = useTodoStore((state) => state.toggleTodo);
}
```

## Feature Highlights

### Category Filtering

Quickly filter tasks by work, study, life, and project categories.

### Priority Markers

Three priority levels — high (red), medium (orange), low (green).

### Statistics Overview

Real-time calculation of total tasks, pending, and completed — displayed with a circular progress bar.

### Data Persistence

All data saved to localStorage, surviving refreshes. Debounce mechanism reduces write frequency.

## Testing

The project includes unit and component tests:

```typescript
describe("TodoStore", () => {
  it("should add a todo", () => { /* ... */ });
});
```

## Summary

Zustand solves React state management's core problems with a minimal API, making it ideal for small to medium projects. Check out my GitHub repo for the full code.
