import{r as e}from"./rolldown-runtime-CsWUnieo.js";import{u as t}from"./vendor-highlight-CBiRDIbP.js";import{r as n}from"./vendor-markdown-BduOVIqk.js";var r=e(t(),1),i=n(),a={default:`bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700`,primary:`bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-800`,secondary:`bg-secondary-50 dark:bg-secondary-950/30 text-secondary-600 dark:text-secondary-400 border-secondary-200 dark:border-secondary-800`,accent:`bg-accent-50 dark:bg-accent-950/30 text-accent-600 dark:text-accent-400 border-accent-200 dark:border-accent-800`,red:`bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800`,blue:`bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800`,purple:`bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800`,pink:`bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800`},o={sm:`px-2 py-0.5 text-2xs`,md:`px-2.5 py-1 text-xs`};function s({label:e,color:t=`default`,clickable:n=!1,onClick:r,removable:s=!1,onRemove:c,size:l=`md`,className:u=``}){return(0,i.jsxs)(n?`button`:`span`,{type:n?`button`:void 0,onClick:n?r:void 0,className:`
        inline-flex items-center gap-1 font-medium border rounded-full
        transition-all duration-200 whitespace-nowrap
        ${a[t]}
        ${o[l]}
        ${n?`cursor-pointer hover:shadow-sm hover:scale-105 active:scale-95`:``}
        ${u}
      `,children:[e,s&&(0,i.jsx)(`button`,{type:`button`,onClick:e=>{e.stopPropagation(),c?.()},className:`ml-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors`,"aria-label":`删除标签 ${e}`,children:(0,i.jsx)(`svg`,{className:`h-2.5 w-2.5`,fill:`none`,viewBox:`0 0 24 24`,stroke:`currentColor`,strokeWidth:3,children:(0,i.jsx)(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,d:`M6 18L18 6M6 6l12 12`})})})]})}var c=(0,r.memo)(s),l=Object.assign({"../content/posts/git-workflow.md":`---
title: "Git 工作流最佳实践"
date: 2026-05-08
slug: git-workflow-best-practices
tags: [Git, 工具, 工作流]
category: 技术
excerpt: 团队协作中常用的 Git 工作流模式，以及 commit 规范、分支管理的最佳实践。
---

## 为什么需要规范的工作流？

Git 是一个强大的工具，但如果没有规范的工作流程，很容易陷入混乱。

## 分支策略

### 主干开发 (Trunk-Based Development)

\`\`\`
main ───●───●───●──────────●───
         \\         / \\     /
          ●───●───●   ●───●
          feature-a    feature-b
\`\`\`

### 功能分支流程

\`\`\`bash
# 从 main 创建功能分支
git checkout -b feat/user-auth

# 开发过程中经常提交
git commit -m "feat: add login form"
git commit -m "feat: add JWT validation"

# 保持与 main 同步
git rebase main

# 合并回 main
git checkout main
git merge feat/user-auth
\`\`\`

## Commit 规范

推荐使用 Conventional Commits 规范：

\`\`\`
<type>(<scope>): <description>

[optional body]

[optional footer]
\`\`\`

### 类型说明

| 类型 | 说明 | 示例 |
|------|------|------|
| feat | 新功能 | \`feat: add user login\` |
| fix | Bug 修复 | \`fix: fix login redirect\` |
| refactor | 重构 | \`refactor: extract auth hook\` |
| docs | 文档 | \`docs: update README\` |
| chore | 杂项 | \`chore: update dependencies\` |

## Code Review 最佳实践

1. **PR 不要太大** — 200-300 行代码是比较合适的范围
2. **提供上下文** — 在 PR 描述中说明改动原因和测试方式
3. **及时 Review** — 尽量在 24 小时内完成
4. **关注逻辑而非风格** — 风格问题用 linter 自动化

## 总结

好的 Git 工作流应该像交通规则——在约束中保证效率。
`,"../content/posts/hello-world.md":`---
title: "Hello World — 我的博客开张了"
date: 2026-05-10
slug: hello-world
tags: [生活, 博客]
category: 随笔
excerpt: 这是我的个人博客的第一篇文章，记录一下搭建博客的心路历程。
---

# Hello World!

欢迎来到我的个人博客 🎉

这是我的第一篇文章。这个博客使用 **React** + **Vite** 构建，所有文章都以 Markdown 文件形式管理，通过 **Vercel** 部署，完全免费。

## 为什么写博客？

我一直觉得，写作是最好的学习方式。把学到的知识用自己的话写下来，不仅能加深理解，还能帮助到其他人。

> 教是最好的学。

## 博客技术栈

前端框架的选择上，我选择了：

- **React 19** — 最新的 React 版本
- **Vite 8** — 极速构建工具
- **TypeScript** — 类型安全
- **Tailwind CSS 4** — 原子化 CSS
- **React Router 7** — 前端路由
- **React Markdown** — Markdown 渲染
- **Giscus** — 基于 GitHub Discussions 的评论系统

## 文章管理

文章都以 Markdown 文件存储在仓库中，通过 Git 进行版本管理。这种方式的好处是：

1. **简单** — 不需要数据库，不需要后台
2 **版本控制** — 天然拥有所有文章的修改历史
3. **免费部署** — 完全零成本
4. **熟悉的编辑体验** — 用任何 Markdown 编辑器写作

## 未来计划

接下来我计划在这里分享：

- 前端开发的技术心得
- 开源项目的使用体验
- 个人成长的思考记录

如果你有什么想看的主题，欢迎在评论区告诉我！

*2026年5月10日*
`,"../content/posts/react-performance-tips.md":`---
title: "React 性能优化实战技巧"
date: 2026-05-09
slug: react-performance-tips
tags: [React, 前端, 性能优化]
category: 技术
excerpt: 分享 React 应用性能优化的常用技巧，包括 memo、useMemo、useCallback 的正确使用方式。
cover: /images/covers/react-perf.png
---

## 前言

React 的性能优化是一个老生常谈的话题。本文结合实际项目经验，分享一些实用的优化技巧。

## 1. 使用 React.memo 避免不必要的重渲染

\`React.memo\` 是一个高阶组件，它对组件的 props 进行浅比较，如果 props 没有变化，就跳过重渲染。

\`\`\`tsx
import { memo } from "react";

const ExpensiveComponent = memo(function ExpensiveComponent({ data }: Props) {
  return <div>{/* 渲染逻辑 */}</div>;
});
\`\`\`

### 什么时候使用？

- 组件接收的 props 变化频率较低
- 组件的渲染成本较高（大量 DOM 节点、复杂计算）
- 组件在列表中多次使用

### 什么时候不使用？

- props 每次都会变化（如基础 UI 组件）
- 组件本身非常轻量
- 使用 memo 带来的比较开销超过渲染开销

## 2. useMemo 缓存计算结果

\`\`\`tsx
const sortedList = useMemo(() => {
  return list.sort((a, b) => a.name.localeCompare(b.name));
}, [list]);
\`\`\`

## 3. useCallback 稳定函数引用

\`\`\`tsx
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
\`\`\`

## 4. 代码分割

使用 \`React.lazy\` 和 \`Suspense\` 实现路由级别的代码分割：

\`\`\`tsx
const HomePage = lazy(() => import("./pages/HomePage"));
const PostDetailPage = lazy(() => import("./pages/PostDetailPage"));
\`\`\`

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
`});function u(e){let t={},n=0;if(e.startsWith(`---
`)){let r=e.indexOf(`
---
`,4);if(r!==-1){let i=e.slice(4,r);n=r+5,i.split(`
`).forEach(e=>{let n=e.indexOf(`:`);if(n===-1)return;let r=e.slice(0,n).trim(),i=e.slice(n+1).trim();switch(i.startsWith(`[`)&&i.endsWith(`]`)&&(i=i.slice(1,-1).split(`,`).map(e=>e.trim().replace(/['"]/g,``)).join(`,`)),r){case`title`:t.title=i.replace(/^["']|["']$/g,``);break;case`date`:t.date=i.replace(/^["']|["']$/g,``);break;case`slug`:t.slug=i.replace(/^["']|["']$/g,``);break;case`tags`:t.tags=i.split(`,`).map(e=>e.trim().replace(/^["']|["']$/g,``)).filter(Boolean);break;case`category`:t.category=i.replace(/^["']|["']$/g,``);break;case`excerpt`:t.excerpt=i.replace(/^["']|["']$/g,``);break;case`cover`:t.cover=i.replace(/^["']|["']$/g,``);break;case`author`:t.author=i.replace(/^["']|["']$/g,``);break}})}}let r=e.slice(n).trim();return{title:t.title||`无标题`,date:t.date||`2026-01-01`,slug:t.slug||``,tags:t.tags||[],category:t.category||`未分类`,excerpt:t.excerpt||``,cover:t.cover,author:t.author||`Yum`,content:r}}function d(){return Object.values(l).map(u).filter(e=>e.slug).sort((e,t)=>new Date(t.date).getTime()-new Date(e.date).getTime())}function f(e){return d().find(t=>t.slug===e)}function p(){let e=new Set;return d().forEach(t=>e.add(t.category)),Array.from(e).sort()}function m(e){if(!e)return d();let t=e.toLowerCase();return d().filter(e=>e.title.toLowerCase().includes(t)||e.excerpt.toLowerCase().includes(t)||e.content.toLowerCase().includes(t)||e.tags.some(e=>e.toLowerCase().includes(t))||e.category.toLowerCase().includes(t))}function h(e){let t=(e.match(/[一-鿿]/g)||[]).length,n=e.replace(/[一-鿿]/g,``).split(/\s+/).length;return Math.max(1,Math.ceil((t+n)/500))}export{m as a,f as i,p as n,c as o,d as r,h as t};