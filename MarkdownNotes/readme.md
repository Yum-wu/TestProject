# Markdown Notes

一个简洁高效的 Markdown 笔记应用，支持实时预览和代码语法高亮。

## 功能特性

- **实时预览**: 左侧编辑，右侧即时查看渲染效果
- **代码高亮**: 代码块采用 oneDark 主题，专业美观
- **笔记管理**: 创建、编辑、删除笔记
- **搜索过滤**: 快速按标题搜索笔记
- **本地存储**: 数据保存在浏览器 LocalStorage，刷新不丢失
- **GFM 支持**: 支持表格、任务列表、删除线等 GitHub 扩展语法

## 技术栈

| 技术 | 说明 |
|------|------|
| React 19 | 前端框架 |
| TypeScript | 类型安全 |
| Vite 8 | 快速构建工具 |
| Tailwind CSS 4 | 样式方案 |
| react-markdown 9 | Markdown 渲染 |
| react-syntax-highlighter | 代码语法高亮 |

## 快速开始

### 环境要求

- Node.js 18+
- npm 9+

### 安装步骤

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev
```

打开浏览器访问 `http://localhost:5173`

### 构建生产版本

```bash
npm run build
```

构建产物输出到 `dist/` 目录。

## 项目结构

```
src/
├── components/
│   ├── Sidebar.tsx      # 笔记列表、搜索、新建、删除
│   ├── Editor.tsx       # Markdown 编辑器
│   └── Preview.tsx     # Markdown 预览
├── types/
│   └── index.ts         # 类型定义
├── utils/
│   └── storage.ts       # LocalStorage 操作
├── App.tsx              # 主布局
├── main.tsx             # 入口文件
└── style.css            # Tailwind 样式
```

## 使用说明

1. **新建笔记**: 点击左侧 "+ 新建笔记" 按钮
2. **编辑笔记**: 在左侧文本框输入 Markdown 内容
3. **切换笔记**: 点击列表中的笔记标题
4. **搜索笔记**: 在搜索框输入关键词
5. **删除笔记**: 点击笔记右侧的删除图标

## 数据存储

所有笔记数据存储在浏览器的 LocalStorage 中，Key 为 `markdown-notes`。数据格式为 JSON 数组。

```typescript
interface Note {
  id: string;          // 唯一标识
  title: string;       // 笔记标题
  content: string;     // Markdown 内容
  createdAt: number;   // 创建时间戳
  updatedAt: number;   // 更新时间戳
}
```

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT
