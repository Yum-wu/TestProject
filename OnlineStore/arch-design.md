# Mini 在线商城 — 架构设计文档

---

## 1. 整体项目架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                          客户端层 (Client)                           │
│                                                                     │
│  ┌──────────────────────┐  ┌──────────────────────────────────────┐ │
│  │     React + Vite     │  │         浏览器端运行时               │ │
│  │  TypeScript + CSS3   │  │  React Router / Fetch API / Axios    │ │
│  └──────────┬───────────┘  └──────────────────┬───────────────────┘ │
│             │                                 │                     │
└─────────────┼─────────────────────────────────┼─────────────────────┘
              │   HTTP/HTTPS (RESTful API)      │
              │                                 │
┌─────────────┼─────────────────────────────────┼─────────────────────┐
│             ▼              Web 层              │                     │
│  ┌──────────────────────────────────────────────────────────────────┐│
│  │                     Nginx (反向代理/静态资源)                     ││
│  │  路由分发 → /api/* 转发后端    /assets/* 返回静态资源             ││
│  └──────────────────────────────────────────────────────────────────┘│
│             │                                                       │
│  ┌──────────▼───────────────────────────────────────────────────────┐│
│  │                     Express 应用服务器                           ││
│  │                                                                 ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       ││
│  │  │  Routes   │  │Middleware│  │Validation│  │Response  │       ││
│  │  │  路由层    │→│ 中间件层  │→│ 校验层    │→│ 格式化    │       ││
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘       ││
│  │       │              │                                          ││
│  │       ▼              ▼                                          ││
│  │  ┌──────────┐  ┌──────────────────────────────────────────┐    ││
│  │  │Controllers│  │            Services (业务逻辑层)          │    ││
│  │  │  控制器层  │──▶│  ProductService / CartService /         │    ││
│  │  └──────────┘  │  OrderService / AddressService /          │    ││
│  │                │  UserService                              │    ││
│  │                └────────────────────┬─────────────────────┘    ││
│  └────────────────────────────────────┼──────────────────────────┘│
│                                       │                            │
│  ┌────────────────────────────────────┼──────────────────────────┐ │
│  │                        数据访问层  │                          │ │
│  │  ┌─────────────────────────────────▼──────────────────────┐   │ │
│  │  │              Models (数据模型 / 查询封装)                │   │ │
│  │  │  ProductModel / CartModel / OrderModel / AddressModel   │   │ │
│  │  └─────────────────────────────────┬──────────────────────┘   │ │
│  │                                    │                          │ │
│  │  ┌─────────────────────────────────▼──────────────────────┐   │ │
│  │  │           mysql2/promise 连接池 (Connection Pool)       │   │ │
│  │  │           poolSize=10, idleTimeout=10000ms             │   │ │
│  │  └─────────────────────────────────┬──────────────────────┘   │ │
│  └────────────────────────────────────┼──────────────────────────┘ │
│                                       │                            │
└───────────────────────────────────────┼────────────────────────────┘
                                        │
┌───────────────────────────────────────┼────────────────────────────┐
│  ┌────────────────────────────────────▼───────────────────────────┐│
│  │                    MySQL 8.0 数据库                             ││
│  │  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐           ││
│  │  │  users  │ │products │ │cart_items│ │addresses │           ││
│  │  └─────────┘ └─────────┘ └──────────┘ └──────────┘           ││
│  │  ┌─────────┐ ┌───────────┐                                     ││
│  │  │ orders  │ │order_items│    字符集: utf8mb4                  ││
│  │  └─────────┘ └───────────┘    引擎: InnoDB                     ││
│  └────────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────┘
```

### 分层说明

| 层 | 职责 | 关键技术 |
|---|---|---|
| **客户端层** | 用户界面、交互、前端状态管理 | React 18+, TypeScript, Vite |
| **Web 层** | 反向代理、静态资源、HTTPS | Nginx（生产环境）/ Vite proxy（开发） |
| **路由层** | URL 映射、请求分发 | Express Router |
| **中间件层** | 认证、日志、限流、CORS、错误处理 | 自定义中间件 |
| **校验层** | 请求参数合法性校验 | Joi |
| **控制器层** | 解析请求、调用服务、构造响应 | Express handler |
| **服务层** | 核心业务逻辑、事务编排 | Service 类 |
| **模型层** | 数据库查询封装、SQL 语句管理 | mysql2/promise |
| **连接池层** | 数据库连接生命周期管理 | mysql2 connection pool |
| **数据库层** | 数据持久化、事务、索引 | MySQL 8.0 InnoDB |

---

## 2. 后端目录结构设计

```
server/
├── src/
│   ├── config/                  # 配置模块
│   │   ├── index.ts             # 配置聚合导出（根据 NODE_ENV 加载对应配置）
│   │   ├── db.ts                # 数据库连接池 + 配置
│   │   └── env.ts               # 环境变量校验与类型导出
│   │
│   ├── middleware/               # 中间件
│   │   ├── errorHandler.ts      # 全局错误处理中间件（捕获未处理异常，返回统一格式）
│   │   ├── validator.ts         # 请求参数校验中间件（封装 Joi schema 校验）
│   │   ├── auth.ts              # 认证中间件（Token 验证，提取 userId）
│   │   └── requestLogger.ts     # 请求日志中间件（记录 method, url, duration）
│   │
│   ├── routes/                  # 路由定义（仅定义路由映射，不写业务逻辑）
│   │   ├── index.ts             # 路由聚合入口，挂载所有子路由到 /api
│   │   ├── product.routes.ts    # 商品路由 /api/products
│   │   ├── cart.routes.ts       # 购物车路由 /api/cart
│   │   ├── order.routes.ts      # 订单路由 /api/orders
│   │   └── address.routes.ts    # 地址路由 /api/addresses
│   │
│   ├── controllers/             # 控制器（解析请求参数，调用 service，返回响应）
│   │   ├── product.controller.ts
│   │   ├── cart.controller.ts
│   │   ├── order.controller.ts
│   │   └── address.controller.ts
│   │
│   ├── services/                # 业务逻辑层（核心编排，事务管理）
│   │   ├── product.service.ts   # 商品查询、分页
│   │   ├── cart.service.ts      # 购物车增删改查、库存校验
│   │   ├── order.service.ts     # 订单创建（事务+乐观锁+快照）、取消（恢复库存）
│   │   └── address.service.ts   # 地址增删改查、默认地址逻辑
│   │
│   ├── models/                  # 数据访问模型（SQL 查询封装）
│   │   ├── product.model.ts
│   │   ├── cart.model.ts
│   │   ├── order.model.ts
│   │   ├── address.model.ts
│   │   └── user.model.ts
│   │
│   ├── utils/                   # 工具函数
│   │   ├── response.ts          # 统一响应构造器 { code, message, data }
│   │   ├── errors.ts            # 自定义错误类（BusinessError, ValidationError 等）
│   │   ├── pagination.ts        # 分页参数解析与格式化
│   │   └── orderNo.ts           # 订单号生成器（时间戳+随机数/雪花ID）
│   │
│   ├── types/                   # TypeScript 类型定义
│   │   ├── index.ts             # 通用类型导出
│   │   ├── product.ts           # Product, ProductFilter 等
│   │   ├── cart.ts              # CartItem, AddToCartInput 等
│   │   ├── order.ts             # Order, OrderStatus, OrderItem 等
│   │   └── address.ts           # Address, CreateAddressInput 等
│   │
│   └── app.ts                   # Express 应用初始化（注册中间件、路由）
│
├── tests/                       # 测试目录
│   ├── unit/                    # 单元测试（service 层）
│   │   ├── cart.service.test.ts
│   │   ├── order.service.test.ts
│   │   └── address.service.test.ts
│   └── integration/             # 集成测试（API 端点）
│       └── api.test.ts
│
├── .env                         # 环境变量（不提交 Git）
├── .env.example                 # 环境变量模板
├── package.json
├── tsconfig.json
└── jest.config.ts
```

---

## 3. 前端目录结构设计

```
client/
├── public/                      # 静态资源
│   └── favicon.ico
│
├── src/
│   ├── main.tsx                 # 入口文件，挂载 App
│   ├── App.tsx                  # 根组件，路由配置
│   │
│   ├── pages/                   # 页面级组件（每个文件对应一个路由页面）
│   │   ├── HomePage.tsx         # 首页 / 商品列表
│   │   ├── ProductDetail.tsx    # 商品详情页 /products/:id
│   │   ├── CartPage.tsx         # 购物车页面 /cart
│   │   ├── OrderListPage.tsx    # 订单列表 /orders
│   │   ├── OrderDetail.tsx      # 订单详情 /orders/:id
│   │   └── AddressPage.tsx      # 地址管理 /addresses
│   │
│   ├── components/              # 可复用 UI 组件
│   │   ├── layout/              # 布局组件
│   │   │   ├── Header.tsx       # 顶部导航栏（Logo、购物车图标、菜单）
│   │   │   ├── Footer.tsx       # 页脚
│   │   │   └── PageContainer.tsx# 页面容器（最大宽度 + 居中对齐）
│   │   ├── product/             # 商品相关组件
│   │   │   ├── ProductCard.tsx  # 商品卡片（列表项）
│   │   │   └── ProductGrid.tsx  # 商品网格布局
│   │   ├── cart/                # 购物车相关组件
│   │   │   ├── CartItem.tsx     # 购物车单项
│   │   │   └── CartSummary.tsx  # 购物车汇总（总价、结算按钮）
│   │   ├── order/               # 订单相关组件
│   │   │   ├── OrderCard.tsx    # 订单卡片（列表项）
│   │   │   ├── OrderItem.tsx    # 订单商品明细项
│   │   │   └── StatusBadge.tsx  # 状态徽章（待支付/已取消）
│   │   ├── address/             # 地址组件
│   │   │   ├── AddressCard.tsx  # 地址卡片
│   │   │   └── AddressForm.tsx  # 地址表单（新增/编辑）
│   │   └── common/              # 通用组件
│   │       ├── Pagination.tsx   # 分页器
│   │       ├── Loading.tsx      # 加载状态
│   │       ├── Empty.tsx        # 空状态展示
│   │       └── ConfirmDialog.tsx# 确认弹窗
│   │
│   ├── hooks/                   # 自定义 Hooks
│   │   ├── useProducts.ts       # 商品数据获取（列表/详情）
│   │   ├── useCart.ts           # 购物车操作（增删改查+状态管理）
│   │   ├── useOrders.ts         # 订单操作（创建/列表/详情/取消）
│   │   ├── useAddresses.ts      # 地址操作
│   │   └── usePagination.ts     # 通用分页 Hook
│   │
│   ├── services/                # API 请求层（封装 fetch/axios）
│   │   ├── api.ts               # 基础请求配置（baseURL, headers, 拦截器）
│   │   ├── product.api.ts       # 商品 API
│   │   ├── cart.api.ts          # 购物车 API
│   │   ├── order.api.ts         # 订单 API
│   │   └── address.api.ts       # 地址 API
│   │
│   ├── store/                   # 状态管理（React Context 或 Zustand）
│   │   ├── CartContext.tsx      # 购物车全局状态（数量徽章）
│   │   └── AppContext.tsx       # 全局应用状态
│   │
│   ├── types/                   # 前端 TypeScript 类型定义
│   │   ├── product.ts
│   │   ├── cart.ts
│   │   ├── order.ts
│   │   ├── address.ts
│   │   └── api.ts               # ApiResponse<T>, PaginatedData<T> 等
│   │
│   ├── utils/                   # 前端工具函数
│   │   ├── format.ts            # 价格格式化、日期格式化
│   │   └── validators.ts        # 前端校验（邮箱格式、手机号等）
│   │
│   └── styles/                  # 样式文件
│       ├── global.css           # 全局样式、CSS 变量（主题色）
│       └── variables.css        # 设计 Token（颜色、间距、圆角）
│
├── index.html                   # HTML 入口
├── vite.config.ts               # Vite 配置（含 proxy 代理 /api）
├── tsconfig.json
├── package.json
└── .eslintrc.cjs
```

### 前端路由设计

| 路由 | 页面组件 | 说明 |
|---|---|---|
| `/` | `HomePage` | 商品列表（首页） |
| `/products/:id` | `ProductDetail` | 商品详情 |
| `/cart` | `CartPage` | 购物车 |
| `/orders` | `OrderListPage` | 订单列表 |
| `/orders/:id` | `OrderDetail` | 订单详情 |
| `/addresses` | `AddressPage` | 地址管理 |

---

## 4. AI 增强功能推荐

以下功能分为两批：第一批为 MVP 推荐集成，第二批为后续迭代建议。

### 4.1 MVP 可集成（初期投入小、收益高）

| 序号 | 功能名称 | 描述 | 技术方案 | 优先级 |
|------|----------|------|----------|--------|
| **AI-1** | **智能搜索建议** | 用户在搜索框输入时，基于商品名称、分类、标签提供实时联想补全 | 前端 debounce + 后端 LIKE 查询 + Trie 索引；可引入 Elasticsearch 做分词 | 高 |
| **AI-2** | **异常订单检测** | 检测异常下单行为：同一用户短时间大量下单、异常价格快照偏离、库存变化异常 | 规则引擎 + 阈值告警；后期可接入 Isolation Forest 异常检测模型 | 高 |
| **AI-3** | **库存预警** | 当商品库存低于阈值时，自动标记"即将售罄"或推送通知 | 定时任务 (node-cron) + 阈值配置 + 邮件/站内通知 | 中 |

### 4.2 后续迭代（需更多数据积累与模型训练）

| 序号 | 功能名称 | 描述 | 技术方案 | 阶段 |
|------|----------|------|----------|------|
| **AI-4** | **个性化商品推荐** | 基于用户浏览历史、购买记录，推荐相关商品 | 协同过滤 (Collaborative Filtering) 或基于内容的推荐；初期可用简单的"同品类热销"规则 | Phase 2 |
| **AI-5** | **智能客服助手** | 用户可询问退换货政策、商品信息等常见问题 | RAG 架构：LLM + 知识库（商品数据、FAQ 文档）；可使用 OpenAI API 或本地模型 | Phase 3 |
| **AI-6** | **销量预测** | 基于历史订单数据预测未来销量，辅助库存管理 | 时间序列模型 (Prophet / ARIMA) 或简单移动平均 | Phase 3 |
| **AI-7** | **动态定价建议** | 结合库存、销量趋势、竞品价格给出调价建议 | 回归模型或规则策略 | Phase 4 |
| **AI-8** | **评论情感分析** | 分析用户评价情感倾向，自动归类好评/差评 | NLP 文本分类模型 (BERT 微调或 API) | Phase 4 |

---

## 5. 数据库连接池与配置方案

### 5.1 连接池策略

```typescript
// server/src/config/db.ts

import mysql from 'mysql2/promise';

/**
 * 数据库连接池配置
 *
 * 设计原则：
 * - 连接池大小根据预估并发量设置，本项目为小型商城，10 个连接足够
 * - idleTimeout 设为 10 秒，快速回收闲置连接
 * - enableKeepAlive 保持长连接，避免频繁握手
 * - waitForConnections 排队等待，避免高并发时直接拒绝请求
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'online_store',
  charset: 'utf8mb4',
  connectionLimit: 10,           // 最大连接数
  queueLimit: 0,                 // 排队无上限（0 = 无限排队）
  waitForConnections: true,      // 无可用连接时等待而非报错
  idleTimeout: 10000,            // 闲置连接超时 (ms)
  enableKeepAlive: true,         // TCP Keep-Alive
  keepAliveInitialDelay: 0,     // Keep-Alive 初始延迟
});

export default pool;
```

### 5.2 连接池参数说明

| 参数 | 推荐值 | 说明 |
|---|---|---|
| `connectionLimit` | 10 | 小型项目，10 个并发连接足够；可根据 `max_connections / 应用实例数` 调优 |
| `queueLimit` | 0 | 允许无限排队，避免高并发时直接报 ECONNREFUSED |
| `waitForConnections` | true | 无空闲连接时排队等待 |
| `idleTimeout` | 10000 | 10 秒闲置后释放，防止连接浪费 |
| `enableKeepAlive` | true | 避免因长闲置被 MySQL 服务端断开 |

### 5.3 数据库连接获取最佳实践

```typescript
// 推荐：每次请求从连接池获取连接，操作完立即释放
import pool from '../config/db';

class OrderModel {
  static async createOrder(data: CreateOrderParams): Promise<Order> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      // ... 执行 SQL 操作
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release(); // 务必在 finally 中释放
    }
  }
}
```

### 5.4 MySQL 服务端配置建议

```ini
# my.cnf / my.ini
[mysqld]
character-set-server = utf8mb4
collation-server     = utf8mb4_unicode_ci
max_connections      = 200        # 至少 2 倍于所有应用实例的连接池总和
innodb_buffer_pool_size = 256M   # 小型项目 256MB 足够
innodb_flush_log_at_trx_commit = 2  # 性能优先，允许 1 秒延迟
```

---

## 6. 环境变量设计方案

### 6.1 .env 文件结构

```bash
# ===========================================
# Mini 在线商城 - 环境变量配置
# ===========================================

# ---------- 应用配置 ----------
NODE_ENV=development              # development | production | test
PORT=3000                         # 后端服务端口
APP_NAME=MiniOnlineStore          # 应用名称（用于日志标识）

# ---------- 数据库配置 ----------
DB_HOST=127.0.0.1                 # MySQL 主机地址
DB_PORT=3306                      # MySQL 端口
DB_USER=root                      # 数据库用户名
DB_PASSWORD=your_password         # 数据库密码（生产环境使用强密码）
DB_NAME=online_store              # 数据库名称
DB_CONNECTION_LIMIT=10            # 连接池最大连接数
DB_IDLE_TIMEOUT=10000             # 闲置连接超时 (ms)

# ---------- 日志配置 ----------
LOG_LEVEL=debug                   # error | warn | info | debug
LOG_DIR=./logs                    # 日志文件目录

# ---------- CORS 配置 ----------
CORS_ORIGIN=http://localhost:5173 # 允许的前端源（Vite 默认端口）

# ---------- 分页默认值 ----------
PAGE_SIZE_DEFAULT=20              # 默认每页条数
PAGE_SIZE_MAX=100                 # 最大每页条数

# ---------- 业务配置 ----------
STOCK_ALERT_THRESHOLD=10          # 库存预警阈值（低于此值前端显示"即将售罄"）
ORDER_AUTO_CANCEL_MINUTES=30      # 待支付订单自动取消时间（分钟，Phase 2 启用）
```

### 6.2 .env.example 模板（提交到 Git）

```bash
# ===========================================
# Mini 在线商城 - 环境变量模板
# 复制此文件为 .env 并填写实际值
# ===========================================

NODE_ENV=development
PORT=3000
APP_NAME=MiniOnlineStore

# 数据库（必填）
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=online_store
DB_CONNECTION_LIMIT=10
DB_IDLE_TIMEOUT=10000

# 日志
LOG_LEVEL=debug
LOG_DIR=./logs

# CORS
CORS_ORIGIN=http://localhost:5173

# 分页
PAGE_SIZE_DEFAULT=20
PAGE_SIZE_MAX=100

# 业务
STOCK_ALERT_THRESHOLD=10
ORDER_AUTO_CANCEL_MINUTES=30
```

### 6.3 环境变量校验逻辑

```typescript
// server/src/config/env.ts

/**
 * 启动时校验必需环境变量，避免运行时才发现配置缺失
 */
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME'] as const;

export function validateEnv(): void {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`缺少必需的环境变量: ${missing.join(', ')}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  db: {
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME!,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
    idleTimeout: Number(process.env.DB_IDLE_TIMEOUT) || 10000,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  pagination: {
    defaultPageSize: Number(process.env.PAGE_SIZE_DEFAULT) || 20,
    maxPageSize: Number(process.env.PAGE_SIZE_MAX) || 100,
  },
} as const;
```

### 6.4 各环境差异化配置

| 变量 | development | production | test |
|---|---|---|---|
| `NODE_ENV` | development | production | test |
| `PORT` | 3000 | 3000 | 3001 |
| `LOG_LEVEL` | debug | info | error |
| `DB_CONNECTION_LIMIT` | 10 | 20 | 5 |
| `CORS_ORIGIN` | http://localhost:5173 | https://your-domain.com | * |

---

## 7. 关键设计决策记录

| 决策点 | 方案 | 理由 |
|---|---|---|
| 状态管理 | React Context + 本地 useState | 项目规模小，无需引入 Redux/Zustand |
| 表单校验 | 前端 useForm + 后端 Joi | 双重校验，PRD 明确要求 |
| 数据请求 | 自定义 fetch 封装而非 axios | 减少依赖，fetch 已足够 |
| 数据库驱动 | mysql2/promise | Node.js 生态最成熟的 MySQL 驱动，支持 Promise/async-await |
| 乐观锁字段 | `version INT NOT NULL DEFAULT 0` | 相比悲观锁，乐观锁不阻塞读，适合电商读多写少场景 |
| 订单号生成 | 时间戳 + 自增序号 + 用户 ID 后缀 | 简单可读，不依赖外部服务；后期可升级为雪花 ID |
| 事务范围 | 仅订单创建/取消使用事务 | 购物车、地址单表操作无需事务，减少锁开销 |
