---
title: "微信小程序 + AI Agent 实战：电池销售助手的踩坑记录"
date: 2026-05-11
slug: wechat-miniprogram-ai-agent
tags: [微信小程序, AI, CloudBase, 前端]
category: 技术
excerpt: 用微信小程序 + 腾讯云开发 CloudBase + 混元大模型做了一个 AI 销售助手，记录开发中遇到的坑和解决方案。
---

## 背景

最近用微信小程序 + 腾讯云开发 CloudBase + 混元大模型做了一个「电池销售助手」，帮助电池销售人员通过自然语言快速记账、自动算提成。整个过程中遇到了不少坑，写下来做个记录。

## 坑一：微信开发者工具基础库 3.15.2 的 timeout 问题

**现象**：启动小程序必报错：

```
Error: timeout
at Function.<anonymous> (WAServiceMainContext.js?t=wechat&v=3.15.2:1)
```

**排查**：换真实 appid、真机调试都照样报错。查了半天发现是 **3.15.x 基础库的已知 bug**，和代码无关。

**解决**：开发者工具 → 详情 → 本地设置 → 调试基础库，降到 `3.14.3` 就消失了。

## 坑二：WXML 中 wx:key 的正确写法

**现象**：`setData` 成功更新了数据（控制台确认长度变了），但页面就是不渲染。

**原因**：`wx:key="index"` 会去查找 `item.index` 属性，消息对象里根本没有这个属性，导致虚拟 DOM diff 失败。

```html
<!-- ❌ 错误 -->
<view wx:for="{{messages}}" wx:key="index">

<!-- ✅ 正确 -->
<view wx:for="{{messages}}" wx:for-index="idx" wx:key="idx">
```

## 坑三：CLoudBase HTTP 服务路由配置

**现象**：云函数部署后 `/stats` 返回 404，但 `/health` 正常。

**原因**：CloudBase HTTP 访问服务需要手动配置路由。

**解决**：

```bash
tcb service:create -p / -f openclaw-agent -e <envId>
```

另外 `cloudbaserc.json` 的配置格式要求函数代码在 `<functionRoot>/<函数名>/` 子目录下，直接放根目录部署时会路径不匹配。

## 坑四：前后端数据格式不匹配

**现象**：销售记录列表一直是空的。

**排查**：后端返回 `{ data: [...], pagination: {...} }`，但 api.js 的通用请求函数自动提取了 `res.data.data`，前端再去取 `result?.data`，数组当然没有 `.data` 属性。

**解决**：单独写了 `getSales` 请求函数，返回完整结构 `{ data, pagination }`。

## 坑五：混元模型 Prompt 工程

**现象**：AI 不理解"删掉"、"改成"这些指令。

**原因**：系统提示词（System Prompt）中只定义了记账和查询动作。

**解决**：在提示词中动态加入当前用户角色（老板/销售员）：
- 老板可见 `deleteSale`、`updateSale` 操作
- 销售员只能新增和查询

另外把电池型号从固定 A/B/C 改成任意字符串，AI 可以理解"12V20A"、"电动车专用"等任意型号名。

## 坑六：wx.setStorageSync 不生效

**现象**：存了数据，读出来是 `undefined`。

**原因**：部分版本的开发者工具有 bug，同步存储可能不生效。

**绕过**：改用控制台日志直接获取 openid，不走缓存判断。

## 总结

| 坑 | 根因 | 解决难度 |
|----|------|---------|
| 基础库 timeout | 3.15.x bug | ⭐ 降版本即可 |
| wx:key 不渲染 | API 误用 | ⭐⭐ 查文档 |
| HTTP 路由 404 | 配置遗漏 | ⭐ 配路由即可 |
| 数据格式不匹配 | 前后端约定不一致 | ⭐⭐ 统一接口格式 |
| Prompt 工程 | 动作定义不完整 | ⭐⭐⭐ 持续迭代 |
| Storage bug | 工具 bug | ⭐ 日志绕过 |

最大的体会：**微信小程序开发中，框架本身的坑比业务逻辑的坑多得多**。好在社区活跃，遇到问题基本都能搜到解决方案。
