# AI 语音识别应用（VoiceRecognition）

基于浏览器录音与智谱 AI 语音识别 API 的轻量级 Web 应用，支持录音、识别和历史记录管理。

## 功能特性

- **浏览器端录音** — 使用 MediaRecorder API 录制音频
- **AI 语音识别** — 调用智谱 AI 语音识别 API，支持中文识别
- **录音控制** — 最长 60 秒录音，实时倒计时显示
- **结果编辑** — 识别结果支持编辑和一键复制
- **历史记录** — 识别记录本地存储，支持查看和删除
- **状态反馈** — 录音按钮脉冲动画、加载动画、友好错误提示

## 技术栈

| 技术 | 用途 |
| :--- | :--- |
| HTML5 / CSS3 | 前端界面 |
| JavaScript (ES6+) | 核心逻辑 |
| MediaRecorder API | 浏览器录音 |
| 智谱 AI API | 语音识别 |
| Express | 后端代理服务 |
| LocalStorage | 数据持久化 |

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
API_KEY=你的智谱AI API密钥
```

### 启动服务

```bash
npm start
```

浏览器访问 `http://localhost:3000`

## 项目结构

```
VoiceRecognition/
├── public/              # 前端静态文件
│   ├── index.html       # 主页面
│   ├── style.css        # 样式（含动画）
│   └── app.js           # 核心逻辑（录音、识别、历史记录）
├── server.js            # Express 后端服务
├── package.json
└── .env                 # API 密钥配置
```

## 使用说明

1. 首次点击麦克风按钮时，授予浏览器麦克风权限
2. 点击录音按钮开始讲话，再次点击停止录音
3. 点击「识别」按钮上传音频至智谱 API
4. 识别结果可编辑、复制，自动存入历史记录
5. 底部可查看/删除历史记录

## 许可证

MIT
