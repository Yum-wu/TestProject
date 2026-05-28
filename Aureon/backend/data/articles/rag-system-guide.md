---
title: "RAG 检索增强生成系统搭建指南"
date: 2026-05-21
slug: rag-system-guide
tags: [AI, RAG, ChromaDB, Embedding, 知识库]
category: 技术
excerpt: RAG 是构建领域知识问答系统的核心架构。
---

# RAG 检索增强生成系统搭建指南

## RAG 全链路

1. 文档加载 - 从本地读取 Markdown 文档
2. 文本分块 - 切分成适合检索的短片段
3. 向量嵌入 - 用 Embedding 模型转为向量
4. 向量存储 - 存入 ChromaDB
5. 检索 - 查询 Top-K 相关片段
6. 生成 - LLM 基于上下文生成回答

## 文档分块

```
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n## ", "\n### ", "\n\n", "\n", " ", ""],
)
```

## 向量嵌入

使用智谱 Embedding-2 模型生成 768 维向量。

## 检索优化

MMR 算法同时考虑相关性和多样性。

## 问答生成

基于参考文档回答，末尾标注引用来源。
