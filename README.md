# TestProject

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

个人学习与实践项目集合，涵盖全栈开发、前端应用、AI 工具等多个方向的技术探索。

> 这是一个单体仓库（monorepo），包含 11 个独立项目。每个项目均为独立子目录，可单独运行和部署。

---

## 项目总览

| 项目 | 类型 | 技术栈 | 状态 |
|------|------|--------|------|
| [OnlineStore](./OnlineStore) | 全栈电商 | Next.js 14 + Prisma + PostgreSQL + Tailwind + TypeScript | 完善 |
| [MyBlog](./MyBlog) | 静态博客 | React 19 + Vite 8 + Tailwind + Markdown 本地文件 (<a href="https://yum-wu.github.io/TestProject/" target="_blank">在线访问</a>) | 完善 |
| [Chatbot](./Chatbot) | AI 聊天 Agent | React 19 + FastAPI + LangChain + TypeScript | 完善 |
| [MarkdownNotes](./MarkdownNotes) | Markdown 笔记 | React 19 + Vite + TypeScript + Tailwind | 完善 |
| [WeatherInquiry](./WeatherInquiry) | 天气查询 | React 19 + Vite + TypeScript + Tailwind | 完善 |
| [todo-app](./todo-app) | 待办事项 | React 18 + Vite + TypeScript + Zustand + Tailwind | 完善 |
| [AIImageGenerator](./AIImageGenerator) | AI 绘图 | React 18 + Vite + JavaScript + Tailwind | 可用 |
| [AIWritingAssistant](./AIWritingAssistant) | AI 写作 | React + Vite + JavaScript + Tailwind | 可用 |
| [PomodoroTimer](./PomodoroTimer) | 番茄钟 | React 18 + Vite + TypeScript + Tailwind | 可用 |
| [VoiceRecognition](./VoiceRecognition) | 语音识别 | Express + 智谱 API + HTML/CSS/JS | 可用 |

---

## 项目详细介绍

### 全栈项目

#### [OnlineStore](./OnlineStore)
极简在线商城，实现完整的电商全栈业务逻辑。
- 商品浏览与搜索、购物车管理、订单管理、地址管理
- 乐观锁防超卖、Prisma ORM、PostgreSQL 数据库
- 响应式设计，支持移动端适配

#### [MyBlog](./MyBlog)
纯静态个人博客，零后端依赖。
- Markdown 本地文章（`client/src/content/posts/`），构建时自动打包
- Giscus 评论（基于 GitHub Discussions）
- 客户端全文搜索、分类筛选
- GitHub Pages 自动部署（`<a href="https://yum-wu.github.io/TestProject/">在线访问</a>`）

### AI 应用

#### [Chatbot](./Chatbot)
AI 聊天助手（Agent 架构），支持多轮对话、工具调用、RAG 知识库问答。
- **前端**：React 19 + TypeScript + Tailwind CSS 4 + SSE 流式响应
- **后端**：Python FastAPI + LangChain 1.3 Agent 架构
- **Agent 工具**：计算器、引用文件读取、Web 搜索（条件注册）、知识库检索
- **LangGraph 编排**：意图路由（chat/rag/tool）+ MCP 风格工具注册 + 条件跳转
- **RAG 管道**：Chroma 向量库 + Sentence Embedding + MMR 重排序 + LLM 生成
- **四层记忆系统**：L0 对话记录 → L1 原子事实 → L2 场景总结 → L3 用户画像
- 启动方式：`Chatbot/backend` 运行 `uvicorn` 后端 + `Chatbot/` 运行 `npm run dev` 前端
- **Docker 容器化**：支持 Docker Compose 一键启动前后端，Hot Reload 开发模式
- **Agent 评估**（2026-05-17）：工具调用准确率 80%（calculator 4/4 满分），中位延迟 1.57s，评估脚本见 `Chatbot/backend/tests/eval_agent.py`

#### [AIImageGenerator](./AIImageGenerator)
AI 图片生成器，通过文本描述生成图片。
- 8 种绘画风格、多种尺寸选项
- 提示词优化、历史记录管理

#### [AIWritingAssistant](./AIWritingAssistant)
智能写作助手，支持 6 种写作模式。
- 续写、改写、扩展、总结、邮件、文案
- 流式输出、创意度调节、输出长度控制

#### [VoiceRecognition](./VoiceRecognition)
AI 语音识别应用，基于智谱 API。
- 浏览器录音、实时倒计时
- 识别结果编辑、历史记录本地存储

### 工具类应用

#### [MarkdownNotes](./MarkdownNotes)
简洁高效的 Markdown 笔记应用，支持实时预览。
- 代码语法高亮（oneDark 主题）
- 笔记管理和搜索、GFM 语法支持

#### [WeatherInquiry](./WeatherInquiry)
轻量级天气查询单页应用。
- 实时天气、空气质量、5 天预报、天气预警
- 多城市对比、城市收藏、网络容错

#### [todo-app](./todo-app)
个人待办事项管理应用。
- 分类筛选、优先级标签、截止日期
- 统计概览（环形进度条）、LocalStorage 持久化

#### [PomodoroTimer](./PomodoroTimer)
番茄工作法计时器，帮助专注管理时间。
- 自定义工作/休息时长、统计概览
- 浏览器通知 + 提示音、数据持久化

---

## 技术栈速览

| 类别 | 技术 |
|------|------|
| 前端框架 | React 19 / React 18, Next.js 14 |
| 后端框架 | Python FastAPI, Express, Next.js API Routes |
| 数据库 | PostgreSQL, MySQL, SQLite |
| 语言 | TypeScript, JavaScript, Python |
| 构建工具 | Vite, Webpack |
| 样式 | Tailwind CSS |
| ORM | Prisma |
| AI 框架 | LangChain 1.3 |
| AI API | OpenAI, 智谱 AI |
| 部署 | GitHub Actions, Vercel |

---

## 快速开始

### 环境要求

- Node.js 18+
- npm 9+

### 运行任意项目

```bash
# 进入项目目录
cd <project-name>

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### Docker 运行 Chatbot

```bash
# 构建并启动前后端服务
docker compose up --build

# 查看日志
docker compose logs -f

# 停止服务
docker compose down

# 后台运行
docker compose up -d
```

**端口：** 后端 `8000` | 前端 `5173`
**前置条件：** 在 `Chatbot/backend/.env` 中配置 LLM_API_KEY、LLM_MODEL、LLM_BASE_URL
**环境变量：** 所有密钥通过 `.env` 注入，不打包进镜像
**开发模式：** 支持 Hot Reload（bind mount 挂载源码）

> 部分项目（OnlineStore、MyBlog、Chatbot）需要额外配置数据库或 API 密钥，请参考各项目内的 README 文档。

---

## 项目列表速查

| 目录 | 包名 | 端口 | 数据库 | API |
|------|------|------|--------|-----|
| `OnlineStore/` | - | 3000 | PostgreSQL | 内置 API |
| `MyBlog/client` | client | 5173 | - | 本地 Markdown |
| `Chatbot/` | ai-chatbot | 5173 (前端) / 8000 (后端) / Docker Compose | SQLite (记忆) | 智谱 AI |
| `MarkdownNotes/` | markdownnotes | 5173 | - | - |
| `WeatherInquiry/` | weatherinquiry | 5173 | - | OpenWeatherMap |
| `todo-app/` | todo-app | 5173 | - | - |
| `AIImageGenerator/` | ai-image-generator | 5173 | - | AI API |
| `AIWritingAssistant/` | - | 5173 | - | AI API |
| `PomodoroTimer/` | pomodoro-timer | 5173 | - | - |
| `VoiceRecognition/` | voicerecognition | 3000 | - | 智谱 AI |

---

## 许可证

MIT License
