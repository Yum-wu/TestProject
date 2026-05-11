import{r as e}from"./rolldown-runtime-CsWUnieo.js";import{u as t}from"./vendor-highlight-CBiRDIbP.js";import{r as n}from"./vendor-markdown-BduOVIqk.js";var r=e(t(),1),i=n(),a={default:`bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700`,primary:`bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-800`,secondary:`bg-secondary-50 dark:bg-secondary-950/30 text-secondary-600 dark:text-secondary-400 border-secondary-200 dark:border-secondary-800`,accent:`bg-accent-50 dark:bg-accent-950/30 text-accent-600 dark:text-accent-400 border-accent-200 dark:border-accent-800`,red:`bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800`,blue:`bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800`,purple:`bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800`,pink:`bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800`},o={sm:`px-2 py-0.5 text-2xs`,md:`px-2.5 py-1 text-xs`};function s({label:e,color:t=`default`,clickable:n=!1,onClick:r,removable:s=!1,onRemove:c,size:l=`md`,className:u=``}){return(0,i.jsxs)(n?`button`:`span`,{type:n?`button`:void 0,onClick:n?r:void 0,className:`
        inline-flex items-center gap-1 font-medium border rounded-full
        transition-all duration-200 whitespace-nowrap
        ${a[t]}
        ${o[l]}
        ${n?`cursor-pointer hover:shadow-sm hover:scale-105 active:scale-95`:``}
        ${u}
      `,children:[e,s&&(0,i.jsx)(`button`,{type:`button`,onClick:e=>{e.stopPropagation(),c?.()},className:`ml-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors`,"aria-label":`删除标签 ${e}`,children:(0,i.jsx)(`svg`,{className:`h-2.5 w-2.5`,fill:`none`,viewBox:`0 0 24 24`,stroke:`currentColor`,strokeWidth:3,children:(0,i.jsx)(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,d:`M6 18L18 6M6 6l12 12`})})})]})}var c=(0,r.memo)(s),l=Object.assign({"../content/posts/ai-writing-assistant.md":`---
title: "从零构建 AI 写作助手：流式输出与历史记录"
date: 2026-05-09
slug: ai-writing-assistant
tags: [AI, React, 流式输出, 前端]
category: 技术
excerpt: 分享 AI 写作助手和 AI Chatbot 两个项目的开发经验，重点介绍流式输出 SSE 和 Prompt 工程。
---

## 项目简介

我做了两个 AI 相关的小项目：

1. **AI Writing Assistant** — 智能写作助手，支持多种写作模式、文本优化、历史记录
2. **AI Chatbot** — 简洁的 AI 对话聊天界面

## 流式输出的实现

为了让 AI 回复更流畅，我使用了 Server-Sent Events (SSE) 实现流式输出：

\`\`\`typescript
function useStreaming() {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendRequest = async ({ messages, temperature, maxTokens }) => {
    setIsLoading(true);
    setContent("");

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, temperature, maxTokens }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      setContent((prev) => prev + chunk);
    }

    setIsLoading(false);
  };

  return { content, isLoading, sendRequest };
}
\`\`\`

## 写作模式设计

写作助手支持多种模式切换：

\`\`\`typescript
const WRITING_MODES = {
  general: {
    label: "通用写作",
    systemPrompt: "你是一个专业的写作助手...",
  },
  academic: {
    label: "学术论文",
    systemPrompt: "你是一个学术写作专家...",
  },
  creative: {
    label: "创意写作",
    systemPrompt: "你是一个创意写作导师...",
  },
  business: {
    label: "商务写作",
    systemPrompt: "你是一个商务写作专家...",
  },
};
\`\`\`

## 历史记录管理

写作助手还有完整的对话历史记录功能，用户可以在侧边栏查看、加载和删除历史记录。

\`\`\`typescript
function useHistory() {
  const [records, setRecords] = useState<Record[]>([]);

  const addRecord = (record: Record) => {
    setRecords((prev) => [record, ...prev]);
    localStorage.setItem("history", JSON.stringify([record, ...prev]));
  };
  // ...
}
\`\`\`

## Chatbot 的 Markdown 渲染

Chatbot 用 \`react-markdown\` 配合代码高亮，让 AI 回复更有可读性：

\`\`\`tsx
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{
    code({ className, children }) {
      const match = /language-(\\w+)/.exec(className || "");
      if (match) {
        return <SyntaxHighlighter language={match[1]}>{children}</SyntaxHighlighter>;
      }
      return <code>{children}</code>;
    },
  }}
>
  {response}
</ReactMarkdown>
\`\`\`

## 总结

这两个项目让我深入理解了 SSE 流式通信、Prompt 工程和前端状态管理。AI 应用的前端开发不仅仅是 UI，更是用户体验的关键环节。
`,"../content/posts/git-workflow.md":`---
title: "Git 工作流最佳实践"
date: 2026-05-08
slug: git-workflow-best-practices
tags: [Git, 工具, 工作流]
category: 技术
excerpt: 团队协作中常用的 Git 工作流模式，以及 commit 规范、分支管理的最佳实践。
---

## 为什么需要规范的工作流？

Git 是一个强大的工具，但如果没有规范的工作流程，很容易陷入混乱。

## 分支策略

### 主干开发 (Trunk-Based Development)

\`\`\`
main ───●───●───●──────────●───
         \\         / \\     /
          ●───●───●   ●───●
          feature-a    feature-b
\`\`\`

### 功能分支流程

\`\`\`bash
# 从 main 创建功能分支
git checkout -b feat/user-auth

# 开发过程中经常提交
git commit -m "feat: add login form"
git commit -m "feat: add JWT validation"

# 保持与 main 同步
git rebase main

# 合并回 main
git checkout main
git merge feat/user-auth
\`\`\`

## Commit 规范

推荐使用 Conventional Commits 规范：

\`\`\`
<type>(<scope>): <description>

[optional body]

[optional footer]
\`\`\`

### 类型说明

| 类型 | 说明 | 示例 |
|------|------|------|
| feat | 新功能 | \`feat: add user login\` |
| fix | Bug 修复 | \`fix: fix login redirect\` |
| refactor | 重构 | \`refactor: extract auth hook\` |
| docs | 文档 | \`docs: update README\` |
| chore | 杂项 | \`chore: update dependencies\` |

## Code Review 最佳实践

1. **PR 不要太大** — 200-300 行代码是比较合适的范围
2. **提供上下文** — 在 PR 描述中说明改动原因和测试方式
3. **及时 Review** — 尽量在 24 小时内完成
4. **关注逻辑而非风格** — 风格问题用 linter 自动化

## 总结

好的 Git 工作流应该像交通规则——在约束中保证效率。
`,"../content/posts/hello-world.md":`---
title: "Hello World — 我的博客开张了"
date: 2026-05-10
slug: hello-world
tags: [生活, 博客]
category: 随笔
excerpt: 这是我的个人博客的第一篇文章，记录一下搭建博客的心路历程。
---

# Hello World!

欢迎来到我的个人博客 🎉

这是我的第一篇文章。这个博客使用 **React** + **Vite** 构建，所有文章都以 Markdown 文件形式管理，通过 **Vercel** 部署，完全免费。

## 为什么写博客？

我一直觉得，写作是最好的学习方式。把学到的知识用自己的话写下来，不仅能加深理解，还能帮助到其他人。

> 教是最好的学。

## 博客技术栈

前端框架的选择上，我选择了：

- **React 19** — 最新的 React 版本
- **Vite 8** — 极速构建工具
- **TypeScript** — 类型安全
- **Tailwind CSS 4** — 原子化 CSS
- **React Router 7** — 前端路由
- **React Markdown** — Markdown 渲染
- **Giscus** — 基于 GitHub Discussions 的评论系统

## 文章管理

文章都以 Markdown 文件存储在仓库中，通过 Git 进行版本管理。这种方式的好处是：

1. **简单** — 不需要数据库，不需要后台
2 **版本控制** — 天然拥有所有文章的修改历史
3. **免费部署** — 完全零成本
4. **熟悉的编辑体验** — 用任何 Markdown 编辑器写作

## 未来计划

接下来我计划在这里分享：

- 前端开发的技术心得
- 开源项目的使用体验
- 个人成长的思考记录

如果你有什么想看的主题，欢迎在评论区告诉我！

*2026年5月10日*
`,"../content/posts/markdown-notes-app.md":`---
title: "Markdown 笔记应用：从编辑器到实时预览"
date: 2026-05-07
slug: markdown-notes-app
tags: [React, Markdown, TypeScript, 工具]
category: 技术
excerpt: 开发 Markdown 笔记应用的架构设计分享，包括三栏布局、防抖保存和实时预览的实现。
---

## 项目背景

MarkdownNotes 是一个简洁的 Markdown 笔记应用，采用经典的三栏布局：左侧笔记列表、中间编辑器、右侧实时预览。

## 三栏布局架构

\`\`\`
┌──────────┬──────────────────────────┬──────────────────┐
│  Sidebar │       Editor             │     Preview      │
│          │                          │                  │
│ 笔记列表  │   Markdown 编辑区        │  HTML 实时渲染    │
│ 搜索框   │                          │  导出/删除按钮    │
│ 新建按钮  │                          │                  │
└──────────┴──────────────────────────┴──────────────────┘
\`\`\`

三个区域共用一个状态，通过 props 传递数据。

## 防抖保存机制

为了防止每次按键都写入 localStorage，我使用了防抖（debounce）机制：

\`\`\`typescript
const handleContentChange = (content: string) => {
  const updatedNotes = notes.map((note) => {
    if (note.id === selectedNoteId) {
      const title = content.split("\\n")[0].replace(/^#+\\s*/, "").trim();
      return { ...note, content, title, updatedAt: Date.now() };
    }
    return note;
  });
  setNotes(updatedNotes);
  setSavedStatus("未保存");

  // 防抖：500ms 内没有新输入才保存
  clearTimeout(window.__saveTimer);
  window.__saveTimer = setTimeout(() => {
    saveNotes(updatedNotes);
    setSavedStatus("已保存");
  }, 500);
};
\`\`\`

### 为什么需要防抖？

localStorage 是同步操作，频繁写入会影响 UI 响应。通过防抖，只有在用户停止输入 500ms 后才写入，大大降低了 IO 频率。

## 标题自动提取

从笔记内容第一行自动提取标题：

\`\`\`
"# 我的笔记" → 标题: "我的笔记"
"## 学习笔记" → 标题: "学习笔记"
"普通文本" → 标题: "普通文本"
\`\`\`

## 导出功能

支持两种导出方式：

- **导出 Markdown** — 生成 \`.md\` 文件下载
- **导出 PDF** — 调用浏览器打印功能，用户可选择另存为 PDF

## 搜索过滤

在侧边栏中按关键词搜索笔记，过滤逻辑：

\`\`\`typescript
const filteredNotes = notes.filter(
  (note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
);
\`\`\`

## 总结

这个项目虽然功能简单，但涵盖了前端开发中常见的技术点：组件拆分、数据流设计、防抖优化、Markdown 渲染等，是一个很好的参考案例。
`,"../content/posts/react-performance-tips.md":`---
title: "React 性能优化实战技巧"
date: 2026-05-09
slug: react-performance-tips
tags: [React, 前端, 性能优化]
category: 技术
excerpt: 分享 React 应用性能优化的常用技巧，包括 memo、useMemo、useCallback 的正确使用方式。
---

## 前言

React 的性能优化是一个老生常谈的话题。本文结合实际项目经验，分享一些实用的优化技巧。

## 1. 使用 React.memo 避免不必要的重渲染

\`React.memo\` 是一个高阶组件，它对组件的 props 进行浅比较，如果 props 没有变化，就跳过重渲染。

\`\`\`tsx
import { memo } from "react";

const ExpensiveComponent = memo(function ExpensiveComponent({ data }: Props) {
  return <div>{/* 渲染逻辑 */}</div>;
});
\`\`\`

### 什么时候使用？

- 组件接收的 props 变化频率较低
- 组件的渲染成本较高（大量 DOM 节点、复杂计算）
- 组件在列表中多次使用

### 什么时候不使用？

- props 每次都会变化（如基础 UI 组件）
- 组件本身非常轻量
- 使用 memo 带来的比较开销超过渲染开销

## 2. useMemo 缓存计算结果

\`\`\`tsx
const sortedList = useMemo(() => {
  return list.sort((a, b) => a.name.localeCompare(b.name));
}, [list]);
\`\`\`

## 3. useCallback 稳定函数引用

\`\`\`tsx
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
\`\`\`

## 4. 代码分割

使用 \`React.lazy\` 和 \`Suspense\` 实现路由级别的代码分割：

\`\`\`tsx
const HomePage = lazy(() => import("./pages/HomePage"));
const PostDetailPage = lazy(() => import("./pages/PostDetailPage"));
\`\`\`

## 5. 虚拟列表

渲染大量列表数据时，使用虚拟列表只渲染可视区域内的元素。

## 总结

优化是一门平衡的艺术：过度优化和不优化一样有害。**先测量，再优化**。

| 技巧 | 适用场景 | 注意 |
|------|---------|------|
| memo | props 稳定的纯展示组件 | 避免滥用 |
| useMemo | 复杂计算 | 注意依赖数组 |
| useCallback | 回调函数传子组件 | 配合 memo 使用 |
| lazy | 路由/大组件 | 配合 Suspense |
| 虚拟列表 | 超长列表 | 使用 react-window |
`,"../content/posts/weather-app-api.md":`---
title: "天气查询应用的 API 集成与定位开发实战"
date: 2026-05-08
slug: weather-app-api-integration
tags: [React, API, 地理定位, TypeScript]
category: 技术
excerpt: 从我的天气查询项目总结第三方 API 集成、地理定位和多城市对比功能的实现经验。
---

## 项目概览

我的 [WeatherInquiry](https://github.com/Yum-wu/TestProject) 项目是一个天气查询应用，支持：
- 按城市名搜索天气
- 浏览器自动定位
- 7 天天气预报
- 空气质量指数 (AQI)
- 多城市对比

## 三层 API 调用设计

天气查询同时涉及三个 API 的并发调用：

\`\`\`typescript
const fetchWeather = async (location: LocationQuery) => {
  setLoading(true);
  try {
    // 并发请求天气和预报数据
    const [weatherData, forecastData] = await Promise.all([
      getCurrentWeather(location),
      getForecast(location),
    ]);
    setCurrentWeather(weatherData);
    setForecast(forecastData);

    // 可选：空气质量数据（可能失败，不影响主流程）
    try {
      const aqiData = await getAqi(
        weatherData.coord.lat,
        weatherData.coord.lon
      );
      setAqi(aqiData);
    } catch {
      setAqi(null); // 空气质量获取失败不影响使用
    }
  } catch (err) {
    setError("查询失败，请稍后重试");
  } finally {
    setLoading(false);
  }
};
\`\`\`

这里的关键设计是：**空气质量数据是可选增强功能**，即使获取失败也不影响核心的天气展示。

## 浏览器地理定位

利用浏览器 Geolocation API 实现自动定位：

\`\`\`typescript
const handleLocate = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      fetchWeather({ lat: latitude, lon: longitude });
    },
    (error) => {
      setError("无法获取位置，请手动搜索");
    }
  );
};
\`\`\`

## 多城市对比

用户可以将多个城市的天气信息放在一起对比，这个功能需要对每个城市分别请求，然后汇总展示。

## 项目架构

\`\`\`
WeatherInquiry/
├── api/               # API 请求层
│   └── weather.ts     # 天气 API 封装
├── components/
│   ├── WeatherCard.tsx  # 天气卡片
│   ├── SearchBar.tsx    # 搜索栏
│   ├── Favorites.tsx    # 收藏城市
│   └── CityCompare.tsx  # 多城市对比
└── App.tsx
\`\`\`

## 总结

这个项目虽然不大，但涉及了多个典型的 Web 开发场景：第三方 API 集成、并发请求管理、浏览器 API 调用、错误边界处理等，是一个很好的练手项目。
`,"../content/posts/wechat-miniprogram-ai-agent.md":`---
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

\`\`\`
Error: timeout
at Function.<anonymous> (WAServiceMainContext.js?t=wechat&v=3.15.2:1)
\`\`\`

**排查**：换真实 appid、真机调试都照样报错。查了半天发现是 **3.15.x 基础库的已知 bug**，和代码无关。

**解决**：开发者工具 → 详情 → 本地设置 → 调试基础库，降到 \`3.14.3\` 就消失了。

## 坑二：WXML 中 wx:key 的正确写法

**现象**：\`setData\` 成功更新了数据（控制台确认长度变了），但页面就是不渲染。

**原因**：\`wx:key="index"\` 会去查找 \`item.index\` 属性，消息对象里根本没有这个属性，导致虚拟 DOM diff 失败。

\`\`\`html
<!-- ❌ 错误 -->
<view wx:for="{{messages}}" wx:key="index">

<!-- ✅ 正确 -->
<view wx:for="{{messages}}" wx:for-index="idx" wx:key="idx">
\`\`\`

## 坑三：CLoudBase HTTP 服务路由配置

**现象**：云函数部署后 \`/stats\` 返回 404，但 \`/health\` 正常。

**原因**：CloudBase HTTP 访问服务需要手动配置路由。

**解决**：

\`\`\`bash
tcb service:create -p / -f openclaw-agent -e <envId>
\`\`\`

另外 \`cloudbaserc.json\` 的配置格式要求函数代码在 \`<functionRoot>/<函数名>/\` 子目录下，直接放根目录部署时会路径不匹配。

## 坑四：前后端数据格式不匹配

**现象**：销售记录列表一直是空的。

**排查**：后端返回 \`{ data: [...], pagination: {...} }\`，但 api.js 的通用请求函数自动提取了 \`res.data.data\`，前端再去取 \`result?.data\`，数组当然没有 \`.data\` 属性。

**解决**：单独写了 \`getSales\` 请求函数，返回完整结构 \`{ data, pagination }\`。

## 坑五：混元模型 Prompt 工程

**现象**：AI 不理解"删掉"、"改成"这些指令。

**原因**：系统提示词（System Prompt）中只定义了记账和查询动作。

**解决**：在提示词中动态加入当前用户角色（老板/销售员）：
- 老板可见 \`deleteSale\`、\`updateSale\` 操作
- 销售员只能新增和查询

另外把电池型号从固定 A/B/C 改成任意字符串，AI 可以理解"12V20A"、"电动车专用"等任意型号名。

## 坑六：wx.setStorageSync 不生效

**现象**：存了数据，读出来是 \`undefined\`。

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
`,"../content/posts/zustand-todo-app.md":`---
title: "React + Zustand 构建 Todo 应用的状态管理实践"
date: 2026-05-10
slug: zustand-todo-app
tags: [React, Zustand, 状态管理, TypeScript]
category: 技术
excerpt: 使用 Zustand 替代 Redux 进行 React 状态管理，从我的 Todo Manager 项目总结一些实践经验。
---

## 前言

我的 [Todo Manager](https://github.com/Yum-wu/TestProject/tree/main/todo-app) 项目是一个功能完整的待办事项管理应用，使用了 **Zustand** 作为状态管理方案。这篇文章分享一些实践心得。

## 为什么选择 Zustand？

在 Todo Manager 项目中，我选择 Zustand 而不是 Redux，主要看中以下几点：

### 极简的 API

\`\`\`typescript
import { create } from "zustand";

interface TodoStore {
  todos: Todo[];
  addTodo: (todo: Todo) => void;
  toggleTodo: (id: string) => void;
}

export const useTodoStore = create<TodoStore>((set) => ({
  todos: [],
  addTodo: (todo) => set((state) => ({ todos: [...state.todos, todo] })),
  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    })),
}));
\`\`\`

不需要 Provider、Reducer、Action Creator，一个 \`create\` 搞定。

### 类型安全

Zustand 配合 TypeScript 非常自然：

\`\`\`typescript
interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  category: "work" | "study" | "life" | "project";
  dueDate?: string;
}
\`\`\`

### 选择性订阅

组件可以只订阅需要的状态片段，避免不必要的重渲染：

\`\`\`typescript
function TaskItem({ id }: { id: string }) {
  // 只订阅这一个 task 的变化
  const task = useTodoStore((state) =>
    state.todos.find((t) => t.id === id)
  );
  const toggleTodo = useTodoStore((state) => state.toggleTodo);
  // ...
}
\`\`\`

## 项目功能亮点

除了基础的增删改查，Todo Manager 还有一些实用的功能：

### 分类筛选

按工作、学习、生活、项目四个分类快速筛选任务。

### 优先级标记

高（红色）、中（橙色）、低（绿色）三级优先级，一目了然。

### 统计概览

实时计算总任务数、待完成数、已完成数，用环形进度条展示完成率。

### 数据持久化

所有数据保存在 localStorage，刷新不丢失。使用防抖机制减少写入频率。

## 测试实践

项目还覆盖了单元测试和组件测试：

\`\`\`typescript
describe("TodoStore", () => {
  it("should add a todo", () => {
    const { getState, setState } = useTodoStore;
    // ...
  });
});
\`\`\`

## 总结

Zustand 用极简的 API 解决了 React 状态管理的核心问题，非常适合中小型项目。如果你想看完整代码，可以访问我的 GitHub 仓库。
`});function u(e){let t={},n=0;if(e.startsWith(`---
`)){let r=e.indexOf(`
---
`,4);if(r!==-1){let i=e.slice(4,r);n=r+5,i.split(`
`).forEach(e=>{let n=e.indexOf(`:`);if(n===-1)return;let r=e.slice(0,n).trim(),i=e.slice(n+1).trim();switch(i.startsWith(`[`)&&i.endsWith(`]`)&&(i=i.slice(1,-1).split(`,`).map(e=>e.trim().replace(/['"]/g,``)).join(`,`)),r){case`title`:t.title=i.replace(/^["']|["']$/g,``);break;case`date`:t.date=i.replace(/^["']|["']$/g,``);break;case`slug`:t.slug=i.replace(/^["']|["']$/g,``);break;case`tags`:t.tags=i.split(`,`).map(e=>e.trim().replace(/^["']|["']$/g,``)).filter(Boolean);break;case`category`:t.category=i.replace(/^["']|["']$/g,``);break;case`excerpt`:t.excerpt=i.replace(/^["']|["']$/g,``);break;case`cover`:t.cover=i.replace(/^["']|["']$/g,``);break;case`author`:t.author=i.replace(/^["']|["']$/g,``);break}})}}let r=e.slice(n).trim();return{title:t.title||`无标题`,date:t.date||`2026-01-01`,slug:t.slug||``,tags:t.tags||[],category:t.category||`未分类`,excerpt:t.excerpt||``,cover:t.cover,author:t.author||`Yum`,content:r}}function d(){return Object.values(l).map(u).filter(e=>e.slug).sort((e,t)=>new Date(t.date).getTime()-new Date(e.date).getTime())}function f(e){return d().find(t=>t.slug===e)}function p(){let e=new Set;return d().forEach(t=>e.add(t.category)),Array.from(e).sort()}function m(e){if(!e)return d();let t=e.toLowerCase();return d().filter(e=>e.title.toLowerCase().includes(t)||e.excerpt.toLowerCase().includes(t)||e.content.toLowerCase().includes(t)||e.tags.some(e=>e.toLowerCase().includes(t))||e.category.toLowerCase().includes(t))}function h(e){let t=(e.match(/[一-鿿]/g)||[]).length,n=e.replace(/[一-鿿]/g,``).split(/\s+/).length;return Math.max(1,Math.ceil((t+n)/500))}export{m as a,f as i,p as n,c as o,d as r,h as t};