# Upwork 从注册到首单完整流程

> 基于你的现有资产：
> - 线上 Demo：https://testproject-production-17b9.up.railway.app
> - RAG Recall@3 **94%**，Agent 响应 **1.5s 中位数**
> - 3 套 Proposal 模板 → `docs/upwork-proposals.md`
> - Profile 优化指南 → `docs/upwork-profile-guide.md`

---

## Phase 0：注册 + Profile 搭建（1-2 天）

### Step 0.1 — 注册
1. 访问 [upwork.com](https://www.upwork.com) → Sign Up → Freelancer
2. 用 Google 账号或邮箱注册
3. 验证邮箱 + 手机号（国内手机可接收验证码）

### Step 0.2 — Profile 核心字段（按重要性排序）

| 字段 | 要求 | 参考文件 |
|------|------|---------|
| **Title** | 关键词前置，客户搜索第一眼 | `docs/upwork-profile-guide.md` §1 |
| **Overview** | 前 2 行抓注意力，含硬数据 | `docs/upwork-profile-guide.md` §2 |
| **Portfolio** | 挂 Railway Demo 链接 + 架构截图 | 已就绪：线上 URL |
| **Skills** | 选满 10-15 个（React/Python/FastAPI/LangChain/RAG/Docker） | 技能基线见 `目标.md` |
| **Employment History** | 填个人项目当工作经验 | Chatbot/CrewAI/RAG 三个项目 |
| **Education** | 如实填写即可 | - |
| **Rate** | 建议 $25-35/hr 起步 | 见 `目标.md` 定价策略 |

**关键动作**：Profile 完成后，用 [Upwork Profile Checker](https://www.upwork.com/freelancers/profile-score) 检查完整性，目标 **100% 完成度**。

---

## Phase 1：找项目 + Proposal 投递（持续，每天 30-60min）

### Step 1.1 — 搜索策略

```
搜索关键词（按优先级）：
  1. RAG + "document Q&A" + Python          → 最匹配你的经验
  2. LangChain + chatbot + "API integration" → 第二匹配
  3. AI agent + "multi-agent" + FastAPI      → 第三匹配
  4. CrewAI (直接搜)                         → 窄但精准

过滤条件：
  ├─ Budget: $200+（避开 $50 以下价格战）
  ├─ Experience Level: Intermediate（你最适合的档位）
  ├─ Location: Any（不要只限中国/美国）
  └─ Proposals: < 20（竞争小的新 job）
```

### Step 1.2 — Proposal 结构（通用公式）

```
Subject: [客户问题] + [你的解决方案] + [硬数据]

第一段（前 2 行可见，抓注意力）：
  Hi [Client Name],
  
  I read your requirement about [客户核心需求]. 
  I recently built a [同类系统] achieving [具体指标].
  Live demo: [链接]

第二段（关键技术匹配）：
  - Your need [客户需求 A] → I've done [你的经验 A]
  - Your need [客户需求 B] → I've done [你的经验 B]

第三段（差异化收尾）：
  Most freelancers say "I know RAG." 
  I have hard metrics: 94% recall, 1.5s response, deployed on cloud.
  
  Available for fixed-price or hourly. Would you like to discuss?

附件：Railway Demo 链接 + GitHub 仓库（可选）
```

**3 套现成模板** → `docs/upwork-proposals.md`（直接复制修改）

### Step 1.3 — 投递节奏

```
第一周：投 10 个 job（每天 2 个）
  ├─ 周一：1 个 RAG + 1 个 Chatbot
  ├─ 周二：1 个 Agent + 1 个 Python
  ├─ 周三：1 个 RAG + 1 个 AI Integration
  ├─ 周四：1 个 Chatbot + 1 个 Automation
  └─ 周五：1 个 Agent + 1 个 General

第二周起：每天 1-2 个，基于回复率调整关键词

关键指标：
  ├─ 投递回复率目标：>30%（低于 20% 说明 Profile 或 Subject 要改）
  ├─ 面试转化率：每 5 个回复 → 1 个面试
  └─ 首单目标：投出 50 个以内拿到
```

---

## Phase 2：面试 + 报价（回复后 1-3 天）

### Step 2.1 — 面试准备

客户一般会问：
```
1. "你有做过类似项目吗？"
   → 直接发 Railway Demo 链接 + 说具体指标

2. "你用什么技术栈？"
   → Python + FastAPI + LangChain/LangGraph + Chroma + Docker
   → 如果需要其他数据库，可以说迁移能力

3. "你对这个项目的理解和方案是什么？"
   → 复述需求 + 画架构（白板/文字）+ 排期

4. "你的收费方式？"
   → 可选：固定价（$500-2000）或时薪（$25-50/hr）
   → 首单建议固定价（客户更容易接受）
```

### Step 2.2 — 首单报价策略

```
首单目标：不是赚钱，是拿五星评价

策略：
  ├─ 小项目（估算 <20h）：固定价 $200-500
  ├─ 中项目（20-80h）：时薪 $25-35/hr
  └─ 长项目（80h+）：时薪 $35-45/hr

第一单谈判底线：
  ├─ 最多降 20%（再低不如不做）
  ├─ 可以用"限时优惠"而不是永久降价
  └─ 如果客户砍太多，说可以缩减 scope 匹配预算
```

---

## Phase 3：交付 + 五星评价（接单后 1-4 周）

### Step 3.1 — 交付流程

```
Day 1-2:  需求确认 → 写 Spec → 客户确认
Day 3-5:  核心开发 → 内部测试
Day 6-7:  客户交付 → 收集反馈
Day 8-10: 修改完善 → 最终交付
```

### Step 3.2 — Upsell 机会（交完核心功能后）

```
交付完成后，主动提这些扩展（通常客户会动心）：
  1. "要不要加多轮对话记忆？"
  2. "要不要加文件上传（PDF/Word）？"
  3. "要不要部署到正式服务器？"
  4. "要不要加 Dashboard 统计？"

每个扩展报价 $100-300，客户满意度高后转化率可观。
```

### Step 3.3 — 五星评价技巧

```
1. 提前交付：说 7 天，第 5 天交 → 超出预期
2. 交付包完整：
   ├─ 可运行的代码（GitHub 私仓）
   ├─ README（部署说明 + API 文档）
   ├─ Demo 录屏（Loom 免费录）
   └─ 后续维护建议
3. 沟通频率：每 2-3 天给一次进度更新
4. 礼貌要评价："If you're satisfied, a 5-star review would mean a lot. 🙏"
```

---

## Phase 4：长期运营（完成 3 单后）

### Step 4.1 — 提价路径

```
第 1-3 单：$25-35/hr（攒评价）
第 4-7 单：$35-50/hr（有评价背书）
第 8+ 单：$50-75/hr（专家定位）
```

### Step 4.2 — 复购率 > 企业客户

```
1. 交付后 1 个月给老客户发 "系统运行报告"
2. 问有没有新需求（免费小建议保持联系）
3. 企业客户更容易复购 + 大单
```

---

## 每日执行清单

```
每天早上花 30 分钟：
  □ 刷 Upwork → 保存 5 个匹配 job
  □ 写 2 个 Proposal（20-30 分钟）
  □ 回复未读消息（如果有）

每周检查：
  □ 投递数（目标 10+/周）
  □ 回复率（目标 >30%）
  □ Profile 访问量
  □ 哪些关键词的 job 回复率最高 → 调整策略
```

---

## 常见误区

| 误区 | 正确做法 |
|------|---------|
| 投 $5-20 小单练手 | 这个价格段竞争最激烈（50+ proposals），且客户质量低 |
| 长 Proposal | Upwork 只看前 2 行，超过 300 字没人读完 |
| 不写具体数据 | "I know RAG" vs "94% recall" — 后者命中率翻倍 |
| 只等邀请 | 主动投递比等邀请效率高 10 倍 |
| 低于 $20/hr 抢单 | 低价吸引的客户质量最差，且难以后续提价 |
| 不筛选客户 | 没历史评价、没付款验证的客户 = 跑单风险高 |
