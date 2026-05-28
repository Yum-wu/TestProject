---
title: "AI Agent 多层记忆系统设计详解"
date: 2026-05-21
slug: agent-memory-system
tags: [AI, Agent, Memory, SQLite, 架构]
category: 技术
excerpt: 记忆系统是 AI Agent 实现持续学习和个性化交互的关键。
---

# AI Agent 多层记忆系统设计详解

## 四层记忆架构

| 层级 | 名称 | 存储 | 持久性 | 用途 |
| L0 | Conversation | SQLite | 短期 | 原始对话记录 |
| L1 | Atoms | SQLite | 中期 | 原子事实 |
| L2 | Scenarios | Markdown | 中期 | 场景聚合 |
| L3 | Persona | 内存 | 长期 | 用户画像 |

### L0: 对话记录

记录用户和 AI 的消息。支持滑动窗口清理。

### L1: 原子事实

三元组事实（主语-谓词-宾语）。

### L2: 场景聚合

对话结束时聚合原子事实为结构化文档。

### L3: 用户画像

语言偏好、技术栈偏好、回答风格偏好。

## 与 RAG 的关系

- RAG：外部知识，静态共享
- Memory：用户交互历史，动态个性化
