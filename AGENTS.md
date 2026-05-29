# Project: MyBlog 静态博客

## 项目位置
代码在仓库根目录的 `MyBlog/client/` 子目录下。

## 架构
纯前端 React SPA，无后端。文章存储在 `src/content/posts/*.md` 中，通过 `import.meta.glob` 批量加载，解析 YAML frontmatter。

## 关键约定

- **文章格式**: Markdown + YAML frontmatter（title, date, slug, tags, category, excerpt, lang）
- **语言字段**: frontmatter 中的 `lang` 字段（`zh` 或 `en`），用于区分中英文文章
- **路由**: React Router，`/posts/:slug` 为文章详情
- **样式**: Tailwind CSS v4 + CSS 变量
- **代码分包**: vite.config.ts 中 manualChunks 配置了 vendor 分包

## Base 路径双平台

| 平台 | 环境变量 | base | basename |
|------|---------|------|----------|
| GitHub Pages | `GITHUB_ACTIONS=true` | `/TestProject/` | `/TestProject` |
| Vercel | 无 | `/` | 无 |

## 部署

- **GitHub Pages**: `.github/workflows/static.yml` → 自动构建 + 部署
- **Vercel**: GitHub 集成，Root Directory 需设为 `MyBlog/client`

## 红线

- 删除文件前确认非前端源码
- 修改 `vite.config.ts` 的 `base` 需同步更新 `__BASE_PATH__` define
- git push / rebase / reset 须先问我
- 不改 .env、密钥、CI/CD 配置

## 语言规则
- 所有回复必须使用中文

