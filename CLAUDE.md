# CLAUDE.md

本文件为 Claude Code 在此仓库中工作时的指南。
开始任何对话时调用/using-superpower

## 仓库概览

本仓库是一个单体仓库（monorepo），包含多个独立的前端和全栈项目，用于学习和练习。

## 项目速查

| 项目 | 类型 | 技术栈 |
|------|------|--------|
| `OnlineStore/` | 全栈 | Next.js 14, Prisma, PostgreSQL, Tailwind, TypeScript |
| `MyBlog/` | 静态博客 | React 19 + Vite 8, Tailwind, 本地 Markdown |
| `Chatbot/` | AI Agent + 文章生成 | React 19 + FastAPI + LangChain + CrewAI + Python + Tailwind |
| `MarkdownNotes/` | 前端 | React + Vite, TypeScript, Tailwind, Markdown 编辑器 |
| `AIImageGenerator/` | 前端 | React + Vite, JavaScript, Tailwind, OpenAI API |
| `AIWritingAssistant/` | 前端 | React + Vite, JavaScript, Tailwind, OpenAI API |
| `PomodoroTimer/` | 前端 | React + Vite, TypeScript, Tailwind |
| `WeatherInquiry/` | 前端 | React + Vite, TypeScript, Tailwind |
| `todo-app/` | 前端 | React + Vite, JavaScript |
| `VoiceRecognition/` | 前端 | Express, HTML/CSS/JS |

## 构建与开发命令

### 所有 Vite 项目（大部分项目）
```bash
# 安装依赖
cd <项目目录> && npm install

# 启动开发服务器
cd <项目目录> && npm run dev

# 构建生产版本
cd <项目目录> && npm run build

# 预览生产构建
cd <项目目录> && npm run preview
```

### OnlineStore（Next.js 全栈）
```bash
cd OnlineStore

# 安装依赖
npm install

# 生成 Prisma 客户端（schema 变更后）
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 运行 lint
npm run lint
```

### MyBlog（静态博客）
```bash
cd MyBlog/client && npm install && npm run dev
```

**部署：** 推送到 `main` 分支后 GitHub Actions 自动构建并部署到 Pages。
URL：`https://yum-wu.github.io/TestProject/`

### Chatbot（主 Agent + 文章生成）
```bash
# 后端（主 Agent）
cd Chatbot/backend && pip install -r requirements.txt
# 先配置 backend/.env（复制 .env.example 填入 API Key）
uvicorn app.main:app --reload --port 8000

# 前端
cd Chatbot && npm install && npm run dev

# 文章生成服务（CrewAI，端口 8001）
cd Chatbot/crew && pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

## 插件技能（claude-code-setup v2）

已安装 16 个插件到 `~/.claude/plugins/`，分三类使用：

### 自动触发（Hooks，无需手动调用）
- `security-essentials` — 文件保护、命令校验、变更限速
- `blog-context-detector` — 自动检测当前任务注入上下文
- `tailwind-expert` — 自动校验 Tailwind 配置/构建前检查
- `testing-toolkit` — 提交时自动触发测试
- `project-management` — 任务状态持久化
- `shadcn-style-expert` — CSS 风格守护
- `mdx-blog` — Frontmatter 校验

### 手动调用（Slash Commands）
```
前端          /frontend-expert  /component-architecture  /state-management
             /react-optimization  /performance-audit  /css-architecture
             /vue-composition-api  /optimization

Tailwind     /tailwind-expert  /setup-tailwind  /validate-tailwind-config
             /fix-custom-utilities  /check-tailwind-utilities  /fix-styling
             /tailwind-v4-migration

shadcn/ui    /shadcn-component  /css-architecture

Node.js      /node-developer

Python       /python-developer

测试         /testing-best-practices

代码质量     /code-quality  /fix-issue  /fix-zh  /review-zh  /explain-zh  /test-zh

项目管理     /project-management  /create-tasks  /update-tasks  /from-prd
             /generate-docs  /security-best-practices

博客         /new-blog-post

AWS CDK      /cdk-*（12 条命令：/cdk-build-deploy、/cdk-stack-pattern 等）
             /static-site-cdk  /s3-static-site  /cloudfront-setup
ECS          /ecs-health-check-setup  /ecs-health-check-commands  /ecs-bitnami-wordpress
RDS          /rds-optimization  /rds-troubleshooting  /database-backup-strategy
```

### Agent（对话中自动识别场景调用）
- `Frontend Expert` / `Tailwind CSS Expert` / `shadcn/ui Style Expert`
- `Testing Toolkit` / `Project Management`
- `Blog Context Detector` / `MDX Blog Manager`
- `AWS CDK Development` / `AWS ECS Expert` / `AWS RDS Expert` / `Static Site CDK`

## 语言与沟通

- 所有对话和思考应使用中文（或中英双语）。

## 代码规范

- **TypeScript** 用于：`OnlineStore/`、`MyBlog/client`、`Chatbot/`、`MarkdownNotes/`、`PomodoroTimer/`、`WeatherInquiry/`
- **JavaScript** 用于：`AIImageGenerator/`、`AIWritingAssistant/`、`todo-app/`
- **Python** 用于：`Chatbot/backend/`（FastAPI + LangChain）
- 所有 Vite 项目使用 `npm run dev` / `npm run build`
- OnlineStore 使用 Next.js App Router（`app/` 目录）
- MyBlog 是纯静态博客，Markdown 文件在 `client/src/content/posts/`
- 组件库：近期项目均使用 Tailwind CSS
- 状态管理：React hooks（无外部状态库）

## MyBlog 博客文章双语言约定

- 每篇新文章必须同时创建中文版 (`xxx.md`, `lang: zh`) 和英文版 (`en/xxx.md`, `lang: en`)
- 中英文版使用相同 `slug`，中文放 `posts/` 根目录，英文放 `posts/en/` 子目录
- 标题、分类、标签、正文需各自语言独立编写
- 英文页面的分类和标签使用英文名称（如 Technology, Life, AI）
