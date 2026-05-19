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
| `Chatbot/` | AI Agent | React 19 + FastAPI + LangChain + Python + Tailwind |
| `MarkdownNotes/` | 前端 | React + Vite, TypeScript, Tailwind, Markdown 编辑器 |
| `AIImageGenerator/` | 前端 | React + Vite, JavaScript, Tailwind, OpenAI API |
| `AIWritingAssistant/` | 前端 | React + Vite, JavaScript, Tailwind, OpenAI API |
| `PomodoroTimer/` | 前端 | Webpack, JavaScript |
| `WeatherInquiry/` | 前端 | Webpack, JavaScript |
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

### Chatbot（Agent：FastAPI + React）
```bash
# 后端
cd Chatbot/backend && pip install -r requirements.txt
# 先配置 backend/.env（复制 .env.example 填入 API Key）
uvicorn app.main:app --reload --port 8000

# 前端（另开终端）
cd Chatbot && npm install && npm run dev
```

## 语言与沟通

- 所有对话和思考应使用中文（或中英双语）。

## 代码规范

- **TypeScript** 用于：`OnlineStore/`、`MyBlog/client`、`Chatbot/`、`MarkdownNotes/`
- **JavaScript** 用于：`AIImageGenerator/`、`AIWritingAssistant/`、`PomodoroTimer/`、`WeatherInquiry/`、`todo-app/`
- **Python** 用于：`Chatbot/backend/`（FastAPI + LangChain）
- 所有 Vite 项目使用 `npm run dev` / `npm run build`
- OnlineStore 使用 Next.js App Router（`app/` 目录）
- MyBlog 有 client/server 分离，各自有独立的 `package.json`
- 组件库：近期项目均使用 Tailwind CSS
- 状态管理：React hooks（无外部状态库）
