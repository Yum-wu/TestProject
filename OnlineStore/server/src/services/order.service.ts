/**
 * 订单业务逻辑服务（核心模块）
 *
 * 负责订单创建与取消，全程使用数据库事务保证数据一致性。
 * 创建订单使用乐观锁防止超卖。
 *
 * 事务范围：
 * - createOrder: 校验地址 → 校验购物车 → 扣库存(乐观锁) → 写订单 → 写明细 → 清购物车
 * - cancelOrder: 查订单 → 校验状态 → 恢复库存 → 更新状态
 */

import pool from "../config/db";
import * as orderModel from "../models/order.model";
import * as orderItemModel from "../models/orderItem.model";
import * as addressModel from "../models/address.model";
import {
  Order,
  OrderDetail,
  OrderItemView,
  PaginatedData,
  OrderStatus,
} from "../types";
import { CreateOrderInput, OrderItemSnapshot, AddressSnapshot } from "../types/order";
import { generateOrderNo } from "../utils/orderNo";
import { BusinessError } from "../utils/errors";
import { RowDataPacket } from "mysql2";

/**
 * 从地址实体提取快照数据
 */
function buildAddressSnapshot(address: {
  receiver_name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
}): AddressSnapshot {
  return {
    receiver_name: address.receiver_name,
    phone: address.phone,
    province: address.province,
    city: address.city,
    district: address.district,
    detail: address.detail,
  };
}

/**
 * 创建订单（核心流程，事务保护）
 *
 * 事务步骤：
 * 1. 校验收货地址
 * 2. 校验购物车项
 * 3. 乐观锁扣减库存
 * 4. 构建订单数据
 * 5. 写入订单 + 明细
 * 6. 清空对应购物车项
 * 7. 提交事务，返回完整订单
 */
export async function createOrder(
  userId: number,
  input: CreateOrderInput,
): Promise<OrderDetail> {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // ---- 第1步：校验收货地址 ----
    const address = await addressModel.findById(input.address_id);

    if (!address) {
      throw new BusinessError(2301, "收货地址不存在");
    }
    if (address.user_id !== userId) {
      throw new BusinessError(2302, "该地址不属于当前用户");
    }

    const addressSnapshot = buildAddressSnapshot(address);

    // ---- 第2步：校验购物车项 ----
    if (!input.cart_item_ids || input.cart_item_ids.length === 0) {
      throw new BusinessError(2103, "购物车中没有要结算的商品");
    }

    // ---- 第3步：查询购物车项 + 商品实时数据 ----
    const placeholders = input.cart_item_ids.map(() => "?").join(",");

    const [cartRows] = await connection.query<RowDataPacket[]>(
      `SELECT ci.id, ci.quantity, ci.product_id,
              p.name, p.price, p.stock, p.version, p.image_url
       FROM cart_items ci
       INNER JOIN products p ON ci.product_id = p.id
       WHERE ci.id IN (${placeholders}) AND ci.user_id = ?`,
      [...input.cart_item_ids, userId],
    );

    if (cartRows.length === 0) {
      throw new BusinessError(2103, "购物车中没有有效的结算商品");
    }

    // 校验是否有不属于用户的购物车项
    if (cartRows.length !== input.cart_item_ids.length) {
      throw new BusinessError(2103, "部分购物车项不存在或不属于当前用户");
    }

    // ---- 第4步：库存校验（第一轮，全量检查） ----
    for (const row of cartRows) {
      if (row.quantity > row.stock) {
        throw new BusinessError(
          2101,
          `库存不足，商品"${row.name}"当前库存为 ${row.stock}，无法购买 ${row.quantity} 件`,
        );
      }
    }

    // ---- 第5步：乐观锁扣减库存 + 构建快照 ----
    const orderItems: OrderItemSnapshot[] = [];
    // 使用整数（分）运算，避免 JavaScript 浮点数精度问题
    let totalAmountInCents = 0;

    for (const row of cartRows) {
      // 乐观锁扣减
      const [updateResult] = await connection.query<RowDataPacket[]>(
        `UPDATE products
         SET stock = stock - ?, version = version + 1
         WHERE id = ? AND stock >= ? AND version = ?`,
        [row.quantity, row.product_id, row.quantity, row.version],
      );

      const affectedRows = (updateResult as unknown as { affectedRows: number })
        .affectedRows;

      if (affectedRows === 0) {
        // 乐观锁冲突 → 回滚
        await connection.rollback();
        throw new BusinessError(2203, "下单失败，商品库存已变化，请刷新重试");
      }

      // 构建快照
      orderItems.push({
        product_id: row.product_id,
        product_name: row.name,
        product_image: row.image_url || "",
        price: row.price,
        quantity: row.quantity,
      });

      // 以分为单位累加，避免浮点数精度丢失
      totalAmountInCents += Math.round(Number(row.price) * 100) * row.quantity;
    }

    // 将分转为元，保留两位小数
    const totalAmount = totalAmountInCents / 100;

    // ---- 第6步：生成订单号 ----
    const orderNo = generateOrderNo();

    // ---- 第7步：写入订单表 ----
    const [orderResult] = await connection.query<RowDataPacket[]>(
      `INSERT INTO orders (order_no, user_id, address_snapshot, total_amount, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [orderNo, userId, JSON.stringify(addressSnapshot), totalAmount],
    );

    const orderId = (orderResult as unknown as { insertId: number }).insertId;

    // ---- 第8步：批量写入订单商品明细 ----
    if (orderItems.length > 0) {
      const valuePlaceholders = orderItems
        .map(() => "(?, ?, ?, ?, ?, ?)")
        .join(", ");
      const values: unknown[] = [];
      for (const item of orderItems) {
        values.push(
          orderId,
          item.product_id,
          item.product_name,
          item.product_image,
          item.price,
          item.quantity,
        );
      }

      await connection.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity)
         VALUES ${valuePlaceholders}`,
        values,
      );
    }

    // ---- 第9步：清空对应购物车项 ----
    await connection.query(
      `DELETE FROM cart_items WHERE id IN (${placeholders}) AND user_id = ?`,
      [...input.cart_item_ids, userId],
    );

    // ---- 第10步：提交事务 ----
    await connection.commit();

    // ---- 第11步：查询完整订单返回 ----
    const [orderRows] = await connection.query<RowDataPacket[]>(
      "SELECT * FROM orders WHERE id = ?",
      [orderId],
    );

    const [itemRows] = await connection.query<RowDataPacket[]>(
      "SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC",
      [orderId],
    );

    const order = orderRows[0] as unknown as Order;

    return {
      ...order,
      address_snapshot:
        typeof order.address_snapshot === "string"
          ? JSON.parse(order.address_snapshot as string)
          : order.address_snapshot,
      items: itemRows.map((row: RowDataPacket) => ({
        ...row,
        subtotal: (row.price as number) * (row.quantity as number),
      })) as OrderItemView[],
    };
  } catch (error) {
    // 事务回滚（如果尚未提交）
    try {
      await connection.rollback();
    } catch {
      // rollback 失败忽略
    }
    throw error;
  } finally {
    // 释放连接回连接池
    connection.release();
  }
}

/**
 * 查询订单列表（分页+状态筛选）
 */
export async function getOrders(
  userId: number,
  page: number,
  pageSize: number,
  status?: OrderStatus,
): Promise<
  PaginatedData<{
    id: number;
    order_no: string;
    total_amount: number;
    status: string;
    item_count: number;
    created_at: string;
  }>
> {
  const limit = pageSize;
  const offset = (page - 1) * pageSize;

  const [orders, total] = await Promise.all([
    orderModel.findByUserId(userId, status, limit, offset),
    orderModel.countByUserId(userId, status),
  ]);

  // 批量查询商品种类数（避免 N+1 查询）
  const orderIds = orders.map((o) => o.id);
  const itemCountMap = await orderItemModel.countByOrderIds(orderIds);

  const list = orders.map((order) => ({
    id: order.id,
    order_no: order.order_no,
    total_amount: order.total_amount,
    status: order.status,
    item_count: itemCountMap.get(order.id) ?? 0,
    created_at: order.created_at,
  }));

  return {
    list,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

/**
 * 查询订单详情（含商品明细）
 */
export async function getOrderById(
  userId: number,
  orderId: number,
): Promise<OrderDetail> {
  const order = await orderModel.findById(orderId);

  if (!order) {
    throw new BusinessError(2201, "订单不存在");
  }

  // 权限校验
  if (order.user_id !== userId) {
    throw new BusinessError(2201, "订单不存在");
  }

  const items = await orderItemModel.findByOrderId(orderId);

  return {
    ...order,
    address_snapshot:
      typeof order.address_snapshot === "string"
        ? JSON.parse(order.address_snapshot as string)
        : order.address_snapshot,
    items: items.map((item) => ({
      ...item,
      subtotal: Math.round(item.price * item.quantity * 100) / 100,
    })),
  };
}

/**
 * 取消订单（事务保护）
 *
 * 流程：
 * 1. 查订单 → 不存在回滚
 * 2. 校验 status=pending → 不是回滚
 * 3. 查 order_items → 遍历恢复库存
 * 4. 更新订单状态为 cancelled
 */
export async function cancelOrder(
  userId: number,
  orderId: number,
): Promise<{
  id: number;
  order_no: string;
  status: string;
  updated_at: string;
}> {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. 查订单
    const [orderRows] = await connection.query<RowDataPacket[]>(
      "SELECT * FROM orders WHERE id = ?",
      [orderId],
    );

    if (orderRows.length === 0) {
      await connection.rollback();
      throw new BusinessError(2201, "订单不存在");
    }

    const order = orderRows[0] as unknown as Order;

    // 权限校验
    if (order.user_id !== userId) {
      await connection.rollback();
      throw new BusinessError(2201, "订单不存在");
    }

    // 2. 校验状态
    if (order.status !== "pending") {
      await connection.rollback();
      throw new BusinessError(2202, "仅待支付状态的订单可以取消");
    }

    // 3. 查询 order_items → 遍历恢复库存（带乐观锁版本校验）
    const [itemRows] = await connection.query<RowDataPacket[]>(
      "SELECT oi.* FROM order_items oi WHERE oi.order_id = ?",
      [orderId],
    );

    for (const item of itemRows) {
      // 读取当前商品版本号
      const [prodRows] = await connection.query<RowDataPacket[]>(
        "SELECT version FROM products WHERE id = ?",
        [item.product_id],
      );
      if (prodRows.length === 0) continue;
      const currentVersion = prodRows[0].version as number;

      const [updateResult] = await connection.query<RowDataPacket[]>(
        `UPDATE products
         SET stock = stock + ?, version = version + 1
         WHERE id = ? AND version = ?`,
        [item.quantity, item.product_id, currentVersion],
      );

      const affectedRows = (updateResult as unknown as { affectedRows: number })
        .affectedRows;
      if (affectedRows === 0) {
        await connection.rollback();
        throw new BusinessError(2203, "取消订单失败，商品库存已变化，请重试");
      }
    }

    // 4. 更新订单状态
    await connection.query("UPDATE orders SET status = ? WHERE id = ?", [
      "cancelled",
      orderId,
    ]);

    // 5. 提交事务
    await connection.commit();

    // 6. 返回更新后的订单
    return {
      id: order.id,
      order_no: order.order_no,
      status: "cancelled",
      updated_at: new Date().toISOString(),
    };
  } catch (error) {
    try {
      await connection.rollback();
    } catch {
      // 忽略
    }
    throw error;
  } finally {
    connection.release();
  }
}
