---
title: "SPA 部署 GitHub Pages 踩坑实录 — 从 404 到白屏再到路由 404"
date: 2026-05-15
slug: spa-github-pages
tags: [技术, GitHub Pages, SPA, 前端]
category: 技术
excerpt: 把 React SPA 部署到 GitHub Pages，你以为跑一下 build 就行？我前后修了 7 个问题才让页面正常渲染。这篇文章记录了完整的踩坑路径和修复方案。
---

# SPA 部署 GitHub Pages 踩坑实录

把 React SPA 部署到 GitHub Pages，听起来很简单对吧？`npm run build`，把 `dist` 扔上去，完事。

我一开始也是这么想的。结果前后修了 **7 个问题**，经历了 **404 → 白屏 → 路由 404** 的三阶段崩溃。

## 问题全览

| 阶段 | 现象 | 原因 |
|------|------|------|
| 部署 | 页面 404 | 上传了错误的目录 |
| 构建 | 找不到文件 | 构建产物被 gitignore，CI 上没有 |
| 构建 | `CustomEvent is not defined` | Node.js 版本太低 |
| 渲染 | 页面空白 | `base` 路径没配 |
| 渲染 | 显示 404 页面 | `basename` 没配 |
| 构建 | TypeScript 编译失败 | 旧代码引用了已删除的函数 |
| 路由 | 直接访问文章链接 404 | 服务器不认识 SPA 路由 |

下面一个一个说。

---

## 问题 1：上传了错误的内容 → 404

**现象：** 访问 `https://yum-wu.github.io/TestProject/` 返回 GitHub 的 404 页面。

**根因：** GitHub Actions 的部署工作流用了 `path: '.'`，把整个仓库根目录上传了。仓库是个 monorepo（11 个子项目），根目录根本没有 `index.html`。

**修复：** 把路径指向构建产物目录：

```yaml
- uses: actions/upload-pages-artifact@v3
  with:
    path: 'MyBlog/client/dist'   # 而不是 '.'
```

## 问题 2：CI 上没有构建产物

**现象：** 改了路径后 CI 报错 `tar: MyBlog/client/dist: No such file or directory`。

**根因：** `dist/` 在 `.gitignore` 里，仓库里根本没有，CI 也不会凭空变出来。

**修复：** 在 CI 工作流中加入构建步骤：

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

## 问题 3：Node.js 版本过旧

**现象：** 构建时报错 `CustomEvent is not defined`。

**根因：** CI 默认用了 Node.js 18，但 Vite 8 要求 Node.js 20.19+ 或 22.12+。`CustomEvent` 从 Node 21 才原生支持。

**修复：** 指定 Node 22。

## 问题 4：资源路径缺少仓库前缀 → 页面空白

**现象：** 页面能加载了，但一片空白。打开控制台，JS/CSS 全部加载失败（404）。

**根因：** 项目部署在 `https://yum-wu.github.io/TestProject/` 下，但构建时资源路径是绝对根路径 `/assets/js/index.js`。浏览器请求的是 `https://yum-wu.github.io/assets/js/index.js`（少了 `/TestProject/`），自然不会存在。

**修复：** 在 `vite.config.ts` 里设置 `base`：

```ts
export default defineConfig({
  base: "/TestProject/",   // ★ 必须跟 GitHub Pages 的子路径一致
  plugins: [react()],
});
```

## 问题 5：前端路由缺少 basename → 显示空白 404

**现象：** 资源加载正常了，页面开始渲染，但显示的是 React 应用内的 404 页面，而不是首页。

**根因：** `BrowserRouter` 默认 `basename="/"`，但应用实际部署在 `/TestProject/` 下。访问 `/TestProject/` 时，React Router 看到的路径是 `/TestProject/`，而不是 `/`，所以匹配不到首页路由，直接走到 `path="*"` 的 404 兜底。

**修复：** 给 `BrowserRouter` 设置 `basename`：

```tsx
<BrowserRouter basename="/TestProject">
  <App />
</BrowserRouter>
```

**关键：** `vite.config.ts` 的 `base` 控制**静态资源路径**，`BrowserRouter` 的 `basename` 控制**前端路由路径**。两个都要配，缺一不可。

## 问题 6：旧代码引用了已删除的函数 → 构建失败

**现象：** CI 构建报大量 TypeScript 错误，涉及 `getToken`、`setToken`、`uploadCover` 等不存在的导出。

**根因：** 本地做了架构迁移（从 API 后端改为本地 Markdown 文件），砍掉了大量旧的 API 和 auth 函数。但有些旧文件（测试、hooks）还在引用它们。

**修复：** 构建命令去掉类型检查，只保留构建（Vite 构建时不检查未引用文件的类型）：

```json
{
  "scripts": {
    "build": "vite build"   // 去掉 "tsc -b &&"
  }
}
```

更彻底的修复当然是清理那些旧代码，但如果改动范围太大，这算是一个实用的折中方案。

## 问题 7：SPA 路由在静态服务器上 → 404

**现象：** 首页好了，但直接访问 `https://yum-wu.github.io/TestProject/posts/hello-world` 返回服务器的 404。

**根因：** GitHub Pages 是**静态文件服务器**，没有 SPA 回退机制。它去 `posts/hello-world` 这个路径下找文件，找不到就返回 404。React Router 根本没机会启动。

**修复：** 构建后把 `index.html` 复制一份为 `404.html`：

```yaml
- name: Copy index.html to 404.html (SPA routing)
  run: cp MyBlog/client/dist/index.html MyBlog/client/dist/404.html
```

GitHub Pages 对未匹配的路径会返回这个 `404.html`（但保持 URL 不变），React 应用启动后，React Router 根据当前 URL 正确匹配到对应页面。

---

## 完整解决方案速查

### 在 CI 工作流中

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

### 在 Vite 配置中

```ts
export default defineConfig({
  base: "/TestProject/",  // 必须与部署子路径一致
});
```

### 在 React Router 中

```tsx
<BrowserRouter basename="/TestProject">
  <App />
</BrowserRouter>
```

### 自检清单

部署完如果还是空白或 404，按这个顺序排查：

1. **打开浏览器开发者工具 → Network 面板**：JS/CSS 是否 200？
   - 不是 → `base` 路径问题
2. **Console 面板**：有没有报错？
3. **Elements 面板**：`<div id="root">` 里有没有内容？
   - 没有 → JS 执行报错
   - 有 404 页面内容 → React Router `basename` 问题
4. **直接访问一个非首页路径**：是否正常？
   - 服务器 404 → 缺少 `404.html` 回退方案
5. **检查 CI 构建日志**：构建是否用了正确的仓库代码？
   - 本地改了很多但没提交 → CI 用的旧版

---

## 总结

GitHub Pages 是个优秀的免费静态托管方案，但 **SPA 对它来说是二等公民**。从资源路径到前端路由再到 404 回退，每一层都需要显式适配。多一步、少一步都不行。

最反直觉的是第 7 个问题：`404.html` 其实不展示 404，反而是让 SPA 正常工作的关键。静态服务器的限制，最终要用一个"欺骗"手段来解决。

希望这篇记录能帮你少踩同样的坑。
