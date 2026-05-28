---
title: "WeChat Mini Program + AI Agent: Battery Sales Assistant Pitfalls"
date: 2026-05-11
slug: wechat-miniprogram-ai-agent
tags: [WeChat Mini Program, AI, CloudBase, Frontend]
category: Technology
excerpt: Building an AI sales assistant with WeChat Mini Program + Tencent CloudBase + Hunyuan LLM, documenting the pitfalls and solutions encountered.
lang: en
---

## Background

I recently built a "Battery Sales Assistant" using WeChat Mini Program + Tencent CloudBase + Hunyuan LLM, helping battery salespeople quickly record transactions and auto-calculate commissions. The process had plenty of pitfalls worth documenting.

## Pitfall 1: WeChat DevTools Base Library 3.15.2 Timeout

**Symptom**: App crashes on launch with:

```
Error: timeout
at Function.<anonymous> (WAServiceMainContext.js?t=wechat&v=3.15.2:1)
```

**Root Cause**: Known bug in the 3.15.x base library, unrelated to code.

**Fix**: DevTools → Details → Local Settings → Debug Base Library, downgrade to `3.14.3`.

## Pitfall 2: wx:key Syntax in WXML

**Symptom**: `setData` successfully updates data (confirmed in console), but the page doesn't re-render.

**Cause**: `wx:key="index"` tries to find `item.index` property — the message object doesn't have it, breaking virtual DOM diffing.

```html
<!-- ❌ Wrong -->
<view wx:for="{{messages}}" wx:key="index">

<!-- ✅ Correct -->
<view wx:for="{{messages}}" wx:for-index="idx" wx:key="idx">
```

## Pitfall 3: CloudBase HTTP Service Route Configuration

**Symptom**: Cloud function `/stats` returns 404, but `/health` works fine.

**Cause**: CloudBase HTTP access service requires manual route configuration.

**Fix**:

```bash
tcb service:create -p / -f openclaw-agent -e <envId>
```

Also, `cloudbaserc.json` requires function code in the `<functionRoot>/<functionName>/` subdirectory.

## Pitfall 4: Data Format Mismatch

**Symptom**: Sales record list is always empty.

**Root Cause**: Backend returns `{ data: [...], pagination: {...} }`, but the generic API request function auto-extracts `res.data.data`. The frontend then accesses `result?.data`, which doesn't exist on an array.

**Fix**: Write a dedicated `getSales` function returning the full structure `{ data, pagination }`.

## Pitfall 5: LLM Prompt Engineering

**Symptom**: AI doesn't understand commands like "delete" or "change".

**Cause**: System prompt only defined recording and query actions.

**Fix**: Dynamically add user role context (boss/salesperson):
- Boss sees `deleteSale`, `updateSale` operations
- Salesperson can only add and query

Also switched battery models from fixed A/B/C to arbitrary strings, so AI can understand any model name.

## Pitfall 6: wx.setStorageSync Not Working

**Symptom**: Data stored, but reading returns `undefined`.

**Cause**: Bug in some DevTools versions — sync storage may not work.

**Workaround**: Use console logs to get openid directly, bypassing cache checks.

## Summary

| Pitfall | Root Cause | Difficulty |
|---------|------------|------------|
| Base library timeout | 3.15.x bug | ⭐ Downgrade |
| wx:key not rendering | API misuse | ⭐⭐ Check docs |
| HTTP route 404 | Missing configuration | ⭐ Configure routes |
| Data format mismatch | Frontend/backend inconsistency | ⭐⭐ Standardize format |
| Prompt engineering | Incomplete action definitions | ⭐⭐⭐ Iterate |
| Storage bug | Tool bug | ⭐ Bypass with logs |

Biggest lesson: **In WeChat Mini Program development, framework pitfalls outnumber business logic pitfalls.** Fortunately, the community is active and solutions are findable.
