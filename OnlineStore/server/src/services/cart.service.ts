/**
 * 购物车业务逻辑服务
 *
 * 负责购物车的增删改查，包含库存校验、去重累加等核心规则。
 */

import * as cartModel from '../models/cart.model';
import * as productModel from '../models/product.model';
import { CartItem, CartOverview } from '../types/cart';
import { BusinessError } from '../utils/errors';

/**
 * 添加商品到购物车
 *
 * 业务规则：
 * 1. 校验商品存在
 * 2. 若购物车已有该商品 → 累加数量，校验总数量不超过库存
 * 3. 若没有 → 直接新增，校验数量不超过库存
 */
export async function addToCart(
  userId: number,
  productId: number,
  quantity: number
): Promise<CartItem> {
  // 1. 校验商品存在
  const product = await productModel.findById(productId);
  if (!product) {
    throw new BusinessError(2001, '商品不存在');
  }

  // 2. 查询购物车中是否已有该商品
  const existingItem = await cartModel.findByUserAndProduct(userId, productId);

  if (existingItem) {
    // 已有 → 累加数量
    const newQuantity = existingItem.quantity + quantity;
    if (newQuantity > product.stock) {
      throw new BusinessError(
        2101,
        `库存不足，当前库存为 ${product.stock}，购物车已有 ${existingItem.quantity} 件，无法再添加 ${quantity} 件`
      );
    }
    await cartModel.updateQuantity(existingItem.id, newQuantity);

    return {
      ...existingItem,
      quantity: newQuantity,
      updated_at: new Date().toISOString(),
    };
  }

  // 3. 没有 → 新增
  if (quantity > product.stock) {
    throw new BusinessError(
      2101,
      `库存不足，当前库存为 ${product.stock}，无法添加 ${quantity} 件`
    );
  }

  return await cartModel.create({ user_id: userId, product_id: productId, quantity });
}

/**
 * 查看购物车（含实时价格和汇总）
 */
export async function getCart(userId: number): Promise<CartOverview> {
  const items = await cartModel.findByUserId(userId);

  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalCount = items.length;

  return {
    items,
    total_amount: Math.round(totalAmount * 100) / 100, // 保留两位小数
    total_count: totalCount,
  };
}

/**
 * 更新购物车项数量
 *
 * 业务规则：
 * 1. 校验购物车项存在
 * 2. 校验属于当前用户（权限）
 * 3. 校验新数量不超过库存
 */
export async function updateCartItem(
  userId: number,
  cartItemId: number,
  quantity: number
): Promise<CartItem> {
  // 1. 校验存在
  const cartItem = await cartModel.findById(cartItemId);
  if (!cartItem) {
    throw new BusinessError(2102, '购物车项不存在');
  }

  // 2. 权限校验
  if (cartItem.user_id !== userId) {
    throw new BusinessError(4003, '无权操作该购物车项');
  }

  // 3. 校验库存
  const product = await productModel.findById(cartItem.product_id);
  if (!product) {
    throw new BusinessError(2001, '商品不存在或已下架');
  }

  if (quantity > product.stock) {
    throw new BusinessError(
      2101,
      `库存不足，当前库存为 ${product.stock}，无法修改为 ${quantity} 件`
    );
  }

  await cartModel.updateQuantity(cartItemId, quantity);

  return {
    ...cartItem,
    quantity,
    updated_at: new Date().toISOString(),
  };
}

/**
 * 删除购物车项
 *
 * 业务规则：
 * 1. 校验存在
 * 2. 校验权限
 */
export async function removeCartItem(userId: number, cartItemId: number): Promise<void> {
  const cartItem = await cartModel.findById(cartItemId);

  if (!cartItem) {
    throw new BusinessError(2102, '购物车项不存在');
  }

  if (cartItem.user_id !== userId) {
    throw new BusinessError(4003, '无权操作该购物车项');
  }

  await cartModel.deleteById(cartItemId);
}
