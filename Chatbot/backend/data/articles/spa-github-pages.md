---
title: "SPA 部署 GitHub Pages 踩坑实录"
date: 2026-05-15
slug: spa-github-pages
tags: [技术, GitHub Pages, SPA, 前端]
category: 技术
excerpt: 把 React SPA 部署到 GitHub Pages，前后修了 7 个问题才让页面正常渲染。
---

# SPA 部署 GitHub Pages 踩坑实录

把 React SPA 部署到 GitHub Pages，我前后修了 7 个问题，经历了 404 → 白屏 → 路由 404 的三阶段崩溃。

## 问题全览

| 阶段 | 现象 | 原因 |
| 部署 | 页面 404 | 上传了错误的目录 |
| 构建 | 找不到文件 | 构建产物被 gitignore |
| 构建 | CustomEvent is not defined | Node.js 版本太低 |
| 渲染 | 页面空白 | base 路径没配 |
| 渲染 | 显示 404 页面 | basename 没配 |
| 构建 | TypeScript 编译失败 | 旧代码引用了已删除的函数 |
| 路由 | 直接访问文章链接 404 | 服务器不认识 SPA 路由 |

## 完整解决方案

### 在 CI 工作流中

配置 GitHub Actions 构建，上传 dist 目录，并复制 index.html 为 404.html 用于 SPA 路由回退。

### 在 Vite 配置中

设置 `base: "/TestProject/"`，必须与部署子路径一致。

### 在 React Router 中

设置 `<BrowserRouter basename="/TestProject">`。

关键：base 控制静态资源路径，basename 控制前端路由路径，两个都要配。

### 自检清单

1. 打开 Network 面板：JS/CSS 是否 200？
2. Console 面板：有没有报错？
3. Elements 面板：root 里有没有内容？
4. 直接访问非首页路径：是否正常？
5. 检查 CI 构建日志：构建是否用了正确的代码？
