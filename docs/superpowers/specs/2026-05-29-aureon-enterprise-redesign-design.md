# Aureon Enterprise Redesign 设计文档

> 日期：2026-05-29
> 状态：已批准
> 作者：Claude Code

---

## 1. 核心目标

### 1.1 项目定位

**名称**：Aureon  
**副标题**：Enterprise AI Knowledge Base Platform  
**定位**：Production-grade enterprise AI search and knowledge intelligence platform

### 1.2 目标

- ✅ 把项目包装成 Enterprise SaaS Product
- ✅ 让 GitHub 仓库本身成为作品集
- ✅ 让客户 30 秒内感受到："这是 production AI system，不是 AI toy"
- ✅ 强化：Enterprise UX、Production Engineering、Architecture Credibility、Benchmark Credibility、Deployment Readiness

### 1.3 项目核心指标

| Metric | Value |
|--------|-------|
| Recall@3 | 96.08% |
| TTFT | ~310ms |
| Retrieval Latency | ~10ms |
| Full RAG Latency | ~400ms |
| Cost/Query | ~$0.001 |

### 1.4 产品原则

**视觉参考**：Glean、Notion AI、Linear、Vercel、Perplexity Enterprise、Stripe Dashboard、Retool、Superhuman

**关键词**：clean、enterprise、minimal、data-driven、systems-oriented、production-grade

---

## 2. 仓库结构（重构后）

```
Aureon/
├── README.md                    # 企业产品首页风格
├── CLAUDE.md                    # 开发指南
├── package.json
├── docker-compose.yml           # 一键启动
├── Dockerfile                   # 前端
├── .github/workflows/           # CI/CD
│
├── docs/                        # 技术白皮书
│   ├── architecture/
│   │   ├── system-overview.md
│   │   ├── retrieval-pipeline.md
│   │   └── streaming-architecture.md
│   ├── benchmarks/
│   │   ├── recall-evaluation.md
│   │   ├── latency-analysis.md
│   │   └── cost-optimization.md
│   ├── deployment/
│   │   ├── docker-setup.md
│   │   └── production-checklist.md
│   └── product/
│       ├── features.md
│       └── roadmap.md
│
├── screenshots/                 # SaaS marketing assets
│   ├── landing.png
│   ├── search.png
│   ├── dashboard.png
│   ├── analytics.png
│   ├── architecture.png
│   └── citations.png
│
├── src/                         # 前端源码（重构后）
│   ├── pages/
│   │   ├── Landing.tsx          # 产品首页
│   │   ├── Search.tsx           # Enterprise Search
│   │   ├── Dashboard.tsx        # System Dashboard
│   │   ├── Analytics.tsx        # 使用分析
│   │   ├── Architecture.tsx     # 架构可视化（新）
│   │   ├── Documents.tsx        # 文档管理
│   │   ├── Admin.tsx            # 企业管理
│   │   └── Login.tsx            # SSO 登录
│   ├── components/
│   │   ├── layout/              # 布局组件
│   │   ├── search/              # 搜索相关
│   │   ├── dashboard/           # 仪表盘组件
│   │   ├── metrics/             # 指标展示
│   │   └── ui/                  # 基础 UI 组件
│   ├── hooks/
│   ├── services/
│   ├── types/
│   └── styles/                  # 全局样式
│
├── backend/                     # 后端源码
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── app/
│   │   ├── api/
│   │   ├── rag/
│   │   ├── langgraph/
│   │   └── ...
│   └── tests/
│
└── infra/                       # 基础设施配置
    ├── docker/
    ├── nginx/
    └── monitoring/
```

---

## 3. 页面设计

### 3.1 Landing Page（/）

**目标**：30 秒内传达 "production AI system"

**结构**：
- Hero Section：大标题 + 指标徽章 + CTA
- Features Section：6 个核心能力展示
- Benchmark Section：性能数据卡片
- Footer

**指标展示**：
- 96.08% Recall@3
- 310ms TTFT
- $0.001/query

### 3.2 Search（/search）

**目标**：Enterprise Search Experience，不是 chatbot

**结构**：
- 居中搜索输入框
- 流式回答区域
- Citation 列表（右侧）
- 查询历史（侧边）

**关键功能**：
- SSE 流式渲染
- Progressive citation markers [1] [2] [3]
- 来源预览

### 3.3 Dashboard（/dashboard）

**目标**：System Dashboard，不是 admin panel

**结构**：
- Metric Grid（Queries、Latency、Cache）
- Query Volume Chart（7 days）
- Recent Queries Table
- System Health 状态

**数据源**：
- `/api/rag/analytics/*` 系列端点

### 3.4 Architecture（/architecture）**新页面**

**目标**：交互式架构可视化 + 性能指标

**结构**：
- Runtime Metrics 大号卡片
- 架构流程图（User Query → Hybrid Retrieval → MMR → Prompt Assembly → Streaming → Citations）
- Optimization Story（before → after）

**技术选型**：
- 使用 SVG/CSS 绘制流程图（轻量级，无额外依赖）

### 3.5 Analytics（/analytics）

保留现有，优化视觉风格

### 3.6 Documents（/documents）

保留现有，优化视觉风格

### 3.7 Admin（/admin）

保留现有，优化视觉风格

---

## 4. 组件架构

### 4.1 组件目录结构

```
src/components/
├── layout/                    # 布局层
│   ├── AppShell.tsx           # 主布局框架
│   ├── Sidebar.tsx            # 侧边导航
│   ├── Header.tsx             # 顶部栏
│   └── PageContainer.tsx      # 页面容器
│
├── search/                    # 搜索模块
│   ├── SearchBar.tsx          # 搜索输入框
│   ├── SearchResults.tsx      # 结果容器
│   ├── StreamingAnswer.tsx    # 流式回答
│   ├── CitationList.tsx       # 引用列表
│   ├── CitationMarker.tsx     # 引用标记 [1]
│   ├── SourceCard.tsx         # 来源卡片
│   └── QueryHistory.tsx       # 查询历史
│
├── dashboard/                 # 仪表盘模块
│   ├── MetricCard.tsx         # 指标卡片
│   ├── MetricGrid.tsx         # 指标网格
│   ├── QueryVolumeChart.tsx   # 查询量图表
│   ├── LatencyChart.tsx       # 延迟图表
│   ├── RecentQueries.tsx      # 最近查询
│   └── SystemHealth.tsx       # 系统健康
│
├── architecture/              # 架构模块（新）
│   ├── ArchitectureFlow.tsx   # 架构流程图
│   ├── PipelineNode.tsx       # 管道节点
│   ├── MetricShowcase.tsx     # 指标展示
│   └── OptimizationStory.tsx  # 优化故事
│
├── metrics/                   # 通用指标组件
│   ├── LargeMetric.tsx        # 大号指标
│   ├── MetricBadge.tsx        # 指标徽章
│   └── ComparisonMetric.tsx   # 对比指标
│
├── landing/                   # Landing 专用
│   ├── HeroSection.tsx
│   ├── FeatureGrid.tsx
│   ├── BenchmarkSection.tsx
│   └── CTASection.tsx
│
└── ui/                        # 基础 UI
    ├── Button.tsx
    ├── Card.tsx
    ├── Input.tsx
    ├── Badge.tsx
    ├── Skeleton.tsx
    └── Tooltip.tsx
```

### 4.2 组件设计原则

| 原则 | 说明 |
|------|------|
| 单一职责 | 每个组件只做一件事 |
| 可组合 | 小组件组合成大功能 |
| 可测试 | 纯 UI 组件易测试 |
| 类型安全 | TypeScript 严格模式 |

---

## 5. 视觉规范（Linear 风格）

### 5.1 色彩系统

```css
/* 主色板 - 极简深色 */
--bg-primary: #0A0A0B;        /* 主背景 */
--bg-secondary: #111113;      /* 卡片背景 */
--bg-tertiary: #18181B;       /* 悬浮/激活 */

--text-primary: #FAFAFA;      /* 主文字 */
--text-secondary: #A1A1AA;    /* 次要文字 */
--text-tertiary: #71717A;     /* 辅助文字 */

--border: #27272A;            /* 边框 */
--border-hover: #3F3F46;      /* 悬浮边框 */

/* Accent - 微妙强调 */
--accent: #3B82F6;            /* 蓝色强调 */
--accent-soft: rgba(59, 130, 246, 0.1);

/* 状态色 */
--success: #22C55E;
--warning: #EAB308;
--error: #EF4444;

/* 指标色 */
--metric-positive: #22C55E;   /* 上升/好 */
--metric-negative: #EF4444;   /* 下降/坏 */
--metric-neutral: #A1A1AA;    /* 中性 */
```

### 5.2 字体系统

```css
/* 字体栈 */
--font-sans: 'Inter', -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* 字号 */
--text-xs: 0.75rem;           /* 12px - 辅助 */
--text-sm: 0.875rem;          /* 14px - 次要 */
--text-base: 1rem;            /* 16px - 正文 */
--text-lg: 1.125rem;          /* 18px - 小标题 */
--text-xl: 1.25rem;           /* 20px - 标题 */
--text-2xl: 1.5rem;           /* 24px - 页面标题 */
--text-3xl: 1.875rem;         /* 30px - Hero */
--text-4xl: 2.25rem;          /* 36px - Landing Hero */

/* 大号指标 */
--text-metric: 3rem;          /* 48px - 指标数字 */
--text-metric-large: 4rem;    /* 64px - Landing 指标 */
```

### 5.3 间距系统

```css
--space-1: 0.25rem;           /* 4px */
--space-2: 0.5rem;            /* 8px */
--space-3: 0.75rem;           /* 12px */
--space-4: 1rem;              /* 16px */
--space-5: 1.25rem;           /* 20px */
--space-6: 1.5rem;            /* 24px */
--space-8: 2rem;              /* 32px */
--space-10: 2.5rem;           /* 40px */
--space-12: 3rem;             /* 48px */
--space-16: 4rem;             /* 64px */
```

### 5.4 圆角

```css
--radius-sm: 0.375rem;        /* 6px - 小组件 */
--radius-md: 0.5rem;          /* 8px - 卡片 */
--radius-lg: 0.75rem;         /* 12px - 大卡片 */
--radius-full: 9999px;        /* 圆形 */
```

### 5.5 阴影

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
```

### 5.6 避免的视觉元素

| 避免 | 替代 |
|------|------|
| 渐变背景 | 纯色背景 |
| 发光效果 | 微妙边框 |
| 动画过多 | 只在关键交互加动画 |
| 卡片阴影过重 | 轻阴影或无阴影 |
| 花哨图标 | 简洁线条图标 |

---

## 6. 实施计划（7 周）

### Week 1：基础重构 + Landing Page

**任务**：
- 建立设计系统（colors, typography, spacing）
- 创建基础 UI 组件（Button, Card, Input）
- 重构 Landing Page
- 更新 README（企业产品风格）

**验收**：Landing 页面可访问，视觉风格符合 Linear 规范

### Week 2：Search 页面重构

**任务**：
- 重构 SearchBar 组件
- 实现 StreamingAnswer 组件
- 实现 CitationList + CitationMarker
- 重构 Search 页面布局
- 优化 SSE streaming 逻辑

**验收**：搜索体验流畅，引用标记正常工作

### Week 3：Dashboard + Analytics

**任务**：
- 创建 MetricCard 组件
- 创建 MetricGrid 布局
- 实现 QueryVolumeChart（Recharts）
- 实现 RecentQueries 表格
- 重构 Dashboard 页面
- 优化 Analytics 页面

**验收**：Dashboard 展示真实指标，图表可交互

### Week 4：Architecture 页面（新）

**任务**：
- 设计架构流程数据结构
- 实现 ArchitectureFlow 组件
- 实现 PipelineNode 组件
- 实现 OptimizationStory 组件
- 创建 Architecture 页面

**验收**：架构图可交互，优化故事清晰展示

### Week 5：后端 Docker + CI/CD

**任务**：
- 创建后端 Dockerfile
- 创建 docker-compose.yml
- 配置 GitHub Actions CI/CD
- 添加健康检查端点
- 优化后端启动流程

**验收**：`docker-compose up` 一键启动，CI 自动测试

### Week 6：文档体系

**任务**：
- 编写 architecture 文档
- 编写 benchmarks 文档
- 编写 deployment 文档
- 编写 product 文档
- 截取 UI 截图

**验收**：文档完整，截图质量达标

### Week 7：独立仓库 + 收尾

**任务**：
- 创建新 GitHub 仓库
- 迁移代码到新仓库
- 配置 GitHub Pages（可选）
- 品牌统一检查
- 最终测试

**验收**：新仓库可访问，所有功能正常

---

## 7. 关键里程碑

| 里程碑 | 时间 | 验收标准 |
|--------|------|----------|
| M1: Landing + 设计系统 | Week 1 | 视觉风格达标 |
| M2: Search 体验 | Week 2 | 搜索流畅 |
| M3: Dashboard | Week 3 | 指标真实 |
| M4: Architecture | Week 4 | 架构可视化 |
| M5: 部署就绪 | Week 5 | Docker 可跑 |
| M6: 文档完整 | Week 6 | 技术白皮书 |
| M7: 独立仓库 | Week 7 | GitHub 可访问 |

---

## 8. 技术栈

### 前端
- React 18+
- TypeScript
- Vite
- Tailwind CSS
- Recharts（图表）
- React Router

### 后端
- Python 3.11+
- FastAPI
- LangGraph
- ChromaDB
- Redis

### 部署
- Docker
- Docker Compose
- GitHub Actions（CI/CD）

---

## 9. 品牌统一

### 9.1 允许使用的词汇

- platform
- enterprise
- knowledge intelligence
- enterprise search
- production AI system
- document intelligence

### 9.2 禁止出现的词汇

- chatbot
- ai assistant
- toy
- playground
- demo app

---

## 10. 文档体系

```
docs/
├── architecture/
│   ├── system-overview.md       # 系统架构概览
│   ├── retrieval-pipeline.md    # 检索管道详解
│   └── streaming-architecture.md # 流式架构
├── benchmarks/
│   ├── recall-evaluation.md     # Recall@3 评估
│   ├── latency-analysis.md      # 延迟分析
│   └── cost-optimization.md     # 成本优化
├── deployment/
│   ├── docker-setup.md          # Docker 部署
│   └── production-checklist.md  # 生产检查清单
└── product/
    ├── features.md              # 功能列表
    └── roadmap.md               # 产品路线图
```

---

## 附录

### A. 技术决策记录

1. **架构图使用 SVG/CSS 而非 React Flow**
   - 理由：轻量级，无额外依赖，易于维护
   - 权衡：交互性略弱，但对作品集足够

2. **深色主题为主**
   - 理由：符合 AI/ML 产品调性，Linear 风格
   - 权衡：需要确保对比度足够

3. **7 周完整版**
   - 理由：求职作品集需要完整内容
   - 权衡：时间较长，但产出质量高

### B. 参考资源

- Linear 设计系统：https://linear.app
- Vercel Dashboard：https://vercel.com/dashboard
- Stripe Dashboard：https://dashboard.stripe.com
