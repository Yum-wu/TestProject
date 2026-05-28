---
title: "LangChain Agent 从零入门"
date: 2026-05-20
slug: langchain-agent-intro
tags: [AI, LangChain, Agent, 教程]
category: 技术
excerpt: LangChain Agent 是构建 AI 工具调用能力的基础框架。
---

# LangChain Agent 从零入门

LangChain Agent 允许 LLM 根据用户输入动态决定调用哪些工具。

## Agent 的核心概念

- **LLM**：理解用户意图并决定下一步动作
- **Tools**：Agent 可以调用的外部函数
- **Agent Executor**：协调 LLM 和 Tools 之间的循环

### 执行流程

1. 用户输入 -> LLM 判断是否需要调用工具
2. 输出结构化工具调用请求（工具名 + 参数）
3. Agent Executor 执行工具，结果返回 LLM
4. LLM 判断是否满足需求，否则继续调用工具
5. 循环直到任务完成或达到最大迭代次数

## 工具注册

```python
from langchain.tools import tool

@tool
def calculator(expression: str) -> str:
    """计算数学表达式的结果"""
    try:
        return str(eval(expression))
    except Exception as e:
        return f"计算错误: {e}"
```

## 最佳实践

1. 工具描述要精确
2. 设置最大迭代次数
3. 异常处理
4. 条件注册
