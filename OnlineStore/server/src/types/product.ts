/**
 * 商品相关类型定义
 */

/** 商品实体 */
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url: string;
  version: number;
  created_at: string;
  updated_at: string;
}

/** 商品列表项（不含 description，减少数据传输量） */
export interface ProductListItem {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  image_url: string;
  created_at: string;
}

/** 商品筛选查询参数 */
export interface ProductFilter {
  category?: string;
  keyword?: string;
  sort?: 'price_asc' | 'price_desc' | 'created_at_desc' | 'created_at_asc';
}
