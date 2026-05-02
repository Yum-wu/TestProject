/**
 * 订单控制器
 */

import { Request, Response, NextFunction } from 'express';
import { success, paginated } from '../utils/response';
import { parsePagination } from '../utils/pagination';
import { env } from '../config/env';
import * as orderService from '../services/order.service';
import { OrderStatus } from '../types';

/**
 * POST /api/orders — 创建订单
 */
export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.currentUserId!;
    const { address_id, cart_item_ids } = req.body;
    const order = await orderService.createOrder(userId, { address_id, cart_item_ids });
    success(res, order, 'success', 201);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/orders — 订单列表
 */
export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.currentUserId!;
    const { page, pageSize } = parsePagination(req.query, env.pagination.maxPageSize);
    const status = req.query.status as OrderStatus | undefined;

    const result = await orderService.getOrders(userId, page, pageSize, status);
    paginated(res, result.list, result.pagination);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/orders/:id — 订单详情
 */
export async function detail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.currentUserId!;
    const orderId = Number(req.params.id);
    const order = await orderService.getOrderById(userId, orderId);
    success(res, order);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/orders/:id/cancel — 取消订单
 */
export async function cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.currentUserId!;
    const orderId = Number(req.params.id);
    const result = await orderService.cancelOrder(userId, orderId);
    success(res, result);
  } catch (err) {
    next(err);
  }
}
