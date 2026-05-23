# MyBlog

基于 React + Vite + TypeScript 的静态技术博客。

## 技术栈

- **框架**: React 19 + TypeScript
- **构建**: Vite 8
- **样式**: Tailwind CSS v4
- **内容**: Markdown（含 YAML frontmatter），通过 `import.meta.glob` 批量加载
- **部署**: GitHub Pages / Vercel 双平台

## 目录结构

```
MyBlog/client/
├── src/
│   ├── components/       # UI 组件
│   │   ├── common/       #   通用组件（Button, Tag, Loading…）
│   │   ├── layout/       #   布局组件（Header, Footer, MainLayout）
│   │   └── post/         #   文章组件（PostCard, PostList）
│   ├── content/posts/    # Markdown 文章
│   ├── pages/            # 路由页面
│   ├── services/         # 数据读取（本地 markdown）
│   ├── types/            # TypeScript 类型
│   └── utils/            # 工具函数
├── public/               # 静态资源
├── vercel.json           # Vercel 部署配置
└── vite.config.ts        # Vite 配置
```

## 本地开发

```bash
cd MyBlog/client
npm install
npm run dev
```

## 构建

```bash
npm run build
# 输出在 dist/
```

## 新增文章

在 `src/content/posts/` 下创建 `.md` 文件，文件头需包含 YAML frontmatter：

```markdown
---
title: "文章标题"
date: 2026-05-16
slug: article-slug
tags: [标签1, 标签2]
category: 分类
cover: /cover.png        # 可选
excerpt: 文章摘要
---

文章正文 Markdown 内容...
```

## 部署

### GitHub Pages
推送后 GitHub Actions 自动构建部署，需 `GITHUB_ACTIONS` 环境变量（CI 自带）。

### Vercel
Vercel Dashboard 中设置 Root Directory 为 `MyBlog/client`，自动检测框架。
