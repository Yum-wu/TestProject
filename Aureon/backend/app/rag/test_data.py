"""RAG Evaluation Test Dataset — Q&A pairs annotated from articles."""

TEST_QA_PAIRS = [
    # ── Hermes Agent article ──
    {
        "id": "hermes-001",
        "question": "Hermes Agent 的分层记忆系统有几层？每层叫什么？",
        "answer": "4 层：L0 Conversation（原始对话记录）、L1 Atoms（原子事实提取）、L2 Scenarios（场景块聚合）、L3 Persona（用户画像）",
        "source_article": "hermes-agent-practical-guide",
    },
    {
        "id": "hermes-002",
        "question": "集成四层记忆后，Hermes Agent 的 Token 消耗和任务成功率变化如何？",
        "answer": "Token 消耗降低 61%，任务成功率提升 51%",
        "source_article": "hermes-agent-practical-guide",
    },
    {
        "id": "hermes-003",
        "question": "Hermes Agent 的核心优势是什么？",
        "answer": "模块化设计、分层可扩展性，以及约 900 个测试文件和 17000+ 测试用例的工程实践",
        "source_article": "hermes-agent-practical-guide",
    },
    {
        "id": "hermes-004",
        "question": "文中提到了哪三个核心技能？",
        "answer": "Litprog Skill（文学创作框架）、Super-Hermes（元推理优化）、Hermes Dojo（自我改进道场）",
        "source_article": "hermes-agent-practical-guide",
    },
    {
        "id": "hermes-005",
        "question": "文中提到的三个挑战是什么？解决方案分别是什么？",
        "answer": "1. 多层记忆数据同步冲突 → 引入版本控制 + 乐观锁；2. 技能之间工具函数冲突 → 统一命名空间 + 自动冲突检测；3. 长上下文性能下降 → 分层压缩策略 + 动态上下文窗口",
        "source_article": "hermes-agent-practical-guide",
    },
    {
        "id": "hermes-006",
        "question": "上下文完整性提升的百分比是多少？",
        "answer": "89%",
        "source_article": "hermes-agent-practical-guide",
    },
    {
        "id": "hermes-007",
        "question": "短期记忆、中层存储和长期持久化分别负责什么？",
        "answer": "短期记忆保留最近对话，中层存储任务状态，长期持久化用户偏好和项目配置",
        "source_article": "hermes-agent-practical-guide",
    },
    # ── SPA GitHub Pages article ──
    {
        "id": "spa-001",
        "question": "把 React SPA 部署到 GitHub Pages 经历了哪三阶段崩溃？",
        "answer": "404 → 白屏 → 路由 404 的三阶段崩溃",
        "source_article": "spa-github-pages",
    },
    {
        "id": "spa-002",
        "question": "文章中列出了多少个部署问题？分别是什么？",
        "answer": "7 个：1. 部署时上传了错误的目录导致页面 404；2. 构建产物被 gitignore 导致找不到文件；3. Node.js 版本太低导致 CustomEvent is not defined；4. base 路径没配导致页面空白；5. basename 没配导致显示 404 页面；6. 旧代码引用了已删除的函数导致 TypeScript 编译失败；7. 服务器不认识 SPA 路由导致直接访问文章链接 404",
        "source_article": "spa-github-pages",
    },
    {
        "id": "spa-003",
        "question": "SPA 路由回退的解决方案是什么？",
        "answer": "复制 index.html 为 404.html，让 GitHub Pages 在遇到未知路由时回退到 index.html",
        "source_article": "spa-github-pages",
    },
    {
        "id": "spa-004",
        "question": "Vite 配置中需要设置什么参数？",
        "answer": "设置 base: \"/TestProject/\"，必须与部署子路径一致",
        "source_article": "spa-github-pages",
    },
    {
        "id": "spa-005",
        "question": "React Router 中需要设置什么参数？",
        "answer": "设置 `<BrowserRouter basename=\"/TestProject\">`",
        "source_article": "spa-github-pages",
    },
    {
        "id": "spa-006",
        "question": "base 和 basename 各自控制什么？",
        "answer": "base 控制静态资源路径，basename 控制前端路由路径，两个都要配",
        "source_article": "spa-github-pages",
    },
    {
        "id": "spa-007",
        "question": "自检清单包含哪些检查项？",
        "answer": "1. Network 面板检查 JS/CSS 是否 200；2. Console 面板检查有无报错；3. Elements 面板检查 root 里是否有内容；4. 直接访问非首页路径是否正常；5. 检查 CI 构建日志",
        "source_article": "spa-github-pages",
    },
    {
        "id": "spa-008",
        "question": "构建阶段出现的两个问题是什么？",
        "answer": "1. 构建产物被 gitignore 找不到文件；2. Node.js 版本太低导致 CustomEvent is not defined",
        "source_article": "spa-github-pages",
    },
    # ── Cross-article reasoning ──
    {
        "id": "cross-001",
        "question": "两篇文章的共同点是什么？",
        "answer": "都是技术实战经验分享，包含具体数据或问题清单，面向开发者读者",
        "source_article": "both",
    },
]

# For recall evaluation: expected source articles per query
# Keys must exactly match `question` in TEST_QA_PAIRS
RETRIEVAL_EXPECTED = {
    "Hermes Agent 的分层记忆系统有几层？每层叫什么？": "hermes-agent-practical-guide",
    "集成四层记忆后，Hermes Agent 的 Token 消耗和任务成功率变化如何？": "hermes-agent-practical-guide",
    "Hermes Agent 的核心优势是什么？": "hermes-agent-practical-guide",
    "文中提到了哪三个核心技能？": "hermes-agent-practical-guide",
    "文中提到的三个挑战是什么？解决方案分别是什么？": "hermes-agent-practical-guide",
    "上下文完整性提升的百分比是多少？": "hermes-agent-practical-guide",
    "短期记忆、中层存储和长期持久化分别负责什么？": "hermes-agent-practical-guide",
    "把 React SPA 部署到 GitHub Pages 经历了哪三阶段崩溃？": "spa-github-pages",
    "文章中列出了多少个部署问题？分别是什么？": "spa-github-pages",
    "SPA 路由回退的解决方案是什么？": "spa-github-pages",
    "Vite 配置中需要设置什么参数？": "spa-github-pages",
    "React Router 中需要设置什么参数？": "spa-github-pages",
    "base 和 basename 各自控制什么？": "spa-github-pages",
    "自检清单包含哪些检查项？": "spa-github-pages",
    "构建阶段出现的两个问题是什么？": "spa-github-pages",
    "两篇文章的共同点是什么？": "both",
}
