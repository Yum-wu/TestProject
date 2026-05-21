# Delta: RAG + Agent Tool + Prompt Experiments

**Change ID:** `rag-prompt-experiments`
**Affects:** RAG pipeline, Agent Tools, Frontend (rag-ui)

---

## ADDED

### Requirement: RAG Evaluation

系统应提供 RAG 质量评估能力。

#### Scenario: Evaluate Recall@k
- GIVEN a test dataset with known Q&A pairs
- WHEN running recall evaluation with k=3
- THEN output Recall@3 score
- AND list each query's retrieval status (hit/miss)

#### Scenario: Evaluate Faithfulness
- GIVEN a RAG-generated answer and its source documents
- WHEN faithfulness evaluation runs
- THEN LLM-as-judge scores whether answer is grounded in sources (0-10)
- AND output average faithfulness score

#### Scenario: Evaluate latency
- GIVEN RAG query endpoint is running
- WHEN evaluation runs N queries
- THEN output p50/p99/mean latency in milliseconds

---

### Requirement: Agent Tool - knowledge_retrieval 改进

现有 `knowledge_retrieval` tool 需审计改进。

#### Scenario: LLM instance reuse
- GIVEN knowledge_retrieval tool is called
- WHEN tool executes rag_query
- THEN LLM instance is reused (not created per call)
- AND response time improves

#### Scenario: Tool answers from knowledge base
- GIVEN user asks a question answerable from articles knowledge base
- WHEN Agent routes to knowledge_retrieval tool
- THEN tool returns relevant chunks + LLM-generated answer
- AND Agent incorporates answer into response

#### Scenario: No index available
- GIVEN knowledge base has not been indexed
- WHEN Agent startup checks available tools
- THEN knowledge_retrieval tool is not registered (invisible to Agent)
- AND Agent does not error

---

### Requirement: Prompt Strategy Experiments

系统应支持对比不同 Prompt 策略的 RAG 问答效果。

#### Scenario: Run prompt experiment
- GIVEN a fixed set of test questions
- WHEN experiment runs with Direct / CoT / Few-shot strategies
- THEN output comparison table with metrics

#### Scenario: Experiment report
- GIVEN experiment completed
- WHEN report is generated
- THEN report contains accuracy, token usage, latency per strategy
- AND includes raw responses for manual review

---

## MODIFIED

### Requirement: rag-ui frontend

检索结果页面应展示评分和来源信息。

#### Scenario: Display retrieval scores
- GIVEN user performs a RAG query
- WHEN results are displayed
- THEN each source chunk shows its similarity score
- AND answer includes source citations

---

## REMOVED

(None)
