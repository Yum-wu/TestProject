/**
 * 收货地址数据访问模型
 *
 * 封装 addresses 表的所有 SQL 操作，包括：
 * - 增/查/改/删
 * - 设置/取消默认地址
 */

import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/db";
import {
  Address,
  CreateAddressInput,
  UpdateAddressInput,
} from "../types/address";

/** 地址查询字段列表 */
const ADDRESS_FIELDS =
  "id, user_id, receiver_name, phone, province, city, district, detail, is_default, created_at, updated_at";

/**
 * 创建地址
 */
export async function create(
  data: CreateAddressInput & { user_id: number },
): Promise<number> {
  const sql = `
    INSERT INTO addresses
      (user_id, receiver_name, phone, province, city, district, detail, is_default)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await pool.query<ResultSetHeader>(sql, [
    data.user_id,
    data.receiver_name,
    data.phone,
    data.province,
    data.city,
    data.district,
    data.detail,
    data.is_default ? 1 : 0,
  ]);

  return result.insertId;
}

/**
 * 查询用户所有地址（默认地址置顶，其余按创建时间倒序）
 */
export async function findByUserId(userId: number): Promise<Address[]> {
  const sql = `
    SELECT ${ADDRESS_FIELDS} FROM addresses
    WHERE user_id = ?
    ORDER BY is_default DESC, created_at DESC
  `;

  const [rows] = await pool.query<RowDataPacket[]>(sql, [userId]);
  return rows as Address[];
}

/**
 * 根据 ID 查询单条地址
 */
export async function findById(id: number): Promise<Address | null> {
  const sql = `SELECT ${ADDRESS_FIELDS} FROM addresses WHERE id = ?`;
  const [rows] = await pool.query<RowDataPacket[]>(sql, [id]);
  return rows.length > 0 ? (rows[0] as Address) : null;
}

/**
 * 动态更新地址（只更新传了的字段）
 */
export async function update(
  id: number,
  data: UpdateAddressInput,
): Promise<void> {
  // 构建 SET 子句
  const fields: string[] = [];
  const params: unknown[] = [];

  if (data.receiver_name !== undefined) {
    fields.push("receiver_name = ?");
    params.push(data.receiver_name);
  }
  if (data.phone !== undefined) {
    fields.push("phone = ?");
    params.push(data.phone);
  }
  if (data.province !== undefined) {
    fields.push("province = ?");
    params.push(data.province);
  }
  if (data.city !== undefined) {
    fields.push("city = ?");
    params.push(data.city);
  }
  if (data.district !== undefined) {
    fields.push("district = ?");
    params.push(data.district);
  }
  if (data.detail !== undefined) {
    fields.push("detail = ?");
    params.push(data.detail);
  }
  if (data.is_default !== undefined) {
    fields.push("is_default = ?");
    params.push(data.is_default ? 1 : 0);
  }

  if (fields.length === 0) return;

  params.push(id);
  const sql = `UPDATE addresses SET ${fields.join(", ")} WHERE id = ?`;
  await pool.query(sql, params);
}

/**
 * 删除地址
 */
export async function deleteById(id: number): Promise<number> {
  const sql = "DELETE FROM addresses WHERE id = ?";
  const [result] = await pool.query<ResultSetHeader>(sql, [id]);
  return result.affectedRows;
}

/**
 * 清除用户所有默认地址标记
 */
export async function clearDefault(userId: number): Promise<void> {
  const sql = "UPDATE addresses SET is_default = 0 WHERE user_id = ?";
  await pool.query(sql, [userId]);
}

/**
 * 查询用户第一个地址（删除默认地址后候选为新默认）
 */
export async function findFirstByUserId(
  userId: number,
): Promise<Address | null> {
  const sql = `
    SELECT ${ADDRESS_FIELDS} FROM addresses
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 1
  `;

  const [rows] = await pool.query<RowDataPacket[]>(sql, [userId]);
  return rows.length > 0 ? (rows[0] as Address) : null;
}

/**
 * 将指定地址设为默认
 */
export async function setDefault(id: number): Promise<void> {
  const sql = "UPDATE addresses SET is_default = 1 WHERE id = ?";
  await pool.query(sql, [id]);
}
