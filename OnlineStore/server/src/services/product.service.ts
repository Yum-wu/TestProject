/**
 * 商品业务逻辑服务
 *
 * 负责商品查询、分页组装，不含写操作（下单扣库存在 order.service 中处理）。
 */

import * as productModel from '../models/product.model';
import { Product, ProductFilter, ProductListItem } from '../types/product';
import { PaginatedData } from '../types';
import { BusinessError } from '../utils/errors';

/**
 * 查询商品列表（带分页）
 */
export async function getProducts(
  filter: ProductFilter,
  page: number,
  pageSize: number
): Promise<PaginatedData<ProductListItem>> {
  const limit = pageSize;
  const offset = (page - 1) * pageSize;

  // 并行查询数据和总数
  const [list, total] = await Promise.all([
    productModel.findAll(filter, limit, offset),
    productModel.countAll(filter),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    list: list.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      stock: p.stock,
      category: p.category,
      image_url: p.image_url,
      created_at: p.created_at,
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
}

/**
 * 查询商品详情
 */
export async function getProductById(id: number): Promise<Product> {
  const product = await productModel.findById(id);

  if (!product) {
    throw new BusinessError(2001, '商品不存在');
  }

  return product;
}
