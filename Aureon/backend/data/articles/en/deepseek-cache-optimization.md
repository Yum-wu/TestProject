---
title: "LLM Cache Optimization: Boosting DeepSeek Proxy Cache Rate from 56% to 76%"
date: 2026-05-23
slug: deepseek-cache-optimization
tags: [DeepSeek, LLM, Proxy, Cache, Optimization, Performance, Codex]
category: Technology
excerpt: "While building a DeepSeek proxy for Codex, I found the cache rate was under 50% — far below Claude's 96%. After five rounds of investigation and fixes, the cache rate reached 76%, with session steady-state hitting 95-99%. This article documents the full technical journey."
lang: en
---

# LLM Cache Optimization: Boosting DeepSeek Proxy Cache Rate from 56% to 76%

## Problem: Why Was My Cache Rate Under 50%?

Using Codex CLI with DeepSeek V4, the cache rate was under 50%, while Claude achieved 96% under the same usage pattern. DeepSeek's pricing is cached ¥0.025 vs uncached ¥3/1M tokens — a 120x difference. Low cache rates mean costs one to two orders of magnitude higher.

## Background: DeepSeek's KV Cache Mechanism

DeepSeek's "context hard disk cache" is auto-enabled. The principle is simple:

> If the first N tokens of a request are **byte-identical** to a previous request, those N tokens are billed at cache price (~1/10 to 1/50).

Key constraint: **Exact byte matching, not semantic matching.** One extra space, newline, or different JSON key order causes a cache miss.

## Round 1: Research

Searching GitHub, DeepSeek docs, and open-source proxy implementations, I found Reasonix — a DeepSeek-native Agent framework claiming 85-99% cache rates.

Reasonix's core architecture is the **"Byte-Stable Prompt Prefix"**, dividing the prompt into three zones:

```
┌──────────────────────────────────────┐
│ Immutable Prefix                     │ ← Frozen at session start
│   system + tools + few-shots         │   This is the cache target
├──────────────────────────────────────┤
│ Append-Only Log                      │ ← Monotonically growing
│   [user₁][assistant₁][tool₁]...      │   History never modified
├──────────────────────────────────────┤
│ Volatile Scratch                     │ ← Reset each round
│   R1 thinking, temp state            │   Not sent to API
└──────────────────────────────────────┘
```

Compared to this, my proxy's first version had clear issues:

1. **`reasoning_content` instability** — sourced from multiple places, getting different values across rounds
2. **Tool definition key order unpredictability** — `JSON.stringify` doesn't guarantee key order
3. **Trailing whitespace inconsistency** — tool output parsed/stringified multiple times

## Rounds 1-4 Fixes

| Round | Fix | Cache Rate Change |
|-------|-----|-------------------|
| 1 | `role: "user"` → `"system"`, removed `[System Instructions]` prefix | 94% in test env |
| 2 | Removed `reasoningCache.get(content)` fallback | — |
| 3 | Removed `inToolContext` injection | — |
| 4 | Deterministic tool definition key order | 95-97% in controlled test |

But running real Codex tasks revealed **56.7%** — 59 requests, 1.6M tokens.

Session steady-state did hit 94-99%, but across sessions, Codex's `instructions` field content changed each time (MD5 hash alternating between two values), preventing ~7-9K tokens of system message from caching.

## Round 5: Broader Search + Implementation

### Six New Optimizations

**1. Recursive Parameter Key Sorting**

Not just outer key sorting — `parameters` object internals (`type, properties, required`) must be sorted too:

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

**2. Message Content Normalization**

- `\r\n` → `\n`
- Trim trailing whitespace per line
- 3+ consecutive blank lines → 2
- Trim overall trailing whitespace

**3. Parameter Precision Normalization**

`temperature=0.7` vs `temperature=0.70` can differ. Unified with `toFixed(2)`.

**4. Exact Request-Response Cache**

SHA-256 of full request body, 5-minute LRU cache for identical requests.

**5. Compaction Detection**

Log when Codex truncates conversation history to pinpoint cache reset events.

**6. Warm-up**

Auto-send a minimal request to DeepSeek 2 seconds after proxy start.

## Results

### Global Stats

| Metric | Before | After |
|--------|--------|-------|
| Total Requests | 59 | 90 |
| Total Prompt Tokens | ~1.6M | ~2.1M |
| **Overall Cache Rate** | **56.7%** | **76.0%** |
| Cost Multiple (vs no cache) | ~5.8× | ~3.2× |

### Session Steady-State

```
#89  prompt=18,559  cached=18,304  98.6%
#90  prompt=24,611  cached=22,656  92.1%
```

Single session average: **95-99%**, approaching Claude's 96%.

### Cross-Session

```
#21  prompt=23,710  cached=20,096  84.8%  ← New session, some cache
#22  prompt=24,338  cached=256     1.1%   ← Post-compaction
#23  prompt=24,899  cached=20,096  80.7%  ← Fast recovery
...
#28  prompt=25,614  cached=25,088  97.9%  ← Fully stable
```

Key finding: **Even when instructions change, tool definitions and message format stability let DeepSeek cache ~13K subsequent tokens.** This is "cache tail hit" — first 9K (system) miss, but next 13K hit, total ~58%.

## Core Insights

**1. Proxy-level ceiling.** The ultimate limitation isn't at the proxy but at the caller. Codex's `instructions` content alternates between two MD5 hashes — beyond proxy control. Reasonix achieves 99% because it's a purpose-built Agent framework with frozen system prompts and append-only history.

**2. Byte stability is all that matters.** Don't waste time on semantic caching or embedding matching. DeepSeek's KV cache is exact byte matching — focus on ensuring byte sequences don't change due to irrelevant factors.

**3. Optimizing cache = reducing costs.** 56% → 76% means costs nearly halved. At high token volumes, this directly hits the bill.

## Lessons Learned

- **Measure before optimizing**: Without a `/stats` endpoint, I was guessing cache rates from logs
- **Controlled tests are unreliable**: 95% in manual testing, 57% in real usage — must run real tasks
- **Research others' solutions**: Reasonix's "byte-stable prefix" directly pointed to the core principle
