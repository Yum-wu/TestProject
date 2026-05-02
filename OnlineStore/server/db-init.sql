-- =============================================
-- Mini 在线商城 — 完整数据库建表 + 种子数据脚本
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- =============================================
-- 2. 商品表（含乐观锁）
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
  KEY idx_category (category),
  KEY idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';

-- =============================================
-- 3. 购物车表
-- =============================================
CREATE TABLE IF NOT EXISTS cart_items (
  id          BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT  COMMENT '购物车项ID',
  user_id     BIGINT UNSIGNED  NOT NULL                 COMMENT '用户ID',
  product_id  BIGINT UNSIGNED  NOT NULL                 COMMENT '商品ID',
  quantity    INT UNSIGNED     NOT NULL DEFAULT 1       COMMENT '数量',
  created_at  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '添加时间',
  updated_at  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_product (user_id, product_id),
  KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='购物车表';

-- =============================================
-- 4. 收货地址表
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
  KEY idx_user_default (user_id, is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收货地址表';

-- =============================================
-- 5. 订单表
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
  id               BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT  COMMENT '订单ID',
  order_no         VARCHAR(32)      NOT NULL                 COMMENT '订单号（唯一）',
  user_id          BIGINT UNSIGNED  NOT NULL                 COMMENT '用户ID',
  address_snapshot JSON             NOT NULL                 COMMENT '收货地址快照（下单时地址JSON）',
  total_amount     DECIMAL(10,2)    NOT NULL                 COMMENT '订单总金额',
  status           ENUM('pending','cancelled')
                    NOT NULL DEFAULT 'pending'               COMMENT '订单状态',
  created_at       DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '下单时间',
  updated_at       DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_order_no (order_no),
  KEY idx_user_status (user_id, status),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- =============================================
-- 6. 订单商品明细表
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
  KEY idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单商品明细表';

-- =============================================
-- 种子数据：测试用户
-- =============================================
INSERT INTO users (username, email, password_hash) VALUES
('testuser', 'test@example.com', '$2b$10$placeholder_hash_for_123456')
ON DUPLICATE KEY UPDATE username=username;

-- =============================================
-- 种子数据：示例商品
-- =============================================
INSERT INTO products (name, description, price, stock, category, image_url) VALUES
('无线蓝牙耳机', '高品质降噪蓝牙耳机，续航24小时，支持蓝牙5.3', 299.00, 100, '电子产品', '/images/headphone.svg'),
('纯棉T恤', '舒适透气纯棉T恤，多色可选，适合日常穿着', 79.90, 200, '服装', '/images/tshirt.svg'),
('Java编程思想', '经典Java学习书籍，第4版，深入浅出讲解Java核心', 89.00, 50, '图书', '/images/java-book.svg'),
('机械键盘', '87键青轴机械键盘，RGB背光，办公游戏两相宜', 459.00, 30, '电子产品', '/images/keyboard.svg'),
('运动跑鞋', '轻量缓震跑鞋，透气网面，适合日常跑步训练', 329.00, 80, '运动', '/images/shoes.svg'),
('React实战教程', 'React 18 + TypeScript全栈开发实战，含项目案例', 69.00, 35, '图书', '/images/react-book.svg'),
('保温杯', '316不锈钢保温杯，500ml容量，12小时保温', 129.00, 150, '生活', '/images/thermos.svg'),
('瑜伽垫', '加厚防滑瑜伽垫，双面防滑纹理，健身必备', 89.00, 60, '运动', '/images/yogamat.svg'),
('帆布双肩包', '简约大容量帆布背包，笔记本电脑隔层，通勤旅行皆可', 199.00, 45, '生活', '/images/backpack.svg'),
('鸭舌帽', '纯色百搭鸭舌帽，透气舒适，男女通用', 39.90, 120, '服装', '/images/cap.svg');
