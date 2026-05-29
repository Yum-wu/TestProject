# Week 1: 设计系统 + Landing Page + README

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish design system and create enterprise-grade Landing Page

**Architecture:** Create design tokens CSS, base UI components, then compose Landing Page

**Tech Stack:** Tailwind CSS v4, React 19, TypeScript

---

## Task 1: 创建设计系统 Tokens

**Files:**
- Create: `src/styles/design-tokens.css`

- [ ] **Step 1: 创建 design-tokens.css**

```css
:root {
  /* Colors - Linear dark theme */
  --bg-primary: #0A0A0B;
  --bg-secondary: #111113;
  --bg-tertiary: #18181B;

  --text-primary: #FAFAFA;
  --text-secondary: #A1A1AA;
  --text-tertiary: #71717A;

  --border: #27272A;
  --border-hover: #3F3F46;

  --accent: #3B82F6;
  --accent-soft: rgba(59, 130, 246, 0.1);

  --success: #22C55E;
  --warning: #EAB308;
  --error: #EF4444;

  /* Typography */
  --font-sans: 'Inter', -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-metric: 3rem;
  --text-metric-large: 4rem;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;

  /* Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-full: 9999px;
}
```

- [ ] **Step 2: 更新 index.css 引用 tokens**

```css
@import './styles/design-tokens.css';

body {
  font-family: var(--font-sans);
  background-color: var(--bg-primary);
  color: var(--text-primary);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/styles/design-tokens.css src/index.css
git commit -m "feat: add design system tokens (Linear dark theme)"
```

---

## Task 2: 创建基础 UI 组件

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/MetricCard.tsx`

- [ ] **Step 1: 创建 Button.tsx**

```tsx
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'rounded-md font-medium transition-colors';

  const variants = {
    primary: 'bg-[var(--accent)] text-white hover:bg-blue-600',
    secondary: 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--border-hover)]',
    ghost: 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 2: 创建 Card.tsx**

```tsx
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`
        bg-[var(--bg-secondary)]
        border border-[var(--border)]
        rounded-lg p-6
        ${hover ? 'hover:border-[var(--border-hover)] transition-colors' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3: 创建 Badge.tsx**

```tsx
import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  const variants = {
    default: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]',
    success: 'bg-green-900/30 text-[var(--success)]',
    warning: 'bg-yellow-900/30 text-[var(--warning)]',
    error: 'bg-red-900/30 text-[var(--error)]',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}
```

- [ ] **Step 4: 创建 MetricCard.tsx**

```tsx
import { Card } from './Card';

interface MetricCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  change?: number;
  changeLabel?: string;
}

export function MetricCard({ label, value, suffix, change, changeLabel }: MetricCardProps) {
  return (
    <Card>
      <p className="text-[var(--text-secondary)] text-sm mb-2">{label}</p>
      <p className="text-4xl font-semibold text-[var(--text-primary)]">
        {value}
        {suffix && <span className="text-lg ml-1">{suffix}</span>}
      </p>
      {change !== undefined && (
        <p className={`text-sm mt-2 ${change >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          {changeLabel && <span className="text-[var(--text-tertiary)] ml-1">{changeLabel}</span>}
        </p>
      )}
    </Card>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add base UI components (Button, Card, Badge, MetricCard)"
```

---

## Task 3: 创建 Landing 页面组件

**Files:**
- Create: `src/components/landing/HeroSection.tsx`
- Create: `src/components/landing/FeatureGrid.tsx`
- Create: `src/components/landing/BenchmarkSection.tsx`

- [ ] **Step 1: 创建 HeroSection.tsx**

```tsx
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export function HeroSection() {
  return (
    <section className="py-24 px-4 text-center">
      <Badge variant="success">Production Ready</Badge>

      <h1 className="text-5xl font-bold mt-6 mb-4">
        Production AI Search
        <br />
        for Enterprise Knowledge
      </h1>

      <p className="text-[var(--text-secondary)] text-xl max-w-2xl mx-auto mb-8">
        Enterprise-grade hybrid retrieval platform with streaming answers,
        citations, and real-time analytics.
      </p>

      <div className="flex gap-8 justify-center mb-10">
        <div>
          <p className="text-4xl font-bold text-[var(--accent)]">96.08%</p>
          <p className="text-[var(--text-secondary)] text-sm">Recall@3</p>
        </div>
        <div>
          <p className="text-4xl font-bold text-[var(--accent)]">310ms</p>
          <p className="text-[var(--text-secondary)] text-sm">TTFT</p>
        </div>
        <div>
          <p className="text-4xl font-bold text-[var(--accent)]">$0.001</p>
          <p className="text-[var(--text-secondary)] text-sm">per Query</p>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <Button size="lg">Start Searching</Button>
        <Button variant="secondary" size="lg">View Architecture</Button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: 创建 FeatureGrid.tsx**

```tsx
import { Card } from '../ui/Card';

const features = [
  {
    icon: '🔍',
    title: 'Hybrid Retrieval',
    description: 'BM25 keyword + Dense semantic dual-channel fusion',
    metric: '96.08% recall',
  },
  {
    icon: '⚡',
    title: 'Streaming Search',
    description: 'Real-time token-level SSE streaming with progressive rendering',
    metric: '310ms TTFT',
  },
  {
    icon: '📚',
    title: 'Citation UX',
    description: 'Inline citation markers with source preview',
    metric: '3 sources avg',
  },
  {
    icon: '📊',
    title: 'Analytics',
    description: 'Latency, token usage, cache performance, query distribution',
    metric: 'Real-time',
  },
  {
    icon: '📄',
    title: 'Document Intelligence',
    description: 'Upload, auto-index, preview, source management',
    metric: 'Multi-format',
  },
  {
    icon: '🚀',
    title: 'Enterprise Deployment',
    description: 'Docker, CI/CD, production-grade infrastructure',
    metric: '24h setup',
  },
];

export function FeatureGrid() {
  return (
    <section className="py-16 px-4">
      <h2 className="text-3xl font-bold text-center mb-12">Core Capabilities</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {features.map((feature) => (
          <Card key={feature.title} hover>
            <div className="text-3xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-[var(--text-secondary)] mb-4">{feature.description}</p>
            <p className="text-sm text-[var(--accent)]">{feature.metric}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: 创建 BenchmarkSection.tsx**

```tsx
import { Card } from '../ui/Card';
import { MetricCard } from '../ui/MetricCard';

export function BenchmarkSection() {
  return (
    <section className="py-16 px-4 bg-[var(--bg-secondary)]">
      <h2 className="text-3xl font-bold text-center mb-4">Performance Benchmark</h2>
      <p className="text-[var(--text-secondary)] text-center mb-12">
        Evaluated on 51 QA pairs with hybrid retrieval pipeline
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <MetricCard
          label="Recall@3"
          value="96.08%"
          change={12}
          changeLabel="vs baseline"
        />
        <MetricCard
          label="Full RAG Latency"
          value="400"
          suffix="ms"
          change={-61}
          changeLabel="optimized"
        />
        <MetricCard
          label="Cost per Query"
          value="$0.001"
          change={-90}
          changeLabel="reduced"
        />
      </div>

      <div className="mt-12 max-w-4xl mx-auto">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Optimization Story</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">TTFT</span>
              <div>
                <span className="text-[var(--error)] line-through mr-2">800ms</span>
                <span className="text-[var(--success)]">310ms</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Cache Hit Rate</span>
              <div>
                <span className="text-[var(--error)] line-through mr-2">0%</span>
                <span className="text-[var(--success)]">92%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Cost/Query</span>
              <div>
                <span className="text-[var(--error)] line-through mr-2">$0.01</span>
                <span className="text-[var(--success)]">$0.001</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/
git commit -m "feat: add Landing page components (Hero, Features, Benchmark)"
```

---

## Task 4: 重构 Landing 页面

**Files:**
- Modify: `src/pages/Landing.tsx`

- [ ] **Step 1: 重写 Landing.tsx**

```tsx
import { HeroSection } from '../components/landing/HeroSection';
import { FeatureGrid } from '../components/landing/FeatureGrid';
import { BenchmarkSection } from '../components/landing/BenchmarkSection';

export function Landing() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <HeroSection />
      <FeatureGrid />
      <BenchmarkSection />

      <footer className="py-8 px-4 text-center text-[var(--text-tertiary)] text-sm">
        <p>Built by Enterprise AI Systems Studio</p>
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: 验证页面可访问**

Run: `npm run dev`
Open: `http://localhost:5173`
Expected: Landing 页面显示，视觉风格符合 Linear 规范

- [ ] **Step 3: Commit**

```bash
git add src/pages/Landing.tsx
git commit -m "feat: refactor Landing page with enterprise design"
```

---

## Task 5: 更新 README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: 重写 README.md**

```markdown
# Aureon — Enterprise AI Knowledge Base Platform

> Production-grade enterprise AI search and knowledge intelligence platform.

[![CI](https://github.com/Yum-wu/Aureon/actions/workflows/ci.yml/badge.svg)](https://github.com/Yum-wu/Aureon/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Performance

| Metric | Value |
|--------|-------|
| Recall@3 (Hybrid) | **96.08%** |
| TTFT (Streaming) | **~310ms** |
| Full RAG Latency | **~400ms** |
| Retrieval Latency | **~10ms** |
| Cost per Query | ****$0.001** |

## Features

- **Enterprise AI Search** — Streaming answers with progressive citations
- **Hybrid Retrieval** — BM25 keyword + Dense semantic dual-channel fusion
- **Document Management** — Upload, auto-index, preview, source management
- **System Dashboard** — Real-time metrics, health monitoring, usage analytics
- **Analytics** — Latency, token usage, cache performance, query distribution
- **Architecture & Performance** — Interactive architecture diagram, optimization metrics

## Architecture

```
User → Web UI (React + Vite) → FastAPI → LangGraph Orchestrator
                                           ├── Intent Classifier
                                           ├── Hybrid Search (BM25 + BGE/Chroma)
                                           ├── LLM (GLM-4-Flash / GPT-4o-mini)
                                           ├── Cache (Redis + In-Memory)
                                           └── SSE Streaming Response
```

## Quick Start

```bash
# Frontend
cd Aureon && npm install && npm run dev

# Backend
cd Aureon/backend && pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Docker (recommended)
docker-compose up
```

## Screenshots

| Landing | Search | Dashboard |
|---------|--------|-----------|
| ![Landing](screenshots/landing.png) | ![Search](screenshots/search.png) | ![Dashboard](screenshots/dashboard.png) |

## Documentation

- [Architecture](docs/architecture/)
- [Benchmarks](docs/benchmarks/)
- [Deployment](docs/deployment/)
- [Product](docs/product/)

## License

MIT

---

Built by [Yum-wu](https://github.com/Yum-wu)
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: rewrite README with enterprise product positioning"
```

---

## Week 1 完成检查

- [ ] 设计系统 tokens 创建
- [ ] 基础 UI 组件可用
- [ ] Landing 页面视觉达标
- [ ] README 企业产品风格
- [ ] 所有 commit 完成

Run: `npm run dev` 并访问 `http://localhost:5173` 验证
