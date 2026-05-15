# MyBlog — 纯静态博客

## 架构

纯静态博客，无后端服务。

- 前端: React 19 + Vite 8 + Tailwind CSS 4
- 文章: Markdown 文件在 `client/src/content/posts/`
- 评论: Giscus (GitHub Discussions)
- 部署: GitHub Pages

## 关键目录

```
client/src/
├── content/posts/      # 文章 Markdown 文件
├── types/blog.ts       # 博客类型定义
├── utils/posts-loader.ts  # 文章加载工具
├── pages/              # 页面组件
├── components/         # UI 组件
└── App.tsx             # 路由配置
```

## 添加新文章

在 `client/src/content/posts/` 下创建 `.md` 文件，格式：

```markdown
---
title: "文章标题"
date: 2026-05-10
slug: my-post-slug
tags: [标签1, 标签2]
category: 分类
excerpt: 文章摘要
---

正文内容...
```

## 本地开发

```bash
cd client
npm install
npm run dev
```

## 构建

```bash
cd client
npm run build
```

## 部署

推送到 TestProject 仓库 `main` 分支后，GitHub Actions 自动构建并部署。
部署 URL：`https://yum-wu.github.io/TestProject/`
