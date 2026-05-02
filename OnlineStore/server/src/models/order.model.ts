/**
 * 订单数据访问模型
 *
 * 封装 orders 表的所有 SQL 操作，包括：
 * - 创建订单
 * - 分页查询（支持状态筛选）
 * - 订单详情查询
 */

import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/db";
import { Order, OrderStatus } from "../types";

/**
 * 创建订单
 */
export async function create(data: {
  order_no: string;
  user_id: number;
  address_snapshot: string; // JSON 字符串
  total_amount: number;
  status: OrderStatus;
}): Promise<number> {
  const sql = `
    INSERT INTO orders (order_no, user_id, address_snapshot, total_amount, status)
    VALUES (?, ?, ?, ?, ?)
  `;

  const [result] = await pool.query<ResultSetHeader>(sql, [
    data.order_no,
    data.user_id,
    data.address_snapshot,
    data.total_amount,
    data.status,
  ]);

  return result.insertId;
}

/** 订单查询字段列表（排除 address_snapshot JSON 大字段用于列表查询时可按需决定） */
const ORDER_FIELDS =
  "id, order_no, user_id, address_snapshot, total_amount, status, created_at, updated_at";

/**
 * 查询用户订单列表（分页+状态筛选）
 */
export async function findByUserId(
  userId: number,
  status: OrderStatus | undefined,
  limit: number,
  offset: number,
): Promise<Order[]> {
  let sql: string;
  let params: unknown[];

  if (status) {
    sql = `
      SELECT ${ORDER_FIELDS} FROM orders
      WHERE user_id = ? AND status = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    params = [userId, status, limit, offset];
  } else {
    sql = `
      SELECT ${ORDER_FIELDS} FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    params = [userId, limit, offset];
  }

  const [rows] = await pool.query<RowDataPacket[]>(sql, params);
  return rows as Order[];
}

/**
 * 统计用户订单总数
 */
export async function countByUserId(
  userId: number,
  status: OrderStatus | undefined,
): Promise<number> {
  let sql: string;
  let params: unknown[];

  if (status) {
    sql =
      "SELECT COUNT(*) AS total FROM orders WHERE user_id = ? AND status = ?";
    params = [userId, status];
  } else {
    sql = "SELECT COUNT(*) AS total FROM orders WHERE user_id = ?";
    params = [userId];
  }

  const [rows] = await pool.query<RowDataPacket[]>(sql, params);
  return rows[0].total as number;
}

/**
 * 根据 ID 查询单条订单
 */
export async function findById(id: number): Promise<Order | null> {
  const sql = `SELECT ${ORDER_FIELDS} FROM orders WHERE id = ?`;
  const [rows] = await pool.query<RowDataPacket[]>(sql, [id]);
  return rows.length > 0 ? (rows[0] as Order) : null;
}

/**
 * 更新订单状态
 */
export async function updateStatus(
  id: number,
  status: OrderStatus,
): Promise<number> {
  const sql = "UPDATE orders SET status = ? WHERE id = ?";
  const [result] = await pool.query<ResultSetHeader>(sql, [status, id]);
  return result.affectedRows;
}
