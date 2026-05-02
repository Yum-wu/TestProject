/**
 * 分页参数解析工具
 *
 * 从请求 query string 中提取、校验、规范化分页参数。
 */

import { PaginationParams } from '../types';

/**
 * 解析并规范化分页参数
 *
 * @param query   Express request.query 对象
 * @param maxPageSize  允许的每页最大条数（默认 100）
 * @returns 规范化的分页参数 { limit, offset, page, pageSize }
 */
export function parsePagination(
  query: Record<string, unknown>,
  maxPageSize: number = 100
): PaginationParams {
  // 解析 page，默认 1
  let page = Number(query.page) || 1;
  if (page < 1) page = 1;

  // 解析 pageSize，默认 20
  let pageSize = Number(query.pageSize) || 20;
  if (pageSize < 1) pageSize = 20;
  if (pageSize > maxPageSize) pageSize = maxPageSize;

  const limit = pageSize;
  const offset = (page - 1) * pageSize;

  return { page, pageSize, limit, offset };
}
