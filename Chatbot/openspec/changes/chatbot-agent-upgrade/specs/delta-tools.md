# Delta: Tool Calling

**Change ID:** `chatbot-agent-upgrade`
**Affects:** `backend/app/tools/`

---

## ADDED

### Requirement: 工具注册与发现

所有工具通过 LangChain `@tool` 装饰器定义，Agent 自动发现并注入可用工具列表。

- 每个工具位于 `app/tools/` 下的独立文件
- 工具函数必须有 docstring（作为 tool description 传给 LLM）
- 工具函数必须有类型注解（作为 input schema 传给 LLM）
- 新增工具只需：写一个 `@tool` 函数 → 在 `app/tools/__init__.py` 注册

#### Scenario: 添加新工具
- GIVEN 在 `app/tools/` 下创建新文件，用 `@tool` 装饰一个函数并导出
- WHEN 在 `app/tools/__init__.py` 中 import 并加入 `ALL_TOOLS` 列表
- THEN Agent 在下一次启动时自动获得该工具

---

### Requirement: Calculator 工具

`app/tools/calculator.py` — 数学表达式计算器。

```python
@tool
def calculator(expression: str) -> str:
    """计算数学表达式。支持四则运算、幂运算、三角函数、对数。
    输入: 数学表达式字符串，如 "2 + 3 * 4", "sqrt(16)", "2**10"
    """
```

- 使用 Python 内置 `math` 模块 + 受限 `eval`（白名单数学函数）
- 返回计算结果字符串

#### Scenario: 简单四则运算
- GIVEN Agent 收到 "123 * 456 等于多少"
- WHEN Agent 调用 calculator(expression="123*456")
- THEN 返回 "56088"

#### Scenario: 表达式包含非法字符
- GIVEN Agent 调用 calculator(expression="__import__('os').system('ls')")
- WHEN calculator 执行
- THEN 拒绝执行，返回错误信息（安全沙箱）

---

### Requirement: Web Search 工具（Tavily）

`app/tools/web_search.py` — 互联网搜索工具。

```python
@tool
def web_search(query: str) -> str:
    """在互联网上搜索最新信息。当需要实时数据或用户问到当前事件时使用。
    输入: 搜索关键词
    """
```

- 调用 Tavily Search API
- 返回前 3 条结果的标题 + 摘要 + URL
- 超时 10 秒，超时返回占位信息
- `TAVILY_API_KEY` 从环境变量读取，未设置时工具不注册

#### Scenario: 搜索正常返回
- GIVEN Tavily API Key 已配置
- WHEN Agent 调用 web_search(query="2026年世界杯冠军")
- THEN 返回 JSON 格式的搜索结果列表

#### Scenario: 未配置 API Key
- GIVEN `TAVILY_API_KEY` 为空
- WHEN Agent 初始化工具列表
- THEN web_search 工具不在可用工具列表中，Agent 回复"我没有搜索能力"
