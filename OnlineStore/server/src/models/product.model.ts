/**
 * 商品数据访问模型
 *
 * 封装 products 表的所有 SQL 操作，包括：
 * - 分页查询 + 分类/关键词筛选 + 排序
 * - 单条查询
 * - 乐观锁库存扣减（下单专用）
 * - 库存恢复（取消订单专用）
 */

import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/db';
import { Product, ProductFilter } from '../types/product';

/** 基础查询 SQL 片段（排除 description 字段，列表不返回） */
const LIST_FIELDS = 'id, name, price, stock, category, image_url, created_at';
const DETAIL_FIELDS = `${LIST_FIELDS}, description, version, updated_at`;

/**
 * 构建 WHERE 条件 + 参数数组
 */
function buildWhereConditions(filter: ProductFilter): { whereClause: string; params: unknown[] } {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filter.category) {
    conditions.push('category = ?');
    params.push(filter.category);
  }

  if (filter.keyword) {
    conditions.push('name LIKE ?');
    params.push(`%${filter.keyword}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { whereClause, params };
}

/**
 * 构建 ORDER BY 子句
 */
function buildOrderClause(sort?: string): string {
  switch (sort) {
    case 'price_asc':
      return 'ORDER BY price ASC';
    case 'price_desc':
      return 'ORDER BY price DESC';
    case 'created_at_asc':
      return 'ORDER BY created_at ASC';
    case 'created_at_desc':
    default:
      return 'ORDER BY created_at DESC';
  }
}

/**
 * 查询商品列表（分页+筛选）
 */
export async function findAll(
  filter: ProductFilter,
  limit: number,
  offset: number
): Promise<Product[]> {
  const { whereClause, params } = buildWhereConditions(filter);
  const orderClause = buildOrderClause(filter.sort);

  const sql = `
    SELECT ${LIST_FIELDS}
    FROM products
    ${whereClause}
    ${orderClause}
    LIMIT ? OFFSET ?
  `;

  const [rows] = await pool.query<RowDataPacket[]>(sql, [...params, limit, offset]);
  return rows as Product[];
}

/**
 * 统计商品总数（带筛选条件）
 */
export async function countAll(filter: ProductFilter): Promise<number> {
  const { whereClause, params } = buildWhereConditions(filter);

  const sql = `SELECT COUNT(*) AS total FROM products ${whereClause}`;
  const [rows] = await pool.query<RowDataPacket[]>(sql, params);
  return rows[0].total as number;
}

/**
 * 根据 ID 查询商品详情
 */
export async function findById(id: number): Promise<Product | null> {
  const sql = `SELECT ${DETAIL_FIELDS} FROM products WHERE id = ?`;
  const [rows] = await pool.query<RowDataPacket[]>(sql, [id]);
  return rows.length > 0 ? (rows[0] as Product) : null;
}

/**
 * 乐观锁扣减库存（下单专用）
 *
 * 条件：
 * - stock >= quantity（库存充足）
 * - version = currentVersion（乐观锁版本匹配）
 *
 * @returns affectedRows: 1=成功, 0=库存不足或版本冲突
 */
export async function updateStockWithVersion(
  id: number,
  quantity: number,
  version: number
): Promise<number> {
  const sql = `
    UPDATE products
    SET stock = stock - ?,
        version = version + 1
    WHERE id = ?
      AND stock >= ?
      AND version = ?
  `;

  const [result] = await pool.query<ResultSetHeader>(sql, [quantity, id, quantity, version]);
  return result.affectedRows;
}

/**
 * 恢复库存（取消订单专用，不使用乐观锁）
 */
export async function restoreStock(id: number, quantity: number): Promise<void> {
  const sql = `
    UPDATE products
    SET stock = stock + ?,
        version = version + 1
    WHERE id = ?
  `;
  await pool.query(sql, [quantity, id]);
}
