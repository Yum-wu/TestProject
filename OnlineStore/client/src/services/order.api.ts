/**
 * 订单 API 服务
 * 封装订单创建、查询与取消操作
 */
import { api } from "./api";
import type { Order, CreateOrderInput } from "../types/order";
import type { PaginatedData } from "../types/api";

/** 订单查询参数 */
export interface OrderQueryParams {
  page?: number;
  pageSize?: number;
  status?: string;
}

/**
 * 创建订单
 * @param input - 创建参数（地址 ID + 购物车项 ID 列表）
 * @returns 新创建的订单
 */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  return api.post<Order>("/orders", input);
}

/**
 * 查询订单列表
 * @param params - 分页与状态筛选参数
 * @returns 分页订单数据
 */
export async function getOrders(
  params: OrderQueryParams,
): Promise<PaginatedData<Order>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params.status) searchParams.set("status", params.status);

  const query = searchParams.toString();
  return api.get<PaginatedData<Order>>(`/orders${query ? `?${query}` : ""}`);
}

/**
 * 获取订单详情
 * @param id - 订单 ID
 * @param signal - 可选的 AbortSignal 用于取消请求
 * @returns 订单完整数据（含商品列表、地址快照）
 */
export async function getOrderById(
  id: number,
  signal?: AbortSignal,
): Promise<Order> {
  return api.get<Order>(`/orders/${id}`, signal);
}

/**
 * 取消订单
 * @param id - 订单 ID
 */
export async function cancelOrder(id: number): Promise<void> {
  await api.patch(`/orders/${id}/cancel`);
}
