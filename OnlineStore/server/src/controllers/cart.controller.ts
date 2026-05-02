/**
 * 购物车控制器
 *
 * 所有方法需要认证（auth 中间件注入 currentUserId）。
 */

import { Request, Response, NextFunction } from 'express';
import { success } from '../utils/response';
import { AuthError } from '../utils/errors';
import * as cartService from '../services/cart.service';

function getUserId(req: Request): number {
  const userId = req.currentUserId;
  if (!userId) throw new AuthError(4001, '未登录，请先进行认证');
  return userId;
}

/**
 * POST /api/cart — 添加商品到购物车
 */
export async function add(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const { product_id, quantity } = req.body;
    const item = await cartService.addToCart(userId, product_id, quantity);
    success(res, item, 'success', 201);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/cart — 查看购物车
 */
export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const overview = await cartService.getCart(userId);
    success(res, overview);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/cart/:id — 修改购物车项数量
 */
export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const cartItemId = Number(req.params.id);
    const { quantity } = req.body;
    const item = await cartService.updateCartItem(userId, cartItemId, quantity);
    success(res, item);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/cart/:id — 删除购物车项
 */
export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const cartItemId = Number(req.params.id);
    await cartService.removeCartItem(userId, cartItemId);
    success(res, null);
  } catch (err) {
    next(err);
  }
}
