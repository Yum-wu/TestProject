/**
 * 商品 API 服务
 * 封装商品列表查询与商品详情获取接口
 */
import { api } from "./api";
import type { Product, ProductDetail, ProductFilter } from "../types/product";
import type { PaginatedData } from "../types/api";

/**
 * 查询商品列表（支持分页、筛选、排序）
 * @param filter - 筛选参数
 * @param signal - 可选的 AbortSignal 用于取消请求
 * @returns 分页商品数据
 */
export async function getProducts(
  filter: ProductFilter,
  signal?: AbortSignal,
): Promise<PaginatedData<Product>> {
  // 构建查询字符串，过滤掉空值
  const params = new URLSearchParams();
  if (filter.page) params.set("page", String(filter.page));
  if (filter.pageSize) params.set("pageSize", String(filter.pageSize));
  if (filter.category) params.set("category", filter.category);
  if (filter.keyword) params.set("keyword", filter.keyword);
  if (filter.sort) params.set("sort", filter.sort);

  const query = params.toString();
  return api.get<PaginatedData<Product>>(
    `/products${query ? `?${query}` : ""}`,
    signal,
  );
}

/**
 * 获取商品详情
 * @param id - 商品 ID
 * @param signal - 可选的 AbortSignal 用于取消请求
 * @returns 商品详情数据
 */
export async function getProductById(
  id: number,
  signal?: AbortSignal,
): Promise<ProductDetail> {
  return api.get<ProductDetail>(`/products/${id}`, signal);
}
