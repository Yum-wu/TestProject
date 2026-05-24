---
title: "博客搬家记 — 从 Git 报错到 Vercel 部署的全栈踩坑"
date: 2026-05-16
slug: blog-migration-troubleshooting
tags: [Vercel, 部署, Git, 前端, 踩坑]
category: 技术
excerpt: 一次代码清理引发的连锁灾难——13 个文件被 Git 报错信息覆盖、GitHub Pages 白屏、Vercel 反复部署失败。这篇文章记录了从排查到修复的完整过程。
lang: zh
---

# 博客搬家记 — 从 Git 报错到 Vercel 部署的全栈踩坑

## 事故起因

想把博客从 GitHub Pages 迁到 Vercel，第一步就是清理仓库——删掉后端代码、登录注册组件、评论系统等不再需要的东西。一个 `git commit` 下去，世界清静了……吗？

结果打开页面，一片空白。再一看，`package.json` 和 `index.html` 的内容变成了：

```
fatal: ambiguous argument '/package.json': unknown revision or path not in the working tree.
```

## 灾难现场

排查后发现，`9c7ea72` 这个 commit 把 **13 个文件** 写成了 Git 报错信息：

- `package.json`（依赖管理）→ 3 行 Git 报错
- `index.html`（入口页面）→ 3 行 Git 报错
- `postcss.config.js` → 3 行 Git 报错
- `tailwind.config.js` → 3 行 Git 报错
- `src/index.css`（400 行样式）→ 3 行 Git 报错
- `Header.tsx`（导航栏 457 行）→ 3 行 Git 报错
- `PostDetailPage.tsx`（文章详情）→ 3 行 Git 报错
- 以及更多……

而且作为"清理"的一部分，**7 篇已发布的博客文章**也被删除了。更糟的是，`vite.config.ts` 的 `base` 路径从 GitHub Pages 的 `/TestProject/` 改成了 `/`，导致两边互不兼容。

## 修复方案

### 1. 恢复被覆盖的文件

被覆盖的文件无法直接 revert（因为 commit 里就是错误内容），只能从父 commit `HEAD^` 逐个 checkout 回来：

```bash
git checkout HEAD^ -- MyBlog/client/package.json MyBlog/client/index.html ...
```

### 2. 从静态 Markdown 读取文章

删掉了后端 API 调用，改为用 Vite 的 `import.meta.glob` 批量导入 `src/content/posts/` 下的 `.md` 文件，并解析 YAML frontmatter：

```typescript
const modules = import.meta.glob("../content/posts/*.md", {
  query: "?raw",
  import: "default",
});
```

### 3. 删除多余认证代码

移除了 `AuthProvider`、登录/注册页面、评论组件、文章编辑器、路由守卫等 25+ 个文件，App.tsx 从 200+ 行精简到 50 行。

### 4. Base 路径双平台兼容

GitHub Pages 要求 `base: "/TestProject/"`，Vercel 要求 `base: "/"`。通过环境变量自动切换：

```typescript
const isGitHubPages = !!process.env.GITHUB_ACTIONS;
const base = isGitHubPages ? "/TestProject/" : "/";
```

### 5. Vercel 部署配置

在 `MyBlog/client/vercel.json` 中添加 SPA 路由重写：

```json
{
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Vercel 项目需要在 Dashboard 的 **Build & Development Settings** 中将 **Root Directory** 设为 `MyBlog/client`，否则找不到 `package.json`。

### 6. 从 Git 历史中恢复文章

```bash
git log --all --oneline --name-only -- "*/content/posts/*"
```

发现 `14d78ae` commit 中还有完整的 9 篇文章，但后来的清理只保留了 2 篇。直接从旧 commit checkout 回来：

```bash
git checkout 14d78ae -- MyBlog/client/src/content/posts/*.md
```

## 经验教训

1. **永远在一开始就建好规则** — 这次事故后我给项目加了 `AGENTS.md`，明确了变更红线
2. **Git 操作要检查 diff 再提交** — 如果当时看了 `git diff`，13 个文件的异常一眼就能发现
3. **数据库内容独立备份** — 文章存数据库没问题，但迁移前要 dump 一份
4. **Base 路径用环境变量** — 多平台部署必须动态判断，硬编码迟早踩坑
5. **Vercel 的 Root Directory 是必修课** — 对 monorepo 项目，这个配置必须在 Dashboard 里设置，`vercel.json` 的 `rootDirectory` 只在 CLI 模式下生效

## 最终状态

- **GitHub Pages**: `https://yum-wu.github.io/TestProject/` ✅ 正常显示
- **Vercel Preview**: 预览部署成功 ✅
- 文章数：2 篇 → **9 篇** ✅
- 代码库：从全栈（React + Node.js + MySQL）→ **纯静态博客** 🎉
