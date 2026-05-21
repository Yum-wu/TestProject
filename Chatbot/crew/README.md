# CrewAI Multi-Agent Article Generator

基于 CrewAI 的三 Agent 协作文章生成服务，作为独立 Docker 服务运行在端口 8001。

## 系统架构

```
用户输入主题
    ↓
┌─────────────────────┐
│  资深研究员 (Agent) │  ← 用 Tavily 搜索网络信息
│  输出：研究简报     │
└─────────┬───────────┘
          ↓
┌─────────────────────┐
│  专业写手 (Agent)   │  ← 基于研究简报撰写文章
│  输出：文章草稿     │
└─────────┬───────────┘
          ↓
┌─────────────────────┐
│  高级编辑 (Agent)   │  ← 质量评分 + 改进建议
│  输出：最终文章     │
└─────────────────────┘
```

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/crew/generate` | 同步生成，等待全部完成返回文章 |
| POST | `/api/crew/generate/stream` | SSE 流式生成，实时推送 Agent 状态 |
| GET  | `/api/crew/health` | 健康检查 |

### 请求体

```json
{
  "topic": "string (2-500 字符)"
}
```

### SSE 事件类型

| 事件 | 数据字段 | 说明 |
|------|----------|------|
| `agent_action` | `{agent, detail}` | Agent 正在执行动作 |
| `result` | `{final_output, duration_ms}` | 生成完成，返回文章 |
| `error` | `{message}` | 发生错误 |
| `done` | `{}` | 流结束 |

## 环境变量

配置在 `Chatbot/backend/.env` 中（Docker 共享）：

| 变量 | 必填 | 说明 |
|------|------|------|
| `LLM_API_KEY` | 是 | 智谱 GLM API Key (映射为 OPENAI_API_KEY) |
| `LLM_BASE_URL` | 否 | 自定义 Base URL (默认智谱) |
| `LLM_MODEL` | 否 | 模型名 (默认 GLM-4-Flash-250414) |
| `TAVILY_API_KEY` | 否 | Tavily 搜索 API Key (未配置时使用模型自身知识) |

## Docker 启动

```bash
# 构建并启动所有服务
docker compose up -d

# 仅启动 crew-generator
docker compose up -d crew-generator

# 验证
curl http://localhost:8001/api/crew/health
```

## 本地开发

```bash
cd Chatbot/crew
pip install -r requirements.txt
# 确保 Chatbot/backend/.env 已配置
uvicorn app.main:app --reload --port 8001
```

## 前端页面

Chatbot 前端 App.tsx 导航栏包含 "文章生成" 标签页，使用 SSE 连接 `/api/crew/generate/stream` 实时展示 Agent 进度。

## 限制

- CrewAI 0.11.x 不支持 `kickoff(inputs=...)`，模板变量通过 `.replace()` 手动替换
- Agent `step_callback` 由 CrewAI 内部调用，SSE 事件粒度取决于框架实现
- Tavily 搜索 API Key 可选，未配置时 Agent 使用自身知识储备
