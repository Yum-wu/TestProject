---
title: "Blog Migration Saga — From Git Errors to Vercel Deployment"
date: 2026-05-16
slug: blog-migration-troubleshooting
tags: [Vercel, Deployment, Git, Frontend, Troubleshooting]
category: Technology
excerpt: A code cleanup triggered a chain of disasters — 13 files overwritten with Git error messages, GitHub Pages blank screen, Vercel deployment failures. This post documents the full investigation and recovery process.
lang: en
---

# Blog Migration Saga — From Git Errors to Vercel Deployment

## How It Started

I wanted to migrate the blog from GitHub Pages to Vercel. First step: clean the repo — remove backend code, login/registration components, comment system, and other no-longer-needed parts. One `git commit` later, the world was quiet... or so I thought.

I opened the page — blank. Then I noticed `package.json` and `index.html` now contained:

```
fatal: ambiguous argument '/package.json': unknown revision or path not in the working tree.
```

## The Disaster Scene

Investigation found that commit `9c7ea72` had overwritten **13 files** with Git error messages:

- `package.json` (dependency management) → 3 lines of Git error
- `index.html` (entry page) → 3 lines of Git error
- `postcss.config.js` → 3 lines of Git error
- `tailwind.config.js` → 3 lines of Git error
- `src/index.css` (400 lines of styles) → 3 lines of Git error
- `Header.tsx` (457-line navbar) → 3 lines of Git error
- `PostDetailPage.tsx` (article detail) → 3 lines of Git error
- And more...

As part of "cleanup," **7 published blog articles** were also deleted. Worse, `vite.config.ts`'s `base` path was changed from GitHub Pages' `/TestProject/` to `/`, making the two platforms incompatible.

## Recovery Steps

### 1. Restore Overwritten Files

Couldn't directly revert (the commit itself contained error content). Had to checkout from parent commit `HEAD^`:

```bash
git checkout HEAD^ -- MyBlog/client/package.json MyBlog/client/index.html ...
```

### 2. Switch to Static Markdown

Replaced backend API calls with Vite's `import.meta.glob` to batch import `.md` files from `src/content/posts/`.

### 3. Remove Auth Code

Removed `AuthProvider`, login/register pages, comment components, article editor, route guards, and 25+ other files. App.tsx went from 200+ lines to 50.

### 4. Dual-Platform Base Path

GitHub Pages requires `base: "/TestProject/"`, Vercel requires `base: "/"`. Used environment variable auto-detection:

```typescript
const isGitHubPages = !!process.env.GITHUB_ACTIONS;
const base = isGitHubPages ? "/TestProject/" : "/";
```

### 5. Vercel Deployment Config

Added SPA route rewrite in `vercel.json`:

```json
{
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Vercel projects need **Root Directory** set to `MyBlog/client` in Dashboard → Build & Development Settings.

### 6. Recover Articles from Git History

```bash
git log --all --oneline --name-only -- "*/content/posts/*"
```

Found commit `14d78ae` still had 9 complete articles. Checked them out:

```bash
git checkout 14d78ae -- MyBlog/client/src/content/posts/*.md
```

## Lessons Learned

1. **Establish rules from the start** — After this incident, I added AGENTS.md defining change red lines
2. **Check diff before committing** — If I'd reviewed `git diff`, the anomaly in 13 files would've been obvious
3. **Back up database content independently** — Articles in a DB need a dump before migration
4. **Use environment variables for base paths** — Multi-platform deployments must be dynamic
5. **Vercel Root Directory is essential knowledge** — Must be set in Dashboard for monorepo projects

## Final State

- **GitHub Pages**: `https://yum-wu.github.io/TestProject/` ✅ Working
- **Vercel Preview**: Deployed successfully ✅
- Article count: 2 → **9 articles** ✅
- Codebase: Full-stack (React + Node.js + MySQL) → **Pure static blog** 🎉
