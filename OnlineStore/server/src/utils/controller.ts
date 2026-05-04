/**
 * 控制器公共工具函数
 */

import { Request } from 'express';
import { AuthError } from './errors';

/**
 * 从请求中提取已认证的用户 ID
 *
 * 若 auth 中间件未注入 currentUserId 则抛出 AuthError，
 * 防止控制器中使用非空断言绕过类型检查。
 */
export function getUserId(req: Request): number {
  const userId = req.currentUserId;
  if (!userId) throw new AuthError(4001, '未登录，请先进行认证');
  return userId;
}
