# Mini 在线商城

一个用于学习全栈电商业务逻辑的极简在线商城，实现商品浏览、购物车、订单管理和地址管理。

## 功能

- 商品列表与详情展示
- 购物车（添加、修改数量、删除、库存校验）
- 订单创建（事务扣库存、价格快照）、列表、详情、取消
- 收货地址管理（默认地址逻辑）
- 限于“待支付”状态，无实际支付

## 技术栈

**前端**：React + TypeScript + Vite  
**后端**：Node.js + Express  
**数据库**：MySQL  
**其他**：mysql2、joi/express-validator、Jest（测试）

## 快速开始

### 1. 环境准备

- Node.js >= 18，MySQL 8.0

### 2. 数据库初始化

执行 `database.md` 中的 SQL 建表脚本。

### 3. 后端启动

```bash
cd server
npm install
cp .env.example .env   # 配置数据库连接
npm run dev
```
