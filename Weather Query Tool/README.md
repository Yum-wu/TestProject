# Weather Query Tool

一个基于面向对象编程思想的天气查询工具，提供简洁、高效的天气信息查询功能。

## 项目概述

Weather Query Tool 是一个使用面向对象编程思想设计的天气查询应用，支持通过城市名称查询实时天气信息、天气预报和天气趋势分析。该工具采用模块化设计，具有良好的扩展性和可维护性。

## 功能特性

- **实时天气查询**：通过城市名称获取当前天气信息
- **天气预报**：获取未来几天的天气预报
- **天气趋势分析**：分析并展示天气变化趋势
- **多数据源支持**：可配置不同的天气API数据源
- **数据缓存**：缓存查询结果，提高查询效率
- **异常处理**：完善的错误处理机制
- **日志记录**：详细的操作日志

## 技术栈

- **编程语言**：Python 3.8+
- **外部依赖**：
  - requests - 用于HTTP请求
  - python-dotenv - 用于环境变量管理
  - matplotlib - 用于数据可视化
- **设计模式**：
  - 工厂模式 - 用于创建不同的天气API客户端
  - 策略模式 - 用于不同的天气数据处理策略
  - 单例模式 - 用于全局配置管理

## 项目结构

```
Weather Query Tool/
├── src/
│   ├── __init__.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── weather_client.py      # 天气API客户端基类
│   │   ├── openweather_client.py  # OpenWeather API实现
│   │   ├── weather_data.py        # 天气数据模型
│   │   └── weather_service.py     # 天气服务核心类
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── cache.py               # 缓存工具
│   │   ├── logger.py              # 日志工具
│   │   └── config.py              # 配置管理
│   └── ui/
│       ├── __init__.py
│       ├── cli.py                 # 命令行界面
│       └── gui.py                 # 图形化界面
├── tests/
│   ├── __init__.py
│   ├── test_weather_client.py
│   ├── test_weather_service.py
│   └── test_utils.py
├── config/
│   └── config.env                 # 配置文件
├── main.py                        # 主入口
├── requirements.txt               # 依赖文件
└── README.md                      # 项目说明
```

## 面向对象设计说明

### 核心类设计

1. **WeatherClient (抽象基类)**
   - 定义天气API客户端的通用接口
   - 子类：OpenWeatherClient, WeatherBitClient等

2. **WeatherData (数据模型)**
   - 封装天气数据的结构
   - 提供数据访问和转换方法

3. **WeatherService (核心服务)**
   - 协调各组件工作
   - 提供统一的天气查询接口

4. **CacheManager (缓存管理)**
   - 管理查询结果缓存
   - 提高查询效率

5. **ConfigManager (配置管理)**
   - 管理应用配置
   - 支持环境变量配置

### 设计原则

- **单一职责原则**：每个类只负责一个功能
- **开放封闭原则**：对扩展开放，对修改封闭
- **依赖倒置原则**：依赖抽象而非具体实现
- **接口隔离原则**：使用多个专门的接口而非单一的总接口

## 安装和使用

### 安装依赖

```bash
pip install -r requirements.txt
```

### 配置API密钥

在 `config/config.env` 文件中配置天气API密钥：

```env
# OpenWeather API密钥
OPENWEATHER_API_KEY=your_api_key_here

# 缓存设置
CACHE_TIMEOUT=3600  # 缓存超时时间（秒）

# 日志设置
LOG_LEVEL=INFO
```

### 命令行使用

```bash
# 查询实时天气
python main.py --city "Beijing"

# 查询天气预报
python main.py --city "Shanghai" --forecast

# 查询天气趋势
python main.py --city "Guangzhou" --trend
```

### 图形化界面

```bash
python main.py --gui
```

## 示例代码

### 基本使用

```python
from src.core.weather_service import WeatherService

# 创建天气服务实例
weather_service = WeatherService()

# 查询实时天气
weather = weather_service.get_current_weather("Beijing")
print(f"北京当前天气: {weather.temperature}°C, {weather.description}")

# 查询天气预报
forecast = weather_service.get_forecast("Shanghai", days=5)
for day in forecast:
    print(f"{day.date}: {day.temperature}°C, {day.description}")
```

### 自定义API客户端

```python
from src.core.weather_client import WeatherClient
from src.core.weather_service import WeatherService

class CustomWeatherClient(WeatherClient):
    def get_current_weather(self, city):
        # 实现自定义API调用逻辑
        pass
    
    def get_forecast(self, city, days=5):
        # 实现自定义API调用逻辑
        pass

# 使用自定义客户端
weather_service = WeatherService(client=CustomWeatherClient())
weather = weather_service.get_current_weather("Hangzhou")
```

## 测试

运行测试套件：

```bash
python -m pytest tests/
```

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 联系方式

- 项目维护者：Your Name
- 邮箱：your.email@example.com
- GitHub：[yourusername/weather-query-tool](https://github.com/yourusername/weather-query-tool)