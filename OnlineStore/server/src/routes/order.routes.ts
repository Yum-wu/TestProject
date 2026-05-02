/**
 * 订单路由（需认证）
 *
 * POST  /api/orders          — 创建订单
 * GET   /api/orders          — 订单列表
 * GET   /api/orders/:id      — 订单详情
 * PATCH /api/orders/:id/cancel — 取消订单
 */

import { Router } from 'express';
import { validate, createOrderSchema, idParamsSchema } from '../middleware/validator';
import { authMiddleware } from '../middleware/auth';
import * as orderController from '../controllers/order.controller';

const router = Router();

// 所有订单路由需要认证
router.use(authMiddleware);

router.post('/', validate({ body: createOrderSchema }), orderController.create);
router.get('/', orderController.list);
router.get('/:id', validate({ params: idParamsSchema }), orderController.detail);
router.patch('/:id/cancel', validate({ params: idParamsSchema }), orderController.cancel);

export default router;
