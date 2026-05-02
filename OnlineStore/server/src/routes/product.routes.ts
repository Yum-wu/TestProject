/**
 * 商品路由
 *
 * GET  /api/products     — 商品列表（公开）
 * GET  /api/products/:id — 商品详情（公开）
 */

import { Router } from 'express';
import * as productController from '../controllers/product.controller';

const router = Router();

router.get('/', productController.list);
router.get('/:id', productController.detail);

export default router;
