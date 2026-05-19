# AI 图片生成器（AIImageGenerator）

基于 React 18 + Vite 构建的 AI 图片生成应用，通过文本描述生成图片，支持多种风格和尺寸。

## 功能特性

- **文本生成图片** — 输入描述文字，AI 自动生成对应图片
- **提示词优化** — AI 辅助优化你的描述，生成更精准的图片
- **多种风格** — 支持写实、动漫、油画、水彩、科幻、幻想、极简、复古 8 种风格
- **多种尺寸** — 支持 1024x1024、1024x1792、1792x1024 等尺寸
- **历史记录** — 保存每次生成的记录，支持查看和复用

## 技术栈

| 技术 | 用途 |
| :--- | :--- |
| React 18 | 前端框架 |
| JavaScript | 开发语言 |
| Vite 5 | 构建工具 |
| Tailwind CSS 3 | 样式框架 |

## 快速开始

### 环境要求

- Node.js 18+
- npm 9+

### 安装

```bash
npm install
```

### 配置 API Key

在项目根目录创建 `.env` 文件：

```env
VITE_API_KEY=你的API密钥
```

### 开发

```bash
npm run dev
```

### 构建

```bash
npm run build
```

## 项目结构

```
AIImageGenerator/
├── public/
├── src/
│   ├── components/          # React 组件
│   │   ├── Header.tsx       # 顶部标题
│   │   ├── InputArea.tsx    # 提示词输入区
│   │   ├── ParameterPanel.tsx # 尺寸/风格参数面板
│   │   ├── ButtonPanel.tsx  # 操作按钮
│   │   ├── ImageDisplay.tsx # 图片展示
│   │   ├── LoadingAnimation.tsx # 加载动画
│   │   └── HistorySidebar.tsx # 历史记录侧边栏
│   ├── hooks/               # 自定义 Hooks
│   │   ├── useImageGeneration.ts
│   │   └── useHistory.ts
│   ├── utils/               # 工具函数
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
└── vite.config.js
```

## 许可证

MIT
