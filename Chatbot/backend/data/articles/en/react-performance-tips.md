---
title: "React Performance Optimization Tips"
date: 2026-05-09
slug: react-performance-tips
tags: [React, Frontend, Performance]
category: Technology
excerpt: Practical tips for optimizing React app performance, including proper use of memo, useMemo, and useCallback.
lang: en
---

## Preface

React performance optimization is a well-worn topic. This article shares practical tips based on real project experience.

## 1. Use React.memo to Avoid Unnecessary Re-renders

`React.memo` is a higher-order component that shallow-compares props. If props haven't changed, it skips re-rendering.

```tsx
import { memo } from "react";

const ExpensiveComponent = memo(function ExpensiveComponent({ data }: Props) {
  return <div>{/* render logic */}</div>;
});
```

### When to Use

- Component receives props that change infrequently
- Component render cost is high (lots of DOM nodes, complex computations)
- Component is used multiple times in a list

### When NOT to Use

- Props change every time (e.g., basic UI components)
- Component itself is very lightweight
- Memo comparison overhead exceeds render cost

## 2. useMemo for Caching Computation Results

```tsx
const sortedList = useMemo(() => {
  return list.sort((a, b) => a.name.localeCompare(b.name));
}, [list]);
```

## 3. useCallback for Stable Function References

```tsx
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

## 4. Code Splitting

Using `React.lazy` and `Suspense` for route-level code splitting:

```tsx
const HomePage = lazy(() => import("./pages/HomePage"));
const PostDetailPage = lazy(() => import("./pages/PostDetailPage"));
```

## 5. Virtual List

When rendering large lists, use virtual lists to only render elements in the visible area.

## Summary

Optimization is an art of balance: over-optimization is as harmful as no optimization. **Measure first, then optimize.**

| Technique | Use Case | Caution |
|-----------|----------|---------|
| memo | Pure display components with stable props | Avoid overuse |
| useMemo | Complex computations | Watch dependency array |
| useCallback | Callbacks passed to child components | Use with memo |
| lazy | Routes/large components | Use with Suspense |
| Virtual List | Very long lists | Use react-window |
