# 智能写作助手（AIWritingAssistant）

基于 React + Vite 构建的 AI 写作辅助应用，支持续写、改写、扩展、总结、邮件撰写和文案生成六种写作模式。

## 功能特性

- **6 种写作模式** — 续写、改写、扩展、总结、邮件撰写、文案生成
- **流式输出** — 生成内容实时流式显示，无需等待
- **提示词优化** — AI 帮你优化输入描述，获得更佳结果
- **创意度调节** — 可调整 temperature 控制输出创意程度（0.0~1.0）
- **输出长度控制** — 支持 short / medium / long / extended 四级长度
- **历史记录** — 保存生成历史，方便回顾

## 技术栈

| 技术 | 用途 |
| :--- | :--- |
| React | 前端框架 |
| JavaScript | 开发语言 |
| Vite | 构建工具 |
| Tailwind CSS | 样式框架 |

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
AIWritingAssistant/
├── public/
├── src/
├── PRD.md              # 产品需求文档
├── prompts.md          # AI 提示词模板
├── package.json
└── vite.config.js
```

## 使用说明

1. 在输入框中描述你的写作需求
2. 选择写作模式（续写/改写/扩展/总结/邮件/文案）
3. 调整创意度和输出长度参数
4. 点击「优化提示词」或直接「生成内容」
5. 实时查看生成结果，支持复制

## 许可证

MIT
