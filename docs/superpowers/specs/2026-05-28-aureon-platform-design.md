# Aureon Platform — Enterprise AI Knowledge Base 产品升级设计文档

**日期**：2026-05-28
**版本**：v1
**状态**：已确认，待实施

---

## 决策摘要

| 决策 | 选择 | 理由 |
|------|------|------|
| 分阶段策略 | 3 页面深做 | Dashboard + Search 升级 + Landing，每个 production 级别 |
| 品牌改名 | 全量改名 Aureon | Chatbot/ → Aureon/，路由、i18n、README、CI 全部更新 |
| 数据策略 | 前后端并行，真实数据 | 新增 3 个轻量后端 API（Redis 存储），Dashboard 用真实系统数据 |
| 实施方式 | 方案 C：交替迭代 | Step1 Landing+改名 → Step2 Dashboard+API → Step3 Search 升级 |

---

## 1. 路由 & 导航架构

从 4 页面 tab 风格 → 6 页面 enterprise topbar 风格：

```
Aureon Platform 路由体系
├── /                    → Landing Page（NEW — Enterprise SaaS Hero）
├── /dashboard           → Enterprise Dashboard（NEW）
├── /search              → AI Search（Chat + RAG 合并升级）
├── /crew                → AI Content Studio（保留现有）
├── /documents           → Documents（占位页）
├── /benchmark           → Architecture & Performance（独立页）
```

**导航栏**：topbar enterprise 风格，左侧 Logo + 主导航（Dashboard/Search/Documents），右侧 Live Metrics Badges + 语言切换。

**文件名**：`src/pages/Landing.tsx`、`src/pages/Dashboard.tsx`、`src/pages/Search.tsx`

---

## 2. Landing Page（/）

**目的**：Enterprise AI SaaS Landing Page，不是 demo 首页

**布局**（单页滚动 4 section）：
1. **Hero**：标题 "Enterprise AI Knowledge Base Platform" + 副标题 + 可用的搜索框（输入即跳 `/search?q=xxx`） + 双 CTA
2. **Metrics**：3 张大卡片（96.08% Recall@3 · ~310ms TTFT · ~$0.001/query）
3. **Features**：4 张卡片（Hybrid Search、Streaming SSE、Multilingual、Enterprise Deploy）
4. **Technical Credibility**：Benchmark 缩略数据 + 跳 `/benchmark` 链接

**数据来源**：现有 `useBenchmark()` hook，数据来自 `GET /api/rag/benchmark`（真实数据）

**设计要点**：
- 白色底 + 蓝色渐变 hero（沿用现有 CSS 变量）
- 去掉现有 DemoIntro 的 emoji 风格，换成 Heroicons/simple-icons
- 搜索框真实可用

---

## 3. Enterprise Dashboard（/dashboard）

**目的**：企业系统运行总览，所有数据真实

**布局**（3 行面板）：

### Row 1 — 三大指标卡片
| 指标 | 值 | 来源 |
|------|-----|------|
| Retrieval Latency | ~10ms | `GET /api/rag/benchmark` |
| TTFT (Streaming) | ~310ms | `GET /api/rag/benchmark` |
| Cache Hit Rate | 78% | `GET /api/rag/stats`（新增） |

### Row 2 — 双面板
- **System Health**（5 灯）：LLM / VectorDB / Embedding / Cache / Tracing，数据来自 `GET /api/rag/health`
- **Recent Queries**（5 条）：查询内容 + 来源数 + 延迟，数据来自 `GET /api/rag/queries/recent`（新增）

### Row 3 — 查询量摘要
- Query Volume 24h 柱状图 + Indexed Documents / Total Chunks / Avg Latency

**技术实现**：
- 新建 `src/pages/Dashboard.tsx`
- 新建 `src/hooks/useDashboardStats.ts`
- 4 个独立卡片组件 + 2 个面板组件

---

## 4. AI Search（/search）

**目的**：Chat + RAG 合并为 Enterprise AI Search Experience

**与当前差异**：

| 维度 | 当前 | 升级后 |
|------|------|--------|
| 搜索入口 | bottom input bar | 居中搜索框（Glean/Perplexity 风格） |
| 结果布局 | 消息列表 + 来源折叠底部 | 答案 + 引用双栏，来源高亮展开 |
| 引用 | 卡片式来源列表 | [1] [2] 角标 + 点击展开 chunk 原文 |
| 流式 | 逐 token 追加 | 逐 token + 渐进式引用 |
| 历史 | 无 | 侧边栏 localStorage 搜索历史 |
| 上传 | RagQuery 页 toggle | 搜索框附近附件按钮 |

**组件树**：
```
src/pages/Search.tsx
├── SearchInput          → 居中搜索框 + Suggested Prompts
├── StreamingAnswer      → token-by-token 渲染 + 角标注入
├── CitationPanel        → 展开/折叠引用 + chunk 高亮
├── SearchHistory        → 侧边栏（localStorage）
├── UploadButton         → 搜索框旁附件按钮
└── useSearch() hook     → 合并 Chat SSE + RAG SSE
```

**SSE 渐进式引用**：后端在 SSE 流中插入 `type: "citation"` 事件，前端收到后注入角标 [1] 并预加载 source preview 数据。

---

## 5. 后端新增 API

### 5.1 系统统计
```
GET /api/rag/stats
→ { cache_hit_rate, query_count_24h, avg_retrieval_latency_ms, total_indexed_docs, total_chunks }
```

### 5.2 最近查询
```
GET /api/rag/queries/recent?limit=5
→ { queries: [{ query, sources_count, latency_ms, timestamp }] }
```

### 5.3 SSE 增强（已有端点升级）
```
POST /api/rag/query/stream
→ 新增 event type: "citation" → { type: "citation", index: N, source: {...} }
```

**数据存储**：全部 Redis（项目已有），`query_count_24h` 用 Redis counter + TTL，`recent queries` 用 Redis list，`cache hits/misses` 用现有缓存层计数器。

**新增文件**：`backend/app/api/rag_stats.py`（约 50 行）

---

## 6. 项目改名范围

### 6.1 目录改名
```
Chatbot/ → Aureon/
```

### 6.2 前端文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/pages/Landing.tsx` | **新建** | Hero + Metrics + Features + Credibility |
| `src/pages/Dashboard.tsx` | **新建** | System Metrics + Health + Recent Queries |
| `src/pages/Search.tsx` | **新建** | Chat+RAG 合并，居中搜索框 |
| `src/hooks/useDashboardStats.ts` | **新建** | 调用 /stats + /queries/recent |
| `src/App.tsx` | **重构** | 6 页路由 + enterprise topbar nav |
| `src/i18n/zh.json` | **重写** | 所有文案从 "AI Demo" → "Aureon Platform" |
| `src/i18n/en.json` | **重写** | 同上 |
| `src/components/DemoIntro.tsx` | **删除** | 被 Landing 替代 |
| `src/components/ChatWindow.tsx` | **保留** | 被 Search 替代，保留作为回退 |
| `src/components/RagQuery.tsx` | **保留** | 被 Search 替代，保留作为回退 |
| `src/components/SystemStatus.tsx` | **保留** | 用于 /benchmark 页 |
| `src/services/api.ts` | **扩展** | 增加 stats + SSE citation 处理 |
| `src/index.css` | **扩展** | Dashboard/Search 新增样式 |
| `package.json` | **修改** | name → "aureon-platform" |

### 6.3 后端文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `backend/app/api/rag_stats.py` | **新建** | stats + recent queries API |
| `backend/app/api/models.py` | **修改** | 增加 response models |
| `backend/app/main.py` | **修改** | 注册新路由 |
| `PRD.md` | **修改** | 更新标题/定位 |
| `TECH_DESIGN.md` | **修改** | 更新 |
| `README.md` | **重写** | Enterprise AI Knowledge Base Platform |

### 6.4 不需要变的

- `backend/app/rag/` — RAG 核心管道
- `backend/app/cache/` — 缓存层
- `backend/app/langgraph/` — 编排层
- `backend/app/agent/` — Agent
- Docker Compose / CI（仅路径微调）

---

## 7. 实施顺序（方案 C）

### Step 1：Landing Page + 项目改名（预计 2-3 小时）
1. 目录 `Chatbot/` → `Aureon/` 重命名
2. `package.json` name 更新
3. `App.tsx` 路由重构（6 页面 shell）
4. 导航栏从 tab 风格 → enterprise topbar
5. `src/pages/Landing.tsx` 新建
6. `src/i18n/zh.json` + `en.json` 全量重写
7. README.md 重写

### Step 2：Dashboard + 后端 API（预计 2-3 小时）
1. `backend/app/api/rag_stats.py` 新建
2. `backend/app/main.py` 注册路由
3. `src/hooks/useDashboardStats.ts` 新建
4. `src/pages/Dashboard.tsx` 新建
5. 验证：Dashboard 显示真实系统数据

### Step 3：AI Search 升级（预计 3-4 小时）
1. `src/pages/Search.tsx` 新建（合并 Chat + RAG）
2. SSE 后端增加 citation 事件
3. CitationPanel + SearchHistory 组件
4. 验证：流式搜索 + 渐进式引用 + 搜索历史

### Step 4：收尾（预计 1 小时）
1. `/documents` 占位页
2. `/benchmark` 从 SystemStatus 组件升级为独立页
3. PRD.md / TECH_DESIGN.md 更新
4. Git commit + push

---

## 8. 不变的设计约束

- **零新依赖**：React + Vite + Tailwind + FastAPI + Redis + Chroma，不加新库
- **沿用现有设计语言**：CSS 变量、Tailwind 类、色彩系统不变
- **保留旧页面**：ChatWindow.tsx、RagQuery.tsx 保留文件不删，/crew 路由不变
- **后端核心不动**：RAG 管道、缓存、LangGraph、Agent 零改动
- **数据真实**：Dashboard 所有数字来自后端 API，不硬编码任何 metrics

---

## 附录：业界参考来源

- Glean Enterprise AI Search：Customizable dashboard, Agent discovery, Enterprise Graph（2025 年产品迭代）
- Notion 3.0：Agent-native workspace, Enterprise Search with citations, AI connectors
- Perplexity Enterprise：Citation-forward streaming answers
- Enterprise SaaS Landing Page 设计模式：Bento grid, dark/gradient bg, live data viz, generous whitespace
- 开源参考：Tencent WeKnora、KnowledgeOps AI（Prometheus+Grafana observability）
