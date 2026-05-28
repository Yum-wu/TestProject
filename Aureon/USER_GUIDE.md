# AI 聊天助手 — 使用手册

## 目录

1. [启动与关闭](#1-启动与关闭)
2. [配置说明](#2-配置说明)
3. [聊天界面](#3-聊天界面)
4. [工具调用](#4-工具调用)
5. [记忆系统](#5-记忆系统)
6. [常见问题](#6-常见问题)
7. [开发者：添加新工具](#7-开发者添加新工具)

---

## 1. 启动与关闭

### 首次启动

需要两个终端窗口，分别运行后端和前端。

**终端 1 — 后端：**

```bash
cd Aureon/backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

看到以下输出表示后端启动成功：

```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

**终端 2 — 前端：**

```bash
cd Aureon
npm install   # 首次需要，之后可跳过
npm run dev
```

看到以下输出表示前端启动成功：

```
VITE v8.0.10  ready in 304 ms
Local:   http://localhost:5173/
```

### 关闭

| 服务 | 方式 |
|------|------|
| 后端 | 在终端按 Ctrl+C |
| 前端 | 在前端终端按 Ctrl+C |

### 重启

后端 `--reload` 模式下，修改 Python 代码会自动重启。前端修改代码后 Vite 自动热更新，无需手动重启。

---

## 2. 配置说明

### 后端配置（`backend/.env`）

```env
LLM_API_KEY=your_zhipu_api_key_here
LLM_MODEL=GLM-4-Flash-250414
LLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4/
TAVILY_API_KEY=
```

### 切换模型

修改两个环境变量即可，无需改代码：

| 厂商 | LLM_MODEL | LLM_BASE_URL |
|------|-----------|-------------|
| 智谱 GLM-4-Flash | `GLM-4-Flash-250414` | `https://open.bigmodel.cn/api/paas/v4/` |
| DeepSeek | `deepseek-chat` | `https://api.deepseek.com/v1` |
| 通义千问 | `qwen-plus` | `https://dashscope.aliyuncs.com/compatible-mode/v1` |

### 前端配置

前端无需 API Key。首次打开 `http://localhost:5173/` 即可使用。

---

## 3. 聊天界面

### 基本操作

- **发送消息**：在底部输入框输入内容，按回车或点击发送按钮
- **停止生成**：AI 回复过程中，点击停止按钮可中断
- **清空对话**：点击清除按钮清空当前会话
- **连续对话**：AI 记忆会在同一 session 内保持上下文

### SSE 事件流

Agent 回复过程中，前端通过 SSE（Server-Sent Events）接收实时数据：

| 事件 | 含义 | 用户看到 |
|------|------|---------|
| `session` | 创建新的会话 | 不可见，自动管理 |
| `text` | AI 回复文本片段 | 逐字输出的文字 |
| `tool_start` | AI 开始调用工具 | "正在调用 calculator..." |
| `tool_end` | 工具调用完成 | "calculator 完成: 56088" |
| `done` | 本轮回复结束 | 停止打字动画 |
| `error` | 发生错误 | 错误提示消息 |

---

## 4. 工具调用

### 计算器（calculator）

当提问涉及数学计算时，Agent 自动调用。

**示例提问：**

```
1 + 1 等于多少
123 * 456
2 的 10 次方
sqrt(16)
```

**安全限制：** 计算器只支持 `math` 模块的数学函数和四则运算。`__import__`、`exec`、`eval` 等危险操作会被拒绝。

### 联网搜索（web_search）

需配置 `TAVILY_API_KEY` 后可用。Agent 在涉及实时信息时自动调用。

**示例提问：**

```
今天天气怎么样
最近有什么新闻
```

### 外存读取（read_ref）

当工具返回结果过长时，系统会自动将完整内容写入外存文件，Agent 可通过 `read_ref` 按需读取。此过程自动完成，用户无需手动操作。

---

## 5. 记忆系统

系统内置 4 层记忆，跨对话保持上下文：

| 层级 | 名称 | 存储位置 | 作用 |
|------|------|---------|------|
| L0 | 原始对话 | `backend/offloads/memory.db` | 完整对话记录 |
| L1 | 原子事实 | 同上 SQLite | 用户偏好、关键数据 |
| L2 | 场景总结 | `backend/offloads/scenarios/*.md` | 每次会话的主题总结 |
| L3 | 用户画像 | `backend/offloads/persona.md` | 长期记忆 |

---

## 6. 常见问题

### Q: 前端页面空白

1. 前端终端是否还在运行
2. 终端有无报错信息
3. 尝试刷新页面（F5）

### Q: 发送消息后没有回复

1. 检查后端终端是否在运行
2. 确认 `.env` 中 `LLM_API_KEY` 有效
3. 网络连不上智谱 API 时，尝试切换模型

### Q: 后端报 ModuleNotFoundError

```bash
cd Chatbot/backend
pip install -r requirements.txt
```

### Q: 端口被占用

后端默认 8000，前端默认 5173。如果被占用：

```bash
# 后端换端口
uvicorn app.main:app --reload --port 8001

# 前端换端口（自动 +1）
```

---

## 7. 开发者：添加新工具

### 步骤

1. 在 `backend/app/tools/` 下创建新文件，例如 `weather.py`：

```python
from langchain.tools import tool

@tool
def get_weather(city: str) -> str:
    """查询指定城市的天气。"""
    return f"{city} 的天气是晴天，25°C"
```

2. 在 `backend/app/tools/__init__.py` 注册：

```python
from app.tools.weather import get_weather

ALL_TOOLS = [
    calculator,
    read_ref,
    get_weather,
]
```

3. 重启后端即可。Agent 会自动发现新工具。

### 工具编写规则

- 必须用 `@tool` 装饰器
- 函数必须有 docstring（作为 tool description 传给 LLM）
- 参数必须有类型注解（作为 input schema 传给 LLM）
- 返回值必须是字符串

---

## 技术栈

| 层 | 技术 |
|----|------|
| 前端框架 | React 19 + TypeScript + Vite 8 |
| 样式 | Tailwind CSS 4 |
| 后端框架 | Python FastAPI |
| Agent 框架 | LangChain 1.x |
| 模型 | 智谱 GLM-4-Flash |
| 数据库 | SQLite |
| 实时通信 | SSE |
