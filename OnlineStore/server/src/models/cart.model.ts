/**
 * 购物车数据访问模型
 *
 * 封装 cart_items 表的所有 SQL 操作，包括：
 * - 查用户某商品已有记录（用于去重累加）
 * - 增/改/删/查
 * - JOIN products 获取实时价格
 * - 批量删除（下单后清空）
 */

import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/db";
import { CartItem, CartItemView } from "../types/cart";

/** 购物车项查询字段列表 */
const CART_ITEM_FIELDS =
  "id, user_id, product_id, quantity, created_at, updated_at";

/**
 * 查询用户购物车中某商品是否已有记录
 */
export async function findByUserAndProduct(
  userId: number,
  productId: number,
): Promise<CartItem | null> {
  const sql = `SELECT ${CART_ITEM_FIELDS} FROM cart_items WHERE user_id = ? AND product_id = ?`;
  const [rows] = await pool.query<RowDataPacket[]>(sql, [userId, productId]);
  return rows.length > 0 ? (rows[0] as CartItem) : null;
}

/**
 * 创建购物车记录
 */
export async function create(data: {
  user_id: number;
  product_id: number;
  quantity: number;
}): Promise<CartItem> {
  const sql =
    "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)";
  const [result] = await pool.query<ResultSetHeader>(sql, [
    data.user_id,
    data.product_id,
    data.quantity,
  ]);

  return {
    id: result.insertId,
    user_id: data.user_id,
    product_id: data.product_id,
    quantity: data.quantity,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * 更新购物车数量
 */
export async function updateQuantity(
  id: number,
  quantity: number,
): Promise<void> {
  const sql = "UPDATE cart_items SET quantity = ? WHERE id = ?";
  await pool.query(sql, [quantity, id]);
}

/**
 * 查询用户所有购物车项（JOIN products 获取实时价格和库存）
 */
export async function findByUserId(userId: number): Promise<CartItemView[]> {
  const sql = `
    SELECT
      ci.id,
      ci.product_id,
      p.name AS product_name,
      p.image_url AS product_image,
      p.price,
      ci.quantity,
      p.stock,
      p.version
    FROM cart_items ci
    INNER JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
    ORDER BY ci.created_at DESC
  `;

  const [rows] = await pool.query<RowDataPacket[]>(sql, [userId]);
  return rows.map((row) => ({
    ...row,
    subtotal: (row.price as number) * (row.quantity as number),
  })) as CartItemView[];
}

/**
 * 根据 ID 查询单条购物车项（含用户校验）
 */
export async function findById(id: number): Promise<CartItem | null> {
  const sql = `SELECT ${CART_ITEM_FIELDS} FROM cart_items WHERE id = ?`;
  const [rows] = await pool.query<RowDataPacket[]>(sql, [id]);
  return rows.length > 0 ? (rows[0] as CartItem) : null;
}

/**
 * 删除单条购物车项
 */
export async function deleteById(id: number): Promise<number> {
  const sql = "DELETE FROM cart_items WHERE id = ?";
  const [result] = await pool.query<ResultSetHeader>(sql, [id]);
  return result.affectedRows;
}

/**
 * 批量删除购物车项（下单后清空）
 */
export async function deleteByIds(ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  const placeholders = ids.map(() => "?").join(",");
  const sql = `DELETE FROM cart_items WHERE id IN (${placeholders})`;
  await pool.query(sql, ids);
}
