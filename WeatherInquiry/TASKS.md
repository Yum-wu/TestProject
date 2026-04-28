# 天气查询 — 任务分解（TASKS）

## 阶段一：项目搭建与环境配置

### T-001 项目初始化
- [x] 使用 Vite 创建 React + TypeScript 项目
- [x] 配置项目目录结构
- [x] 安装必要依赖（react、react-dom、typescript、vite）
- [x] 配置 TypeScript 编译选项
- [x] 配置 ESLint 代码规范

### T-002 环境变量配置
- [x] 创建 `.env` 文件模板
- [x] 配置 `VITE_WEATHER_API_KEY` 环境变量
- [x] 在 `vite.config.ts` 中读取环境变量

### T-003 开发代理配置
- [x] 配置 Vite 代理 `/api/openweather` → `https://api.openweathermap.org`
- [x] 实现路径重写（rewrite），自动去除代理前缀
- [x] 在代理层自动注入 `appid` 参数，保护 API Key 安全

---

## 阶段二：API 层开发

### T-010 类型定义
- [x] 定义 `WeatherCondition` 接口（天气状况）
- [x] 定义 `CurrentWeather` 接口（当前天气）
- [x] 定义 `ForecastItem` 和 `ForecastResponse` 接口（预报数据）
- [x] 定义 `AqiData` 接口（空气质量）
- [x] 定义 `LocationQuery` 联合类型（城市名 | 经纬度）

### T-011 请求工具函数
- [x] 实现 `buildParams` — 构建 URL 查询参数
- [x] 实现 `buildUrl` — 拼接完整请求 URL
- [x] 实现 `buildCoordsUrl` — 构建空气质量接口 URL
- [x] 实现 `fetchWithRetry` — 带超时和重试的请求函数
  - [x] 超时控制（25 秒，AbortController）
  - [x] 自动重试（最多 2 次重试，间隔 2 秒）
  - [x] 每次重试创建新的 AbortController
- [x] 实现 `handleResponse` — 统一响应处理和错误分类
  - [x] 401 → API Key 无效提示
  - [x] 404 → 城市未找到提示
  - [x] 429 → 请求频繁提示

### T-012 业务接口函数
- [x] 实现 `getCurrentWeather` — 获取当前天气
- [x] 实现 `getForecast` — 获取 5 天预报
- [x] 实现 `getAqi` — 获取空气质量数据

### T-013 数据处理工具
- [x] 实现 `getAqiLevel` — AQI 等级映射（优/良/轻度/中度/重度）
- [x] 实现 `detectWeatherAlerts` — 天气预警检测
  - [x] 温度预警：高温（≥35℃）、严寒（≤-10℃）、低温（≤0℃）
  - [x] 风速预警：大风（≥10m/s、≥17m/s）
  - [x] 闷热预警：湿度 ≥90% 且温度 ≥25℃
  - [x] 能见度预警：大雾（<1000m）、雾霾（<5000m）
  - [x] 极端天气预警：雷暴、暴雨、大雪

---

## 阶段三：组件开发

### T-020 主应用组件（App）
- [x] 状态管理（currentWeather、forecast、aqi、loading、error）
- [x] 实现 `fetchWeather` — 并行请求天气和预报，再请求 AQI
- [x] 实现 `handleSearch` — 城市搜索回调
- [x] 实现 `handleLocate` — 浏览器地理定位
- [x] 错误提示自动消失（5 秒后）
- [x] 组装所有子组件

### T-021 搜索栏组件（SearchBar）
- [x] 输入框和搜索按钮
- [x] 回车键提交
- [x] 加载状态禁用
- [x] 自动聚焦

### T-022 天气卡片组件（WeatherCard）
- [x] 当前天气展示（城市、温度、描述、详情）
- [x] 天气图标动画（晴天、雨天、雪天、雷暴、雾天等）
- [x] 空气质量模块（AQI 等级、关键指标）
- [x] 5 天天气预报（日期、星期、天气、温度范围）
- [x] 使用 `useMemo` 优化数据计算

### T-023 天气预警组件（WeatherAlert）
- [x] 预警列表展示
- [x] 按严重程度显示不同颜色（红/橙/黄/蓝）
- [x] 无预警时不渲染

### T-024 多城市对比组件（CityCompare）
- [x] 手动输入添加城市
- [x] 预设城市快捷按钮
- [x] 对比表格（城市、温度、体感、天气、湿度、风速）
- [x] 最多 6 个城市限制
- [x] 防重复添加
- [x] 移除城市功能
- [x] 点击城市名跳转查看

### T-025 城市收藏组件（Favorites）
- [x] 收藏/取消收藏当前城市
- [x] localStorage 持久化存储
- [x] 收藏标签展示
- [x] 点击标签快速查询
- [x] 移除收藏功能
- [x] 按收藏时间排序

### T-026 加载动画组件（Spinner）
- [x] 旋转加载图标
- [x] 可自定义提示文字
- [x] CSS 旋转动画

---

## 阶段四：样式与交互

### T-030 全局样式
- [x] CSS 变量定义（主题色、字体色、边框色等）
- [x] 响应式布局（移动端适配）
- [x] 卡片阴影和圆角样式

### T-031 动画效果
- [x] `sunPulse` — 晴天图标脉冲动画
- [x] `rainBounce` — 雨天图标弹跳动画
- [x] `snowFloat` — 雪天图标漂浮动画
- [x] `thunderFlash` — 雷暴图标闪烁动画
- [x] `fogDrift` — 雾天图标飘移动画
- [x] `cloudDrift` — 多云图标飘移动画
- [x] `spin` — 加载旋转动画
- [x] `fadeIn` — 错误提示淡入动画

### T-032 响应式设计
- [x] 480px 以下屏幕适配
- [x] 对比表格横向滚动
- [x] 移动端间距和字号调整

---

## 阶段五：测试与优化

### T-040 代码检查
- [x] ESLint 通过（无错误）
- [x] TypeScript 编译通过（无类型错误）

### T-041 构建验证
- [x] 生产构建成功（`npm run build`）
- [x] 开发服务器正常运行

### T-042 功能测试
- [ ] 城市搜索功能测试（中文、英文、拼音）
- [ ] 自动定位功能测试
- [ ] 空气质量显示测试
- [ ] 天气预报显示测试
- [ ] 天气预警触发测试
- [ ] 多城市对比测试
- [ ] 城市收藏功能测试
- [ ] 网络重试机制测试
- [ ] 移动端适配测试

---

## 统计信息

| 类别 | 数量 |
|------|------|
| 总任务数 | 30 |
| 已完成 | 27 |
| 待测试 | 3（功能测试项） |
| 组件数 | 6 |
| API 接口数 | 3 |
| 预警类型数 | 8 |
| 动画类型数 | 8 |
