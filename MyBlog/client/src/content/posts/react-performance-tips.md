---
title: "React 性能优化实战技巧"
date: 2026-05-09
slug: react-performance-tips
tags: [React, 前端, 性能优化]
category: 技术
excerpt: 分享 React 应用性能优化的常用技巧，包括 memo、useMemo、useCallback 的正确使用方式。
---

## 前言

React 的性能优化是一个老生常谈的话题。本文结合实际项目经验，分享一些实用的优化技巧。

## 1. 使用 React.memo 避免不必要的重渲染

`React.memo` 是一个高阶组件，它对组件的 props 进行浅比较，如果 props 没有变化，就跳过重渲染。

```tsx
import { memo } from "react";

const ExpensiveComponent = memo(function ExpensiveComponent({ data }: Props) {
  return <div>{/* 渲染逻辑 */}</div>;
});
```

### 什么时候使用？

- 组件接收的 props 变化频率较低
- 组件的渲染成本较高（大量 DOM 节点、复杂计算）
- 组件在列表中多次使用

### 什么时候不使用？

- props 每次都会变化（如基础 UI 组件）
- 组件本身非常轻量
- 使用 memo 带来的比较开销超过渲染开销

## 2. useMemo 缓存计算结果

```tsx
const sortedList = useMemo(() => {
  return list.sort((a, b) => a.name.localeCompare(b.name));
}, [list]);
```

## 3. useCallback 稳定函数引用

```tsx
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

## 4. 代码分割

使用 `React.lazy` 和 `Suspense` 实现路由级别的代码分割：

```tsx
const HomePage = lazy(() => import("./pages/HomePage"));
const PostDetailPage = lazy(() => import("./pages/PostDetailPage"));
```

## 5. 虚拟列表

渲染大量列表数据时，使用虚拟列表只渲染可视区域内的元素。

## 总结

优化是一门平衡的艺术：过度优化和不优化一样有害。**先测量，再优化**。

| 技巧 | 适用场景 | 注意 |
|------|---------|------|
| memo | props 稳定的纯展示组件 | 避免滥用 |
| useMemo | 复杂计算 | 注意依赖数组 |
| useCallback | 回调函数传子组件 | 配合 memo 使用 |
| lazy | 路由/大组件 | 配合 Suspense |
| 虚拟列表 | 超长列表 | 使用 react-window |
