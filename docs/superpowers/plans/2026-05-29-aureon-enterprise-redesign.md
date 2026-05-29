# Aureon Enterprise Redesign 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor Aureon from demo project to production-grade Enterprise AI Knowledge Base Platform for job portfolio

**Architecture:** Frontend (React + Vite + TypeScript + Tailwind) + Backend (FastAPI + LangGraph) with Docker deployment. Linear-style dark theme design system.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, FastAPI, Docker, GitHub Actions

---

## 实施顺序

本计划分 7 个阶段，按顺序执行：

| 阶段 | 内容 | 计划文件 |
|------|------|----------|
| Week 1 | 设计系统 + Landing + README | `week-1-design-landing.md` |
| Week 2 | Search 页面重构 | `week-2-search.md` |
| Week 3 | Dashboard + Analytics | `week-3-dashboard.md` |
| Week 4 | Architecture 页面 | `week-4-architecture.md` |
| Week 5 | Docker + CI/CD | `week-5-deployment.md` |
| Week 6 | 文档体系 | `week-6-docs.md` |
| Week 7 | 独立仓库 + 收尾 | `week-7-migration.md` |

每个阶段有独立计划文件，包含完整任务步骤。

---

## 文件结构变更

### 新增文件

```
src/
├── styles/
│   └── design-tokens.css          # 设计系统 tokens
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   └── MetricCard.tsx
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   └── PageContainer.tsx
│   ├── landing/
│   │   ├── HeroSection.tsx
│   │   ├── FeatureGrid.tsx
│   │   └── BenchmarkSection.tsx
│   ├── search/
│   │   ├── SearchBar.tsx
│   │   ├── StreamingAnswer.tsx
│   │   ├── CitationList.tsx
│   │   └── SourceCard.tsx
│   ├── dashboard/
│   │   ├── MetricGrid.tsx
│   │   ├── QueryVolumeChart.tsx
│   │   └── RecentQueries.tsx
│   └── architecture/
│       ├── ArchitectureFlow.tsx
│       └── OptimizationStory.tsx
├── pages/
│   └── Architecture.tsx           # 新页面
└── types/
    ├── search.ts
    ├── metrics.ts
    └── architecture.ts
```

### 修改文件

```
src/
├── index.css                      # 更新为设计系统
├── App.tsx                        # 更新路由
├── pages/
│   ├── Landing.tsx                # 重写
│   ├── Search.tsx                 # 重构
│   ├── Dashboard.tsx              # 重构
│   └── Analytics.tsx              # 优化视觉
├── hooks/
│   └── useStreaming.ts            # 新增
└── services/
    └── api.ts                     # 更新 API 调用
```

---

## 核心组件接口

### MetricCard

```tsx
interface MetricCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  change?: number;
  changeLabel?: string;
}
```

### SearchBar

```tsx
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}
```

### StreamingAnswer

```tsx
interface StreamingAnswerProps {
  content: string;
  citations: Citation[];
  isStreaming: boolean;
}
```

---

## 详细计划

每个阶段的详细步骤见对应计划文件。开始实施时按顺序执行。
