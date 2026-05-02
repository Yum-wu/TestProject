/**
 * 购物车相关类型定义
 */

/** 购物车项实体（原始表数据） */
export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  created_at: string;
  updated_at: string;
}

/** 购物车项视图（JOIN products 后的扩展数据，用于前端展示） */
export interface CartItemView {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  price: number;
  quantity: number;
  subtotal: number;
  stock: number;
  version?: number;
}

/** 购物车总览 */
export interface CartOverview {
  items: CartItemView[];
  total_amount: number;
  total_count: number;
}

/** 添加到购物车的输入参数 */
export interface AddToCartInput {
  product_id: number;
  quantity: number;
}

/** 更新购物车项的输入参数 */
export interface UpdateCartInput {
  quantity: number;
}
