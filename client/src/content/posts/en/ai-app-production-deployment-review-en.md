---
title: "AI App Production Deployment: From 72 to 100 Score - A Complete Post-Mortem"
date: 2026-05-29
slug: ai-app-production-deployment-review-en
tags: [Technical, AI, Production, Code Quality, TDD, Architecture]
category: Technical
excerpt: A complete post-mortem of taking an AI knowledge base app from code review (72 score) to production-ready (100 score). Covers code quality improvements, test coverage increases, architecture optimization, and production debugging.
lang: en
---

# AI App Production Deployment: From 72 to 100 Score - A Complete Post-Mortem

I recently completed the production deployment of an AI knowledge base application (Aureon), improving it from a 72-score code review to a 100-score production-ready state. This journey involved code quality improvements, architecture optimization, test coverage increases, and production debugging.

Here's the complete post-mortem, sharing experiences with fellow AI application developers.

## Background

Aureon is an enterprise AI knowledge base platform with tech stack:
- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Backend**: Python FastAPI + LangChain + LangGraph
- **Database**: SQLite (memory) + Chroma (vector store)
- **Cache**: Redis
- **Deployment**: Railway + Docker

The app worked locally but was a mess in production. After 3 days of intensive fixes, it finally reached production-ready status.

## Phase 1: Code Review (Discovered 72 Score)

A comprehensive code review revealed numerous issues:

### Critical Issues

1. **Dashboard Using Mock Data**
   - Frontend query statistics and cache hit rates were hardcoded
   - Users saw fake data

2. **Bloated main.py (632 lines)**
   - Route definitions, business logic, data processing all mixed together
   - Hard to maintain and test

3. **DRY Violation in Search Feature**
   - Direct fetch calls in components without service layer
   - Same logic duplicated in multiple places

4. **Inconsistent Error Handling**
   - Some places threw exceptions, others returned None
   - Frontend didn't know how to handle errors

5. **Low Test Coverage**
   - Backend: 39%
   - Frontend: 29%
   - Many features untested

## Phase 2: Architecture Optimization

### 2.1 Splitting main.py

**Goal**: Reduce main.py from 632 to under 250 lines.

**Approach**: Extract Chat and RAG routes to separate files.

```python
# backend/app/routers/chat.py
router = APIRouter(tags=["chat"])

@router.post("/api/chat/stream")
async def chat_stream(req: ChatRequest, request: Request):
    # ... implementation
```

```python
# backend/app/routers/rag.py
router = APIRouter(prefix="/api/rag", tags=["rag"])

@router.post("/api/rag/query")
async def rag_query_endpoint(req: RAGQueryRequest, request: Request):
    # ... implementation
```

**Results**:
- main.py: 632 → 250 lines (-60%)
- Each router independently testable
- Clear separation of concerns

### 2.2 Creating Service Layer

**Goal**: Eliminate DRY violations, unify API call patterns.

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

  // SSE streaming handling
  const reader = response.body?.getReader();
  // ... parsing logic
}
```

**Results**:
- Components focus only on UI, not API details
- API call logic reused
- Unified error handling

### 2.3 Unified Error Handling

**Goal**: Define clear exception hierarchy.

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

**Results**:
- Frontend can clearly identify error types
- Different UI for different errors
- More standardized logging

## Phase 3: Test Coverage Improvement

### 3.1 Backend Tests

**Goal**: Increase backend test coverage from 39% to 67%.

**Strategy**: TDD (Test-Driven Development)

```python
# Write test first
def test_redis_unavailable_returns_defaults():
    """When Redis is unavailable, return defaults instead of errors"""
    app.dependency_overrides[get_redis_or_none] = lambda: None

    with patch("app.cache.redis_client._get_redis", return_value=None):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            resp = await ac.get("/api/rag/stats")

    assert resp.status_code == 200
    data = resp.json()
    assert data["query_count_24h"] == 0
    assert data["cache_hit_rate"] == 0.0

# Then implement
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
    # ... normal logic
```

**New Tests Added**:
- Chat Router tests (4)
- RAG Stats Router tests (5)
- Dependencies tests (6)
- Exceptions tests (3)
- Vector Store tests (5)
- Total: 13 new test files

**Results**:
- Backend tests: 80 → 252 (+215%)
- Coverage: 39% → 67% (+72%)
- More confidence during refactoring

### 3.2 Frontend Tests

**Goal**: Increase frontend tests from 29 to 49.

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

**New Tests Added**:
- Search component tests (6)
- Documents component tests (5)
- DocumentUpload component tests (4)
- useDocuments Hook tests (5)
- useDashboardStats Hook tests (5)

**Results**:
- Frontend tests: 29 → 49 (+69%)
- Complete component logic validation
- Hook logic test coverage

## Phase 4: Production Debugging

### 4.1 Redis Connection Issues

**Symptom**: Dashboard API returning 503 errors.

**Cause**: Railway's Redis uses internal domain names, but code defaulted to localhost.

**Solution**:
1. Graceful degradation (non-essential features return defaults)
2. Proper REDIS_URL environment variable configuration

### 4.2 ChromaDB Version Incompatibility

**Symptom**: Documents API returning `_type` error.

**Cause**: ChromaDB 1.5.x EmbeddingFunction interface changed.

**Solution**: Updated ZhipuEmbeddingFn to implement new interface.

### 4.3 Query Statistics Not Working

**Symptom**: Dashboard statistics not updating after queries.

**Cause**: qa_chain.py was importing wrong Redis function.

**Solution**: Fixed import paths.

### 4.4 Volume State Anomaly

**Symptom**: Railway Volume showing detached state.

**Solution**: Reattached volume.

## Key Learnings

### 1. Graceful Degradation is King

```python
# ❌ Bad: Non-essential feature error crashes entire page
if not redis:
    raise RedisUnavailableError()

# ✅ Good: Return defaults, page still usable
if not redis:
    return StatsResponse(query_count_24h=0, ...)
```

**Principle**: Let users see the page rather than throwing errors.

### 2. Version Compatibility Matters

```python
# When using third-party libraries, always check version compatibility
# Especially major version upgrades
chromadb>=1.5.0  # Might have breaking changes

# Solution
pip install chromadb==1.5.9  # Pin version
# Or implement new interface
class MyEmbeddingFn(EmbeddingFunction):
    def name(self) -> str:  # New version requires this
        return "my_fn"
```

### 3. Always Check Imports After Refactoring

```bash
# Use IDE auto-import
# Or run tests to verify

# Quick check
cd backend
python -m py_compile app/main.py
python -m py_compile app/routers/chat.py
python -m py_compile app/routers/rag.py
```

### 4. Long-Running Operations Should Be Background

```python
# ❌ Bad: Blocking request
@app.post("/api/rag/index")
def index_documents():
    run_index_pipeline()  # Might take several minutes
    return {"status": "done"}

# ✅ Good: Background execution
@app.post("/api/rag/index")
async def index_documents():
    asyncio.create_task(run_index_pipeline_async())
    return {"status": "indexing_started"}
```

### 5. Small Steps Win

```
# ❌ Bad: Too many changes in one commit
git commit -m "fix: refactor entire system"

# ✅ Good: Each change separate
git commit -m "refactor: extract chat router from main.py"
git commit -m "refactor: extract rag router from main.py"
git commit -m "test: add chat router tests"
git commit -m "feat: connect dashboard to real API"
```

**Benefits**:
- Easier to locate problems
- Easy to rollback
- Code review is easier

## Final Results

### Code Quality

- ✅ main.py: 632 → 250 lines (-60%)
- ✅ Backend tests: 80 → 252 (+215%)
- ✅ Frontend tests: 29 → 49 (+69%)
- ✅ Coverage: 39% → 67% (+72%)

### Feature Completeness

- ✅ Dashboard shows real data (Redis + ChromaDB)
- ✅ RAG query working properly
- ✅ Document management functional
- ✅ Unified error handling

### Production Environment

- ✅ Railway deployment stable
- ✅ Redis connection working
- ✅ ChromaDB vector store working
- ✅ Performance metrics: 96% recall, 310ms latency

## Future Optimization Directions

1. **Test Coverage**: Target 80%+
2. **Performance Optimization**: Improve cache hit rate
3. **Monitoring & Alerting**: Add production monitoring
4. **Automated Testing**: CI/CD pipeline

---

## Summary

From 72 to 100 score, here's what was done:

1. **Code Refactoring**: Split large files, extract Service layer
2. **Error Handling**: Unified exception hierarchy, graceful degradation
3. **Test Coverage**: TDD, increase coverage to 67%+
4. **Production Debugging**: Fixed Redis, ChromaDB, Volume issues

**Key Takeaways**:

- Graceful degradation beats hard requirements
- Version compatibility is easily overlooked
- Tests are safety nets for refactoring
- Small steps are safer than big changes

Although time-consuming, this process yielded significant gains. Hope these experiences help fellow AI application developers! 🚀
