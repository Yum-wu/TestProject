/**
 * 商品相关类型定义
 * 涵盖商品列表、详情与筛选参数
 */

/** 商品列表项（首页列表展示） */
export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  image_url: string;
  created_at: string;
}

/** 商品详情（含描述信息） */
export interface ProductDetail extends Product {
  description: string;
  updated_at: string;
}

/** 商品筛选查询参数 */
export interface ProductFilter {
  /** 页码（从 1 开始） */
  page?: number;
  /** 每页条数，默认 12 */
  pageSize?: number;
  /** 商品分类过滤 */
  category?: string;
  /** 商品名称关键字搜索 */
  keyword?: string;
  /** 排序方式 */
  sort?: 'price_asc' | 'price_desc' | 'created_at_desc' | 'created_at_asc';
}
