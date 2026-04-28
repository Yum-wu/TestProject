# Markdown Notes - 任务分解文档

## 项目概述

基于 React + TypeScript + Vite 的 Markdown 笔记应用，实现左右分栏编辑预览、数据本地持久化、代码语法高亮功能。

---

## 任务列表

### 阶段一：项目初始化

| 任务ID | 任务名称 | 详细描述 | 依赖 | 状态 |
|--------|---------|---------|------|------|
| T1.1 | 初始化 Vite 项目 | 使用 `npm create vite@latest` 创建 React + TypeScript 项目 | - | ✅ 完成 |
| T1.2 | 安装项目依赖 | 安装 react-markdown、remark-gfm、react-syntax-highlighter、tailwindcss、postcss、autoprefixer、lucide-react、react、react-dom | T1.1 | ✅ 完成 |
| T1.3 | 配置 Tailwind CSS | 创建 tailwind.config.js，配置 content 路径，添加 @tailwind 指令到 index.css，使用 @tailwindcss/postcss | T1.2 | ✅ 完成 |

### 阶段二：类型定义与工具函数

| 任务ID | 任务名称 | 详细描述 | 依赖 | 状态 |
|--------|---------|---------|------|------|
| T2.1 | 定义 Note 类型 | 在 `src/types/index.ts` 中定义 Note 接口 | - | ✅ 完成 |
| T2.2 | 实现 LocalStorage 工具 | 在 `src/utils/storage.ts` 中实现 loadNotes() 和 saveNotes() 函数 | T2.1 | ✅ 完成 |

### 阶段三：组件开发

| 任务ID | 任务名称 | 详细描述 | 依赖 | 状态 |
|--------|---------|---------|------|------|
| T3.1 | 开发 Sidebar 组件 | 实现搜索框、新建按钮、笔记列表、删除功能 | T2.2 | ✅ 完成 |
| T3.2 | 开发 Editor 组件 | 实现 textarea 编辑器，onChange 更新内容 | T2.1 | ✅ 完成 |
| T3.3 | 开发 Preview 组件 | 实现 react-markdown 渲染，集成 react-syntax-highlighter 代码高亮 | T3.2 | ✅ 完成 |

### 阶段四：主应用集成

| 任务ID | 任务名称 | 详细描述 | 依赖 | 状态 |
|--------|---------|---------|------|------|
| T4.1 | 开发 App 主布局 | 实现左右分栏布局，整合 Sidebar、Editor、Preview 组件 | T3.3 | ✅ 完成 |
| T4.2 | 实现状态管理 | 使用 useState/useEffect 管理笔记数据，实现自动保存 | T4.1 | ✅ 完成 |
| T4.3 | 集成 LocalStorage | 应用启动时加载笔记，状态变更时保存 | T4.2 | ✅ 完成 |

### 阶段五：测试与验证

| 任务ID | 任务名称 | 详细描述 | 依赖 | 状态 |
|--------|---------|---------|------|------|
| T5.1 | 运行开发服务器 | 执行 `npm run dev`，验证应用启动 | T4.3 | ✅ 完成 |
| T5.2 | 功能测试 | 测试新建、编辑、删除、搜索、预览、代码高亮功能 | T5.1 | ⏳ 待验证 |
| T5.3 | 数据持久化测试 | 刷新页面，验证数据不丢失 | T5.2 | ⏳ 待验证 |
| T5.4 | 构建验证 | 执行 `npm run build`，验证生产构建 | T5.3 | ✅ 完成 |

---

## 验收检查清单

### 功能检查

- [ ] 新建笔记按钮点击后创建空白笔记
- [ ] 编辑内容时预览实时更新
- [ ] 点击列表项切换笔记
- [ ] 搜索框输入后列表实时过滤
- [ ] 删除笔记前有确认提示
- [ ] 删除后笔记从列表移除
- [ ] 代码块有语法高亮 (oneDark 主题)
- [ ] 支持 GFM 语法 (表格、删除线、任务列表)

### 样式检查

- [ ] 左右分栏比例正确
- [ ] 按钮有 hover 效果
- [ ] 输入框有 focus 状态
- [ ] 列表项选中高亮
- [ ] 代码块有背景色和 padding
- [ ] 响应式布局正常

### 数据检查

- [ ] 启动时从 LocalStorage 加载笔记
- [ ] 编辑后自动保存
- [ ] 刷新页面数据保留
- [ ] 数据格式正确

### 构建检查

- [x] `npm run dev` 启动成功
- [x] `npm run build` 构建成功
- [x] 无 TypeScript 类型错误
- [x] 无 console 错误
