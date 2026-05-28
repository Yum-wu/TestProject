# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Repository Overview

Monorepo containing multiple independent frontend and full-stack projects for learning and practice purposes.

## Project Quick Reference

| Project | Type | Tech Stack |
|---------|------|------------|
| `OnlineStore/` | Full-stack | Next.js 14, Prisma, PostgreSQL, Tailwind, TypeScript |
| `MyBlog/` | Static blog | React 19 + Vite 8, Tailwind, local Markdown |
| `Aureon/` | AI Agent | React 19 + FastAPI + LangChain + Python + Tailwind |
| `MarkdownNotes/` | Frontend | React + Vite, TypeScript, Tailwind, Markdown editor |
| `AIImageGenerator/` | Frontend | React + Vite, JavaScript, Tailwind, OpenAI API |
| `AIWritingAssistant/` | Frontend | React + Vite, JavaScript, Tailwind, OpenAI API |
| `PomodoroTimer/` | Frontend | Webpack, JavaScript |
| `WeatherInquiry/` | Frontend | Webpack, JavaScript |
| `todo-app/` | Frontend | React + Vite, JavaScript |
| `VoiceRecognition/` | Frontend | Express, HTML/CSS/JS |

## Build & Development Commands

### All Vite projects (most projects)
```bash
# Install dependencies
cd <project-dir> && npm install

# Start dev server
cd <project-dir> && npm run dev

# Build for production
cd <project-dir> && npm run build

# Preview production build
cd <project-dir> && npm run preview
```

### OnlineStore (Next.js full-stack)
```bash
cd OnlineStore

# Install dependencies
npm install

# Generate Prisma client (after schema changes)
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start dev server
npm run dev

# Build for production
npm run build

# Run lint
npm run lint
```

### MyBlog (static)
```bash
cd MyBlog/client && npm install && npm run dev
```

**部署：** 推送到 `main` 分支后 GitHub Actions 自动构建并部署到 Pages。
URL：`https://yum-wu.github.io/TestProject/`

### Aureon (Agent: FastAPI + React)
```bash
# Backend
cd Aureon/backend && pip install -r requirements.txt
# 先配置 backend/.env（复制 .env.example 填入 API Key）
uvicorn app.main:app --reload --port 8000

# Frontend (另一个终端)
cd Aureon && npm install && npm run dev
```

## Language & Communication

- All dialogue and thinking should be in Chinese (or Chinese/English bilingual), as specified by project rules in `.trae/rules/`.

## Code Conventions

- **TypeScript** is used in: `OnlineStore/`, `MyBlog/client`, `Aureon/`, `MarkdownNotes/`
- **JavaScript** is used in: `AIImageGenerator/`, `AIWritingAssistant/`, `PomodoroTimer/`, `WeatherInquiry/`, `todo-app/`
- **Python** is used in: `Aureon/backend/` (FastAPI + LangChain)
- All Vite projects use `npm run dev` / `npm run build`
- OnlineStore uses Next.js App Router (`app/` directory)
- MyBlog has a client/server split with separate `package.json` files
- Component libraries: Tailwind CSS across all recent projects
- State management: React hooks (no external state libs)
