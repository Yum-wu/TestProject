# AI 聊天助手 (Chatbot Agent)

基于 **Python FastAPI + LangChain + React** 的 AI 聊天 Agent，支持 Tool Calling、四层记忆系统和流式输出。

## 项目结构

```
Chatbot/
├── backend/                    # Python FastAPI 后端（新建）
│   ├── app/
│   │   ├── agent/              # Agent 核心（LLM 工厂、Agent 工厂、执行器）
│   │   ├── tools/              # 工具定义（计算器、搜索、read_ref）
│   │   ├── memory/             # 四层记忆系统（L0→L3 + 上下文卸载）
│   │   ├── api/                # Pydantic 请求/响应模型
│   │   ├── config.py           # .env 配置加载
│   │   └── main.py             # FastAPI 入口
│   ├── offloads/               # 记忆外存（refs, scenarios, persona）
│   ├── tests/                  # Pytest 测试
│   ├── requirements.txt
│   └── .env
│   ├── crew/                    # CrewAI 多 Agent 文章生成（独立服务，端口 8001）
│   │   ├── app/                 # Agent 定义、任务编排、FastAPI 入口
│   │   └── README.md            # 文章生成 API 文档
│   ├── components/             # ChatWindow, MessageList, MessageItem...
│   ├── hooks/useChat.ts        # 聊天状态管理
│   ├── services/api.ts         # API 通信层（指向后端）
│   ├── services/storage.ts     # LocalStorage 存储
│   └── types/message.ts        # 类型定义
├── openspec/                   # 规格文档
└── package.json
```

## 快速开始

### 后端 (主 Agent)

```bash
cd Chatbot/backend
pip install -r requirements.txt
# 编辑 .env 填入 API Key
uvicorn app.main:app --reload --port 8000
```

### 前端

```bash
cd Chatbot
npm install
npm run dev    # http://localhost:5173
```

### 多 Agent 文章生成 (CrewAI)

独立 FastAPI 服务，3 个 AI 角色顺序协作：

```bash
cd Chatbot/crew
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

前端访问"文章生成"标签页即可使用。详见 [crew/README.md](crew/README.md)。

### RAG 评估

```bash
# 启动后端后
curl -X POST http://localhost:8000/api/rag/evaluate     # 评估 Recall/Faithfulness/延迟
curl -X POST http://localhost:8000/api/rag/experiment    # Prompt 策略对比实验
curl -X POST http://localhost:8000/api/rag/index         # 重建知识库索引
```

## 核心能力

| 能力 | 说明 |
|------|------|
| **Agent 路由** | LangChain 自动判断对话或调工具 |
| **Tool Calling** | 计算器 + 联网搜索 + 外存读取 |
| **流式输出** | SSE 逐字输出，工具调用过程透明 |
| **四层记忆** | L0 原始对话 → L1 事实 → L2 场景 → L3 画像 |
| **上下文卸载** | 长输出自动归档，Agent 按需恢复 |
| **模型可换** | 改 .env 切换智谱/DeepSeek/混元 |
| **多 Agent 协作** | CrewAI 三角色（研究员→写手→编辑）顺序生成文章 |
| **SSE 实时进度** | Agent 执行状态流式推送，前端实时展示协作过程 |
| **RAG 知识库问答** | Chroma + Zhipu Embedding + MMR 检索，支持 Recall/Faithfulness 评估 |
| **Prompt 实验框架** | Direct / CoT / Few-shot 三种策略对比，输出结构化报告 |

## 依赖

- **后端**：Python 3.14+, LangChain, FastAPI, uvicorn
- **前端**：React 19, Vite 8, TypeScript, Tailwind CSS 4
- **可選**：Tavily API Key（联网搜索）
