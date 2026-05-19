# Implementation Tasks: RAG 知识库问答系统

**Change ID:** `rag-demo`

---

## Phase 1: 环境与依赖

- [x] 1.1 更新 requirements.txt 添加 RAG 依赖 ✓ 2026-05-18
- [x] 1.2 创建 `rag/` 模块目录结构和 `__init__.py` ✓ 2026-05-18
- [x] 1.3 创建博文数据目录 `data/articles/`，复制 MyBlog 博文 ✓ 2026-05-18
- [ ] 1.4 安装依赖 & 确认 Embedding API 可用（需手动 pip install）

**Quality Gate:**
- [ ] `pip install` 无冲突
- [ ] Embedding 模型可正常调用

---

## Phase 2: 文档加载与切片

- [x] 2.1 实现 `loader.py`：加载 Markdown 文件，解析 frontmatter ✓ 2026-05-18
- [x] 2.2 实现文本切片（在 qa_chain.py run_index_pipeline 中）✓ 2026-05-18
- [ ] 2.3 切片单元测试

**Quality Gate:**
- [ ] 2 篇博文正确加载，切片总数合理
- [ ] 每个切片保留来源元数据

---

## Phase 3: 向量存储

- [x] 3.1 实现 `vector_store.py`：初始化 Chroma 客户端 ✓ 2026-05-18
- [x] 3.2 实现文档向量化与索引 pipeline ✓ 2026-05-18
- [x] 3.3 实现 `retriever.py`：相似度检索 + MMR 重排序 ✓ 2026-05-18
- [ ] 3.4 检索集成测试

**Quality Gate:**
- [ ] Chroma 持久化存储正常工作
- [ ] 检索返回的切片语义上匹配查询

---

## Phase 4: QA 链路

- [x] 4.1 实现 `qa_chain.py`：检索 + 上下文拼接 + LLM 生成回答 ✓ 2026-05-18
- [x] 4.2 在回答中标注引用来源 ✓ 2026-05-18
- [x] 4.3 新增 API 路由 `POST /api/rag/query` ✓ 2026-05-18
- [x] 4.4 新增 API 路由 `POST /api/rag/index` ✓ 2026-05-18

**Quality Gate:**
- [ ] QA 回答基于博文内容而非 LLM 先验知识
- [ ] 引用来源准确标注

---

## Phase 5: Agent Tool 集成

- [x] 5.1 实现 `knowledge.py` Tool ✓ 2026-05-18
- [x] 5.2 注册到 tools/__init__.py ALL_TOOLS ✓ 2026-05-18
- [ ] 5.3 Tool 调用集成测试

**Quality Gate:**
- [ ] Agent 能正确触发 RAG Tool
- [ ] Tool 返回的结果被正确注入 LLM 上下文

---

## Phase 6: 对话 UI

- [x] 6.1 新建 `rag-ui/`（React + Vite 简单项目）✓ 2026-05-18
- [x] 6.2 实现查询输入框 + 回答展示区 + 引用来源展示 ✓ 2026-05-18
- [x] 6.3 对接 `POST /api/rag/query` 接口（vite proxy）✓ 2026-05-18
- [x] 6.4 基础样式（Tailwind），移动端适配 ✓ 2026-05-18

**Quality Gate:**
- [ ] UI 可正常查询并展示回答
- [ ] 引用来源可点击/展开查看原文

---

## Phase 7: 评估与文档

- [ ] 7.1 编写评估脚本：对 5-10 个测试问题评估检索准确率和回答质量
- [x] 7.2 更新 `requirements.txt` 记录新增依赖 ✓ 2026-05-18
- [x] 7.3 编写 `docs/rag-design.md` 设计文档 ✓ 2026-05-18
- [x] 7.4 更新目标.md 标记 RAG 完成（P0→P1）✓ 2026-05-18

**Quality Gate:**
- [ ] 所有测试通过
- [ ] 评估指标可量化展示

---

## Completion Checklist

- [ ] 所有 Phase 完成
- [ ] 所有 Quality Gate 通过
- [ ] RAG 模块可独立运行
- [ ] Agent 可通过 Tool 调用 RAG
- [ ] 文档同步完毕
- [ ] 准备面试时可展示的 Demo
- [ ] Ready for `/openspec-archive`
