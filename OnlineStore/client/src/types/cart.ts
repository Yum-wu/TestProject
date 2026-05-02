/**
 * 购物车相关类型定义
 * 涵盖购物车项、购物车数据与加购操作
 */

/** 购物车单项 */
export interface CartItem {
  /** 购物车记录 ID */
  id: number;
  /** 关联商品 ID */
  product_id: number;
  /** 商品名称（冗余字段） */
  product_name: string;
  /** 商品主图 URL */
  product_image: string;
  /** 商品单价 */
  price: number;
  /** 购买数量 */
  quantity: number;
  /** 小计金额 = price * quantity */
  subtotal: number;
  /** 商品当前库存 */
  stock: number;
}

/** 购物车完整数据 */
export interface CartData {
  /** 购物车商品列表 */
  items: CartItem[];
  /** 购物车总金额 */
  total_amount: number;
  /** 购物车商品种类数（总件数） */
  total_count: number;
}

/** 加入购物车请求参数 */
export interface AddToCartInput {
  /** 要加购的商品 ID */
  product_id: number;
  /** 加购数量 */
  quantity: number;
}
