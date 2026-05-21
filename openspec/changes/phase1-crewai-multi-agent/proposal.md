# 方案： CrewAI 多 Agent 文章生成系统

**变更 ID:** `phase1-crewai-multi-agent`
**创建日期:** 2026-05-21
**状态:** Draft

---

## 问题分析

当前 Chatbot 架构涵盖单 Agent（P0）、LangGraph 工作流（P2）、RAG（P1），但缺少**多 Agent 角色协作**实战：

- 单 Agent 和 LangGraph 都是同一模型的多节点路由，没有角色分工体验
- 面试高频考点：CrewAI 角色定义、任务编排、工具共享 — 但项目中无落地
- 需要可演示的多人协作 demo，覆盖 Agent 间通信与质量管控

## 解决方案

用 **CrewAI** 实现三 Agent 协作文章生成系统，FastAPI 封装 HTTP API，SSE 流式展示协作过程。

```
用户输入主题
  ↓
[研究员 Agent] ──联网搜索 + 整理要点──→ 研究报告
  ↓
[写手 Agent] ──依据大纲生成文章──────→ 初稿
  ↓
[编辑 Agent] ──事实核查 + 质量评分────→ 终稿 + 评分报告
  ↓
最终输出（文章 + 协作日志 + 质量评分）
```

## 范围

### 包含

- CrewAI 角色定义（Researcher / Writer / Editor），含角色提示词 + 回传格式
- Sequential Process 顺序编排：研究员→写手→编辑
- 共享工具注册：web search（研究员）、quality scorer（编辑）
- FastAPI 端点 `POST /api/crew/generate`（同步）和 `POST /api/crew/generate/stream`（SSE）
- SSE 事件格式：`agent_start` / `agent_complete` / `tool_call` / `error` / `done`
- React 前端页面（`/crew-generator`）：主题输入 + 协作日志 + Markdown 文章展示
- Docker Compose 集成（复用 Chatbot 容器化方案）

### 不包含

- Hierarchical Process（先用 Sequential MVP）
- 文章持久化存档（后续独立提案）
- 用户认证 / 多用户
- Agent 间并行执行

## 影响分析

| 组件 | 变更 | 说明 |
|------|-----------------|---------|
| Chatbot Backend | Yes | 新增 `app/crew/` 模块 + CrewAI 依赖 |
| API Surface | Yes | `POST /api/crew/generate` 同步 + SSE 端点 |
| Frontend | Yes | 新页面 `/crew-generator` + CrewLog 组件 |
| Docker Compose | Yes | 需验证 CrewAI 兼容现有编排或新增 service |
| Dependencies | Yes | `crewai>=0.30,<0.40` 加入 requirements.txt |
| Logging | Yes | 每个 Agent 执行日志 + tool call 记录 |

## 依赖与复用

### 依赖

- Chatbot FastAPI 后端基础设施（config、LLM 工厂）
- Chatbot 前端路由框架（React Router）
- Chatbot Docker Compose 编排方案

### 复用

- 现有 LLM 配置（复用 `LLM_MODEL` / `LLM_BASE_URL` / `LLM_API_KEY`）
- 现有 SSE 流式模式（agent_start/agent_complete 类似 tool_start/tool_end）
- 现有前端 UI 组件、Tailwind 主题

### 后续能力

- CrewAI 实战面试 Demo
- 多 Agent 协作质量管控模式
- 后续可扩展为更多 Agent 角色

## 非功能约束

- Logging: 每个 Agent 执行开始/完成必须记录时间戳 + duration_ms
- Error handling: 单 Agent 失败不阻塞整条链（编辑失败时仍可输出写手初稿 + 错误标记）
- Timeout/retry: 单个 Agent 超时 30s，无自动重试
- Config/env: CrewAI 使用复用 Chatbot 的 LLM 配置（不额外新增独立配置）
- Security/secrets: 无额外密钥需求，复用现有 .env

## 架构设计

- 角色定义：CrewAI `Agent` 类，每个角色独立配置 goal + backstory + tools
- 任务定义：CrewAI `Task` 类，`expected_output` 定义回传格式
- 流程：`Process.sequential`，context 自动传递
- SSE 输出：CrewAI 无原生 streaming，通过 `step_callback` 拦截每个 Agent 完成事件
- 前端复用：现有 ChatWindow 风格，新增 CrewLog 组件展示协作过程

## 成功标准

- [ ] 输入主题后三 Agent 顺序协作生成完整文章（可读性 ≥ 及格线）
- [ ] SSE 实时展示每个 Agent 工作状态 + 中间输出
- [ ] 最终输出包含：文章正文 + Agent 协作日志 + 质量评分
- [ ] 编辑 Agent 在事实错误或逻辑矛盾时给出修正建议
- [ ] Docker Compose 一键启动正常
- [ ] 端到端耗时 < 60s（正常网络）

## 风险与应对

| 风险 | 概率 | 影响 | 应对 |
|------|-------------|--------|------------|
| CrewAI API 版本变动频繁 | Med | High | 锁定 `crewai>=0.30,<0.40`，参考官方 examples |
| 多 Agent = 多次 LLM 调用，延迟高 | Med | Medium | SSE 流式输出 + 逐 Agent 状态更新让用户感知进度 |
| Web search 不可用（网络/API） | Low | Medium | Agent goal 中注明"搜索失败则用自身知识"降级 |
| CrewAI 无原生 SSE 支持 | High | Medium | 用 `step_callback` 拦截事件 + 自定义 Generator |
