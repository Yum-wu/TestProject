---
title: "AI 应用生产环境部署：从 72 分到 100 分的完整复盘"
date: 2026-05-29
slug: ai-app-production-deployment-review
tags: [技术, AI, 生产环境, 代码质量, TDD, 架构设计]
category: 技术
excerpt: 完整复盘一个 AI 知识库应用从代码审查到生产部署的全过程。包括代码质量改进、测试覆盖提升、架构优化、生产环境调试等，分享如何把一个半成品应用打磨到生产就绪。
lang: zh
---

# AI 应用生产环境部署：从 72 分到 100 分的完整复盘

最近完成了一个 AI 知识库应用（Aureon）的生产环境部署，从代码审查发现的 72 分一路修复到 100 分。这个过程涉及代码质量改进、架构优化、测试覆盖提升、生产环境调试等多个方面。

完整复盘一下整个过程，分享经验给同样在做 AI 应用开发的朋友。

## 背景

Aureon 是一个企业级 AI 知识库平台，技术栈：
- **前端**：React 19 + TypeScript + Tailwind CSS
- **后端**：Python FastAPI + LangChain + LangGraph
- **数据库**：SQLite（记忆）+ Chroma（向量库）
- **缓存**：Redis
- **部署**：Railway + Docker

项目在本地开发时基本能用，但生产环境一塌糊涂。经过 3 天的密集修复，终于达到了生产就绪状态。

## 第一阶段：代码审查（发现 72 分）

最开始做了一次全面的代码审查，发现了很多问题：

### 关键问题

1. **Dashboard 使用 Mock 数据**
   - 前端显示的查询统计、缓存命中率都是硬编码的
   - 用户看到的是假数据

2. **main.py 过于庞大（632 行）**
   - 路由定义、业务逻辑、数据处理全混在一起
   - 难以维护和测试

3. **Search 功能 DRY 违反**
   - 直接在组件中调用 fetch，没有 service 层
   - 同样的逻辑在多个地方重复

4. **错误处理不统一**
   - 有的地方抛异常，有的地方返回 None
   - 前端不知道如何处理错误

5. **测试覆盖率低**
   - 后端：39%
   - 前端：29%
   - 大量功能没有测试

## 第二阶段：架构优化

### 2.1 拆分 main.py

**目标**：把 main.py 从 632 行减少到 250 行以内。

**方案**：提取 Chat 和 RAG 路由到独立文件。

```python
# backend/app/routers/chat.py
router = APIRouter(tags=["chat"])

@router.post("/api/chat/stream")
async def chat_stream(req: ChatRequest, request: Request):
    # ... 实现
```

```python
# backend/app/routers/rag.py
router = APIRouter(prefix="/api/rag", tags=["rag"])

@router.post("/api/rag/query")
async def rag_query_endpoint(req: RAGQueryRequest, request: Request):
    # ... 实现
```

**效果**：
- main.py：632 → 250 行
- 每个 router 独立可测试
- 职责分离清晰

### 2.2 创建 Service 层

**目标**：消除 DRY 违反，统一 API 调用方式。

```typescript
// src/services/rag.ts
export async function streamRAGQuery(
  question: string,
  options: RAGStreamOptions
): Promise<void> {
  const response = await fetch("/api/rag/query/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: question, top_k: 3 }),
    signal: options.signal,
  });

  // SSE 流式处理
  const reader = response.body?.getReader();
  // ... 解析逻辑
}
```

**效果**：
- 组件只关心 UI，不关心 API 细节
- API 调用逻辑复用
- 错误处理统一

### 2.3 统一错误处理

**目标**：定义清晰的错误层次结构。

```python
# backend/app/exceptions.py
class AureonException(HTTPException):
    def __init__(self, status_code: int, detail: str, error_type: str = None):
        super().__init__(status_code=status_code, detail=detail)
        self.error_type = error_type

class RedisUnavailableError(AureonException):
    def __init__(self, detail="Redis service unavailable"):
        super().__init__(status_code=503, detail=detail, error_type="RedisUnavailableError")

class VectorStoreError(AureonException):
    def __init__(self, detail="Vector store operation failed"):
        super().__init__(status_code=500, detail=detail, error_type="VectorStoreError")
```

**效果**：
- 前端能清晰识别错误类型
- 可以针对不同错误显示不同 UI
- 日志记录更规范

## 第三阶段：测试覆盖提升

### 3.1 后端测试

**目标**：后端测试覆盖率从 39% 提升到 67%。

**策略**：TDD（Test-Driven Development）

```python
# 先写测试
def test_redis_unavailable_returns_defaults():
    """当 Redis 不可用时，返回默认值而非报错"""
    app.dependency_overrides[get_redis_or_none] = lambda: None

    with patch("app.cache.redis_client._get_redis", return_value=None):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            resp = await ac.get("/api/rag/stats")

    assert resp.status_code == 200
    data = resp.json()
    assert data["query_count_24h"] == 0
    assert data["cache_hit_rate"] == 0.0

# 然后实现
@router.get("/api/rag/stats")
async def get_stats(redis=Depends(get_redis_or_none)):
    if not redis:
        return StatsResponse(
            query_count_24h=0,
            cache_hit_rate=0.0,
            avg_retrieval_latency_ms=0.0,
            total_indexed_docs=doc_count,
            total_chunks=chunk_count
        )
    # ... 正常逻辑
```

**新增测试**：
- Chat Router 测试（4 个）
- RAG Stats Router 测试（5 个）
- Dependencies 测试（6 个）
- Exceptions 测试（3 个）
- Vector Store 测试（5 个）
- 总计：13 个新测试文件

**效果**：
- 后端测试：80 → 252 个
- 覆盖率：39% → 67%
- 重构时更有信心

### 3.2 前端测试

**目标**：前端测试从 29 个提升到 49 个。

```typescript
// Search.test.tsx
describe("Search", () => {
  it("renders initial state with title and empty search", () => {
    render(<Search />);
    expect(screen.getByText("Enterprise Search")).toBeInTheDocument();
  });

  it("shows error when query exceeds max length", async () => {
    const user = userEvent.setup();
    render(<Search />);

    const input = screen.getByTestId("search-input");
    await user.type(input, "a".repeat(1001));
    await user.click(screen.getByTestId("search-btn"));

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
```

**新增测试**：
- Search 组件测试（6 个）
- Documents 组件测试（5 个）
- DocumentUpload 组件测试（4 个）
- useDocuments Hook 测试（5 个）
- useDashboardStats Hook 测试（5 个）

**效果**：
- 前端测试：29 → 49 个
- 组件逻辑验证完整
- Hook 逻辑测试覆盖

## 第四阶段：生产环境调试

### 4.1 Redis 连接问题

**现象**：Dashboard API 返回 503 错误。

**原因**：Railway 的 Redis 使用内部域名，但代码默认连 localhost。

**解决**：
1. 优雅降级（非必需功能返回默认值）
2. 正确配置 REDIS_URL 环境变量

### 4.2 ChromaDB 版本不兼容

**现象**：Documents API 返回 `_type` 错误。

**原因**：ChromaDB 1.5.x 的 EmbeddingFunction 接口已改变。

**解决**：更新 ZhipuEmbeddingFn 实现新接口。

### 4.3 查询统计不工作

**现象**：查询后 Dashboard 统计不更新。

**原因**：qa_chain.py 导入了错误的 Redis 函数。

**解决**：修正导入路径。

### 4.4 Volume 状态异常

**现象**：Railway Volume 显示 detached 状态。

**解决**：重新 attach volume。

## 关键经验

### 1. 优雅降级是王道

```python
# ❌ 不好：非必需功能报错导致整个页面崩溃
if not redis:
    raise RedisUnavailableError()

# ✅ 好：返回默认值，页面仍能使用
if not redis:
    return StatsResponse(query_count_24h=0, ...)
```

**原则**：让用户看到页面，比直接报错好。

### 2. 版本兼容性很重要

```python
# 使用第三方库时，一定要检查版本兼容性
# 特别是 major 版本升级
chromadb>=1.5.0  # 可能有 breaking changes

# 解决方案
pip install chromadb==1.5.9  # 固定版本
# 或者实现新接口
class MyEmbeddingFn(EmbeddingFunction):
    def name(self) -> str:  # 新版本需要
        return "my_fn"
```

### 3. 重构后一定要检查导入

```bash
# 使用 IDE 自动导入
# 或者运行测试验证

# 快速检查
cd backend
python -m py_compile app/main.py
python -m py_compile app/routers/chat.py
python -m py_compile app/routers/rag.py
```

### 4. 长时间操作要后台执行

```python
# ❌ 不好：阻塞请求
@app.post("/api/rag/index")
def index_documents():
    run_index_pipeline()  # 可能需要几分钟
    return {"status": "done"}

# ✅ 好：后台执行
@app.post("/api/rag/index")
async def index_documents():
    asyncio.create_task(run_index_pipeline_async())
    return {"status": "indexing_started"}
```

### 5. 小步快跑

```
# ❌ 不好：一次提交太多改动
git commit -m "fix: 重构整个系统"

# ✅ 好：每个改动独立提交
git commit -m "refactor: extract chat router from main.py"
git commit -m "refactor: extract rag router from main.py"
git commit -m "test: add chat router tests"
git commit -m "feat: connect dashboard to real API"
```

**好处**：
- 容易定位问题
- 方便回滚
- Code review 更容易

## 最终成果

### 代码质量

- ✅ main.py：632 → 250 行（-60%）
- ✅ 后端测试：80 → 252 个（+215%）
- ✅ 前端测试：29 → 49 个（+69%）
- ✅ 覆盖率：39% → 67%（+72%）

### 功能完整性

- ✅ Dashboard 显示真实数据（Redis + ChromaDB）
- ✅ RAG 查询正常工作
- ✅ 文档管理功能正常
- ✅ 错误处理统一规范

### 生产环境

- ✅ Railway 部署稳定运行
- ✅ Redis 连接正常
- ✅ ChromaDB 向量存储正常
- ✅ 性能指标：96% 召回率，310ms 延迟

## 后续优化方向

1. **测试覆盖率**：目标 80%+
2. **性能优化**：缓存命中率提升
3. **监控告警**：添加生产环境监控
4. **自动测试**：CI/CD 流水线

---

## 总结

从 72 分到 100 分，主要做了这几件事：

1. **代码重构**：拆分大文件，提取 Service 层
2. **错误处理**：统一异常层次结构，优雅降级
3. **测试覆盖**：TDD，提升覆盖率到 67%+
4. **生产调试**：Redis、ChromaDB、Volume 等问题

**关键收获**：

- 优雅降级比硬性要求更重要
- 版本兼容性容易被忽视
- 测试是重构的安全网
- 小步快跑比大刀阔斧更安全

这个过程虽然耗时，但收获很大。希望对同样在做 AI 应用开发的朋友有帮助！🚀
