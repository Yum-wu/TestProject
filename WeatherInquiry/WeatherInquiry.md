# WeatherInquiry - 天气查询单页应用

## 项目简介

基于 React + TypeScript + Vite 构建的天气查询单页应用，使用 OpenWeatherMap API 获取实时天气数据。

## 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite
- **HTTP 客户端**: Axios
- **API**: OpenWeatherMap API (当前天气 + 5天预报)
- **状态管理**: React Hooks (useState, useEffect, useCallback)
- **持久化**: localStorage (城市收藏)

## 功能特性

1. **城市搜索** - 输入城市名称（支持中文）查询天气
2. **自动定位** - 基于浏览器 Geolocation API 自动获取当前位置天气
3. **天气展示** - 当前温度、体感温度、天气描述、湿度、风速
4. **5天预报** - 展示未来5天每日最高/最低温度和天气图标
5. **城市收藏** - 收藏常用城市，数据持久化到 localStorage
6. **错误处理** - 友好的中文错误提示，5秒自动消失
7. **加载状态** - 查询和定位过程中显示加载提示
8. **移动端适配** - 响应式布局，适配手机和桌面

## 项目结构

```
WeatherInquiry/
├── .env                          # 环境变量（API Key）
├── index.html                    # HTML 入口
├── package.json                  # 项目配置
├── tsconfig.json                 # TypeScript 配置
├── vite.config.ts                # Vite 配置
└── src/
    ├── main.tsx                  # 应用入口
    ├── App.tsx                   # 主组件（状态管理 + 组件整合）
    ├── App.css                   # 应用样式
    ├── index.css                 # 全局基础样式
    ├── api/
    │   └── weather.ts            # API 工具（接口定义 + 请求封装）
    └── components/
        ├── SearchBar.tsx         # 搜索栏组件
        ├── WeatherCard.tsx       # 天气展示组件
        └── Favorites.tsx         # 收藏功能组件
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 环境变量

在项目根目录的 `.env` 文件中配置：

```
VITE_WEATHER_API_KEY=你的API密钥
```

代码中通过 `import.meta.env.VITE_WEATHER_API_KEY` 读取，不会硬编码密钥。

## API 说明

- **基础 URL**: `https://api.openweathermap.org/data/2.5`
- **当前天气**: `/weather` - 支持城市名或经纬度查询
- **5天预报**: `/forecast` - 3小时间隔的5天预报数据
- **参数**: `units=metric`（摄氏度）、`lang=zh_cn`（中文）

## 错误处理

| 状态码 | 提示信息 |
|--------|----------|
| 401 | API Key 无效，请检查配置 |
| 404 | 城市未找到，请检查名称 |
| 其他 | 网络请求失败，请稍后重试 |
