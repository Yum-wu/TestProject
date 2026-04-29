# 技术设计

## 技术栈

- React + TypeScript + Vite
- Tailwind CSS
- 智谱 AI API
- LocalStorage 存储对话历史
- react-markdown 渲染 Markdown

## 数据结构

- Message: role（user 或 assistant）、content（内容）、timestamp（时间戳）
- 对话历史存储在 LocalStorage 中

## API 调用

- 使用智谱 AI Chat Completions API
- 启用 stream 模式实现流式输出
- API Key 存储在环境变量中
