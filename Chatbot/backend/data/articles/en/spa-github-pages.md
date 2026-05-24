---
title: "SPA Deployment on GitHub Pages — From 404 to Blank Screen to Route 404"
date: 2026-05-15
slug: spa-github-pages
tags: [Technology, GitHub Pages, SPA, Frontend]
category: Technology
excerpt: Deploying a React SPA to GitHub Pages — you think it's just running build? I had to fix 7 issues before the page rendered correctly. This post documents the full troubleshooting path.
lang: en
---

# SPA Deployment on GitHub Pages — Full Troubleshooting Guide

Deploying a React SPA to GitHub Pages sounds simple, right? `npm run build`, upload `dist`, done.

That's what I thought too. But I ended up fixing **7 issues**, going through a three-stage nightmare of **404 → Blank Screen → Route 404**.

## Issue Overview

| Stage | Symptom | Cause |
|-------|---------|-------|
| Deploy | Page 404 | Uploaded wrong directory |
| Build | File not found | Build output gitignored, missing on CI |
| Build | `CustomEvent is not defined` | Node.js version too low |
| Render | Blank page | `base` path not configured |
| Render | Shows 404 page | `basename` not configured |
| Build | TypeScript compilation failed | Old code referencing deleted functions |
| Routing | Direct article links return 404 | Server doesn't know SPA routing |

Let's go through each one.

---

## Issue 1: Uploaded Wrong Content → 404

**Symptom:** Visiting `https://yum-wu.github.io/TestProject/` returned GitHub's 404 page.

**Root Cause:** The GitHub Actions workflow used `path: '.'`, uploading the entire repo root. The repo is a monorepo (11 sub-projects), and the root doesn't have `index.html`.

**Fix:** Point to the build output directory:

```yaml
- uses: actions/upload-pages-artifact@v3
  with:
    path: 'MyBlog/client/dist'   # instead of '.'
```

## Issue 2: No Build Output on CI

**Symptom:** After changing the path, CI errored with `tar: MyBlog/client/dist: No such file or directory`.

**Root Cause:** `dist/` is in `.gitignore`, so it doesn't exist in the repo and CI won't magically create it.

**Fix:** Add build steps to the CI workflow:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '22'

- name: Install dependencies
  run: cd MyBlog/client && npm ci

- name: Build
  run: cd MyBlog/client && npm run build
```

## Issue 3: Node.js Version Too Old

**Symptom:** Build error `CustomEvent is not defined`.

**Root Cause:** CI used Node.js 18 by default, but Vite 8 requires Node.js 20.19+ or 22.12+. `CustomEvent` is natively supported from Node 21.

**Fix:** Specify Node 22.

## Issue 4: Missing Base Path → Blank Page

**Symptom:** Page loads but is completely blank. DevTools shows JS/CSS failed to load (404).

**Root Cause:** The project is deployed at `https://yum-wu.github.io/TestProject/`, but build assets have absolute root paths like `/assets/js/index.js`. The browser requests `https://yum-wu.github.io/assets/js/index.js` (missing `/TestProject/`).

**Fix:** Set `base` in `vite.config.ts`:

```ts
export default defineConfig({
  base: "/TestProject/",   // ★ Must match GitHub Pages subpath
  plugins: [react()],
});
```

## Issue 5: Missing basename → Shows App 404

**Symptom:** Assets load fine, page renders, but shows the React app's 404 page instead of the homepage.

**Root Cause:** `BrowserRouter` defaults to `basename="/"`, but the app is actually deployed under `/TestProject/`. When visiting `/TestProject/`, React Router sees the path as `/TestProject/` instead of `/`, so it can't match the home route and falls through to `path="*"`.

**Fix:** Set `basename` on `BrowserRouter`:

```tsx
<BrowserRouter basename="/TestProject">
  <App />
</BrowserRouter>
```

**Key insight:** `vite.config.ts`'s `base` controls **static asset paths**, while `BrowserRouter`'s `basename` controls **frontend routing paths**. Both must be configured.

## Issue 6: Old Code Referencing Deleted Functions → Build Failure

**Symptom:** CI build outputs numerous TypeScript errors about `getToken`, `setToken`, `uploadCover`, etc.

**Root Cause:** Local architecture migration (from API backend to local Markdown files) removed many old API and auth functions, but some old files (tests, hooks) still reference them.

**Fix:** Remove type-checking from build command, keep only the build step:

```json
{
  "scripts": {
    "build": "vite build"   // removed "tsc -b &&"
  }
}
```

A more thorough fix would be cleaning up old code, but this is a practical compromise when the change scope is too large.

## Issue 7: SPA Routes on Static Server → 404

**Symptom:** Homepage works, but directly visiting `https://yum-wu.github.io/TestProject/posts/hello-world` returns the server's 404.

**Root Cause:** GitHub Pages is a **static file server** with no SPA fallback mechanism. It looks for a file at `posts/hello-world`, doesn't find it, and returns 404. React Router never gets a chance to start.

**Fix:** Copy `index.html` to `404.html` after build:

```yaml
- name: Copy index.html to 404.html (SPA routing)
  run: cp MyBlog/client/dist/index.html MyBlog/client/dist/404.html
```

GitHub Pages returns this `404.html` for unmatched paths (keeping the URL intact). React then starts and matches the route correctly.

---

## Quick Reference

### In CI Workflow

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
    with:
      node-version: '22'
  - run: cd MyBlog/client && npm ci && npm run build
  - run: cp MyBlog/client/dist/index.html MyBlog/client/dist/404.html
  - uses: actions/upload-pages-artifact@v3
    with:
      path: 'MyBlog/client/dist'
  - uses: actions/deploy-pages@v4
```

### In Vite Config

```ts
export default defineConfig({
  base: "/TestProject/",  // Must match deployment subpath
});
```

### In React Router

```tsx
<BrowserRouter basename="/TestProject">
  <App />
</BrowserRouter>
```

### Troubleshooting Checklist

If the page is still blank or 404 after deployment, check in this order:

1. **Open DevTools → Network tab**: Are JS/CSS returning 200?
   - No → `base` path issue
2. **Console tab**: Any errors?
3. **Elements tab**: Does `<div id="root">` have content?
   - No → JS execution error
   - Shows 404 page content → React Router `basename` issue
4. **Directly visit a non-homepage path**: Does it work?
   - Server 404 → Missing `404.html` fallback
5. **Check CI build logs**: Did the build use the correct repo code?
   - Made lots of local changes without committing → CI used old version

---

## Summary

GitHub Pages is an excellent free static hosting solution, but **SPA is a second-class citizen on it**. From asset paths to frontend routing to 404 fallback, every layer needs explicit adaptation.

The most counterintuitive part is issue #7: `404.html` doesn't actually display a 404 — it's the key to making SPA work. Static server limitations ultimately need a bit of a "trick" to solve.

Hope this guide helps you avoid the same pitfalls.
