# Blog 静态化清理 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 清除从全栈到纯静态博客迁移后残留的死代码、无关文件和配置错误，让项目结构和代码完全对齐"纯静态博客"的定位。

**Architecture:** 项目现已改为纯静态博客（Markdown 文件 + Vite 构建 + GitHub Pages 部署），但残留完整 Express 后端、大量未引用的前端组件/hooks/services、混杂的 Tailwind v3/v4 配置、以及多处配置错误。

**Tech Stack:** React 19 + Vite 8 + Tailwind CSS 4 + TypeScript 6

---

### Task 1: 删除 server 目录

**Files:**
- Delete: `server/` (整个目录)

- [ ] **Step 1: 删除整个 server 目录**

```powershell
Remove-Item -Recurse -Force "C:\Users\Yum\Desktop\TestProject\MyBlog\server"
```

- [ ] **Step 2: 确认 server 目录已移除**

```powershell
Test-Path "C:\Users\Yum\Desktop\TestProject\MyBlog\server"
```

Expected: `False`

- [ ] **Step 3: Commit**

```bash
git add -A server/
git commit -m "chore: remove server directory (migrated to static blog)"
```

---

### Task 2: 删除根目录遗留的部署文件

**Files:**
- Delete: `docker-compose.yml`
- Delete: `Dockerfile`
- Delete: `docker-entrypoint.sh`
- Delete: `nginx.conf`
- Delete: `ecosystem.config.js`
- Delete: `vercel.json`
- Delete: `scripts/` (整个目录)
- Delete: `package.json` (根目录的，不是 client/ 下的)

- [ ] **Step 1: 删除文件**

```powershell
Remove-Item -Force "C:\Users\Yum\Desktop\TestProject\MyBlog\docker-compose.yml"
Remove-Item -Force "C:\Users\Yum\Desktop\TestProject\MyBlog\Dockerfile"
Remove-Item -Force "C:\Users\Yum\Desktop\TestProject\MyBlog\docker-entrypoint.sh"
Remove-Item -Force "C:\Users\Yum\Desktop\TestProject\MyBlog\nginx.conf"
Remove-Item -Force "C:\Users\Yum\Desktop\TestProject\MyBlog\ecosystem.config.js"
Remove-Item -Force "C:\Users\Yum\Desktop\TestProject\MyBlog\vercel.json"
Remove-Item -Recurse -Force "C:\Users\Yum\Desktop\TestProject\MyBlog\scripts"
Remove-Item -Force "C:\Users\Yum\Desktop\TestProject\MyBlog\package.json"
```

- [ ] **Step 2: Commit**

```bash
git add -A .
git commit -m "chore: remove legacy deployment configs (Docker, Vercel, PM2)"
```

---

### Task 3: 删除前端未引用的页面组件

**Files:**
- Delete: `client/src/pages/LoginPage.tsx`
- Delete: `client/src/pages/RegisterPage.tsx`
- Delete: `client/src/pages/PostEditorPage.tsx`
- Delete: `client/src/pages/ProfilePage.tsx`

- [ ] **Step 1: 删除四个页面文件**

```powershell
Remove-Item -Force "C:\Users\Yum\Desktop\TestProject\MyBlog\client\src\pages\LoginPage.tsx"
Remove-Item -Force "C:\Users\Yum\Desktop\TestProject\MyBlog\client\src\pages\RegisterPage.tsx"
Remove-Item -Force "C:\Users\Yum\Desktop\TestProject\MyBlog\client\src\pages\PostEditorPage.tsx"
Remove-Item -Force "C:\Users\Yum\Desktop\TestProject\MyBlog\client\src\pages\ProfilePage.tsx"
```

- [ ] **Step 2: Commit**

```bash
git add client/src/pages/
git commit -m "chore: remove unused pages (Login, Register, PostEditor, Profile)"
```

---

### Task 4: 删除前端未引用的 auth 和 comment 组件

**Files:**
- Delete: `client/src/components/auth/` (整个目录)
- Delete: `client/src/components/comment/` (整个目录)
- Delete: `client/src/components/post/CoverUpload.tsx`
- Delete: `client/src/components/post/PostEditor.tsx`

- [ ] **Step 1: 删除组件目录和文件**

```powershell
Remove-Item -Recurse -Force "C:\Users\Yum\Desktop\TestProject\MyBlog\client\src\components\auth"
Remove-Item -Recurse -Force "C:\Users\Yum\Desktop\TestProject\MyBlog\client\src\components\comment"
Remove-Item -Force "C:\Users\Yum\Desktop\TestProject\MyBlog\client\src\components\post\CoverUpload.tsx"
Remove-Item -Force "C:\Users\Yum\Desktop\TestProject\MyBlog\client\src\components\post\PostEditor.tsx"
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/
git commit -m "chore: remove unused auth, comment, and editor components"
```

---

### Task 5: 删除未使用的前端 hooks 和 services

**Files:**
- Delete: `client/src/hooks/useAuth.ts`
- Delete: `client/src/hooks/useCache.ts`
- Delete: `client/src/hooks/useCategories.ts`
- Delete: `client/src/hooks/useComments.ts`
- Delete: `client/src/hooks/usePosts.ts`
- Delete: `client/src/hooks/useTags.ts`
- Delete: `client/src/services/api.ts`
- Delete: `client/src/services/auth.ts`
- Delete: `client/src/services/categories.ts`
- Delete: `client/src/services/comments.ts`
- Delete: `client/src/services/tags.ts`

- [ ] **Step 1: 删除 hooks 文件**

```powershell
Remove-Item -Force "C:\Users\Yum\Desktop\TestProject\MyBlog\client\src\hooks\useAuth.ts"
Remove-Item -Force "C:\Users\Yum\Desktop\TestProject\MyBlog\client\src\hooks\useCache.ts"
Remove-Item -Force "C:\Users\Yum\Desktop\TestProject\MyBlog\client\src\hooks\useCategories.ts"
Remove-Item -Force "C:\Users\Yum\Desktop\TestProject\MyBlog\client\src\hooks\useComments.ts"
Remove-Item -Force "C:\Users\Yum\Desktop\TestProject\MyBlog\client\src\hooks\usePosts.ts"
Remove-Item -Force "C:\Users\Yum\Desktop\TestProject\MyBlog\client\src\hooks\useTags.ts"
```

- [ ] **Step 2: 删除 services 文件**

```powershell
Remove-Item -Force "C:\Users\Yum\Desktop\TestProject\MyBlog\client\src\services\api.ts"
Remove-Item -Force "C:\Users\Yum\Desktop\TestProject\MyBlog\client\src\services\auth.ts"
Remove-Item -Force "C:\Users\Yum\Desktop\TestProject\MyBlog\client\src\services\categories.ts"
Remove-Item -Force "C:\Users\Yum\Desktop\TestProject\MyBlog\client\src\services\comments.ts"
Remove-Item -Force "C:\Users\Yum\Desktop\TestProject\MyBlog\client\src\services\tags.ts"
```

- [ ] **Step 3: Commit**

```bash
git add client/src/hooks/ client/src/services/
git commit -m "chore: remove unused hooks and API services"
```

---

### Task 6: 清理 types/index.ts（删后端类型，保留静态博客类型）

**Files:**
- Modify: `client/src/types/index.ts`

- [ ] **Step 1: 用精简后的纯静态博客类型替换 types/index.ts**

将 `client/src/types/index.ts` 替换为以下内容：

```typescript
/* ===== 纯静态博客类型定义 ===== */

/** 文章 frontmatter 元数据 */
export interface PostMeta {
  title: string;
  date: string;
  slug: string;
  tags: string[];
  category: string;
  excerpt: string;
  cover?: string;
  author?: string;
}

/** 完整文章（含正文内容） */
export interface Post extends PostMeta {
  content: string;
}

/** 文章列表项（用于 PostCard 适配） */
export interface PostListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl?: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
  viewCount: number;
  readingTime: number;
}

/** 文章查询参数 */
export interface PostQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  category?: string;
  tag?: string;
}
```

- [ ] **Step 2: 更新所有引用 `types/index.ts` 的文件的 import 路径**

检查哪些文件从 `../types` 导入：

```bash
rg "from ['\"]\.\./types['\"]" client/src/ --files-with-matches
```

如果没有任何文件再导入这些被删除的类型，则不需要额外修改。

- [ ] **Step 3: Commit**

```bash
git add client/src/types/index.ts
git commit -m "chore: trim types to static-blog-only interfaces"
```

---

### Task 7: 删除 services/posts.ts 并更新引用

**Files:**
- Delete: `client/src/services/posts.ts`
- Modify: 所有引用 `services/posts` 的文件

- [ ] **Step 1: 检查谁引用了 services/posts**

```bash
rg "from ['\"].*services/posts['\"]" client/src/ --files-with-matches
```

- [ ] **Step 2: 如果有引用，将其改为直接从 utils/posts-loader 导入**

举例：`usePosts.ts` 中
```typescript
// 旧
import * as postService from "../services/posts";
// 新（无需，因为 usePosts.ts 应已在 Task 5 被删除）
```

确认无引用后删除：

```powershell
Remove-Item -Force "C:\Users\Yum\Desktop\TestProject\MyBlog\client\src\services\posts.ts"
```

- [ ] **Step 3: 确认 services/ 目录只剩实际使用的文件，删除空目录**

```powershell
$servicesDir = "C:\Users\Yum\Desktop\TestProject\MyBlog\client\src\services"
if ((Get-ChildItem $servicesDir).Count -eq 0) {
    Remove-Item -Recurse -Force $servicesDir
}
```

- [ ] **Step 4: Commit**

```bash
git add client/src/services/
git commit -m "chore: remove services/posts.ts (replaced by posts-loader)"
```

---

### Task 8: 清理 Tailwind CSS 配置（v4 迁移）

**Files:**
- Modify: `client/src/index.css`
- Modify: `client/tailwind.config.js`
- Modify: `client/postcss.config.js`

- [ ] **Step 1: 将 tailwind.config.js 中的自定义主题迁移到 index.css**

在 `client/src/index.css` 的 `@import "tailwindcss"` 后面添加 `@theme` 块，包含颜色、字体、阴影、动画等自定义值。然后将 index.css 中的 `@config "../tailwind.config.js"` 删除。

修改后的 `index.css` 头部：

```css
@import "tailwindcss";

/* ===== Tailwind v4 主题扩展 ===== */
@theme {
  /* 颜色 */
  --color-primary-50: #eef2ff;
  --color-primary-100: #e0e7ff;
  --color-primary-200: #c7d2fe;
  --color-primary-300: #a5b4fc;
  --color-primary-400: #818cf8;
  --color-primary-500: #6366f1;
  --color-primary-600: #4f46e5;
  --color-primary-700: #4338ca;
  --color-primary-800: #3730a3;
  --color-primary-900: #312e81;
  --color-primary-950: #1e1b4b;

  --color-secondary-50: #ecfdf5;
  --color-secondary-100: #d1fae5;
  --color-secondary-200: #a7f3d0;
  --color-secondary-300: #6ee7b7;
  --color-secondary-400: #34d399;
  --color-secondary-500: #10b981;
  --color-secondary-600: #059669;
  --color-secondary-700: #047857;
  --color-secondary-800: #065f46;
  --color-secondary-900: #064e3b;
  --color-secondary-950: #022c22;

  --color-accent-50: #fffbeb;
  --color-accent-100: #fef3c7;
  --color-accent-200: #fde68a;
  --color-accent-300: #fcd34d;
  --color-accent-400: #fbbf24;
  --color-accent-500: #f59e0b;
  --color-accent-600: #d97706;
  --color-accent-700: #b45309;
  --color-accent-800: #92400e;
  --color-accent-900: #78350f;
  --color-accent-950: #451a03;

  --color-neutral-50: #f8fafc;
  --color-neutral-100: #f1f5f9;
  --color-neutral-200: #e2e8f0;
  --color-neutral-300: #cbd5e1;
  --color-neutral-400: #94a3b8;
  --color-neutral-500: #64748b;
  --color-neutral-600: #475569;
  --color-neutral-700: #334155;
  --color-neutral-800: #1e293b;
  --color-neutral-900: #0f172a;
  --color-neutral-950: #020617;

  /* 字体 */
  --font-sans: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", Consolas, Monaco, monospace;

  /* 阴影 */
  --shadow-glow: 0 0 20px rgba(99, 102, 241, 0.15);
  --shadow-glow-lg: 0 0 40px rgba(99, 102, 241, 0.2);
  --shadow-glow-secondary: 0 0 20px rgba(16, 185, 129, 0.15);
  --shadow-soft: 0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04);
  --shadow-soft-lg: 0 10px 40px -10px rgba(0, 0, 0, 0.1), 0 2px 10px -2px rgba(0, 0, 0, 0.04);
  --shadow-card: 0 0 0 1px rgba(0, 0, 0, 0.03), 0 2px 4px rgba(0, 0, 0, 0.05), 0 12px 24px rgba(0, 0, 0, 0.05);
  --shadow-card-hover: 0 0 0 1px rgba(99, 102, 241, 0.1), 0 4px 8px rgba(0, 0, 0, 0.08), 0 16px 32px rgba(0, 0, 0, 0.06);

  /* 动画 */
  --animate-fade-in: fadeIn 0.3s ease-in-out;
  --animate-slide-up: slideUp 0.3s ease-out;
  --animate-slide-down: slideDown 0.3s ease-out;
  --animate-scale-in: scaleIn 0.2s ease-out;
  --animate-shimmer: shimmer 2s linear infinite;

  /* 字号 */
  --text-2xs: 0.65rem;
  --text-2xs--line-height: 1rem;
}
```

- [ ] **Step 2: 删除 `@config "../tailwind.config.js"` 行**

从 index.css 中删除这一行（应在文件第二行）。

- [ ] **Step 3: 简化 postcss.config.js（Tailwind v4 不再需要 autoprefixer 插件）**

将 `client/postcss.config.js` 改为：

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

- [ ] **Step 4: 简化 tailwind.config.js（保留作为 CSS 定义参考，标记为废弃）**

```js
/** 
 * @deprecated Tailwind v4 不再使用此文件，主题已迁移到 index.css 的 @theme 块。
 * 保留仅为参考，后续可安全删除。
 */
export default {
  content: [],
};
```

- [ ] **Step 5: 验证构建**

```bash
cd C:\Users\Yum\Desktop\TestProject\MyBlog\client && npm run build
```

Expected: 构建成功，无 CSS 相关错误。

- [ ] **Step 6: Commit**

```bash
git add client/src/index.css client/tailwind.config.js client/postcss.config.js
git commit -m "refactor: migrate Tailwind config to v4 @theme directives"
```

---

### Task 9: 精简 client/package.json 依赖

**Files:**
- Modify: `client/package.json`

- [ ] **Step 1: 移除不需要的依赖**

从 `dependencies` 中删除以下包（已无任何文件引用）：
- `axios` — 不再调用 API
- `react-hot-toast` — toast 通知跟在 services/api.ts 死代码中
- `react-syntax-highlighter` — 当前 PostDetailPage 中的代码高亮使用 Prism/SyntaxHighlighter，需确认保留还是替换

确认 `react-syntax-highlighter` 是否保留：PostDetailPage.tsx 中直接使用了它。暂时保留。

```bash
cd C:\Users\Yum\Desktop\TestProject\MyBlog\client && npm uninstall axios react-hot-toast
```

- [ ] **Step 2: 运行 npm install 确保 lock 文件更新**

```bash
cd C:\Users\Yum\Desktop\TestProject\MyBlog\client && npm install
```

- [ ] **Step 3: Commit**

```bash
git add client/package.json client/package-lock.json
git commit -m "chore: remove unused dependencies (axios, react-hot-toast)"
```

---

### Task 10: 修复 index.html SEO 基础配置

**Files:**
- Modify: `client/index.html`

- [ ] **Step 1: 更新 index.html**

将 `client/index.html` 替换为：

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/TestProject/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Yum 的技术博客 — 记录技术成长，分享编程心得" />
    <meta property="og:title" content="Yum's Blog" />
    <meta property="og:description" content="Yum 的技术博客 — 记录技术成长，分享编程心得" />
    <meta property="og:type" content="website" />
    <title>Yum's Blog</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add client/index.html
git commit -m "fix: improve SEO (title, lang, meta description, OG tags)"
```

---

### Task 11: 修复 Footer 部署文案

**Files:**
- Modify: `client/src/components/layout/Footer.tsx`

- [ ] **Step 1: 修改文案**

在 `client/src/components/layout/Footer.tsx` 中，将：

```
Built with React &middot; Deployed on Vercel
```

改为：

```
Built with React &middot; Deployed on GitHub Pages
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/layout/Footer.tsx
git commit -m "fix: correct deployment platform in footer"
```

---

### Task 12: 修复 Giscus 仓库配置

**Files:**
- Modify: `client/src/pages/PostDetailPage.tsx`

- [ ] **Step 1: 修正 data-repo 属性**

在 `client/src/pages/PostDetailPage.tsx` 的 `GiscusComments` 组件中，将：

```tsx
data-repo="Yum-wu/MyBlog"
```

改为：

```tsx
data-repo="Yum-wu/TestProject"
```

- [ ] **Step 2: Commit**

```bash
git add client/src/pages/PostDetailPage.tsx
git commit -m "fix: correct Giscus repository name"
```

---

### Task 13: 修复 Header 中未使用的代码

**Files:**
- Modify: `client/src/components/layout/Header.tsx`

- [ ] **Step 1: 删除未使用的 import 和无用 ref**

删除 `useNavigate` import（如果无其他地方使用）：

```diff
-import { useState, useRef, useEffect } from "react";
-import { Link, useNavigate } from "react-router-dom";
+import { useState } from "react";
+import { Link } from "react-router-dom";
```

删除 `searchInputRef` 和 `useEffect` 自动聚焦：

```diff
-  const searchInputRef = useRef<HTMLInputElement>(null);
-  const navigate = useNavigate();
-
-  /* 搜索框打开时自动聚焦 */
-  useEffect(() => {
-    if (searchInputRef.current) {
-      searchInputRef.current.focus();
-    }
-  }, []);
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/layout/Header.tsx
git commit -m "refactor: remove unused code in Header component"
```

---

### Task 14: 最终验证构建

- [ ] **Step 1: 安装依赖并构建**

```bash
cd C:\Users\Yum\Desktop\TestProject\MyBlog\client && npm install && npm run build
```

Expected: 构建成功，无错误和警告。

- [ ] **Step 2: 检查构建产物中不该存在的文件**

```bash
# 确认没有 server 相关文件被打包
ls C:\Users\Yum\Desktop\TestProject\MyBlog\client\dist\assets\js\ | Select-String "api|auth|comment|editor|login|register|profile"
```

Expected: 无匹配结果。

- [ ] **Step 3: 如果有 vitest 测试，运行测试**

```bash
cd C:\Users\Yum\Desktop\TestProject\MyBlog\client && npm test
```

- [ ] **Step 4: Commit（如有修改）**

```bash
git add -A
git commit -m "chore: final verification after cleanup"
```
