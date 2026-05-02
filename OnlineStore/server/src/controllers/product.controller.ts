/**
 * 商品控制器
 *
 * 仅负责请求解析与响应构造，不包含业务逻辑。
 * 所有方法使用 try/catch 包裹，异常由 errorHandler 统一处理。
 */

import { Request, Response, NextFunction } from 'express';
import { success, paginated } from '../utils/response';
import { parsePagination } from '../utils/pagination';
import { env } from '../config/env';
import * as productService from '../services/product.service';
import { ProductFilter } from '../types/product';

/**
 * GET /api/products — 商品列表（分页+筛选）
 */
export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, pageSize } = parsePagination(req.query, env.pagination.maxPageSize);

    const filter: ProductFilter = {
      category: req.query.category as string | undefined,
      keyword: req.query.keyword as string | undefined,
      sort: req.query.sort as ProductFilter['sort'] | undefined,
    };

    const result = await productService.getProducts(filter, page, pageSize);
    paginated(res, result.list, result.pagination);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/products/:id — 商品详情
 */
export async function detail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id);
    const product = await productService.getProductById(id);
    success(res, product);
  } catch (err) {
    next(err);
  }
}
