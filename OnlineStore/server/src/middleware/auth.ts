/**
 * 认证中间件
 *
 * 从请求头 Authorization 提取 Bearer Token，解析用户身份。
 *
 * MVP 阶段采用固定 Token 校验策略：
 * - 有效 Token: "Bearer test-token-user-1" → userId=1
 * - 其他任意 Token → 返回 4002 Token 无效
 *
 * 后续可替换为 JWT 签名验证。
 */

import { Request, Response, NextFunction } from 'express';
import { AuthError } from '../utils/errors';

/** MVP 阶段硬编码的有效 Token */
const VALID_TOKEN = 'Bearer test-token-user-1';

/**
 * 认证中间件
 *
 * 用法：app.use(authMiddleware) 或 router.use(authMiddleware)
 */
export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  // 未携带 Token
  if (!authHeader) {
    throw new AuthError(4001, '未登录，请先进行认证');
  }

  // 验证 Token 格式
  if (!authHeader.startsWith('Bearer ')) {
    throw new AuthError(4002, 'Token 格式错误，应为 Bearer <token>');
  }

  // MVP: 固定 Token 校验
  if (authHeader !== VALID_TOKEN) {
    throw new AuthError(4002, 'Token 无效或已过期');
  }

  // 解析 userId（后续替换为 JWT 解码）
  req.currentUserId = 1;

  next();
}

/**
 * 可选认证中间件（不强制要求 Token，但若提供则解析）
 *
 * 可用于商品列表等公开接口，同时支持已登录用户的个性化展示。
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ') && authHeader === VALID_TOKEN) {
    req.currentUserId = 1;
  }

  next();
}
