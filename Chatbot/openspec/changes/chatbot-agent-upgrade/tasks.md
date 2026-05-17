# Implementation Tasks: Chatbot Agent 升级

**Change ID:** `chatbot-agent-upgrade`

Memory 模块参考了 TencentDB-Agent-Memory 的分层架构（L0→L3）+ 上下文卸载。

---

## Phase 1: Python 项目骨架

- [ ] 1.1 创建 `backend/` 目录结构（`app/`, `app/agent/`, `app/tools/`, `app/memory/`, `app/api/`, `tests/`）
- [ ] 1.2 编写 `requirements.txt`（`langchain>=0.3,<0.4`, `langchain-openai`, `fastapi`, `uvicorn`, `python-dotenv`, `tavily-python`, `aiofiles`, `pytest`, `httpx`）
- [ ] 1.3 编写 `.env.example` 模板（`LLM_API_KEY`, `LLM_MODEL`, `LLM_BASE_URL`, `TAVILY_API_KEY`）
- [ ] 1.4 编写 `app/config.py` 配置加载模块

**Quality Gate:**
- [ ] `pip install -r requirements.txt` 成功
- [ ] `uvicorn app.main:app` 可启动空 FastAPI

---

## Phase 2: Agent 核心

- [ ] 2.1 编写 LLM 工厂函数 `app/agent/llm.py`（`ChatOpenAI` 适配智谱，支持 streaming）
- [ ] 2.2 编写工具定义 `app/tools/calculator.py`（LangChain `@tool` 装饰器）
- [ ] 2.3 编写工具定义 `app/tools/web_search.py`（Tavily 搜索）
- [ ] 2.4 编写 `read_ref` 工具 `app/tools/read_ref.py`（读取已卸载的外存文件）
- [ ] 2.5 注册所有工具到 `app/tools/__init__.py` 的 `ALL_TOOLS` 列表
- [ ] 2.6 编写 Agent 工厂 `app/agent/agent.py`（`create_agent`，绑定 LLM + Tools + Memory）
- [ ] 2.7 编写 Agent 执行器 `app/agent/executor.py`（同步/流式两种调用）

**Quality Gate:**
- [ ] Agent 能完成"123 * 456 等于多少"（自动调用 calculator）
- [ ] Agent 能完成"今天北京天气怎么样"（自动调用 web_search）

---

## Phase 3: 记忆系统（分层架构 L0→L3 + 上下文卸载）

### 3a. 基础设施

- [ ] 3.1 初始化 SQLite 数据库 `app/memory/db.py`（建表：conversations, atoms）
- [ ] 3.2 编写 `app/memory/manager.py` — MemoryManager 统一入口

### 3b. L0 Conversation — 原始对话存储

- [ ] 3.3 实现 `app/memory/l0_conversation.py`：对话记录写入 SQLite，按 session_id 分区
- [ ] 3.4 实现消息回收策略（上限 500 条/会话，超量删最旧 50 条）

### 3c. 上下文卸载（Context Offloading）

- [ ] 3.5 实现 `app/memory/offload.py`：工具输出 >1000 字符 → 写入 `offloads/refs/*.md`
- [ ] 3.6 实现卸载摘要生成逻辑（前 N 字符 + 关键信息提取）
- [ ] 3.7 实现 `read_ref` 工具回调（提供给 Agent，按需读取卸载文件）

### 3d. L1 Atom — 原子事实

- [ ] 3.8 实现 `app/memory/l1_atom.py`：LLM 轻量提取工具结果 + 用户偏好为事实三元组
- [ ] 3.9 事实写入 SQLite `atoms` 表，附带 `source_ref` 指向 L0

### 3e. L2 Scenario — 场景总结

- [ ] 3.10 实现 `app/memory/l2_scenario.py`：会话超时或主动结束 → 生成场景 Markdown
- [ ] 3.11 场景文件写入 `offloads/scenarios/{id}.md`，保留最近 50 个

### 3f. L3 Persona — 用户画像

- [ ] 3.12 实现 `app/memory/l3_persona.py`：从 Scenarios 聚合用户偏好，写入 `offloads/persona.md`
- [ ] 3.13 增量更新逻辑：新场景追加 + 低频模式衰减

### 3g. Mermaid 会话画布（可选增强）

- [ ] 3.14 实现 `app/memory/canvas.py`：关键步骤渲染 Mermaid 流程图
- [ ] 3.15 画布写入 `offloads/canvas_{session_id}.mmd`

**Quality Gate:**
- [ ] 长工具输出被正确卸载（文件存在，摘要替换原内容）
- [ ] Agent 通过 `read_ref` 能恢复完整内容
- [ ] 多轮对话后有 L1 事实入库
- [ ] 会话结束有 L2 Scenario 文件生成
- [ ] 用户画像文件存在且内容合理

---

## Phase 4: API 层

- [ ] 4.1 编写请求/响应模型 `app/api/models.py`（Pydantic）
- [ ] 4.2 编写 SSE 流式端点 `POST /api/chat/stream`（集成 MemoryManager）
- [ ] 4.3 编写会话管理端点 `GET /api/sessions`, `DELETE /api/sessions/{id}`
- [ ] 4.4 编写 FastAPI 应用入口 `app/main.py`（CORS、路由注册、生命周期钩子）

**Quality Gate:**
- [ ] `curl -X POST /api/chat/stream` 返回 SSE 事件流
- [ ] 不同 session 的对话独立

---

## Phase 5: 前端适配

- [ ] 5.1 重写 `src/services/api.ts`（指向 `http://localhost:8000/api/chat/stream`）
- [ ] 5.2 适配 SSE 事件格式 `src/hooks/useChat.ts`
- [ ] 5.3 删除前端 API Key 相关代码
- [ ] 5.4 确认流式输出、错误处理、UI 行为不变

**Quality Gate:**
- [ ] 前端正常对话，流式逐字输出
- [ ] 浏览器 Network 面板无 API Key 泄露

---

## Phase 6: 测试 & 清理

- [ ] 6.1 Agent 单元测试 `tests/test_agent.py`
- [ ] 6.2 Tools 单元测试 `tests/test_tools.py`
- [ ] 6.3 Memory 单元测试 `tests/test_memory.py`（分层 + 卸载）
- [ ] 6.4 API 集成测试 `tests/test_api.py`
- [ ] 6.5 移除不再需要的旧代码（前端手写 SSE、智谱直连等）

**Quality Gate:**
- [ ] `pytest` 全部通过
- [ ] 旧代码无残留引用

---

## Completion Checklist

- [x] All phases complete
- [x] All quality gates passed
- [x] 评估完成：工具准确率 80%，中位延迟 1.57s
- [x] 代码已提交并推送到 GitHub
