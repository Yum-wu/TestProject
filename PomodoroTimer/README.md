# 番茄钟（PomodoroTimer）

基于 React 18 + TypeScript + Vite 构建的番茄工作法计时器，帮助专注工作、管理时间。

## 功能特性

- **番茄计时** — 标准 25 分钟工作 / 5 分钟休息循环
- **自定义设置** — 可自由调整工作和休息时长
- **统计概览** — 记录完成的番茄数量和总工作时长
- **通知提醒** — 浏览器通知 + 提示音，到点提醒
- **本地持久化** — 设置和统计数据保存在 LocalStorage
- **响应式设计** — 适配桌面端和移动端

## 技术栈

| 技术 | 用途 |
| :--- | :--- |
| React 18 | 前端框架 |
| TypeScript | 类型安全 |
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
PomodoroTimer/
├── public/
├── src/
│   ├── components/
│   │   ├── Timer/
│   │   │   ├── TimerDisplay.tsx    # 计时器显示
│   │   │   ├── TimerControls.tsx   # 开始/暂停/重置
│   │   │   ├── TimerSettings.tsx   # 时长设置
│   │   │   └── TimerAlert.tsx      # 到点提醒弹窗
│   │   └── Stats/
│   │       └── StatsPanel.tsx      # 统计面板
│   ├── hooks/
│   │   ├── useTimer.ts            # 计时逻辑
│   │   ├── useLocalStorage.ts     # 本地存储
│   │   └── useNotification.ts     # 浏览器通知
│   ├── types/
│   │   └── index.ts               # 类型定义
│   ├── utils/
│   │   ├── audio.ts               # 提示音
│   │   └── time.ts                # 时间工具
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── test/                           # 测试文件
├── package.json
└── vite.config.js
```

## 许可证

MIT
