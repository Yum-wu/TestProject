/**
 * 购物车路由（需认证）
 *
 * POST   /api/cart     — 添加商品到购物车
 * GET    /api/cart     — 查看购物车
 * PATCH  /api/cart/:id — 修改购物车项数量
 * DELETE /api/cart/:id — 删除购物车项
 */

import { Router } from 'express';
import { validate, addToCartSchema, updateCartSchema, idParamsSchema } from '../middleware/validator';
import { authMiddleware } from '../middleware/auth';
import * as cartController from '../controllers/cart.controller';

const router = Router();

// 所有购物车路由需要认证
router.use(authMiddleware);

router.post('/', validate({ body: addToCartSchema }), cartController.add);
router.get('/', cartController.list);
router.patch('/:id', validate({ body: updateCartSchema, params: idParamsSchema }), cartController.update);
router.delete('/:id', validate({ params: idParamsSchema }), cartController.remove);

export default router;
