# Simple Web Spider

一个基于面向对象编程思想实现的简单网络爬虫项目，用于爬取网页内容并进行数据处理。

## 项目结构

```
Simple Web Spider/
├── src/
│   ├── core/
│   │   ├── __init__.py
│   │   ├── spider.py          # 核心爬虫类
│   │   ├── crawler.py         # 网页爬取实现
│   │   ├── parser.py          # 网页解析器
│   │   └── data_processor.py  # 数据处理器
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── http_client.py     # HTTP客户端
│   │   ├── logger.py          # 日志工具
│   │   └── utils.py           # 通用工具函数
│   └── __init__.py
├── tests/
│   ├── __init__.py
│   ├── test_spider.py
│   ├── test_parser.py
│   └── test_data_processor.py
├── main.py                    # 主入口
├── requirements.txt
└── README.md                  # 项目说明文档
```

## 核心类设计

### 1. Spider 类

**职责**：爬虫的核心控制类，负责协调整个爬取过程。

**主要方法**：
- `__init__(self, start_urls, max_depth=2)`：初始化爬虫，设置起始URL和最大爬取深度
- `crawl(self)`：开始爬取过程
- `add_url(self, url, depth)`：添加新的URL到爬取队列
- `process_page(self, url, content)`：处理爬取到的页面内容

### 2. Crawler 类

**职责**：负责具体的网页爬取操作。

**主要方法**：
- `__init__(self, timeout=10)`：初始化爬虫，设置超时时间
- `fetch(self, url)`：获取指定URL的内容
- `handle_response(self, response)`：处理HTTP响应

### 3. Parser 类

**职责**：负责解析网页内容，提取链接和数据。

**主要方法**：
- `__init__(self)`：初始化解析器
- `parse_links(self, content, base_url)`：从页面内容中提取链接
- `parse_data(self, content)`：从页面内容中提取数据

### 4. DataProcessor 类

**职责**：负责处理和存储爬取到的数据。

**主要方法**：
- `__init__(self, output_format='json')`：初始化数据处理器，设置输出格式
- `process(self, data)`：处理数据
- `save(self, data, filename)`：保存数据到文件

## 面向对象设计原则

1. **单一职责原则**：每个类只负责一个特定的功能
2. **开放-封闭原则**：类对扩展开放，对修改封闭
3. **依赖倒置原则**：依赖于抽象，而不是具体实现
4. **里氏替换原则**：子类可以替换父类而不影响程序运行
5. **接口隔离原则**：使用多个专门的接口，而不是一个统一的接口

## 安装和使用

### 安装依赖

```bash
pip install -r requirements.txt
```

### 基本使用

```python
from src.core.spider import Spider

# 创建爬虫实例
spider = Spider(start_urls=['https://example.com'], max_depth=2)

# 开始爬取
spider.crawl()
```

### 自定义配置

```python
from src.core.spider import Spider
from src.core.crawler import Crawler
from src.core.parser import Parser
from src.core.data_processor import DataProcessor

# 创建自定义组件
crawler = Crawler(timeout=15)
parser = Parser()
data_processor = DataProcessor(output_format='csv')

# 创建爬虫实例并注入自定义组件
spider = Spider(
    start_urls=['https://example.com'],
    max_depth=3,
    crawler=crawler,
    parser=parser,
    data_processor=data_processor
)

# 开始爬取
spider.crawl()
```

## 扩展功能

### 添加新的爬取策略

```python
from src.core.crawler import Crawler

class CustomCrawler(Crawler):
    def fetch(self, url):
        # 自定义爬取逻辑
        pass
```

### 添加新的解析器

```python
from src.core.parser import Parser

class CustomParser(Parser):
    def parse_data(self, content):
        # 自定义解析逻辑
        pass
```

## 测试

运行测试：

```bash
pytest tests/
```

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 许可证

MIT License

## 注意事项

- 请遵守网站的robots.txt规则
- 不要过度请求，以免给目标网站造成负担
- 仅用于学习和研究目的