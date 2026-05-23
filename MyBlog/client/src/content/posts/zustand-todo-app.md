---
title: "React + Zustand 构建 Todo 应用的状态管理实践"
date: 2026-05-10
slug: zustand-todo-app
tags: [React, Zustand, 状态管理, TypeScript]
category: 技术
excerpt: 使用 Zustand 替代 Redux 进行 React 状态管理，从我的 Todo Manager 项目总结一些实践经验。
---

## 前言

我的 [Todo Manager](https://github.com/Yum-wu/TestProject/tree/main/todo-app) 项目是一个功能完整的待办事项管理应用，使用了 **Zustand** 作为状态管理方案。这篇文章分享一些实践心得。

## 为什么选择 Zustand？

在 Todo Manager 项目中，我选择 Zustand 而不是 Redux，主要看中以下几点：

### 极简的 API

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

不需要 Provider、Reducer、Action Creator，一个 `create` 搞定。

### 类型安全

Zustand 配合 TypeScript 非常自然：

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

### 选择性订阅

组件可以只订阅需要的状态片段，避免不必要的重渲染：

```typescript
function TaskItem({ id }: { id: string }) {
  // 只订阅这一个 task 的变化
  const task = useTodoStore((state) =>
    state.todos.find((t) => t.id === id)
  );
  const toggleTodo = useTodoStore((state) => state.toggleTodo);
  // ...
}
```

## 项目功能亮点

除了基础的增删改查，Todo Manager 还有一些实用的功能：

### 分类筛选

按工作、学习、生活、项目四个分类快速筛选任务。

### 优先级标记

高（红色）、中（橙色）、低（绿色）三级优先级，一目了然。

### 统计概览

实时计算总任务数、待完成数、已完成数，用环形进度条展示完成率。

### 数据持久化

所有数据保存在 localStorage，刷新不丢失。使用防抖机制减少写入频率。

## 测试实践

项目还覆盖了单元测试和组件测试：

```typescript
describe("TodoStore", () => {
  it("should add a todo", () => {
    const { getState, setState } = useTodoStore;
    // ...
  });
});
```

## 总结

Zustand 用极简的 API 解决了 React 状态管理的核心问题，非常适合中小型项目。如果你想看完整代码，可以访问我的 GitHub 仓库。
