# Mini 在线商城 — 数据库设计文档

---

## 1. 数据库概览

| 项目 | 说明 |
|---|---|
| 数据库名称 | `online_store` |
| 字符集 | `utf8mb4` |
| 排序规则 | `utf8mb4_unicode_ci` |
| 存储引擎 | `InnoDB`（所有表，支持事务与外键） |
| MySQL 版本要求 | >= 8.0 |

### ER 关系简图

```
┌──────────┐     ┌───────────┐     ┌───────────┐
│  users   │────▶│ addresses │     │  orders   │
└────┬─────┘     └───────────┘     └─────┬─────┘
     │                                   │
     │   ┌───────────┐                   │
     ├──▶│cart_items │                   │
     │   └─────┬─────┘                   │
     │         │                         │
     ▼         ▼                         ▼
┌──────────┐                      ┌─────────────┐
│ products │◀─────────────────────│ order_items │
└──────────┘                      └─────────────┘
```

---

## 2. 建库脚本

```sql
-- =============================================
-- 创建数据库
-- =============================================
CREATE DATABASE IF NOT EXISTS online_store
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE online_store;
```

---

## 3. 建表 SQL

### 3.1 用户表 `users`

```sql
-- =============================================
-- 用户表
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id          BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT  COMMENT '用户ID',
  username    VARCHAR(50)      NOT NULL                 COMMENT '用户名',
  email       VARCHAR(100)     NOT NULL                 COMMENT '邮箱',
  password_hash VARCHAR(255)   NOT NULL                 COMMENT '密码哈希值 (bcrypt)',
  created_at  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  PRIMARY KEY (id),
  UNIQUE KEY  uk_email (email)                          COMMENT '邮箱唯一索引',
  UNIQUE KEY  uk_username (username)                    COMMENT '用户名唯一索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';
```

**字段说明**

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | PK, AUTO_INCREMENT | 用户唯一标识 |
| `username` | `VARCHAR(50)` | NOT NULL, UNIQUE | 登录用户名 |
| `email` | `VARCHAR(100)` | NOT NULL, UNIQUE | 邮箱，用于找回密码等 |
| `password_hash` | `VARCHAR(255)` | NOT NULL | bcrypt 哈希后的密码 |
| `created_at` | `DATETIME` | DEFAULT CURRENT_TIMESTAMP | 注册时间 |
| `updated_at` | `DATETIME` | ON UPDATE CURRENT_TIMESTAMP | 最后修改时间 |

**索引**

| 索引名 | 字段 | 类型 | 说明 |
|---|---|---|---|
| `PRIMARY` | `id` | 主键 | 聚簇索引 |
| `uk_email` | `email` | UNIQUE | 邮箱唯一，加速登录查询 |
| `uk_username` | `username` | UNIQUE | 用户名唯一，加速登录查询 |

---

### 3.2 商品表 `products`

```sql
-- =============================================
-- 商品表（含乐观锁版本号）
-- =============================================
CREATE TABLE IF NOT EXISTS products (
  id          BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT  COMMENT '商品ID',
  name        VARCHAR(200)     NOT NULL                 COMMENT '商品名称',
  description TEXT                                      COMMENT '商品描述',
  price       DECIMAL(10,2)    NOT NULL                 COMMENT '商品单价',
  stock       INT UNSIGNED     NOT NULL DEFAULT 0       COMMENT '库存数量',
  category    VARCHAR(50)      NOT NULL DEFAULT ''      COMMENT '商品分类',
  image_url   VARCHAR(500)     DEFAULT ''               COMMENT '商品图片URL',
  version     INT UNSIGNED     NOT NULL DEFAULT 0       COMMENT '乐观锁版本号',
  created_at  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  PRIMARY KEY (id),
  KEY         idx_category (category)                   COMMENT '分类索引，加速按分类筛选',
  KEY         idx_name (name)                           COMMENT '商品名称索引，加速搜索'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';
```

**字段说明**

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | PK, AUTO_INCREMENT | 商品唯一标识 |
| `name` | `VARCHAR(200)` | NOT NULL | 商品名称 |
| `description` | `TEXT` | NULLABLE | 商品详细描述 |
| `price` | `DECIMAL(10,2)` | NOT NULL | 价格，精确到分 |
| `stock` | `INT UNSIGNED` | NOT NULL, DEFAULT 0 | 当前库存数量 |
| `category` | `VARCHAR(50)` | NOT NULL | 分类标签 |
| `image_url` | `VARCHAR(500)` | DEFAULT '' | 商品主图 URL |
| `version` | `INT UNSIGNED` | NOT NULL, DEFAULT 0 | 乐观锁版本号，每次库存变更 +1 |
| `created_at` | `DATETIME` | DEFAULT CURRENT_TIMESTAMP | 上架时间 |
| `updated_at` | `DATETIME` | ON UPDATE CURRENT_TIMESTAMP | 最后修改时间 |

**索引**

| 索引名 | 字段 | 类型 | 说明 |
|---|---|---|---|
| `PRIMARY` | `id` | 主键 | 聚簇索引 |
| `idx_category` | `category` | 普通索引 | 加速 `WHERE category = ?` 查询 |
| `idx_name` | `name` | 普通索引 | 加速 `WHERE name LIKE '...'` 模糊搜索 |

**乐观锁使用方式**

```sql
-- 下单扣减库存示例（在业务代码中执行）
UPDATE products
SET stock = stock - @quantity,
    version = version + 1
WHERE id = @product_id
  AND stock >= @quantity          -- 库存充足校验
  AND version = @current_version; -- 乐观锁条件

-- 检查 affected_rows:
--   = 0 → 并发冲突或库存不足，回滚事务
--   = 1 → 扣减成功
```

---

### 3.3 购物车表 `cart_items`

```sql
-- =============================================
-- 购物车表
-- =============================================
CREATE TABLE IF NOT EXISTS cart_items (
  id          BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT  COMMENT '购物车项ID',
  user_id     BIGINT UNSIGNED  NOT NULL                 COMMENT '用户ID',
  product_id  BIGINT UNSIGNED  NOT NULL                 COMMENT '商品ID',
  quantity    INT UNSIGNED     NOT NULL DEFAULT 1       COMMENT '数量',
  created_at  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '添加时间',
  updated_at  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  PRIMARY KEY (id),
  UNIQUE KEY  uk_user_product (user_id, product_id)     COMMENT '同一用户对同一商品只有一条购物车记录',
  KEY         idx_user_id (user_id)                     COMMENT '用户维度查询索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='购物车表';
```

**字段说明**

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | PK, AUTO_INCREMENT | 购物车项唯一标识 |
| `user_id` | `BIGINT UNSIGNED` | NOT NULL | 关联用户 |
| `product_id` | `BIGINT UNSIGNED` | NOT NULL | 关联商品 |
| `quantity` | `INT UNSIGNED` | NOT NULL, DEFAULT 1 | 购买数量 |
| `created_at` | `DATETIME` | DEFAULT CURRENT_TIMESTAMP | 首次添加到购物车时间 |
| `updated_at` | `DATETIME` | ON UPDATE CURRENT_TIMESTAMP | 最后修改数量时间 |

**索引**

| 索引名 | 字段 | 类型 | 说明 |
|---|---|---|---|
| `PRIMARY` | `id` | 主键 | 聚簇索引 |
| `uk_user_product` | `(user_id, product_id)` | UNIQUE | 保证同一用户对同一商品仅一条记录；查询时走 user_id 前缀 |
| `idx_user_id` | `user_id` | 普通索引 | 纯 user_id 查询（虽然被 uk 覆盖，但显式声明更清晰） |

---

### 3.4 收货地址表 `addresses`

```sql
-- =============================================
-- 收货地址表
-- =============================================
CREATE TABLE IF NOT EXISTS addresses (
  id            BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT  COMMENT '地址ID',
  user_id       BIGINT UNSIGNED  NOT NULL                 COMMENT '用户ID',
  receiver_name VARCHAR(50)      NOT NULL                 COMMENT '收货人姓名',
  phone         VARCHAR(20)      NOT NULL                 COMMENT '联系电话',
  province      VARCHAR(50)      NOT NULL                 COMMENT '省份',
  city          VARCHAR(50)      NOT NULL                 COMMENT '城市',
  district      VARCHAR(50)      NOT NULL                 COMMENT '区/县',
  detail        VARCHAR(200)     NOT NULL                 COMMENT '详细地址（街道/门牌号）',
  is_default    TINYINT(1)       NOT NULL DEFAULT 0       COMMENT '是否默认地址 (1=是, 0=否)',
  created_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  PRIMARY KEY (id),
  KEY           idx_user_default (user_id, is_default)    COMMENT '用户默认地址查询索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收货地址表';
```

**字段说明**

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | PK, AUTO_INCREMENT | 地址唯一标识 |
| `user_id` | `BIGINT UNSIGNED` | NOT NULL | 所属用户 |
| `receiver_name` | `VARCHAR(50)` | NOT NULL | 收货人姓名 |
| `phone` | `VARCHAR(20)` | NOT NULL | 联系电话 |
| `province` | `VARCHAR(50)` | NOT NULL | 省份 |
| `city` | `VARCHAR(50)` | NOT NULL | 城市 |
| `district` | `VARCHAR(50)` | NOT NULL | 区/县 |
| `detail` | `VARCHAR(200)` | NOT NULL | 详细地址 |
| `is_default` | `TINYINT(1)` | NOT NULL, DEFAULT 0 | 默认地址标记 |
| `created_at` | `DATETIME` | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `updated_at` | `DATETIME` | ON UPDATE CURRENT_TIMESTAMP | 最后修改时间 |

**索引**

| 索引名 | 字段 | 类型 | 说明 |
|---|---|---|---|
| `PRIMARY` | `id` | 主键 | 聚簇索引 |
| `idx_user_default` | `(user_id, is_default)` | 复合索引 | 加速 `WHERE user_id=? AND is_default=1` 查询；也加速该用户所有地址查询 |

**默认地址业务规则（PRD 映射）**

| 场景 | 操作 |
|---|---|
| 新增地址并设为默认 | `UPDATE addresses SET is_default=0 WHERE user_id=?;` 再插入新地址 `is_default=1` |
| 编辑地址并设为默认 | 同上，先取消其他默认，再更新当前 |
| 删除默认地址 | 删除后，`UPDATE addresses SET is_default=1 WHERE user_id=? LIMIT 1`（将剩余第一个设为默认） |

---

### 3.5 订单表 `orders`

```sql
-- =============================================
-- 订单表
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
  id               BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT  COMMENT '订单ID',
  order_no         VARCHAR(32)      NOT NULL                 COMMENT '订单号（唯一）',
  user_id          BIGINT UNSIGNED  NOT NULL                 COMMENT '用户ID',
  address_snapshot JSON             NOT NULL                 COMMENT '收货地址快照（下单时地址JSON）',
  total_amount     DECIMAL(10,2)    NOT NULL                 COMMENT '订单总金额',
  status           ENUM('pending','cancelled')               -- 状态枚举
                    NOT NULL DEFAULT 'pending'               COMMENT '订单状态',
  created_at       DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '下单时间',
  updated_at       DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  PRIMARY KEY (id),
  UNIQUE KEY       uk_order_no (order_no)                    COMMENT '订单号唯一索引',
  KEY              idx_user_status (user_id, status)         COMMENT '用户+状态复合索引（列表筛选）',
  KEY              idx_created_at (created_at)               COMMENT '下单时间索引（按时间排序/查询）'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';
```

**字段说明**

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | PK, AUTO_INCREMENT | 订单内部 ID |
| `order_no` | `VARCHAR(32)` | NOT NULL, UNIQUE | 对外唯一订单号 |
| `user_id` | `BIGINT UNSIGNED` | NOT NULL | 下单用户 |
| `address_snapshot` | `JSON` | NOT NULL | 下单时收货地址的完整 JSON 快照，解耦地址表的后续变更 |
| `total_amount` | `DECIMAL(10,2)` | NOT NULL | 订单总金额（各 order_items.price * quantity 之和） |
| `status` | `ENUM('pending','cancelled')` | NOT NULL, DEFAULT 'pending' | 订单状态：pending=待支付, cancelled=已取消 |
| `created_at` | `DATETIME` | DEFAULT CURRENT_TIMESTAMP | 下单时间 |
| `updated_at` | `DATETIME` | ON UPDATE CURRENT_TIMESTAMP | 状态变更时间 |

**索引**

| 索引名 | 字段 | 类型 | 说明 |
|---|---|---|---|
| `PRIMARY` | `id` | 主键 | 聚簇索引 |
| `uk_order_no` | `order_no` | UNIQUE | 订单号唯一；查询详情时走此索引 |
| `idx_user_status` | `(user_id, status)` | 复合索引 | 加速 `WHERE user_id=? AND status=?` 列表查询 |
| `idx_created_at` | `created_at` | 普通索引 | 按时间倒序排列时使用，避免 filesort |

**address_snapshot JSON 结构**

```json
{
  "receiver_name": "张三",
  "phone": "13800138000",
  "province": "广东省",
  "city": "深圳市",
  "district": "南山区",
  "detail": "科技园路1号创新大厦"
}
```

---

### 3.6 订单商品表 `order_items`

```sql
-- =============================================
-- 订单商品明细表（含价格快照）
-- =============================================
CREATE TABLE IF NOT EXISTS order_items (
  id            BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT  COMMENT '明细ID',
  order_id      BIGINT UNSIGNED  NOT NULL                 COMMENT '关联订单ID',
  product_id    BIGINT UNSIGNED  NOT NULL                 COMMENT '商品ID（用于追溯，非外键约束）',
  product_name  VARCHAR(200)     NOT NULL                 COMMENT '商品名称快照',
  product_image VARCHAR(500)     DEFAULT ''               COMMENT '商品图片快照',
  price         DECIMAL(10,2)    NOT NULL                 COMMENT '下单时商品单价（价格快照）',
  quantity      INT UNSIGNED     NOT NULL                 COMMENT '购买数量',
  created_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

  PRIMARY KEY (id),
  KEY           idx_order_id (order_id)                   COMMENT '订单维度查询索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单商品明细表';
```

**字段说明**

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | PK, AUTO_INCREMENT | 明细唯一标识 |
| `order_id` | `BIGINT UNSIGNED` | NOT NULL | 关联订单 |
| `product_id` | `BIGINT UNSIGNED` | NOT NULL | 商品 ID（用于追溯），非外键约束，避免删商品影响订单 |
| `product_name` | `VARCHAR(200)` | NOT NULL | 下单时商品名称快照 |
| `product_image` | `VARCHAR(500)` | DEFAULT '' | 下单时商品图片快照 |
| `price` | `DECIMAL(10,2)` | NOT NULL | 下单时商品单价快照（与 products.price 解耦） |
| `quantity` | `INT UNSIGNED` | NOT NULL | 购买数量 |
| `created_at` | `DATETIME` | DEFAULT CURRENT_TIMESTAMP | 创建时间（与订单创建时间一致） |

**索引**

| 索引名 | 字段 | 类型 | 说明 |
|---|---|---|---|
| `PRIMARY` | `id` | 主键 | 聚簇索引 |
| `idx_order_id` | `order_id` | 普通索引 | 加速 `WHERE order_id=?` 查询（订单详情关联明细） |

---

## 4. 完整建表脚本（一键执行）

```sql
-- =============================================
-- Mini 在线商城 — 完整数据库建表脚本
-- 适用于 MySQL 8.0+
-- 执行方式: mysql -u root -p < db-init.sql
-- =============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS online_store
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE online_store;

-- =============================================
-- 1. 用户表
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id            BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  username      VARCHAR(50)      NOT NULL,
  email         VARCHAR(100)     NOT NULL,
  password_hash VARCHAR(255)     NOT NULL,
  created_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_email (email),
  UNIQUE KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 2. 商品表（含乐观锁）
-- =============================================
CREATE TABLE IF NOT EXISTS products (
  id          BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name        VARCHAR(200)     NOT NULL,
  description TEXT,
  price       DECIMAL(10,2)    NOT NULL,
  stock       INT UNSIGNED     NOT NULL DEFAULT 0,
  category    VARCHAR(50)      NOT NULL DEFAULT '',
  image_url   VARCHAR(500)     DEFAULT '',
  version     INT UNSIGNED     NOT NULL DEFAULT 0,
  created_at  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_category (category),
  KEY idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 3. 购物车表
-- =============================================
CREATE TABLE IF NOT EXISTS cart_items (
  id          BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED  NOT NULL,
  product_id  BIGINT UNSIGNED  NOT NULL,
  quantity    INT UNSIGNED     NOT NULL DEFAULT 1,
  created_at  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_product (user_id, product_id),
  KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 4. 收货地址表
-- =============================================
CREATE TABLE IF NOT EXISTS addresses (
  id            BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED  NOT NULL,
  receiver_name VARCHAR(50)      NOT NULL,
  phone         VARCHAR(20)      NOT NULL,
  province      VARCHAR(50)      NOT NULL,
  city          VARCHAR(50)      NOT NULL,
  district      VARCHAR(50)      NOT NULL,
  detail        VARCHAR(200)     NOT NULL,
  is_default    TINYINT(1)       NOT NULL DEFAULT 0,
  created_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_default (user_id, is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 5. 订单表
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
  id               BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  order_no         VARCHAR(32)      NOT NULL,
  user_id          BIGINT UNSIGNED  NOT NULL,
  address_snapshot JSON             NOT NULL,
  total_amount     DECIMAL(10,2)    NOT NULL,
  status           ENUM('pending','cancelled') NOT NULL DEFAULT 'pending',
  created_at       DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_order_no (order_no),
  KEY idx_user_status (user_id, status),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 6. 订单商品明细表
-- =============================================
CREATE TABLE IF NOT EXISTS order_items (
  id            BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  order_id      BIGINT UNSIGNED  NOT NULL,
  product_id    BIGINT UNSIGNED  NOT NULL,
  product_name  VARCHAR(200)     NOT NULL,
  product_image VARCHAR(500)     DEFAULT '',
  price         DECIMAL(10,2)    NOT NULL,
  quantity      INT UNSIGNED     NOT NULL,
  created_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 5. 索引汇总

| 表 | 索引名 | 字段 | 类型 | 用途 |
|---|---|---|---|---|
| `users` | `PRIMARY` | `id` | 主键 | 行标识 |
| `users` | `uk_email` | `email` | UNIQUE | 邮箱登录 |
| `users` | `uk_username` | `username` | UNIQUE | 用户名登录 |
| `products` | `PRIMARY` | `id` | 主键 | 行标识 |
| `products` | `idx_category` | `category` | 普通 | 按分类浏览 |
| `products` | `idx_name` | `name` | 普通 | 搜索商品 |
| `cart_items` | `PRIMARY` | `id` | 主键 | 行标识 |
| `cart_items` | `uk_user_product` | `(user_id, product_id)` | UNIQUE | 一人一商品一条记录 |
| `cart_items` | `idx_user_id` | `user_id` | 普通 | 查用户购物车 |
| `addresses` | `PRIMARY` | `id` | 主键 | 行标识 |
| `addresses` | `idx_user_default` | `(user_id, is_default)` | 复合 | 查用户地址列表 + 默认地址 |
| `orders` | `PRIMARY` | `id` | 主键 | 行标识 |
| `orders` | `uk_order_no` | `order_no` | UNIQUE | 按订单号查详情 |
| `orders` | `idx_user_status` | `(user_id, status)` | 复合 | 用户订单列表+筛选 |
| `orders` | `idx_created_at` | `created_at` | 普通 | 时间排序 |
| `order_items` | `PRIMARY` | `id` | 主键 | 行标识 |
| `order_items` | `idx_order_id` | `order_id` | 普通 | 关联订单查明细 |

---

## 6. 字符集对比说明

| 字符集 | 存储长度 | 支持 Emoji | 适用场景 |
|---|---|---|---|
| `utf8` | 1-3 字节 | 否 | MySQL 旧版默认，不推荐 |
| `utf8mb4` | 1-4 字节 | 是 | **本项目选用**，完整 Unicode 支持 |
| `utf8mb4_unicode_ci` | — | — | 排序规则，大小写不敏感，准确度高 |

**选用 `utf8mb4_unicode_ci` 理由**：
- 支持用户输入可能包含的 Emoji、特殊字符
- `unicode_ci` 排序准确度高于 `general_ci`，适合国际化场景
- MySQL 8.0 官方推荐

---

## 7. 外键策略：不使用物理外键

本项目**不定义** `FOREIGN KEY` 物理约束，理由如下：

| 考量点 | 说明 |
|---|---|
| 数据迁移 | 物理外键在数据迁移/分库分表时会成为阻碍 |
| 性能 | 每次 INSERT/UPDATE/DELETE 需要对父表加共享锁校验 |
| 灵活性 | 允许商品删除后订单依然保留（通过快照字段，PRD 要求） |
| 应用层保证 | 数据一致性由 Service 层事务逻辑 + 应用校验保证 |

**替代方案**：在 Service 层做逻辑校验（如创建订单时验证 product_id 是否存在、user_id 是否合法等）。

---

## 8. 种子数据建议

为方便开发测试，建议插入以下最小种子数据：

```sql
-- 测试用户（密码均为 "123456" 的 bcrypt 哈希）
INSERT INTO users (username, email, password_hash) VALUES
('testuser', 'test@example.com', '$2b$10$...');

-- 示例商品
INSERT INTO products (name, description, price, stock, category, image_url) VALUES
('无线蓝牙耳机', '高品质降噪蓝牙耳机，续航24小时', 299.00, 100, '电子产品', '/images/headphone.jpg'),
('纯棉T恤', '舒适透气，多色可选', 79.90, 200, '服装', '/images/tshirt.jpg'),
('Java编程思想', '经典Java学习书籍，第4版', 89.00, 50, '图书', '/images/java-book.jpg');
```
