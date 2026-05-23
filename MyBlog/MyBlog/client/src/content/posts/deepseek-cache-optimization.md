---
title: "LLM 缓存优化实战：把 DeepSeek 代理缓存率从 56% 提升到 76%"
date: 2026-05-23
slug: deepseek-cache-optimization
tags: [DeepSeek, LLM, 代理, 缓存, 优化, 性能, Codex]
category: 技术
excerpt: "给 Codex 写 DeepSeek 代理时发现缓存率不到 50%，远低于 Claude 的 96%。通过五轮搜索、分析和修复，最终把缓存率提升到 76%，session 内稳定期达到 95-99%。这篇文章记录了完整的技术调查过程。"
---

# LLM 缓存优化实战：把 DeepSeek 代理缓存率从 56% 提升到 76%

## 问题：为什么我的缓存率不到 50%？

用 Codex CLI 搭配 DeepSeek V4 模型，发现在 Codex 里缓存率不到 50%，但同样的使用场景 Claude 能做到 96%。DeepSeek 的定价是 cached ¥0.025 vs uncached ¥3/100万 tokens——差了 120 倍。缓存率低意味着成本高出一两个数量级。

## 背景：DeepSeek 的 KV 缓存机制

DeepSeek 的"上下文硬盘缓存"是自动开启的。原理很简单：

> 如果本次请求的前 N 个 token 与之前的请求**字节完全一致**，这 N 个 token 按缓存价（约 1/10~1/50）计费。

关键约束：**精确字节匹配，不是语义匹配。** 多一个空格、换行、JSON key 顺序不同，缓存就不命中。

## 第一轮：查资料、找原因

搜索了 GitHub、DeepSeek 官方文档、以及多个开源代理实现。发现了 Reasonix 项目——一个专为 DeepSeek 设计的 Agent 框架，宣称 85-99% 缓存率。

Reasonix 的核心架构叫 **"字节稳定前缀"（Byte-Stable Prompt Prefix）**，把 prompt 分成三个区域：

```
┌──────────────────────────────────────┐
│ 不可变前缀 (Immutable Prefix)        │ ← 冻结在 session 开始
│   system + 工具定义 + few-shots      │   这是缓存目标
├──────────────────────────────────────┤
│ 追加日志 (Append-Only Log)           │ ← 单调增长
│   [user₁][assistant₁][tool₁]...      │   不修改历史
├──────────────────────────────────────┤
│ 易失暂存 (Volatile Scratch)          │ ← 每轮重置
│   R1 思考、临时状态                   │   不上传给 API
└──────────────────────────────────────┘
```

对比之下，我的代理第 一版的问题逐渐清晰：

1. **`reasoning_content` 不稳定**：assistant 消息的 `reasoning_content` 字段在对话重建时从多个地方获取（cache、lastCachedReasoning、message.reasoning），不同轮次得到不同的值
2. **工具定义 key 顺序不确定**：`JSON.stringify` 不保证 key 顺序，同样的工具定义在不同请求中可能以不同字节序列出现
3. **消息内容尾空白不一致**：tool output 在传输过程中被多次 parse/stringify，导致尾空白变化

## 前四轮修复

| 轮次 | 修复内容 | 缓存率变化 |
|------|---------|-----------|
| 1 | `role: "user"` → `"system"`，去掉 `[System Instructions]` 前缀 | 测试环境达 94% |
| 2 | 移除 `reasoningCache.get(content)` 回退逻辑，统一 `reasoning_content: ""` | — |
| 3 | 移除 `inToolContext` 注入，所有 assistant 消息统一处理 | — |
| 4 | 工具定义确定性 key 顺序 `{type, function: {name, description, parameters}}` | 受控测试 95-97% |

但跑到真实 Codex 任务后，一查 stats——**56.7%**，59 个请求，1.6M tokens。

Session 内稳定期确实有 94-99%，但跨 session 时 Codex 的 `instructions` 字段每次内容不同（MD5 hash 在两个值之间来回切换），导致 system message 的 7-9K tokens 无法缓存。

## 第五轮：更大范围搜索 + 实现

搜索了更多资料，包括 DeepSeek 官方 API 文档、Nginx 反代优化策略、语义缓存、请求规范化等。找到了 Reasonix 的完整架构细节和社区的最佳实践总结。

### 新增的六个优化

**1. 递归参数 key 排序**

不只是工具定义外层 key 排序，parameters 对象内部的 `{type, properties, required}` 等也要排序。写了个 `canonicalStringify` 函数：

```js
function canonicalStringify(obj) {
  return JSON.stringify(obj, (key, val) => {
    if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      const sorted = {};
      for (const k of Object.keys(val).sort()) sorted[k] = val[k];
      return sorted;
    }
    return val;
  });
}
```

**2. 消息内容归一化**

所有消息内容统一处理：
- `\r\n` → `\n`
- 每行尾空白 trim
- 连续 3+ 个空行 → 2 个
- 整体尾空白 trim

**3. 参数精度归一化**

`temperature=0.7` 和 `temperature=0.70` 可能产生不同的字节序列。统一 `toFixed(2)`：

```js
req.temperature = parseFloat(body.temperature.toFixed(2));
```

**4. 精确请求响应缓存**

对完整请求体做 SHA-256，5 分钟内相同请求直接返回 LRU 缓存，不调用 DeepSeek。这在 Codex 网络重试或意外重复请求时省一次调用。

**5. Compaction 检测**

当 Codex 截断对话历史时，消息数会骤降。加上检测日志便于定位缓存重置事件。

**6. 预热身**

代理启动后 2 秒自动发一个最小请求给 DeepSeek，提前建立 KV 缓存前缀。

## 结果对比

### 全局统计

| 指标 | 修改前 | 修改后 |
|------|-------|-------|
| 总请求 | 59 | 90 |
| 总 Prompt Tokens | ~1.6M | ~2.1M |
| **总缓存率** | **56.7%** | **76.0%** |
| 成本倍数（相对无缓存） | ~5.8× | ~3.2× |

### Session 内稳定期

```
#89  prompt=18,559  cached=18,304  98.6%
#90  prompt=24,611  cached=22,656  92.1%
```

单 session 稳定后平均 **95-99%**，接近 Claude 的 96%。

### 跨 Session 场景

```
#21  prompt=23,710  cached=20,096  84.8%  ← 新 session，已有缓存
#22  prompt=24,338  cached=256     1.1%   ← compaction 后
#23  prompt=24,899  cached=20,096  80.7%  ← 快速恢复
...
#28  prompt=25,614  cached=25,088  97.9%  ← 完全稳定
```

关键发现：**即使 instructions 变了，工具定义和消息格式的稳定性让 DeepSeek 能缓存后面 ~13K tokens。** 这是"缓存尾命中"——前 9K（system message）miss，但后续 13K 命中，总缓存率仍有 ~58%。

## 核心认知

**1. 代理层的天花板。** 缓存率的最终限制不在代理端，而在调用端。Codex 每次 `instructions` 内容在 `5ecf3439` 和 `885c643e` 两个 hash 之间来回切换，这在代理层无法控制。Reasonix 能做到 99% 是因为它是从头设计的 Agent 框架——system prompt 冻结、工具集锁定、历史只追加。

**2. 字节稳定性是唯一重要的事。** 不要花时间搞语义缓存、embedding 匹配。DeepSeek 的 KV 缓存是精确字节匹配，所以所有精力应该放在确保消息的字节序列不因无关因素变化。

**3. 优化缓存就是降低成本。** 56% → 76% 意味着实际成本降低了近一半。如果每天跑大量 token，这个差异直接体现在账单上。

## 经验教训

- **先测量再优化**：没有 `/stats` 端点前，全靠日志猜测缓存率。加上统计后才真正看到瓶颈。
- **受控测试不可信**：手动测试 5 个请求缓存率 95%，但真实使用场景下只有 57%。必须跑真实任务才能发现问题。
- **搜索别人的方案很重要**：Reasonix 的"字节稳定前缀"架构直接点明了缓存优化的核心原则。如果不是搜索了别人的实现，我可能会在错误的方向上花很多时间。

## 相关资源

- [Reasonix - DeepSeek-native AI coding agent](https://github.com/esengine/DeepSeek-Reasonix)
- [DeepSeek API Docs - KV Cache](https://api-docs.deepseek.com/zh-cn/guides/kv_cache)
- [The boring secret to a cheap AI coding agent](https://dev.to/esengine/the-boring-secret-to-a-cheap-ai-coding-agent-a-byte-stable-prompt-prefix-5f7k)
- [How a DeepSeek-only agent framework hit 85% prefix cache rate](https://dev.to/esengine/how-a-deepseek-only-agent-framework-hit-85-prefix-cache-rate-and-saved-93-vs-claude-5c9g)
