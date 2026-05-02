# Mini 在线商城

[![License: MIT

---

## 简介

一个用于学习全栈电商业务逻辑的极简在线商城，实现商品浏览、购物车、订单管理和地址管理。

---

## 目录

- [特性亮点](#特性亮点)
- [功能清单](#功能清单)
- [技术栈](#技术栈)
- [目录结构](#目录结构)
- [设计文档](#设计文档)
- [快速开始](#快速开始)
- [运行测试](#运行测试)
- [开发智能体交付报告](#开发智能体交付报告)

---

## 特性亮点

| 特性 | 实现方式 |
|---|---|
| 🛡️ **乐观锁防超卖 | MySQL `version` 字段 + 事务扣库存 |
| 📸 **价格快照** | 订单快照下单时商品价格独立于商品表 |
| 🏠 **默认地址联动** | 新增设默认时自动清空旧默认地址 |
| 🧪 **44 个测试用例** | Jest 单元测试 + 集成测试 |
| 📦 **完整 CI 架构** | 7 个项目文档（PRD/架构/数据库/API/性能/代码审查/交付报告 |
| ⚡ **性能优化** | React.memo, AbortController, 移除 SELECT * |

---

## 功能清单

### 商品管理
- 商品列表页 + 分类筛选 + 关键词搜索 + 排序
- 商品详情页（库存实时展示）

### 购物车
- 商品加入购物车
- 购物车商品数量编辑 + 删除
- 购物车商品实时库存校验

### 订单管理
- 从购物车创建订单（选择收货地址）
- 订单列表（全部/待支付/已取消筛选）
- 订单详情（价格明细展示）
- 取消待支付订单（自动恢复库存）

### 收货地址管理
- 新增/编辑/删除收货地址
- 默认地址设置

---

## 技术栈

| 层级 | 选型 |
|---|---|
| **前端** | React 18 + TypeScript 5 + Vite 5 + React Router 6 |
| **后端** | Node.js + Express + TypeScript 5 |
| **数据库** | MySQL 8 + mysql2 |
| **测试** | Jest + ts-jest |
| **校验** | Joi |
| **部署** | Git |

---

## 目录结构

```
OnlineStore/
├── client/                     # 前端项目
│   ├── src/
│   │   ├── components/        # 组件
│   │   │   ├── address/       # 地址组件
│   │   │   ├── cart/          # 购物车组件
│   │   │   ├── common/        # 通用组件（Loading/Empty/ConfirmDialog/Pagination）
│   │   │   ├── layout/        # 布局组件
│   │   │   ├── order/         # 订单组件
│   │   │   └── product/       # 商品组件
│   │   ├── hooks/           # 自定义 Hooks
│   │   ├── pages/           # 页面组件
│   │   ├── services/        # API 调用层
│   │   ├── store/           # Context 状态管理
│   │   ├── styles/          # 样式（CSS 变量 + 全局样式
│   │   ├── types/           # 类型定义
│   │   └── utils/           # 工具函数
│   └── package.json
│
├── server/                     # 后端项目
│   ├── src/
│   │   ├── config/          # 配置（数据库 + 环境变量
│   │   ├── controllers/     # 控制器
│   │   ├── middleware/   # 中间件（认证 + 错误处理 + 日志 + 参数校验
│   │   ├── models/         # 数据访问
│   │   ├── routes/          # 路由
│   │   ├── services/       # 业务逻辑
│   │   ├── types/          # 类型定义
│   │   └── utils/          # 工具函数
│   ├── tests/              # 测试
│   │   ├── unit/          # 单元测试
│   │   └── integration/   # 集成测试
│   └── package.json
│
├── prd.md                     # 产品需求文档
├── arch-design.md           # 架构设计文档
├── db-design.md            # 数据库设计文档（含 DDL
├── api-design.md           # API 设计文档（含 curl 示例
├── perf-report.md            # 性能优化报告
├── code-review.md          # 代码审查报告
├── LICENSE
└── readme.md
```

---

## 设计文档

| 文档 | 说明 |
|---|---|
| [prd.md](prd.md) | 产品需求文档，包含核心流程与功能范围 |
| [arch-design.md](arch-design.md) | 架构设计，技术选型和目录结构设计 |
| [db-design.md](db-design.md) | 数据库设计，6 张表 DDL + 种子数据 + 索引设计 |
| [api-design.md](api-design.md) | 14 个 REST API 设计 + Joi schema + curl 示例 |
| [perf-report.md](perf-report.md) | 性能优化报告与修改 |
| [code-review.md](code-review.md) | 代码审查报告与测试用例设计 |

---

## 快速开始

### 前置要求

- Node.js &gt;= 18
- MySQL 8.0

---

### 1. 克隆与安装

```bash
# 进入项目目录
cd OnlineStore

# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
```

---

### 2. 数据库初始化

执行 `server/db-init.sql` 中的 SQL 建表脚本。

```bash
# 你可以使用 MySQL Workbench 或命令行执行
mysql -u root -p < server/db-init.sql
```

---

### 3. 配置后端启动

```bash
cd server

# 复制环境变量
cp .env.example .env

# 编辑 .env，填入你的数据库信息
vi .env

# 启动开发服务器（端口 3000）
npm run dev
```

---

### 4. 前端启动

```bash
cd ../client

# 启动开发服务器（端口 5173）
npm run dev
```

打开浏览器访问：`http://localhost:5173`

---

## 运行测试

### 后端测试

```bash
cd server

# 运行所有测试
npm run test
```

### 前端类型检查

```bash
cd client
npx tsc --noEmit
```

---

## 开发智能体交付报告

本项目采用 AI 无人值守模式，**6 个专用智能体接力完成开发：

1. **AI集成工程师**：阅读 PRD 与 README，输出架构/数据库/API 三份设计文档

2. **UI设计师**：输出组件库设计系统（CSS 变量 + 全局样式 + 类型定义 + 工具函数）

3. **后端架构师**：输出完整后端代码（Express + TypeScript + MySQL）

4. **前端架构师**：输出完整前端代码（React + TypeScript + Vite）

5. **性能优化师**：优化前后端性能（React.memo、AbortController、移除 SELECT *、双重赋值 bug 修复）

6. **代码审查测试员**：审查代码 + 补充测试（修复浮点精度问题）+ 44 个 Jest 测试用例

---

## License

MIT © 2026 Yum
