import { createContext, useContext, useState, useCallback } from 'react';
import { getCart } from '../services/cart.api';
import type { CartData } from '../types/cart';

/** 购物车 Context 类型定义 */
interface CartContextType {
  /** 购物车商品总数量，用于 Header 角标 */
  cartCount: number;
  /** 刷新购物车总数（从 API 重新获取） */
  refreshCart: () => Promise<void>;
}

/** 创建购物车 Context */
const CartContext = createContext<CartContextType | null>(null);

/**
 * 购物车 Provider
 * 管理全局购物车数量，供 Header 组件显示角标
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState(0);

  /** 从后端刷新购物车总数量 */
  const refreshCart = useCallback(async () => {
    try {
      const data: CartData = await getCart();
      setCartCount(data.total_count ?? 0);
    } catch {
      // 获取失败时静默处理，不清空已有数据
    }
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

/**
 * 使用购物车 Context 的 Hook
 * @returns 购物车上下文 { cartCount, refreshCart }
 */
export function useCartContext(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCartContext 必须在 CartProvider 内部使用');
  }
  return ctx;
}
