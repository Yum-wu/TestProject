/**
 * 订单商品明细数据访问模型
 *
 * 封装 order_items 表的所有 SQL 操作，包括：
 * - 批量创建订单明细
 * - 按订单 ID 查询明细
 */

import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/db";
import { OrderItem, OrderItemSnapshot } from "../types/order";

/**
 * 批量创建订单商品明细
 *
 * @param orderId  订单 ID
 * @param items    快照数据列表
 */
export async function batchCreate(
  orderId: number,
  items: OrderItemSnapshot[],
): Promise<void> {
  if (items.length === 0) return;

  const values: unknown[] = [];
  const placeholders: string[] = [];

  for (const item of items) {
    placeholders.push("(?, ?, ?, ?, ?, ?)");
    values.push(
      orderId,
      item.product_id,
      item.product_name,
      item.product_image,
      item.price,
      item.quantity,
    );
  }

  const sql = `
    INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity)
    VALUES ${placeholders.join(", ")}
  `;

  await pool.query(sql, values);
}

/**
 * 查询某订单的所有商品明细
 */
export async function findByOrderId(orderId: number): Promise<OrderItem[]> {
  const sql = `
    SELECT id, order_id, product_id, product_name, product_image, price, quantity, created_at
    FROM order_items
    WHERE order_id = ?
    ORDER BY id ASC
  `;

  const [rows] = await pool.query<RowDataPacket[]>(sql, [orderId]);
  return rows as OrderItem[];
}

/**
 * 批量统计各订单的商品种类数（避免 N+1 查询）
 * @param orderIds - 订单 ID 列表
 * @returns Map<order_id, item_count>
 */
export async function countByOrderIds(
  orderIds: number[],
): Promise<Map<number, number>> {
  if (orderIds.length === 0) return new Map();

  const placeholders = orderIds.map(() => "?").join(",");
  const sql = `
    SELECT order_id, COUNT(*) AS item_count
    FROM order_items
    WHERE order_id IN (${placeholders})
    GROUP BY order_id
  `;

  const [rows] = await pool.query<RowDataPacket[]>(sql, orderIds);
  const result = new Map<number, number>();
  for (const row of rows) {
    result.set(row.order_id as number, row.item_count as number);
  }
  return result;
}
