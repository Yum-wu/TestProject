# 天气查询（WeatherInquiry）

一个基于 React 19 + TypeScript + Vite 构建的轻量级天气查询单页应用，提供实时天气、空气质量、天气预报、天气预警、多城市对比和城市收藏功能。

## 功能特性

- **实时天气查询** — 输入城市名称或点击自动定位，获取当前天气数据
- **空气质量监测** — 显示 AQI 指数、等级及 PM2.5、PM10、O₃、NO₂ 等关键指标
- **5 天天气预报** — 展示未来 5 天的温度范围和天气状况
- **智能天气预警** — 自动检测高温、严寒、大风、大雾、雷暴等极端天气并分级提示
- **多城市对比** — 同时对比最多 6 个城市的天气数据
- **城市收藏** — 收藏常用城市，一键快速查询（localStorage 持久化）
- **天气动画图标** — 根据天气类型展示不同的动态图标效果
- **网络容错** — 请求超时自动重试，最多 3 次尝试，确保网络波动时的可用性

## 技术栈

- **React 19** — 前端 UI 框架
- **TypeScript 6** — 静态类型检查
- **Vite 8** — 构建工具和开发服务器
- **原生 Fetch API** — 网络请求（无第三方依赖）
- **CSS3 动画** — 天气图标动画和交互效果
- **OpenWeatherMap API** — 天气数据源

## 快速开始

### 环境要求

- Node.js 18 或更高版本
- npm 或 pnpm 或 yarn

### 安装依赖

```bash
npm install
```

### 配置 API Key

在项目根目录创建 `.env` 文件，填入 OpenWeatherMap API 密钥：

```env
VITE_WEATHER_API_KEY=你的API密钥
```

> 获取密钥：访问 [OpenWeatherMap](https://openweathermap.org/api) 注册并创建 API Key。

### 启动开发服务器

```bash
npm run dev
```

浏览器访问 http://localhost:5173/ 即可使用。

### 构建生产版本

```bash
npm run build
```

构建产物位于 `dist/` 目录。

### 预览生产构建

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

## 项目结构

```
WeatherInquiry/
├── public/
│   ├── favicon.svg              # 网站图标
│   └── icons.svg                # 图标资源
├── src/
│   ├── api/
│   │   └── weather.ts           # API 调用层：类型定义、请求工具、数据转换
│   ├── components/
│   │   ├── SearchBar.tsx        # 搜索栏组件
│   │   ├── WeatherCard.tsx      # 天气卡片：当前天气、AQI、5天预报
│   │   ├── WeatherAlert.tsx     # 天气预警组件
│   │   ├── CityCompare.tsx      # 多城市对比组件
│   │   ├── Favorites.tsx        # 城市收藏组件
│   │   └── Spinner.tsx          # 加载动画组件
│   ├── App.tsx                  # 主应用组件
│   ├── App.css                  # 组件样式（含动画）
│   ├── index.css                # 全局样式和 CSS 变量
│   └── main.tsx                 # 应用入口
├── .env                         # 环境变量（API 密钥）
├── vite.config.ts               # Vite 配置（代理、插件）
├── eslint.config.js             # ESLint 配置
├── tsconfig.json                # TypeScript 配置
└── package.json                 # 项目依赖
```

## 开发说明

### 代理配置

开发模式下，Vite 会将 `/api/openweather` 开头的请求代理到 `https://api.openweathermap.org`，并在服务端自动注入 API Key。这样做有两个好处：

1. 避免浏览器跨域限制
2. API Key 不在浏览器请求中暴露，提高安全性

### 网络容错

- 请求超时：25 秒
- 自动重试：最多 2 次重试（共 3 次请求）
- 重试间隔：2 秒
- 使用 `AbortController` 实现精确超时控制

### 环境差异

| 配置项       | 开发环境                       | 生产环境                        |
| ------------ | ------------------------------ | ------------------------------- |
| API 地址     | Vite 代理 `/api/openweather` | 直连 `api.openweathermap.org` |
| API Key 注入 | 代理服务端自动注入             | 前端请求参数携带                |

## 可用脚本

| 命令                | 说明                                        |
| ------------------- | ------------------------------------------- |
| `npm run dev`     | 启动开发服务器（热更新）                    |
| `npm run build`   | 构建生产版本（TypeScript 编译 + Vite 打包） |
| `npm run lint`    | 运行 ESLint 检查                            |
| `npm run preview` | 预览生产构建                                |

## 浏览器兼容性

- Chrome（最新版本）
- Firefox（最新版本）
- Edge（最新版本）
- Safari（最新版本）
- 移动端浏览器（iOS Safari、Chrome for Android）

## 许可

本项目仅供学习和个人使用。天气数据由 OpenWeatherMap 提供。
