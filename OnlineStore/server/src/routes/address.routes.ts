/**
 * 收货地址路由（需认证）
 *
 * POST   /api/addresses     — 新增地址
 * GET    /api/addresses     — 地址列表
 * PUT    /api/addresses/:id — 编辑地址
 * DELETE /api/addresses/:id — 删除地址
 */

import { Router } from 'express';
import { validate, createAddressSchema, updateAddressSchema } from '../middleware/validator';
import { authMiddleware } from '../middleware/auth';
import * as addressController from '../controllers/address.controller';

const router = Router();

// 所有地址路由需要认证
router.use(authMiddleware);

router.post('/', validate({ body: createAddressSchema }), addressController.create);
router.get('/', addressController.list);
router.put('/:id', validate({ body: updateAddressSchema }), addressController.update);
router.delete('/:id', addressController.remove);

export default router;
