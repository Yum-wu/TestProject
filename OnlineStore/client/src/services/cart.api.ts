/**
 * 购物车 API 服务
 * 封装购物车增删改查接口
 */
import { api } from './api';
import type { CartItem, CartData, AddToCartInput } from '../types/cart';

/**
 * 加入购物车
 * @param input - 加购参数（商品 ID + 数量）
 * @returns 新增的购物车项
 */
export async function addToCart(input: AddToCartInput): Promise<CartItem> {
  return api.post<CartItem>('/cart', input);
}

/**
 * 获取购物车完整数据
 * @returns 购物车数据（商品列表 + 总金额 + 总件数）
 */
export async function getCart(): Promise<CartData> {
  return api.get<CartData>('/cart');
}

/**
 * 更新购物车项数量
 * @param id - 购物车项 ID
 * @param quantity - 新数量
 */
export async function updateCartItem(
  id: number,
  quantity: number
): Promise<void> {
  await api.patch(`/cart/${id}`, { quantity });
}

/**
 * 删除购物车项
 * @param id - 购物车项 ID
 */
export async function deleteCartItem(id: number): Promise<void> {
  await api.delete(`/cart/${id}`);
}
