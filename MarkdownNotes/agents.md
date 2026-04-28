# Project: Markdown Note App

## 项目概述
构建一个完整的 Markdown 笔记应用，用户可创建、编辑、删除笔记。界面采用左右分栏布局，左侧为笔记列表 + 编辑器，右侧实时预览 Markdown 渲染效果。所有数据持久化在浏览器 LocalStorage 中。

## 核心功能
- **笔记列表**：左侧栏展示所有笔记标题，点击可切换编辑的笔记。
- **搜索过滤**：列表上方提供搜索框，按标题实时过滤笔记。
- **新建笔记**：按钮创建空笔记，自动聚焦标题或内容。
- **编辑器**：左侧主区域使用 `<textarea>` 输入 Markdown 原始内容。
- **实时预览**：右侧使用 `react-markdown` 渲染，支持 GFM（表格、删除线等）。
- **代码高亮**：预览中的代码块通过 `react-syntax-highlighter` 实现语法高亮，选择 `oneDark` 主题。
- **删除笔记**：每条笔记提供删除按钮，需二次确认。
- **数据持久化**：使用 LocalStorage 保存笔记数据，应用启动时自动加载。

## 技术栈（必须严格遵守）
- 前端框架：React 18+ with TypeScript
- 构建工具：Vite
- 样式方案：Tailwind CSS（使用 `@tailwindcss/postcss`）
- Markdown 渲染：`react-markdown`（支持 `remark-gfm` 插件以解析表格、任务列表等）
- 代码高亮：`react-syntax-highlighter`，使用 `oneDark` 主题
- 状态管理：React 内置 `useState` + `useEffect`（无需引入额外库）
- 持久化：`localStorage` API
- 图标：`lucide-react`

## 文件结构
```
src/
├── components/
│   ├── Sidebar.tsx      # 笔记列表、搜索框、新建/删除操作
│   ├── Editor.tsx       # 文本输入区
│   └── Preview.tsx     # Markdown 渲染区
├── types/
│   └── index.ts         # Note 类型定义
├── utils/
│   └── storage.ts       # LocalStorage 读写逻辑
├── App.tsx              # 主布局（左右分栏）
├── main.tsx             # 入口文件
└── style.css            # Tailwind 指令
```

## 数据类型
```typescript
// types/index.ts
export interface Note {
  id: string;          // 使用 crypto.randomUUID() 生成
  title: string;       // 笔记标题（第一行或单独字段）
  content: string;     // 完整 Markdown 内容
  createdAt: number;   // 时间戳
  updatedAt: number;   // 时间戳
}
```

## 界面布局与交互细节

- 整体使用 Flex 或 Grid 布局，左侧占 40% 或固定宽 400px，右侧自适应。
- 左侧栏从上到下依次是：
  - 搜索框（`<input type="text" placeholder="搜索笔记..."`）
  - "新建笔记"按钮（`+ 新建笔记`）
  - 笔记列表（垂直排列的卡片或行，显示 `note.title`，高亮当前选中笔记，右侧有删除图标按钮）
- 点击列表项时，将对应笔记对象传入 Editor 和 Preview。
- 编辑器：`<textarea>` 受控组件，value 为当前笔记的 `content`，onChange 更新状态并调用存储函数。
- 预览：将 `content` 传给 `react-markdown`，并通过 `components` 属性自定义代码块渲染。
- 删除确认：使用 `window.confirm()` 简单实现。
- 自动保存：每次编辑内容或标题时，立即将笔记存入 LocalStorage；新建笔记立即生成 ID 并保存。

## LocalStorage 工具函数

```typescript
// utils/storage.ts
const NOTES_KEY = 'markdown-notes';

export function loadNotes(): Note[] {
  const raw = localStorage.getItem(NOTES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveNotes(notes: Note[]): void {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}
```

- App 组件中使用 `useState<Note[]>` 管理笔记数组，初始化时调用 `loadNotes()`。
- 任何笔记数组变更后调用 `saveNotes(notes)`。

## 样式要求

- 使用 Tailwind CSS 类名，尽量不写内联样式或额外 CSS。
- 分栏采用 `flex`，左侧 `w-96`，右侧 `flex-1`。
- 输入框、按钮、列表项添加合适的圆角、阴影、hover 效果。
- 响应式：在小屏幕下可堆叠（如 `flex-col`），但不用特意复杂适配，主要针对桌面。
- 代码块预览区需确保语法高亮容器有合理的 padding 和滚动条（`overflow-auto`）。

## 其他约束

- 所有组件使用 TypeScript，Props 必须定义接口。
- 不要使用类组件，全用函数组件 + Hooks。
- 避免引入不必要的大型库，保持依赖精简。
- 确保 `react-syntax-highlighter` 的样式主题已正确导入，否则代码块没有颜色。
