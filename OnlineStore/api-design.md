# Mini 在线商城 — API 接口设计文档

---

## 1. API 设计规范

### 1.1 基础信息

| 项目 | 说明 |
|---|---|
| 协议 | HTTP/HTTPS |
| 数据格式 | JSON |
| 字符编码 | UTF-8 |
| 基础路径 | `/api` |
| 开发端口 | `http://localhost:3000` |

### 1.2 统一响应格式

所有 API 响应均采用如下 JSON 结构：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
|---|---|---|
| `code` | `number` | 业务状态码，`0` 表示成功，非 `0` 表示异常 |
| `message` | `string` | 状态描述信息 |
| `data` | `any` | 响应数据，成功时为实际数据，失败时为 `null` |

### 1.3 分页参数设计

需要分页的接口（如商品列表、订单列表），统一使用以下查询参数：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| `page` | `number` | 否 | `1` | 页码，从 1 开始 |
| `pageSize` | `number` | 否 | `20` | 每页条数，最大 `100` |

**分页响应格式**（`data` 字段结构）：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

| 分页字段 | 类型 | 说明 |
|---|---|---|
| `list` | `array` | 当前页数据列表 |
| `pagination.page` | `number` | 当前页码 |
| `pagination.pageSize` | `number` | 每页条数 |
| `pagination.total` | `number` | 总记录数 |
| `pagination.totalPages` | `number` | 总页数 |

---

## 2. 错误码定义

### 2.1 错误码分类

| 范围 | 类别 | 说明 |
|---|---|---|
| `0` | 成功 | 请求处理成功 |
| `1000 - 1999` | 参数校验错误 | 请求参数不合法（前后端校验） |
| `2000 - 2999` | 业务逻辑错误 | 业务规则不满足（库存不足、状态不符等） |
| `3000 - 3999` | 系统/服务错误 | 数据库异常、网络超时等 |
| `4000 - 4999` | 认证/授权错误 | Token 无效、权限不足 |

### 2.2 详细错误码表

| 错误码 | 说明 | 典型场景 |
|---|---|---|
| `0` | 成功 | — |
| **参数校验 1xxx** | | |
| `1001` | 缺少必填参数 | 请求体缺少 `product_id` |
| `1002` | 参数类型错误 | `quantity` 传入字符串而非数字 |
| `1003` | 参数值越界 | `quantity` 为 0 或负数；`pageSize` 超过 100 |
| `1004` | 参数格式错误 | `email` 格式不正确 |
| **商品 2xxx** | | |
| `2001` | 商品不存在 | `product_id` 在数据库中不存在 |
| `2002` | 商品已下架 | 商品存在但标记为下架状态（后期扩展） |
| **购物车 21xx** | | |
| `2101` | 库存不足 | 添加购物车或修改数量时，`quantity > stock` |
| `2102` | 购物车项不存在 | 修改/删除不存在的购物车项 |
| `2103` | 购物车为空 | 创建订单时购物车中无商品 |
| **订单 22xx** | | |
| `2201` | 订单不存在 | 查询/取消不存在的订单 |
| `2202` | 订单状态不允许操作 | 尝试取消非"待支付"状态的订单 |
| `2203` | 库存扣减冲突 | 下单时商品库存已被其他请求扣减（乐观锁失败） |
| `2204` | 收货地址缺失 | 创建订单时未提供收货地址 |
| **地址 23xx** | | |
| `2301` | 地址不存在 | 编辑/删除不存在的地址 |
| `2302` | 用户无可用地址 | 创建订单时用户无任何地址 |
| **系统错误 3xxx** | | |
| `3001` | 数据库错误 | 数据库连接失败或查询异常 |
| `3002` | 事务失败 | 订单创建事务回滚 |
| `3003` | 服务内部错误 | 未预期的运行时异常 |
| **认证 4xxx** | | |
| `4001` | 未登录 | 请求未携带有效 Token |
| `4002` | Token 无效 | Token 过期或伪造 |
| `4003` | 无操作权限 | 操作不属于当前用户的数据（如删除他人购物车项） |

---

## 3. API 端点总览

| 模块 | 方法 | 端点 | 说明 | 认证 |
|---|---|---|---|---|
| **商品** | `GET` | `/api/products` | 商品列表（分页+筛选） | 否 |
| **商品** | `GET` | `/api/products/:id` | 商品详情 | 否 |
| **购物车** | `POST` | `/api/cart` | 添加商品到购物车 | 是 |
| **购物车** | `GET` | `/api/cart` | 查看购物车 | 是 |
| **购物车** | `PATCH` | `/api/cart/:id` | 修改购物车项数量 | 是 |
| **购物车** | `DELETE` | `/api/cart/:id` | 删除购物车项 | 是 |
| **订单** | `POST` | `/api/orders` | 创建订单 | 是 |
| **订单** | `GET` | `/api/orders` | 订单列表 | 是 |
| **订单** | `GET` | `/api/orders/:id` | 订单详情 | 是 |
| **订单** | `PATCH` | `/api/orders/:id/cancel` | 取消订单 | 是 |
| **地址** | `POST` | `/api/addresses` | 新增地址 | 是 |
| **地址** | `GET` | `/api/addresses` | 地址列表 | 是 |
| **地址** | `PUT` | `/api/addresses/:id` | 编辑地址 | 是 |
| **地址** | `DELETE` | `/api/addresses/:id` | 删除地址 | 是 |

---

## 4. 商品接口

### 4.1 商品列表

```
GET /api/products
```

**查询参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| `page` | `number` | 否 | 1 | 页码 |
| `pageSize` | `number` | 否 | 20 | 每页条数（最大 100） |
| `category` | `string` | 否 | — | 按分类筛选 |
| `keyword` | `string` | 否 | — | 按商品名称模糊搜索 |
| `sort` | `string` | 否 | `created_at_desc` | 排序方式：`price_asc` / `price_desc` / `created_at_desc` / `created_at_asc` |

**请求示例**

```
GET /api/products?page=1&pageSize=10&category=电子产品&keyword=耳机&sort=price_asc
```

**成功响应**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "无线蓝牙耳机",
        "price": 299.00,
        "stock": 95,
        "category": "电子产品",
        "image_url": "/images/headphone.jpg",
        "created_at": "2026-04-01T10:00:00.000Z"
      },
      {
        "id": 4,
        "name": "有线入耳式耳机",
        "price": 99.00,
        "stock": 60,
        "category": "电子产品",
        "image_url": "/images/earphone.jpg",
        "created_at": "2026-04-05T08:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 12,
      "totalPages": 2
    }
  }
}
```

**注意事项**：
- 列表接口不返回 `description` 完整字段，减少数据传输量
- 前端根据 `stock` 值配合阈值显示"即将售罄"标签

---

### 4.2 商品详情

```
GET /api/products/:id
```

**路径参数**

| 参数 | 类型 | 说明 |
|---|---|---|
| `id` | `number` | 商品 ID |

**请求示例**

```
GET /api/products/1
```

**成功响应**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "name": "无线蓝牙耳机",
    "description": "高品质降噪蓝牙耳机，续航24小时，支持蓝牙5.3",
    "price": 299.00,
    "stock": 95,
    "category": "电子产品",
    "image_url": "/images/headphone.jpg",
    "created_at": "2026-04-01T10:00:00.000Z",
    "updated_at": "2026-04-20T14:30:00.000Z"
  }
}
```

**错误响应**

```json
{
  "code": 2001,
  "message": "商品不存在",
  "data": null
}
```

---

## 5. 购物车接口

> 所有购物车接口需携带认证 Token（Header: `Authorization: Bearer <token>`）。
> 设计阶段使用固定 userId 模拟认证，真实环境接入 JWT 中间件。

### 5.1 添加商品到购物车

```
POST /api/cart
```

**请求体**

```json
{
  "product_id": 1,
  "quantity": 2
}
```

| 字段 | 类型 | 必填 | 校验规则 |
|---|---|---|---|
| `product_id` | `number` | 是 | 商品必须存在 |
| `quantity` | `number` | 是 | 正整数 (> 0)，不超过库存上限 |

**业务逻辑**：
- 若购物车中已存在该商品 → 在原数量上累加 `quantity`（而非覆盖）
- 累加后数量 > 库存 → 返回错误码 `2101`
- 若购物车中不存在该商品 → 新增一条记录

**成功响应（首次添加）**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 10,
    "user_id": 1,
    "product_id": 1,
    "quantity": 2,
    "created_at": "2026-05-01T12:00:00.000Z",
    "updated_at": "2026-05-01T12:00:00.000Z"
  }
}
```

**成功响应（累加已有）**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 10,
    "user_id": 1,
    "product_id": 1,
    "quantity": 5,
    "created_at": "2026-04-28T12:00:00.000Z",
    "updated_at": "2026-05-01T12:00:00.000Z"
  }
}
```

**错误响应（库存不足）**

```json
{
  "code": 2101,
  "message": "库存不足，当前库存为 3，无法添加 5 件",
  "data": null
}
```

---

### 5.2 查看购物车

```
GET /api/cart
```

**请求示例**

```
GET /api/cart
```

**成功响应**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 10,
        "product_id": 1,
        "product_name": "无线蓝牙耳机",
        "product_image": "/images/headphone.jpg",
        "price": 299.00,
        "quantity": 2,
        "subtotal": 598.00,
        "stock": 95
      },
      {
        "id": 11,
        "product_id": 2,
        "product_name": "纯棉T恤",
        "product_image": "/images/tshirt.jpg",
        "price": 79.90,
        "quantity": 3,
        "subtotal": 239.70,
        "stock": 200
      }
    ],
    "total_amount": 837.70,
    "total_count": 5
  }
}
```

| 聚合字段 | 说明 |
|---|---|
| `subtotal` | 单项小计 = `price * quantity` |
| `total_amount` | 购物车总金额 = 所有 `subtotal` 之和 |
| `total_count` | 购物车商品种类数（非总件数） |

**注意事项**：
- 响应的 `price` 来自 `products` 表实时价格（非快照）
- 前端应据此实时计算展示价格，下单时才快照

---

### 5.3 修改购物车项数量

```
PATCH /api/cart/:id
```

**路径参数**

| 参数 | 类型 | 说明 |
|---|---|---|
| `id` | `number` | 购物车项 ID |

**请求体**

```json
{
  "quantity": 3
}
```

| 字段 | 类型 | 必填 | 校验规则 |
|---|---|---|---|
| `quantity` | `number` | 是 | 正整数，不超过对应商品库存 |

**成功响应**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 10,
    "user_id": 1,
    "product_id": 1,
    "quantity": 3,
    "created_at": "2026-04-28T12:00:00.000Z",
    "updated_at": "2026-05-01T12:05:00.000Z"
  }
}
```

**错误响应**

```json
{
  "code": 2101,
  "message": "库存不足，当前库存为 3，无法修改为 5 件",
  "data": null
}
```

---

### 5.4 删除购物车项

```
DELETE /api/cart/:id
```

**路径参数**

| 参数 | 类型 | 说明 |
|---|---|---|
| `id` | `number` | 购物车项 ID |

**请求示例**

```
DELETE /api/cart/10
```

**成功响应**

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

**业务逻辑**：直接物理删除该条记录，不做软删除。

---

## 6. 订单接口

### 6.1 创建订单

```
POST /api/orders
```

**请求体**

```json
{
  "address_id": 1,
  "cart_item_ids": [10, 11]
}
```

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `address_id` | `number` | 是 | 选用的收货地址 ID |
| `cart_item_ids` | `number[]` | 是 | 要结算的购物车项 ID 列表 |

**业务逻辑（全部在数据库事务中完成）**：

```
BEGIN TRANSACTION

1. 校验 address_id 存在且属于当前用户 → 读取地址数据 → 构建 address_snapshot JSON
2. 校验 cart_item_ids 非空且全部属于当前用户
3. 遍历每个 cart_item:
   a. 查询 product（当前价格、库存、version）
   b. 校验 quantity <= stock → 不满足则 回滚 + 返回 2101
   c. UPDATE products SET stock = stock - quantity, version = version + 1
      WHERE id = product_id AND version = current_version
      → affected_rows = 0 → 乐观锁冲突，回滚 + 返回 2203
   d. 构建 order_item（product_name、product_image、price 快照）
4. 生成唯一 order_no
5. 计算 total_amount = SUM(order_item.price * order_item.quantity)
6. INSERT INTO orders (order_no, user_id, address_snapshot, total_amount, status='pending')
7. INSERT INTO order_items (多条)
8. DELETE FROM cart_items WHERE id IN (cart_item_ids)

COMMIT
```

**成功响应**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 100,
    "order_no": "202605011200001",
    "user_id": 1,
    "address_snapshot": {
      "receiver_name": "张三",
      "phone": "13800138000",
      "province": "广东省",
      "city": "深圳市",
      "district": "南山区",
      "detail": "科技园路1号创新大厦"
    },
    "total_amount": 837.70,
    "status": "pending",
    "items": [
      {
        "id": 201,
        "product_id": 1,
        "product_name": "无线蓝牙耳机",
        "product_image": "/images/headphone.jpg",
        "price": 299.00,
        "quantity": 2
      },
      {
        "id": 202,
        "product_id": 2,
        "product_name": "纯棉T恤",
        "product_image": "/images/tshirt.jpg",
        "price": 79.90,
        "quantity": 3
      }
    ],
    "created_at": "2026-05-01T12:10:00.000Z"
  }
}
```

**错误响应（购物车为空）**

```json
{
  "code": 2103,
  "message": "购物车中没有要结算的商品",
  "data": null
}
```

**错误响应（乐观锁冲突）**

```json
{
  "code": 2203,
  "message": "下单失败，商品库存已变化，请刷新重试",
  "data": null
}
```

**注意事项**：
- `order_no` 格式建议：`YYYYMMDDHHmmss + 4位随机数`，如 `2026050112103847`
- 库存扣减使用乐观锁 + `affected_rows` 判断，失败直接回滚整个事务
- 订单价格 = 下单时从 `products.price` 读取并写入 `order_items.price`，此后 `products.price` 变化不影响已生成订单

---

### 6.2 订单列表

```
GET /api/orders
```

**查询参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| `page` | `number` | 否 | 1 | 页码 |
| `pageSize` | `number` | 否 | 20 | 每页条数 |
| `status` | `string` | 否 | — | 按状态筛选：`pending` / `cancelled`；不传则查全部 |

**请求示例**

```
GET /api/orders?status=pending&page=1&pageSize=10
```

**成功响应**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 100,
        "order_no": "202605011200001",
        "total_amount": 837.70,
        "status": "pending",
        "item_count": 2,
        "created_at": "2026-05-01T12:10:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

| 列表字段 | 说明 |
|---|---|
| `item_count` | 订单中商品种类数 |
| `total_amount` | 订单总金额 |

**设计考量**：列表接口不返回 `address_snapshot` 和完整 `items`，减少数据量；前端点击进入详情页再请求完整数据。

---

### 6.3 订单详情

```
GET /api/orders/:id
```

**路径参数**

| 参数 | 类型 | 说明 |
|---|---|---|
| `id` | `number` | 订单 ID |

**请求示例**

```
GET /api/orders/100
```

**成功响应**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 100,
    "order_no": "202605011200001",
    "user_id": 1,
    "total_amount": 837.70,
    "status": "pending",
    "address_snapshot": {
      "receiver_name": "张三",
      "phone": "13800138000",
      "province": "广东省",
      "city": "深圳市",
      "district": "南山区",
      "detail": "科技园路1号创新大厦"
    },
    "items": [
      {
        "id": 201,
        "product_id": 1,
        "product_name": "无线蓝牙耳机",
        "product_image": "/images/headphone.jpg",
        "price": 299.00,
        "quantity": 2,
        "subtotal": 598.00
      },
      {
        "id": 202,
        "product_id": 2,
        "product_name": "纯棉T恤",
        "product_image": "/images/tshirt.jpg",
        "price": 79.90,
        "quantity": 3,
        "subtotal": 239.70
      }
    ],
    "created_at": "2026-05-01T12:10:00.000Z",
    "updated_at": "2026-05-01T12:10:00.000Z"
  }
}
```

**权限校验**：`order.user_id` 必须等于当前请求用户的 `userId`。

**错误响应**

```json
{
  "code": 2201,
  "message": "订单不存在",
  "data": null
}
```

---

### 6.4 取消订单

```
PATCH /api/orders/:id/cancel
```

**路径参数**

| 参数 | 类型 | 说明 |
|---|---|---|
| `id` | `number` | 订单 ID |

**请求体**：无

**业务逻辑（事务中完成）**：

```
BEGIN TRANSACTION

1. 查询订单 → 不存在 → 回滚 + 返回 2201
2. 校验 order.status = 'pending' → 非 pending → 回滚 + 返回 2202
3. 查询 order_items → 遍历每条:
   UPDATE products
   SET stock = stock + order_item.quantity,
       version = version + 1
   WHERE id = order_item.product_id
4. UPDATE orders SET status = 'cancelled' WHERE id = order_id
5. 校验 affected_rows ─ 确保订单未被并发取消

COMMIT
```

**成功响应**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 100,
    "order_no": "202605011200001",
    "status": "cancelled",
    "updated_at": "2026-05-01T13:00:00.000Z"
  }
}
```

**错误响应（状态不符）**

```json
{
  "code": 2202,
  "message": "仅待支付状态的订单可以取消",
  "data": null
}
```

**注意事项**：
- 取消订单恢复库存时，使用 `stock = stock + quantity` 简单恢复即可（无需乐观锁）
- 仅 `pending` 状态的订单可取消，`cancelled` 状态不可再次取消

---

## 7. 地址接口

### 7.1 新增地址

```
POST /api/addresses
```

**请求体**

```json
{
  "receiver_name": "张三",
  "phone": "13800138000",
  "province": "广东省",
  "city": "深圳市",
  "district": "南山区",
  "detail": "科技园路1号创新大厦",
  "is_default": true
}
```

| 字段 | 类型 | 必填 | 校验规则 |
|---|---|---|---|
| `receiver_name` | `string` | 是 | 1-50 字符 |
| `phone` | `string` | 是 | 中国大陆手机号格式 `1[3-9]\d{9}` |
| `province` | `string` | 是 | 1-50 字符 |
| `city` | `string` | 是 | 1-50 字符 |
| `district` | `string` | 是 | 1-50 字符 |
| `detail` | `string` | 是 | 1-200 字符 |
| `is_default` | `boolean` | 否 | 默认 `false` |

**业务逻辑**：
- 若 `is_default = true` → 先将该用户所有地址 `is_default` 置为 `0`，再插入新地址

**成功响应**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 5,
    "user_id": 1,
    "receiver_name": "张三",
    "phone": "13800138000",
    "province": "广东省",
    "city": "深圳市",
    "district": "南山区",
    "detail": "科技园路1号创新大厦",
    "is_default": 1,
    "created_at": "2026-05-01T14:00:00.000Z",
    "updated_at": "2026-05-01T14:00:00.000Z"
  }
}
```

---

### 7.2 地址列表

```
GET /api/addresses
```

**请求示例**

```
GET /api/addresses
```

**成功响应**

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 5,
      "user_id": 1,
      "receiver_name": "张三",
      "phone": "13800138000",
      "province": "广东省",
      "city": "深圳市",
      "district": "南山区",
      "detail": "科技园路1号创新大厦",
      "is_default": 1,
      "created_at": "2026-05-01T14:00:00.000Z",
      "updated_at": "2026-05-01T14:00:00.000Z"
    },
    {
      "id": 3,
      "user_id": 1,
      "receiver_name": "李四",
      "phone": "13900139000",
      "province": "广东省",
      "city": "广州市",
      "district": "天河区",
      "detail": "天河路100号",
      "is_default": 0,
      "created_at": "2026-04-15T10:00:00.000Z",
      "updated_at": "2026-04-15T10:00:00.000Z"
    }
  ]
}
```

**排序规则**：默认地址（`is_default=1`）置顶，其余按 `created_at` 倒序。

---

### 7.3 编辑地址

```
PUT /api/addresses/:id
```

**路径参数**

| 参数 | 类型 | 说明 |
|---|---|---|
| `id` | `number` | 地址 ID |

**请求体**（所有字段可选，传什么改什么）

```json
{
  "receiver_name": "张三丰",
  "phone": "13800138001",
  "is_default": false
}
```

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `receiver_name` | `string` | 否 | 1-50 字符 |
| `phone` | `string` | 否 | 中国大陆手机号格式 |
| `province` | `string` | 否 | 1-50 字符 |
| `city` | `string` | 否 | 1-50 字符 |
| `district` | `string` | 否 | 1-50 字符 |
| `detail` | `string` | 否 | 1-200 字符 |
| `is_default` | `boolean` | 否 | 设为默认则取消其他默认 |

**业务逻辑**：
- 校验地址存在且属于当前用户
- 若 `is_default = true`（从 false 改为 true）→ 先将该用户所有其他地址 `is_default` 置为 `0`
- 若 `is_default = false`（从 true 改为 false）→ 直接更新，不自动设置其他地址为默认

**成功响应**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 5,
    "user_id": 1,
    "receiver_name": "张三丰",
    "phone": "13800138001",
    "province": "广东省",
    "city": "深圳市",
    "district": "南山区",
    "detail": "科技园路1号创新大厦",
    "is_default": 0,
    "created_at": "2026-05-01T14:00:00.000Z",
    "updated_at": "2026-05-01T14:30:00.000Z"
  }
}
```

---

### 7.4 删除地址

```
DELETE /api/addresses/:id
```

**路径参数**

| 参数 | 类型 | 说明 |
|---|---|---|
| `id` | `number` | 地址 ID |

**请求示例**

```
DELETE /api/addresses/5
```

**业务逻辑**：
1. 校验地址存在且属于当前用户
2. 执行删除
3. 若被删除的地址 `is_default = 1` → 将该用户剩余地址中第一条的 `is_default` 设为 `1`

**成功响应**

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

**错误响应**

```json
{
  "code": 2301,
  "message": "地址不存在",
  "data": null
}
```

---

## 8. 接口调用关系图

```
用户操作流程                  API 调用序列
─────────────                ─────────────

浏览商品首页      ──────────▶ GET /api/products?page=1
    │
    ▼
点击商品卡片      ──────────▶ GET /api/products/:id
    │
    ▼
加入购物车        ──────────▶ POST /api/cart { product_id, quantity }
    │
    ▼
打开购物车        ──────────▶ GET /api/cart
    │
    ├── 修改数量   ──────────▶ PATCH /api/cart/:id { quantity }
    ├── 删除项     ──────────▶ DELETE /api/cart/:id
    │
    ▼
去结算            ──────────▶ GET /api/addresses（选择地址）
    │                        ──────────▶ POST /api/orders { address_id, cart_item_ids }
    │
    ▼
查看订单列表      ──────────▶ GET /api/orders?status=pending
    │
    ▼
点击订单          ──────────▶ GET /api/orders/:id
    │
    ▼
取消订单          ──────────▶ PATCH /api/orders/:id/cancel
```

---

## 9. 常见业务场景与错误处理

### 场景 1：并发下单

```
时间线：

用户A 和 用户B 同时下单同一商品（库存=5）
    │
    ├── 事务A: SELECT version=3 → UPDATE ... WHERE version=3 → affected_rows=1 ✓
    │
    └── 事务B: SELECT version=3 → UPDATE ... WHERE version=3 → affected_rows=0 ✗
                                    ↓
                              回滚事务，返回 2203 "商品库存已变化，请刷新重试"
```

### 场景 2：下单时库存不足

```
POST /api/orders
  → Service 层校验: product.stock(3) < cart_item.quantity(5)
  → 回滚事务
  → 响应: { code: 2101, message: "库存不足，商品'XXX'仅剩3件" }
```

### 场景 3：取消已被取消的订单

```
PATCH /api/orders/100/cancel
  → order.status = 'cancelled'（不是 pending）
  → 响应: { code: 2202, message: "仅待支付状态的订单可以取消" }
```

---

## 10. 接口测试建议

| 测试类型 | 覆盖重点 |
|---|---|
| **参数校验** | 必填字段缺失、类型错误、边界值（quantity=0/-1/超大） |
| **权限校验** | 未登录访问、操作他人购物车/订单/地址 |
| **并发测试** | 多个用户同时下单同一商品（乐观锁验证） |
| **事务回滚** | 下单中途库存不足 → 验证库存未被扣减、订单未创建 |
| **价格快照** | 下单后修改商品价格 → 验证订单中价格不变 |

---

## 附录：Postman / 测试用 cURL 示例

```bash
# 商品列表
curl http://localhost:3000/api/products?page=1&pageSize=10

# 商品详情
curl http://localhost:3000/api/products/1

# 添加购物车
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token-user-1" \
  -d '{"product_id":1,"quantity":2}'

# 查看购物车
curl http://localhost:3000/api/cart \
  -H "Authorization: Bearer test-token-user-1"

# 修改购物车数量
curl -X PATCH http://localhost:3000/api/cart/10 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token-user-1" \
  -d '{"quantity":3}'

# 删除购物车项
curl -X DELETE http://localhost:3000/api/cart/10 \
  -H "Authorization: Bearer test-token-user-1"

# 创建订单
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token-user-1" \
  -d '{"address_id":1,"cart_item_ids":[10,11]}'

# 订单列表
curl "http://localhost:3000/api/orders?status=pending&page=1" \
  -H "Authorization: Bearer test-token-user-1"

# 订单详情
curl http://localhost:3000/api/orders/100 \
  -H "Authorization: Bearer test-token-user-1"

# 取消订单
curl -X PATCH http://localhost:3000/api/orders/100/cancel \
  -H "Authorization: Bearer test-token-user-1"

# 新增地址
curl -X POST http://localhost:3000/api/addresses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token-user-1" \
  -d '{"receiver_name":"张三","phone":"13800138000","province":"广东省","city":"深圳市","district":"南山区","detail":"科技园路1号","is_default":true}'

# 地址列表
curl http://localhost:3000/api/addresses \
  -H "Authorization: Bearer test-token-user-1"

# 编辑地址
curl -X PUT http://localhost:3000/api/addresses/5 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token-user-1" \
  -d '{"receiver_name":"张三丰"}'

# 删除地址
curl -X DELETE http://localhost:3000/api/addresses/5 \
  -H "Authorization: Bearer test-token-user-1"
```
