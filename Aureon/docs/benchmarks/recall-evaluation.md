# Recall@3 Evaluation

## Test Dataset

- 51 QA pairs
- Domain: Enterprise knowledge base
- Languages: Chinese + English

## Methodology

### Retrieval Pipeline
1. BM25 keyword search (sparse)
2. BGE embedding search (dense)
3. Score fusion (weighted combination)
4. Top-3 selection

### Evaluation Metric
Recall@3 = (Relevant docs in top 3) / (Total relevant docs)

## Results

| Method | Recall@3 |
|--------|----------|
| BM25 Only | 78.43% |
| Dense Only | 84.31% |
| **Hybrid (Ours)** | **96.08%** |

## Analysis

- Hybrid retrieval outperforms single-method by 12-18%
- Dense search better for semantic queries
- BM25 better for exact keyword matches
- Fusion combines strengths of both

## Optimization

- Weight tuning: BM25 0.3 + Dense 0.7
- Chunk size: 512 tokens
- Overlap: 50 tokens
