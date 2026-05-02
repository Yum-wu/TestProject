/**
 * 通用类型定义模块
 *
 * 本文件包含项目中所有模块共用的类型定义：
 * - API 统一响应格式
 * - 分页数据结构
 * - 订单状态枚举
 * - Express 扩展声明
 */

// ============================================
// API 统一响应格式
// ============================================

/** API 统一响应结构 */
export interface ApiResponse<T = unknown> {
  /** 业务状态码：0=成功，非0=异常 */
  code: number;
  /** 状态描述信息 */
  message: string;
  /** 响应数据 */
  data: T | null;
}

// ============================================
// 分页相关类型
// ============================================

/** 分页参数 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  limit: number;
  offset: number;
}

/** 分页信息 */
export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** 分页数据响应 */
export interface PaginatedData<T> {
  list: T[];
  pagination: PaginationInfo;
}

// ============================================
// 订单状态
// ============================================

/** 订单状态枚举 */
export type OrderStatus = 'pending' | 'cancelled';

export { Order, OrderDetail, OrderItemView, OrderItem, OrderListItem, AddressSnapshot, CreateOrderInput, OrderItemSnapshot } from './order';
export { Product, ProductListItem, ProductFilter } from './product';
export { CartItem, CartItemView, CartOverview } from './cart';
export { Address, CreateAddressInput, UpdateAddressInput } from './address';

// ============================================
// Express 扩展类型声明
// ============================================

/** 扩展 Express Request，挂载认证用户 ID */
declare global {
  namespace Express {
    interface Request {
      /** 当前认证用户的 ID（由 auth 中间件注入） */
      currentUserId?: number;
    }
  }
}
