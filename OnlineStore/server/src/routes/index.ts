/**
 * 路由聚合入口
 *
 * 将所有子路由挂载到 /api 路径前缀下。
 */

import { Router } from 'express';
import productRoutes from './product.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import addressRoutes from './address.routes';

const router = Router();

router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/addresses', addressRoutes);

export default router;
