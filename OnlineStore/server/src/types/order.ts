/**
 * 订单相关类型定义
 */

import { OrderStatus } from './index';

/** 收货地址快照（下单时固化） */
export interface AddressSnapshot {
  receiver_name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
}

/** 订单实体 */
export interface Order {
  id: number;
  order_no: string;
  user_id: number;
  address_snapshot: AddressSnapshot | string; // 数据库存 JSON，读取时可能是字符串
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

/** 订单列表项 */
export interface OrderListItem {
  id: number;
  order_no: string;
  total_amount: number;
  status: OrderStatus;
  item_count: number;
  created_at: string;
}

/** 订单商品明细项 */
export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  price: number;
  quantity: number;
  created_at: string;
}

/** 订单详情（含完整商品明细和地址快照） */
export interface OrderDetail extends Order {
  items: OrderItemView[];
}

/** 订单商品明细视图（带小计） */
export interface OrderItemView extends OrderItem {
  subtotal: number;
}

/** 创建订单的输入参数 */
export interface CreateOrderInput {
  address_id: number;
  cart_item_ids: number[];
}

/** 下单时快照的订单商品数据（不持久化到 order_items 之前的内存结构） */
export interface OrderItemSnapshot {
  product_id: number;
  product_name: string;
  product_image: string;
  price: number;
  quantity: number;
}
