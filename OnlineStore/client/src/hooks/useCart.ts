import { useState, useCallback } from 'react';
import {
  addToCart as addToCartApi,
  getCart,
  updateCartItem,
  deleteCartItem,
} from '../services/cart.api';
import { useCartContext } from '../store/CartContext';
import type { CartData } from '../types/cart';

/**
 * 购物车 Hook
 * 管理购物车完整数据与操作方法
 */
export function useCart() {
  const [loading, setLoading] = useState(false);
  const [cartData, setCartData] = useState<CartData | null>(null);
  const { refreshCart } = useCartContext();

  /**
   * 刷新购物车数据
   */
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCart();
      setCartData(data);
      await refreshCart(); // 同时更新 Context 中的角标数量
    } catch {
      // 静默失败
    } finally {
      setLoading(false);
    }
  }, [refreshCart]);

  /**
   * 加入购物车
   */
  const addToCart = useCallback(
    async (productId: number, quantity: number) => {
      setLoading(true);
      try {
        await addToCartApi({ product_id: productId, quantity });
        await refresh();
      } finally {
        setLoading(false);
      }
    },
    [refresh]
  );

  /**
   * 更新购物车项数量
   */
  const updateQuantity = useCallback(
    async (cartItemId: number, quantity: number) => {
      setLoading(true);
      try {
        await updateCartItem(cartItemId, quantity);
        await refresh();
      } finally {
        setLoading(false);
      }
    },
    [refresh]
  );

  /**
   * 删除购物车项
   */
  const removeItem = useCallback(
    async (cartItemId: number) => {
      setLoading(true);
      try {
        await deleteCartItem(cartItemId);
        await refresh();
      } finally {
        setLoading(false);
      }
    },
    [refresh]
  );

  return { loading, cartData, addToCart, updateQuantity, removeItem, refresh };
}
