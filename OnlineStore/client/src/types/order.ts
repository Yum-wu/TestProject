/**
 * 订单相关类型定义
 * 涵盖订单状态、订单项、地址快照与创建订单参数
 */

/** 订单状态（当前业务仅支持 pending 和 cancelled） */
export type OrderStatus = 'pending' | 'cancelled';

/** 订单中的商品项 */
export interface OrderItem {
  /** 订单商品记录 ID */
  id: number;
  /** 关联商品 ID */
  product_id: number;
  /** 商品名称（创建订单时的快照） */
  product_name: string;
  /** 商品图片 */
  product_image: string;
  /** 商品单价（下单时的快照） */
  price: number;
  /** 购买数量 */
  quantity: number;
  /** 小计金额 */
  subtotal?: number;
}

/** 订单中的收货地址快照（下单时锁定） */
export interface AddressSnapshot {
  /** 收件人姓名 */
  receiver_name: string;
  /** 联系电话 */
  phone: string;
  /** 省份 */
  province: string;
  /** 城市 */
  city: string;
  /** 区/县 */
  district: string;
  /** 详细地址 */
  detail: string;
}

/** 订单主体 */
export interface Order {
  /** 订单 ID */
  id: number;
  /** 订单编号（业务唯一标识） */
  order_no: string;
  /** 用户 ID */
  user_id?: number;
  /** 订单总金额 */
  total_amount: number;
  /** 订单状态 */
  status: OrderStatus;
  /** 订单包含商品数 */
  item_count?: number;
  /** 收货地址快照 */
  address_snapshot?: AddressSnapshot;
  /** 订单商品列表（详情页使用） */
  items?: OrderItem[];
  /** 下单时间 */
  created_at: string;
  /** 最近更新时间 */
  updated_at?: string;
}

/** 创建订单请求参数 */
export interface CreateOrderInput {
  /** 选择的收货地址 ID */
  address_id: number;
  /** 需要结算的购物车项 ID 列表 */
  cart_item_ids: number[];
}
